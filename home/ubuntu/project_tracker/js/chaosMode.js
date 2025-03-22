/**
 * Chaos Mode
 * A component for presenting projects in a more organic, less structured format
 * Designed for neurodiverse creatives and non-linear thinkers
 */

class ChaosMode {
    constructor() {
        this.isEnabled = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.toggle = this.toggle.bind(this);
        this.applyToProjects = this.applyToProjects.bind(this);
        this.saveState = this.saveState.bind(this);
        this.loadState = this.loadState.bind(this);
        
        // Initialize
        this.init();
    }
    
    // Initialize the chaos mode
    init() {
        // Create the toggle element
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'chaos-toggle';
        toggleContainer.innerHTML = `
            <label class="toggle-switch">
                <input type="checkbox" id="chaosToggle">
                <span class="toggle-slider"></span>
            </label>
            <span>Chaos Mode</span>
        `;
        
        // Add the toggle to the page
        const headerControls = document.querySelector('.header-controls');
        if (headerControls) {
            headerControls.appendChild(toggleContainer);
        }
        
        // Set up event listener
        const toggle = document.getElementById('chaosToggle');
        if (toggle) {
            toggle.addEventListener('change', () => {
                this.toggle(toggle.checked);
            });
        }
        
        // Load saved state
        this.loadState();
    }
    
    // Toggle chaos mode
    toggle(enable) {
        this.isEnabled = enable;
        
        // Apply chaos mode to projects
        this.applyToProjects();
        
        // Save state
        this.saveState();
        
        // Dispatch an event for other components to listen to
        const event = new CustomEvent('chaosModeToggled', {
            detail: {
                enabled: this.isEnabled
            }
        });
        document.dispatchEvent(event);
    }
    
    // Apply chaos mode to projects
    applyToProjects() {
        const dashboard = document.getElementById('dashboard');
        
        if (dashboard) {
            if (this.isEnabled) {
                dashboard.classList.add('chaos-mode');
                
                // Apply random transformations to project cards
                const projectCards = dashboard.querySelectorAll('.project-card');
                projectCards.forEach(card => {
                    // Random rotation between -5 and 5 degrees
                    const rotation = (Math.random() * 10 - 5).toFixed(2);
                    
                    // Random margin
                    const marginTop = (Math.random() * 20).toFixed(2);
                    const marginLeft = (Math.random() * 20).toFixed(2);
                    
                    card.style.setProperty('--random-rotate', `${rotation}deg`);
                    card.style.setProperty('--random-margin', `${marginTop}px ${marginLeft}px`);
                });
            } else {
                dashboard.classList.remove('chaos-mode');
                
                // Remove random transformations
                const projectCards = dashboard.querySelectorAll('.project-card');
                projectCards.forEach(card => {
                    card.style.removeProperty('--random-rotate');
                    card.style.removeProperty('--random-margin');
                });
            }
        }
    }
    
    // Save state to localStorage
    saveState() {
        localStorage.setItem('chaosMode', JSON.stringify({
            enabled: this.isEnabled
        }));
    }
    
    // Load state from localStorage
    loadState() {
        const saved = localStorage.getItem('chaosMode');
        
        if (saved) {
            try {
                const state = JSON.parse(saved);
                this.isEnabled = state.enabled;
                
                // Update the toggle
                const toggle = document.getElementById('chaosToggle');
                if (toggle) {
                    toggle.checked = this.isEnabled;
                }
                
                // Apply chaos mode
                this.applyToProjects();
            } catch (error) {
                console.error('Error loading chaos mode state:', error);
            }
        }
    }
    
    // Check if chaos mode is enabled
    isActive() {
        return this.isEnabled;
    }
}

// Export the class
window.ChaosMode = ChaosMode;
