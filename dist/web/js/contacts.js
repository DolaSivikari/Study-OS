// ==================== CONTACTS / NETWORKING ====================
let editingContactId = null;
let interactionContactId = null;
let contactFilter = 'all';

// V37: named handler so the 4 filter buttons can use data-action instead of
// onclick="contactFilter='x';renderContacts()" — the action registry only
// calls one function per click, so the assign-then-render pair moved here.
function setContactFilter(filter) {
    contactFilter = filter;
    renderContacts();
}

function renderContacts() {
    const contacts = arr(K.contacts);
    const now = new Date();
    const todayStr = today();
    
    // Stats
    const needFollowup = contacts.filter(c => c.followupDate && c.followupDate <= todayStr);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const active = contacts.filter(c => c.lastContact && new Date(c.lastContact) >= thirtyDaysAgo);
    
    document.getElementById('contactsTotal').textContent = contacts.length;
    document.getElementById('contactsFollowup').textContent = needFollowup.length;
    document.getElementById('contactsRecent').textContent = active.length;
    
    // Filters
    document.getElementById('contactFilters').innerHTML = `
        <button class="filter-btn ${contactFilter==='all'?'active':''}" data-action="setContactFilter" data-action-arg="all">All</button>
        <button class="filter-btn ${contactFilter==='industry'?'active':''}" data-action="setContactFilter" data-action-arg="industry">Industry</button>
        <button class="filter-btn ${contactFilter==='recruiter'?'active':''}" data-action="setContactFilter" data-action-arg="recruiter">Recruiters</button>
        <button class="filter-btn ${contactFilter==='mentor'?'active':''}" data-action="setContactFilter" data-action-arg="mentor">Mentors</button>
    `;
    
    // Follow-up section
    const followupSection = document.getElementById('followupSection');
    if (needFollowup.length > 0) {
        followupSection.style.display = 'block';
        document.getElementById('followupList').innerHTML = needFollowup.map(c => renderContactCard(c, true)).join('');
    } else {
        followupSection.style.display = 'none';
    }
    
    // Filter and sort contacts
    let filtered = contacts;
    if (contactFilter !== 'all') {
        filtered = contacts.filter(c => c.category === contactFilter);
    }
    filtered.sort((a, b) => (b.lastContact || '').localeCompare(a.lastContact || ''));
    
    document.getElementById('contactsList').innerHTML = filtered.length ? 
        filtered.map(c => renderContactCard(c)).join('') : 
        '<div class="empty">No contacts yet. Start building your network!</div>';
}

function renderContactCard(contact, showFollowup = false) {
    const initials = contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const strength = calculateRelationshipStrength(contact);
    
    return `
        <div class="contact-card" data-action="editContact" data-action-arg="${contact.id}">
            <div class="contact-avatar">${initials}</div>
            <div class="contact-info">
                <div class="contact-name">${esc(contact.name)}</div>
                <div class="contact-meta">${esc(contact.role || '')}${contact.role && contact.company ? ' @ ' : ''}${esc(contact.company || '')}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
                <div class="contact-strength">
                    ${[1,2,3,4,5].map(i => `<div class="strength-dot ${i <= strength ? 'active' : ''}"></div>`).join('')}
                </div>
                ${showFollowup ? '<span class="followup-badge">Follow up!</span>' : ''}
                <button class="btn btn-secondary btn-sm contact-log-btn" type="button" onclick="event.stopPropagation();openInteractionModal('${esc(contact.id)}')" title="Log an interaction with ${esc(contact.name)}">Log</button>
            </div>
        </div>
    `;
}

function calculateRelationshipStrength(contact) {
    let strength = 1;
    const now = new Date();
    
    if (contact.interactions && contact.interactions.length > 0) {
        strength++;
        if (contact.interactions.length >= 3) strength++;
        if (contact.interactions.length >= 5) strength++;
    }
    
    if (contact.lastContact) {
        const last = new Date(contact.lastContact);
        const daysSince = (now - last) / (1000 * 60 * 60 * 24);
        if (daysSince <= 30) strength++;
    }
    
    return Math.min(strength, 5);
}

function filterContacts() {
    const query = document.getElementById('contactSearch').value.toLowerCase();
    const contacts = arr(K.contacts);
    
    let filtered = contacts;
    if (query) {
        filtered = contacts.filter(c => 
            c.name.toLowerCase().includes(query) ||
            (c.company || '').toLowerCase().includes(query) ||
            (c.role || '').toLowerCase().includes(query)
        );
    }
    
    if (contactFilter !== 'all') {
        filtered = filtered.filter(c => c.category === contactFilter);
    }
    
    document.getElementById('contactsList').innerHTML = filtered.length ?
        filtered.map(c => renderContactCard(c)).join('') :
        '<div class="empty">No matching contacts</div>';
}

