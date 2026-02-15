// Configuración de GSAP
gsap.registerPlugin(ScrollTrigger);

// Configuración global para optimizar rendimiento
gsap.config({
    force3D: true,
    nullTargetWarn: false
});

// Detectar si es dispositivo móvil
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

// Throttle para eventos de scroll/resize
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Crear partículas optimizadas (solo en desktop)
function createParticles() {
    // No crear partículas en mobile para ahorrar recursos
    if (isMobile) return;
    
    const container = document.getElementById('particles');
    if (!container) return;
    
    // Solo 5 partículas para mejor rendimiento
    const particleCount = 5;
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Tamaño aleatorio entre 4-8px
        const size = Math.random() * 4 + 4;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Posición aleatoria
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        fragment.appendChild(particle);
        
        // Animación simple y ligera
        gsap.to(particle, {
            y: `${Math.random() * 40 - 20}`,
            x: `${Math.random() * 40 - 20}`,
            opacity: Math.random() * 0.2 + 0.05,
            duration: Math.random() * 6 + 5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: Math.random() * 2
        });
    }
    
    container.appendChild(fragment);
}

// Animaciones de entrada minimalistas
function initAnimations() {
    // Solo animar el hero en desktop
    if (!isMobile) {
        const heroTitle = document.getElementById('hero-title');
        const heroName = document.getElementById('hero-name');
        const heroDegree = document.getElementById('hero-degree');
        
        if (heroTitle) {
            gsap.from(heroTitle, {
                opacity: 0,
                y: 15,
                duration: 0.6,
                ease: "power2.out"
            });
        }
        
        if (heroName) {
            gsap.from(heroName, {
                opacity: 0,
                y: 10,
                duration: 0.5,
                ease: "power2.out",
                delay: 0.2
            });
        }
        
        if (heroDegree) {
            gsap.from(heroDegree, {
                opacity: 0,
                duration: 0.4,
                delay: 0.3
            });
        }
    }
}

// Función para copiar al portapapeles
function copyToClipboard(text, button) {
    // Remover todos los espacios del texto
    const cleanText = text.replace(/\s/g, '');
    
    // Intentar usar la API del portapapeles
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cleanText).then(() => {
            showCopySuccess(button);
        }).catch(err => {
            // Fallback para navegadores antiguos
            fallbackCopy(cleanText, button);
        });
    } else {
        // Fallback para navegadores antiguos
        fallbackCopy(cleanText, button);
    }
}

// Fallback para copiar en navegadores antiguos
function fallbackCopy(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopySuccess(button);
    } catch (err) {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar automáticamente. Por favor, copia manualmente: ' + text);
    }
    
    document.body.removeChild(textArea);
}

// Mostrar éxito al copiar
function showCopySuccess(button) {
    const originalHTML = button.innerHTML;
    const originalBg = button.style.background;
    
    // Cambiar a estado de éxito
    button.innerHTML = '✓ ¡Copiado!';
    button.style.background = '#16a34a';
    
    // Resetear después de 2 segundos
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.background = originalBg;
    }, 2000);
}

// Asegurar autoplay de videos
function ensureVideoAutoplay() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // Intentar reproducir
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Autoplay bloqueado, intentando de nuevo...');
                // Reintentar después de interacción del usuario
                document.addEventListener('click', function() {
                    video.play();
                }, { once: true });
            });
        }
    });
}

// Calendario interactivo
class PaymentCalendar {
    constructor() {
        this.currentDate = new Date();
        // Iniciar en el mes actual
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        
        // FECHAS CORRECTAS DE PAGO 2026 - SOLO ESTAS DOS FECHAS
        this.paymentDates = [
            new Date(2026, 3, 13), // 13 de Abril 2026 (mes 3 = Abril en JS)
            new Date(2026, 5, 12)  // 12 de Junio 2026 (mes 5 = Junio en JS)
        ];
        
        this.monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        this.dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        this.init();
    }
    
    init() {
        this.renderCalendar();
        this.updatePaymentCountdown();
        this.attachEventListeners();
        
        // Actualizar el contador cada hora
        setInterval(() => this.updatePaymentCountdown(), 3600000);
    }
    
