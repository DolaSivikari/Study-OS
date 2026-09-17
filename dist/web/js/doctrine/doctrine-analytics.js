// Split from legacy doctrine.js for V16 maintainability.

function doctrineOpenCompoundingGraph(focusModuleId){
  return doctrineOpenModelGraph(focusModuleId);
}

function doctrineOpenModelGraph(focusModuleId){
  if(typeof LEARN === 'undefined' || typeof LEARN.getModelCompoundingGraph !== 'function'){
    toast('Compounding graph unavailable.');
    return;
  }
  const graph = LEARN.getModelCompoundingGraph();
  let nodes = graph.nodes, links = graph.links;

  if(focusModuleId){
    const keep = new Set(nodes.filter(n=>n.moduleId===focusModuleId).map(n=>n.id));
    // include immediate neighbors
    links.forEach(l=>{
      if(keep.has(l.source) || keep.has(l.target)){
        keep.add(l.source); keep.add(l.target);
      }
    });
    nodes = nodes.filter(n=>keep.has(n.id));
    links = links.filter(l=>keep.has(l.source) && keep.has(l.target));
  }

  const titleEl = document.getElementById('modelGraphModalTitle');
  if(titleEl){
    const mods = doctrineAllModules();
    const m = mods.find(x=>x.id===focusModuleId);
    titleEl.textContent = m ? `Compounding Graph — ${m.title}` : 'Compounding Graph';
  }
  const hintEl = document.getElementById('modelGraphHint');
  if(hintEl) hintEl.textContent = 'Purpose: visualize which doctrine models reinforce each other. Larger nodes = more real-world applications logged. Focus mode shows one module plus immediate neighbors.';
  doctrineRenderModelGraph(nodes, links, focusModuleId);
  openModal('modelGraphModal');
}

// ==================== SOURCES VIEW ====================

function doctrineRenderModelGraph(nodes, links, focusModuleId){
  const canvas = document.getElementById('modelGraphCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  // Make canvas crisp
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 860;
  const cssH = Math.max(420, Math.min(560, Math.round(cssW * 0.6)));
  canvas.style.height = cssH + 'px';
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const W = cssW, H = cssH;

  // Initialize node state
  const nmap = new Map();
  nodes.forEach((n,i)=>{
    n.x = (typeof n.x==='number') ? n.x : (W*0.15 + Math.random()*W*0.7);
    n.y = (typeof n.y==='number') ? n.y : (H*0.15 + Math.random()*H*0.7);
    n.vx = 0; n.vy = 0;
    n.r = 7 + Math.min(20, (n.apps||0)*2); // size by applications
    nmap.set(n.id, n);
  });
  const lks = (links||[]).map(l=>({
    a: nmap.get(l.source),
    b: nmap.get(l.target),
    w: l.weight||1
  })).filter(l=>l.a && l.b);

  // Dragging support
  let dragging = null, offX=0, offY=0;
  function canvasXY(e){
    const r=canvas.getBoundingClientRect();
    return { x: e.clientX-r.left, y: e.clientY-r.top };
  }
  function hit(x,y){
    for(let i=nodes.length-1;i>=0;i--){
      const n=nodes[i];
      const dx=x-n.x, dy=y-n.y;
      if(dx*dx+dy*dy <= (n.r+6)*(n.r+6)) return n;
    }
    return null;
  }
  canvas.onmousedown = (e)=>{
    const p=canvasXY(e);
    const n=hit(p.x,p.y);
    if(n){ dragging=n; offX=p.x-n.x; offY=p.y-n.y; }
  };
  window.onmousemove = (e)=>{
    if(!dragging) return;
    const p=canvasXY(e);
    dragging.x = p.x-offX;
    dragging.y = p.y-offY;
    dragging.vx = 0; dragging.vy = 0;
  };
  window.onmouseup = ()=>{ dragging=null; };

  function tick(){
    // Repulsion + collision
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i], b=nodes[j];
        const dx=a.x-b.x, dy=a.y-b.y;
        let dist=Math.sqrt(dx*dx+dy*dy)+0.01;
        const minD = a.r+b.r+14;
        const rep = 900/(dist*dist);
        const fx = (dx/dist)*rep;
        const fy = (dy/dist)*rep;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;

        if(dist < minD){
          const push = (minD-dist)/minD*0.9;
          a.vx += (dx/dist)*push*18;
          a.vy += (dy/dist)*push*18;
          b.vx -= (dx/dist)*push*18;
          b.vy -= (dy/dist)*push*18;
        }
      }
    }
    // Link attraction
    lks.forEach(l=>{
      const a=l.a, b=l.b;
      const dx=b.x-a.x, dy=b.y-a.y;
      const dist=Math.sqrt(dx*dx+dy*dy)+0.01;
      const desired = 120;
      const k = (dist-desired)*0.0023*(l.w||1);
      a.vx += dx*k; a.vy += dy*k;
      b.vx -= dx*k; b.vy -= dy*k;
    });
    // Centering gravity + integrate
    nodes.forEach(n=>{
      if(n===dragging) return;
      n.vx += (W/2 - n.x)*0.0014;
      n.vy += (H/2 - n.y)*0.0014;
      n.vx *= 0.84; n.vy *= 0.84;
      n.x += n.vx; n.y += n.vy;
      n.x = Math.max(n.r+6, Math.min(W-n.r-6, n.x));
      n.y = Math.max(n.r+6, Math.min(H-n.r-6, n.y));
    });
  }

  function draw(){
    ctx.clearRect(0,0,W,H);

    // Links
    ctx.globalAlpha = 0.28;
    ctx.lineWidth = 1;
    lks.forEach(l=>{
      ctx.beginPath();
      ctx.moveTo(l.a.x, l.a.y);
      ctx.lineTo(l.b.x, l.b.y);
      ctx.strokeStyle = 'rgba(150,170,200,0.8)';
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Nodes
    nodes.forEach(n=>{
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(60,80,110,0.30)';
      ctx.fill();
      const focus = focusModuleId && n.moduleId === focusModuleId;
      ctx.lineWidth = focus ? 2.6 : 1.2;
      ctx.strokeStyle = focus ? 'rgba(80,160,255,0.95)' : 'rgba(160,180,210,0.7)';
      ctx.stroke();

      // Label
      ctx.fillStyle = 'rgba(235,240,250,0.92)';
      ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto';
      const label = (n.label||'').slice(0,40);
      ctx.fillText(label, n.x + n.r + 6, n.y + 4);
    });
  }

  let raf = null;
  function loop(){
    tick(); draw();
    raf = requestAnimationFrame(loop);
  }
  // restart loop
  if(canvas.__graphRaf) cancelAnimationFrame(canvas.__graphRaf);
  loop();
  canvas.__graphRaf = raf;
}

