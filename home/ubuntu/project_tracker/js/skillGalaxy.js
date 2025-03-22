/**
 * Skill Galaxy Visualization
 * A force-directed graph visualization for skills and their relationships
 * Designed for neurodiverse creatives and non-linear thinkers
 */

class SkillGalaxy {
    constructor(containerId, skills = [], projects = []) {
        this.container = document.getElementById(containerId);
        this.skills = skills;
        this.projects = projects;
        this.nodes = [];
        this.connections = [];
        this.simulation = null;
        this.width = 0;
        this.height = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.isActive = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.createNodes = this.createNodes.bind(this);
        this.createConnections = this.createConnections.bind(this);
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        
        // Initialize if container exists
        if (this.container) {
            this.init();
        }
    }
    
    // Initialize the galaxy visualization
    init() {
        // Set up the container
        this.container.innerHTML = `
            <div class="galaxy-header">
                <h2>Skill Galaxy</h2>
                <button id="closeGalaxyBtn" class="btn">Close Galaxy</button>
            </div>
            <div id="galaxyContainer" class="galaxy-container"></div>
        `;
        
        // Get the galaxy container
        this.galaxyContainer = document.getElementById('galaxyContainer');
        
        // Set up event listeners
        document.getElementById('closeGalaxyBtn').addEventListener('click', this.hide);
        window.addEventListener('resize', this.handleResize);
        
        // Set initial dimensions
        this.handleResize();
        
        // Create nodes and connections
        this.createNodes();
        this.createConnections();
        
        // Set up the simulation
        this.setupSimulation();
    }
    
    // Create nodes for each skill
    createNodes() {
        this.nodes = [];
        
        // Create a node for each skill
        this.skills.forEach(skill => {
            // Count projects using this skill
            const projectCount = this.projects.filter(project => 
                project.skills && project.skills.includes(skill)
            ).length;
            
            // Calculate node size based on project count (min 30, max 80)
            const size = Math.max(30, Math.min(80, 30 + projectCount * 10));
            
            // Create the node
            const node = {
                id: skill,
                label: skill,
                size: size,
                x: this.centerX + (Math.random() - 0.5) * this.width * 0.8,
                y: this.centerY + (Math.random() - 0.5) * this.height * 0.8,
                vx: 0,
                vy: 0
            };
            
            this.nodes.push(node);
        });
    }
    
    // Create connections between skills based on project relationships
    createConnections() {
        this.connections = [];
        
        // Create a map of skills to their indices in the nodes array
        const skillIndices = {};
        this.nodes.forEach((node, index) => {
            skillIndices[node.id] = index;
        });
        
        // For each project, create connections between all pairs of skills
        this.projects.forEach(project => {
            if (!project.skills || project.skills.length < 2) return;
            
            // Create connections between all pairs of skills in this project
            for (let i = 0; i < project.skills.length; i++) {
                for (let j = i + 1; j < project.skills.length; j++) {
                    const skill1 = project.skills[i];
                    const skill2 = project.skills[j];
                    
                    // Skip if either skill is not in the nodes array
                    if (!(skill1 in skillIndices) || !(skill2 in skillIndices)) continue;
                    
                    // Check if this connection already exists
                    const existingConnection = this.connections.find(conn => 
                        (conn.source === skillIndices[skill1] && conn.target === skillIndices[skill2]) ||
                        (conn.source === skillIndices[skill2] && conn.target === skillIndices[skill1])
                    );
                    
                    if (existingConnection) {
                        // Increment the strength of the existing connection
                        existingConnection.strength += 1;
                    } else {
                        // Create a new connection
                        this.connections.push({
                            source: skillIndices[skill1],
                            target: skillIndices[skill2],
                            strength: 1
                        });
                    }
                }
            }
        });
    }
    
    // Set up the force simulation
    setupSimulation() {
        // Create a simple force simulation
        this.simulation = {
            alpha: 1,
            alphaDecay: 0.02,
            alphaMin: 0.001,
            
            // Center force
            centerForce: (node) => {
                node.vx += (this.centerX - node.x) * 0.01;
                node.vy += (this.centerY - node.y) * 0.01;
            },
            
            // Repulsion force between nodes
            repulsionForce: (node1, node2) => {
                const dx = node2.x - node1.x;
                const dy = node2.y - node1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance === 0) return;
                
                // Calculate repulsion (inversely proportional to distance)
                const repulsion = 1000 / (distance * distance);
                
                // Apply force
                const forceX = dx / distance * repulsion;
                const forceY = dy / distance * repulsion;
                
                node1.vx -= forceX;
                node1.vy -= forceY;
                node2.vx += forceX;
                node2.vy += forceY;
            },
            
            // Attraction force for connections
            attractionForce: (connection) => {
                const source = this.nodes[connection.source];
                const target = this.nodes[connection.target];
                
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance === 0) return;
                
                // Calculate attraction (proportional to distance and connection strength)
                const attraction = distance * 0.01 * connection.strength;
                
                // Apply force
                const forceX = dx / distance * attraction;
                const forceY = dy / distance * attraction;
                
                source.vx += forceX;
                source.vy += forceY;
                target.vx -= forceX;
                target.vy -= forceY;
            },
            