    attachEventListeners() {
        const prevBtn = document.getElementById('prev-month');
        const nextBtn = document.getElementById('next-month');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.changeMonth(-1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.changeMonth(1));
        }
    }
    
    changeMonth(direction) {
        this.currentMonth += direction;
        
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        
        // Limitar navegación a 2026
        if (this.currentYear < 2026) {
            this.currentYear = 2026;
            this.currentMonth = 0;
        } else if (this.currentYear > 2026) {
            this.currentYear = 2026;
            this.currentMonth = 11;
        }
        
        // Limitar a meses relevantes (Febrero-Junio 2026)
        if (this.currentYear === 2026) {
            if (this.currentMonth < 1) { // Antes de Febrero (mes 1)
                this.currentMonth = 1;
            } else if (this.currentMonth > 5) { // Después de Junio (mes 5)
                this.currentMonth = 5;
            }
        }
        
        this.renderCalendar();
    }
    
    renderCalendar() {
        const monthTitle = document.getElementById('calendar-month');
        const calendarGrid = document.getElementById('calendar-grid');
        
        if (!monthTitle || !calendarGrid) return;
        
        // Actualizar título del mes
        monthTitle.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
        
        // Limpiar grid
        calendarGrid.innerHTML = '';
        
        // Agregar encabezados de días
        this.dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'text-center font-bold text-xs sm:text-sm text-gray-600 py-2';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
        // Obtener primer día del mes y total de días
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        
        // Agregar celdas vacías para los días antes del primer día del mes
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'p-2';
            calendarGrid.appendChild(emptyCell);
        }
        
        // Agregar días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            
            // Verificar si es fecha de pago - COMPARACIÓN EXACTA
            const isPaymentDate = this.paymentDates.some(date => {
                return date.getDate() === day && 
                       date.getMonth() === this.currentMonth && 
                       date.getFullYear() === this.currentYear;
            });
            
            // Verificar si es el día actual
            const isToday = this.currentDate.getDate() === day && 
                           this.currentDate.getMonth() === this.currentMonth && 
                           this.currentDate.getFullYear() === this.currentYear;
            
            // Aplicar estilos
            let cellClasses = 'p-2 text-center rounded-lg text-sm sm:text-base transition-all cursor-default';
            
            if (isToday) {
                cellClasses += ' bg-black text-white font-bold';
            } else if (isPaymentDate) {
                cellClasses += ' bg-red-500 text-white font-bold';
            } else {
                cellClasses += ' hover:bg-gray-100';
            }
            
            dayCell.className = cellClasses;
            dayCell.textContent = day;
            
            calendarGrid.appendChild(dayCell);
        }
    }
    
    updatePaymentCountdown() {
        const nextPaymentDateEl = document.getElementById('next-payment-date');
        const daysRemainingEl = document.getElementById('days-remaining');
        
        if (!nextPaymentDateEl || !daysRemainingEl) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Encontrar la próxima fecha de pago
        let nextPayment = null;
        for (const date of this.paymentDates) {
            if (date >= today) {
                nextPayment = date;
                break;
            }
        }
        
        if (nextPayment) {
            // Calcular días restantes
            const timeDiff = nextPayment - today;
            const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            
            // Formatear fecha
            const options = { day: 'numeric', month: 'long' };
            const formattedDate = nextPayment.toLocaleDateString('es-MX', options);
            
            nextPaymentDateEl.textContent = formattedDate;
            
            if (daysRemaining === 0) {
                daysRemainingEl.textContent = '¡Hoy es el día!';
            } else if (daysRemaining === 1) {
                daysRemainingEl.textContent = 'Falta 1 día';
            } else {
                daysRemainingEl.textContent = `Faltan ${daysRemaining} días`;
            }
        } else {
            nextPaymentDateEl.textContent = 'Todos los pagos completados';
            daysRemainingEl.textContent = '';
        }
    }
}

// Optimizar ScrollTrigger refresh
const refreshScrollTrigger = throttle(() => {
    ScrollTrigger.refresh();
}, 300);

// Cleanup de recursos cuando se sale de la página
window.addEventListener('beforeunload', () => {
    // Matar todos los ScrollTriggers
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    
    // Limpiar timeline global de GSAP
    gsap.killTweensOf('*');
});

// Inicialización principal
function init() {
    // Crear partículas solo en desktop
    if (!isMobile) {
        createParticles();
    }
    
    // Inicializar animaciones minimalistas
    initAnimations();
    
    // Asegurar autoplay de videos
    ensureVideoAutoplay();
    
    // Inicializar calendario
    new PaymentCalendar();
}

// Event listeners optimizados
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Throttled resize
window.addEventListener('resize', refreshScrollTrigger);

// Pausa animaciones cuando la página no está visible (ahorra batería y CPU)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pausar animaciones GSAP
        gsap.globalTimeline.pause();
        
        // Pausar videos si están reproduciéndose
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (video && !video.paused) {
                video.pause();
            }
        });
    } else {
        // Reanudar animaciones
        gsap.globalTimeline.resume();
        
        // Reanudar videos
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (video && video.paused) {
                video.play();
            }
        });
    }
});

// Optimización para bajo nivel de batería
if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
        // Si la batería está baja, reducir animaciones
        if (battery.level < 0.2) {
            // Eliminar partículas si hay bajo nivel de batería
            const particles = document.getElementById('particles');
            if (particles) {
                particles.innerHTML = '';
            }
            gsap.globalTimeline.timeScale(2); // Acelerar animaciones
        }
        
        // Listener para cambios en el nivel de batería
        battery.addEventListener('levelchange', () => {
            if (battery.level < 0.2) {
                const particles = document.getElementById('particles');
                if (particles) {
                    particles.innerHTML = '';
                }
                gsap.globalTimeline.timeScale(2);
            } else {
                gsap.globalTimeline.timeScale(1);
            }
        });
    });
}

// Limitar uso de memoria - limpiar cada 10 minutos en desktop
if (!isMobile) {
    setInterval(() => {
        // Forzar garbage collection si está disponible (solo en algunos navegadores)
        if (window.gc) {
            window.gc();
        }
    }, 600000); // 10 minutos
}