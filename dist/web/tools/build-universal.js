#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const WEB = path.join(DIST, 'web');
const PORTABLE = path.join(DIST, 'portable');
const VERSION = 'V62';
const GENERATED_AT = new Date().toISOString();

const LAZY_MODULES = [
  'js/diagnostics.js',
  'js/guide.js',
  'js/framework-lab.js',
  'js/pmp-tools.js'
];

const PORTABLE_ASSETS = [
  ['data/quran-audio.validation.json', 'application/json'],
  ['data/quran-translations-tevhid.validation.json', 'application/json'],
  ['data/quran-validator.validation.json', 'application/json']
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function removeDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function walk(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full).replace(/\\/g, '/');
    if (entry.isDirectory()) out.push(...walk(full, base));
    else out.push(rel);
  }
  return out;
}

function shouldCopy(rel) {
  const top = rel.split('/')[0];
  if (top === 'dist' || top === 'node_modules' || top === '.git') return false;
  if (rel === 'package-lock.json') return false;
  return true;
}

function copyTree(src, dest) {
  ensureDir(dest);
  for (const rel of walk(src)) {
    if (!shouldCopy(rel)) continue;
    const from = path.join(src, rel);
    const to = path.join(dest, rel);
    ensureDir(path.dirname(to));
    fs.copyFileSync(from, to);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function readBuffer(rel) {
  return fs.readFileSync(path.join(ROOT, rel));
}

function write(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content);
}

function injectBuildMeta(html, target) {
  const meta = `<script>window.STUDYOS_BUILD=${JSON.stringify({ version: VERSION, target, generatedAt: GENERATED_AT })};</script>`;
  return html.replace('</head>', `    ${meta}\n</head>`);
}

function inlineScript(rel, code) {
  const safe = code.replace(/<\/script/gi, '<\\/script');
  return `<script data-source="${rel}">\n${safe}\n//# sourceURL=${rel}\n</script>`;
}

function buildWeb() {
  removeDir(WEB);
  copyTree(ROOT, WEB);

  let html = fs.readFileSync(path.join(WEB, 'index.html'), 'utf8');
  html = injectBuildMeta(html, 'web');
  fs.writeFileSync(path.join(WEB, 'index.html'), html);

  const cacheFiles = walk(WEB)
    .filter(rel => !rel.startsWith('tools/'))
    .filter(rel => rel !== 'sw.js')
    .filter(rel => rel !== 'package.json')
    .filter(rel => !rel.endsWith('.zip'))
    .map(rel => './' + rel)
    .sort();

  const fingerprint = crypto.createHash('sha256')
    .update(cacheFiles.map(rel => rel + ':' + fs.statSync(path.join(WEB, rel.slice(2))).size).join('|'))
    .digest('hex').slice(0, 12);

  const sw = `/* StudyOS ${VERSION} generated service worker */\n` +
`const CACHE_NAME = 'studyos-${VERSION.toLowerCase()}-${fingerprint}';\n` +
`const APP_FILES = ${JSON.stringify(cacheFiles, null, 2)};\n` +
`self.addEventListener('install', event => {\n` +
`  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));\n` +
`});\n` +
`self.addEventListener('activate', event => {\n` +
`  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('studyos-') && k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));\n` +
`});\n` +
`self.addEventListener('fetch', event => {\n` +
`  if (event.request.method !== 'GET') return;\n` +
`  const url = new URL(event.request.url);\n` +
`  if (url.origin !== self.location.origin) return;\n` +
`  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {\n` +
`    if (response && response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); }\n` +
`    return response;\n` +
`  }).catch(() => caches.match('./index.html'))));\n` +
`});\n`;
  fs.writeFileSync(path.join(WEB, 'sw.js'), sw);
}

const FONT_MIME = {
  '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.eot': 'application/vnd.ms-fontobject'
};

// Rewrite url(...) references inside a stylesheet to base64 data URIs so the
// portable single-file build carries its own fonts. cssRel is the stylesheet's
// path relative to ROOT, used to resolve the (relative) url() targets.
function inlineCssFonts(css, cssRel) {
  const cssDir = path.dirname(path.join(ROOT, cssRel));
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (match, quote, target) => {
    if (/^(?:data:|https?:|\/\/)/i.test(target)) return match;
    const ext = path.extname(target.split('?')[0].split('#')[0]).toLowerCase();
    const mime = FONT_MIME[ext];
    if (!mime) return match;
    const abs = path.resolve(cssDir, target.split('?')[0].split('#')[0]);
    if (!fs.existsSync(abs)) {
      console.warn(`  ! ${cssRel}: font not found, left as a relative URL — ${target}`);
      return match;
    }
    return `url("data:${mime};base64,${fs.readFileSync(abs).toString('base64')}")`;
  });
}

