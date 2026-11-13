// إعدادات لوحة اللعب
const ROWS = 6;
const COLS = 8;
const TOTAL_CELLS = ROWS * COLS;

// بيانات اللاعبين

const players = [
    {
        id: 0,
        name: "الأحمر",
        color: "#ef4444",
        wins: { cpu: 0, "2": 0, "3": 0, "4": 0 }
    },
    {
        id: 1,
        name: "الأزرق",
        color: "#3b82f6",
        wins: { cpu: 0, "2": 0, "3": 0, "4": 0 }
    },
    {
        id: 2,
        name: "الأخضر",
        color: "#22c55e",
        wins: { cpu: 0, "2": 0, "3": 0, "4": 0 }
    },
    {
        id: 3,
        name: "الأصفر",
        color: "#eab308",
        wins: { cpu: 0, "2": 0, "3": 0, "4": 0 }
    }
];


// حالة اللعبة
const gameState = {
    mode: null,
    activePlayers: [],
    currentPlayer: null,
    board: [],
    started: false,
    gameOver: false,
    animating: false
};

// عناصر الصفحة
const boardElement = document.getElementById("game-board");
const gameMenu = document.querySelector(".game-menu");
const gameSection = document.querySelector(".game-board-section");

const modeButtons = document.querySelectorAll(".mode-buttons button");
const starterScreen = document.getElementById("starter-screen");
const starterColor = document.getElementById("starter-color");
const starterName = document.getElementById("starter-name");
const startMatchButton = document.getElementById("start-match");
const playersScreen = document.getElementById("players-screen");
const playersStats = document.getElementById("players-stats");
const beginLotteryButton = document.getElementById("begin-lottery");
const playersBackButton = document.getElementById("players-back");
// تجهيز لوحة اللعب
function createBoard() {
    boardElement.innerHTML = "";

    gameState.board = [];

    for (let i = 0; i < TOTAL_CELLS; i++) {
        gameState.board.push({
            owner: null,
            count: 0
        });

        const cell = document.createElement("div");

        cell.classList.add("cell");
        cell.dataset.index = i;

        boardElement.appendChild(cell);
    }
}

// اختيار اللاعبين حسب وضع اللعب
function setupPlayers(mode) {
    gameState.mode = mode;

    const numberOfPlayers = mode === "cpu" ? 2 : Number(mode);

    gameState.activePlayers = players.slice(0, numberOfPlayers);

    players.forEach(player => {
        player.hasPlayed = false;
        player.isCPU = false;
    });

    if (mode === "cpu") {
        gameState.activePlayers[1].isCPU = true;
    }
}


function renderPlayerStats() {
    playersStats.innerHTML = "";

    // عرض جميع اللاعبين المشاركين في الوضع المختار
    const numberOfPlayers =
        gameState.mode === "cpu" ? 2 : Number(gameState.mode);

    const statsPlayers = players.slice(0, numberOfPlayers);

    const sortedPlayers = [...statsPlayers].sort(
    (a, b) =>
        b.wins[gameState.mode] - a.wins[gameState.mode]
);

    sortedPlayers.forEach((player, index) => {
        const card = document.createElement("div");

        card.className = "player-stat-card";
        card.dataset.playerId = player.id;

        if (player.wins[gameState.mode] > 0 && index === 0) {
            card.classList.add("top-player");
        }

        card.innerHTML = `
            <div class="player-stat-color"
                 style="background:${player.color}; color:${player.color}">
            </div>

            <h3>${player.name}</h3>

            <div class="player-stat-wins">${player.wins[gameState.mode]}</div>

            <span>انتصارات</span>

            ${player.wins[gameState.mode] > 0 && index === 0
                ? '<div class="top-player-label">👑 المتصدر</div>'
                : ''}
        `;

        playersStats.appendChild(card);
    });
}


