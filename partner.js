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
let myConnections = [];
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
    
    // Load connections and requests
    loadMyConnections();
    loadPendingRequests();
}

// Load my connections (accepted requests)
function loadMyConnections() {
    if (!userEmail) return;
    const userId = emailToId(userEmail);
    
    console.log('🔗 Loading connections for user:', userId);
    
    database.ref('connections/' + userId).on('value', (snapshot) => {
        const data = snapshot.val();
        myConnections = data ? Object.keys(data) : [];
        console.log('🔗 My connections:', myConnections);
        displayPartners();
    });
}

// Load pending requests for badge
function loadPendingRequests() {
    if (!userEmail) return;
    const userId = emailToId(userEmail);
    
    // Listen for all requests and filter for this user
    database.ref('requests').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            updateRequestBadge(0);
            return;
        }
        
        // Filter requests where current user is the recipient
        const received = Object.entries(data).filter(([id, req]) => 
            req.toUserId === userId && req.status === 'pending'
        );
        
        updateRequestBadge(received.length);
        console.log(`📬 You have ${received.length} pending requests`);
    });
}

// Update request badge
function updateRequestBadge(count) {
    const badge = document.getElementById('requestBadge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Helper function to convert email to ID
function emailToId(email) {
    return email.replace(/[.@]/g, '_');
}

// 4. Display Cards with FIXED PRIVACY CONTROLS
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
        const card = createProfileCard(p);
        grid.appendChild(card);
    });
}

