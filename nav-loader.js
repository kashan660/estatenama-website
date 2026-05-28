/**
 * Navigation Loader
 * Fetches dynamic pages from the API and adds them to the navigation menu
 * Include this script on any page where you want dynamic nav items
 */

async function loadDynamicNav() {
    try {
        const response = await fetch('/api/pages/nav');
        if (!response.ok) return;

        const pages = await response.json();
        if (!pages || pages.length === 0) return;

        const navMenu = document.getElementById('mainNavMenu');
        if (!navMenu) return;

        // Find the Contact link (last item before inserting)
        const contactLink = navMenu.querySelector('a[href="index.html#contact"]');
        const contactLi = contactLink ? contactLink.closest('li') : null;

        pages.forEach(page => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `page.html?slug=${page.slug}`;
            a.className = 'nav-link';
            a.textContent = page.title;

            // Check if current page is this dynamic page
            const urlParams = new URLSearchParams(window.location.search);
            const currentSlug = urlParams.get('slug');
            if (currentSlug === page.slug) {
                a.classList.add('active');
            }

            li.appendChild(a);

            if (contactLi) {
                navMenu.insertBefore(li, contactLi);
            } else {
                navMenu.appendChild(li);
            }
        });
    } catch (error) {
        console.warn('Failed to load dynamic navigation:', error);
    }
}

// Initialize hamburger menu
document.addEventListener('DOMContentLoaded', () => {
    loadDynamicNav();

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }
});
