// ========================================
// UI - CORAZÓN DE LA INTERFAZ
// ========================================

(function() {
    // ========================================
    // VARIABLES GLOBALES DEL MÓDULO
    // ========================================
    let pendingImage = null;
    let pendingTitle = null;
    let pendingPrompt = null;
    let pendingColors = null;
    let countdownInterval = null;

    // ========================================
    // INICIALIZACIÓN PRINCIPAL
    // ========================================
    const init = () => {
        if (!window.SketchMyMood) {
            setTimeout(init, 100);
            return;
        }

        const { DOM, STATE, utils } = window.SketchMyMood;

        console.log('🖌️ UI Manager activado');

        // ========================================
        // 1. SISTEMA DE CHIPS (SELECCIÓN ÚNICA)
        // ========================================
        initChipSystem(DOM, STATE);

        // ========================================
        // 2. SISTEMA DE INTENTOS
        // ========================================
        initAttemptsSystem(DOM, STATE, utils);

        // ========================================
        // 3. SISTEMA DE GALERÍA Y REEMPLAZO
        // ========================================
        initGallerySystem(DOM, STATE);

        // ========================================
        // 4. EVENTO PRINCIPAL: GENERAR BOCETO
        // ========================================
        initGenerateEvent(DOM, STATE);

        // ========================================
        // 5. BOTÓN REINTENTAR
        // ========================================
        initRetryButton(DOM);

        // ========================================
        // 6. FUNCIONALIDADES DE GALERÍA (CLICKS)
        // ========================================
        initGalleryInteractions();

        // ========================================
        // 7. EFECTOS VISUALES (REVEAL Y CARRUSEL)
        // ========================================
        initVisualEffects();

        // ========================================
        // 8. INICIALIZACIÓN FINAL
        // ========================================
        loadAttemptsFromStorage(DOM, STATE, utils);
        DOM.generatorSection.style.display = 'none';
        loadGalleryFromStorage(DOM);

        console.log('🎉 UI Manager listo - SketchMyMood funcionando!');
    };

    // ========================================
    // 1. SISTEMA DE CHIPS
    // ========================================
    function initChipSystem(DOM, STATE) {
        // Chips artísticos
        DOM.artisticChips.forEach(chip => {
            chip.addEventListener('click', function() {
                DOM.artisticChips.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                STATE.selectedArtistic = this.textContent.trim();
                console.log('🎨 Estilo seleccionado:', STATE.selectedArtistic);
            });
        });

        // Chips emocionales
        DOM.emotionalChips.forEach(chip => {
            chip.addEventListener('click', function() {
                DOM.emotionalChips.forEach(c => c.classList.remove('active-2btn'));
                this.classList.add('active-2btn');
                STATE.selectedEmotional = this.textContent.trim();
                console.log('❤️ Emoción seleccionada:', STATE.selectedEmotional);
            });
        });
    }

    // ========================================
    // 2. SISTEMA DE INTENTOS
    // ========================================
    function initAttemptsSystem(DOM, STATE, utils) {
        // Cargar estado guardado
        window.loadAttemptsFromStorage = function() {
            const saved = localStorage.getItem('sketchmood_attempts');
            const now = new Date().getTime();

            if (saved) {
                try {
                    const data = JSON.parse(saved);

                    if (data.resetTime && data.resetTime > now) {
                        console.log('⏳ En espera hasta:', new Date(data.resetTime).toLocaleTimeString());
                        STATE.attempts = 0;
                        STATE.nextResetTimestamp = data.resetTime;
                        updateUIForNoAttempts(DOM);
                        startCountdown(DOM, STATE, utils);
                        updateAttemptsBadge(DOM, STATE);
                        return;
                    }

                    if (data.attempts !== undefined && data.attempts > 0) {
                        console.log(`✅ Intentos guardados: ${data.attempts}`);
                        STATE.attempts = data.attempts;
                        STATE.nextResetTimestamp = null;
                        resetButtonToNormal(DOM);
                        updateAttemptsBadge(DOM, STATE);
                        return;
                    }
                } catch (e) {
                    console.warn('Error parsing storage:', e);
                }
            }

            console.log('✅ Intentos disponibles: 4 (por defecto)');
            STATE.attempts = 4;
            STATE.nextResetTimestamp = null;
            resetButtonToNormal(DOM);
            updateAttemptsBadge(DOM, STATE);
            localStorage.removeItem('sketchmood_attempts');
        };

        function updateAttemptsBadge(DOM, STATE) {
            if (DOM.ratedLimit) {
                if (STATE.attempts > 0) {
                    DOM.ratedLimit.textContent = `QUEDAN ${STATE.attempts} INTENTOS`;
                } else {
                    DOM.ratedLimit.textContent = 'SIN INTENTOS - ESPERA 2H';
                }
            }
        }

        function resetButtonToNormal(DOM) {
            DOM.generateBtn.style.backgroundColor = '#ffffff';
            DOM.generateBtn.style.color = '#000000';
            DOM.generateBtn.querySelector('.material-symbols-outlined').textContent = 'auto_awesome';
            DOM.generateBtn.disabled = false;

            if (DOM.timerBox) {
                DOM.timerBox.style.display = 'none';
            }

            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
        }

        function updateUIForNoAttempts(DOM) {
            DOM.generateBtn.style.backgroundColor = '#444';
            DOM.generateBtn.style.color = '#888';
            DOM.generateBtn.querySelector('.material-symbols-outlined').textContent = 'lock';
            DOM.generateBtn.disabled = true;

            if (DOM.timerBox) {
                DOM.timerBox.style.display = 'flex';
            }
        }

        function startCountdown(DOM, STATE, utils) {
            if (countdownInterval) clearInterval(countdownInterval);

            countdownInterval = setInterval(() => {
                if (!STATE.nextResetTimestamp) {
                    resetAttempts(DOM, STATE);
                    return;
                }

                const now = new Date().getTime();
                const remainingMs = STATE.nextResetTimestamp - now;

                if (remainingMs <= 0) {
                    resetAttempts(DOM, STATE);
                    return;
                }

                const { hours, minutes, seconds } = utils.formatTime(remainingMs);

                if (DOM.timerHours) DOM.timerHours.textContent = hours.toString().padStart(2, '0');
                if (DOM.timerMinutes) DOM.timerMinutes.textContent = minutes.toString().padStart(2, '0');
                if (DOM.timerSeconds) DOM.timerSeconds.textContent = seconds.toString().padStart(2, '0');
            }, 1000);
        }

        function resetAttempts(DOM, STATE) {
            console.log('🔄 Tiempo cumplido, resetando intentos');
            STATE.attempts = 4;
            STATE.nextResetTimestamp = null;

            localStorage.removeItem('sketchmood_attempts');
            resetButtonToNormal(DOM);
            updateAttemptsBadge(DOM, STATE);
        }

        window.consumeAttempt = function(DOM, STATE) {
            if (STATE.attempts <= 0) return false;

            STATE.attempts--;
            console.log('⬇️ Intento consumido, restantes:', STATE.attempts);

            if (STATE.attempts === 0) {
                const resetTime = new Date().getTime() + (2 * 60 * 60 * 1000);
                localStorage.setItem('sketchmood_attempts', JSON.stringify({ resetTime }));
                STATE.nextResetTimestamp = resetTime;
                updateUIForNoAttempts(DOM);
                startCountdown(DOM, STATE, utils);
            } else {
                localStorage.setItem('sketchmood_attempts', JSON.stringify({
                    attempts: STATE.attempts,
                    resetTime: null
                }));
            }

            updateAttemptsBadge(DOM, STATE);
            return true;
        };
    }

    // ========================================
    // 3. SISTEMA DE GALERÍA Y REEMPLAZO
    // ========================================
    function initGallerySystem(DOM, STATE) {
        // Verificar si ambas cards están llenas
        window.areBothCardsFilled = function() {
            return DOM.cards.every(card => card.placeholder.classList.contains('hidden'));
        };

        // Mostrar opción de reemplazo
        window.showReplacementOption = function(imageUrl, title, prompt, colors) {
            pendingImage = imageUrl;
            pendingTitle = title;
            pendingPrompt = prompt;
            pendingColors = colors;
            DOM.replacementOption.style.display = 'block';
            console.log('🔄 Mostrando opción de reemplazo');
        };

        // Ocultar opción de reemplazo
        window.hideReplacementOption = function() {
            DOM.replacementOption.style.display = 'none';
            pendingImage = pendingTitle = pendingPrompt = pendingColors = null;
            console.log('✅ Opción de reemplazo ocultada');
        };

        // Reemplazar un card al azar
        window.replaceRandomCard = function() {
            if (!pendingImage) {
                console.warn('⚠️ No hay imagen pendiente para reemplazar');
                return;
            }

            const randomIndex = Math.floor(Math.random() * DOM.cards.length);
            const card = DOM.cards[randomIndex];
            console.log(`🔄 Reemplazando card ${randomIndex + 1}`);

            card.placeholder.classList.add('hidden');
            card.dynamic.classList.remove('hidden');
            card.img.src = pendingImage;
            card.title.textContent = pendingTitle || "Sin título";
            card.prompt.textContent = pendingPrompt;

            const paletteId = card.container.id === 'card-1' ? 'palette-1' : 'palette-2';
            const palette = document.getElementById(paletteId);

            if (palette && pendingColors?.length === 5) {
                const swatches = palette.querySelectorAll('.color-swatch');
                swatches.forEach((swatch, index) => {
                    swatch.style.backgroundColor = pendingColors[index];
                });
                palette.classList.remove('hidden');
            }

            card.container.classList.remove('expanded');
            updateCardInStorage(card.container.id, pendingImage, pendingTitle, pendingPrompt, pendingColors);
            hideReplacementOption();
            console.log(`✨ Card ${randomIndex + 1} reemplazado con éxito`);
        };

        // Botones de reemplazo
        if (DOM.yesBtn) {
            DOM.yesBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('👍 Usuario aceptó reemplazar');
                replaceRandomCard();
            });
        }

        if (DOM.noBtn) {
            DOM.noBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('👎 Usuario canceló reemplazo');
                hideReplacementOption();
            });
        }
    }

    // ========================================
    // 4. EVENTO PRINCIPAL: GENERAR BOCETO
    // ========================================
    function initGenerateEvent(DOM, STATE) {
        DOM.generateBtn.addEventListener('click', async function() {
            if (!DOM.textarea?.value.trim()) {
                DOM.textarea.focus();
                return;
            }

            if (STATE.attempts <= 0) {
                alert('⏳ Sin intentos disponibles. Espera 2 horas.');
                return;
            }

            if (!consumeAttempt(DOM, STATE)) return;

            DOM.loadingOverlay.querySelector('.loading-content span:last-child').textContent = 'Refinando tu emoción con IA...';

            try {
                const refined = await PromptRefiner.refinePrompt(
                    STATE.selectedArtistic,
                    STATE.selectedEmotional,
                    DOM.textarea.value.trim()
                );

                await generateImage(DOM, STATE, refined.prompt, refined.colors);
            } catch (error) {
                console.error('❌ Error en el proceso:', error);
                const prompt = PromptBuilder.buildPrompt(
                    STATE.selectedArtistic,
                    STATE.selectedEmotional,
                    DOM.textarea.value.trim()
                );
                await generateImage(DOM, STATE, prompt);
            } finally {
                DOM.loadingOverlay.querySelector('.loading-content span:last-child').textContent = 'Procesando tu emoción...';
            }
        });
    }

    // ========================================
    // GENERACIÓN DE IMAGEN (API)
    // ========================================
    async function generateImage(DOM, STATE, prompt, colors = null) {
        DOM.generatorSection.style.display = 'flex';
        DOM.loadingOverlay.style.display = 'block';
        DOM.errorOverlay.style.display = 'none';

        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `${API_CONFIG.baseURL}/image/${encodedPrompt}?model=${API_CONFIG.defaultModel}&width=1024&height=1024&enhance=true&key=${API_CONFIG.key}`;

        console.log('🌐 URL generada:', imageUrl);

        try {
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageUrl;
            });

            DOM.generatedImage.src = img.src;
            DOM.loadingOverlay.classList.add('success-animation');
            setTimeout(() => {
                DOM.loadingOverlay.style.display = 'none';
                DOM.loadingOverlay.classList.remove('success-animation');
            }, 1500);

            const userTitle = `${STATE.selectedEmotional} ${STATE.selectedArtistic.replace('🎨 ', '')}`;

            if (areBothCardsFilled()) {
                console.log('📸 Galería llena, mostrando opción de reemplazo');
                showReplacementOption(img.src, userTitle, prompt, colors);
            } else {
                console.log('📸 Hay espacio en galería, renderizando normal');
                renderToGallery(DOM, img.src, userTitle, prompt, colors);
            }

            console.log('✅ Imagen generada con éxito');
        } catch (error) {
            console.error('❌ Error generando imagen:', error);
            DOM.loadingOverlay.style.display = 'none';
            DOM.errorOverlay.style.display = 'flex';
        }
    }

    // ========================================
    // RENDERIZADO EN GALERÍA
    // ========================================
    function renderToGallery(DOM, imageUrl, userTitle, fullPrompt, colors) {
        const emptyCard = DOM.cards.find(card => !card.placeholder.classList.contains('hidden'));

        if (!emptyCard) {
            console.log('📸 Galería llena. Solo se permiten 2 imágenes.');
            return;
        }

        emptyCard.placeholder.classList.add('hidden');
        emptyCard.dynamic.classList.remove('hidden');
        emptyCard.img.src = imageUrl;
        emptyCard.title.textContent = userTitle || "Sin título";
        emptyCard.prompt.textContent = fullPrompt;

        const paletteId = emptyCard.container.id === 'card-1' ? 'palette-1' : 'palette-2';
        const palette = document.getElementById(paletteId);

        if (palette && colors?.length === 5) {
            const swatches = palette.querySelectorAll('.color-swatch');
            swatches.forEach((swatch, index) => {
                swatch.style.backgroundColor = colors[index];
            });
            palette.classList.remove('hidden');
        }

        updateCardInStorage(emptyCard.container.id, imageUrl, userTitle, fullPrompt, colors);
        console.log(`✨ Renderizado en ${emptyCard.container.id}`);
    }

    // ========================================
    // 5. BOTÓN REINTENTAR
    // ========================================
    function initRetryButton(DOM) {
        if (DOM.retryBtn) {
            DOM.retryBtn.addEventListener('click', () => {
                DOM.errorOverlay.style.display = 'none';
                DOM.generateBtn.click();
            });
        }
    }

    // ========================================
    // 6. FUNCIONALIDADES DE GALERÍA (CLICKS)
    // ========================================
    function initGalleryInteractions() {
        // Expandir/colapsar cards
        document.querySelectorAll('.gallery-card').forEach(card => {
            card.addEventListener('click', function(e) {
                if (e.target.closest('.action-btn, .copy-prompt-btn')) return;
                this.classList.toggle('expanded');
            });
        });

        // Copiar prompt
        document.querySelectorAll('.copy-prompt-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                const promptText = this.closest('.gallery-card').querySelector('.card-prompt').textContent;

                try {
                    await navigator.clipboard.writeText(promptText);
                    const originalIcon = this.innerHTML;
                    this.innerHTML = '<span class="material-symbols-outlined" translate="no">check</span>';
                    setTimeout(() => this.innerHTML = originalIcon, 2000);
                } catch (err) {
                    console.error('Error al copiar:', err);
                    alert('No se pudo copiar el prompt');
                }
            });
        });

        // Descargar imagen
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                const card = this.closest('.gallery-card');
                const imgElement = card.querySelector('.card-image');
                const title = card.querySelector('.card-title').textContent || 'sketch';

                try {
                    const response = await fetch(imgElement.src);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${title.replace(/\s+/g, '_')}.jpg`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);

                    const originalIcon = this.innerHTML;
                    this.innerHTML = '<span class="material-symbols-outlined" translate="no">download_done</span>';
                    setTimeout(() => this.innerHTML = originalIcon, 2000);
                } catch (err) {
                    console.error('Error al descargar:', err);
                    alert('No se pudo descargar la imagen');
                }
            });
        });

        // Compartir
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                const card = this.closest('.gallery-card');
                const imgElement = card.querySelector('.card-image');
                const title = card.querySelector('.card-title').textContent || 'SketchMyMood';
                const prompt = card.querySelector('.card-prompt').textContent;

                if (navigator.share) {
                    try {
                        const response = await fetch(imgElement.src);
                        const blob = await response.blob();
                        const file = new File([blob], `${title}.jpg`, { type: 'image/jpeg' });
                        await navigator.share({ title, text: prompt, files: [file] });
                    } catch {
                        try {
                            await navigator.share({ title, text: `${prompt} - Creado con SketchMyMood`, url: window.location.href });
                        } catch (shareErr) {
                            console.log('Compartir cancelado');
                        }
                    }
                } else {
                    prompt('Comparte este prompt:', prompt);
                }
            });
        });

        // Eliminar
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const card = this.closest('.gallery-card');
                const placeholder = card.querySelector('.placeholder-content');
                const dynamicContent = card.querySelector('.dynamic-content');
                const palette = card.querySelector('.color-palette');

                card.querySelector('.card-image').src = '';
                card.querySelector('.card-title').textContent = '';
                card.querySelector('.card-prompt').textContent = '';

                if (palette) palette.classList.add('hidden');
                placeholder.classList.remove('hidden');
                dynamicContent.classList.add('hidden');
                card.classList.remove('expanded');

                removeCardFromStorage(card.id);
            });
        });
    }

    // ========================================
    // 7. EFECTOS VISUALES
    // ========================================
    function initVisualEffects() {
        // Scroll reveal
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

        // Carrusel de citas
        let currentQuoteIndex = 0;
        const quoteSlides = document.querySelectorAll('.quote-card');
        const nextQuoteBtn = document.getElementById('nextQuote');
        const prevQuoteBtn = document.getElementById('prevQuote');

        function updateQuoteVisibility(index) {
            if (window.innerWidth < 768) {
                quoteSlides.forEach((slide, i) => {
                    slide.classList.toggle('active', i === index);
                });
            }
        }

        if (nextQuoteBtn && prevQuoteBtn) {
            nextQuoteBtn.addEventListener('click', () => {
                currentQuoteIndex = (currentQuoteIndex + 1) % quoteSlides.length;
                updateQuoteVisibility(currentQuoteIndex);
            });
            prevQuoteBtn.addEventListener('click', () => {
                currentQuoteIndex = (currentQuoteIndex - 1 + quoteSlides.length) % quoteSlides.length;
                updateQuoteVisibility(currentQuoteIndex);
            });
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                quoteSlides.forEach(slide => slide.classList.add('active'));
            } else {
                updateQuoteVisibility(currentQuoteIndex);
            }
        });
    }

    // ========================================
    // 8. PERSISTENCIA DE GALERÍA
    // ========================================
    const GALLERY_STORAGE_KEY = 'sketchmood_gallery';

    function saveGalleryToStorage(DOM) {
        const galleryData = {};
        DOM.cards.forEach((card, index) => {
            const cardId = `card-${index + 1}`;
            if (!card.placeholder.classList.contains('hidden')) {
                const paletteId = cardId === 'card-1' ? 'palette-1' : 'palette-2';
                const palette = document.getElementById(paletteId);
                const colors = palette ? [...palette.querySelectorAll('.color-swatch')].map(s => s.style.backgroundColor) : [];

                galleryData[cardId] = {
                    imageUrl: card.img.src,
                    title: card.title.textContent,
                    prompt: card.prompt.textContent,
                    colors
                };
            }
        });
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(galleryData));
        console.log('💾 Galería guardada en localStorage');
    }

    function loadGalleryFromStorage(DOM) {
        const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
        if (!saved) return;

        try {
            const galleryData = JSON.parse(saved);
            DOM.cards.forEach((card, index) => {
                const cardId = `card-${index + 1}`;
                const data = galleryData[cardId];
                if (data) {
                    card.placeholder.classList.add('hidden');
                    card.dynamic.classList.remove('hidden');
                    card.img.src = data.imageUrl;
                    card.title.textContent = data.title || "Sin título";
                    card.prompt.textContent = data.prompt;

                    const paletteId = cardId === 'card-1' ? 'palette-1' : 'palette-2';
                    const palette = document.getElementById(paletteId);
                    if (palette && data.colors?.length === 5) {
                        const swatches = palette.querySelectorAll('.color-swatch');
                        swatches.forEach((swatch, i) => swatch.style.backgroundColor = data.colors[i]);
                        palette.classList.remove('hidden');
                    }
                    console.log(`🔄 Card ${index + 1} restaurado desde localStorage`);
                }
            });
            console.log('✅ Galería cargada desde localStorage');
        } catch (e) {
            console.warn('Error cargando galería:', e);
            localStorage.removeItem(GALLERY_STORAGE_KEY);
        }
    }

    function updateCardInStorage(cardId, imageUrl, title, prompt, colors) {
        const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
        const galleryData = saved ? JSON.parse(saved) : {};
        galleryData[cardId] = { imageUrl, title, prompt, colors };
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(galleryData));
        console.log(`💾 Card ${cardId} actualizado en localStorage`);
    }

    function removeCardFromStorage(cardId) {
        const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
        if (saved) {
            const galleryData = JSON.parse(saved);
            delete galleryData[cardId];
            if (Object.keys(galleryData).length === 0) {
                localStorage.removeItem(GALLERY_STORAGE_KEY);
                console.log('🗑️ Galería vacía, localStorage limpiado');
            } else {
                localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(galleryData));
                console.log(`🗑️ Card ${cardId} eliminado de localStorage`);
            }
        }
    }

    // ========================================
    // INICIAR APLICACIÓN
    // ========================================
    init();
})();