// Create profile card with FIXED privacy controls
function createProfileCard(p) {
    const card = document.createElement('div');
    card.className = 'partner-card';

    // CRITICAL: Check if this is MY profile (exact email match)
    const isMine = (p.email && userEmail && p.email.toLowerCase() === userEmail.toLowerCase());
    
    // CRITICAL: Check if I'm connected with this user
    const recipientUserId = emailToId(p.email);
    const isConnected = myConnections.includes(recipientUserId);
    
    // STRICT PRIVACY RULE: Show full info ONLY if it's my profile OR we're connected
    // Default to FALSE for safety
    const showPrivateInfo = isMine === true || isConnected === true;
    
    // Debug logging - Check console to see what's happening
    console.log('========================================');
    console.log('🔍 PRIVACY CHECK for:', p.fullName);
    console.log('   Profile email:', p.email);
    console.log('   My email:', userEmail);
    console.log('   Profile userId:', recipientUserId);
    console.log('   Is mine?:', isMine);
    console.log('   My connections:', myConnections);
    console.log('   Is connected?:', isConnected);
    console.log('   ✅ SHOW PRIVATE INFO?:', showPrivateInfo);
    console.log('========================================');

    const availabilityClass = p.availability === 'available' ? 'status-available' : 'status-found';
    const availabilityText = p.availability === 'available' ? '✓ Available' : '✗ Partnered';
    
    const skillsArray = p.skills ? p.skills.split(',').map(s => s.trim()).filter(s => s) : [];
    const skillsHTML = skillsArray.length > 0 
        ? skillsArray.map(skill => `<span class="skill-tag">${skill}</span>`).join('')
        : '<span class="no-skills">No skills listed</span>';

    // PUBLIC INFORMATION (Always visible to everyone)
    let publicInfo = `
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
                        <strong>Batch</strong>
                        <p>${p.batch || 'N/A'}</p>
                    </div>
                </div>
                
                <div class="info-row">
                    <span class="info-icon">🔖</span>
                    <div class="info-content">
                        <strong>Section</strong>
                        <p>Section ${p.section || 'N/A'}</p>
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
                    <span class="info-icon">📖</span>
                    <div class="info-content">
                        <strong>Course</strong>
                        <p>${p.course || 'Not specified'}</p>
                    </div>
                </div>
            </div>`;

    // PRIVATE INFORMATION - STRICT CHECK
    let privateInfo = '';
    
    // CRITICAL: Only show if showPrivateInfo is explicitly TRUE
    if (showPrivateInfo === true) {
        console.log('✅ UNLOCKING private info for:', p.fullName);
        // UNLOCKED - Show full private information
        privateInfo = `
            <div class="privacy-unlocked">
                <p class="connection-status">🔓 Full Profile Access</p>
                
                <div class="info-section">
                    <div class="info-row">
                        <span class="info-icon">🗓️</span>
                        <div class="info-content">
                            <strong>Session</strong>
                            <p>${p.session || 'Not specified'}</p>
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
            </div>`;
    } else {
        console.log('🔒 LOCKING private info for:', p.fullName);
        // LOCKED - Hide private information
        privateInfo = `
            <div class="privacy-locked">
                <div class="locked-message">
                    <span class="lock-icon">🔒</span>
                    <p><strong>Private Information Locked</strong></p>
                    <p class="locked-text">Session, Email, Phone, Bio & Skills are hidden for privacy protection.</p>
                    <p class="locked-hint">Send a connection request to view full profile</p>
                </div>
            </div>`;
    }

    // FOOTER BUTTONS - Also use strict checks
    let footerButtons = '';
    if (isMine === true) {
        console.log('👤 Showing MY profile buttons for:', p.fullName);
        // My own profile - Show Edit and Delete
        footerButtons = `
            <button class="btn-contact" onclick="editProfile('${p.id}')" style="flex:1;">
                <span>✏️</span> Edit Profile
            </button>
            <button class="btn-delete" onclick="deleteProfile('${p.id}')" style="flex:1;">
                <span>🗑️</span> Delete
            </button>`;
    } else if (showPrivateInfo === true) {
        console.log('🔗 Showing CONNECTED user buttons for:', p.fullName);
        // Connected user - Show Contact and WhatsApp
        footerButtons = `
            <button class="btn-contact" onclick="openContactModal('${p.id}', '${p.fullName}', '${p.email}')">
                <span>📧</span> Contact
            </button>
            <a href="https://wa.me/${p.phone.replace(/\D/g, '')}" target="_blank" class="btn-whatsapp">
                <span>💬</span> WhatsApp
            </a>`;
    } else {
        console.log('🔐 Showing SEND REQUEST button for:', p.fullName);
        // Not connected - Show Send Request button
        footerButtons = `
            <button class="btn-request" onclick="sendConnectionRequest('${p.id}', '${p.fullName}')">
                <span>🔗</span> Send Request
            </button>`;
    }

    card.innerHTML = publicInfo + privateInfo + `
        </div>
        <div class="card-footer">
            ${footerButtons}
        </div>
    `;
    
    return card;
}

// Send connection request
window.sendConnectionRequest = function(toProfileId, toUserName) {
    if (!userEmail) return alert('Please log in first');
    
    const fromUserId = emailToId(userEmail);
    
    // Get the recipient's email from their profile
    const recipientProfile = partners.find(p => p.id === toProfileId);
    if (!recipientProfile) {
        alert('❌ Error: Could not find recipient profile');
        return;
    }
    
    const toUserId = emailToId(recipientProfile.email);
    
    console.log('📤 Sending request');
    console.log('From:', fromUserId, '(', userEmail, ')');
    console.log('To:', toUserId, '(', recipientProfile.email, ')');
    
    // Check if request already exists
    database.ref('requests').once('value', (snapshot) => {
        const existing = snapshot.val();
        if (existing) {
            const alreadySent = Object.values(existing).some(req => 
                req.fromUserId === fromUserId && req.toUserId === toUserId && req.status === 'pending'
            );
            if (alreadySent) {
                return alert('⚠️ Request already sent to this user!');
            }
        }
        
        // Send new request
        const requestData = {
            fromUserId: fromUserId,
            fromUserName: userName,
            fromUserEmail: userEmail,
            toUserId: toUserId,
            toUserName: toUserName,
            toUserEmail: recipientProfile.email,
            status: 'pending',
            timestamp: Date.now()
        };
        
        console.log('💾 Saving request:', requestData);
        
        database.ref('requests').push(requestData).then(() => {
            alert(`✅ Connection request sent to ${toUserName}!`);
            console.log('✅ Request sent successfully');
        }).catch(err => {
            alert('❌ Error sending request: ' + err.message);
            console.error('❌ Error:', err);
        });
    });
};

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
        init();
    });
}

