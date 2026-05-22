// Obstáculos
let obstacles = [];

function spawnObstacle(cfg) {
    const laneWidth = canvasWidth / CONFIG.laneCount;
    const lane = Math.floor(Math.random() * CONFIG.laneCount);
    const types = ['laser', 'drone', 'platform', 'electric-gate'];
    const type = types[Math.floor(Math.random() * types.length)];
    const obs = {
        x: canvasWidth + 20,
        y: groundY - 45,
        width: 35, height: 40,
        lane: lane,
        type: type,
        speed: cfg.obstacleSpeed,
        passed: false,
        glowPhase: Math.random() * Math.PI * 2,
        color: '#ff2d50',
    };
    switch (type) {
        case 'laser': obs.width = 8; obs.height = 55; obs.y = groundY - obs.height; obs.color = '#ff2d50'; break;
        case 'drone': obs.width = 36; obs.height = 30; obs.y = groundY - obs.height - 20; obs.color = '#ff6b35'; break;
        case 'platform': obs.width = 50; obs.height = 14; obs.y = groundY - obs.height; obs.color = '#b44dff'; break;
        case 'electric-gate': obs.width = 30; obs.height = 60; obs.y = groundY - obs.height; obs.color = '#ffd700'; break;
    }
    obs.x = laneWidth * lane + laneWidth / 2 - obs.width / 2 + canvasWidth;
    obstacles.push(obs);
}

function updateObstacles(deltaTime, cfg) {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacles[i].speed * (deltaTime * 0.06);
        obstacles[i].glowPhase += deltaTime * 0.004;
        if (obstacles[i].x + obstacles[i].width < -50) {
            if (!obstacles[i].passed) score += 25;
            obstacles.splice(i, 1);
        }
    }
}

function checkCollisions() {
    for (let obs of obstacles) {
        if (obs.passed) continue;
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            obs.passed = true;
            if (!questionActive) showQuestion();
            chaseLevel = Math.min(CONFIG.chaseMax, chaseLevel + 8);
            spawnScorePopup('⚡ Obstáculo!', '#ff6b35');
            for (let i = 0; i < 10; i++) {
                particles.push({
                    x: obs.x + obs.width / 2,
                    y: obs.y + obs.height / 2,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    life: 20,
                    color: obs.color || '#fff',
                    size: 2 + Math.random() * 3,
                });
            }
            break;
        }
    }
}