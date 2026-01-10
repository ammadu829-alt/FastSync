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

    database.ref('profiles').on('value', (snapshot) => {
        const data = snapshot.val();
        partners = data ? Object.entries(data).map(([id, val]) => ({ ...val, id })) : [];
        displayPartners();
    });

    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn && userName) profileBtn.textContent = userName;

    loadMyConnections();
    loadPendingRequests();
}

// Load my connections
function loadMyConnections() {
    if (!userEmail) return;
    const userId = emailToId(userEmail);

    database.ref('connections/' + userId).on('value', (snapshot) => {
        const data = snapshot.val();
        myConnections = data ? Object.keys(data) : [];
        displayPartners();
    });
}

// Load pending requests badge
function loadPendingRequests() {
    if (!userEmail) return;
    const userId = emailToId(userEmail);

    database.ref('requests').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            updateRequestBadge(0);
            return;
        }

        const received = Object.values(data).filter(req =>
            req.toUserId === userId && req.status === 'pending'
        );

        updateRequestBadge(received.length);
    });
}

function updateRequestBadge(count) {
    const badge = document.getElementById('requestBadge');
    if (!badge) return;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
    badge.textContent = count;
}

function emailToId(email) {
    return email.replace(/[.@]/g, '_');
}

// 4. Display Cards (PRIVACY FIXED)
function displayPartners() {
    const grid = document.getElementById('partnersGrid');
    if (!grid) return;

    grid.innerHTML = '';

    partners.forEach(p => {
        const isMine = p.email === userEmail;

        // 🔐 FIX: email-based connection only
        const recipientUserId = emailToId(p.email);
        const actuallyConnected = isMine || myConnections.includes(recipientUserId);

        const card = createProfileCard(p, isMine, actuallyConnected);
        grid.appendChild(card);
    });
}

// Create profile card
function createProfileCard(p, isMine, actuallyConnected) {
    const card = document.createElement('div');
    card.className = 'partner-card';

    const availabilityClass = p.availability === 'available' ? 'status-available' : 'status-found';
    const availabilityText = p.availability === 'available' ? '✓ Available' : '✗ Partnered';

    const skillsArray = p.skills ? p.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
    const skillsHTML = skillsArray.length
        ? skillsArray.map(skill => `<span class="skill-tag">${skill}</span>`).join('')
        : '<span class="no-skills">No skills listed</span>';

    let publicInfo = `
        <div class="card-header">
            <div class="profile-avatar">${p.fullName.charAt(0).toUpperCase()}</div>
            <div class="profile-info">
                <h3>${p.fullName}</h3>
                <p>${p.rollNumber}</p>
            </div>
            <span class="availability-badge ${availabilityClass}">${availabilityText}</span>
        </div>
        <div class="card-body">
            <p><strong>University:</strong> ${p.university}</p>
            <p><strong>Department:</strong> ${p.department}</p>
            <p><strong>Batch:</strong> ${p.batch}</p>
            <p><strong>Section:</strong> ${p.section}</p>
            <p><strong>Semester:</strong> ${getOrdinalSemester(p.semester)}</p>
            <p><strong>Course:</strong> ${p.course}</p>
    `;

    let privateInfo = '';
    if (actuallyConnected) {
        privateInfo = `
            <hr>
            <p><strong>Session:</strong> ${p.session}</p>
            <p><strong>Email:</strong> ${p.email}</p>
            <p><strong>Phone:</strong> ${p.phone}</p>
            ${p.bio ? `<p><strong>About:</strong> ${p.bio}</p>` : ''}
            <div><strong>Skills:</strong> ${skillsHTML}</div>
        `;
    } else {
        privateInfo = `
            <hr>
            <p>🔒 Private information hidden</p>
        `;
    }

    card.innerHTML = publicInfo + privateInfo + '</div>';
    return card;
}

// Helper
function getOrdinalSemester(num) {
    if (!num) return 'N/A';
    const s = ["th", "st", "nd", "rd"], v = num % 100;
    return num + (s[(v - 20) % 10] || s[v] || s[0]) + " Semester";
}

// Initialize
init();
console.log('✅ FASTSync loaded with PRIVATE DATA PROTECTION');
