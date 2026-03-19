// ========================================
// REFINADOR DE PROMPTS CON IA
// ========================================

const PromptRefiner = {
    // Endpoint de chat completions
    chatURL: 'https://gen.pollinations.ai/v1/chat/completions',
    
    // Tu API key pública
    apiKey: 'sk_ZkpCEOhkuwM4oFOeKpWJzqeInHM9aUjT',
    
    // Refinar el prompt usando IA
    async refinePrompt(artisticStyle, emotionalAnchor, userText) {
        // Construir el mensaje para la IA como director de arte
        const systemPrompt = `You are an art director. Analyze the mood: "${emotionalAnchor} - ${userText}".
          1. Create a detailed, creative artistic image prompt for a "${artisticStyle}" style.
          2. Generate a palette of 5 hex color codes representing this mood.
          3. IMPORTANT: Return ONLY raw JSON without markdown formatting.
           Format: {"prompt": "your detailed prompt", "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"]}`;
        
        try {
            console.log('🎨 Enviando a refinar con IA...');
            
            const response = await fetch(this.chatURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'nova-fast',  // Modelo rápido para refinamiento
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: `${emotionalAnchor} - ${userText}`
                        }
                    ],
                    jsonMode: true
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Extraer el contenido del mensaje
            const refinedContent = JSON.parse(data.choices[0].message.content);
            
            console.log('✨ Prompt refinado:', refinedContent.prompt);
            console.log('🎨 Paleta de colores:', refinedContent.colors);
            
            return refinedContent;
            
        } catch (error) {
            console.error('❌ Error refinando prompt:', error);
            // Fallback: devolver un prompt básico
            return {
                prompt: PromptBuilder.buildPrompt(artisticStyle, emotionalAnchor, userText),
                colors: ['#FFFFFF', '#000000', '#888888', '#444444', '#CCCCCC']
            };
        }
    }
};

console.log('✅ Prompt Refiner cargado');