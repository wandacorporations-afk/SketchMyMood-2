// ========================================
// CONFIGURACIÓN BÁSICA DEL DOM
// ========================================

// Esperamos a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 SketchMyMood - Inicializando...');
    
    // ===== REFERENCIAS A ELEMENTOS DEL DOM =====
    const DOM = {
        // Header y contador
        ratedLimit: document.getElementById('ratedLimit'),
        
        // Chips de estilo artístico
        artisticChips: document.querySelectorAll('.styles-artistic .chip'),
        
        // Chips emocionales
        emotionalChips: document.querySelectorAll('.emotional-styles .chip2'),
        
        // Textarea
        textarea: document.getElementById('textareaPrompt') || document.querySelector('textarea'),
        
        // Botón generar
        generateBtn: document.getElementById('mainGenerateAction'),
        
        // Sección generadora de imagen
        generatorSection: document.getElementById('generatorSection'),
        
        // Overlays
        loadingOverlay: document.getElementById('loadingOverlay'),
        errorOverlay: document.getElementById('errorOverlay'),
        
        // Imagen generada
        generatedImage: document.getElementById('generatedImage'),
        
        // Botón reintentar
        retryBtn: document.getElementById('retryButton'),
        
        // Elementos del timer
        timerHours: document.getElementById('timerHours'),
        timerMinutes: document.getElementById('timerMinutes'),
        timerSeconds: document.getElementById('timerSeconds'),
        timerBox: document.getElementById('countdownTimer'),
      
        // Elementos de reemplazo de imagen en cards
        replacementOption: document.getElementById('replacementOption'),
        yesBtn: document.getElementById('yes-reemplaced'),
        noBtn: document.getElementById('no-reemplaced'),
        
        // Galería (Añadir a script.js)
        cards: [
          {
            container: document.getElementById('card-1'),
            placeholder: document.querySelector('#card-1 .placeholder-content'),
            dynamic: document.querySelector('#card-1 .dynamic-content'),
            img: document.getElementById('img-1'),
            title: document.getElementById('title-1'),
            prompt: document.getElementById('prompt-1')
          },
          {
            container: document.getElementById('card-2'),
            placeholder: document.querySelector('#card-2 .placeholder-content'),
            dynamic: document.querySelector('#card-2 .dynamic-content'),
            img: document.getElementById('img-2'),
            title: document.getElementById('title-2'),
            prompt: document.getElementById('prompt-2')
          }
        ],
    };
    
    // ===== ESTADO INICIAL =====
    const STATE = {
        selectedArtistic: '🎨 Resumen',  // Por defecto
        selectedEmotional: 'Calma',       // Por defecto
        attempts: 2,                       // Intentos iniciales
        lastAttemptTimestamp: null,
        nextResetTimestamp: null
    };
    
    // Exponemos para otros módulos
    window.SketchMyMood = {
        DOM,
        STATE,
        utils: {
            formatTime,
            calculateRemainingTime
        }
    };
    
    // Función auxiliar de formato de tiempo
    function formatTime(ms) {
        if (ms <= 0) return { hours: 0, minutes: 0, seconds: 0 };
        
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return { hours, minutes, seconds };
    }
    
    // Calcular tiempo restante
    function calculateRemainingTime() {
        const nextReset = localStorage.getItem('nextResetTimestamp');
        if (!nextReset) return 0;
        
        const now = new Date().getTime();
        const resetTime = new Date(nextReset).getTime();
        return Math.max(0, resetTime - now);
    }
    
    console.log('✅ Script base cargado');
});