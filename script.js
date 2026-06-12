let board, pieces, selectedPiece, chooser, placer, winner, gameMode, botDifficulty;
let winningLine = [];
let lastBotSquare = null;
let moveHistory = [];

let humanPlayer = 1;
let botPlayer = 2;

let humanScore = Number(localStorage.getItem("humanScore")) || 0;
let botScore = Number(localStorage.getItem("botScore")) || 0;
let player1Score = Number(localStorage.getItem("player1Score")) || 0;
let player2Score = Number(localStorage.getItem("player2Score")) || 0;

let historyVisible = true;

const menu = document.getElementById("menu");
const game = document.getElementById("game");

const playerButton = document.getElementById("playerButton");
const easyBotButton = document.getElementById("easyBotButton");
const mediumBotButton = document.getElementById("mediumBotButton");
const hardBotButton = document.getElementById("hardBotButton");

const menuButton = document.getElementById("menuButton");
const restartButton = document.getElementById("restartButton");
const resetScoreButton = document.getElementById("resetScoreButton");

const boardDiv = document.getElementById("board");
const piecesDiv = document.getElementById("pieces");
const message = document.getElementById("message");
const scoreboard = document.getElementById("scoreboard");
const previewPiece = document.getElementById("previewPiece");
const historyList = document.getElementById("history");

const rulesButton =
  document.getElementById("rulesButton");

const rulesPanel =
  document.getElementById("rulesPanel");

const toggleHistoryButton =
  document.getElementById("toggleHistoryButton");

rulesButton.onclick = function () {

  if (rulesPanel.style.display === "block") {
    rulesPanel.style.display = "none";
    rulesButton.textContent = "Rules";
  } else {
    rulesPanel.style.display = "block";
    rulesButton.textContent = "Hide Rules";
  }

};

  playerButton.onclick = function () {
  gameMode = "player";
  botDifficulty = null;
  showGame();
};

easyBotButton.onclick = function () {
  gameMode = "bot";
  botDifficulty = "easy";
  showGame();
};

mediumBotButton.onclick = function () {
  gameMode = "bot";
  botDifficulty = "medium";
  showGame();
};

hardBotButton.onclick = function () {
  gameMode = "bot";
  botDifficulty = "hard";
  showGame();
};

menuButton.onclick = function () {
  game.style.display = "none";
  menu.style.display = "block";
};

restartButton.onclick = startGame;

resetScoreButton.onclick = function () {
  humanScore = 0;
  botScore = 0;
  player1Score = 0;
  player2Score = 0;
  saveScores();
  drawScoreboard();
};

toggleHistoryButton.onclick = function () {

  historyVisible = !historyVisible;

  const historyBox = document.getElementById("historyBox");

  if (historyVisible) {
    historyBox.style.display = "block";
    toggleHistoryButton.textContent = "Hide History";
  } else {
    historyBox.style.display = "none";
    toggleHistoryButton.textContent = "Show History";
  }
};

function showGame() {
  menu.style.display = "none";
  game.style.display = "block";
  startGame();
}

function startGame() {
  board = Array(16).fill(null);

  pieces = [
    "TLRH", "TLRS", "TLQH", "TLQS",
    "TDRH", "TDRS", "TDQH", "TDQS",
    "SLRH", "SLRS", "SLQH", "SLQS",
    "SDRH", "SDRS", "SDQH", "SDQS"
  ];

  selectedPiece = null;
  chooser = 1;
  placer = 2;
  winner = null;
  winningLine = [];
  lastBotSquare = null;
  moveHistory = [];

  message.textContent =
    gameMode === "bot"
      ? "Choose a piece for the bot"
      : "Player 1, choose a piece for Player 2";

  drawEverything();
}

function drawEverything() {
  drawScoreboard();
  drawBoard();
  drawPieces();
  drawPreview();
  drawHistory();
}

function drawScoreboard() {
  if (gameMode === "bot") {
    scoreboard.textContent =
      "You: " + humanScore + " | Bot: " + botScore + " | Difficulty: " + botDifficulty;
  } else {
    scoreboard.textContent =
      "Player 1: " + player1Score + " | Player 2: " + player2Score;
  }
}

function makePiece(piece) {
  let shape = document.createElement("div");

  shape.classList.add(piece[0] === "T" ? "tall" : "short");
  shape.classList.add(piece[1] === "L" ? "light" : "dark");
  shape.classList.add(piece[2] === "R" ? "round" : "square-shape");

  if (piece[3] === "H") {
    shape.classList.add("hollow");
  }

  shape.classList.add("inner-piece");
  return shape;
}

