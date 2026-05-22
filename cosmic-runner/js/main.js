// Variables globales del juego
let canvas, ctx, canvasWidth, canvasHeight, groundY;
let gameState = 'menu'; // menu, playing, gameover
let difficulty = 'medium';
let score = 0;
let lives = 3;
let level = 1;
let chaseLevel = 20;
let gameTime = 0;
let animationId;
let lastTime = 0;

// Inicialización
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 200));

    generateStars();
    generateFloorTiles();
    resetPlayer();
    resetEnemy();
    updateUI();
    setupInput();

    // Cargar preguntas y empezar bucle
    loadQuestions().then(() => {
        document.getElementById('menu-screen').classList.remove('hidden');
        lastTime = performance.now();
        animationId = requestAnimationFrame(gameLoop);
    });
}

function resizeCanvas() {
    const wrapper = document.getElementById('game-wrapper');
    canvasWidth = wrapper.clientWidth;
    canvasHeight = wrapper.clientHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    groundY = Math.floor(canvasHeight * CONFIG.groundYRatio);
    updatePlayerLaneTarget();
    if (player.x === 0) resetPlayer();
    if (enemy.x === 0) resetEnemy();
    generateStars();
    generateFloorTiles();
}

function updatePlayerLaneTarget() {
    const laneWidth = canvasWidth / CONFIG.laneCount;
    player.targetX = laneWidth * player.lane + laneWidth / 2 - player.width / 2;
    if (gameState === 'menu') player.x = player.targetX;
}

// Bucle principal
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let deltaTime = timestamp - lastTime;
    if (deltaTime > 100) deltaTime = 100;
    lastTime = timestamp;

    if (gameState === 'playing') {
        gameTime += deltaTime;
        const cfg = CONFIG.difficulties[difficulty];

        updatePlayer(deltaTime);
        updateEnemy(deltaTime, cfg);
        updateObstacles(deltaTime, cfg);
        updateParticles(deltaTime);
        updateStars(deltaTime);
        updateFloorTiles(deltaTime, cfg);

        // Generar obstáculos
        if (Math.random() < cfg.obstacleFrequency && !questionActive) spawnObstacle(cfg);

        // Persecución pasiva
        chaseLevel = Math.min(CONFIG.chaseMax, chaseLevel + CONFIG.chaseIncreaseRate * (deltaTime * 0.06));
        score += CONFIG.pointsPerSecond * (deltaTime * 0.06);

        // Pregunta periódica
        if (!questionActive && gameTime - lastQuestionTime > CONFIG.questionInterval) showQuestion();

        // Timeout de pregunta
        if (questionActive) {
            questionTimer += deltaTime;
            if (questionTimer > CONFIG.questionTimeout) {
                chaseLevel = Math.min(CONFIG.chaseMax, chaseLevel + CONFIG.chaseIncreaseWrong * 0.7);
                spawnScorePopup('⏰ Tiempo agotado', '#ff6b35');
                hideQuestion();
            }
        }

        checkCollisions();

        if (chaseLevel >= CONFIG.chaseMax) loseLife();

        const newLevel = Math.floor(score / 500) + 1;
        if (newLevel > level) {
            level = newLevel;
            spawnScorePopup('⬆ Nivel ' + level + '!', '#b44dff');
            chaseLevel = Math.max(0, chaseLevel - 10);
        }

        updateUI();
    }

    render();
    animationId = requestAnimationFrame(gameLoop);
}

function loseLife() {
    lives--;
    chaseLevel = 20;
    updateUI();
    if (lives <= 0) {
        gameOver();
    } else {
        spawnScorePopup('💔 -1 Vida', '#ff2d50');
        resetPlayer();
        resetEnemy();
        obstacles = [];
        hideQuestion();
    }
}

function startGame() {
    score = 0;
    lives = 3;
    level = 1;
    chaseLevel = 20;
    gameTime = 0;
    lastQuestionTime = 0;
    questionActive = false;
    currentQuestion = null;
    obstacles = [];
    particles = [];
    scorePopups = [];
    player.lane = 1;
    resetPlayer();
    resetEnemy();
    updatePlayerLaneTarget();
    generateFloorTiles();
    hideQuestion();
    updateUI();
    gameState = 'playing';
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('howto-screen').classList.add('hidden');
    lastTime = 0;
}

function gameOver() {
    gameState = 'gameover';
    document.getElementById('gameover-score').textContent = 'Puntuación: ' + Math.floor(score);
    document.getElementById('gameover-screen').classList.remove('hidden');
    hideQuestion();
}

