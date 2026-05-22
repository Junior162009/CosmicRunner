// Interfaz de usuario y elementos visuales auxiliares
let scorePopups = [];
let particles = [];
let stars = [];
let floorTiles = [];

function updateUI() {
    document.getElementById('lives-display').textContent = lives;
    document.getElementById('score-display').textContent = Math.floor(score);
    document.getElementById('level-display').textContent = level;
    const percent = Math.min(100, Math.floor((chaseLevel / CONFIG.chaseMax) * 100));
    document.getElementById('chase-bar-inner').style.width = percent + '%';
    const bar = document.getElementById('chase-bar-inner');
    if (percent > 75) bar.style.background = 'linear-gradient(90deg, #ff2d50, #ff0000)';
    else if (percent > 40) bar.style.background = 'linear-gradient(90deg, #ff6b35, #ff2d95)';
    else bar.style.background = 'linear-gradient(90deg, #ff2d95, #ff6b35)';
}

function spawnScorePopup(text, color) {
    scorePopups.push({
        x: player.x + player.width / 2,
        y: player.y - 20,
        text, color,
        life: 50,
        vy: -2.5,
    });
}

function updateParticles(deltaTime) {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].vx * (deltaTime * 0.06);
        particles[i].y += particles[i].vy * (deltaTime * 0.06);
        particles[i].life -= deltaTime * 0.06;
        if (particles[i].life <= 0) particles.splice(i, 1);
    }
    for (let i = scorePopups.length - 1; i >= 0; i--) {
        scorePopups[i].y += scorePopups[i].vy * (deltaTime * 0.06);
        scorePopups[i].life -= deltaTime * 0.06;
        if (scorePopups[i].life <= 0) scorePopups.splice(i, 1);
    }
}

function generateStars() {
    stars = [];
    for (let i = 0; i < 120; i++) {
        stars.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight * 0.7,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.2,
            brightness: Math.random(),
            twinkleSpeed: Math.random() * 0.02 + 0.005,
        });
    }
}

function updateStars(deltaTime) {
    for (let s of stars) {
        s.brightness += s.twinkleSpeed * (deltaTime * 0.06);
        if (s.brightness > 1 || s.brightness < 0.2) s.twinkleSpeed *= -1;
        s.x -= s.speed * (deltaTime * 0.02);
        if (s.x < -5) s.x = canvasWidth + 5;
    }
}

function generateFloorTiles() {
    floorTiles = [];
    const tileWidth = 60;
    const count = Math.ceil(canvasWidth / tileWidth) + 2;
    for (let i = 0; i < count; i++) {
        floorTiles.push({
            x: i * tileWidth,
            y: groundY,
            width: tileWidth,
            height: 6,
            glowPhase: Math.random() * Math.PI * 2,
        });
    }
}

function updateFloorTiles(deltaTime, cfg) {
    for (let tile of floorTiles) {
        tile.x -= cfg.obstacleSpeed * 1.2 * (deltaTime * 0.06);
        tile.glowPhase += deltaTime * 0.003;
        if (tile.x + tile.width < -10) tile.x = canvasWidth + Math.random() * 40;
    }
}