// اختيار أول لاعب عشوائيا
function chooseStartingPlayer() {
    const randomIndex = Math.floor(
        Math.random() * gameState.activePlayers.length
    );

    return gameState.activePlayers[randomIndex];
}
async function animateStarterSelection(winner) {
    const status = document.getElementById("lottery-status");

    startMatchButton.disabled = true;
    startMatchButton.textContent = "جاري الاختيار...";

    status.textContent = "🎲 القرعة شغالة...";

    const playersList = gameState.activePlayers;
    const startIndex = Math.floor(Math.random() * playersList.length);

    const totalSteps = 22;

    for (let i = 0; i < totalSteps; i++) {
        let player;

        if (i === totalSteps - 1) {
            player = winner;
        } else {
            player = playersList[
                (startIndex + i) % playersList.length
            ];
        }

        starterColor.style.backgroundColor = player.color;
        starterName.textContent = player.name;

        // إبطاء الحركة تدريجيًا
        const delay = 55 + (i * i * 0.75);

        await wait(delay);
    }

    starterColor.style.backgroundColor = winner.color;
    starterName.textContent = winner.name;

    status.textContent = "🏆 القرعة انتهت! " + winner.name + " هيبدأ.";

    startMatchButton.disabled = false;
    startMatchButton.textContent = "ابدأ اللعب";
}
// تحديث لون الخلفية ومعلومات الدور
function updateCurrentPlayer() {
    const player = gameState.currentPlayer;

    if (!player) return;

    const turnColor = document.getElementById("turn-player-color");
    const turnName = document.getElementById("turn-player-name");

    turnColor.style.backgroundColor = player.color;
    turnColor.style.color = player.color;

    turnName.textContent = player.name;
    turnName.style.color = player.color;

    document.body.style.background =
        `linear-gradient(135deg, #10172f, ${player.color}55, #1e1b4b)`;

    boardElement.style.backgroundColor = player.color + "33";
    boardElement.style.borderColor = player.color;
}

// بدء تجهيز المباراة
function startGame(mode) {
    setupPlayers(mode);

    gameState.started = false;
    gameState.gameOver = false;
    gameState.animating = false;

    gameMenu.style.display = "none";
    gameSection.style.display = "none";
    starterScreen.style.display = "none";
    playersScreen.style.display = "block";

    renderPlayerStats();

    document.body.style.background =
        "linear-gradient(135deg, #10172f, #1e1b4b, #312e81)";
}

// ربط أزرار القائمة
modeButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        const modes = ["cpu", "2", "3", "4"];

        startGame(modes[index]);
    });
});
startMatchButton.addEventListener("click", () => {
    starterScreen.style.display = "none";
    gameSection.style.display = "block";

    gameState.started = true;

    updateCurrentPlayer();

    if (gameState.currentPlayer.isCPU) {
        setTimeout(playComputerTurn, 600);
    }
});
beginLotteryButton.addEventListener("click", () => {
    setupPlayers(gameState.mode);

    createBoard();

    gameState.currentPlayer = chooseStartingPlayer();

    gameState.started = false;
    gameState.gameOver = false;

    playersScreen.style.display = "none";
    starterScreen.style.display = "block";
    gameSection.style.display = "none";

    const player = gameState.currentPlayer;

    starterName.style.color = player.color;
    starterColor.style.backgroundColor = player.color;

    animateStarterSelection(player);
});

playersBackButton.addEventListener("click", () => {
    playersScreen.style.display = "none";
    gameMenu.style.display = "block";
});
const exitButton = document.getElementById("exit-game");
const exitModal = document.getElementById("exit-modal");
const cancelExit = document.getElementById("cancel-exit");
const confirmExit = document.getElementById("confirm-exit");

// إظهار كارت الخروج
exitButton.addEventListener("click", () => {
    exitModal.style.display = "flex";
});

// إلغاء الخروج
cancelExit.addEventListener("click", () => {
    exitModal.style.display = "none";
});

