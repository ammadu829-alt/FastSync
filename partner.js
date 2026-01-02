// Simple version with Edit feature
let partners = [];

// Load partners from localStorage
function loadPartners() {
    const stored = localStorage.getItem('fastsync_partners');
    if (stored) {
        try {
            partners = JSON.parse(stored);
        } catch (e) {
            partners = [];
        }
    }
    return partners;
}

// Save partners to localStorage
function savePartners() {
    localStorage.setItem('fastsync_partners', JSON.stringify(partners));
}

// Initialize
partners = loadPartners();

// Check if user is logged in
const isLoggedIn = localStorage.getItem('isLoggedIn');
if (!isLoggedIn) {
    window.location.href = 'login.html';
}

const userName = localStorage.getItem('userName');
const userEmail = localStorage.getItem('userEmail');

// --- SAFETY CHECKED ELEMENT SELECTIONS ---

// Display user name
const myProfileLink = document.getElementById('myProfileLink');
if (myProfileLink && userName) {
    myProfileLink.textContent = userName;
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            window.location.href = 'login.html';
        }
    });
}

// My Profile Link navigation
if (myProfileLink) {
    myProfileLink.addEventListener('click', function(e) {
        e.preventDefault();
        const myProfile = partners.find(p => p.email === userEmail);
        if (myProfile) {
            editProfile(myProfile.id);
        } else {
            const profileSection = document.getElementById('profileSection');
            if (profileSection) profileSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Profile Form Submission
const profileForm = document.getElementById('profileForm');

if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const profileIdEl = document.getElementById('profileId');
        const profileId = profileIdEl ? profileIdEl.value : '';

        const formData = {
            id: profileId ? parseInt(profileId) : Date.now(),
            fullName: document.getElementById('fullName')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            phone: document.getElementById('phone')?.value.trim() || '',
            rollNumber: document.getElementById('rollNumber')?.value.trim() || '',
            semester: document.getElementById('semester')?.value || '',
            session: document.getElementById('session')?.value || '',
            course: document.getElementById('course')?.value || '',
            skills: document.getElementById('skills')?.value.trim() || '',
            bio: document.getElementById('bio')?.value.trim() || '',
            availability: document.getElementById('availability')?.value || 'available',
            dateAdded: new Date().toISOString()
        };

        // Validation
        if (!formData.fullName || !formData.email) {
            alert('❌ Please enter at least your Name and Email');
            return;
        }

        if (profileId) {
            const index = partners.findIndex(p => p.id === parseInt(profileId));
            if (index !== -1) {
                partners[index] = formData;
                savePartners();
                alert('✅ Profile updated!');
            }
        } else {
            const existingProfile = partners.find(p => p.email === userEmail);
            if (existingProfile) {
                alert('⚠️ Profile already exists. Use Edit instead.');
                return;
            }
            partners.push(formData);
            savePartners();
            alert('✅ Profile added!');
        }
        
        resetForm();
        displayPartners();
    });
}

// Display Partners Function
function displayPartners(filteredPartners = null) {
    const partnersGrid = document.getElementById('partnersGrid');
    const noResults = document.getElementById('noResults');
    const partnersCount = document.getElementById('partnersCount');

    const dataToDisplay = filteredPartners || partners;

    if (partnersCount) {
        partnersCount.textContent = dataToDisplay.length;
    }

    if (!partnersGrid) return;

    if (dataToDisplay.length === 0) {
        partnersGrid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }

    partnersGrid.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';
    partnersGrid.innerHTML = '';

    dataToDisplay.forEach(partner => {
        const card = document.createElement('div');
        card.className = 'partner-card';
        
        const statusClass = partner.availability === 'available' ? 'available' : 'found';
        const statusText = partner.availability === 'available' ? '✓ Available' : '✗ Partnered';
        const skillsArray = partner.skills ? partner.skills.split(',').map(s => s.trim()).filter(s => s) : [];
        
        const skillsHTML = skillsArray.length > 0 ? 
            `<div class="partner-skills"><div class="skills-list">
                ${skillsArray.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div></div>` : '';

        const isMyProfile = partner.email === userEmail;
        const actionHTML = isMyProfile ? 
            `<button class="btn-edit" onclick="editProfile(${partner.id})">✏️ Edit</button>` : 
            `<button class="btn-contact" onclick="openMessageModal('${partner.email}', '${partner.fullName}', '${partner.phone}')">📧 Contact</button>`;

        card.innerHTML = `
            <span class="status-badge ${statusClass}">${statusText}</span>
            <div class="partner-header"><div class="partner-name">${partner.fullName}</div></div>
            <div class="partner-info">
                <p><strong>Course:</strong> ${partner.course}</p>
                <p><strong>Semester:</strong> ${partner.semester}</p>
            </div>
            ${skillsHTML}
            <div class="profile-actions">${actionHTML}</div>
        `;
        partnersGrid.appendChild(card);
    });
}

// Edit and Reset Logic - FIXED WITH NULL CHECKS
window.editProfile = function(profileId) {
    const profile = partners.find(p => p.id === profileId);
    if (!profile) return;

    const title = document.getElementById('formTitle');
    if (title) title.textContent = '✏️ Edit Your Profile';

    const idField = document.getElementById('profileId');
    if (idField) idField.value = profile.id;

    // Set values only if fields exist
    const fields = ['fullName', 'email', 'phone', 'rollNumber', 'semester', 'session', 'course', 'skills', 'bio', 'availability'];
    fields.forEach(f => {
        const el = document.getElementById(f);
        if (el) el.value = profile[f] || '';
    });

    const btn = document.getElementById('submitBtn');
    if (btn) btn.textContent = '💾 Update Profile';
    
    const cancel = document.getElementById('cancelBtn');
    if (cancel) cancel.style.display = 'block';

    const section = document.getElementById('profileSection');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
};

function resetForm() {
    if (profileForm) profileForm.reset();
    
    const idField = document.getElementById('profileId');
    if (idField) idField.value = '';

    const title = document.getElementById('formTitle');
    if (title) title.textContent = 'Create Your Partner Profile';

    const btn = document.getElementById('submitBtn');
    if (btn) btn.textContent = 'Add My Profile';

    const cancel = document.getElementById('cancelBtn');
    if (cancel) cancel.style.display = 'none';
    
    const emailField = document.getElementById('email');
    if (emailField && userEmail) emailField.value = userEmail;
}

// Initial Run
displayPartners();
if (document.getElementById('email') && userEmail) {
    document.getElementById('email').value = userEmail;
}
