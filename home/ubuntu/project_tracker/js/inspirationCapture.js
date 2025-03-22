/**
 * Inspiration Capture
 * A component for capturing spontaneous ideas and creative tangents
 * Designed for neurodiverse creatives and non-linear thinkers
 */

class InspirationCapture {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.inspirations = [];
        
        // Bind methods
        this.init = this.init.bind(this);
        this.render = this.render.bind(this);
        this.addInspiration = this.addInspiration.bind(this);
        this.deleteInspiration = this.deleteInspiration.bind(this);
        this.saveInspirations = this.saveInspirations.bind(this);
        this.loadInspirations = this.loadInspirations.bind(this);
        
        // Initialize if container exists
        if (this.container) {
            this.init();
        }
    }
    
    // Initialize the inspiration capture component
    init() {
        // Set up the container
        this.container.innerHTML = `
            <div class="inspiration-capture-container">
                <h3>Inspiration Capture</h3>
                <p>Capture spontaneous ideas and creative tangents as they occur</p>
                
                <div class="inspiration-form">
                    <textarea id="inspirationText" placeholder="Capture your inspiration, idea, or creative tangent here..."></textarea>
                    <div class="inspiration-form-controls">
                        <select id="inspirationType">
                            <option value="idea">Idea</option>
                            <option value="insight">Insight</option>
                            <option value="question">Question</option>
                            <option value="resource">Resource</option>
                            <option value="connection">Connection</option>
                        </select>
                        <button id="addInspirationBtn" class="btn">Capture</button>
                    </div>
                </div>
                
                <div class="inspirations-list">
                    <!-- Inspirations will be rendered here -->
                </div>
            </div>
        `;
        
        // Set up event listeners
        document.getElementById('addInspirationBtn').addEventListener('click', () => {
            const text = document.getElementById('inspirationText').value.trim();
            const type = document.getElementById('inspirationType').value;
            
            if (text) {
                this.addInspiration(text, type);
                document.getElementById('inspirationText').value = '';
            }
        });
        
        // Load saved inspirations
        this.loadInspirations();
        
        // Initial render
        this.render();
    }
    
    // Render the inspirations list
    render() {
        const inspirationsList = this.container.querySelector('.inspirations-list');
        inspirationsList.innerHTML = '';
        
        // If there are no inspirations, show a message
        if (this.inspirations.length === 0) {
            inspirationsList.innerHTML = '<p class="empty-message">No inspirations captured yet. Add your first one above!</p>';
            return;
        }
        
        // Sort inspirations by date (newest first)
        const sortedInspirations = [...this.inspirations].sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // Create a card for each inspiration
        sortedInspirations.forEach(inspiration => {
            const card = document.createElement('div');
            card.className = `inspiration-card inspiration-type-${inspiration.type}`;
            card.dataset.id = inspiration.id;
            
            // Format date
            const date = new Date(inspiration.timestamp);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            
            card.innerHTML = `
                <div class="inspiration-header">
                    <span class="inspiration-type">${this.capitalizeFirstLetter(inspiration.type)}</span>
                    <span class="inspiration-date">${formattedDate}</span>
                </div>
                <div class="inspiration-content">${inspiration.text}</div>
                <div class="inspiration-actions">
                    <button class="btn-link btn-connect" data-id="${inspiration.id}">Connect to Project</button>
                    <button class="btn-link btn-delete" data-id="${inspiration.id}">Delete</button>
                </div>
            `;
            
            // Add event listeners
            card.querySelector('.btn-delete').addEventListener('click', () => {
                this.deleteInspiration(inspiration.id);
            });
            
            card.querySelector('.btn-connect').addEventListener('click', () => {
                // This will be implemented in the main application
                const event = new CustomEvent('connectInspiration', {
                    detail: {
                        inspiration: inspiration
                    }
                });
                document.dispatchEvent(event);
            });
            
            inspirationsList.appendChild(card);
        });
    }
    
    // Add a new inspiration
    addInspiration(text, type) {
        const inspiration = {
            id: this.generateId(),
            text: text,
            type: type,
            timestamp: new Date().toISOString(),
            connected: false
        };
        
        this.inspirations.push(inspiration);
        this.saveInspirations();
        this.render();
        
        // Dispatch an event for other components to listen to
        const event = new CustomEvent('inspirationAdded', {
            detail: {
                inspiration: inspiration
            }
        });
        document.dispatchEvent(event);
        
        return inspiration;
    }
    
    // Delete an inspiration
    deleteInspiration(id) {
        const index = this.inspirations.findIndex(insp => insp.id === id);
        
        if (index !== -1) {
            const deleted = this.inspirations.splice(index, 1)[0];
            this.saveInspirations();
            this.render();
            
            // Dispatch an event for other components to listen to
            const event = new CustomEvent('inspirationDeleted', {
                detail: {
                    inspiration: deleted
                }
            });
            document.dispatchEvent(event);
        }
    }
    
    // Save inspirations to localStorage
    saveInspirations() {
        localStorage.setItem('inspirations', JSON.stringify(this.inspirations));
    }
    
    // Load inspirations from localStorage
    loadInspirations() {
        const saved = localStorage.getItem('inspirations');
        
        if (saved) {
            try {
                this.inspirations = JSON.parse(saved);
            } catch (error) {
                console.error('Error loading inspirations:', error);
                this.inspirations = [];
            }
        }
    }
    
    // Generate a unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    // Capitalize the first letter of a string
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Get all inspirations
    getAllInspirations() {
        return [...this.inspirations];
    }
    
    // Get inspiration by ID
    getInspirationById(id) {
        return this.inspirations.find(insp => insp.id === id);
    }
    
    // Mark inspiration as connected to a project
    markAsConnected(id, projectId) {
        const inspiration = this.getInspirationById(id);
        
        if (inspiration) {
            inspiration.connected = true;
            inspiration.projectId = projectId;
            this.saveInspirations();
            this.render();
        }
    }
}

// Export the class
window.InspirationCapture = InspirationCapture;
