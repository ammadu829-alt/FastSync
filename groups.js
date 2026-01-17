// groups.js - Group Management System

// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "fastsync.firebaseapp.com",
    databaseURL: "https://fastsync-8b20e-default-rtdb.firebaseio.com/",
    projectId: "fastsync",
    storageBucket: "fastsync.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef12345"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Get user info
const userEmail = localStorage.getItem('userEmail');
const userName = localStorage.getItem('userName');
const userId = userEmail ? emailToId(userEmail) : null;

let myGroups = [];
let myConnections = [];
let allProfiles = {};

// Helper function
function emailToId(email) {
    return email.replace(/[.@]/g, '_');
}

// Initialize
function init() {
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    loadProfiles();
    loadConnections();
    loadGroups();
}

// Load all profiles for reference
function loadProfiles() {
    database.ref('profiles').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            allProfiles = data;
        }
    });
}

// Load user connections
function loadConnections() {
    if (!userId) return;

    database.ref('connections/' + userId).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            myConnections = Object.keys(data).filter(id => id !== userId && data[id] === true);
        }
        console.log('My connections:', myConnections);
    });
}

// Load user's groups
function loadGroups() {
    if (!userId) return;

    database.ref('groups').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Filter groups where user is a member
            myGroups = Object.entries(data)
                .map(([id, val]) => ({...val, id}))
                .filter(group => {
                    if (!group.members) return false;
                    return Object.keys(group.members).includes(userId);
                });
        } else {
            myGroups = [];
        }
        displayGroups();
    });
}