function returnToMenu() {
    gameState = 'menu';
    document.getElementById('menu-screen').classList.remove('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('howto-screen').classList.add('hidden');
    hideQuestion();
    resetPlayer();
    resetEnemy();
    obstacles = [];
    particles = [];
    scorePopups = [];
    updateUI();
}

// Renderizado completo
function render() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Fondo
    const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    grad.addColorStop(0, '#050520');
    grad.addColorStop(0.5, '#0a0a2e');
    grad.addColorStop(1, '#0d0d1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Estrellas
    for (let s of stars) {
        ctx.fillStyle = `rgba(200,220,255,${0.3 + s.brightness * 0.7})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
        ctx.fill();
    }

    // Grid holográfico
    ctx.strokeStyle = 'rgba(0,180,255,0.06)';
    ctx.lineWidth = 0.5;
    for (let x = 50; x < canvasWidth; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,groundY); ctx.stroke(); }
    for (let y = 50; y < groundY; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvasWidth,y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(0,212,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0,groundY); ctx.lineTo(canvasWidth,groundY); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,212,255,0.1)';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0,groundY); ctx.lineTo(canvasWidth,groundY); ctx.stroke();

    // Suelo
    const floorGrad = ctx.createLinearGradient(0, groundY, 0, groundY+30);
    floorGrad.addColorStop(0, 'rgba(0,180,255,0.5)');
    floorGrad.addColorStop(0.3, 'rgba(0,100,200,0.3)');
    floorGrad.addColorStop(1, 'rgba(10,10,30,0.9)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, groundY, canvasWidth, canvasHeight - groundY);
    for (let t of floorTiles) {
        ctx.fillStyle = `rgba(0,200,255,${0.3+Math.sin(t.glowPhase)*0.2})`;
        ctx.fillRect(t.x, t.y, t.width-2, t.height);
    }

    // Obstáculos
    for (let obs of obstacles) {
        ctx.shadowColor = `rgba(${hexToRgb(obs.color)},0.7)`;
        ctx.shadowBlur = 12;
        if (obs.type === 'laser') {
            ctx.fillStyle = obs.color;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        } else if (obs.type === 'drone') {
            ctx.fillStyle = obs.color;
            ctx.beginPath(); ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 8); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(obs.x+obs.width/2, obs.y-4, 6, 0, Math.PI*2); ctx.fill();
        } else if (obs.type === 'platform') {
            ctx.fillStyle = obs.color;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(obs.x, obs.y, obs.width, 3);
        } else if (obs.type === 'electric-gate') {
            ctx.fillStyle = 'rgba(255,200,0,0.6)';
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3;
            ctx.strokeRect(obs.x+3, obs.y+3, obs.width-6, obs.height-6);
        }
        ctx.shadowBlur = 0;
    }

    // Partículas
    for (let p of particles) {
        ctx.fillStyle = `rgba(${hexToRgb(p.color)},${p.life/30})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    }

    // Trail jugador
    for (let t of player.trail) {
        ctx.fillStyle = `rgba(0,212,255,${t.life/30})`;
        ctx.beginPath(); ctx.arc(t.x, t.y, 2.5*(t.life/30), 0, Math.PI*2); ctx.fill();
    }

    // Jugador
    const px = player.x, py = player.y + player.bobOffset;
    ctx.shadowColor = 'rgba(0,212,255,0.7)'; ctx.shadowBlur = 18;
    const bodyGrad = ctx.createLinearGradient(px, py, px, py+player.height);
    bodyGrad.addColorStop(0,'#00e5ff'); bodyGrad.addColorStop(0.5,'#0088cc'); bodyGrad.addColorStop(1,'#004466');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath(); ctx.roundRect(px+4, py+8, player.width-8, player.height-8, 10); ctx.fill();
    ctx.fillStyle = '#00ffd5'; ctx.shadowColor = 'rgba(0,255,210,0.9)';
    ctx.beginPath(); ctx.roundRect(px+player.width/2-8, py+4, 16, 12, 6); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(px+player.width/2-3, py+9, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(px+player.width/2+3, py+9, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#005580';
    const legPhase = Math.sin(gameTime*0.03)*8;
    ctx.fillRect(px+8, py+player.height-6, 8, 10+legPhase*0.5);
    ctx.fillRect(px+player.width-16, py+player.height-6, 8, 10-legPhase*0.5);
    ctx.fillStyle = '#0077aa';
    ctx.fillRect(px-2, py+16, 6, 14+legPhase*0.3);
    ctx.fillRect(px+player.width-4, py+16, 6, 14-legPhase*0.3);
    ctx.shadowBlur = 0;

    // Enemigo
    const ex = enemy.x, ey = enemy.y;
    for (let p of enemy.particles) {
        ctx.fillStyle = `rgba(255,45,149,${p.life/30})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    }
    ctx.shadowColor = `rgba(255,45,149,${enemy.glowIntensity})`; ctx.shadowBlur = 20 + enemy.glowIntensity*15;
    const enemyGrad = ctx.createLinearGradient(ex, ey, ex, ey+enemy.height);
    enemyGrad.addColorStop(0,'#ff4488'); enemyGrad.addColorStop(0.5,'#cc1155'); enemyGrad.addColorStop(1,'#660022');
    ctx.fillStyle = enemyGrad;
    ctx.beginPath(); ctx.roundRect(ex+2, ey+6, enemy.width-4, enemy.height-6, 12); ctx.fill();
    ctx.fillStyle = '#ff0000'; ctx.shadowColor = 'rgba(255,0,0,0.9)'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(ex+enemy.width/2-6, ey+12, 3.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex+enemy.width/2+6, ey+12, 3.5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    // Popups
    for (let sp of scorePopups) {
        ctx.globalAlpha = sp.life/50;
        ctx.fillStyle = sp.color;
        ctx.font = 'bold 14px "Orbitron", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(sp.text, sp.x, sp.y);
        ctx.globalAlpha = 1;
    }

    if (gameState === 'menu') {
        ctx.fillStyle = 'rgba(5,5,20,0.3)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
}

// Arranque
window.addEventListener('load', init);