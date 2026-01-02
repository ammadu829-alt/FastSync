// Simple version with Edit & Delete features
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

// Display user name
const userName = localStorage.getItem('userName');
const userEmail = localStorage.getItem('userEmail');
const myProfileLink = document.getElementById('myProfileLink');
if (userName) {
    myProfileLink.textContent = userName;
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        window.location.href = 'login.html';
    }
});

// My Profile Link
document.getElementById('myProfileLink').addEventListener('click', function(e) {
    e.preventDefault();
    const myProfile = partners.find(p => p.email === userEmail);
    if (myProfile) {
        editProfile(myProfile.id);
    } else {
        document.getElementById('profileSection').scrollIntoView({ behavior: 'smooth' });
    }
});

// Profile Form Submission
const profileForm = document.getElementById('profileForm');

if (!profileForm) {
    console.error('❌ Profile form not found!');
} else {
    console.log('✅ Profile form found');
}

profileForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    console.log('========== FORM SUBMISSION START ==========');

    const profileId = document.getElementById('profileId').value;
    console.log('Profile ID:', profileId);

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

    console.log('📝 Form Data:', formData);
    console.log('Full Name:', formData.fullName);
    console.log('Email:', formData.email);
    console.log('Phone:', formData.phone);
    console.log('Roll Number:', formData.rollNumber);

    // Validation
    if (!formData.fullName) {
        console.log('❌ Full Name is empty');
        alert('❌ Please enter your Full Name');
        return;
    }
    
    if (!formData.email) {
        console.log('❌ Email is empty');
        alert('❌ Please enter your Email');
        return;
    }
    
    if (!formData.phone) {
        console.log('❌ Phone is empty');
        alert('❌ Please enter your Phone Number');
        return;
    }
    
    if (!formData.rollNumber) {
        console.log('❌ Roll Number is empty');
        alert('❌ Please enter your Roll Number');
        return;
    }

    console.log('✅ All validations passed!');

    if (profileId) {
        // UPDATE EXISTING PROFILE
        console.log('📝 Updating existing profile...');
        const index = partners.findIndex(p => p.id === parseInt(profileId));
        if (index !== -1) {
            partners[index] = formData;
            savePartners();
            console.log('✅ Profile UPDATED!');
            alert('✅ Your profile has been UPDATED successfully!');
        } else {
            console.log('❌ Profile not found for update');
        }
    } else {
        // ADD NEW PROFILE
        console.log('➕ Adding new profile...');
        console.log('Current user email:', userEmail);
        
        const existingProfile = partners.find(p => p.email === userEmail);
        if (existingProfile) {
            console.log('⚠️ User already has a profile:', existingProfile);
            alert('⚠️ You already have a profile! Scroll down to find it and click Edit.');
            return;
        }
        
        console.log('✅ No existing profile found, adding new one...');
        partners.push(formData);
        console.log('✅ Profile added to array');
        console.log('📊 Total profiles in array:', partners.length);
        
        savePartners();
        console.log('✅ Saved to localStorage');
        
        alert('✅ Your profile has been ADDED successfully!');
    }
    
    console.log('🔄 Resetting form...');
    resetForm();
    
    console.log('🖼️ Displaying profiles...');
    displayPartners();
    
    console.log('========== FORM SUBMISSION END ==========');
});

// Display Partners Function
function displayPartners(filteredPartners = null) {
    const partnersGrid = document.getElementById('partnersGrid');
    const noResults = document.getElementById('noResults');
    const partnersCount = document.getElementById('partnersCount');

    const dataToDisplay = filteredPartners || partners;

    partnersCount.textContent = dataToDisplay.length;

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

        const bioHTML = partner.bio ? 
            `<div class="partner-bio">${partner.bio}</div>` : '';

        // Check if this is YOUR profile
        const isMyProfile = partner.email === userEmail;
        
        // Show EDIT & DELETE buttons ONLY for YOUR profile
        const profileActionsHTML = isMyProfile ? 
            `<div class="profile-actions">
                <button class="btn-edit" onclick="editProfile(${partner.id})">
                    ✏️ Edit Profile
                </button>
                <button class="btn-delete" onclick="deleteProfile(${partner.id})">
                    🗑️ Delete Profile
                </button>
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
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span>${partner.email}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Phone:</span>
                    <span>${partner.phone}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Semester:</span>
                    <span>${partner.semester}${getOrdinal(partner.semester)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Session:</span>
                    <span>${partner.session}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Course:</span>
                    <span>${partner.course}</span>
                </div>
            </div>

            ${skillsHTML}
            ${bioHTML}

            ${profileActionsHTML}
        `;

        partnersGrid.appendChild(card);
    });
}

// Helper function
function getOrdinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

