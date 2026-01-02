// Global state
let partners = [];
const userEmail = localStorage.getItem('userEmail');
const userName = localStorage.getItem('userName');

// 1. Load Data
function loadPartners() {
    const stored = localStorage.getItem('fastsync_partners');
    if (stored) {
        try { partners = JSON.parse(stored); } catch (e) { partners = []; }
    }
}

// 2. Save Data
function savePartners() {
    localStorage.setItem('fastsync_partners', JSON.stringify(partners));
}

// 3. Initialize UI safely
function initUI() {
    const myProfileLink = document.getElementById('myProfileLink');
    if (myProfileLink && userName) {
        myProfileLink.textContent = userName;
    }

    const emailField = document.getElementById('email');
    if (emailField && userEmail) {
        emailField.value = userEmail;
    }
}

// 4. Display Cards (Matching your screenshot design)
function displayPartners() {
    const partnersGrid = document.getElementById('partnersGrid');
    if (!partnersGrid) return;

    partnersGrid.innerHTML = '';
    
    partners.forEach(partner => {
        const card = document.createElement('div');
        card.className = 'partner-card';
        
        const isMyProfile = partner.email === userEmail;
        const statusClass = partner.availability === 'available' ? 'available' : 'found';
        const statusText = partner.availability === 'available' ? '✓ Available' : '✗ Partnered';

        const skillsHTML = partner.skills ? 
            `<div class="partner-skills"><div class="skills-list">
                ${partner.skills.split(',').map(s => `<span class="skill-tag">${s.trim()}</span>`).join('')}
            </div></div>` : '';

        // Template matching your image: Name, Roll (Purple), Email, Phone, Sem, Session, Course, Skills, Bio
        card.innerHTML = `
            <span class="status-badge ${statusClass}">${statusText}</span>
            <div class="partner-header">
                <div class="partner-name">${partner.fullName}</div>
                <div class="partner-roll" style="color: #a855f7; font-weight: bold;">${partner.rollNumber}</div>
            </div>
            <div class="partner-info">
                <div class="info-item"><span class="info-label">Email:</span> <span>${partner.email}</span></div>
                <div class="info-item"><span class="info-label">Phone:</span> <span>${partner.phone}</span></div>
                <div class="info-item"><span class="info-label">Semester:</span> <span>${partner.semester}</span></div>
                <div class="info-item"><span class="info-label">Session:</span> <span>${partner.session}</span></div>
                <div class="info-item"><span class="info-label">Course:</span> <span>${partner.course}</span></div>
            </div>
            ${skillsHTML}
            <div class="partner-bio" style="margin-top:10px; font-size: 0.9em; opacity: 0.8;">${partner.bio || ''}</div>
            <div class="profile-actions" style="margin-top:15px;">
                ${isMyProfile ? 
                    `<button class="btn-edit" onclick="editProfile(${partner.id})">✏️ Edit Profile</button>` : 
                    `<button class="btn-contact" onclick="alert('Contacting ${partner.fullName}')">📧 Contact</button>`
                }
            </div>
        `;
        partnersGrid.appendChild(card);
    });
}

// 5. Edit Function (Crucial: Must be window.editProfile)
window.editProfile = function(id) {
    const profile = partners.find(p => p.id === id);
    if (!profile) return;

    // Scroll to form
    const section = document.getElementById('profileSection');
    if (section) section.scrollIntoView({ behavior: 'smooth' });

    // Fill form safely
    const fields = ['fullName', 'email', 'phone', 'rollNumber', 'semester', 'session', 'course', 'skills', 'bio', 'availability', 'profileId'];
    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.value = profile[field] || (field === 'profileId' ? profile.id : '');
    });

    // Change Button Text
    const title = document.getElementById('formTitle');
    if (title) title.textContent = '✏️ Edit Your Profile';
    
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.textContent = '💾 Update Profile';
};

// 6. Reset Form Safely
function resetForm() {
    const form = document.getElementById('profileForm');
    if (form) form.reset();

    const title = document.getElementById('formTitle');
    if (title) title.textContent = 'Create Your Partner Profile';

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.textContent = 'Add My Profile';

    const idField = document.getElementById('profileId');
    if (idField) idField.value = '';

    if (userEmail && document.getElementById('email')) {
        document.getElementById('email').value = userEmail;
    }
}

// 7. Form Submission
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const idEl = document.getElementById('profileId');
        const id = idEl && idEl.value ? parseInt(idEl.value) : Date.now();

        const newData = {
            id: id,
            fullName: document.getElementById('fullName')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            rollNumber: document.getElementById('rollNumber')?.value || '',
            semester: document.getElementById('semester')?.value || '',
            session: document.getElementById('session')?.value || '',
            course: document.getElementById('course')?.value || '',
            skills: document.getElementById('skills')?.value || '',
            bio: document.getElementById('bio')?.value || '',
            availability: document.getElementById('availability')?.value || 'available'
        };

        const index = partners.findIndex(p => p.id === id);
        if (index !== -1) {
            partners[index] = newData;
            alert('✅ Profile updated!');
        } else {
            partners.push(newData);
            alert('✅ Profile added!');
        }

        savePartners();
        resetForm();
        displayPartners();
    });
}

// Start
loadPartners();
initUI();
displayPartners();
