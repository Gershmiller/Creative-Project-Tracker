/**
 * Creative Project Tracker
 * A web application for neurodiverse creatives and non-linear thinkers
 * 
 * This application allows users to:
 * - Track creative projects in a non-linear way
 * - Visualize skills and their interconnections
 * - Document learning resources and inspirations
 * - Track energy levels and emotional states
 * - Capture spontaneous ideas and creative tangents
 */

// Main application class
class CreativeProjectTracker {
    constructor() {
        this.projects = [];
        this.skills = [];
        this.resources = [];
        this.inspirations = [];
        this.roadblocks = [];
        this.initialized = false;
        
        // DOM elements
        this.elements = {
            newProjectBtn: document.getElementById('newProjectBtn'),
            exportDataBtn: document.getElementById('exportDataBtn'),
            importDataBtn: document.getElementById('importDataBtn'),
            skillGalaxyBtn: document.getElementById('skillGalaxyBtn'),
            dashboard: document.getElementById('dashboard'),
            projectModal: document.getElementById('projectModal'),
            skillGalaxyView: document.getElementById('skillGalaxyView')
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.loadData = this.loadData.bind(this);
        this.saveData = this.saveData.bind(this);
        this.exportData = this.exportData.bind(this);
        this.importData = this.importData.bind(this);
        this.renderDashboard = this.renderDashboard.bind(this);
        this.showProjectModal = this.showProjectModal.bind(this);
        this.hideProjectModal = this.hideProjectModal.bind(this);
        this.createProject = this.createProject.bind(this);
        this.updateProject = this.updateProject.bind(this);
        this.deleteProject = this.deleteProject.bind(this);
        this.handleInspirationAdded = this.handleInspirationAdded.bind(this);
        this.handleRoadblockAdded = this.handleRoadblockAdded.bind(this);
        this.handleEnergyLevelChanged = this.handleEnergyLevelChanged.bind(this);
        this.handleChaosModeToggled = this.handleChaosModeToggled.bind(this);
        this.connectInspirationToProject = this.connectInspirationToProject.bind(this);
        
        // Initialize the application
        this.init();
    }
    
    // Initialize the application
    init() {
        if (this.initialized) return;
        
        // Load data from localStorage
        this.loadData();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Render the dashboard
        this.renderDashboard();
        
        // Notify other components about projects
        this.notifyProjectsUpdated();
        
        this.initialized = true;
        console.log('Creative Project Tracker initialized');
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Button event listeners
        this.elements.newProjectBtn.addEventListener('click', this.showProjectModal);
        this.elements.exportDataBtn.addEventListener('click', this.exportData);
        this.elements.importDataBtn.addEventListener('click', this.importData);
        
        // Custom event listeners
        document.addEventListener('inspirationAdded', this.handleInspirationAdded);
        document.addEventListener('roadblockAdded', this.handleRoadblockAdded);
        document.addEventListener('energyLevelChanged', this.handleEnergyLevelChanged);
        document.addEventListener('chaosModeToggled', this.handleChaosModeToggled);
        document.addEventListener('connectInspiration', (event) => {
            this.showConnectInspirationModal(event.detail.inspiration);
        });
    }
    
    // Load data from localStorage
    loadData() {
        try {
            const data = localStorage.getItem('creativeProjectTracker');
            if (data) {
                const parsedData = JSON.parse(data);
                this.projects = parsedData.projects || [];
                this.skills = parsedData.skills || [];
                this.resources = parsedData.resources || [];
                this.inspirations = parsedData.inspirations || [];
                this.roadblocks = parsedData.roadblocks || [];
                console.log('Data loaded from localStorage');
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        }
    }
    
    // Save data to localStorage
    saveData() {
        try {
            const data = {
                projects: this.projects,
                skills: this.skills,
                resources: this.resources,
                inspirations: this.inspirations,
                roadblocks: this.roadblocks
            };
            localStorage.setItem('creativeProjectTracker', JSON.stringify(data));
            console.log('Data saved to localStorage');
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
        }
    }
    
    // Export data as JSON file
    exportData() {
        try {
            // Collect data from all components
            const inspirations = window.inspirationCapture ? window.inspirationCapture.getAllInspirations() : [];
            const roadblocks = window.roadblockVisualizer ? window.roadblockVisualizer.getAllRoadblocks() : [];
            
            const data = {
                projects: this.projects,
                skills: this.skills,
                resources: this.resources,
                inspirations: inspirations,
                roadblocks: roadblocks,
                exportDate: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            
            const exportFileDefaultName = 'creative-project-tracker-export.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            console.log('Data exported as JSON file');
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    }
    
    // Import data from JSON file
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    // Validate the data structure
                    if (data.projects && Array.isArray(data.projects)) {
                        this.projects = data.projects;
                        this.skills = data.skills || [];
                        this.resources = data.resources || [];
                        
                        // Import inspirations if available
                        if (data.inspirations && Array.isArray(data.inspirations) && window.inspirationCapture) {
                            // Clear existing inspirations
                            window.inspirationCapture.inspirations = data.inspirations;
                            window.inspirationCapture.saveInspirations();
                            window.inspirationCapture.render();
                        }
                        
                        // Import roadblocks if available
                        if (data.roadblocks && Array.isArray(data.roadblocks) && window.roadblockVisualizer) {
                            // Clear existing roadblocks
                            window.roadblockVisualizer.roadblocks = data.roadblocks;
                            window.roadblockVisualizer.saveRoadblocks();
                            window.roadblockVisualizer.render();
                        }
                        
                        // Save the imported data
                        this.saveData();
                        
                        // Re-render the dashboard
                        this.renderDashboard();
                        
                        // Notify other components about projects
                        this.notifyProjectsUpdated();
                        
                        console.log('Data imported successfully');
                    } else {
                        console.error('Invalid data structure in imported file');
                    }
                } catch (error) {
                    console.error('Error parsing imported file:', error);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    // Notify other components about projects
    notifyProjectsUpdated() {
        const event = new CustomEvent('projectsUpdated', {
            detail: {
                projects: this.projects
            }
        });
        document.dispatchEvent(event);
    }
    
    // Render the dashboard
    renderDashboard() {
        // Clear the dashboard
        this.elements.dashboard.innerHTML = '';
        
        // If there are no projects, show a message
        if (this.projects.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.innerHTML = `
                <h3>No Projects Yet</h3>
                <p>Click the "New Project" button to get started on your creative journey.</p>
            `;
            this.elements.dashboard.appendChild(emptyMessage);
            return;
        }
        
        // Render each project
        this.projects.forEach(project => {
            const projectCard = this.createProjectCard(project);
            this.elements.dashboard.appendChild(projectCard);
        });
        
        // Apply chaos mode if enabled
        if (window.chaosMode && window.chaosMode.isActive()) {
            window.chaosMode.applyToProjects();
        }
    }
    
    // Create a project card element
    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'card project-card';
        card.dataset.id = project.id;
        
        // Calculate the project status
        const statusClass = this.getStatusClass(project.status);
        
        // Get energy indicator class
        const energyClass = project.energyLevel ? `energy-${project.energyLevel.toLowerCase()}` : '';
        
        // Get roadblocks for this project
        let roadblocksHtml = '';
        if (window.roadblockVisualizer) {
            const projectRoadblocks = window.roadblockVisualizer.getRoadblocksByProject(project.id);
            if (projectRoadblocks && projectRoadblocks.length > 0) {
                roadblocksHtml = `
                    <div class="project-roadblocks">
                        <span class="label">Roadblocks:</span>
                        <div class="roadblock-tags">
                            ${projectRoadblocks.slice(0, 3).map(rb => `
                                <span class="roadblock-tag roadblock-${rb.type}">${window.roadblockVisualizer.roadblockTypes[rb.type].name}</span>
                            `).join('')}
                            ${projectRoadblocks.length > 3 ? `<span class="roadblock-tag">+${projectRoadblocks.length - 3} more</span>` : ''}
                        </div>
                    </div>
                `;
            }
        }
        
        card.innerHTML = `
            <div class="project-header">
                <h3>${project.title}</h3>
                <div class="project-status ${statusClass}">${project.status}</div>
            </div>
            <div class="project-description">${project.description}</div>
            <div class="project-meta">
                <div class="project-energy">
                    <span class="label">Energy:</span>
                    <span class="energy-indicator ${energyClass}"></span>
                    <span class="value">${project.energyLevel || 'Not set'}</span>
                </div>
                <div class="project-skills">
                    <span class="label">Skills:</span>
                    <span class="value">${this.formatSkillsList(project.skills)}</span>
                </div>
                ${roadblocksHtml}
            </div>
            <div class="project-actions">
                <button class="btn btn-edit" data-id="${project.id}">Edit</button>
                <button class="btn btn-delete" data-id="${project.id}">Delete</button>
                <button class="btn btn-view-skills" data-id="${project.id}">View Skills</button>
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.btn-edit').addEventListener('click', () => {
            this.showProjectModal(project);
        });
        
        card.querySelector('.btn-delete').addEventListener('click', () => {
            this.deleteProject(project.id);
        });
        
        card.querySelector('.btn-view-skills').addEventListener('click', () => {
            // Show skill galaxy with focus on this project's skills
            if (window.skillGalaxy) {
                window.skillGalaxy.show(this.skills, [project]);
            }
        });
        
        return card;
    }
    
    // Get the CSS class for a project status
    getStatusClass(status) {
        const statusMap = {
            'Active': 'status-active',
            'Paused': 'status-paused',
            'Dormant': 'status-dormant',
            'Completed': 'status-completed',
            'Abandoned': 'status-abandoned',
            'Idea': 'status-idea'
        };
        
        return statusMap[status] || 'status-unknown';
    }
    
    // Format a list of skills for display
    formatSkillsList(skills) {
        if (!skills || skills.length === 0) {
            return 'None';
        }
        
        return skills.slice(0, 3).join(', ') + (skills.length > 3 ? '...' : '');
    }
    
    // Show the project modal for creating or editing a project
    showProjectModal(project = null) {
        // Populate the modal with the project data or empty form
        this.elements.projectModal.innerHTML = this.createProjectForm(project);
        
        // Show the modal
        this.elements.projectModal.classList.remove('hidden');
        
        // Add event listeners
        const form = this.elements.projectModal.querySelector('form');
        form.addEventListener('submit', e => {
            e.preventDefault();
            
            const formData = new FormData(form);
            
            // Process skills (comma-separated)
            const skillsInput = formData.get('skills');
            const skills = skillsInput ? skillsInput.split(',').map(s => s.trim()).filter(s => s) : [];
            
            // Process resources (comma-separated)
            const resourcesInput = formData.get('resources');
            const resources = resourcesInput ? resourcesInput.split(',').map(r => r.trim()).filter(r => r) : [];
            
            // Process inspirations (comma-separated)
            const inspirationsInput = formData.get('inspirations');
            const inspirations = inspirationsInput ? inspirationsInput.split(',').map(i => i.trim()).filter(i => i) : [];
            
            // Process roadblocks (comma-separated)
            const roadblocksInput = formData.get('roadblocks');
            const roadblocks = roadblocksInput ? roadblocksInput.split(',').map(r => r.trim()).filter(r => r) : [];
            
            const projectData = {
                id: fo<response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>