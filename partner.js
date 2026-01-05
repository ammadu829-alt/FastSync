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
    
    database.ref('connections/' + userId).on('value', (snapshot) => {
        const data = snapshot.val();
        myConnections = data ? Object.keys(data) : [];
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

// 4. Display Cards with PRIVACY CONTROLS
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
        const isConnected = myConnections.includes(p.id);
        const card = createProfileCard(p, isMine, isConnected);
        grid.appendChild(card);
    });
}

// Create profile card with privacy controls
function createProfileCard(p, isMine, isConnected) {
    const card = document.createElement('div');
    card.className = 'partner-card';

    const availabilityClass = p.availability === 'available' ? 'status-available' : 'status-found';
    const availabilityText = p.availability === 'available' ? '✓ Available' : '✗ Partnered';
    
    const skillsArray = p.skills ? p.skills.split(',').map(s => s.trim()).filter(s => s) : [];
    const skillsHTML = skillsArray.length > 0 
        ? skillsArray.map(skill => `<span class="skill-tag">${skill}</span>`).join('')
        : '<span class="no-skills">No skills listed</span>';

    // PUBLIC INFORMATION (Always visible)
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
                    <span class="info-icon">📚</span>
                    <div class="info-content">
                        <strong>Semester</strong>
                        <p>${getOrdinalSemester(p.semester)}</p>
                    </div>
                </div>
            </div>`;

    // PRIVATE INFORMATION (Only if connected or own profile)
    let privateInfo = '';
    if (isMine || isConnected) {
        privateInfo = `
            <div class="privacy-unlocked">
                <p class="connection-status">🔓 Full Profile Access</p>
                
                <div class="info-section">
                    <div class="info-row">
                        <span class="info-icon">🔖</span>
                        <div class="info-content">
                            <strong>Section</strong>
                            <p>Section ${p.section || 'N/A'}</p>
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
            </div>`;
    } else {
        // LOCKED PRIVATE INFO
        privateInfo = `
            <div class="privacy-locked">
                <div class="locked-message">
                    <span class="lock-icon">🔒</span>
                    <p><strong>Private Information</strong></p>
                    <p class="locked-text">Email, Phone, Section, Session, Course, Bio & Skills are hidden for privacy protection.</p>
                    <p class="locked-hint">Send a connection request to view full profile</p>
                </div>
            </div>`;
    }

    // FOOTER BUTTONS
    let footerButtons = '';
    if (isMine) {
        footerButtons = `
            <button class="btn-contact" onclick="editProfile('${p.id}')" style="flex:1;">
                <span>✏️</span> Edit Profile
            </button>
            <button class="btn-delete" onclick="deleteProfile('${p.id}')" style="flex:1;">
                <span>🗑️</span> Delete
            </button>`;
    } else if (isConnected) {
        footerButtons = `
            <button class="btn-contact" onclick="openContactModal('${p.id}', '${p.fullName}', '${p.email}')">
                <span>📧</span> Contact
            </button>
            <a href="https://wa.me/${p.phone.replace(/\D/g, '')}" target="_blank" class="btn-whatsapp">
                <span>💬</span> WhatsApp
            </a>`;
    } else {
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
    const toUserId = toProfileId;
    
    console.log('📤 Sending request from:', fromUserId, 'to:', toUserId);
    
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
        init(); // Reload all profiles
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

// Show requests modal
function showRequestsModal() {
    const modal = document.getElementById('requestsModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Load received requests immediately
        setTimeout(() => {
            loadReceivedRequests();
        }, 100);
    }
}

// Load received requests
function loadReceivedRequests() {
    const userId = emailToId(userEmail);
    const container = document.getElementById('receivedRequests');
    
    if (!container) {
        console.error('❌ receivedRequests container not found!');
        return;
    }
    
    console.log('🔍 Loading requests for user:', userId, 'Email:', userEmail);
    
    // Show loading message
    container.innerHTML = '<p class="no-requests">Loading requests...</p>';
    
    database.ref('requests').once('value', (snapshot) => {
        const data = snapshot.val();
        console.log('📦 All requests in database:', data);
        
        if (!data) {
            container.innerHTML = '<p class="no-requests">No pending requests</p>';
            return;
        }
        
        // Filter requests where current user is the recipient and status is pending
        const requests = Object.entries(data).filter(([id, req]) => {
            console.log('Checking request:', id, 'toUserId:', req.toUserId, 'matches:', req.toUserId === userId);
            return req.toUserId === userId && req.status === 'pending';
        });
        
        console.log('✅ Filtered requests for this user:', requests.length, 'requests');
        
        if (requests.length === 0) {
            container.innerHTML = '<p class="no-requests">No pending requests</p>';
            return;
        }
        
        const html = requests.map(([id, req]) => `
            <div class="request-item">
                <div class="request-avatar">${req.fromUserName ? req.fromUserName.charAt(0).toUpperCase() : '?'}</div>
                <div class="request-info">
                    <strong>${req.fromUserName || 'Unknown User'}</strong>
                    <p>${req.fromUserEmail || 'No email'}</p>
                    <small style="color: #8a2be2; display: block; margin-top: 5px;">wants to connect with you</small>
                </div>
                <div class="request-actions">
                    <button class="btn-accept" onclick="acceptRequest('${id}', '${req.fromUserId}')">Accept</button>
                    <button class="btn-reject" onclick="rejectRequest('${id}')">Reject</button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
        console.log('✅ Requests displayed successfully');
    }).catch(error => {
        console.error('❌ Error loading requests:', error);
        container.innerHTML = '<p class="no-requests">Error loading requests</p>';
    });
}

