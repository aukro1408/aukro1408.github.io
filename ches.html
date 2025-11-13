<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Шахматы</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #fff;
        }

        .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            max-width: 800px;
            width: 100%;
        }

        h1 {
            font-size: 2.5rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            margin-bottom: 10px;
        }

        .game-info {
            display: flex;
            justify-content: space-between;
            width: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .turn-indicator {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .turn-circle {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #fff;
        }

        .turn-white .turn-circle {
            background-color: #fff;
        }

        .turn-black .turn-circle {
            background-color: #000;
        }

        .controls {
            display: flex;
            gap: 10px;
        }

        button {
            padding: 8px 16px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.3s;
        }

        button:hover {
            background-color: #45a049;
        }

        .chessboard {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            grid-template-rows: repeat(8, 1fr);
            width: 560px;
            height: 560px;
            border: 10px solid #8B4513;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            border-radius: 5px;
        }

        .square {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            cursor: pointer;
            transition: background-color 0.2s;
            position: relative;
        }

        .white {
            background-color: #f0d9b5;
        }

        .black {
            background-color: #b58863;
        }

        .selected {
            background-color: #aec6cf;
        }

        .possible-move::after {
            content: "";
            position: absolute;
            width: 20px;
            height: 20px;
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: 50%;
        }

        .coordinates {
            position: absolute;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.7);
        }

        .file-coord {
            bottom: 2px;
            right: 4px;
        }

        .rank-coord {
            top: 2px;
            left: 4px;
        }

        .captured-pieces {
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin-top: 10px;
        }

        .captured-white, .captured-black {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
            min-height: 40px;
            padding: 5px;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 5px;
        }

        .message {
            margin-top: 10px;
            padding: 10px;
            background-color: rgba(0, 0, 0, 0.7);
            border-radius: 5px;
            min-height: 40px;
            width: 100%;
            text-align: center;
            font-weight: bold;
        }

        @media (max-width: 600px) {
            .chessboard {
                width: 90vw;
                height: 90vw;
            }
            
            .square {
                font-size: 30px;
            }
            
            h1 {
                font-size: 1.8rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Шахматы</h1>
        
        <div class="game-info">
            <div class="turn-indicator turn-white">
                <div class="turn-circle"></div>
                <span>Ход белых</span>
            </div>
            
            <div class="controls">
                <button id="restartBtn">Новая игра</button>
            </div>
        </div>
        
        <div class="chessboard" id="chessboard"></div>
        
        <div class="captured-pieces">
            <div class="captured-white" id="capturedWhite"></div>
            <div class="captured-black" id="capturedBlack"></div>
        </div>
        
        <div class="message" id="message"></div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const chessboard = document.getElementById('chessboard');
            const turnIndicator = document.querySelector('.turn-indicator');
            const messageElement = document.getElementById('message');
            const restartBtn = document.getElementById('restartBtn');
            const capturedWhite = document.getElementById('capturedWhite');
            const capturedBlack = document.getElementById('capturedBlack');
            
            let board = [];
            let selectedPiece = null;
            let currentPlayer = 'white';
            let gameOver = false;
            let capturedPieces = { white: [], black: [] };
            
            // Инициализация доски
            function initializeBoard() {
                board = [];
                chessboard.innerHTML = '';
                capturedWhite.innerHTML = '';
                capturedBlack.innerHTML = '';
                messageElement.textContent = '';
                currentPlayer = 'white';
                gameOver = false;
                capturedPieces = { white: [], black: [] };
                
                turnIndicator.className = 'turn-indicator turn-white';
                turnIndicator.querySelector('span').textContent = 'Ход белых';
                
                // Создаем пустую доску
                for (let row = 0; row < 8; row++) {
                    board[row] = [];
                    for (let col = 0; col < 8; col++) {
                        const square = document.createElement('div');
                        square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                        square.dataset.row = row;
                        square.dataset.col = col;
                        
                        // Добавляем координаты
                        if (row === 7) {
                            const fileCoord = document.createElement('div');
                            fileCoord.className = 'coordinates file-coord';
                            fileCoord.textContent = String.fromCharCode(97 + col);
                            square.appendChild(fileCoord);
                        }
                        
                        if (col === 0) {
                            const rankCoord = document.createElement('div');
                            rankCoord.className = 'coordinates rank-coord';
                            rankCoord.textContent = 8 - row;
                            square.appendChild(rankCoord);
                        }
                        
                        square.addEventListener('click', () => handleSquareClick(row, col));
                        chessboard.appendChild(square);
                        board[row][col] = null;
                    }
                }
                
                // Расставляем фигуры
                setupPieces();
            }
            
            // Расстановка фигур на доске
            function setupPieces() {
                // Пешки
                for (let col = 0; col < 8; col++) {
                    placePiece(1, col, 'pawn', 'black');
                    placePiece(6, col, 'pawn', 'white');
                }
                
                // Ладьи
                placePiece(0, 0, 'rook', 'black');
                placePiece(0, 7, 'rook', 'black');
                placePiece(7, 0, 'rook', 'white');
                placePiece(7, 7, 'rook', 'white');
                
                // Кони
                placePiece(0, 1, 'knight', 'black');
                placePiece(0, 6, 'knight', 'black');
                placePiece(7, 1, 'knight', 'white');
                placePiece(7, 6, 'knight', 'white');
                
                // Слоны
                placePiece(0, 2, 'bishop', 'black');
                placePiece(0, 5, 'bishop', 'black');
                placePiece(7, 2, 'bishop', 'white');
                placePiece(7, 5, 'bishop', 'white');
                
                // Ферзи
                placePiece(0, 3, 'queen', 'black');
                placePiece(7, 3, 'queen', 'white');
                
                // Короли
                placePiece(0, 4, 'king', 'black');
                placePiece(7, 4, 'king', 'white');
            }
            
            // Размещение фигуры на доске
            function placePiece(row, col, type, color) {
                const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
                const piece = document.createElement('div');
                piece.className = 'piece';
                piece.textContent = getPieceSymbol(type, color);
                piece.dataset.type = type;
                piece.dataset.color = color;
                square.appendChild(piece);
                
                board[row][col] = {
                    type: type,
                    color: color,
                    element: piece
                };
            }
            
            // Получение символа фигуры
            function getPieceSymbol(type, color) {
                const symbols = {
                    white: {
                        king: '♔',
                        queen: '♕',
                        rook: '♖',
                        bishop: '♗',
                        knight: '♘',
                        pawn: '♙'
                    },
                    black: {
                        king: '♚',
                        queen: '♛',
                        rook: '♜',
                        bishop: '♝',
                        knight: '♞',
                        pawn: '♟'
                    }
                };
                
                return symbols[color][type];
            }
            
            // Обработка клика по клетке
            function handleSquareClick(row, col) {
                if (gameOver) return;
                
                const piece = board[row][col];
                
                // Если выбрана своя фигура
                if (piece && piece.color === currentPlayer) {
                    selectPiece(row, col);
                    return;
                }
                
                // Если выбрана клетка для хода
                if (selectedPiece) {
                    // Проверяем, является ли ход допустимым
                    if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
                        movePiece(selectedPiece.row, selectedPiece.col, row, col);
                        clearSelection();
                        switchPlayer();
                    } else {
                        // Если клик по другой своей фигуре, выбираем её
                        if (piece && piece.color === currentPlayer) {
                            selectPiece(row, col);
                        } else {
                            clearSelection();
                        }
                    }
                }
            }
            
            // Выбор фигуры
            function selectPiece(row, col) {
                clearSelection();
                
                selectedPiece = {
                    row: row,
                    col: col,
                    type: board[row][col].type,
                    color: board[row][col].color
                };
                
                // Подсвечиваем выбранную фигуру
                const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
                square.classList.add('selected');
                
                // Показываем возможные ходы
                showPossibleMoves(row, col);
            }
            
            // Показать возможные ходы
            function showPossibleMoves(row, col) {
                const piece = board[row][col];
                
                // Простая логика для демонстрации (реальные шахматы требуют более сложной логики)
                if (piece.type === 'pawn') {
                    // Пешки могут двигаться вперед на одну клетку
                    const direction = piece.color === 'white' ? -1 : 1;
                    
                    if (isInBounds(row + direction, col) && !board[row + direction][col]) {
                        markPossibleMove(row + direction, col);
                    }
                    
                    // Пешки могут бить по диагонали
                    if (isInBounds(row + direction, col - 1) && 
                        board[row + direction][col - 1] && 
                        board[row + direction][col - 1].color !== piece.color) {
                        markPossibleMove(row + direction, col - 1);
                    }
                    
                    if (isInBounds(row + direction, col + 1) && 
                        board[row + direction][col + 1] && 
                        board[row + direction][col + 1].color !== piece.color) {
                        markPossibleMove(row + direction, col + 1);
                    }
                } else {
                    // Для других фигур показываем все клетки вокруг (упрощенно)
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            if (i === 0 && j === 0) continue;
                            
                            const newRow = row + i;
                            const newCol = col + j;
                            
                            if (isInBounds(newRow, newCol) && 
                                (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color)) {
                                markPossibleMove(newRow, newCol);
                            }
                        }
                    }
                }
            }
            
            // Отметить возможный ход
            function markPossibleMove(row, col) {
                const square = document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
                square.classList.add('possible-move');
            }
            
            // Проверка нахождения в пределах доски
            function isInBounds(row, col) {
                return row >= 0 && row < 8 && col >= 0 && col < 8;
            }
            
            // Проверка допустимости хода (упрощенная версия)
            function isValidMove(fromRow, fromCol, toRow, toCol) {
                const piece = board[fromRow][fromCol];
                const targetPiece = board[toRow][toCol];
                
                // Нельзя ходить на клетку со своей фигурой
                if (targetPiece && targetPiece.color === piece.color) {
                    return false;
                }
                
                // Проверяем, является ли клетка возможным ходом
                const square = document.querySelector(`.square[data-row="${toRow}"][data-col="${toCol}"]`);
                return square.classList.contains('possible-move');
            }
            
            // Перемещение фигуры
            function movePiece(fromRow, fromCol, toRow, toCol) {
                const piece = board[fromRow][fromCol];
                const targetPiece = board[toRow][toCol];
                
                // Если на целевой клетке есть фигура противника, забираем её
                if (targetPiece) {
                    capturePiece(toRow, toCol);
                }
                
                // Перемещаем фигуру
                const fromSquare = document.querySelector(`.square[data-row="${fromRow}"][data-col="${fromCol}"]`);
                const toSquare = document.querySelector(`.square[data-row="${toRow}"][data-col="${toCol}"]`);
                
                // Очищаем целевую клетку
                toSquare.innerHTML = '';
                
                // Добавляем координаты обратно
                if (toRow === 7) {
                    const fileCoord = document.createElement('div');
                    fileCoord.className = 'coordinates file-coord';
                    fileCoord.textContent = String.fromCharCode(97 + toCol);
                    toSquare.appendChild(fileCoord);
                }
                
                if (toCol === 0) {
                    const rankCoord = document.createElement('div');
                    rankCoord.className = 'coordinates rank-coord';
                    rankCoord.textContent = 8 - toRow;
                    toSquare.appendChild(rankCoord);
                }
                
                // Перемещаем фигуру
                toSquare.appendChild(piece.element);
                
                // Обновляем состояние доски
                board[toRow][toCol] = piece;
                board[fromRow][fromCol] = null;
                
                // Проверяем, не является ли ход шахом или матом (упрощенно)
                checkGameStatus();
            }
            
            // Захват фигуры
            function capturePiece(row, col) {
                const piece = board[row][col];
                
                // Добавляем фигуру в список захваченных
                capturedPieces[piece.color].push(piece);
                
                // Отображаем захваченную фигуру
                const capturedElement = document.createElement('div');
                capturedElement.textContent = getPieceSymbol(piece.type, piece.color);
                capturedElement.style.fontSize = '20px';
                
                if (piece.color === 'white') {
                    capturedBlack.appendChild(capturedElement);
                } else {
                    capturedWhite.appendChild(capturedElement);
                }
            }
            
            // Проверка статуса игры
            function checkGameStatus() {
                // Упрощенная проверка - если захвачен король, игра заканчивается
                const whiteKing = findKing('white');
                const blackKing = findKing('black');
                
                if (!whiteKing) {
                    endGame('black');
                    return;
                }
                
                if (!blackKing) {
                    endGame('white');
                    return;
                }
            }
            
            // Поиск короля на доске
            function findKing(color) {
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const piece = board[row][col];
                        if (piece && piece.type === 'king' && piece.color === color) {
                            return piece;
                        }
                    }
                }
                return null;
            }
            
            // Окончание игры
            function endGame(winner) {
                gameOver = true;
                messageElement.textContent = `Игра окончена! Победили ${winner === 'white' ? 'белые' : 'черные'}!`;
            }
            
            // Очистка выделения
            function clearSelection() {
                document.querySelectorAll('.square.selected').forEach(square => {
                    square.classList.remove('selected');
                });
                
                document.querySelectorAll('.square.possible-move').forEach(square => {
                    square.classList.remove('possible-move');
                });
                
                selectedPiece = null;
            }
            
            // Смена игрока
            function switchPlayer() {
                currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                
                if (currentPlayer === 'white') {
                    turnIndicator.className = 'turn-indicator turn-white';
                    turnIndicator.querySelector('span').textContent = 'Ход белых';
                } else {
                    turnIndicator.className = 'turn-indicator turn-black';
                    turnIndicator.querySelector('span').textContent = 'Ход черных';
                }
            }
            
            // Обработчик кнопки перезапуска
            restartBtn.addEventListener('click', initializeBoard);
            
            // Инициализация игры
            initializeBoard();
        });
    </script>
</body>
</html>
