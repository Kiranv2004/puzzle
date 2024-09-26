let puzzle = [];
let size = 4; // Default size of 4x4
const cellSize = 60; // Base size for each cell in pixels
const puzzleGrid = document.getElementById('puzzleGrid');

// Function to create a puzzle of a specific size
function createPuzzle() {
    size = parseInt(document.getElementById('gridSize').value);
    
    // Calculate the width and height based on size and cell size
    const gridWidth = size * cellSize;
    const gridHeight = size * cellSize;

    // Set the puzzle grid dimensions
    puzzleGrid.style.width = `${gridWidth}px`;
    puzzleGrid.style.height = `${gridHeight}px`;

    // Generate the ordered puzzle (1 to size^2 - 1 with one blank)
    puzzle = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
    puzzle.push(null); // The last cell is blank (null)

    renderPuzzle();
}

// Function to render the puzzle grid
function renderPuzzle() {
    puzzleGrid.innerHTML = ''; // Clear the existing grid

    puzzle.forEach((number, index) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', index); // Assign index to track movements

        if (number) {
            cell.textContent = number;
        } else {
            cell.classList.add('blank'); // Blank cell
        }

        puzzleGrid.appendChild(cell);
        setPosition(cell, index); // Set the initial position of the cell
    });
}

// Function to set the position of a cell based on its index
function setPosition(cell, index) {
    let row = Math.floor(index / size);
    let col = index % size;
    cell.style.transform = `translate(${col * cellSize}px, ${row * cellSize}px)`;
}

// Fisher-Yates shuffle algorithm to randomly shuffle the puzzle
function shufflePuzzle() {
    for (let i = puzzle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [puzzle[i], puzzle[j]] = [puzzle[j], puzzle[i]];
    }

    renderPuzzle();
}

// Function to solve the puzzle using A* algorithm
function solvePuzzle() {
    const solutionPath = aStarSolve(); // Get the sequence of moves to solve the puzzle

    if (solutionPath.length > 0) {
        animateSolution(solutionPath); // Animate the solution
    } else {
        alert("No solution found!");
    }
}

// A* algorithm to solve the sliding puzzle
function aStarSolve() {
    const startState = puzzle.slice();
    const goalState = Array.from({ length: size * size - 1 }, (_, i) => i + 1).concat([null]);

    const frontier = new PriorityQueue();
    frontier.enqueue({ state: startState, path: [], cost: 0 }, 0);

    const explored = new Set();
    explored.add(JSON.stringify(startState));

    while (!frontier.isEmpty()) {
        const currentNode = frontier.dequeue();
        const { state, path, cost } = currentNode;

        if (arraysEqual(state, goalState)) {
            return path;
        }

        const blankIndex = state.indexOf(null);
        const validMoves = getValidMoves(blankIndex);

        for (const move of validMoves) {
            const newState = state.slice();
            [newState[blankIndex], newState[move]] = [newState[move], newState[blankIndex]];

            if (!explored.has(JSON.stringify(newState))) {
                const newCost = cost + 1;
                const heuristic = manhattanDistance(newState);
                const totalCost = newCost + heuristic;

                frontier.enqueue({ state: newState, path: path.concat(move), cost: newCost }, totalCost);
                explored.add(JSON.stringify(newState));
            }
        }
    }

    return []; // No solution found
}

// Get valid moves adjacent to the blank space
function getValidMoves(blankIndex) {
    let moves = [];
    let row = Math.floor(blankIndex / size);
    let col = blankIndex % size;

    // Check left, right, up, and down
    if (col > 0) moves.push(blankIndex - 1); // Left
    if (col < size - 1) moves.push(blankIndex + 1); // Right
    if (row > 0) moves.push(blankIndex - size); // Up
    if (row < size - 1) moves.push(blankIndex + size); // Down

    return moves;
}

// Calculate the Manhattan distance as the heuristic
function manhattanDistance(state) {
    let distance = 0;

    for (let i = 0; i < state.length; i++) {
        if (state[i] !== null) {
            const targetRow = Math.floor((state[i] - 1) / size);
            const targetCol = (state[i] - 1) % size;

            const currentRow = Math.floor(i / size);
            const currentCol = i % size;

            distance += Math.abs(targetRow - currentRow) + Math.abs(targetCol - currentCol);
        }
    }

    return distance;
}

// Utility function to check if two arrays are equal
function arraysEqual(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
}

// Animate the solution by moving tiles step by step
function animateSolution(solutionPath) {
    let blankIndex = puzzle.indexOf(null);

    solutionPath.forEach((move, i) => {
        setTimeout(() => {
            [puzzle[blankIndex], puzzle[move]] = [puzzle[move], puzzle[blankIndex]];
            blankIndex = move;
            renderPuzzle();
        }, i * 300); // Adjust speed of animation here
    });
}

// Priority Queue implementation for A* search
class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(item, priority) {
        this.elements.push({ item, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.elements.shift().item;
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}

// Initialize the puzzle when the page loads with the default size
createPuzzle();
