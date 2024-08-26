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

const playerSize = 50; // Dimensiunea jucătorului
const obstacleRadius = 20; // Raza obstacolului rotund
let playerSpeed = 5;
const normalSpeed = 5; // Viteza normală
const boostedSpeed = 10; // Viteza crescută când butonul este apăsat
let playerX, playerY;
let obstacles = [];
let obstacleSpeed = 3;
let score;
let gameInterval;
let gameOverFlag = false;

// Variabile pentru gestionarea duratei apăsării butonului
let pressStartTime = 0;
const longPressThreshold = 500; // Durata în milisecunde pentru a considera apăsarea ca fiind lungă

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

    if (Math.random() < 0.02) {
        addObstacle();
    }

    // Asigură-te că textul pentru scor este bine poziționat și vizibil pe toate dispozitivele
    ctx.fillStyle = 'black';
    ctx.font = 'bold 20px Arial'; // Ajustează dimensiunea fontului
    ctx.textAlign = 'left'; // Poziționează textul la stânga
    ctx.fillText('Score: ' + score, 20, 40); // Ajustează poziția și marginea scorului

    // Alternativ, pentru a fi mai vizibil pe toate dispozitivele
    ctx.font = `${Math.max(16, Math.min(canvas.width / 50, 24))}px Arial`; // Scorul se ajustează proporțional cu dimensiunea ecranului
}

// Controlul jucătorului
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        playerX -= playerSpeed;
        if (playerX < 0) playerX = 0;
    } else if (event.key === 'ArrowRight') {
        playerX += playerSpeed;
        if (playerX + playerSize > canvas.width) playerX = canvas.width - playerSize;
    }
});

// Control pentru butoanele pe mobil
function onButtonPress(e, direction) {
    pressStartTime = Date.now(); // Înregistrează momentul în care butonul a fost apăsat
    const moveInterval = setInterval(() => {
        if (Date.now() - pressStartTime >= longPressThreshold) {
            // Dacă timpul apăsării este mai mare decât threshold-ul, mișcare rapidă
            playerSpeed = boostedSpeed;
        } else {
            // Mișcare scurtă pentru apăsări scurte
            if (direction === 'left') {
                playerX -= playerSpeed;
                if (playerX < 0) playerX = 0;
            } else if (direction === 'right') {
                playerX += playerSpeed;
                if (playerX + playerSize > canvas.width) playerX = canvas.width - playerSize;
            }
        }
    }, 100); // Verifică mișcarea la fiecare 100ms

    // Oprește intervalul atunci când butonul este eliberat
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

document.addEventListener('mouseup', () => playerSpeed = normalSpeed); // Revine la viteza normală când butonul este eliberat
document.addEventListener('touchend', () => playerSpeed = normalSpeed); // Revine la viteza normală când butonul este eliberat pe mobil

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
    restartButton.style.position = 'absolute'; // Asigură-te că butonul este poziționat absolut
    restartButton.style.top = '50%'; // Center în verticală
    restartButton.style.left = '50%'; // Center în orizontală
    restartButton.style.transform = 'translate(-50%, -50%)'; // Center pe baza punctului de mijloc
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