// scroll-mobile.js - Scroll features for mobile

// ============================================
// SCROLL TO TOP BUTTON
// ============================================

// Create scroll to top button
function createScrollButton() {
    const btn = document.createElement('button');
    btn.id = 'scrollToTop';
    btn.innerHTML = '↑';
    btn.title = 'Go to top';
    document.body.appendChild(btn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            btn.style.display = 'block';
        } else {
            btn.style.display = 'none';
        }
    });
    
    // Scroll to top when clicked
    btn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Ignore # alone
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// STICKY HEADER ON SCROLL
// ============================================

function initStickyHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
        
        lastScroll = currentScroll;
    });
}

// ============================================
// PULL TO REFRESH (Mobile)
// ============================================

function initPullToRefresh() {
    if (window.innerWidth > 768) return; // Only on mobile
    
    let startY = 0;
    let isPulling = false;
    
    // Create refresh indicator
    const refreshDiv = document.createElement('div');
    refreshDiv.className = 'pull-to-refresh';
    refreshDiv.textContent = '↓ Pull to refresh';
    document.body.insertBefore(refreshDiv, document.body.firstChild);
    
    document.addEventListener('touchstart', function(e) {
        if (window.pageYOffset === 0) {
            startY = e.touches[0].pageY;
            isPulling = true;
        }
    });
    
    document.addEventListener('touchmove', function(e) {
        if (!isPulling) return;
        
        const currentY = e.touches[0].pageY;
        const distance = currentY - startY;
        
        if (distance > 80) {
            refreshDiv.classList.add('active');
            refreshDiv.textContent = '↻ Release to refresh';
        }
    });
    
    document.addEventListener('touchend', function(e) {
        if (!isPulling) return;
        
        const currentY = e.changedTouches[0].pageY;
        const distance = currentY - startY;
        
        if (distance > 80) {
            refreshDiv.textContent = '↻ Refreshing...';
            
            // Refresh the page after animation
            setTimeout(function() {
                location.reload();
            }, 500);
        } else {
            refreshDiv.classList.remove('active');
        }
        
        isPulling = false;
    });
}

// ============================================
// INFINITE SCROLL (Optional - for large lists)
// ============================================

function initInfiniteScroll(containerSelector, loadMoreFunction) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    let isLoading = false;
    
    window.addEventListener('scroll', function() {
        if (isLoading) return;
        
        const scrollPosition = window.innerHeight + window.pageYOffset;
        const threshold = document.body.offsetHeight - 500;
        
        if (scrollPosition >= threshold) {
            isLoading = true;
            
            // Show loading indicator
            const loader = document.querySelector('.scroll-loading');
            if (loader) loader.classList.add('active');
            
            // Call the load more function
            loadMoreFunction().then(function() {
                isLoading = false;
                if (loader) loader.classList.remove('active');
            });
        }
    });
}

// ============================================
// PREVENT SCROLL WHEN MODAL IS OPEN
// ============================================

function preventBodyScroll(prevent) {
    if (prevent) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
    }
}

// Example: Use when opening modals
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        preventBodyScroll(true);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        preventBodyScroll(false);
    }
}

// ============================================
// SCROLL TO ELEMENT WITH OFFSET
// ============================================

function scrollToElement(elementId, offset = 100) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// ============================================
// INITIALIZE ALL SCROLL FEATURES
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    createScrollButton();
    initSmoothScroll();
    initStickyHeader();
    
    // Only on mobile
    if (window.innerWidth <= 768) {
        initPullToRefresh();
    }
    
    console.log('✅ Scroll features initialized');
});

// ============================================
// EXPORT FUNCTIONS (if needed)
// ============================================

window.scrollFeatures = {
    scrollToElement: scrollToElement,
    preventBodyScroll: preventBodyScroll,
    openModal: openModal,
    closeModal: closeModal
};
