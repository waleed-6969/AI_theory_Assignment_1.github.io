// Graph data structure
const graph = {};
const nodePositions = {};

// Canvas setup
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

// Helper function to get random position for new nodes
function getRandomPosition() {
    return {
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * (canvas.height - 100) + 50
    };
}

// Add a path between cities
function addPath(from, to, distance) {
    // Initialize arrays if they don't exist
    if (!graph[from]) graph[from] = [];
    if (!graph[to]) graph[to] = [];
    
    // Add positions if they don't exist
    if (!nodePositions[from]) nodePositions[from] = getRandomPosition();
    if (!nodePositions[to]) nodePositions[to] = getRandomPosition();
    
    // Add bidirectional paths
    graph[from].push({ to: to, distance: distance });
    graph[to].push({ to: from, distance: distance });
    
    drawGraph();
}

// Draw the graph
function drawGraph(path = []) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw edges
    for (let city in graph) {
        const fromPos = nodePositions[city];
        graph[city].forEach(edge => {
            const toPos = nodePositions[edge.to];
            
            // Check if this edge is in the path
            const isInPath = path.some((city, i) => 
                i < path.length - 1 && 
                ((city === edge.to && path[i + 1] === city) || 
                 (city === city && path[i + 1] === edge.to))
            );
            
            // Draw edge
            ctx.beginPath();
            ctx.moveTo(fromPos.x, fromPos.y);
            ctx.lineTo(toPos.x, toPos.y);
            ctx.strokeStyle = isInPath ? 'red' : '#999';
            ctx.lineWidth = isInPath ? 2 : 1;
            ctx.stroke();
            
            // Draw distance
            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;
            ctx.fillStyle = '#666';
            ctx.fillText(edge.distance, midX, midY);
        });
    }
    
    // Draw nodes
    for (let city in nodePositions) {
        const pos = nodePositions[city];
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = path.includes(city) ? '#ffcccc' : 'white';
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(city, pos.x, pos.y);
    }
}

// BFS implementation
function bfs(start, end) {
    const queue = [[start]];
    const visited = new Set();
    
    while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];
        
        if (current === end) {
            return path;
        }
        
        if (!visited.has(current)) {
            visited.add(current);
            for (let neighbor of graph[current]) {
                if (!visited.has(neighbor.to)) {
                    queue.push([...path, neighbor.to]);
                }
            }
        }
    }
    return null;
}

// DFS implementation
function dfs(start, end) {
    const stack = [[start]];
    const visited = new Set();
    
    while (stack.length > 0) {
        const path = stack.pop();
        const current = path[path.length - 1];
        
        if (current === end) {
            return path;
        }
        
        if (!visited.has(current)) {
            visited.add(current);
            for (let neighbor of graph[current]) {
                if (!visited.has(neighbor.to)) {
                    stack.push([...path, neighbor.to]);
                }
            }
        }
    }
    return null;
}

// UCS implementation
function ucs(start, end) {
    const queue = [{ path: [start], cost: 0 }];
    const visited = new Set();
    
    while (queue.length > 0) {
        queue.sort((a, b) => a.cost - b.cost);
        const { path, cost } = queue.shift();
        const current = path[path.length - 1];
        
        if (current === end) {
            return path;
        }
        
        if (!visited.has(current)) {
            visited.add(current);
            for (let neighbor of graph[current]) {
                if (!visited.has(neighbor.to)) {
                    queue.push({
                        path: [...path, neighbor.to],
                        cost: cost + neighbor.distance
                    });
                }
            }
        }
    }
    return null;
}

// Calculate path distance
function calculateDistance(path) {
    let distance = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const current = path[i];
        const next = path[i + 1];
        const edge = graph[current].find(e => e.to === next);
        distance += edge.distance;
    }
    return distance;
}

// Display result
function showResult(path) {
    const resultDiv = document.getElementById('result');
    if (path) {
        const distance = calculateDistance(path);
        resultDiv.innerHTML = `
            Path: ${path.join(' → ')}<br>
            Total Distance: ${distance}
        `;
        drawGraph(path);
    } else {
        resultDiv.innerHTML = 'No path found';
    }
}

// Event Listeners
document.getElementById('addPath').addEventListener('click', () => {
    const from = document.getElementById('fromCity').value.toUpperCase();
    const to = document.getElementById('toCity').value.toUpperCase();
    const distance = parseInt(document.getElementById('distance').value);
    
    if (from && to && !isNaN(distance)) {
        addPath(from, to, distance);
    }
});

document.getElementById('bfsButton').addEventListener('click', () => {
    const start = document.getElementById('startCity').value.toUpperCase();
    const end = document.getElementById('endCity').value.toUpperCase();
    const path = bfs(start, end);
    showResult(path);
});

document.getElementById('dfsButton').addEventListener('click', () => {
    const start = document.getElementById('startCity').value.toUpperCase();
    const end = document.getElementById('endCity').value.toUpperCase();
    const path = dfs(start, end);
    showResult(path);
});

document.getElementById('ucsButton').addEventListener('click', () => {
    const start = document.getElementById('startCity').value.toUpperCase();
    const end = document.getElementById('endCity').value.toUpperCase();
    const path = ucs(start, end);
    showResult(path);
});

document.getElementById('resetButton').addEventListener('click', () => {
    // Clear data structures
    Object.keys(graph).forEach(key => delete graph[key]);
    Object.keys(nodePositions).forEach(key => delete nodePositions[key]);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Clear inputs and result
    document.getElementById('result').innerHTML = '';
    document.getElementById('fromCity').value = '';
    document.getElementById('toCity').value = '';
    document.getElementById('distance').value = '';
    document.getElementById('startCity').value = '';
    document.getElementById('endCity').value = '';
});