function buildPortableAssetRuntime() {
  const assetData = {};
  for (const [rel, mime] of PORTABLE_ASSETS) {
    assetData[rel] = {
      mime,
      base64: readBuffer(rel).toString('base64')
    };
  }

  return inlineScript('generated/portable-assets.js', `(function(){
'use strict';
var assets = ${JSON.stringify(assetData)};
var unavailable = {
  'media/quran-reference/tevhid-meali.pdf': 'The Tevhid Meali reference PDF is included in the web/PWA package. The complete translation text is already available inside this portable reader.'
};
var urls = Object.create(null);
function bytesFromBase64(value) {
  var binary = atob(value);
  var bytes = new Uint8Array(binary.length);
  for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
function assetUrl(pathname) {
  var clean = String(pathname || '').split('#')[0];
  if (clean.slice(0, 2) === './') clean = clean.slice(2);
  var item = assets[clean];
  if (!item) return pathname;
  if (!urls[clean]) urls[clean] = URL.createObjectURL(new Blob([bytesFromBase64(item.base64)], { type: item.mime }));
  var hashIndex = String(pathname || '').indexOf('#');
  return urls[clean] + (hashIndex >= 0 ? String(pathname).slice(hashIndex) : '');
}
window.studyosAssetUrl = assetUrl;
document.addEventListener('click', function(event) {
  var anchor = event.target && event.target.closest ? event.target.closest('a[href]') : null;
  if (!anchor) return;
  var raw = anchor.getAttribute('href') || '';
  var clean = raw.split('#')[0];
  if (clean.slice(0, 2) === './') clean = clean.slice(2);
  if (unavailable[clean]) {
    event.preventDefault();
    if (typeof window.showToast === 'function') window.showToast(unavailable[clean]);
    else window.alert(unavailable[clean]);
    return;
  }
  if (!assets[clean]) return;
  event.preventDefault();
  var resolved = assetUrl(raw);
  if (anchor.target === '_blank') window.open(resolved, '_blank', 'noopener');
  else location.href = resolved;
});
window.addEventListener('beforeunload', function(){
  Object.keys(urls).forEach(function(key){ try { URL.revokeObjectURL(urls[key]); } catch (_) {} });
});
})();`);
}

function buildPortable() {
  removeDir(PORTABLE);
  ensureDir(PORTABLE);

  let html = read('index.html');
  html = injectBuildMeta(html, 'portable');

  // A file/content URL cannot load a separate manifest or icon reliably.
  html = html.replace(/\s*<link\b[^>]*rel=["']manifest["'][^>]*>/gi, '');
  html = html.replace(/\s*<link\b[^>]*(?:rel=["']icon["']|rel=["']apple-touch-icon["'])[^>]*>/gi, '');

  // Inline all styles from the modular source.
  //
  // V62.1: the previous comment here claimed "the source CSS already embeds
  // the Arabic fonts". It did not — css/styles.css declares four @font-face
  // rules pointing at ../media/fonts/*.woff2, and those relative URLs cannot
  // resolve from a single file:// or content:// document. The portable build
  // therefore lost the Uthmani and Naskh faces and fell back to a system
  // Arabic font. inlineCssFonts() now embeds them as data URIs (~350 KB).
  html = html.replace(/<link\b([^>]*?)rel=["']stylesheet["']([^>]*?)href=["']([^"']+)["']([^>]*)>/gi,
    (match, a, b, href) => `<style data-source="${href}">\n${inlineCssFonts(read(href), href)}\n</style>`);
  // Handle href appearing before rel.
  html = html.replace(/<link\b([^>]*?)href=["']([^"']+)["']([^>]*?)rel=["']stylesheet["']([^>]*)>/gi,
    (match, a, href) => `<style data-source="${href}">\n${inlineCssFonts(read(href), href)}\n</style>`);

  let lazyInjected = false;
  html = html.replace(/<script\b([^>]*?)src=(["'])([^"']+)\2([^>]*)>\s*<\/script>/gi,
    (match, before, quote, src) => {
      if (/^(?:https?:)?\/\//i.test(src)) return match;
      let output = inlineScript(src, read(src));

      if (src === 'js/quran-data-loader.js') {
        output += '\n' + inlineScript('data/quran-verses.js', read('data/quran-verses.js'));
        output += '\n' + inlineScript('data/quran-translations-tevhid.js', read('data/quran-translations-tevhid.js'));
      }

      if (src === 'js/connect.js' && !lazyInjected) {
        for (const rel of LAZY_MODULES) output += '\n' + inlineScript(rel, read(rel));
        output += '\n' + inlineScript('generated/preloaded-modules.js',
          `window.STUDYOS_PRELOADED_MODULES={diagnostics:true,guide:true,frameworklab:true,pmptools:true};`);
        lazyInjected = true;
      }
      return output;
    });

  html = html.replace('</body>', `${buildPortableAssetRuntime()}\n</body>`);
  html = html.replace(/StudyOS V59 — Universal Desktop \+ Mobile/g, 'StudyOS V62 — Dedicated Mushaf Reader Portable Build');

  const out = path.join(PORTABLE, 'StudyOS-V62-Dedicated-Mushaf.html');
  write(out, html);

  const instructions = `StudyOS ${VERSION} — Universal Portable Build\n\n` +
`This HTML is generated from the same modular StudyOS source used by the web/PWA build.\n` +
`It is not a reduced or separate application. All pages, modals, feature modules, Quran data, styles and fonts are included.\n\n` +
`Android: download StudyOS-V62-Dedicated-Mushaf.html and open it with Chrome or Samsung Internet.\n` +
`Desktop: open the same file directly, or use the web build for installable/offline PWA behavior.\n`;
  write(path.join(PORTABLE, 'README.txt'), instructions);
}

function main() {
  removeDir(DIST);
  ensureDir(DIST);
  buildWeb();
  buildPortable();
  console.log(`Built StudyOS ${VERSION}`);
  console.log(`  Web/PWA: ${WEB}`);
  console.log(`  Portable: ${path.join(PORTABLE, 'StudyOS-V62-Dedicated-Mushaf.html')}`);
}

main();
