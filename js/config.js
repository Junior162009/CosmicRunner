// Configuración global del juego
const CONFIG = {
    difficulties: {
        basic:   { enemySpeed: 1.2, questionDifficulty: 'Básico',  obstacleFrequency: 0.008, obstacleSpeed: 2.5 },
        medium:  { enemySpeed: 2.0, questionDifficulty: 'Medio',   obstacleFrequency: 0.014, obstacleSpeed: 3.5 },
        hard:    { enemySpeed: 3.0, questionDifficulty: 'Difícil',  obstacleFrequency: 0.022, obstacleSpeed: 5.0 },
        expert:  { enemySpeed: 4.5, questionDifficulty: 'Experto',  obstacleFrequency: 0.032, obstacleSpeed: 7.0 },
    },
    playerSpeed: 3,
    jumpForce: -9,
    gravity: 0.45,
    groundYRatio: 0.75,
    laneCount: 3,
    questionInterval: 4000,
    chaseMax: 100,
    chaseIncreaseRate: 0.04,
    chaseDecreaseCorrect: 25,
    chaseIncreaseWrong: 18,
    pointsPerCorrect: 100,
    pointsPerSecond: 2,
    questionTimeout: 8000,
};