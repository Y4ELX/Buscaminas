document.addEventListener("DOMContentLoaded", function () {
    const grid = document.getElementById('minesweeper');
    const width = 10;
    const height = 10;
    const minesCount = 10;
    let cells = [];
    let mines = [];
    let firstClick = true; // Variable para verificar si es el primer clic

    function createGrid() {
        // Crear celdas y añadirlas al grid
        for (let i = 0; i < width * height; i++) {
            const cell = document.createElement('div'); // Crear una celda
            cell.classList.add('cell'); // Añadir una clase común

            // Alternar colores como en un tablero de ajedrez
            const row = Math.floor(i / width);
            const col = i % width;
            if ((row + col) % 2 === 0) {
                cell.classList.add('cell1'); // Color de celda 1
            } else {
                cell.classList.add('cell2'); // Color de celda 2
            }

            cell.setAttribute('data-id', i);
            grid.appendChild(cell);
            cells.push(cell);
        }

        cells.forEach(cell => {
            cell.addEventListener('click', revealCell);
            

            cell.addEventListener('mousedown', function (event) {
                if (event.button === 2) { // 2 corresponde al botón derecho del mouse
                    event.preventDefault(); // Previene el menú contextual del navegador
                    if (cell.classList.contains('banderita')) {
                        cell.classList.remove('banderita')
                    } else {
                        cell.classList.add('banderita')
                    }                
                }
            });
            
            cell.addEventListener('contextmenu', flagCell);
        });
    }

    function revealCell(event) {
        const cell = event.target;

        if (firstClick) {
            // En el primer clic, colocar las minas
            placeMines(cell);
            firstClick = false; // Marca que el primer clic ya ha ocurrido
        }

        if (cell.classList.contains('revealed1') || cell.classList.contains('flagged')) return;

        // Mantener el patrón de ajedrez para celdas reveladas
        if (cell.classList.contains('cell1')) {
            cell.classList.add('revealed1');
        } else if (cell.classList.contains('cell2')) {
            cell.classList.add('revealed2');
        }

        if (cell.classList.contains('bomb')) {
            revealAllMines(cell);

            setTimeout(() => {
                location.reload();
            }, (minesCount * 400) + 2000);

            return;
        }

        const id = parseInt(cell.getAttribute('data-id'));
        const surroundingMines = countSurroundingMines(id);
        if (surroundingMines > 0) {
            cell.textContent = surroundingMines;
            switch (cell.textContent) {
                case "1":
                    cell.style.color = "#257bd0"
                    break;
                case "2":
                    cell.style.color = "#419142"
                    break;
                case "3":
                    cell.style.color = "#d33030"
                    break;
            }
        } else {
            revealSurroundingCells(id);
        }

        // Verificar si el jugador ha ganado
        checkWin();
    }

    function placeMines(firstClickCell) {
        // Limpiar minas existentes
        mines = [];
        cells.forEach(cell => cell.classList.remove('bomb'));

        // Colocar minas en celdas que no sean la primera clicada
        while (mines.length < minesCount) {
            const mineIndex = Math.floor(Math.random() * cells.length);
            if (!mines.includes(mineIndex) && cells[mineIndex] !== firstClickCell) {
                mines.push(mineIndex);
                cells[mineIndex].classList.add('bomb');
            }
        }
    }

    function countSurroundingMines(id) {
        const adjacentCells = getAdjacentCells(id);
        return adjacentCells.reduce((count, index) => count + (cells[index].classList.contains('bomb') ? 1 : 0), 0);
    }

    function getAdjacentCells(id) {
        const x = id % width;
        const y = Math.floor(id / width);
        const adjacentCells = [];

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    adjacentCells.push(ny * width + nx);
                }
            }
        }

        return adjacentCells;
    }

    function revealSurroundingCells(id) {
        const adjacentCells = getAdjacentCells(id);
        adjacentCells.forEach(index => {
            const cell = cells[index];
            if (!cell.classList.contains('revealed1') && !cell.classList.contains('revealed2') && !cell.classList.contains('bomb')) {
                revealCell({ target: cell });
            }
        });
    }

    function flagCell(event) {
        event.preventDefault();
        const cell = event.target;
        if (cell.classList.contains('revealed1')) return;
        cell.classList.toggle('flagged');
    }

    function revealAllMines(discoveredBombCell) {
        const bombCells = [];

        cells.forEach(cell => {
            if (cell.classList.contains('bomb') && cell !== discoveredBombCell) {
                bombCells.push(cell);
            }
        });

        // Revelar primero la bomba descubierta
        if (discoveredBombCell) {
            discoveredBombCell.classList.add('revealedBomb');
        }

        // Luego revelar las demás bombas con un retraso de 200ms
        bombCells.forEach((cell, index) => {
            setTimeout(() => {
                var bombSound = document.getElementById('bombSound');
                bombSound.currentTime = 0; // Reinicia el tiempo del audio
                bombSound.play()

                cell.classList.add('revealedBomb');
            }, index * 400); // 200ms de retraso por cada celda
        });
    }

    function checkWin() {
        // Verificar si todas las celdas que no son minas han sido reveladas
        const allRevealed = cells.every(cell => {
            return cell.classList.contains('bomb') || cell.classList.contains('revealed1') || cell.classList.contains('revealed2');
        });

        if (allRevealed) {
            console.log("Ganaste");
        }
    }

    createGrid();
});
