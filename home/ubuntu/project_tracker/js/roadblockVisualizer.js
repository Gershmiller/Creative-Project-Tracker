/**
 * Roadblock Visualization
 * A component for visualizing different types of roadblocks
 * Designed for neurodiverse creatives and non-linear thinkers
 */

class RoadblockVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.roadblocks = [];
        
        // Roadblock types and their descriptions
        this.roadblockTypes = {
            technical: {
                name: 'Technical Learning',
                description: 'Skills or technical knowledge that need to be acquired',
                color: 'var(--info-color)'
            },
            creative: {
                name: 'Creative Block',
                description: 'Challenges with creative direction or inspiration',
                color: 'var(--warning-color)'
            },
            resource: {
                name: 'Resource Limitation',
                description: 'Missing tools, materials, or resources',
                color: 'var(--danger-color)'
            },
            time: {
                name: 'Time Constraint',
                description: 'Scheduling challenges or deadline pressure',
                color: 'var(--secondary-color)'
            },
            focus: {
                name: 'Focus Challenge',
                description: 'Difficulty maintaining focus or attention',
                color: 'var(--accent-color)'
            }
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.render = this.render.bind(this);
        this.addRoadblock = this.addRoadblock.bind(this);
        this.deleteRoadblock = this.deleteRoadblock.bind(this);
        this.saveRoadblocks = this.saveRoadblocks.bind(this);
        this.loadRoadblocks = this.loadRoadblocks.bind(this);
        
        // Initialize if container exists
        if (this.container) {
            this.init();
        }
    }
    
    // Initialize the roadblock visualizer
    init() {
        // Set up the container
        this.container.innerHTML = `
            <div class="roadblock-visualizer-container">
                <h3>Roadblock Visualizer</h3>
                <p>Identify and track different types of roadblocks in your creative journey</p>
                
                <div class="roadblock-form">
                    <input type="text" id="roadblockDescription" placeholder="Describe the roadblock you're facing...">
                    <div class="roadblock-form-controls">
                        <select id="roadblockType">
                            <option value="technical">Technical Learning</option>
                            <option value="creative">Creative Block</option>
                            <option value="resource">Resource Limitation</option>
                            <option value="time">Time Constraint</option>
                            <option value="focus">Focus Challenge</option>
                        </select>
                        <select id="roadblockProject">
                            <option value="">Select Project (Optional)</option>
                            <!-- Projects will be dynamically added here -->
                        </select>
                        <button id="addRoadblockBtn" class="btn">Add Roadblock</button>
                    </div>
                </div>
                
                <div class="roadblock-legend">
                    <h4>Roadblock Types</h4>
                    <div class="legend-items">
                        <!-- Legend items will be dynamically added here -->
                    </div>
                </div>
                
                <div class="roadblocks-list">
                    <!-- Roadblocks will be rendered here -->
                </div>
            </div>
        `;
        
        // Add legend items
        const legendContainer = this.container.querySelector('.legend-items');
        for (const type in this.roadblockTypes) {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `
                <span class="roadblock-tag roadblock-${type}"></span>
                <span class="legend-label">${this.roadblockTypes[type].name}</span>
            `;
            legendContainer.appendChild(item);
        }
        
        // Set up event listeners
        document.getElementById('addRoadblockBtn').addEventListener('click', () => {
            const description = document.getElementById('roadblockDescription').value.trim();
            const type = document.getElementById('roadblockType').value;
            const projectId = document.getElementById('roadblockProject').value;
            
            if (description) {
                this.addRoadblock(description, type, projectId);
                document.getElementById('roadblockDescription').value = '';
            }
        });
        
        // Load saved roadblocks
        this.loadRoadblocks();
        
        // Initial render
        this.render();
        
        // Listen for project changes
        document.addEventListener('projectsUpdated', this.updateProjectDropdown.bind(this));
    }
    
    // Update the project dropdown
    updateProjectDropdown(event) {
        const projectSelect = document.getElementById('roadblockProject');
        const projects = event.detail.projects || [];
        
        // Save the currently selected value
        const currentValue = projectSelect.value;
        
        // Clear existing options except the first one
        while (projectSelect.options.length > 1) {
            projectSelect.remove(1);
        }
        
        // Add project options
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.title;
            projectSelect.appendChild(option);
        });
        
        // Restore the selected value if it still exists
        if (currentValue && [...projectSelect.options].some(option => option.value === currentValue)) {
            projectSelect.value = currentValue;
        }
    }
    
    // Render the roadblocks list
    render() {
        const roadblocksList = this.container.querySelector('.roadblocks-list');
        roadblocksList.innerHTML = '';
        
        // If there are no roadblocks, show a message
        if (this.roadblocks.length === 0) {
            roadblocksList.innerHTML = '<p class="empty-message">No roadblocks identified yet. Add your first one above!</p>';
            return;
        }
        
        // Sort roadblocks by date (newest first)
        const sortedRoadblocks = [...this.roadblocks].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // Create a card for each roadblock
        sortedRoadblocks.forEach(roadblock => {
            const card = document.createElement('div');
            card.className = 'roadblock-card';
            card.dataset.id = roadblock.id;
            
            // Format date
            const date = new Date(roadblock.timestamp);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            
            // Get project title if available
            let projectTitle = '';
            if (roadblock.projectId) {
                const projectSelect = document.getElementById('roadblockProject');
                const projectOption = [...projectSelect.options].find(option => option.value === roadblock.projectId);
                projectTitle = projectOption ? projectOption.textContent : 'Unknown Project';
            }
            
            card.innerHTML = `
                <div class="roadblock-header">
                    <span class="roadblock-tag roadblock-${roadblock.type}">${this.roadblockTypes[roadblock.type].name}</span>
                    <span class="roadblock-date">${formattedDate}</span>
                </div>
                <div class="roadblock-content">${roadblock.description}</div>
                ${projectTitle ? `<div class="roadblock-project">Project: ${projectTitle}</div>` : ''}
                <div class="roadblock-actions">
                    <button class="btn-link btn-resolve" data-id="${roadblock.id}">Mark as Resolved</button>
                    <button class="btn-link btn-delete" data-id="${roadblock.id}">Delete</button>
                </div>
            `;
            
            // Add event listeners
            card.querySelector('.btn-delete').addEventListener('click', () => {
                this.deleteRoadblock(roadblock.id);
            });
            
            card.querySelector('.btn-resolve').addEventListener('click', () => {
                this.resolveRoadblock(roadblock.id);
            });
            
            roadblocksList.appendChild(card);
        });
    }
    
    // Add a new roadblock
    addRoadblock(description, type, projectId = '') {
        const roadblock = {
            id: this.generateId(),
            description: description,
            type: type,
            projectId: projectId,
            timestamp: new Date().toISOString(),
            resolved: false
        };
        
        this.roadblocks.push(roadblock);
        this.saveRoadblocks();
        this.render();
        
        // Dispatch an event for other components to listen to
        const event = new CustomEvent('roadblockAdded', {
            detail: {
                roadblock: roadblock
            }
        });
        document.dispatchEvent(event);
        
        return roadblock;
    }
    
    // Delete a roadblock
    deleteRoadblock(id) {
        const index = this.roadblocks.findIndex(rb => rb.id === id);
        
        if (index !== -1) {
            const deleted = this.roadblocks.splice(index, 1)[0];
            this.saveRoadblocks();
            this.render();
            
            // Dispatch an event for other components to listen to
            const event = new CustomEvent('roadblockDeleted', {
                detail: {
                    roadblock: deleted
                }
            });
            document.dispatchEvent(event);
        }
    }
    
    // Mark a roadblock as resolved
    resolveRoadblock(id) {
        const roadblock = this.roadblocks.find(rb => rb.id === id);
        
        if (roadblock) {
            roadblock.resolved = true;
            roadblock.resolvedAt = new Date().toISOString();
            this.saveRoadblocks();
            this.render();
            
            // Dispatch an event for other components to listen to
            const event = new CustomEvent('roadblockResolved', {
                detail: {
                    roadblock: roadblock
                }
            });
            document.dispatchEvent(event);
        }
    }
    
    // Save roadblocks to localStorage
    saveRoadblocks() {
        localStorage.setItem('roadblocks', JSON.stringify(this.roadblocks));
    }
    
    // Load roadblocks from localStorage
    loadRoadblocks() {
        const saved = localStorage.getItem('roadblocks');
        
        if (saved) {
            try {
                this.roadblocks = JSON.parse(saved);
            } catch (error) {
                console.error('Error loading roadblocks:', error);
                this.roadblocks = [];
            }
        }
    }
    
    // Generate a unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    // Get all roadblocks
    getAllRoadblocks() {
        return [...this.roadblocks];
    }
    
    // Get roadblocks by project
    getRoadblocksByProject(projectId) {
        return this.roadblocks.filter(rb => rb.projectId === projectId);
    }
    
    // Get roadblock by ID
    getRoadblockById(id) {
        return this.roadblocks.find(rb => rb.id === id);
    }
}

// Export the class
window.RoadblockVisualizer = RoadblockVisualizer;
