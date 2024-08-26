const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');

// Dimensiuni inițiale ale canvas-ului
const initialWidth = 800;
const initialHeight = 600;
canvas.width = initialWidth;
canvas.height = initialHeight;

// Încărcarea imaginilor
const playerImage = new Image();
playerImage.src = 'img/laur.jpg'; // Imaginea pentru jucător

const obstacleImage = new Image();
obstacleImage.src = 'img/corina.jpg'; // Imaginea pentru obstacole

const playerSize = 70; // Dimensiunea jucătorului
const obstacleRadius = 25; // Raza obstacolului rotund
let playerSpeed = 5;
const normalSpeed = 100; // Viteza normală
const boostedSpeed = 500; // Viteza crescută când butonul este apăsat
let playerX, playerY;
let obstacles = [];
let obstacleSpeed = 30;
let score;
let gameInterval;
let gameOverFlag = false;

// Variabile pentru gestionarea duratei apăsării butonului
let pressStartTime = 0;
const longPressThreshold = 700; // Durata în milisecunde pentru a considera apăsarea ca fiind lungă

// Ajustează dimensiunile canvas-ului la dimensiunea ferestrei
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Realiniază jucătorul după redimensionare
    playerX = canvas.width / 2 - playerSize / 2;
    playerY = canvas.height - playerSize - 10;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Apel inițial pentru a seta dimensiunile corecte

// Inițializează jocul
function initGame() {
    playerX = canvas.width / 2 - playerSize / 2;
    playerY = canvas.height - playerSize - 10;
    obstacles = [];
    obstacleSpeed = 3;
    score = 0;
    gameOverFlag = false;
    restartButton.style.display = 'none'; // Ascunde butonul la început
}

// Adăugați un nou obstacol
function addObstacle() {
    const x = Math.random() * (canvas.width - 2 * obstacleRadius) + obstacleRadius;
    obstacles.push({ x, y: -obstacleRadius });
}

// Funcția de actualizare a jocului
function update() {
    if (gameOverFlag) {
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenează fundalul dinamic
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'lightblue');
    gradient.addColorStop(1, 'purple');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenează jucătorul
    ctx.drawImage(playerImage, playerX, playerY, playerSize, playerSize);

    // Desenează obstacolele
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.y += obstacleSpeed;

        // Desenăm obstacolul rotund cu imagine
        ctx.save(); // Salvează starea curentă a contextului
        ctx.beginPath();
        ctx.arc(obstacle.x, obstacle.y, obstacleRadius, 0, Math.PI * 2);
        ctx.clip(); // Tăiați imaginea într-un cerc
        ctx.drawImage(obstacleImage, obstacle.x - obstacleRadius, obstacle.y - obstacleRadius, obstacleRadius * 2, obstacleRadius * 2);
        ctx.restore(); // Restaurează starea curentă a contextului

        // Verificăm coliziunea cu jucătorul
        if (Math.hypot(obstacle.x - (playerX + playerSize / 2), obstacle.y - (playerY + playerSize / 2)) < obstacleRadius + playerSize / 2) {
            gameOver();
            return; // Opriți actualizarea după ce jocul este terminat
        }

        // Elimină obstacolele care au ieșit din canvas
        if (obstacle.y > canvas.height + obstacleRadius) {
            obstacles.splice(i, 1);
            score++;
        }
    }

    // Adaugă un nou obstacol din când în când
    if (Math.random() < 0.02) {
        addObstacle();
    }

    // Desenează scorul
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
}

// Funcția de terminare a jocului
function gameOver() {
    clearInterval(gameInterval);
    gameOverFlag = true;
    restartButton.style.display = 'block'; // Afișează butonul de restart
}

// Mișcare jucător la apăsarea butoanelor
function movePlayer(direction) {
    if (direction === 'left') {
        playerX -= playerSpeed;
        if (playerX < 0) playerX = 0;
    } else if (direction === 'right') {
        playerX += playerSpeed;
        if (playerX + playerSize > canvas.width) playerX = canvas.width - playerSize;
    }
}

function onButtonPress(e, direction) {
    e.preventDefault(); // Previne acțiuni implicite
    pressStartTime = Date.now(); // Înregistrează momentul în care butonul a fost apăsat
    const moveInterval = setInterval(() => {
        if (Date.now() - pressStartTime >= longPressThreshold) {
            // Mișcare continuă cu viteză mare
            playerSpeed = boostedSpeed;
        } else {
            // Mișcare normală
            movePlayer(direction);
        }
    }, 100); // Verifică mișcarea la fiecare 1ms

    const endPress = () => {
        clearInterval(moveInterval);
        playerSpeed = normalSpeed; // Revine la viteza normală
        document.removeEventListener('mouseup', endPress);
        document.removeEventListener('touchend', endPress);
    };
    document.addEventListener('mouseup', endPress);
    document.addEventListener('touchend', endPress);
}

leftButton.addEventListener('mousedown', (e) => onButtonPress(e, 'left'));
rightButton.addEventListener('mousedown', (e) => onButtonPress(e, 'right'));

// Pentru dispozitive mobile, folosim touchstart în loc de mousedown
leftButton.addEventListener('touchstart', (e) => onButtonPress(e, 'left'));
rightButton.addEventListener('touchstart', (e) => onButtonPress(e, 'right'));

restartButton.addEventListener('click', () => {
    initGame();
    gameInterval = setInterval(update, 1000 / 60); // Repornește actualizarea jocului
});

// Începe jocul
initGame();
gameInterval = setInterval(update, 1000 / 60);