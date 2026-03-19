// ========================================
// CONSTRUCTOR DE PROMPTS PARA IMÁGENES
// ========================================

const PromptBuilder = {
    // Diccionario de estilos artísticos (chip)
    artisticStyles: {
        '🎨 Resumen': 'abstract artistic style with bold shapes and colors',
        '🌆 Cyberpunk': 'cyberpunk aesthetic with neon lights, dark atmosphere, futuristic',
        '💧 Acuarela': 'watercolor painting style, soft edges, artistic wash effect',
        '🏛️ Renacimiento': 'renaissance painting style, classical composition, oil painting',
        '✏️ Carbón vegetal': 'charcoal drawing style, rough sketch, monochrome textures',
        '👁️ Surrealismo': 'surrealist style, dreamlike, Salvador Dali inspired'
    },

    // Diccionario de anclajes emocionales (chip2)
    emotionalAnchors: {
        'Calma': 'calm, peaceful, serene atmosphere, gentle vibes',
        'Energizado': 'energetic, dynamic, vibrant, explosive movement',
        'Melancólico': 'melancholic, nostalgic, bittersweet, rainy mood',
        'Soñador': 'dreamy, ethereal, whimsical, fantasy-like',
        'Ansioso': 'anxious, tense, chaotic, restless energy',
        'Alegre': 'joyful, happy, bright, uplifting, cheerful',
        'Misterioso': 'mysterious, enigmatic, dark, hidden meanings',
        'Solitario': 'solitary, lonely, vast emptiness, contemplative'
    },

    // Construye el prompt completo
    buildPrompt(artisticChip, emotionalChip, userText) {
        // Obtener descripciones de los chips seleccionados
        const artisticDesc = this.artisticStyles[artisticChip] || 'abstract style';
        const emotionalDesc = this.emotionalAnchors[emotionalChip] || 'emotional';
        
        // Limpiar y acortar el texto del usuario (máx 200 caracteres)
        const cleanUserText = userText
            .substring(0, 200)
            .replace(/[^\w\sáéíóúñç.,!?]/gi, ' ');
        
        // Construir prompt profesional para la IA
        const prompt = `"high quality artistic image, ${artisticDesc} style, rich colors, 
              ${emotionalDesc} atmosphere, inspired by: "${cleanUserText}", 
              cinematic lighting, detailed textures, depth and shadows, 
              realistic or painterly style, expressive composition, 
              vivid colors, soft gradients, emotional visual storytelling, 
              high resolution, professional artwork"`;
        
        return prompt;
    },

    // Versión corta para debugging
    getPromptSummary(prompt) {
        return prompt.length > 80 ? prompt.substring(0, 80) + '...' : prompt;
    }
};

console.log('✅ Prompt Builder cargado');