// ✏️ EDIT PROFILE FUNCTION (GLOBAL)
window.editProfile = function(profileId) {
    const profile = partners.find(p => p.id === profileId);
    if (!profile) {
        alert('❌ Profile not found!');
        return;
    }

    // Check if user owns this profile
    if (profile.email !== userEmail) {
        alert('❌ You can only edit your own profile!');
        return;
    }

    console.log('Editing profile:', profile);

    // Scroll to form
    document.getElementById('profileSection').scrollIntoView({ behavior: 'smooth' });

    // Update form title
    document.getElementById('formTitle').textContent = '✏️ Edit Your Profile';
    document.getElementById('formSubtitle').textContent = 'Update your information to keep your profile current';
    
    // Fill form with existing data
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

    // Update button text
    document.getElementById('submitBtn').textContent = '💾 Update Profile';
    document.getElementById('cancelBtn').style.display = 'block';

    console.log('✅ Form populated with profile data');
}

// 🗑️ DELETE PROFILE FUNCTION (GLOBAL)
window.deleteProfile = function(profileId) {
    const profile = partners.find(p => p.id === profileId);
    
    if (!profile) {
        alert('❌ Profile not found!');
        return;
    }

    // Check if user owns this profile
    if (profile.email !== userEmail) {
        alert('❌ You can only delete your own profile!');
        return;
    }

    // Confirm deletion
    if (confirm('⚠️ Are you sure you want to DELETE your profile?\n\nThis action CANNOT be undone!')) {
        const index = partners.findIndex(p => p.id === profileId);
        if (index !== -1) {
            const deletedProfile = partners[index];
            partners.splice(index, 1);
            savePartners();
            alert('✅ Your profile has been DELETED successfully!');
            console.log('Profile deleted:', deletedProfile);
            console.log('Remaining profiles:', partners.length);
            displayPartners();
        }
    } else {
        console.log('Delete cancelled by user');
    }
}

// Reset Form Function
function resetForm() {
    profileForm.reset();
    document.getElementById('profileId').value = '';
    document.getElementById('formTitle').textContent = 'Create Your Partner Profile';
    document.getElementById('formSubtitle').textContent = 'Fill in your information to find the perfect project partner';
    document.getElementById('submitBtn').textContent = 'Add My Profile';
    document.getElementById('cancelBtn').style.display = 'none';
    
    if (userEmail) {
        document.getElementById('email').value = userEmail;
    }
}

// Cancel Edit Button
document.getElementById('cancelBtn').addEventListener('click', function() {
    console.log('Edit cancelled');
    resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Contact Functions (GLOBAL)
let currentPartnerEmail = '';
let currentPartnerPhone = '';
let currentPartnerName = '';

window.openMessageModal = function(email, name, phone) {
    currentPartnerEmail = email;
    currentPartnerPhone = phone;
    currentPartnerName = name;
    
    document.getElementById('partnerNameModal').textContent = name;
    document.getElementById('messageModal').style.display = 'block';
    
    if (userName) document.getElementById('senderName').value = userName;
    if (userEmail) document.getElementById('senderEmail').value = userEmail;
}

document.querySelector('.close-modal').onclick = function() {
    document.getElementById('messageModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('messageModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

document.getElementById('messageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const senderName = document.getElementById('senderName').value;
    const senderEmail = document.getElementById('senderEmail').value;
    const message = document.getElementById('messageText').value;
    
    const subject = encodeURIComponent(`Project Partner Request from ${senderName} - FASTSync`);
    const body = encodeURIComponent(`Hi ${currentPartnerName},\n\n${message}\n\n---\nFrom: ${senderName}\nEmail: ${senderEmail}\n\nSent via FASTSync`);
    
    window.location.href = `mailto:${currentPartnerEmail}?subject=${subject}&body=${body}`;
    document.getElementById('messageModal').style.display = 'none';
});

document.getElementById('whatsappBtn').addEventListener('click', function() {
    const message = document.getElementById('messageText').value || `Hi ${currentPartnerName}! I found your profile on FASTSync.`;
    const cleanPhone = currentPartnerPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
});

document.getElementById('callBtn').addEventListener('click', function() {
    window.location.href = `tel:${currentPartnerPhone}`;
});

// Filters
const filterSession = document.getElementById('filterSession');
const filterCourse = document.getElementById('filterCourse');
const filterAvailability = document.getElementById('filterAvailability');

function applyFilters() {
    let filtered = partners;

    if (filterSession.value) {
        filtered = filtered.filter(p => p.session === filterSession.value);
    }
    if (filterCourse.value) {
        filtered = filtered.filter(p => p.course === filterCourse.value);
    }
    if (filterAvailability.value) {
        filtered = filtered.filter(p => p.availability === filterAvailability.value);
    }

    displayPartners(filtered);
}

filterSession.addEventListener('change', applyFilters);
filterCourse.addEventListener('change', applyFilters);
filterAvailability.addEventListener('change', applyFilters);

document.getElementById('resetFilters').addEventListener('click', function() {
    filterSession.value = '';
    filterCourse.value = '';
    filterAvailability.value = '';
    displayPartners();
});

// Initialize
if (userEmail) {
    document.getElementById('email').value = userEmail;
}

displayPartners();

console.log('✅ FASTSync loaded! Total profiles:', partners.length);
console.log('👤 Logged in as:', userEmail);
