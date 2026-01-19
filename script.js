/* ============================================
   VARSHA AKHAURI PORTFOLIO
   JavaScript Interactions
   ============================================ */

   document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initNavigation();
    initSmoothScroll();
    initScrollAnimations();
    initProjectCards();
    initProjectModal();
    initCustomCursor();
});

/* ============================================
   PROJECT DATA
   ============================================ */
const projectsData = {
    'smart-analysis': {
        title: 'Smart Analysis',
        description: 'Smart Analysis is a comprehensive data analytics platform designed to help businesses make informed decisions. The project involved creating an intuitive dashboard that visualizes complex data sets, making insights accessible to users of all technical backgrounds. Through extensive user research and iterative design, we developed a system that transforms raw data into actionable intelligence.',
        heroColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        heroImage: 'smart.jpg',
        videoEmbed: 'https://drive.google.com/file/d/1n0_9NNtVEIkj_35PG3r_D1SCKIDn8Gz8/preview',
        caseStudyEmbed: 'https://drive.google.com/file/d/1aAESKA-_RKuoi84VbYYLTveXoTGxpNul/preview'
    },
    'cricter': {
        title: 'Cricter',
        description: 'Cricter is a mobile-first cricket news and statistics application designed for cricket enthusiasts. The app features real-time match updates, comprehensive player statistics, live commentary, and editorial content. Working on the complete end-to-end design process, from user research to final UI, I created an experience that keeps fans connected to the game they love, with a focus on accessibility and seamless navigation.',
        heroColor: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        heroImage: 'cricter.jpg'
    },
    'navi-mumbai': {
        title: 'Navi Mumbai Airport',
        description: 'The Navi Mumbai International Airport wayfinding project is a comprehensive signage and navigation system designed to guide millions of passengers through the terminal. Working with a multidisciplinary team, I developed intuitive visual systems that transcend language barriers, ensuring smooth passenger flow and reducing anxiety in an often stressful environment. The design prioritizes accessibility, clarity, and the regional cultural identity.',
        heroColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        heroImage: 'navi.jpg'
    },
    'release-hound': {
        title: 'Release Monitor',
        description: 'Release Monitor is a SaaS product designed for agile development teams to streamline their release management process. The platform provides visibility into deployment pipelines, tracks release notes, and coordinates cross-team dependencies. Through research with product managers and developers, I designed an interface that balances powerful functionality with ease of use, reducing release-related stress and miscommunication.',
        heroColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        heroImage: 'release.jpg'
    }
};

/* ============================================
   PAGE LOADER
   ============================================ */
function initLoader() {
    const loader = document.querySelector('.loader');
    
    // Prevent scrolling while loading
    document.body.style.overflow = 'hidden';
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.style.overflow = '';
            
            // Trigger entrance animations
            triggerEntranceAnimations();
        }, 2000);
    });
}

function triggerEntranceAnimations() {
    const heroElements = document.querySelectorAll('.hero-name, .hero-intro, .hero-tagline, .infinity-container');
    
    heroElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100 + (index * 150));
    });
}

/* ============================================
   NAVIGATION
   ============================================ */
