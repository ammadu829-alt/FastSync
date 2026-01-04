// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "fastsync.firebaseapp.com",
    databaseURL: "https://fastsync-8b20e-default-rtdb.firebaseio.com/", 
    projectId: "fastsync",
    storageBucket: "fastsync.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef12345"
};

// 2. Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

let partners = [];
const userEmail = localStorage.getItem('userEmail');
const userName = localStorage.getItem('userName');

// 3. Start the App
function init() {
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // Pull data from the Cloud and listen for changes
    database.ref('profiles').on('value', (snapshot) => {
        const data = snapshot.val();
        partners = data ? Object.entries(data).map(([id, val]) => ({...val, id})) : [];
        displayPartners();
    });

    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn && userName) profileBtn.textContent = userName;
}

// 4. Display Cards with ALL NEW FIELDS
function displayPartners() {
    const grid = document.getElementById('partnersGrid');
    const countText = document.getElementById('partnersCount');
    const noResults = document.getElementById('noResults');
    
    if (!grid) return;

    if (countText) countText.textContent = partners.length;
    
    if (partners.length === 0) {
        if (noResults) noResults.style.display = 'block';
        grid.style.display = 'none';
        return;
    }
    
    if (noResults) noResults.style.display = 'none';
    grid.style.display = 'grid';
    grid.innerHTML = '';

    partners.forEach(p => {
        const isMine = p.email === userEmail;
        const card = document.createElement('div');
        card.className = 'partner-card';

        const availabilityClass = p.availability === 'available' ? 'status-available' : 'status-found';
        const availabilityText = p.availability === 'available' ? '✓ Available' : '✗ Partnered';
        
        const skillsArray = p.skills ? p.skills.split(',').map(s => s.trim()).filter(s => s) : [];
        const skillsHTML = skillsArray.length > 0 
            ? skillsArray.map(skill => `<span class="skill-tag">${skill}</span>`).join('')
            : '<span class="no-skills">No skills listed</span>';

        card.innerHTML = `
            <div class="card-header">
                <div class="profile-avatar">
                    ${p.fullName.charAt(0).toUpperCase()}
                </div>
                <div class="profile-info">
                    <h3 class="profile-name">${p.fullName}</h3>
                    <p class="profile-roll">${p.rollNumber}</p>
                </div>
                <span class="availability-badge ${availabilityClass}">${availabilityText}</span>
            </div>
            
            <div class="card-body">
                <div class="info-section">
                    <div class="info-row">
                        <span class="info-icon">🎓</span>
                        <div class="info-content">
                            <strong>University</strong>
                            <p>${p.university || 'Not specified'}</p>
                        </div>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-icon">💼</span>
                        <div class="info-content">
                            <strong>Department</strong>
                            <p>${p.department || 'Not specified'}</p>
                        </div>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-icon">📅</span>
                        <div class="info-content">
                            <strong>Batch & Section</strong>
                            <p>${p.batch || 'N/A'} - Section ${p.section || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-icon">📚</span>
                        <div class="info-content">
                            <strong>Semester</strong>
                            <p>${getOrdinalSemester(p.semester)}</p>
                        </div>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-icon">🗓️</span>
                        <div class="info-content">
                            <strong>Session</strong>
                            <p>${p.session || 'Not specified'}</p>
                        </div>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-icon">📖</span>
                        <div class="info-content">
                            <strong>Course</strong>
                            <p>${p.course || 'Not specified'}</p>
                        </div>
                    </div>

                    <div class="info-row">
                        <span class="info-icon">📧</span>
                        <div class="info-content">
                            <strong>Email</strong>
                            <p>${p.email}</p>
                        </div>
                    </div>

                    <div class="info-row">
                        <span class="info-icon">📱</span>
                        <div class="info-content">
                            <strong>Phone</strong>
                            <p>${p.phone}</p>
                        </div>
                    </div>
                </div>
                
                ${p.bio ? `
                    <div class="bio-section">
                        <strong>About:</strong>
                        <p>${p.bio}</p>
                    </div>
                ` : ''}
                
                <div class="skills-section">
                    <strong>Skills:</strong>
                    <div class="skills-container">
                        ${skillsHTML}
                    </div>
                </div>
            </div>
            
            <div class="card-footer">
                ${isMine ? 
                    `<button class="btn-contact" onclick="editProfile('${p.id}')" style="flex:1;">
                        <span>✏️</span> Edit Profile
                    </button>
                    <button class="btn-whatsapp" onclick="deleteProfile('${p.id}')" style="flex:1; background: rgba(239, 68, 68, 0.2); color: #ef4444; border-color: #ef4444;">
                        <span>🗑️</span> Delete
                    </button>` : 
                    `<button class="btn-contact" onclick="openContactModal('${p.id}', '${p.fullName}', '${p.email}')">
                        <span>📧</span> Contact
                    </button>
                    <a href="https://wa.me/${p.phone.replace(/\D/g, '')}" target="_blank" class="btn-whatsapp">
                        <span>💬</span> WhatsApp
                    </a>`
                }
            </div>
        `;
        grid.appendChild(card);
    });
}