// 9. Requests Button Click
const requestsBtn = document.getElementById('requestsBtn');
if (requestsBtn) {
    requestsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showRequestsModal();
    });
}

// 10. Report Button Click
const reportBtn = document.getElementById('reportBtn');
if (reportBtn) {
    reportBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showReportModal();
    });
}

// Show report modal
function showReportModal() {
    const modal = document.getElementById('reportModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Close report modal
const closeReportModal = document.getElementById('closeReportModal');
if (closeReportModal) {
    closeReportModal.addEventListener('click', () => {
        document.getElementById('reportModal').style.display = 'none';
    });
}

// Report form submission
const reportForm = document.getElementById('reportForm');
if (reportForm) {
    reportForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!userEmail) {
            alert('❌ Please log in to submit a report');
            return;
        }
        
        const reporterProfile = partners.find(p => p.email === userEmail);
        
        const reportData = {
            reportedUserName: document.getElementById('reportedUserName').value,
            reportedUserRoll: document.getElementById('reportedUserRoll').value,
            reportReason: document.getElementById('reportReason').value,
            reportDescription: document.getElementById('reportDescription').value,
            reporterName: userName || 'Unknown',
            reporterEmail: userEmail,
            reporterRollNumber: reporterProfile ? reporterProfile.rollNumber : 'N/A',
            reporterUniversity: reporterProfile ? reporterProfile.university : 'N/A',
            reporterDepartment: reporterProfile ? reporterProfile.department : 'N/A',
            reporterSection: reporterProfile ? reporterProfile.section : 'N/A',
            reporterSemester: reporterProfile ? reporterProfile.semester : 'N/A',
            timestamp: Date.now(),
            status: 'pending',
            dateReported: new Date().toISOString()
        };
        
        database.ref('reports').push(reportData)
            .then(() => {
                alert('✅ Report submitted successfully!');
                document.getElementById('reportModal').style.display = 'none';
                reportForm.reset();
            })
            .catch(err => {
                alert('❌ Error: ' + err.message);
            });
    });
}

// Show requests modal
function showRequestsModal() {
    const modal = document.getElementById('requestsModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            loadReceivedRequests();
        }, 100);
    }
}

