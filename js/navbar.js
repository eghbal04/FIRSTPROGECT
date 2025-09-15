// Navbar functionality with iOS touch support
function initializeNavbar() {
    const menuBtn = document.getElementById('menu-btn');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuBtn && navMenu) {
        // Add both click and touchstart events for better iOS support
        function toggleMenu(e) {
            e.preventDefault();
            e.stopPropagation();
            navMenu.classList.toggle('active');
        }
        
        // Use touchstart for better iOS responsiveness
        menuBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            toggleMenu(e);
        }, { passive: false });
        
        // Keep click for desktop compatibility
        menuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleMenu(e);
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!menuBtn.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
            }
        });
        
        // Close menu when touching outside on mobile
        document.addEventListener('touchstart', function(event) {
            if (!menuBtn.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
            
            // Add touch support for nav links
            link.addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.click();
            }, { passive: false });
        });
    }
}

// Initialize navbar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavbar();
});