// Helper function for ordinal semester
function getOrdinalSemester(num) {
    if (!num) return 'Not specified';
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]) + ' Semester';
}

// 5. Edit Profile Function
window.editProfile = function(id) {
    const p = partners.find(item => item.id === id);
    if (!p) return;

    const formSection = document.getElementById('profileSection');
    if (formSection) formSection.scrollIntoView({ behavior: 'smooth' });

    document.getElementById('profileId').value = p.id;
    document.getElementById('fullName').value = p.fullName || '';
    document.getElementById('email').value = p.email || '';
    document.getElementById('phone').value = p.phone || '';
    document.getElementById('rollNumber').value = p.rollNumber || '';
    document.getElementById('university').value = p.university || '';
    document.getElementById('department').value = p.department || '';
    document.getElementById('batch').value = p.batch || '';
    document.getElementById('section').value = p.section || '';
    document.getElementById('semester').value = p.semester || '';
    
    // Trigger semester change to populate courses
    const semesterSelect = document.getElementById('semester');
    const event = new Event('change');
    semesterSelect.dispatchEvent(event);
    
    setTimeout(() => {
        document.getElementById('course').value = p.course || '';
    }, 100);
    
    document.getElementById('session').value = p.session || '';
    document.getElementById('skills').value = p.skills || '';
    document.getElementById('bio').value = p.bio || '';
    document.getElementById('availability').value = p.availability || 'available';

    document.getElementById('formTitle').textContent = 'Edit Your Profile';
    document.getElementById('submitBtn').textContent = 'Update My Profile';
};

// 6. Delete Profile Function
window.deleteProfile = function(id) {
    if (confirm("⚠️ Are you sure you want to delete your profile? This action cannot be undone!")) {
        database.ref('profiles/' + id).remove()
            .then(() => {
                alert("✅ Profile deleted successfully!");
            })
            .catch(err => {
                alert("❌ Error deleting profile: " + err.message);
            });
    }
};

// 7. Handle Form Submission (Add or Update)
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const existingId = document.getElementById('profileId').value;
        const id = existingId || Date.now().toString();
        
        const profileData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            rollNumber: document.getElementById('rollNumber').value,
            university: document.getElementById('university').value,
            department: document.getElementById('department').value,
            batch: document.getElementById('batch').value,
            section: document.getElementById('section').value,
            semester: document.getElementById('semester').value,
            session: document.getElementById('session').value,
            course: document.getElementById('course').value,
            skills: document.getElementById('skills').value,
            bio: document.getElementById('bio').value,
            availability: document.getElementById('availability').value,
            timestamp: Date.now()
        };

        database.ref('profiles/' + id).set(profileData).then(() => {
            alert(existingId ? "✅ Profile Updated Successfully!" : "✅ Profile Added Successfully!");
            profileForm.reset();
            document.getElementById('profileId').value = '';
            document.getElementById('formTitle').textContent = 'Create Your Partner Profile';
            document.getElementById('submitBtn').textContent = 'Add My Profile';
            document.getElementById('course').disabled = true;
            document.getElementById('course').innerHTML = '<option value="">Select Semester First</option>';
        }).catch((error) => {
            alert("❌ Error: " + error.message);
        });
    });
}