function drawBoard() {
  boardDiv.innerHTML = "";

  for (let i = 0; i < 16; i++) {
    let square = document.createElement("div");
    square.className = "square";
    square.dataset.coord = indexToCoord(i);

    if (winningLine.includes(i)) {
      square.classList.add("winning-square");
    }

    if (i === lastBotSquare && winner === null) {
      square.classList.add("bot-move");
    }

    if (board[i] !== null) {
      square.appendChild(makePiece(board[i]));
    }

    square.onclick = function () {
      placePiece(i);
    };

    boardDiv.appendChild(square);
  }
}

function drawPieces() {
  piecesDiv.innerHTML = "";

  for (let piece of pieces) {
    let div = document.createElement("div");
    div.className = "piece";

    if (piece === selectedPiece) {
      div.classList.add("selected");
    }

    div.appendChild(makePiece(piece));

    div.onclick = function () {
      choosePiece(piece);
    };

    piecesDiv.appendChild(div);
  }
}

function drawPreview() {
  previewPiece.innerHTML = "";

  if (selectedPiece !== null) {
    previewPiece.appendChild(makePiece(selectedPiece));
  }
}

function drawHistory() {
  historyList.innerHTML = "";

  for (let move of moveHistory) {
    let item = document.createElement("li");
    item.textContent = move;
    historyList.appendChild(item);
  }
}

function choosePiece(piece) {
  if (winner !== null) return;
  if (gameMode === "bot" && chooser === botPlayer) return;

  selectedPiece = piece;

  if (gameMode === "bot") {
    moveHistory.push("You gave " + pieceName(piece) + " to the bot.");
    message.textContent = "Bot is placing the piece...";
  } else {
    moveHistory.push("Player " + chooser + " gave " + pieceName(piece) + " to Player " + placer + ".");
    message.textContent = "Player " + placer + ", place this piece";
  }

  drawEverything();

  if (gameMode === "bot" && placer === botPlayer) {
    setTimeout(botPlacePiece, 700);
  }
}

function placePiece(index) {
  if (winner !== null) return;
  if (gameMode === "bot" && placer === botPlayer) return;

  if (selectedPiece === null) {
    message.textContent =
      gameMode === "bot"
        ? "Choose a piece for the bot"
        : "Player " + chooser + ", choose a piece for Player " + placer;
    return;
  }

  if (board[index] !== null) {
    message.textContent = "That square is already taken";
    return;
  }

  if (gameMode === "bot") {
    moveHistory.push("You placed " + pieceName(selectedPiece) + " at " + indexToCoord(index) + ".");
  } else {
    moveHistory.push("Player " + placer + " placed " + pieceName(selectedPiece) + " at " + indexToCoord(index) + ".");
  }

  putPieceOnBoard(index, false);
}

function putPieceOnBoard(index, botMoved) {
  board[index] = selectedPiece;
  pieces = pieces.filter(piece => piece !== selectedPiece);
  selectedPiece = null;

  lastBotSquare = botMoved ? index : null;

  let result = getWinningLine(board);

  if (result !== null) {
    winner = placer;
    winningLine = result;

    if (gameMode === "bot") {
      if (winner === humanPlayer) {
        humanScore++;
        message.textContent = "You win!";
      } else {
        botScore++;
        message.textContent = "Bot wins!";
      }
    } else {
      if (winner === 1) player1Score++;
      if (winner === 2) player2Score++;
      message.textContent = "Player " + winner + " wins!";
    }

    saveScores();
    drawEverything();
    return;
  }

  if (pieces.length === 0) {
    message.textContent = "Draw!";
    drawEverything();
    return;
  }

  switchTurns();
  drawEverything();

  if (gameMode === "bot" && chooser === botPlayer) {
    setTimeout(botChoosePiece, 700);
  }
}

function switchTurns() {
  let oldChooser = chooser;
  chooser = placer;
  placer = oldChooser;

  if (gameMode === "bot") {
    if (chooser === humanPlayer) {
      message.textContent = "Choose a piece for the bot";
    } else {
      message.textContent = "Bot is choosing a piece for you...";
    }
  } else {
    message.textContent = "Player " + chooser + ", choose a piece for Player " + placer;
  }
}

function botPlacePiece() {
  if (winner !== null) return;

  let square;

  if (botDifficulty === "easy") {
    square = randomEmptySquare();
  } else {
    square = findWinningSquare(selectedPiece);

    if (square === null) {
      square = botDifficulty === "hard" ? bestHardSquare(selectedPiece) : randomEmptySquare();
    }
  }

  moveHistory.push("Bot placed " + pieceName(selectedPiece) + " at " + indexToCoord(square) + ".");
  putPieceOnBoard(square, true);
}

