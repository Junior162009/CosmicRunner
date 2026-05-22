// Jugador
const player = {
    x: 0, y: 0,
    width: 40, height: 50,
    lane: 1,
    vy: 0,
    isJumping: false,
    targetX: 0,
    color: '#00d4ff',
    trail: [],
    bobOffset: 0,
};

function resetPlayer() {
    const laneWidth = canvasWidth / CONFIG.laneCount;
    player.lane = 1;
    player.targetX = laneWidth * player.lane + laneWidth / 2 - player.width / 2;
    player.x = player.targetX;
    player.y = groundY - player.height;
    player.vy = 0;
    player.isJumping = false;
    player.trail = [];
}

function updatePlayer(deltaTime) {
    const laneWidth = canvasWidth / CONFIG.laneCount;
    player.targetX = laneWidth * player.lane + laneWidth / 2 - player.width / 2;
    player.x += (player.targetX - player.x) * 0.15 * (deltaTime * 0.06);

    player.vy += CONFIG.gravity * (deltaTime * 0.06);
    player.y += player.vy * (deltaTime * 0.06);

    if (player.y >= groundY - player.height) {
        player.y = groundY - player.height;
        player.vy = 0;
        player.isJumping = false;
    }

    player.bobOffset = player.isJumping ? 0 : Math.sin(gameTime * 0.01) * 3;

    // Trail
    if (Math.random() < 0.5) {
        player.trail.push({
            x: player.x + player.width / 2 + (Math.random() - 0.5) * 20,
            y: player.y + player.height,
            life: 15 + Math.random() * 10,
            color: player.color,
        });
    }
    for (let i = player.trail.length - 1; i >= 0; i--) {
        player.trail[i].life -= deltaTime * 0.06;
        if (player.trail[i].life <= 0) player.trail.splice(i, 1);
    }
}

function jump() {
    if (!player.isJumping) {
        player.vy = CONFIG.jumpForce;
        player.isJumping = true;
        for (let i = 0; i < 8; i++) {
            particles.push({
                x: player.x + player.width / 2,
                y: player.y + player.height,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 2 + 1,
                life: 15,
                color: '#00ffd5',
                size: 2 + Math.random() * 2,
            });
        }
    }
}

function moveLeft() {
    player.lane = Math.max(0, player.lane - 1);
}

function moveRight() {
    player.lane = Math.min(CONFIG.laneCount - 1, player.lane + 1);
}