// Display groups
function displayGroups() {
    const grid = document.getElementById('groupsGrid');

    if (myGroups.length === 0) {
        grid.innerHTML = `
            <div class="no-groups">
                <div class="no-groups-icon">👥</div>
                <h3>No Groups Yet</h3>
                <p>Create a group to collaborate with multiple partners</p>
                <button class="btn btn-primary" onclick="openCreateGroupModal()">
                    <i class="bi bi-plus-circle"></i> Create Your First Group
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = myGroups.map(group => createGroupCard(group)).join('');
}

// Create group card
function createGroupCard(group) {
    const members = group.members ? Object.entries(group.members) : [];
    const memberCount = members.length;
    const isCreator = group.createdBy === userId;

    // Get member details
    const membersList = members.map(([memberId, memberData]) => {
        const profile = Object.values(allProfiles).find(p => emailToId(p.email) === memberId);
        const name = memberData.name || profile?.fullName || 'Unknown';
        const email = memberData.email || profile?.email || '';
        const isMe = memberId === userId;
        const role = memberId === group.createdBy ? 'Creator' : 'Member';

        return `
            <div class="member-item">
                <div class="member-avatar">${name.charAt(0).toUpperCase()}</div>
                <div class="member-info">
                    <div class="member-name">${name}${isMe ? ' (You)' : ''}</div>
                    <div class="member-email">${email}</div>
                </div>
                <span class="member-role" style="background: ${role === 'Creator' ? '#ffc107' : '#28a745'}">${role}</span>
            </div>
        `;
    }).join('');

    return `
        <div class="group-card">
            <div class="group-header">
                <h3 class="group-name">${group.name}</h3>
                <span class="group-badge">${memberCount} ${memberCount === 1 ? 'Member' : 'Members'}</span>
            </div>

            <div style="margin-bottom: 15px;">
                <div style="font-size: 13px; color: #666; display: flex; align-items: center; gap: 5px;">
                    <i class="bi bi-book"></i>
                    ${group.course || 'No course specified'}
                </div>
            </div>

            ${group.description ? `
                <div style="margin-bottom: 15px; padding: 10px; background: white; border-radius: 8px; font-size: 14px; color: #666;">
                    ${group.description}
                </div>
            ` : ''}

            <div class="group-members">
                <div class="group-members-title">
                    <i class="bi bi-people"></i> Group Members
                </div>
                <div class="members-list">
                    ${membersList}
                </div>
            </div>

            <div class="group-actions">
                <button class="btn btn-primary btn-sm" onclick="viewGroupProjects('${group.id}')">
                    <i class="bi bi-kanban"></i> Projects
                </button>
                ${isCreator ? `
                    <button class="btn btn-success btn-sm" onclick="openAddMemberModal('${group.id}')">
                        <i class="bi bi-person-plus"></i> Add Member
                    </button>
                ` : ''}
                ${isCreator ? `
                    <button class="btn btn-danger btn-sm" onclick="deleteGroup('${group.id}', '${group.name}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                ` : `
                    <button class="btn btn-danger btn-sm" onclick="leaveGroup('${group.id}', '${group.name}')">
                        <i class="bi bi-box-arrow-right"></i> Leave Group
                    </button>
                `}
            </div>
        </div>
    `;
}

// Open create group modal
function openCreateGroupModal() {
    document.getElementById('createGroupModal').classList.add('show');
    document.getElementById('createGroupForm').reset();
    loadMemberSelectList();
}

// Load member selection list
function loadMemberSelectList() {
    const list = document.getElementById('memberSelectList');

    if (myConnections.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999;">No connections available. Connect with others first!</p>';
        return;
    }

    const html = myConnections.map(connId => {
        const profile = Object.values(allProfiles).find(p => emailToId(p.email) === connId);
        if (!profile) return '';

        return `
            <div class="member-select-item">
                <input type="checkbox" name="members" value="${connId}" id="member_${connId}">
                <div class="member-avatar">${profile.fullName.charAt(0).toUpperCase()}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #333;">${profile.fullName}</div>
                    <div style="font-size: 12px; color: #666;">${profile.email}</div>
                </div>
            </div>
        `;
    }).join('');

    list.innerHTML = html || '<p style="text-align: center; color: #999;">No connections available</p>';
}

// Create group form submit
document.getElementById('createGroupForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('groupName').value;
    const course = document.getElementById('groupCourse').value;
    const description = document.getElementById('groupDescription').value;

    // Get selected members
    const selectedMembers = Array.from(document.querySelectorAll('input[name="members"]:checked'))
        .map(cb => cb.value);

    if (selectedMembers.length === 0) {
        alert('❌ Please select at least one member!');
        return;
    }

    if (selectedMembers.length > 2) {
        alert('❌ Maximum 3 members per group (including you)!');
        return;
    }

    // Create members object
    const members = {
        [userId]: {
            name: userName,
            email: userEmail,
            role: 'creator',
            joinedAt: Date.now()
        }
    };

    // Add selected members
    selectedMembers.forEach(memberId => {
        const profile = Object.values(allProfiles).find(p => emailToId(p.email) === memberId);
        if (profile) {
            members[memberId] = {
                name: profile.fullName,
                email: profile.email,
                role: 'member',
                joinedAt: Date.now()
            };
        }
    });

    const groupData = {
        name: name,
        course: course,
        description: description || '',
        createdBy: userId,
        createdAt: Date.now(),
        members: members,
        memberCount: Object.keys(members).length
    };

    database.ref('groups').push(groupData)
        .then(() => {
            alert('✅ Group created successfully!');
            closeModal('createGroupModal');
        })
        .catch(err => {
            alert('❌ Error: ' + err.message);
        });
});

// Open add member modal
function openAddMemberModal(groupId) {
    document.getElementById('addMemberGroupId').value = groupId;
    document.getElementById('addMemberModal').classList.add('show');
    loadAddMemberList(groupId);
}

// Load available members for adding
function loadAddMemberList(groupId) {
    const list = document.getElementById('addMemberList');
    const group = myGroups.find(g => g.id === groupId);

    if (!group) return;

    const existingMembers = Object.keys(group.members || {});
    const availableConnections = myConnections.filter(connId => !existingMembers.includes(connId));

    if (availableConnections.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999;">All your connections are already in this group!</p>';
        return;
    }

    if (existingMembers.length >= 3) {
        list.innerHTML = '<p style="text-align: center; color: #999;">Group is full (max 3 members)</p>';
        return;
    }

    const html = availableConnections.map(connId => {
        const profile = Object.values(allProfiles).find(p => emailToId(p.email) === connId);
        if (!profile) return '';

        return `
            <div class="member-select-item">
                <input type="radio" name="newMember" value="${connId}" id="add_member_${connId}">
                <div class="member-avatar">${profile.fullName.charAt(0).toUpperCase()}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #333;">${profile.fullName}</div>
                    <div style="font-size: 12px; color: #666;">${profile.email}</div>
                </div>
            </div>
        `;
    }).join('');

    list.innerHTML = html;
}

// Add member form submit
document.getElementById('addMemberForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const groupId = document.getElementById('addMemberGroupId').value;
    const selectedMember = document.querySelector('input[name="newMember"]:checked')?.value;

    if (!selectedMember) {
        alert('❌ Please select a member to add!');
        return;
    }

    const profile = Object.values(allProfiles).find(p => emailToId(p.email) === selectedMember);
    if (!profile) {
        alert('❌ Member not found!');
        return;
    }

    const memberData = {
        name: profile.fullName,
        email: profile.email,
        role: 'member',
        joinedAt: Date.now()
    };

    database.ref('groups/' + groupId + '/members/' + selectedMember).set(memberData)
        .then(() => {
            // Update member count
            return database.ref('groups/' + groupId).once('value');
        })
        .then((snapshot) => {
            const group = snapshot.val();
            const memberCount = Object.keys(group.members || {}).length;
            return database.ref('groups/' + groupId + '/memberCount').set(memberCount);
        })
        .then(() => {
            alert('✅ Member added successfully!');
            closeModal('addMemberModal');
        })
        .catch(err => {
            alert('❌ Error: ' + err.message);
        });
});

// View group projects
function viewGroupProjects(groupId) {
    // Redirect to project tracker with group filter
    window.location.href = `project-tracker.html?group=${groupId}`;
}

// Leave group
function leaveGroup(groupId, groupName) {
    if (confirm(`⚠️ Leave group "${groupName}"?`)) {
        database.ref('groups/' + groupId + '/members/' + userId).remove()
            .then(() => {
                // Update member count
                return database.ref('groups/' + groupId).once('value');
            })
            .then((snapshot) => {
                const group = snapshot.val();
                if (group && group.members) {
                    const memberCount = Object.keys(group.members).length;
                    return database.ref('groups/' + groupId + '/memberCount').set(memberCount);
                }
            })
            .then(() => {
                alert('✅ You left the group!');
            })
            .catch(err => {
                alert('❌ Error: ' + err.message);
            });
    }
}

// Delete group
function deleteGroup(groupId, groupName) {
    if (confirm(`⚠️ Delete group "${groupName}"? This will remove all members and cannot be undone!`)) {
        database.ref('groups/' + groupId).remove()
            .then(() => {
                alert('✅ Group deleted!');
            })
            .catch(err => {
                alert('❌ Error: ' + err.message);
            });
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Close modals on outside click
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// Fix back button navigation
document.addEventListener('DOMContentLoaded', function() {
    // Find all back buttons
    const backButtons = document.querySelectorAll('.back-btn, button:contains("Back"), [onclick*="back"]');
    
    backButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            // Go back to partners page (main dashboard)
            window.location.href = 'partners.html';
        });
    });
});

// Initialize
init();
console.log('✅ Groups system with fixed back button loaded!');
