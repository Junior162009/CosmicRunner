// Sistema de preguntas
let questionsDB = [];
let currentQuestion = null;
let questionActive = false;
let questionTimer = 0;
let lastQuestionTime = 0;

async function loadQuestions() {
    try {
        const response = await fetch('data/questions.json');
        if (!response.ok) throw new Error('No se pudo cargar questions.json');
        questionsDB = await response.json();
        console.log(`📚 ${questionsDB.length} preguntas cargadas.`);
    } catch (error) {
        console.error('Error cargando preguntas:', error);
        // Fallback: preguntas básicas
        questionsDB = [
            { question: '¿Cuánto es 8×7?', options: ['54','56','64'], answer: 1, category: 'Matemáticas', difficulty: 'Básico' },
            { question: '¿Planeta más cercano al Sol?', options: ['Venus','Mercurio','Tierra'], answer: 1, category: 'Ciencias', difficulty: 'Básico' },
            { question: '¿Qué es reciclar?', options: ['Tirar basura','Reutilizar materiales','Quemar residuos'], answer: 1, category: 'Ecología', difficulty: 'Básico' },
        ];
    }
}

function getRandomQuestion(difficulty) {
    const pool = questionsDB.filter(q => q.difficulty === difficulty);
    if (pool.length === 0) return questionsDB[Math.floor(Math.random() * questionsDB.length)];
    return pool[Math.floor(Math.random() * pool.length)];
}

function showQuestion() {
    if (questionActive || gameState !== 'playing') return;
    const diff = CONFIG.difficulties[difficulty].questionDifficulty;
    currentQuestion = getRandomQuestion(diff);
    questionActive = true;
    document.getElementById('question-category').textContent = '◆ ' + currentQuestion.category + ' ◆';
    document.getElementById('question-text').textContent = currentQuestion.question;
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    currentQuestion.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.addEventListener('click', (e) => answerQuestion(i, btn));
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            answerQuestion(i, btn);
        });
        container.appendChild(btn);
    });
    document.getElementById('question-panel').classList.add('active');
    questionTimer = 0;
}

function hideQuestion() {
    questionActive = false;
    currentQuestion = null;
    document.getElementById('question-panel').classList.remove('active');
    document.getElementById('options-container').innerHTML = '';
    lastQuestionTime = gameTime;
}

function answerQuestion(index, btnElement) {
    if (!questionActive || !currentQuestion) return;
    const isCorrect = (index === currentQuestion.answer);
    if (isCorrect) {
        btnElement.classList.add('correct-flash');
        chaseLevel = Math.max(0, chaseLevel - CONFIG.chaseDecreaseCorrect);
        score += CONFIG.pointsPerCorrect;
        spawnScorePopup('+100 ✨', '#00ff64');
    } else {
        btnElement.classList.add('wrong-flash');
        chaseLevel = Math.min(CONFIG.chaseMax, chaseLevel + CONFIG.chaseIncreaseWrong);
        spawnScorePopup('¡Error! 💀', '#ff2d50');
        for (let i = 0; i < 15; i++) {
            particles.push({
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 25 + Math.random() * 20,
                color: '#ff2d50',
                size: 2 + Math.random() * 3,
            });
        }
    }
    const allBtns = document.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.style.pointerEvents = 'none');
    setTimeout(() => {
        hideQuestion();
        document.querySelectorAll('.option-btn').forEach(b => {
            b.style.pointerEvents = 'all';
            b.classList.remove('correct-flash', 'wrong-flash');
        });
    }, 600);
    updateUI();
}