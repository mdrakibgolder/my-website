// ===================================
// MODERN PORTFOLIO - WORLD-CLASS DESIGN
// ===================================

'use strict';

// Debug mode - Set to false for production
window.DEBUG_MODE = false;

// Performance optimization - Preload critical resources
const preloadImages = () => {
    const images = [
        'static/images/rakib.jpg',
        'static/images/profile.jpg',
        'static/images/hero.jpg'
    ];
    
    images.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
};

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    preloadImages();
    initNavigation();
    initVideoBackground();
    initScrollAnimations();
    initContactForm();
    initSmoothScroll();
    initPerformanceMonitoring();
    initAccessibility();
    initAIChat();
    initAnimatedCounters();
    initScrollProgress();
    initScrollToTop();
    initToastNotifications();
});

// ===================================
// NAVIGATION
// ===================================
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Update ARIA attribute for accessibility
            menuToggle.setAttribute('aria-expanded', isExpanded);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isExpanded ? 'hidden' : '';
        });
    }

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) navLink.classList.add('active');
            }
        });
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuToggle) {
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
            if (navMenu) navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ===================================
// VIDEO BACKGROUND
// ===================================
function initVideoBackground() {
    const videos = document.querySelectorAll('.bg-video');
    const prevBtn = document.getElementById('prevVideo');
    const nextBtn = document.getElementById('nextVideo');
    const dots = document.querySelectorAll('.dot');
    let currentVideo = 0;
    let autoPlayInterval;
    let isTransitioning = false;

    if (videos.length === 0) return;

    // Only preload the next video, not all
    function preloadNextVideo(index) {
        const nextIndex = (index + 1) % videos.length;
        const nextVideo = videos[nextIndex];
        if (nextVideo.preload === 'none') {
            nextVideo.preload = 'auto';
            nextVideo.load();
        }
    }

    // Preload next video after current starts
    preloadNextVideo(0);

    // Switch video function with debounce
    function switchVideo(index) {
        if (index < 0 || index >= videos.length || isTransitioning || index === currentVideo) return;

        isTransitioning = true;

        // Pause current video
        videos[currentVideo].pause();
        
        // Remove active from current
        videos[currentVideo].classList.remove('active');
        dots[currentVideo].classList.remove('active');

        // Update current index
        currentVideo = index;
        
        // Load and play new video
        const newVideo = videos[currentVideo];
        if (newVideo.preload === 'none') {
            newVideo.preload = 'auto';
            newVideo.load();
        }
        
        // Wait for video to be ready
        const playVideo = () => {
            newVideo.classList.add('active');
            dots[currentVideo].classList.add('active');
            newVideo.play().catch(() => {});
            
            // Preload next video
            preloadNextVideo(currentVideo);
            
            // Allow transitions again after fade
            setTimeout(() => {
                isTransitioning = false;
            }, 1000);
        };

        if (newVideo.readyState >= 3) {
            playVideo();
        } else {
            newVideo.addEventListener('canplay', playVideo, { once: true });
            // Fallback timeout
            setTimeout(playVideo, 2000);
        }

        // Reset auto-play timer
        resetAutoPlay();
    }

    // Next video
    function nextVideo() {
        const next = (currentVideo + 1) % videos.length;
        switchVideo(next);
    }

    // Previous video
    function prevVideo() {
        const prev = (currentVideo - 1 + videos.length) % videos.length;
        switchVideo(prev);
    }

    // Auto-play with longer interval
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextVideo, 25000); // Change every 25 seconds
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', prevVideo);
    if (nextBtn) nextBtn.addEventListener('click', nextVideo);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => switchVideo(index));
    });

    // Keyboard navigation - only when not in chat
    document.addEventListener('keydown', (e) => {
        const chatInput = document.getElementById('chatInput');
        if (document.activeElement === chatInput) return;
        
        if (e.key === 'ArrowLeft') prevVideo();
        if (e.key === 'ArrowRight') nextVideo();
    });

    // Pause auto-play when page is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(autoPlayInterval);
            videos[currentVideo].pause();
        } else {
            videos[currentVideo].play().catch(() => {});
            startAutoPlay();
        }
    });

    // Start auto-play
    startAutoPlay();
}

