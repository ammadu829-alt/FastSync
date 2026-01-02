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

// Display user name - FIXED WITH NULL CHECK
const userName = localStorage.getItem('userName');
const userEmail = localStorage.getItem('userEmail');
const myProfileLink = document.getElementById('myProfileLink');
if (userName && myProfileLink) { // Added check for myProfileLink
    myProfileLink.textContent = userName;
}

// Logout - FIXED WITH NULL CHECK
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

// My Profile Link - FIXED WITH NULL CHECK
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

if (!profileForm) {
    console.error('❌ Profile form not found!');
} else {
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const profileIdElement = document.getElementById('profileId');
        const profileId = profileIdElement ? profileIdElement.value : '';

        const formData = {
            id: profileId ? parseInt(profileId) : Date.now(),
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

        // Validation
        if (!formData.fullName || !formData.email || !formData.phone || !formData.rollNumber) {
            alert('❌ Please fill in all required fields');
            return;
        }

        if (profileId) {
            const index = partners.findIndex(p => p.id === parseInt(profileId));
            if (index !== -1) {
                partners[index] = formData;
                savePartners();
                alert('✅ Your profile has been UPDATED successfully!');
            }
        } else {
            const existingProfile = partners.find(p => p.email === userEmail);
            if (existingProfile) {
                alert('⚠️ You already have a profile! Scroll down to find it and click Edit.');
                return;
            }
            
            partners.push(formData);
            savePartners();
            alert('✅ Your profile has been ADDED successfully!');
        }
        
        resetForm();
        displayPartners();
    });
}

// Display Partners Function - FIXED WITH NULL CHECKS
function displayPartners(filteredPartners = null) {
    const partnersGrid = document.getElementById('partnersGrid');
    const noResults = document.getElementById('noResults');
    const partnersCount = document.getElementById('partnersCount');

    const dataToDisplay = filteredPartners || partners;

    if (partnersCount) partnersCount.textContent = dataToDisplay.length;

    if (!partnersGrid || !noResults) return;

    if (dataToDisplay.length === 0) {
        partnersGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    partnersGrid.style.display = 'grid';
    noResults.style.display = 'none';
    partnersGrid.innerHTML = '';

    dataToDisplay.forEach(partner => {
        const card = document.createElement('div');
        card.className = 'partner-card';
        
        const statusClass = partner.availability === 'available' ? 'available' : 'found';
        const statusText = partner.availability === 'available' ? '✓ Available' : '✗ Partnered';

        const skillsArray = partner.skills ? partner.skills.split(',').map(s => s.trim()).filter(s => s) : [];
        const skillsHTML = skillsArray.length > 0 ? 
            `<div class="partner-skills">
                <div class="skills-label">Skills:</div>
                <div class="skills-list">
                    ${skillsArray.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>` : '';

        const bioHTML = partner.bio ? `<div class="partner-bio">${partner.bio}</div>` : '';
        const isMyProfile = partner.email === userEmail;
        
        const profileActionsHTML = isMyProfile ? 
            `<div class="profile-actions">
                <button class="btn-edit" onclick="editProfile(${partner.id})">✏️ Edit Profile</button>
            </div>` : 
            `<div class="partner-contact">
                <button class="btn-contact" onclick="openMessageModal('${partner.email}', '${partner.fullName}', '${partner.phone}')">
                    📧 Contact ${partner.fullName.split(' ')[0]}
                </button>
            </div>`;

        card.innerHTML = `
            <span class="status-badge ${statusClass}">${statusText}</span>
            <div class="partner-header">
                <div class="partner-name">${partner.fullName}</div>
                <div class="partner-roll">${partner.rollNumber}</div>
            </div>
            <div class="partner-info">
                <div class="info-item"><span class="info-label">Email:</span> <span>${partner.email}</span></div>
                <div class="info-item"><span class="info-label">Phone:</span> <span>${partner.phone}</span></div>
                <div class="info-item"><span class="info-label">Semester:</span> <span>${partner.semester}${getOrdinal(partner.semester)}</span></div>
                <div class="info-item"><span class="info-label">Session:</span> <span>${partner.session}</span></div>
                <div class="info-item"><span class="info-label">Course:</span> <span>${partner.course}</span></div>
            </div>
            ${skillsHTML}
            ${bioHTML}
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

window.editProfile = function(profileId) {
    const profile = partners.find(p => p.id === profileId);
    if (!profile) return;

    const profileSection = document.getElementById('profileSection');
    if (profileSection) profileSection.scrollIntoView({ behavior: 'smooth' });

    document.getElementById('formTitle').textContent = '✏️ Edit Your Profile';
    document.getElementById('profileId').value = profile.id;
    document.getElementById('fullName').value = profile.fullName;
    document.getElementById('email').value = profile.email;
    document.getElementById('phone').value = profile.phone;
    document.getElementById('rollNumber').value = profile.rollNumber;
    document.getElementById('semester').value = profile.semester;
    document.getElementById('session').value = profile.session;
    document.getElementById('course').value = profile.course;
    document.getElementById('skills').value = profile.skills || '';
    document.getElementById('bio').value = profile.bio || '';
    document.getElementById('availability').value = profile.availability;

    document.getElementById('submitBtn').textContent = '💾 Update Profile';
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) cancelBtn.style.display = 'block';
}

function resetForm() {
    if (profileForm) profileForm.reset();
    const profileId = document.getElementById('profileId');
    if (profileId) profileId.value = '';
    document.getElementById('formTitle').textContent = 'Create Your Partner Profile';
    document.getElementById('submitBtn').textContent = 'Add My Profile';
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) cancelBtn.style.display = 'none';
    
    if (userEmail) {
        document.getElementById('email').value = userEmail;
    }
}

const cancelBtn = document.getElementById('cancelBtn');
if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
        resetForm();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Filters - FIXED WITH NULL CHECKS
const filterSession = document.getElementById('filterSession');
const filterCourse = document.getElementById('filterCourse');
const filterAvailability = document.getElementById('filterAvailability');

function applyFilters() {
    let filtered = partners;
    if (filterSession && filterSession.value) filtered = filtered.filter(p => p.session === filterSession.value);
    if (filterCourse && filterCourse.value) filtered = filtered.filter(p => p.course === filterCourse.value);
    if (filterAvailability && filterAvailability.value) filtered = filtered.filter(p => p.availability === filterAvailability.value);
    displayPartners(filtered);
}

if (filterSession) filterSession.addEventListener('change', applyFilters);
if (filterCourse) filterCourse.addEventListener('change', applyFilters);
if (filterAvailability) filterAvailability.addEventListener('change', applyFilters);

const resetFilters = document.getElementById('resetFilters');
if (resetFilters) {
    resetFilters.addEventListener('click', function() {
        if (filterSession) filterSession.value = '';
        if (filterCourse) filterCourse.value = '';
        if (filterAvailability) filterAvailability.value = '';
        displayPartners();
    });
}

// Modal Logic
window.openMessageModal = function(email, name, phone) {
    const modal = document.getElementById('messageModal');
    if (modal) {
        document.getElementById('partnerNameModal').textContent = name;
        modal.style.display = 'block';
    }
}

// Initial Run
if (userEmail && document.getElementById('email')) {
    document.getElementById('email').value = userEmail;
}
displayPartners();