function openContactModal() {
    editingContactId = null;
    document.getElementById('contactModalTitle').textContent = 'Add Contact';
    document.getElementById('contactName').value = '';
    document.getElementById('contactCompany').value = '';
    document.getElementById('contactRole').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactPhone').value = '';
    document.getElementById('contactLinkedIn').value = '';
    document.getElementById('contactCategory').value = 'industry';
    document.getElementById('contactMet').value = '';
    document.getElementById('contactNotes').value = '';
    document.getElementById('contactFollowup').value = '';
    document.getElementById('deleteContactBtn').style.display = 'none';
    openModal('contactModal');
}

function editContact(id) {
    const contacts = arr(K.contacts);
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;
    
    editingContactId = id;
    document.getElementById('contactModalTitle').textContent = 'Edit Contact';
    document.getElementById('contactName').value = contact.name || '';
    document.getElementById('contactCompany').value = contact.company || '';
    document.getElementById('contactRole').value = contact.role || '';
    document.getElementById('contactEmail').value = contact.email || '';
    document.getElementById('contactPhone').value = contact.phone || '';
    document.getElementById('contactLinkedIn').value = contact.linkedin || '';
    document.getElementById('contactCategory').value = contact.category || 'industry';
    document.getElementById('contactMet').value = contact.howMet || '';
    document.getElementById('contactNotes').value = contact.notes || '';
    document.getElementById('contactFollowup').value = contact.followupDate || '';
    document.getElementById('deleteContactBtn').style.display = 'inline-block';
    openModal('contactModal');
}

function saveContact() {
    const name = document.getElementById('contactName').value.trim();
    if (!name) {
        toast('Please enter a name');
        return;
    }
    
    const contacts = arr(K.contacts);
    const contactData = {
        name,
        company: document.getElementById('contactCompany').value.trim(),
        role: document.getElementById('contactRole').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        phone: document.getElementById('contactPhone').value.trim(),
        linkedin: document.getElementById('contactLinkedIn').value.trim(),
        category: document.getElementById('contactCategory').value,
        howMet: document.getElementById('contactMet').value.trim(),
        notes: document.getElementById('contactNotes').value.trim(),
        followupDate: document.getElementById('contactFollowup').value || null,
        updatedAt: new Date().toISOString()
    };
    
    if (editingContactId) {
        const idx = contacts.findIndex(c => c.id === editingContactId);
        if (idx >= 0) contacts[idx] = { ...contacts[idx], ...contactData };
    } else {
        contacts.push({
            id: uid(),
            ...contactData,
            createdAt: new Date().toISOString(),
            interactions: [],
            lastContact: null
        });
    }
    
    set(K.contacts, contacts);
    closeModal('contactModal');
    renderContacts();
    toast(editingContactId ? 'Contact updated!' : 'Contact added!'); if(typeof refreshDashboard==='function') refreshDashboard();
}

function deleteContact() {
    if (!editingContactId || !confirm('Delete this contact?')) return;
    const contacts = arr(K.contacts).filter(c => c.id !== editingContactId);
    set(K.contacts, contacts);
    closeModal('contactModal');
    renderContacts();
    toast('Contact deleted');
}

function openInteractionModal(contactId) {
    interactionContactId = contactId;
    document.getElementById('interactionType').value = 'email';
    document.getElementById('interactionNotes').value = '';
    document.getElementById('interactionFollowup').value = '';
    openModal('interactionModal');
}

function saveInteraction() {
    if (!interactionContactId) return;
    
    const contacts = arr(K.contacts);
    const idx = contacts.findIndex(c => c.id === interactionContactId);
    if (idx < 0) return;
    
    if (!contacts[idx].interactions) contacts[idx].interactions = [];
    contacts[idx].interactions.push({
        type: document.getElementById('interactionType').value,
        notes: document.getElementById('interactionNotes').value.trim(),
        date: new Date().toISOString()
    });
    contacts[idx].lastContact = today();
    contacts[idx].followupDate = document.getElementById('interactionFollowup').value || null;
    
    set(K.contacts, contacts);
    closeModal('interactionModal');
    renderContacts();
    toast('Interaction logged!'); if(typeof refreshDashboard==='function') refreshDashboard();
}

