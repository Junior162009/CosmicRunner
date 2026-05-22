// Enemigo
const enemy = {
    x: 0, y: 0,
    width: 44, height: 55,
    color: '#ff2d95',
    glowIntensity: 0.5,
    particles: [],
};

function resetEnemy() {
    enemy.x = canvasWidth * 0.55;
    enemy.y = groundY - enemy.height;
    enemy.particles = [];
    enemy.glowIntensity = 0.5;
}

function updateEnemy(deltaTime, cfg) {
    const targetX = player.x + player.width / 2 - enemy.width / 2;
    const speed = cfg.enemySpeed * (0.7 + (chaseLevel / CONFIG.chaseMax) * 0.6);
    enemy.x += (targetX - enemy.x) * 0.03 * (deltaTime * 0.06);
    enemy.x += speed * (deltaTime * 0.06);
    enemy.y = groundY - enemy.height;
    enemy.glowIntensity = 0.5 + (chaseLevel / CONFIG.chaseMax) * 0.5;

    if (Math.random() < 0.4) {
        enemy.particles.push({
            x: enemy.x - 5,
            y: enemy.y + enemy.height / 2 + (Math.random() - 0.5) * 40,
            vx: -Math.random() * 2 - 1,
            vy: (Math.random() - 0.5) * 3,
            life: 20 + Math.random() * 20,
            color: enemy.color,
            size: 1.5 + Math.random() * 2.5,
        });
    }
    for (let i = enemy.particles.length - 1; i >= 0; i--) {
        enemy.particles[i].x += enemy.particles[i].vx * (deltaTime * 0.06);
        enemy.particles[i].y += enemy.particles[i].vy * (deltaTime * 0.06);
        enemy.particles[i].life -= deltaTime * 0.06;
        if (enemy.particles[i].life <= 0) enemy.particles.splice(i, 1);
    }
}