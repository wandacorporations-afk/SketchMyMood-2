// ========================================
// CONFIGURACIÓN DE LA API POLLINATIONS - ¡VERSIÓN FINAL!
// ========================================

const API_CONFIG = {
    // URL base
    baseURL: 'https://gen.pollinations.ai',
    
    // Tu API key pública (funciona perfectamente)
    key: 'sk_ZkpCEOhkuwM4oFOeKpWJzqeInHM9aUjT',
    
    // Modelo por defecto
    defaultModel: 'flux',
    
    // Modelos disponibles
    availableModels: {
        flux: 'Flux (rápido y versátil)',
        seedream: 'SeaDream (onírico)',
        gptimage: 'GPT Image (artístico)'
    },
    
    // Parámetros de generación
    imageParams: {
        width: 1024,
        height: 1024,
        enhance: true
    }
};

console.log('✅ API Config cargada correctamente');