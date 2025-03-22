/**
 * Energy Level Tracker
 * A component for tracking energy levels for neurodivergent awareness
 * Designed for neurodiverse creatives and non-linear thinkers
 */

class EnergyTracker {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentLevel = 'Medium';
        this.history = [];
        
        // Bind methods
        this.init = this.init.bind(this);
        this.render = this.render.bind(this);
        this.setLevel = this.setLevel.bind(this);
        this.addHistoryEntry = this.addHistoryEntry.bind(this);
        this.getHistoryStats = this.getHistoryStats.bind(this);
        
        // Initialize if container exists
        if (this.container) {
            this.init();
        }
    }
    
    // Initialize the energy tracker
    init() {
        // Set up the container
        this.container.innerHTML = `
            <div class="energy-tracker-container">
                <h3>Energy Level Tracker</h3>
                <p>Track your energy levels to work with your natural creative rhythms</p>
                
                <div class="energy-level-selector">
                    <button class="energy-btn energy-high" data-level="High">High</button>
                    <button class="energy-btn energy-medium" data-level="Medium">Medium</button>
                    <button class="energy-btn energy-low" data-level="Low">Low</button>
                    <button class="energy-btn energy-variable" data-level="Variable">Variable</button>
                </div>
                
                <div class="energy-current">
                    <span class="label">Current Energy:</span>
                    <span class="energy-indicator energy-medium"></span>
                    <span class="value">Medium</span>
                </div>
                
                <div class="energy-history">
                    <h4>Energy History</h4>
                    <div class="energy-chart">
                        <!-- Energy history chart will be rendered here -->
                    </div>
                </div>
                
                <div class="energy-stats">
                    <h4>Energy Insights</h4>
                    <div class="stats-container">
                        <!-- Energy statistics will be rendered here -->
                    </div>
                </div>
            </div>
        `;
        
        // Set up event listeners
        const energyButtons = this.container.querySelectorAll('.energy-btn');
        energyButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.setLevel(button.dataset.level);
            });
        });
        
        // Initial render
        this.render();
    }
    
    // Render the energy tracker
    render() {
        // Update current energy display
        const currentEnergyIndicator = this.container.querySelector('.energy-indicator');
        currentEnergyIndicator.className = `energy-indicator energy-${this.currentLevel.toLowerCase()}`;
        
        const currentEnergyValue = this.container.querySelector('.energy-current .value');
        currentEnergyValue.textContent = this.currentLevel;
        
        // Highlight the selected button
        const energyButtons = this.container.querySelectorAll('.energy-btn');
        energyButtons.forEach(button => {
            if (button.dataset.level === this.currentLevel) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
        
        // Render energy history chart
        this.renderHistoryChart();
        
        // Render energy statistics
        this.renderStats();
    }
    
    // Set the current energy level
    setLevel(level) {
        this.currentLevel = level;
        this.addHistoryEntry(level);
        this.render();
        
        // Dispatch an event for other components to listen to
        const event = new CustomEvent('energyLevelChanged', {
            detail: {
                level: level,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(event);
    }
    
    // Add an entry to the energy history
    addHistoryEntry(level) {
        this.history.push({
            level: level,
            timestamp: new Date().toISOString()
        });
        
        // Limit history to last 30 entries
        if (this.history.length > 30) {
            this.history.shift();
        }
        
        // Save history to localStorage
        localStorage.setItem('energyTrackerHistory', JSON.stringify(this.history));
    }
    
    // Load history from localStorage
    loadHistory() {
        const savedHistory = localStorage.getItem('energyTrackerHistory');
        if (savedHistory) {
            try {
                this.history = JSON.parse(savedHistory);
                
                // Set current level to the most recent entry
                if (this.history.length > 0) {
                    this.currentLevel = this.history[this.history.length - 1].level;
                }
                
                this.render();
            } catch (error) {
                console.error('Error loading energy history:', error);
            }
        }
    }
    
    // Render the energy history chart
    renderHistoryChart() {
        const chartContainer = this.container.querySelector('.energy-chart');
        chartContainer.innerHTML = '';
        
        // If there's no history, show a message
        if (this.history.length === 0) {
            chartContainer.innerHTML = '<p>No energy data recorded yet.</p>';
            return;
        }
        
        // Create a simple bar chart
        const chart = document.createElement('div');
        chart.className = 'energy-bar-chart';
        
        // Create bars for each history entry
        this.history.forEach(entry => {
            const bar = document.createElement('div');
            bar.className = `energy-bar energy-${entry.level.toLowerCase()}`;
            
            // Add tooltip with date and time
            const date = new Date(entry.timestamp);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            bar.title = `${entry.level} - ${formattedDate}`;
            
            chart.appendChild(bar);
        });
        
        chartContainer.appendChild(chart);
    }
    
    // Get statistics from energy history
    getHistoryStats() {
        // If there's no history, return empty stats
        if (this.history.length === 0) {
            return {
                mostCommon: 'N/A',
                percentages: {
                    High: 0,
                    Medium: 0,
                    Low: 0,
                    Variable: 0
                },
                total: 0
            };
        }
        
        // Count occurrences of each level
        const counts = {
            High: 0,
            Medium: 0,
            Low: 0,
            Variable: 0
        };
        
        this.history.forEach(entry => {
            counts[entry.level]++;
        });
        
        // Find the most common level
        let mostCommon = 'Medium';
        let maxCount = 0;
        
        for (const level in counts) {
            if (counts[level] > maxCount) {
                mostCommon = level;
                maxCount = counts[level];
            }
        }
        
        // Calculate percentages
        const total = this.history.length;
        const percentages = {};
        
        for (const level in counts) {
            percentages[level] = Math.round((counts[level] / total) * 100);
        }
        
        return {
            mostCommon,
            percentages,
            total
        };
    }
    
    // Render energy statistics
    renderStats() {
        const statsContainer = this.container.querySelector('.stats-container');
        const stats = this.getHistoryStats();
        
        // If there's no history, show a message
        if (stats.total === 0) {
            statsContainer.innerHTML = '<p>No energy data recorded yet.</p>';
            return;
        }
        
        // Render statistics
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="label">Most Common:</span>
                <span class="energy-indicator energy-${stats.mostCommon.toLowerCase()}"></span>
                <span class="value">${stats.mostCommon}</span>
            </div>
            
            <div class="stat-item">
                <span class="label">Distribution:</span>
                <div class="energy-distribution">
                    <div class="energy-bar-high" style="width: ${stats.percentages.High}%"></div>
                    <div class="energy-bar-medium" style="width: ${stats.percentages.Medium}%"></div>
                    <div class="energy-bar-low" style="width: ${stats.percentages.Low}%"></div>
                    <div class="energy-bar-variable" style="width: ${stats.percentages.Variable}%"></div>
                </div>
            </div>
            
            <div class="stat-percentages">
                <div class="stat-percentage">
                    <span class="energy-indicator energy-high"></span>
                    <span>${stats.percentages.High}%</span>
                </div>
                <div class="stat-percentage">
                    <span class="energy-indicator energy-medium"></span>
                    <span>${stats.percentages.Medium}%</span>
                </div>
                <div class="stat-percentage">
                    <span class="energy-indicator energy-low"></span>
                    <span>${stats.percentages.Low}%</span>
                </div>
                <div class="stat-percentage">
                    <span class="energy-indicator energy-variable"></span>
                    <span>${stats.percentages.Variable}%</span>
                </div>
            </div>
            
            <div class="energy-insights">
                <p>Based on your energy patterns, you tend to have <strong>${stats.mostCommon}</strong> energy when working on creative projects.</p>
                <p>Consider scheduling complex tasks during high energy periods and reflective or inspirational activities during lower energy times.</p>
            </div>
        `;
    }
}

// Export the class
window.EnergyTracker = EnergyTracker;