            // Update node positions
            updatePositions: () => {
                this.nodes.forEach(node => {
                    // Apply velocity with damping
                    node.x += node.vx * 0.5;
                    node.y += node.vy * 0.5;
                    
                    // Damping
                    node.vx *= 0.9;
                    node.vy *= 0.9;
                    
                    // Boundary constraints
                    const padding = node.size / 2;
                    if (node.x < padding) node.x = padding;
                    if (node.x > this.width - padding) node.x = this.width - padding;
                    if (node.y < padding) node.y = padding;
                    if (node.y > this.height - padding) node.y = this.height - padding;
                });
            },
            
            // Tick the simulation
            tick: () => {
                // Apply center force
                this.nodes.forEach(node => {
                    this.simulation.centerForce(node);
                });
                
                // Apply repulsion forces
                for (let i = 0; i < this.nodes.length; i++) {
                    for (let j = i + 1; j < this.nodes.length; j++) {
                        this.simulation.repulsionForce(this.nodes[i], this.nodes[j]);
                    }
                }
                
                // Apply attraction forces
                this.connections.forEach(connection => {
                    this.simulation.attractionForce(connection);
                });
                
                // Update positions
                this.simulation.updatePositions();
                
                // Update alpha
                this.simulation.alpha *= (1 - this.simulation.alphaDecay);
                
                // Return whether the simulation is still active
                return this.simulation.alpha > this.simulation.alphaMin;
            }
        };
    }
    
    // Update the simulation
    update() {
        if (!this.isActive) return;
        
        // Tick the simulation
        const active = this.simulation.tick();
        
        // Render the nodes and connections
        this.render();
        
        // Continue the animation if the simulation is still active
        if (active || true) { // Always animate for smoother interaction
            requestAnimationFrame(this.update);
        }
    }
    
    // Render the nodes and connections
    render() {
        // Clear the container
        this.galaxyContainer.innerHTML = '';
        
        // Create a document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Render connections first (so they appear behind nodes)
        this.connections.forEach(connection => {
            const source = this.nodes[connection.source];
            const target = this.nodes[connection.target];
            
            // Calculate connection position and dimensions
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            // Create connection element
            const connectionEl = document.createElement('div');
            connectionEl.className = 'skill-connection';
            connectionEl.style.width = `${distance}px`;
            connectionEl.style.height = `${Math.max(1, connection.strength)}px`;
            connectionEl.style.left = `${source.x}px`;
            connectionEl.style.top = `${source.y}px`;
            connectionEl.style.transform = `rotate(${angle}deg)`;
            connectionEl.style.opacity = Math.min(0.8, 0.2 + connection.strength * 0.1);
            
            fragment.appendChild(connectionEl);
        });
        
        // Render nodes
        this.nodes.forEach(node => {
            // Create node element
            const nodeEl = document.createElement('div');
            nodeEl.className = 'skill-node';
            nodeEl.style.width = `${node.size}px`;
            nodeEl.style.height = `${node.size}px`;
            nodeEl.style.left = `${node.x - node.size / 2}px`;
            nodeEl.style.top = `${node.y - node.size / 2}px`;
            nodeEl.style.fontSize = `${Math.max(10, node.size / 5)}px`;
            
            // Add label
            nodeEl.textContent = node.label;
            
            // Add event listeners
            nodeEl.addEventListener('mousedown', (e) => {
                // Enable dragging
                const startX = e.clientX;
                const startY = e.clientY;
                const startNodeX = node.x;
                const startNodeY = node.y;
                
                const onMouseMove = (e) => {
                    node.x = startNodeX + (e.clientX - startX);
                    node.y = startNodeY + (e.clientY - startY);
                    node.vx = 0;
                    node.vy = 0;
                };
                
                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };
                
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
            
            fragment.appendChild(nodeEl);
        });
        
        // Append all elements to the container
        this.galaxyContainer.appendChild(fragment);
    }
    
    // Handle window resize
    handleResize() {
        // Get container dimensions
        const rect = this.galaxyContainer.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        
        // Re-render
        this.render();
    }
    
    // Show the galaxy visualization
    show(skills = null, projects = null) {
        // Update skills and projects if provided
        if (skills !== null) this.skills = skills;
        if (projects !== null) this.projects = projects;
        
        // Create nodes and connections
        this.createNodes();
        this.createConnections();
        
        // Set up the simulation
        this.setupSimulation();
        
        // Show the container
        this.container.classList.remove('hidden');
        
        // Start the animation
        this.isActive = true;
        this.update();
    }
    
    // Hide the galaxy visualization
    hide() {
        // Hide the container
        this.container.classList.add('hidden');
        
        // Stop the animation
        this.isActive = false;
    }
}

// Export the class
window.SkillGalaxy = SkillGalaxy;