// Load received requests
function loadReceivedRequests() {
    const userId = emailToId(userEmail);
    const container = document.getElementById('receivedRequests');
    
    if (!container) return;
    
    container.innerHTML = '<p class="no-requests">Loading...</p>';
    
    database.ref('requests').once('value', (snapshot) => {
        const data = snapshot.val();
        
        if (!data) {
            container.innerHTML = '<p class="no-requests">No pending requests</p>';
            return;
        }
        
        const requests = Object.entries(data).filter(([id, req]) => 
            req.toUserId === userId && req.status === 'pending'
        );
        
        if (requests.length === 0) {
            container.innerHTML = '<p class="no-requests">No pending requests</p>';
            return;
        }
        
        const html = requests.map(([id, req]) => `
            <div class="request-item">
                <div class="request-avatar">${req.fromUserName.charAt(0).toUpperCase()}</div>
                <div class="request-info">
                    <strong>${req.fromUserName}</strong>
                    <p>${req.fromUserEmail}</p>
                    <small style="color: #8a2be2;">wants to connect</small>
                </div>
                <div class="request-actions">
                    <button class="btn-accept" onclick="acceptRequest('${id}', '${req.fromUserId}')">Accept</button>
                    <button class="btn-reject" onclick="rejectRequest('${id}')">Reject</button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    });
}

// Accept request
window.acceptRequest = function(requestId, fromUserId) {
    const toUserId = emailToId(userEmail);
    
    database.ref('requests/' + requestId).update({status: 'accepted'}).then(() => {
        database.ref('connections/' + toUserId + '/' + fromUserId).set(true);
        database.ref('connections/' + fromUserId + '/' + toUserId).set(true);
        
        alert('✅ Request accepted!');
        loadReceivedRequests();
        loadMyConnections();
    });
};

// Reject request
window.rejectRequest = function(requestId) {
    database.ref('requests/' + requestId).update({status: 'rejected'}).then(() => {
        alert('❌ Request rejected');
        loadReceivedRequests();
    });
};

// Load sent requests
function loadSentRequests() {
    const userId = emailToId(userEmail);
    const container = document.getElementById('sentRequests');
    
    if (!container) return;
    
    container.innerHTML = '<p class="no-requests">Loading...</p>';
    
    database.ref('requests').once('value', (snapshot) => {
        const data = snapshot.val();
        
        if (!data) {
            container.innerHTML = '<p class="no-requests">No sent requests</p>';
            return;
        }
        
        const requests = Object.entries(data).filter(([id, req]) => 
            req.fromUserId === userId
        );
        
        if (requests.length === 0) {
            container.innerHTML = '<p class="no-requests">No sent requests</p>';
            return;
        }
        
        const html = requests.map(([id, req]) => `
            <div class="request-item">
                <div class="request-avatar">${req.toUserName.charAt(0).toUpperCase()}</div>
                <div class="request-info">
                    <strong>${req.toUserName}</strong>
                    <p class="request-status status-${req.status}">${req.status}</p>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    });
}

// Tabs functionality
const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const tab = this.dataset.tab;
        document.getElementById('receivedRequests').style.display = tab === 'received' ? 'block' : 'none';
        document.getElementById('sentRequests').style.display = tab === 'sent' ? 'block' : 'none';
        
        if (tab === 'sent') loadSentRequests();
    });
});

// Close requests modal
const closeRequestsModal = document.getElementById('closeRequestsModal');
if (closeRequestsModal) {
    closeRequestsModal.addEventListener('click', () => {
        document.getElementById('requestsModal').style.display = 'none';
    });
}

// 11. Contact Modal
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
    closeModal.addEventListener('click', () => {
        document.getElementById('messageModal').style.display = 'none';
    });
}

window.addEventListener('click', function(e) {
    const modals = ['messageModal', 'requestsModal', 'reportModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (e.target === modal) modal.style.display = 'none';
    });
});

// Message form
const messageForm = document.getElementById('messageForm');
if (messageForm) {
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const senderName = document.getElementById('senderName').value;
        const senderEmail = document.getElementById('senderEmail').value;
        const message = document.getElementById('messageText').value;
        const partnerEmail = this.dataset.partnerEmail;
        const partnerName = this.dataset.partnerName;
        
        const subject = encodeURIComponent(`Partnership Request from ${senderName}`);
        const body = encodeURIComponent(`Hi ${partnerName},\n\n${message}\n\nBest regards,\n${senderName}\n${senderEmail}`);
        window.location.href = `mailto:${partnerEmail}?subject=${subject}&body=${body}`;
        
        document.getElementById('messageModal').style.display = 'none';
        this.reset();
    });
}

// 12. Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Logout?')) {
            localStorage.clear();
            window.location.href = 'index.html';
        }
    });
}

// Profile button
const profileBtn = document.getElementById('profileBtn');
if (profileBtn) {
    profileBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const myProfile = partners.find(p => p.email === userEmail);
        if (myProfile) {
            editProfile(myProfile.id);
        } else {
            alert('Create your profile first!');
            document.getElementById('profileSection').scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Initialize
init();
console.log('✅ FASTSync with FIXED Privacy System loaded!')
