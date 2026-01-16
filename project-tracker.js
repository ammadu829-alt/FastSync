// project-tracker.js - Shared Project Timeline & Milestone Tracker

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
let database;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    database = firebase.database();
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    alert('Error connecting to database. Please check your Firebase configuration.');
}

// Get user info
const userEmail = localStorage.getItem('userEmail');
const userName = localStorage.getItem('userName');
const userId = userEmail ? emailToId(userEmail) : null;

let allProjects = [];
let currentProjectId = null;
let myConnections = [];

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

    loadUserConnections();
    loadSharedProjects(); // Changed from loadProjects
}

// Load user's connections for partner selection
function loadUserConnections() {
    if (!userId) return;

    database.ref('connections/' + userId).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            myConnections = Object.keys(data).filter(id => id !== userId && data[id] === true);
        }
        loadPartnerOptions();
    }, (error) => {
        console.error('Error loading connections:', error);
    });
}

// Load partner options in dropdown - WITH GROUP SUPPORT
function loadPartnerOptions() {
    const partnerSelect = document.getElementById('projectPartner');
    if (!partnerSelect) return;

    partnerSelect.innerHTML = '<option value="">Individual Project</option>';

    // Load groups first
    database.ref('groups').once('value', (snapshot) => {
        const groups = snapshot.val();
        if (groups) {
            const myGroups = Object.entries(groups)
                .filter(([id, group]) => {
                    return group.members && Object.keys(group.members).includes(userId);
                })
                .map(([id, group]) => ({...group, id}));

            if (myGroups.length > 0) {
                myGroups.forEach(group => {
                    const option = document.createElement('option');
                    option.value = `group_${group.id}`;
                    option.textContent = `📁 ${group.name} (${group.memberCount} members)`;
                    partnerSelect.appendChild(option);
                });
            }
        }

        // Then load individual connections
        loadIndividualConnections(partnerSelect);
    });
}

function loadIndividualConnections(selectElement) {
    if (myConnections.length === 0) return;

    database.ref('profiles').once('value', (snapshot) => {
        const profiles = snapshot.val();
        if (!profiles) return;

        myConnections.forEach(connId => {
            const profile = Object.values(profiles).find(p => emailToId(p.email) === connId);
            if (profile) {
                const option = document.createElement('option');
                option.value = connId;
                option.textContent = `👤 ${profile.fullName} (${profile.rollNumber})`;
                selectElement.appendChild(option);
            }
        });
    });
}

// ============================================
// LOAD SHARED PROJECTS - Only projects where user has access
// ============================================
function loadSharedProjects() {
    if (!userId) return;

    console.log('🔍 Loading shared projects for user:', userId);

    database.ref('projects').on('value', (snapshot) => {
        const data = snapshot.val();
        allProjects = [];

        if (data) {
            Object.entries(data).forEach(([id, project]) => {
                // Check if user has access to this project
                if (hasProjectAccess(project)) {
                    allProjects.push({...project, id});
                }
            });
        }

        console.log('✅ Found', allProjects.length, 'accessible projects');
        displayProjects();
    });
}

// ============================================
// CHECK PROJECT ACCESS - Core permission system
// ============================================
function hasProjectAccess(project) {
    // 1. Creator always has access
    if (project.userId === userId) {
        return true;
    }

    // 2. If project has sharedWith array, check if user is in it
    if (project.sharedWith && project.sharedWith.includes(userId)) {
        return true;
    }

    // 3. If project is assigned to a group, check if user is in that group
    if (project.groupId && project.groupMembers) {
        if (project.groupMembers.includes(userId)) {
            return true;
        }
    }

    // 4. If individual partner, check if user is the partner
    if (project.partnerId === userId) {
        return true;
    }

    return false;
}