// Accept request
window.acceptRequest = function(requestId, fromUserId) {
    const toUserId = emailToId(userEmail);
    
    // Update request status
    database.ref('requests/' + requestId).update({status: 'accepted'}).then(() => {
        // Create connection both ways
        database.ref('connections/' + toUserId + '/' + fromUserId).set(true);
        database.ref('connections/' + fromUserId + '/' + toUserId).set(true);
        
        alert('✅ Request accepted! You can now see full profile.');
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
    
    if (!container) {
        console.error('❌ sentRequests container not found!');
        return;
    }
    
    console.log('🔍 Loading sent requests from user:', userId, 'Email:', userEmail);
    
    // Show loading message
    container.innerHTML = '<p class="no-requests">Loading sent requests...</p>';
    
    database.ref('requests').once('value', (snapshot) => {
        const data = snapshot.val();
        
        if (!data) {
            container.innerHTML = '<p class="no-requests">No sent requests</p>';
            return;
        }
        
        // Filter requests where current user is the sender
        const requests = Object.entries(data).filter(([id, req]) => {
            console.log('Checking sent request:', id, 'fromUserId:', req.fromUserId, 'matches:', req.fromUserId === userId);
            return req.fromUserId === userId;
        });
        
        console.log('📤 Sent requests:', requests.length, 'requests');
        
        if (requests.length === 0) {
            container.innerHTML = '<p class="no-requests">No sent requests</p>';
            return;
        }
        
        const html = requests.map(([id, req]) => `
            <div class="request-item">
                <div class="request-avatar">${req.toUserName ? req.toUserName.charAt(0).toUpperCase() : '?'}</div>
                <div class="request-info">
                    <strong>${req.toUserName || 'Unknown User'}</strong>
                    <p class="request-status status-${req.status || 'pending'}">${req.status || 'pending'}</p>
                    <small style="color: #b0b0b0; display: block; margin-top: 5px;">Request sent</small>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
        console.log('✅ Sent requests displayed successfully');
    }).catch(error => {
        console.error('❌ Error loading sent requests:', error);
        container.innerHTML = '<p class="no-requests">Error loading sent requests</p>';
    });
}

// Tabs functionality
const tabButtons = document.querySelectorAll('.tab-btn');
if (tabButtons.length > 0) {
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const tab = this.dataset.tab;
            const receivedDiv = document.getElementById('receivedRequests');
            const sentDiv = document.getElementById('sentRequests');
            
            if (receivedDiv && sentDiv) {
                receivedDiv.style.display = tab === 'received' ? 'block' : 'none';
                sentDiv.style.display = tab === 'sent' ? 'block' : 'none';
                
                if (tab === 'sent') loadSentRequests();
            }
        });
    });
}

// Close requests modal
const closeRequestsModal = document.getElementById('closeRequestsModal');
if (closeRequestsModal) {
    closeRequestsModal.addEventListener('click', () => {
        const modal = document.getElementById('requestsModal');
        if (modal) modal.style.display = 'none';
    });
}

// 10. Contact Modal Functions
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
    const requestsModal = document.getElementById('requestsModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
    if (e.target === requestsModal) {
        requestsModal.style.display = 'none';
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

// 11. Logout Button
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

// Profile button
const profileBtn = document.getElementById('profileBtn');
if (profileBtn) {
    profileBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // Find current user's profile
        const myProfile = partners.find(p => p.email === userEmail);
        if (myProfile) {
            editProfile(myProfile.id);
        } else {
            alert('Please create your profile first!');
            document.getElementById('profileSection').scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Initialize on page load
init();
console.log('✅ FASTSync Partner Finder with Privacy System loaded successfully!');