function botChoosePiece() {
  if (winner !== null) return;

  if (botDifficulty === "easy") {
    selectedPiece = randomPiece(pieces);
  } else {
    let safePieces = pieces.filter(piece => !canOpponentWinImmediately(piece));

    if (safePieces.length > 0) {
      selectedPiece =
        botDifficulty === "hard"
          ? chooseHardPiece(safePieces)
          : randomPiece(safePieces);
    } else {
      selectedPiece = randomPiece(pieces);
    }
  }

  moveHistory.push("Bot gave " + pieceName(selectedPiece) + " to you.");
  message.textContent = "Bot chose a piece for you. Place it on the board.";

  drawEverything();
}

function bestHardSquare(piece) {
  let emptySquares = getEmptySquares();
  let bestSquare = randomEmptySquare();
  let bestScore = -999;

  for (let square of emptySquares) {
    let testBoard = [...board];
    testBoard[square] = piece;

    let score = countThreeThreats(testBoard);

    if ([5, 6, 9, 10].includes(square)) {
      score += 2;
    }

    if ([0, 3, 12, 15].includes(square)) {
      score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestSquare = square;
    }
  }

  return bestSquare;
}

function chooseHardPiece(pieceOptions) {
  let bestPiece = randomPiece(pieceOptions);
  let bestScore = 999;

  for (let piece of pieceOptions) {
    let danger = countPossibleWinningSquares(piece);

    if (danger < bestScore) {
      bestScore = danger;
      bestPiece = piece;
    }
  }

  return bestPiece;
}

function countPossibleWinningSquares(piece) {
  let count = 0;

  for (let square of getEmptySquares()) {
    let testBoard = [...board];
    testBoard[square] = piece;

    if (getWinningLine(testBoard) !== null) {
      count++;
    }
  }

  return count;
}

function countThreeThreats(testBoard) {
  let count = 0;

  for (let line of getLines()) {
    let piecesInLine = line.map(index => testBoard[index]);
    let filled = piecesInLine.filter(piece => piece !== null);

    if (filled.length === 3) {
      for (let traitPosition = 0; traitPosition < 4; traitPosition++) {
        let trait = filled[0][traitPosition];

        if (filled.every(piece => piece[traitPosition] === trait)) {
          count++;
        }
      }
    }
  }

  return count;
}

function getEmptySquares() {
  let empty = [];

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      empty.push(i);
    }
  }

  return empty;
}

function randomEmptySquare() {
  let empty = getEmptySquares();
  return empty[Math.floor(Math.random() * empty.length)];
}

function randomPiece(pieceList) {
  return pieceList[Math.floor(Math.random() * pieceList.length)];
}

function findWinningSquare(piece) {
  for (let square of getEmptySquares()) {
    let testBoard = [...board];
    testBoard[square] = piece;

    if (getWinningLine(testBoard) !== null) {
      return square;
    }
  }

  return null;
}

function canOpponentWinImmediately(piece) {
  return findWinningSquare(piece) !== null;
}

function getWinningLine(testBoard) {
  for (let line of getLines()) {
    let piecesInLine = line.map(index => testBoard[index]);

    if (piecesInLine.includes(null)) {
      continue;
    }

    for (let traitPosition = 0; traitPosition < 4; traitPosition++) {
      let firstTrait = piecesInLine[0][traitPosition];

      if (piecesInLine.every(piece => piece[traitPosition] === firstTrait)) {
        return line;
      }
    }
  }

  return null;
}

function getLines() {
  return [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],

    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],

    [0, 5, 10, 15],
    [3, 6, 9, 12]
  ];
}

function indexToCoord(index) {
  let letters = ["A", "B", "C", "D"];
  let col = index % 4;
  let row = Math.floor(index / 4) + 1;

  return letters[col] + row;
}

function pieceName(piece) {
  let height = piece[0] === "T" ? "Tall" : "Short";
  let colour = piece[1] === "L" ? "Light" : "Dark";
  let shape = piece[2] === "R" ? "Round" : "Square";
  let hole = piece[3] === "H" ? "Hollow" : "Solid";

  return height + " " + colour + " " + shape + " " + hole;
}

function saveScores() {
  localStorage.setItem("humanScore", humanScore);
  localStorage.setItem("botScore", botScore);
  localStorage.setItem("player1Score", player1Score);
  localStorage.setItem("player2Score", player2Score);
}