// تأكيد الخروج
confirmExit.addEventListener("click", () => {
    gameState.started = false;
    gameState.gameOver = false;
    gameState.currentPlayer = null;
    gameState.activePlayers = [];

    exitModal.style.display = "none";
    gameSection.style.display = "none";
    starterScreen.style.display = "none";
    gameMenu.style.display = "block";

    document.body.style.background =
        "linear-gradient(135deg, #10172f, #1e1b4b, #312e81)";
});
// تنفيذ حركة اللاعب
async function makeMove(index) {
    if (
        !gameState.started ||
        gameState.gameOver ||
        gameState.animating
    ) return;

    const player = gameState.currentPlayer;
    const cell = gameState.board[index];

    if (!player.hasPlayed) {
        const row = Math.floor(index / COLS);
        const col = index % COLS;

        const isInnerCell =
            row > 0 && row < ROWS - 1 &&
            col > 0 && col < COLS - 1;

        if (cell.owner !== null || !isInnerCell) return;

        cell.owner = player.id;
        cell.count = 3;
        player.hasPlayed = true;
    } else {
        if (cell.owner !== player.id) return;

        cell.count++;
    }

    gameState.animating = true;

    renderCell(index);

    if (cell.count >= getCriticalMass(index)) {
        await resolveExplosions(index, player.id);
    }

    gameState.animating = false;

if (gameState.started && !gameState.gameOver) {
    const winner = checkForWinner();

    if (winner) {
        showWinner(winner);
        return;
    }

    nextTurn();
}
}
// استبعاد اللاعبين الذين فقدوا كل خلاياهم
function checkForWinner() {
    gameState.activePlayers =
        gameState.activePlayers.filter(player => {
            if (!player.hasPlayed) return true;

            return gameState.board.some(
                cell => cell.owner === player.id
            );
        });

    if (
        gameState.activePlayers.length === 1 &&
        gameState.activePlayers[0].hasPlayed
    ) {
        return gameState.activePlayers[0];
    }

    return null;
}

// عرض شاشة الفائز


function showWinner(player) {
    // منع تسجيل الفوز أكثر من مرة
    if (gameState.gameOver) return;

    gameState.gameOver = true;

    // تسجيل فوز واحد فقط
    player.wins[gameState.mode]++;

    const winnerScreen =
        document.getElementById("winner-screen");

    const winnerColor =
        document.getElementById("winner-color");

    const winnerName =
        document.getElementById("winner-name");

    winnerColor.style.backgroundColor = player.color;
    winnerColor.style.color = player.color;

    winnerName.textContent = player.name;
    winnerName.style.color = player.color;

    winnerScreen.style.display = "flex";

    renderPlayerStats();

    const winnerCard = document.querySelector(
        `.player-stat-card[data-player-id="${player.id}"]`
    );

    if (winnerCard) {
        winnerCard.classList.add("match-winner");
    }
}


// تحديد عدد النقط اللازمة للانفجار
function getCriticalMass(index) {
    return 4;
}
// الحصول على الخلايا المجاورة
function getNeighbors(index) {
    const row = Math.floor(index / COLS);
    const col = index % COLS;

    const neighbors = [];

    if (row > 0) neighbors.push(index - COLS);
    if (row < ROWS - 1) neighbors.push(index + COLS);
    if (col > 0) neighbors.push(index - 1);
    if (col < COLS - 1) neighbors.push(index + 1);

    return neighbors;
}
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// تنفيذ الانفجارات المتسلسلة
async function resolveExplosions(startIndex, playerId) {
    const queue = [startIndex];
    const queued = new Set([startIndex]);

    while (queue.length > 0) {
        const index = queue.shift();
        queued.delete(index);

        const cell = gameState.board[index];
        const criticalMass = getCriticalMass(index);

        while (cell.count >= criticalMass) {

            const cellElement = boardElement.children[index];

            // تأثير بداية الانفجار
            cellElement.classList.add("exploding");
            await wait(180);

            // تفريغ الخلية
            cell.count -= criticalMass;

            cell.owner =
                cell.count === 0 ? null : playerId;

            renderCell(index);

            const neighbors = getNeighbors(index);

            // انتقال النقط للخانات المجاورة
            for (const neighborIndex of neighbors) {
                const neighbor = gameState.board[neighborIndex];

                neighbor.owner = playerId;
                neighbor.count++;

                renderCell(neighborIndex);

                const neighborElement =
                    boardElement.children[neighborIndex];

                neighborElement.classList.add("receiving");

                await wait(65);

                neighborElement.classList.remove("receiving");

                if (
                    neighbor.count >= getCriticalMass(neighborIndex) &&
                    !queued.has(neighborIndex)
                ) {
                    queue.push(neighborIndex);
                    queued.add(neighborIndex);
                }
            }

            await wait(100);
            cellElement.classList.remove("exploding");
        }
    }
}
function renderBoard() {
    for (let i = 0; i < TOTAL_CELLS; i++) {
        renderCell(i);
    }
}
// رسم النقط داخل الخلية

