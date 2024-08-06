class Cell {
    constructor(id, isBomb = false) {
        this.id = id;
        this.isBomb = isBomb;
        this.revealed = false;
        this.flagged = false;
        this.element = document.createElement('div');
        this.element.classList.add('cell');

        const row = Math.floor(id / Game.width);
        const col = id % Game.width;
        if ((row + col) % 2 === 0) {
            this.element.classList.add('cell1');
        } else {
            this.element.classList.add('cell2');
        }

        this.element.setAttribute('data-id', id);
        this.element.addEventListener('click', (event) => Game.instance.revealCell(this));
        this.element.addEventListener('contextmenu', (event) => Game.instance.flagCell(this, event));
    }

    reveal() {
        if (this.revealed || this.flagged) return;
        this.revealed = true;
        if (this.isBomb) {
            this.element.classList.add('revealedBomb');
        } else {
            if (this.element.classList.contains('cell1')) {
                this.element.classList.add('revealed1');
            } else if (this.element.classList.contains('cell2')) {
                this.element.classList.add('revealed2');
            }
        }
    }

    flag() {
        if (this.revealed) return;
        this.flagged = !this.flagged;
        this.element.classList.toggle('flagged');
    }
}

class Game {
    static width = 10;
    static height = 10;
    static minesCount = 10;
    static instance = null;

    constructor(gridElement) {
        this.gridElement = gridElement;
        this.cells = [];
        this.mines = [];
        this.firstClick = true;
        this.score = 0;
        this.scoreStack = [];

        this.createGrid();
        Game.instance = this;
    }

    createGrid() {
        for (let i = 0; i < Game.width * Game.height; i++) {
            const cell = new Cell(i);
            this.gridElement.appendChild(cell.element);
            this.cells.push(cell);
        }
    }

    revealCell(cell) {
        if (this.firstClick) {
            this.placeMines(cell);
            this.firstClick = false;
        }

        if (cell.revealed || cell.flagged) return;

        cell.reveal();
        this.updateScore();

        if (cell.isBomb) {
            this.revealAllMines();
            setTimeout(() => {
                location.reload();
            }, 2000);
            return;
        }

        const surroundingMines = this.countSurroundingMines(cell.id);
        if (surroundingMines > 0) {
            cell.element.textContent = surroundingMines;
        } else {
            this.revealSurroundingCells(cell.id);
        }
    }

    placeMines(firstClickCell) {
        this.mines = [];
        this.cells.forEach(cell => cell.isBomb = false);

        while (this.mines.length < Game.minesCount) {
            const mineIndex = Math.floor(Math.random() * this.cells.length);
            if (!this.mines.includes(mineIndex) && this.cells[mineIndex] !== firstClickCell) {
                this.mines.push(mineIndex);
                this.cells[mineIndex].isBomb = true;
            }
        }
    }

    countSurroundingMines(id) {
        const adjacentCells = this.getAdjacentCells(id);
        return adjacentCells.reduce((count, index) => count + (this.cells[index].isBomb ? 1 : 0), 0);
    }

    getAdjacentCells(id) {
        const x = id % Game.width;
        const y = Math.floor(id / Game.width);
        const adjacentCells = [];

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < Game.width && ny >= 0 && ny < Game.height) {
                    adjacentCells.push(ny * Game.width + nx);
                }
            }
        }

        return adjacentCells;
    }

    revealSurroundingCells(id) {
        const adjacentCells = this.getAdjacentCells(id);
        adjacentCells.forEach(index => {
            const cell = this.cells[index];
            if (!cell.revealed && !cell.isBomb) {
                this.revealCell(cell);
            }
        });
    }

    flagCell(cell, event) {
        event.preventDefault();
        cell.flag();
    }

    revealAllMines() {
        this.cells.forEach(cell => {
            if (cell.isBomb) {
                cell.reveal();
            }
        });
    }

    updateScore() {
        this.score++;
        this.scoreStack.push(this.score);
        console.log(`Score: ${this.score}`);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const grid = document.getElementById('minesweeper');
    new Game(grid);
});