// Display projects
function displayProjects() {
    const grid = document.getElementById('projectsGrid');
    
    if (allProjects.length === 0) {
        grid.innerHTML = `
            <div class="no-projects">
                <div class="no-projects-icon">📁</div>
                <h3>No Projects Yet</h3>
                <p>Create your first project to start tracking milestones</p>
                <button class="btn btn-primary" onclick="openCreateProjectModal()">
                    <i class="bi bi-plus-circle"></i> Create Project
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = allProjects.map(project => createProjectCard(project)).join('');
}

// Create project card HTML
function createProjectCard(project) {
    const progress = calculateProjectProgress(project);
    const deadline = new Date(project.deadline);
    const today = new Date();
    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    
    let statusClass = 'status-active';
    let statusText = 'Active';
    let cardClass = 'active';
    
    if (project.status === 'completed') {
        statusClass = 'status-completed';
        statusText = 'Completed';
        cardClass = 'completed';
    } else if (daysLeft < 0) {
        statusClass = 'status-pending';
        statusText = 'Overdue';
    }

    // Determine if user is creator
    const isCreator = project.userId === userId;
    const roleText = isCreator ? '👑 Created by You' : '🤝 Shared with You';

    return `
        <div class="project-card ${cardClass}" onclick="viewProject('${project.id}')">
            <div class="project-header">
                <h3 class="project-title">${project.title}</h3>
                <span class="project-status ${statusClass}">${statusText}</span>
            </div>
            
            <div class="project-partner" style="font-size: 12px; color: #666; margin-bottom: 8px;">
                ${roleText}
            </div>
            
            ${project.partnerName ? `
                <div class="project-partner">
                    <div class="partner-avatar">${project.partnerName.charAt(0)}</div>
                    <span>With ${project.partnerName}</span>
                </div>
            ` : ''}
            
            ${project.groupName ? `
                <div class="project-partner">
                    <i class="bi bi-people-fill"></i>
                    <span>Group: ${project.groupName}</span>
                </div>
            ` : ''}
            
            <div class="project-partner">
                <i class="bi bi-book"></i>
                ${project.course}
            </div>
            
            <div class="project-deadline">
                <i class="bi bi-calendar-event"></i>
                Deadline: ${formatDate(deadline)} ${daysLeft >= 0 ? `(${daysLeft} days left)` : '(Overdue)'}
            </div>
            
            <div class="project-progress">
                <div class="progress">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">${progress}% Complete</div>
            </div>
            
            <div class="project-actions" onclick="event.stopPropagation()">
                <button class="btn btn-primary btn-sm" onclick="viewProject('${project.id}')">
                    <i class="bi bi-eye"></i> View
                </button>
                ${isCreator ? `
                    <button class="btn btn-warning btn-sm" onclick="editProject('${project.id}')">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProject('${project.id}', '${project.title}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// Calculate project progress
function calculateProjectProgress(project) {
    if (!project.milestones || Object.keys(project.milestones).length === 0) {
        return 0;
    }

    const milestones = Object.values(project.milestones);
    const completed = milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
}

// View project timeline
function viewProject(projectId) {
    currentProjectId = projectId;
    const project = allProjects.find(p => p.id === projectId);
    
    if (!project) return;

    document.getElementById('projectsSection').style.display = 'none';
    document.getElementById('timelineSection').classList.add('active');
    document.getElementById('timelineTitle').textContent = project.title;
    
    loadMilestones(projectId);
}

// Back to projects
function backToProjects() {
    document.getElementById('projectsSection').style.display = 'block';
    document.getElementById('timelineSection').classList.remove('active');
    currentProjectId = null;
}

// Load milestones
function loadMilestones(projectId) {
    database.ref('projects/' + projectId + '/milestones').on('value', (snapshot) => {
        const data = snapshot.val();
        const milestones = data ? Object.entries(data).map(([id, val]) => ({...val, id})) : [];
        
        // Sort by deadline
        milestones.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        
        displayMilestones(milestones);
    });
}

// Display milestones
function displayMilestones(milestones) {
    const container = document.getElementById('timelineContainer');
    
    if (milestones.length === 0) {
        container.innerHTML = `
            <div class="timeline-line"></div>
            <div class="no-projects">
                <div class="no-projects-icon">📋</div>
                <h3>No Milestones Yet</h3>
                <p>Add your first milestone to track project progress</p>
                <button class="btn btn-primary" onclick="openAddMilestoneModal()">
                    <i class="bi bi-plus-circle"></i> Add Milestone
                </button>
            </div>
        `;
        return;
    }

    const milestonesHTML = milestones.map(milestone => createMilestoneHTML(milestone)).join('');
    container.innerHTML = '<div class="timeline-line"></div>' + milestonesHTML;
}

// Create milestone HTML
function createMilestoneHTML(milestone) {
    const deadline = new Date(milestone.deadline);
    const today = new Date();
    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    
    let statusClass = '';
    let statusText = '';
    let icon = '○';
    
    if (milestone.status === 'completed') {
        statusClass = 'completed';
        statusText = 'Completed';
        icon = '✓';
    } else if (milestone.status === 'in-progress') {
        statusClass = 'in-progress';
        statusText = 'In Progress';
        icon = '⏳';
    } else if (daysLeft < 0) {
        statusClass = 'overdue';
        statusText = 'Overdue';
        icon = '!';
    } else {
        statusText = 'Pending';
        icon = '○';
    }

    const priorityColors = {
        low: '#28a745',
        medium: '#ffc107',
        high: '#dc3545'
    };

    return `
        <div class="milestone ${statusClass}">
            <div class="milestone-icon">${icon}</div>
            
            <div class="milestone-header">
                <h3 class="milestone-title">${milestone.title}</h3>
                <span class="milestone-status" style="background: ${priorityColors[milestone.priority] || '#6c757d'}; color: white;">
                    ${statusText}
                </span>
            </div>
            
            ${milestone.description ? `
                <p class="milestone-description">${milestone.description}</p>
            ` : ''}
            
            <div class="milestone-meta">
                <div class="milestone-meta-item">
                    <i class="bi bi-calendar-event"></i>
                    <span>Due: ${formatDate(deadline)}</span>
                </div>
                <div class="milestone-meta-item">
                    <i class="bi bi-clock"></i>
                    <span>${daysLeft >= 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`}</span>
                </div>
                <div class="milestone-meta-item">
                    <i class="bi bi-flag"></i>
                    <span>${milestone.priority.charAt(0).toUpperCase() + milestone.priority.slice(1)} Priority</span>
                </div>
            </div>
            
            <div class="milestone-actions">
                ${milestone.status !== 'completed' ? `
                    <button class="btn btn-success btn-sm" onclick="updateMilestoneStatus('${milestone.id}', 'completed')">
                        <i class="bi bi-check-circle"></i> Mark Complete
                    </button>
                ` : ''}
                ${milestone.status === 'pending' ? `
                    <button class="btn btn-primary btn-sm" onclick="updateMilestoneStatus('${milestone.id}', 'in-progress')">
                        <i class="bi bi-play-circle"></i> Start
                    </button>
                ` : ''}
                <button class="btn btn-danger btn-sm" onclick="deleteMilestone('${milestone.id}', '${milestone.title}')">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

// Format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Open create project modal
function openCreateProjectModal() {
    const modal = document.getElementById('createProjectModal');
    const form = document.getElementById('createProjectForm');
    
    if (!modal || !form) {
        console.error('Modal or form not found!');
        return;
    }
    
    modal.classList.add('show');
    form.reset();
    
    // Get or create editProjectId input and clear it
    let editProjectIdInput = document.getElementById('editProjectId');
    if (!editProjectIdInput) {
        editProjectIdInput = document.createElement('input');
        editProjectIdInput.type = 'hidden';
        editProjectIdInput.id = 'editProjectId';
        form.appendChild(editProjectIdInput);
    }
    editProjectIdInput.value = '';
    
    // Update modal title
    const modalTitle = document.getElementById('projectModalTitle');
    const submitBtn = document.getElementById('projectSubmitBtn');
    
    if (modalTitle) modalTitle.textContent = 'Create New Project';
    if (submitBtn) submitBtn.textContent = 'Create Project';
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    const deadlineInput = document.getElementById('projectDeadline');
    if (deadlineInput) deadlineInput.setAttribute('min', today);
}

// Open add milestone modal
function openAddMilestoneModal() {
    if (!currentProjectId) return;
    
    document.getElementById('addMilestoneModal').classList.add('show');
    document.getElementById('addMilestoneForm').reset();
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('milestoneDeadline').setAttribute('min', today);
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// ============================================
// EDIT PROJECT FUNCTION
// ============================================
window.editProject = function(projectId) {
    const project = allProjects.find(p => p.id === projectId);
    if (!project) {
        console.error('Project not found:', projectId);
        return;
    }
    
    // Check if user is creator
    if (project.userId !== userId) {
        alert('❌ Only the project creator can edit project details!');
        return;
    }
    
    console.log('📝 Editing project:', project);
    
    // Get or create editProjectId input
    let editProjectIdInput = document.getElementById('editProjectId');
    if (!editProjectIdInput) {
        editProjectIdInput = document.createElement('input');
        editProjectIdInput.type = 'hidden';
        editProjectIdInput.id = 'editProjectId';
        document.getElementById('createProjectForm').appendChild(editProjectIdInput);
    }
    
    // Fill form with existing data
    editProjectIdInput.value = projectId;
    
    const titleInput = document.getElementById('projectTitle');
    const courseInput = document.getElementById('projectCourse');
    const deadlineInput = document.getElementById('projectDeadline');
    const descriptionInput = document.getElementById('projectDescription');
    const partnerInput = document.getElementById('projectPartner');
    
    if (titleInput) titleInput.value = project.title;
    if (courseInput) courseInput.value = project.course;
    if (deadlineInput) deadlineInput.value = project.deadline;
    if (descriptionInput) descriptionInput.value = project.description || '';
    
    // Set partner/group selection
    if (partnerInput) {
        if (project.groupId) {
            partnerInput.value = `group_${project.groupId}`;
        } else if (project.partnerId) {
            partnerInput.value = project.partnerId;
        } else {
            partnerInput.value = '';
        }
    }
    
    // Update modal title and button
    const modalTitle = document.getElementById('projectModalTitle');
    const submitBtn = document.getElementById('projectSubmitBtn');
    
    if (modalTitle) modalTitle.textContent = 'Edit Project';
    if (submitBtn) submitBtn.textContent = 'Update Project';
    
    // Open modal
    const modal = document.getElementById('createProjectModal');
    if (modal) {
        modal.classList.add('show');
    } else {
        console.error('Modal not found!');
    }
};

// ============================================
// CREATE/UPDATE PROJECT FORM SUBMIT
// ============================================
document.getElementById('createProjectForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get or find editProjectId input
    let editProjectIdInput = document.getElementById('editProjectId');
    const editProjectId = editProjectIdInput ? editProjectIdInput.value : '';
    
    const titleInput = document.getElementById('projectTitle');
    const courseInput = document.getElementById('projectCourse');
    const partnerInput = document.getElementById('projectPartner');
    const deadlineInput = document.getElementById('projectDeadline');
    const descriptionInput = document.getElementById('projectDescription');
    
    if (!titleInput || !courseInput || !deadlineInput) {
        console.error('Required form fields not found!');
        alert('❌ Error: Form fields not found. Please refresh the page.');
        return;
    }
    
    const title = titleInput.value;
    const course = courseInput.value;
    const partnerSelection = partnerInput ? partnerInput.value : '';
    const deadline = deadlineInput.value;
    const description = descriptionInput ? descriptionInput.value : '';
    
    console.log('📝 Saving project...', {editProjectId, title, partnerSelection});
    
    // Determine if it's a group or individual project
    let isGroup = partnerSelection.startsWith('group_');
    let groupId = null;
    let partnerId = null;
    
    if (isGroup) {
        groupId = partnerSelection.replace('group_', '');
    } else if (partnerSelection) {
        partnerId = partnerSelection;
    }
    
    const projectData = {
        userId: userId,
        userName: userName,
        title: title,
        course: course,
        deadline: deadline,
        description: description || '',
        status: 'active',
        updatedAt: Date.now()
    };
    
    // Add creation timestamp only for new projects
    if (!editProjectId) {
        projectData.createdAt = Date.now();
    }
    
    if (isGroup) {
        // Load group data and set shared access
        database.ref('groups/' + groupId).once('value', (snapshot) => {
            const group = snapshot.val();
            if (group) {
                projectData.groupId = groupId;
                projectData.groupName = group.name;
                projectData.groupMembers = Object.keys(group.members);
                projectData.sharedWith = Object.keys(group.members).filter(id => id !== userId);
                projectData.partnerName = `Group: ${group.name}`;
                projectData.partnerId = null;
            }
            saveOrUpdateProject(projectData, editProjectId);
        });
    } else if (partnerId) {
        // Load individual partner data
        database.ref('profiles').once('value', (snapshot) => {
            const profiles = snapshot.val();
            if (profiles) {
                const profile = Object.values(profiles).find(p => emailToId(p.email) === partnerId);
                if (profile) {
                    projectData.partnerId = partnerId;
                    projectData.partnerName = profile.fullName;
                    projectData.sharedWith = [partnerId];
                    projectData.groupId = null;
                    projectData.groupName = null;
                    projectData.groupMembers = null;
                }
            }
            saveOrUpdateProject(projectData, editProjectId);
        });
    } else {
        // Individual project (no partner)
        projectData.partnerId = null;
        projectData.partnerName = null;
        projectData.groupId = null;
        projectData.groupName = null;
        projectData.groupMembers = null;
        projectData.sharedWith = [];
        saveOrUpdateProject(projectData, editProjectId);
    }
});

// Save or update project
function saveOrUpdateProject(projectData, editProjectId) {
    if (editProjectId) {
        // Update existing project
        database.ref('projects/' + editProjectId).update(projectData)
            .then(() => {
                alert('✅ Project updated successfully!');
                closeModal('createProjectModal');
            })
            .catch(err => {
                alert('❌ Error updating project: ' + err.message);
            });
    } else {
        // Create new project
        database.ref('projects').push(projectData)
            .then(() => {
                alert('✅ Project created successfully!');
                closeModal('createProjectModal');
            })
            .catch(err => {
                alert('❌ Error creating project: ' + err.message);
            });
    }
}

// Add milestone form submit
document.getElementById('addMilestoneForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!currentProjectId) return;
    
    const title = document.getElementById('milestoneTitle').value;
    const description = document.getElementById('milestoneDescription').value;
    const deadline = document.getElementById('milestoneDeadline').value;
    const priority = document.getElementById('milestonePriority').value;
    const status = document.getElementById('milestoneStatus').value;
    
    const milestoneData = {
        title: title,
        description: description || '',
        deadline: deadline,
        priority: priority,
        status: status,
        createdAt: Date.now(),
        createdBy: userId,
        createdByName: userName
    };
    
    database.ref('projects/' + currentProjectId + '/milestones').push(milestoneData)
        .then(() => {
            alert('✅ Milestone added successfully!');
            closeModal('addMilestoneModal');
        })
        .catch(err => {
            alert('❌ Error: ' + err.message);
        });
});

// Update milestone status
function updateMilestoneStatus(milestoneId, newStatus) {
    if (!currentProjectId) return;
    
    database.ref('projects/' + currentProjectId + '/milestones/' + milestoneId).update({
        status: newStatus,
        updatedAt: Date.now(),
        updatedBy: userId
    })
    .then(() => {
        console.log('✅ Milestone status updated');
    })
    .catch(err => {
        alert('❌ Error: ' + err.message);
    });
}

// Delete milestone
function deleteMilestone(milestoneId, milestoneTitle) {
    if (!currentProjectId) return;
    
    if (confirm(`⚠️ Delete milestone "${milestoneTitle}"?`)) {
        database.ref('projects/' + currentProjectId + '/milestones/' + milestoneId).remove()
            .then(() => {
                alert('✅ Milestone deleted!');
            })
            .catch(err => {
                alert('❌ Error: ' + err.message);
            });
    }
}

// Delete project
function deleteProject(projectId, projectTitle) {
    const project = allProjects.find(p => p.id === projectId);
    
    if (!project) return;
    
    // Only creator can delete
    if (project.userId !== userId) {
        alert('❌ Only the project creator can delete this project!');
        return;
    }
    
    if (confirm(`⚠️ Delete project "${projectTitle}" and all its milestones?\n\nThis will remove it for all shared members.`)) {
        database.ref('projects/' + projectId).remove()
            .then(() => {
                alert('✅ Project deleted!');
            })
            .catch(err => {
                alert('❌ Error: ' + err.message);
            });
    }
}

// Close modals on outside click
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// Initialize
init();
console.log('✅ Shared Project Tracker with Access Control loaded!');