function renderCell(index) {
    const cellData = gameState.board[index];
    const cellElement = boardElement.children[index];

    let orbContainer = cellElement.querySelector(".orb-container");

    // لو الخلية فضيت، نشيل الدائرة فقط
    if (cellData.count === 0) {
        if (orbContainer) orbContainer.remove();
        return;
    }

    const player = players[cellData.owner];

    // إنشاء الدائرة مرة واحدة فقط
    if (!orbContainer) {
        orbContainer = document.createElement("div");
        orbContainer.className = "orb-container";
        cellElement.appendChild(orbContainer);
    }

    // تغيير اللون بدون إعادة إنشاء الدائرة
    orbContainer.style.backgroundColor = player.color;

    const positions = {
    1: [["1 / 3", "1 / 3"]],
    2: [["1", "1"], ["2", "2"]],
    3: [["1", "1"], ["2", "1"], ["1 / 3", "2"]],
    4: [["1", "1"], ["2", "1"], ["1", "2"], ["2", "2"]]
};

// نعرض 4 نقط كحد أقصى أثناء انتظار الانفجار
const displayCount = Math.min(cellData.count, 4);

// حذف النقط الزائدة
while (orbContainer.children.length > displayCount) {
    orbContainer.lastElementChild.remove();
}

// إضافة النقط الناقصة
while (orbContainer.children.length < displayCount) {
    const dot = document.createElement("span");
    dot.className = "orb";
    orbContainer.appendChild(dot);
}

// ضبط أماكن النقط
Array.from(orbContainer.children).forEach((dot, i) => {
    dot.style.gridColumn = positions[displayCount][i][0];
    dot.style.gridRow = positions[displayCount][i][1];
});
}

// الانتقال للاعب التالي
function nextTurn() {
    const currentIndex = gameState.activePlayers.indexOf(
        gameState.currentPlayer
    );

    const nextIndex =
        (currentIndex + 1) % gameState.activePlayers.length;

    gameState.currentPlayer =
        gameState.activePlayers[nextIndex];

    updateCurrentPlayer();

    if (gameState.currentPlayer.isCPU) {
        setTimeout(playComputerTurn, 600);
    }
}

// حركة الكمبيوتر
function playComputerTurn() {
    if (!gameState.started || gameState.gameOver) return;
    if (!gameState.currentPlayer.isCPU) return;

    const player = gameState.currentPlayer;

    let availableCells;

     if (!player.hasPlayed) {
    availableCells = gameState.board
        .map((cell, index) => {
            const row = Math.floor(index / COLS);
            const col = index % COLS;

            const isInner =
                row > 0 && row < ROWS - 1 &&
                col > 0 && col < COLS - 1;

            return cell.owner === null && isInner
                ? index
                : -1;
        })
        .filter(index => index !== -1);
}else {
        availableCells = gameState.board
            .map((cell, index) =>
                cell.owner === player.id ? index : -1
            )
            .filter(index => index !== -1);
    }

    if (availableCells.length === 0) return;

    const randomIndex = Math.floor(
        Math.random() * availableCells.length
    );

    makeMove(availableCells[randomIndex]);
}

// استقبال ضغطات اللاعب على الخلايا
boardElement.addEventListener("click", event => {
    const cellElement = event.target.closest(".cell");

    if (!cellElement) return;
    if (!gameState.started) return;
    if (gameState.currentPlayer.isCPU) return;

    const index = Number(cellElement.dataset.index);

    makeMove(index);
});
// العودة للقائمة الرئيسية بعد الفوز
document.getElementById("winner-home").addEventListener("click", () => {
    document.getElementById("winner-screen").style.display = "none";

    gameState.started = false;
    gameState.gameOver = false;
    gameState.animating = false;
    gameState.currentPlayer = null;
    gameState.activePlayers = [];

    gameSection.style.display = "none";
    starterScreen.style.display = "none";
    gameMenu.style.display = "block";

    document.body.style.background =
        "linear-gradient(135deg, #10172f, #1e1b4b, #312e81)";
});

// بدء مباراة جديدة
document.getElementById("play-again").addEventListener("click", () => {
    document.getElementById("winner-screen").style.display = "none";

    gameState.started = false;
    gameState.gameOver = false;
    gameState.animating = false;

    gameSection.style.display = "none";
    starterScreen.style.display = "none";
    playersScreen.style.display = "block";

    renderPlayerStats();
});