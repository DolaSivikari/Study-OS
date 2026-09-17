window.STUDYOS_MODALS = window.STUDYOS_MODALS || {};

window.STUDYOS_MODALS.journalModal = String.raw`<div class="modal" id="journalModal" onclick="if(event.target===this)closeModal('journalModal')">
        <div class="modal-content" style="max-width:720px;max-height:92vh;overflow:hidden;display:flex;flex-direction:column;">
            <!-- Header with Icon & Title -->
            <div class="modal-header" style="border-bottom:none;padding:16px 20px 8px;">
                <div style="display:flex;align-items:center;gap:12px;flex:1;">
                    <button type="button" id="journalIconBtn" onclick="pickJournalIcon()" 
                            style="font-size:2rem;background:none;border:none;cursor:pointer;padding:4px;border-radius:8px;transition:background 0.15s;"
                            onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='none'">📝</button>
                    <input type="text" id="journalTitle" placeholder="Untitled" 
                           style="font-size:1.4rem;font-weight:600;border:none;background:none;color:var(--text-primary);outline:none;flex:1;padding:4px 0;">
                </div>
                <button class="modal-close" onclick="closeModal('journalModal')">×</button>
            </div>
            
            <div class="modal-body" style="padding:0 20px 20px;overflow-y:auto;flex:1;">
                <!-- Meta Properties -->
                <div style="display:flex;flex-wrap:wrap;gap:16px;padding:12px 0;border-bottom:1px solid var(--border);margin-bottom:16px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="color:var(--text-muted);font-size:0.8rem;">📅 Date</span>
                        <input type="date" class="form-input" id="journalDate" style="padding:6px 10px;font-size:0.85rem;background:var(--bg-tertiary);border:none;border-radius:6px;">
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="color:var(--text-muted);font-size:0.8rem;">🏷️ Type</span>
                        <select class="form-select" id="journalType" onchange="updateIconFromType()" style="padding:6px 10px;font-size:0.85rem;background:var(--bg-tertiary);border:none;border-radius:6px;">
                            <option value="reflection">💭 Reflection</option>
                            <option value="gratitude">🙏 Gratitude</option>
                            <option value="learning">📚 Learning</option>
                            <option value="win">🏆 Win</option>
                            <option value="idea">💡 Idea</option>
                            <option value="goal">🎯 Goal Check</option>
                            <option value="incident">⚠️ Incident</option>
                            <option value="mood">😊 Mood Log</option>
                        </select>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="color:var(--text-muted);font-size:0.8rem;">📚 Pathway</span>
                        <select class="form-select" id="journalPathway" style="padding:6px 10px;font-size:0.85rem;background:var(--bg-tertiary);border:none;border-radius:6px;">
                            <option value="">None</option>
                            <option value="pmp">PMP</option>
                            <option value="mcmaster">McMaster</option>
                            <option value="smr">SMR</option>
                        </select>
                    </div>
                </div>

                <!-- Mood Selector -->
                <div style="margin-bottom:16px;">
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">How are you feeling?</div>
                    <div id="moodSelector" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
                    <input type="hidden" id="journalMood" value="">
                </div>

                <!-- V63: reflection format picker + structured sections -->
                <div class="journal-format-bar">
                    <div class="journal-format-label">Reflection format</div>
                    <div id="journalFormatPicker" class="journal-format-picker" role="group" aria-label="Reflection format"></div>
                    <div id="journalFormatWhy" class="journal-format-why"></div>
                </div>
                <div id="journalSections" class="journal-sections"></div>

                <div id="journalFreeWrap" hidden>
                <!-- Rich Text Toolbar -->
                <div id="editorToolbar" style="display:flex;gap:2px;padding:8px 10px;background:var(--bg-tertiary);border-radius:8px 8px 0 0;border:1px solid var(--border);border-bottom:none;flex-wrap:wrap;">
                    <button type="button" class="toolbar-btn" onclick="formatText('bold')" title="Bold (Ctrl+B)"><b>B</b></button>
                    <button type="button" class="toolbar-btn" onclick="formatText('italic')" title="Italic (Ctrl+I)"><i>I</i></button>
                    <button type="button" class="toolbar-btn" onclick="formatText('underline')" title="Underline (Ctrl+U)"><u>U</u></button>
                    <button type="button" class="toolbar-btn" onclick="formatText('strikeThrough')" title="Strikethrough"><s>S</s></button>
                    <div style="width:1px;background:var(--border);margin:0 6px;"></div>
                    <button type="button" class="toolbar-btn" onclick="formatText('insertUnorderedList')" title="Bullet List">• List</button>
                    <button type="button" class="toolbar-btn" onclick="formatText('insertOrderedList')" title="Numbered List">1. List</button>
                    <button type="button" class="toolbar-btn" onclick="insertCheckbox()" title="Checkbox">☑️</button>
                    <div style="width:1px;background:var(--border);margin:0 6px;"></div>
                    <button type="button" class="toolbar-btn" onclick="formatBlock('h2')" title="Heading">H</button>
                    <button type="button" class="toolbar-btn" onclick="formatBlock('blockquote')" title="Quote">❝</button>
                    <button type="button" class="toolbar-btn" onclick="insertDivider()" title="Divider">─</button>
                    <button type="button" class="toolbar-btn" onclick="insertCallout()" title="Callout">💬</button>
                    <div style="width:1px;background:var(--border);margin:0 6px;"></div>
                    <button type="button" class="toolbar-btn" onclick="showEmojiPicker()" title="Emoji">😀</button>
                    <button type="button" class="toolbar-btn" onclick="highlightText()" title="Highlight">🖍️</button>
                </div>

                <!-- Rich Content Editor -->
                <div id="journalContent" contenteditable="true" 
                     style="min-height:220px;max-height:320px;overflow-y:auto;padding:16px;background:var(--bg-primary);border:1px solid var(--border);border-radius:0 0 8px 8px;outline:none;line-height:1.8;font-size:0.95rem;"
                     placeholder="Start writing your thoughts..."
                     onpaste="handlePaste(event)"></div>
                </div>

                <!-- Tags Section -->
                <div style="margin-top:16px;">
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Tags</div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px;background:var(--bg-tertiary);border-radius:8px;">
                        <div id="journalTagsContainer" style="display:flex;flex-wrap:wrap;gap:6px;"></div>
                        <input type="text" id="journalTagInput" placeholder="Add tag + Enter" 
                               style="border:none;background:none;outline:none;color:var(--text-primary);font-size:0.85rem;min-width:100px;flex:1;" 
                               onkeydown="handleTagInput(event)">
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="modal-footer" style="border-top:1px solid var(--border);padding:12px 20px;">
                <div style="font-size:0.75rem;color:var(--text-muted);" id="journalWordCount">0 words</div>
                <div style="display:flex;gap:10px;margin-left:auto;">
                    <button class="btn btn-secondary" onclick="closeModal('journalModal')">Cancel</button>
                    <button class="btn btn-danger" id="journalDeleteBtn" style="display:none" onclick="deleteJournal()">🗑️ Delete</button>
                    <button class="btn btn-primary" onclick="saveJournal()">💾 Save</button>
                </div>
            </div>
        </div>
    </div>`;
