// Se asegura que el DOM esté completamente cargado antes de ejecutar el código.
document.addEventListener("DOMContentLoaded", function () {
    // Obtiene elementos del DOM necesarios para el juego.
    const grid = document.getElementById('minesweeper');// La cuadrícula del buscaminas
    const ganaste = document.getElementById('ganaste'); // Mensaje de victoria
    const perdiste = document.getElementById('perdiste');// Mensaje de derrota
    const tiempoP = document.getElementById('tiempoP'); // Tiempo cuando pierdes
    const tiempoG = document.getElementById('tiempoG'); // Tiempo cuando ganas

    // Configuración del juego
    const width = 20;  // Ancho de la cuadrícula
    const height = 10; // Alto de la cuadrícula
    const minesCount = 10; // Número de minas
    let cells = [];  // Array que almacena las celdas
    let mines = []; // Array que almacena las minas
    let firstClick = true; // Bandera para el primer clic
    let flaggedCells = []; // Celdas marcadas con banderas
    let revealedCellsStack = []; // Pila para almacenar celdas reveladas

    var segundos = 0; // Variable para contar los segundos transcurridos

    // Función para iniciar el temporizador del juego
    function empezarTimer() {
        intervalId = setInterval(function () {
            segundos++;// Suma 1 a los segundos
        }, 1000); // Incrementa los segundos cada segundo
    }

    empezarTimer(); // Inicia el temporizador

    // Función para crear la cuadrícula del buscaminas
    function createGrid() {
        for (let i = 0; i < width * height; i++) {
            const cell = document.createElement('div');  // Crea un elemento <div> para cada celda
            cell.classList.add('cell'); // Agrega la clase "cell" a cada celda

            const row = Math.floor(i / width); //0 // Calcula la fila de la celda
            const col = i % width;              //1 // Calcula la columna de la celda

            // Alterna las clases de estilo para dar un efecto de tablero de ajedrez
            if ((row + col) % 2 === 0) {
                cell.classList.add('cell1');
            } else {
                cell.classList.add('cell2');
            }

            cell.setAttribute('data-id', i);// Asigna un ID único a cada celda
            grid.appendChild(cell); // Añade la celda a la cuadrícula
            cells.push(cell); // Añade la celda al array de celdas
        }

        // Añade eventos de clic a cada celda
        cells.forEach(cell => {
            cell.addEventListener('click', revealCell); // Evento para revelar una celda
            // Evento para manejar el clic derecho (banderas)
            cell.addEventListener('mousedown', function (event) {
                if (event.button === 2) {  // Si es botón derecho
                    event.preventDefault();
                    // Alterna la clase de la banderita
                    if (cell.classList.contains('banderita')) {
                        cell.classList.remove('banderita');
                        flaggedCells = flaggedCells.filter(c => c !== cell);
                    } else {
                        cell.classList.add('banderita');
                        flaggedCells.push(cell);
                    }
                }
            });
            // Previene el menú contextual en clic derecho y gestiona la bandera
            cell.addEventListener('contextmenu', flagCell);
        });
    }
    // Función para revelar una celda
    function revealCell(event) {
        const cell = event.target;

        if (firstClick) { // En el primer clic, se colocan las minas
            placeMines(cell);
            firstClick = false;
        }
        // Si la celda ya ha sido revelada o está marcada, no hace nada
        if (cell.classList.contains('revealed1') || cell.classList.contains('flagged')) return;

        revealedCellsStack.push(cell); // Añade la celda revelada a la pila
        // Revela la celda con el estilo adecuado según su clase
        if (cell.classList.contains('cell1')) {
            cell.classList.add('revealed1');
        } else if (cell.classList.contains('cell2')) {
            cell.classList.add('revealed2');
        }
        // Si la celda es una mina, se termina el juego
        if (cell.classList.contains('bomb')) {
            document.getElementById("minesweeper").style.pointerEvents = "none"; // Desactiva más clics
            const minutos = Math.floor(segundos / 60);
            const secs = segundos % 60;
            tiempoP.innerText = `${minutos.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            console.log("perdiste");

            revealAllMines(cell); // Revela todas las minas
            setTimeout(() => {
                perdiste.classList.add('perder'); // Muestra el mensaje de derrota
            }, (minesCount * 400));
            return;
        }
        // Calcula el número de minas alrededor de la celda
        const id = parseInt(cell.getAttribute('data-id'));
        const surroundingMines = countSurroundingMines(id);
        if (surroundingMines > 0) {
            cell.textContent = surroundingMines; // Muestra el número de minas alrededor
            switch (cell.textContent) {
                case "1":
                    cell.style.color = "#257bd0"; // Color para 1 mina cercana
                    break;
                case "2":
                    cell.style.color = "#419142"; // Color para 2 minas cercanas
                    break;
                case "3":
                    cell.style.color = "#d33030"; // Color para 3 minas cercanas
                    break;
                case "4":
                    cell.style.color = "#020084"; // Color para 4 minas cercanas
                    break;
                case "5":
                    cell.style.color = "#810102"; // Color para 5 minas cercanas
                    break;
                case "6":
                    cell.style.color = "#00807f"; // Color para 6 minas cercanas
                    break;
            }
        } else {
            revealSurroundingCells(id); // Revela las celdas alrededor si no hay minas cercanas
        }

        checkWin(); // Verifica si el jugador ha ganado
    }
    // Función para colocar las minas al azar en la cuadrícula
    function placeMines(firstClickCell) {
        mines = [];

        while (mines.length < minesCount) {
            const mineIndex = Math.floor(Math.random() * cells.length);
            // Asegura que las minas no se coloquen en la misma celda y no en la primera clicada
            if (!mines.includes(mineIndex) && cells[mineIndex] !== firstClickCell) {
                mines.push(mineIndex);
                cells[mineIndex].classList.add('bomb'); // Marca la celda como mina
            }
        }
    }
    // Función para contar las minas alrededor de una celda específica
    function countSurroundingMines(id) {
        const adjacentCells = getAdjacentCells(id);
        return adjacentCells.reduce((count, index) => count + (cells[index].classList.contains('bomb') ? 1 : 0), 0);
    }

    function getAdjacentCells(id) {
        const x = id % width;
        const y = Math.floor(id / width);
        const adjacentCells = [];
        // Recorre las celdas adyacentes y las agrega al array si están dentro de los límites
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue; // Salta la celda actual
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    adjacentCells.push(ny * width + nx); // Calcula el ID de la celda adyacente y lo añade
                }
            }
        }

        return adjacentCells;
    }
    // Función para revelar las celdas adyacentes cuando no hay minas cercanas
    function revealSurroundingCells(id) {
        const adjacentCells = getAdjacentCells(id);
        adjacentCells.forEach(index => {
            const cell = cells[index];
            if (!cell.classList.contains('revealed1') && !cell.classList.contains('revealed2') && !cell.classList.contains('bomb')) {
                revealCell({ target: cell }); // Revela las celdas no reveladas y que no son minas
            }
        });
    }
    // Función para marcar o desmarcar una celda como bandera
    function flagCell(event) {
        event.preventDefault(); // Previene el comportamiento predeterminado del clic derecho (mostrar menú contextual)
        const cell = event.target;// Obtiene la celda sobre la que se hizo clic
        if (cell.classList.contains('revealed1')) return; // Si la celda ya está revelada, no hace nada y sale de la función
        cell.classList.toggle('flagged'); // Alterna la clase 'flagged' en la celda (agrega o quita la clase)
        if (cell.classList.contains('flagged')) { // Si la celda ahora está marcada como bandera, la agrega al array flaggedCells
            flaggedCells.push(cell);
        } else {
            flaggedCells = flaggedCells.filter(c => c !== cell);
        }
    }
    // Función para revelar todas las minas cuando se descubre una mina
    function revealAllMines(discoveredBombCell) {
        // Crea un array para almacenar las celdas que contienen bombas
        const bombCells = [];

        cells.forEach(cell => { // Recorre todas las celdas para encontrar las que contienen bombas
            // Si la celda contiene una bomba y no es la celda que se acaba de descubrir, la agrega al array bombCells
            if (cell.classList.contains('bomb') && cell !== discoveredBombCell) {
                bombCells.push(cell);
            }
        });
        // Si existe una celda que fue descubierta (discoveredBombCell), la revela visualmente como una bomba
        if (discoveredBombCell) {
            discoveredBombCell.classList.add('revealedBomb');
        }
        // Recorre todas las celdas con bombas y las revela secuencialmente
        bombCells.forEach((cell, index) => {
            setTimeout(() => {
                // Reproduce un sonido de bomba si es una de las primeras 8 bombas
                if (index < 8) {
                    var bombSound = document.getElementById('bombSound');
                    bombSound.currentTime = 0;
                    bombSound.play();
                }
                // Añade la clase 'revealedBomb' para revelar la bomba visualmente
                cell.classList.add('revealedBomb');
            }, index * 400); // Retrasa la revelación de cada bomba 400ms entre cada una
        });
    }
    // Función para verificar si el jugador ha ganado el juego
    function checkWin() {
        // Comprueba si todas las celdas están reveladas correctamente
        const allRevealed = cells.every(cell => {
            return cell.classList.contains('bomb') || cell.classList.contains('revealed1') || cell.classList.contains('revealed2');
        });
        // Si todas las celdas están reveladas correctamente, el jugador gana
        if (allRevealed) {
            // Desactiva todos los eventos del tablero para que no se pueda interactuar más
            document.getElementById("minesweeper").style.pointerEvents = "none";
            console.log("Ganaste");
            ganaste.classList.add('ganar'); // Añade la clase 'ganar' para mostrar efectos de victoria
            // Calcula y muestra el tiempo transcurrido
            const minutos = Math.floor(segundos / 60);
            const secs = segundos % 60;
            tiempoG.innerText = `${ minutos.toString().padStart(2, '0') }:${ secs.toString().padStart(2, '0') }`;
            console.log("GANASTE");
        }
    }
    // Llamada a la función para crear la cuadrícula del tablero2
    createGrid();
});
5