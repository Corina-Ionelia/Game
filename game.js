const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');

// Dimensiuni inițiale ale canvas-ului
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    playerX = canvas.width / 2 - playerSize / 2;
    playerY = canvas.height - playerSize - 10;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Apel inițial pentru a seta dimensiunile corecte

// Încărcarea imaginilor
const playerImage = new Image();
playerImage.src = 'img/laur.jpg'; // Imaginea pentru jucător

const obstacleImage = new Image();
obstacleImage.src = 'img/corina.jpg'; // Imaginea pentru obstacole

const playerSize = 50; // Dimensiunea jucătorului
const obstacleRadius = 30; // Raza obstacolului rotund (ajustabilă în funcție de imagine)
const playerSpeed = 5;
let playerX, playerY;
let obstacles = [];
let obstacleSpeed = 3;
let score;
let gameInterval;
let gameOverFlag = false;

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

    if (Math.random() < 0.02) {
        addObstacle();
    }

    // Asigură-te că textul pentru scor este bine poziționat și vizibil
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left'; // Poziționează textul la stânga
    ctx.fillText('Score: ' + score, 10, 30); // Ajustează poziția dacă este necesar
}

// Controlul jucătorului
function movePlayer(direction) {
    if (direction === 'left') {
        playerX -= playerSpeed;
        if (playerX < 0) playerX = 0;
    } else if (direction === 'right') {
        playerX += playerSpeed;
        if (playerX + playerSize > canvas.width) playerX = canvas.width - playerSize;
    }
}

// Evenimente pentru butoanele de control
leftButton.addEventListener('click', () => movePlayer('left'));
rightButton.addEventListener('click', () => movePlayer('right'));

// Funcția de finalizare a jocului
function gameOver() {
    clearInterval(gameInterval); // Opriți actualizarea jocului
    gameOverFlag = true;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; // Culoare de fundal întunecată pentru ecranul de game over
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
    restartButton.style.display = 'block'; // Arată butonul de restart în centrul jocului
    restartButton.style.position = 'absolute'; // Asigură-te că butonul este în centrul ecranului
}

// Funcția de restart
function restartGame() {
    initGame();
    gameInterval = setInterval(update, 1000 / 60); // Repornește actualizarea jocului
}

// Adaugă event listener la butonul de restart
restartButton.addEventListener('click', restartGame);

// Inițializează jocul și începe actualizarea
initGame();
gameInterval = setInterval(update, 1000 / 60); // Actualizare joc la 60 FPS