// Manejo de entrada (teclado, táctil, swipe)
function setupInput() {
    // Teclado
    document.addEventListener('keydown', (e) => {
        if (questionActive && gameState === 'playing') {
            if (e.key === '1' || e.key === '2' || e.key === '3') {
                const idx = parseInt(e.key) - 1;
                const btns = document.querySelectorAll('.option-btn');
                if (btns[idx]) btns[idx].click();
                return;
            }
        }
        switch (e.key.toLowerCase()) {
            case ' ': case 'arrowup': case 'w':
                e.preventDefault(); jump(); break;
            case 'a': case 'arrowleft':
                e.preventDefault(); moveLeft(); break;
            case 'd': case 'arrowright':
                e.preventDefault(); moveRight(); break;
        }
    });

    // Botones táctiles
    document.getElementById('btn-jump').addEventListener('pointerdown', (e) => { e.preventDefault(); jump(); });
    document.getElementById('btn-left').addEventListener('pointerdown', (e) => { e.preventDefault(); moveLeft(); });
    document.getElementById('btn-right').addEventListener('pointerdown', (e) => { e.preventDefault(); moveRight(); });

    // Swipe en canvas
    let touchStartX = 0, touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    canvas.addEventListener('touchend', (e) => {
        if (gameState !== 'playing') return;
        const dx = (e.changedTouches[0]?.clientX || touchStartX) - touchStartX;
        const dy = (e.changedTouches[0]?.clientY || touchStartY) - touchStartY;
        if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
        if (Math.abs(dy) > Math.abs(dx) && dy < -30) jump();
        else if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 30) moveRight();
            else if (dx < -30) moveLeft();
        }
    });

    // Botones de menú
    document.getElementById('btn-start').addEventListener('click', startGame);
    document.getElementById('btn-restart').addEventListener('click', startGame);
    document.getElementById('btn-menu').addEventListener('click', returnToMenu);
    document.getElementById('btn-howto').addEventListener('click', () => {
        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('howto-screen').classList.remove('hidden');
    });
    document.getElementById('btn-howto-back').addEventListener('click', () => {
        document.getElementById('howto-screen').classList.add('hidden');
        document.getElementById('menu-screen').classList.remove('hidden');
    });

    // Dificultad
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            difficulty = btn.dataset.diff;
        });
    });
}