// ===================================
// SCROLL ANIMATIONS
// ===================================
function initScrollAnimations() {
    // Hide/show video controls based on scroll position
    const videoControls = document.querySelector('.video-controls');
    const heroSection = document.querySelector('.hero');
    
    if (videoControls && heroSection) {
        window.addEventListener('scroll', () => {
            const heroHeight = heroSection.offsetHeight;
            if (window.scrollY > heroHeight - 100) {
                videoControls.classList.add('hidden');
            } else {
                videoControls.classList.remove('hidden');
            }
        });
    }
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    const animateElements = document.querySelectorAll(`
        .service-card,
        .project-card,
        .skill-item,
        .contact-item
    `);

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ===================================
// SMOOTH SCROLL
// ===================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const offset = 80;
                const targetPosition = target.offsetTop - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// CONTACT FORM
// ===================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        // Disable submit button during request
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';

        try {
            // Use relative URL for API call (works in both dev and production)
            const apiUrl = '/api/contact';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'same-origin'
            });

            if (!response.ok) {
                const errorResult = await response.json().catch(() => ({}));
                throw new Error(errorResult.error || `Server error: ${response.status}`);
            }

            const result = await response.json();

            showFormStatus('success', result.message || '✅ Message sent successfully! I\'ll get back to you within 24 hours.');
            form.reset();
            
            // Show toast notification
            if (window.showToast) {
                window.showToast('✅ Message sent successfully!');
            }
            
            // Track successful submission
            trackEvent('contact_form_success', { email: data.email });

        } catch (error) {
            if (window.DEBUG_MODE) console.error('Contact form error:', error);
            
            // More specific error messages
            let errorMessage = '⚠️ ';
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage += 'Network error. Please check your connection.';
            } else if (error.message.includes('Server error')) {
                errorMessage += error.message;
            } else {
                errorMessage += error.message || 'Something went wrong.';
            }
            errorMessage += ' You can also email me directly at marakibgolder@gmail.com';
            
            showFormStatus('error', errorMessage);
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });

    function showFormStatus(type, message) {
        formStatus.className = `form-status ${type}`;
        formStatus.textContent = message;
        formStatus.style.display = 'block';

        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Debounce function for performance
function debounce(func, wait) {
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

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===================================
// PERFORMANCE MONITORING
// ===================================
function initPerformanceMonitoring() {
    // Log page load performance
    window.addEventListener('load', () => {
        if (window.performance) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
            
            if (window.DEBUG_MODE) {
                console.log('%c⚡ Performance Metrics', 'color: #14b8a6; font-weight: bold; font-size: 14px;');
                console.log(`Page Load Time: ${pageLoadTime}ms`);
                console.log(`DOM Ready Time: ${domReadyTime}ms`);
            }
        }
    });
}

// ===================================
// ACCESSIBILITY ENHANCEMENTS
// ===================================
function initAccessibility() {
    // Add skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#home';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--primary);
        color: white;
        padding: 8px 16px;
        text-decoration: none;
        z-index: 10000;
        border-radius: 0 0 8px 0;
    `;
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
    });
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add focus indicators for keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
    });
}

// ===================================
// ANALYTICS TRACKING
// ===================================
function trackEvent(eventName, data = {}) {
    // Track custom events for analytics
    try {
        const apiUrl = window.location.origin + '/api/analytics';
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: eventName,
                data: data
            })
        }).catch(err => console.log('Analytics tracking failed:', err));
    } catch (error) {
        console.log('Analytics error:', error);
    }
}

// Track page view on load
window.addEventListener('load', () => {
    trackEvent('page_view', {
        url: window.location.pathname,
        referrer: document.referrer
    });
});

// ===================================
// AI CHAT ASSISTANT
// ===================================
function initAIChat() {
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatWindow = document.getElementById('chatWindow');
    const chatForm = document.getElementById('chatInputForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');

    // Debug: Check if elements exist
    if (!chatToggleBtn) {
        console.error('AI Chat Error: chatToggleBtn not found');
        return;
    }
    if (!chatWindow) {
        console.error('AI Chat Error: chatWindow not found');
        return;
    }
    if (!chatForm) {
        console.error('AI Chat Error: chatInputForm not found');
        return;
    }
    if (!chatInput) {
        console.error('AI Chat Error: chatInput not found');
        return;
    }
    if (!chatMessages) {
        console.error('AI Chat Error: chatMessages not found');
        return;
    }

    console.log('✅ AI Chat initialized successfully');

    let history = [];
    const MAX_HISTORY = 6;
    let typingNode = null;

    // Toggle chat
    chatToggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            chatInput.focus();
            trackEvent('ai_chat_opened');
        }
    });

    // Close chat
    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', () => {
            chatWindow.classList.remove('active');
        });
    }

    // Quick replies
    quickReplyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sendMessage(btn.dataset.message);
        });
    });

    // Submit
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (!msg) return;
        chatInput.value = '';
        sendMessage(msg);
    });

    async function sendMessage(message) {
        addMessage(message, 'user');
        showTyping();

        try {
            const res = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    history: history
                })
            });

            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }

            const data = await res.json();
            removeTyping();

            if (!data.reply) {
                throw new Error('No reply from AI');
            }

            addMessage(data.reply, 'bot');
            saveHistory(message, data.reply);
            trackEvent('ai_chat_message', { success: true });

        } catch (err) {
            removeTyping();
            console.error('❌ AI Chat Error:', err);
            
            let errorMessage = '⚠️ Sorry, I encountered an error. ';
            
            if (err.message.includes('Failed to fetch')) {
                errorMessage += 'Unable to connect to the server. Please check your internet connection.';
            } else if (err.message.includes('500')) {
                errorMessage += 'The server encountered an error. Please try again later.';
            } else {
                errorMessage += 'Please try again or email me at marakibgolder@gmail.com';
            }
            
            addMessage(errorMessage, 'bot');
            trackEvent('ai_chat_message', { success: false, error: err.message });
        }
    }

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `chat-message ${sender}-message`;

        div.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <p>${escapeHTML(text)}</p>
            </div>
        `;

        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping() {
        if (typingNode) return;

        typingNode = document.createElement('div');
        typingNode.className = 'chat-message bot-message typing-message';
        typingNode.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>Typing<span class="dots">...</span></p>
            </div>
        `;
        chatMessages.appendChild(typingNode);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTyping() {
        if (typingNode) {
            typingNode.remove();
            typingNode = null;
        }
    }

    function saveHistory(user, ai) {
        history.push({ user, ai });
        if (history.length > MAX_HISTORY) history.shift();
    }

    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[c]);
    }

    // Voice Input Feature
    const voiceBtn = document.getElementById('voiceBtn');
    
    if (voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        let isListening = false;

        voiceBtn.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
                return;
            }

            try {
                recognition.start();
                isListening = true;
                voiceBtn.style.color = '#e74c3c';
                voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                chatInput.placeholder = 'Listening...';
            } catch (err) {
                if (window.DEBUG_MODE) console.error('Voice recognition error:', err);
            }
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            chatInput.value = transcript;
            isListening = false;
            voiceBtn.style.color = '';
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            chatInput.placeholder = 'Type or speak your message...';
            
            // Auto-send if transcript is valid
            if (transcript.trim()) {
                sendMessage(transcript);
            }
        };

        recognition.onerror = (event) => {
            if (window.DEBUG_MODE) console.error('Speech recognition error:', event.error);
            isListening = false;
            voiceBtn.style.color = '';
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            chatInput.placeholder = 'Type or speak your message...';
            
            if (event.error === 'not-allowed') {
                addMessage('⚠️ Microphone access denied. Please enable microphone permissions.', 'bot');
            }
        };

        recognition.onend = () => {
            isListening = false;
            voiceBtn.style.color = '';
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            chatInput.placeholder = 'Type or speak your message...';
        };
    } else if (voiceBtn) {
        // Hide voice button if not supported
        voiceBtn.style.display = 'none';
    }
}

// ===================================
// ANIMATED COUNTERS
// ===================================
function initAnimatedCounters() {
    const stats = document.querySelectorAll('.stat h3');
    
    const animateValue = (element, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value + '+';
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const text = entry.target.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                if (!isNaN(number)) {
                    animateValue(entry.target, 0, number, 2000);
                    observer.unobserve(entry.target);
                }
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

// ===================================
// SCROLL PROGRESS BAR
// ===================================
function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgressBar');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / documentHeight) * 100;
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    });
}

// ===================================
// SCROLL TO TOP BUTTON
// ===================================
function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTop');
    if (!scrollBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===================================
// TOAST NOTIFICATIONS
// ===================================
function initToastNotifications() {
    // Toast is initialized and ready to use
}

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;

    const messageEl = toast.querySelector('.toast-message');
    messageEl.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Make showToast globally available
window.showToast = showToast;

// ===================================
// PARTICLE EFFECTS
// ===================================
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };
    let animationId = null;
    let isVisible = true;
    
    // Set canvas size
    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    setCanvasSize();
    
    // Debounced resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            setCanvasSize();
            init();
        }, 200);
    });
    
    // Throttled mouse move
    let lastMouseUpdate = 0;
    window.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastMouseUpdate > 16) { // ~60fps
            mouse.x = e.x;
            mouse.y = e.y;
            lastMouseUpdate = now;
        }
    });
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.2 - 0.1;
            this.speedY = Math.random() * 0.2 - 0.1;
            this.color = `rgba(${Math.random() > 0.5 ? '139, 92, 246' : '6, 182, 212'}, ${Math.random() * 0.25 + 0.15})`;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
            if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
            
            // Mouse interaction (simplified)
            if (mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distSq = dx * dx + dy * dy;
                
                if (distSq < mouse.radius * mouse.radius) {
                    const distance = Math.sqrt(distSq);
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= (dx / distance) * force * 1.5;
                    this.y -= (dy / distance) * force * 1.5;
                }
            }
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    function init() {
        particles = [];
        // Fewer particles for better performance
        const numberOfParticles = Math.min(Math.floor((canvas.width * canvas.height) / 30000), 40);
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    }
    
    function connect() {
        const len = particles.length;
        for (let a = 0; a < len; a++) {
            for (let b = a + 1; b < len; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distSq = dx * dx + dy * dy;
                
                if (distSq < 10000) { // 100^2
                    const opacity = (100 - Math.sqrt(distSq)) / 100;
                    ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.08})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    function animate() {
        if (!isVisible) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let particle of particles) {
            particle.update();
            particle.draw();
        }
        
        connect();
        animationId = requestAnimationFrame(animate);
    }
    
    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
        if (isVisible && !animationId) {
            animate();
        } else if (!isVisible && animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    });
    
    init();
    animate();
}

// Initialize particles on load
if (document.getElementById('particles-canvas')) {
    initParticles();
}

// ===================================
// CUSTOM CURSOR
// ===================================
function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    if (!cursor) return;
    
    const dot = cursor.querySelector('.cursor-dot');
    const outline = cursor.querySelector('.cursor-outline');
    
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;
    let animationId = null;
    let isVisible = true;
    
    // Use transform instead of left/top for better performance
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });
    
    function animateOutline() {
        if (!isVisible) return;
        
        outlineX += (mouseX - outlineX) * 0.12;
        outlineY += (mouseY - outlineY) * 0.12;
        
        outline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
        
        animationId = requestAnimationFrame(animateOutline);
    }
    
    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
        if (isVisible && !animationId) {
            animateOutline();
        } else if (!isVisible && animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    });
    
    animateOutline();
    
    // Add hover effects
    const hoverElements = document.querySelectorAll('a, button, .btn, .project-card, .service-card');
    
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
}

// Initialize custom cursor
if (window.innerWidth > 1024) {
    initCustomCursor();
}

// ===================================
// SCROLL REVEAL ANIMATION
// ===================================
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .service-card, .project-card, .skill-item, .testimonial-card');
    
    const revealOnScroll = () => {
        reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100 && elementBottom > 0) {
                element.classList.add('active');
            }
        });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check
}

// Initialize scroll reveal
setTimeout(initScrollReveal, 500);

// ===================================
// PAGE LOADER
// ===================================
window.addEventListener('load', () => {
    const loader = document.querySelector('.page-loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 500);
    }
});

// Log ready
console.log('%c🚀 Portfolio Loaded Successfully! ', 'background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px; font-weight: bold;');
console.log('%cDesigned & Developed by MD Rakib Golder', 'color: #8b5cf6; font-size: 12px;');
console.log('%c✨ World-Class Design & Performance', 'color: #06b6d4; font-size: 12px;');
console.log('%c🤖 AI Assistant Ready', 'color: #8b5cf6; font-size: 12px;');
console.log('%c🎨 Beautiful Animations & Effects Active', 'color: #10b981; font-size: 12px;');
