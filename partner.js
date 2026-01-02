// Simple version with Full Profile Card and Edit feature
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

// Display user name - FIXED: Added null check to prevent crash on line 36
const userName = localStorage.getItem('userName');
const userEmail = localStorage.getItem('userEmail');
const myProfileLink = document.getElementById('myProfileLink');
if (myProfileLink && userName) {
    myProfileLink.textContent = userName;
}

// Logout Button - FIXED: Added null check
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

// My Profile Link - FIXED: Added null checks
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
        
        const profileIdVal = document.getElementById('profileId')?.value;

        const formData = {
            id: profileIdVal ? parseInt(profileIdVal) : Date.now(),
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            rollNumber: document.getElementById('rollNumber').value.trim(),
            semester: document.getElementById('semester').value,
            session: document.getElementById('session').value,
            course: document.getElementById('course').value,
            skills: document.getElementById('skills').value.trim(),
            bio: document.getElementById('bio').value.trim(),
            availability: document.getElementById('availability').value,
            dateAdded: new Date().toISOString()
        };

        if (profileIdVal) {
            // UPDATE EXISTING PROFILE
            const index = partners.findIndex(p => p.id === parseInt(profileIdVal));
            if (index !== -1) {
                partners[index] = formData;
                savePartners();
                alert('✅ Profile UPDATED successfully!');
            }
        } else {
            // ADD NEW PROFILE
            const existingProfile = partners.find(p => p.email === userEmail);
            if (existingProfile) {
                alert('⚠️ You already have a profile! Please edit your existing one.');
                return;
            }
            partners.push(formData);
            savePartners();
            alert('✅ Profile ADDED successfully!');
        }
        
        resetForm();
        displayPartners();
    });
}

// Display Partners Function - UPDATED: Shows all info from the image
function displayPartners(filteredPartners = null) {
    const partnersGrid = document.getElementById('partnersGrid');
    const noResults = document.getElementById('noResults');
    const partnersCount = document.getElementById('partnersCount');

    if (!partnersGrid) return;

    const dataToDisplay = filteredPartners || partners;
    if (partnersCount) partnersCount.textContent = dataToDisplay.length;

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
            `<div class="partner-skills">
                <div class="skills-list">
                    ${skillsArray.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>` : '';

        const isMyProfile = partner.email === userEmail;
        
        // Show EDIT button for you, CONTACT button for others
        const profileActionsHTML = isMyProfile ? 
            `<div class="profile-actions">
                <button class="btn-edit" onclick="editProfile(${partner.id})">✏️ Edit Profile</button>
            </div>` : 
            `<div class="partner-contact">
                <button class="btn-contact" onclick="openMessageModal('${partner.email}', '${partner.fullName}', '${partner.phone}')">
                    📧 Contact ${partner.fullName.split(' ')[0]}
                </button>
            </div>`;

        // FULL TEMPLATE matching your image
        card.innerHTML = `
            <span class="status-badge ${statusClass}">${statusText}</span>
            <div class="partner-header">
                <div class="partner-name">${partner.fullName}</div>
                <div class="partner-roll" style="color: #a855f7;">${partner.rollNumber}</div>
            </div>

            <div class="partner-info">
                <div class="info-item"><span class="info-label">Email:</span> <span>${partner.email}</span></div>
                <div class="info-item"><span class="info-label">Phone:</span> <span>${partner.phone}</span></div>
                <div class="info-item"><span class="info-label">Semester:</span> <span>${partner.semester}${getOrdinal(partner.semester)}</span></div>
                <div class="info-item"><span class="info-label">Session:</span> <span>${partner.session}</span></div>
                <div class="info-item"><span class="info-label">Course:</span> <span>${partner.course}</span></div>
            </div>

            ${skillsHTML}
            ${partner.bio ? `<div class="partner-bio" style="margin-top: 10px; opacity: 0.8;">${partner.bio}</div>` : ''}

            ${profileActionsHTML}
        `;

        partnersGrid.appendChild(card);
    });
}

function getOrdinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

// ✏️ EDIT PROFILE FUNCTION
window.editProfile = function(profileId) {
    const profile = partners.find(p => p.id === profileId);
    if (!profile) return;

    const profileSection = document.getElementById('profileSection');
    if (profileSection) profileSection.scrollIntoView({ behavior: 'smooth' });

    // FIXED: Added null checks for all form elements
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };

    const title = document.getElementById('formTitle');
    if (title) title.textContent = '✏️ Edit Your Profile';
    
    setVal('profileId', profile.id);
    setVal('fullName', profile.fullName);
    setVal('email', profile.email);
    setVal('phone', profile.phone);
    setVal('rollNumber', profile.rollNumber);
    setVal('semester', profile.semester);
    setVal('session', profile.session);
    setVal('course', profile.course);
    setVal('skills', profile.skills);
    setVal('bio', profile.bio);
    setVal('availability', profile.availability);

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.textContent = '💾 Update Profile';
    
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) cancelBtn.style.display = 'block';
};

// Reset Form Function - FIXED: Added null checks for line 231 crash
function resetForm() {
    if (profileForm) profileForm.reset();
    
    const elements = {
        'profileId': '',
        'formTitle': 'Create Your Partner Profile',
        'submitBtn': 'Add My Profile'
    };

    for (const [id, value] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = value;
            else el.textContent = value;
        }
    }

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) cancelBtn.style.display = 'none';
    
    const emailField = document.getElementById('email');
    if (emailField && userEmail) emailField.value = userEmail;
}

// Initial Run
displayPartners();
if (document.getElementById('email') && userEmail) {
    document.getElementById('email').value = userEmail;
}