function initNavigation() {
    const nav = document.querySelector('.nav');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class for background
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        // Hide/show on scroll direction
        if (currentScroll > lastScroll && currentScroll > 400) {
            nav.style.transform = 'translateY(-100%)';
        } else {
            nav.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
    
    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            const sectionHeight = section.offsetHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                // Scroll section to the very top of viewport (no offset)
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */
function initScrollAnimations() {
    const animateElements = document.querySelectorAll(
        '.section-header, .project-card, .about-image-wrapper, .about-content, ' +
        '.detail-block, .connect-header, .award-item'
    );
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in', 'visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animateElements.forEach((el, index) => {
        el.classList.add('fade-in');
        
        // Add stagger delay for grid items
        if (el.classList.contains('project-card')) {
            el.style.transitionDelay = `${(index % 4) * 0.1}s`;
        }
        
        observer.observe(el);
    });
}

/* ============================================
   PROJECT CARDS
   ============================================ */
function initProjectCards() {
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach(card => {
        // Mouse move parallax effect
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;
            
            const placeholder = card.querySelector('.project-placeholder');
            if (placeholder) {
                placeholder.style.transform = `scale(1.05) translate(${deltaX * 5}px, ${deltaY * 5}px)`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const placeholder = card.querySelector('.project-placeholder');
            if (placeholder) {
                placeholder.style.transform = 'scale(1) translate(0, 0)';
            }
        });
    });
}

/* ============================================
   PROJECT MODAL
   ============================================ */
function initProjectModal() {
    const modal = document.getElementById('projectModal');
    const closeBtn = modal.querySelector('.modal-close');
    const cards = document.querySelectorAll('.project-card');
    
    // Views
    const infoView = document.getElementById('modalInfoView');
    const videoView = document.getElementById('modalVideoView');
    const caseStudyView = document.getElementById('modalCaseStudyView');
    
    // Embeds
    const videoEmbed = document.getElementById('videoEmbed');
    const caseStudyEmbed = document.getElementById('caseStudyEmbed');
    
    // Track current project data
    let currentProject = null;
    
    // Open modal
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.dataset.project;
            const projectData = projectsData[projectId];
            
            if (projectData) {
                currentProject = projectData;
                openModal(projectData);
            }
        });
    });
    
    // Close modal
    closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    function openModal(data) {
        const heroImage = modal.querySelector('.modal-hero-image');
        const title = modal.querySelector('.modal-title');
        const description = modal.querySelector('.modal-description');
        const videoBtn = modal.querySelector('.video-btn');
        const caseStudyBtn = modal.querySelector('.case-study-btn');
        
        // Set hero image or fallback to gradient
        if (data.heroImage) {
            heroImage.style.background = `url('${data.heroImage}') center/cover no-repeat`;
        } else {
            heroImage.style.background = data.heroColor;
        }
        title.textContent = data.title;
        description.textContent = data.description;
        
        // Update button states based on available content
        if (data.videoEmbed) {
            videoBtn.classList.remove('disabled');
        } else {
            videoBtn.classList.add('disabled');
        }
        
        if (data.caseStudyEmbed) {
            caseStudyBtn.classList.remove('disabled');
        } else {
            caseStudyBtn.classList.add('disabled');
        }
        
        // Reset to info view
        switchView('info');
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        currentProject = null;
        
        // Clear iframes to stop playback
        videoEmbed.src = '';
        caseStudyEmbed.src = '';
        
        // Reset to info view
        switchView('info');
    }
    
    function switchView(view) {
        // Hide all views
        infoView.classList.remove('active');
        videoView.classList.remove('active');
        caseStudyView.classList.remove('active');
        
        // Show selected view
        switch (view) {
            case 'video':
                videoView.classList.add('active');
                if (currentProject && currentProject.videoEmbed) {
                    videoEmbed.src = currentProject.videoEmbed;
                }
                break;
            case 'casestudy':
                caseStudyView.classList.add('active');
                if (currentProject && currentProject.caseStudyEmbed) {
                    caseStudyEmbed.src = currentProject.caseStudyEmbed;
                }
                break;
            default:
                infoView.classList.add('active');
                // Clear iframes when going back to info
                videoEmbed.src = '';
                caseStudyEmbed.src = '';
        }
    }
    
    // Video and Case Study button handlers
    const videoBtn = modal.querySelector('.video-btn');
    const caseStudyBtn = modal.querySelector('.case-study-btn');
    
    videoBtn.addEventListener('click', () => {
        if (currentProject && currentProject.videoEmbed) {
            switchView('video');
        }
    });
    
    caseStudyBtn.addEventListener('click', () => {
        if (currentProject && currentProject.caseStudyEmbed) {
            switchView('casestudy');
        }
    });
    
    // Back button handlers
    const backBtns = modal.querySelectorAll('.back-btn');
    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchView('info');
        });
    });
}

/* ============================================
   PARALLAX EFFECTS
   ============================================ */
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    // Parallax for hero infinity
    const infinityHero = document.querySelector('.infinity-hero');
    if (infinityHero) {
        const heroSection = document.querySelector('.hero');
        const heroRect = heroSection.getBoundingClientRect();
        
        if (heroRect.bottom > 0) {
            infinityHero.style.transform = `translateY(${scrolled * 0.1}px) rotate(${scrolled * 0.02}deg)`;
        }
    }
    
    // Parallax for scroll indicator fade
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        const opacity = Math.max(0, 1 - (scrolled / 300));
        scrollIndicator.style.opacity = opacity;
    }
});

/* ============================================
   MAGNETIC BUTTONS
   ============================================ */
document.querySelectorAll('.modal-btn, .view-btn').forEach(btn => {
    btn.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        this.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translate(0, 0)';
    });
});

/* ============================================
   INFINITY LOOP INTERACTION
   ============================================ */
const infinityContainer = document.querySelector('.infinity-container');
if (infinityContainer) {
    infinityContainer.addEventListener('mouseenter', () => {
        const infinityLine = infinityContainer.querySelector('.infinity-line');
        if (infinityLine) {
            infinityLine.style.strokeWidth = '4';
            infinityLine.style.filter = 'drop-shadow(0 0 10px rgba(124, 58, 237, 0.5))';
        }
    });
    
    infinityContainer.addEventListener('mouseleave', () => {
        const infinityLine = infinityContainer.querySelector('.infinity-line');
        if (infinityLine) {
            infinityLine.style.strokeWidth = '3';
            infinityLine.style.filter = 'none';
        }
    });
}

/* ============================================
   CONSOLE EASTER EGG
   ============================================ */
/* ============================================
   CUSTOM CURSOR - Simple & Clean
   ============================================ */
function initCustomCursor() {
    const cursor = document.querySelector('.cursor');
    
    if (!cursor) return;
    
    // Check if it's a touch device
    if ('ontouchstart' in window || window.innerWidth < 768) {
        cursor.style.display = 'none';
        document.body.style.cursor = 'auto';
        return;
    }
    
    // Track mouse position directly
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
}

console.log(`
%c∞ Varsha Akhauri
%cProduct Designer

"Not fixed in the state of 'being', but of 'becoming'"

Let's connect: varshaakhauri1@gmail.com

`, 
'color: #7C3AED; font-size: 24px; font-weight: bold;',
'color: #666666; font-size: 14px;'
);