// 8. Filter Profiles
function filterProfiles() {
    const filterUniversity = document.getElementById('filterUniversity')?.value || '';
    const filterDepartment = document.getElementById('filterDepartment')?.value || '';
    const filterBatch = document.getElementById('filterBatch')?.value || '';
    const filterSection = document.getElementById('filterSection')?.value || '';
    const filterSemester = document.getElementById('filterSemester')?.value || '';
    const filterSession = document.getElementById('filterSession')?.value || '';
    const filterCourse = document.getElementById('filterCourse')?.value || '';
    const filterAvailability = document.getElementById('filterAvailability')?.value || '';
    
    database.ref('profiles').once('value', (snapshot) => {
        const data = snapshot.val();
        let allPartners = data ? Object.entries(data).map(([id, val]) => ({...val, id})) : [];
        
        partners = allPartners.filter(profile => {
            if (filterUniversity && profile.university !== filterUniversity) return false;
            if (filterDepartment && profile.department !== filterDepartment) return false;
            if (filterBatch && profile.batch !== filterBatch) return false;
            if (filterSection && profile.section !== filterSection) return false;
            if (filterSemester && profile.semester !== filterSemester) return false;
            if (filterSession && profile.session !== filterSession) return false;
            if (filterCourse && profile.course !== filterCourse) return false;
            if (filterAvailability && profile.availability !== filterAvailability) return false;
            return true;
        });
        
        displayPartners();
    });
}

// Add filter event listeners
const filterIds = ['filterUniversity', 'filterDepartment', 'filterBatch', 'filterSection', 
                   'filterSemester', 'filterSession', 'filterCourse', 'filterAvailability'];

filterIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener('change', filterProfiles);
    }
});

// Reset filters
const resetFiltersBtn = document.getElementById('resetFilters');
if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', function() {
        filterIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
        init(); // Reload all profiles
    });
}

// 9. Contact Modal Functions
window.openContactModal = function(profileId, name, email) {
    const modal = document.getElementById('messageModal');
    if (modal) {
        document.getElementById('partnerNameModal').textContent = name;
        modal.style.display = 'flex';
        
        const messageForm = document.getElementById('messageForm');
        messageForm.dataset.partnerEmail = email;
        messageForm.dataset.partnerName = name;
    }
};

const closeModal = document.getElementById('closeModal');
if (closeModal) {
    closeModal.addEventListener('click', function() {
        document.getElementById('messageModal').style.display = 'none';
    });
}

window.addEventListener('click', function(e) {
    const modal = document.getElementById('messageModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Message form submission
const messageForm = document.getElementById('messageForm');
if (messageForm) {
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const senderName = document.getElementById('senderName').value;
        const senderEmail = document.getElementById('senderEmail').value;
        const message = document.getElementById('messageText').value;
        const partnerEmail = this.dataset.partnerEmail;
        const partnerName = this.dataset.partnerName;
        
        const subject = encodeURIComponent(`Project Partnership Request from ${senderName}`);
        const body = encodeURIComponent(`Hi ${partnerName},\n\n${message}\n\nBest regards,\n${senderName}\n${senderEmail}`);
        const mailtoLink = `mailto:${partnerEmail}?subject=${subject}&body=${body}`;
        
        window.location.href = mailtoLink;
        
        document.getElementById('messageModal').style.display = 'none';
        this.reset();
        
        alert('Opening your email client...');
    });
}

// 10. Logout Button
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            window.location.href = 'index.html';
        }
    });
}

// Initialize on page load
init();
console.log('✅ FASTSync Partner Finder loaded successfully!');
