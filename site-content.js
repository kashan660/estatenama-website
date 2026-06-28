/**
 * site-content.js — hydrates the public homepage from the database.
 * Progressive enhancement: if the API returns data we replace the static
 * placeholders; if it fails or is empty we leave the static HTML untouched.
 */
(function () {
    'use strict';

    // Same-origin API (Vercel / local admin-server-prod serve API + static together).
    var API = '';

    function api(path) {
        return fetch(API + path, { headers: { 'Accept': 'application/json' } })
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return null; });
    }

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // ---- Hero slideshow -------------------------------------------------
    function hydrateHero(sections) {
        if (!Array.isArray(sections)) return;
        var hero = sections.find(function (s) { return s.type === 'hero'; });
        var images = hero && Array.isArray(hero.images) ? hero.images.filter(Boolean) : [];
        if (!images.length) return; // keep static fallback

        var bg = document.querySelector('.hero .hero-background');
        if (!bg) return;

        var overlay = bg.querySelector('.hero-overlay');
        // Remove existing hero images (static placeholders)
        bg.querySelectorAll('.hero-bg-image').forEach(function (el) { el.remove(); });

        var imgEls = images.map(function (url, i) {
            var img = document.createElement('img');
            img.src = url;
            img.alt = 'Estate Nama - Premium Real Estate ' + (i + 1);
            img.className = 'hero-bg-image' + (i === 0 ? ' active' : '');
            img.loading = i === 0 ? 'eager' : 'lazy';
            return img;
        });
        // Insert before overlay so the dark gradient stays on top
        imgEls.forEach(function (img) { bg.insertBefore(img, overlay || null); });

        // Run our own rotation (the static script's interval now points at removed nodes).
        if (imgEls.length > 1) {
            var idx = 0;
            setInterval(function () {
                imgEls[idx].classList.remove('active');
                idx = (idx + 1) % imgEls.length;
                imgEls[idx].classList.add('active');
            }, 5000);
        }
    }

    // ---- Projects / Societies ------------------------------------------
    function plotGrid(plots, heading) {
        if (!Array.isArray(plots) || !plots.length) return '';
        var byType = {};
        plots.forEach(function (p) {
            var t = (p.type || 'Plots');
            (byType[t] = byType[t] || []).push(p.label || '');
        });
        return Object.keys(byType).map(function (type) {
            return '<h5>' + esc(type) + ':</h5>' +
                '<div class="plot-grid">' +
                byType[type].map(function (l) { return '<div class="plot-item">' + esc(l) + '</div>'; }).join('') +
                '</div>';
        }).join('');
    }

    function projectCard(p) {
        var img = p.featuredImage || (Array.isArray(p.images) && p.images[0]) || 'images/homepage/home1.png';
        var features = (Array.isArray(p.features) ? p.features : [])
            .map(function (f) { return '<span class="feature">' + esc(f) + '</span>'; }).join('');
        var plots = plotGrid(p.plots);
        var payment = p.paymentPlan
            ? '<div class="payment-plan"><h5>💳 Payment Plan</h5><p>' + esc(p.paymentPlan) + '</p></div>' : '';
        return '' +
            '<div class="project-card detailed">' +
                '<div class="project-image">' +
                    '<img src="' + esc(img) + '" alt="' + esc(p.title) + '" loading="lazy">' +
                    (p.badge ? '<div class="project-overlay"><div class="project-status">' + esc(p.badge) + '</div></div>' : '') +
                '</div>' +
                '<div class="project-content">' +
                    '<h4>' + esc(p.title) + '</h4>' +
                    (p.location ? '<p class="project-location">📍 ' + esc(p.location) + '</p>' : '') +
                    (p.description ? '<p class="project-description">' + esc(p.description) + '</p>' : '') +
                    (plots ? '<div class="plot-details">' + plots + '</div>' : '') +
                    (features ? '<div class="project-features">' + features + '</div>' : '') +
                    payment +
                    '<a href="project-details.html?project=' + esc(p.slug) + '" class="btn-secondary project-btn">Get Complete Details</a>' +
                '</div>' +
            '</div>';
    }

    function hydrateProjects(projects) {
        if (!Array.isArray(projects) || !projects.length) return; // keep static fallback
        var container = document.querySelector('#projects .container');
        if (!container) return;

        // Group by category (preserve insertion order)
        var groups = {};
        var order = [];
        projects.forEach(function (p) {
            var cat = p.category || 'Premium Projects';
            if (!groups[cat]) { groups[cat] = []; order.push(cat); }
            groups[cat].push(p);
        });

        var html = order.map(function (cat) {
            return '<div class="project-category">' +
                '<h3 class="category-title">' + esc(cat) + '</h3>' +
                '<div class="projects-grid">' + groups[cat].map(projectCard).join('') + '</div>' +
                '</div>';
        }).join('');

        // Remove existing static categories, append fresh ones after the subtitle.
        container.querySelectorAll('.project-category').forEach(function (el) { el.remove(); });
        var subtitle = container.querySelector('.section-subtitle');
        if (subtitle) subtitle.insertAdjacentHTML('afterend', html);
        else container.insertAdjacentHTML('beforeend', html);
    }

    // ---- Settings (branding, contact, social, WhatsApp) ----------------
    function hydrateSettings(settings) {
        if (!settings) return;

        // Logo (header + footer)
        if (settings.site_logo) {
            document.querySelectorAll('.logo-img, .footer-logo-img').forEach(function (img) {
                img.src = settings.site_logo;
            });
        }

        // Contact phone
        if (settings.contact_phone) {
            document.querySelectorAll('.phone-number').forEach(function (el) {
                el.textContent = settings.contact_phone;
            });
        }

        // Contact email
        if (settings.contact_email) {
            document.querySelectorAll('.contact-email-no-click').forEach(function (el) {
                el.textContent = settings.contact_email;
            });
        }

        // WhatsApp number — expose globally for openWhatsApp() (digits only)
        if (settings.whatsapp_number) {
            window.SITE_WHATSAPP = String(settings.whatsapp_number).replace(/\D/g, '');
        }

        // Social links — wire the footer icons (skip the WhatsApp one, it uses openWhatsApp)
        var socialMap = {
            'fa-facebook': settings.social_facebook,
            'fa-instagram': settings.social_instagram,
            'fa-linkedin': settings.social_linkedin
        };
        document.querySelectorAll('.social-links a').forEach(function (a) {
            var icon = a.querySelector('i');
            if (!icon) return;
            Object.keys(socialMap).forEach(function (cls) {
                if (icon.classList.contains(cls) && socialMap[cls]) {
                    a.href = socialMap[cls];
                    a.target = '_blank';
                    a.rel = 'noopener';
                }
            });
        });
    }

    // ---- Boot ----------------------------------------------------------
    function boot() {
        // Settings (logo, contact, social, WhatsApp) apply to every page.
        api('/api/settings').then(hydrateSettings);
        // Homepage-only hydration — skip the fetch when the target isn't present.
        if (document.querySelector('.hero .hero-background')) {
            api('/api/sections').then(hydrateHero);
        }
        if (document.querySelector('#projects .container')) {
            api('/api/projects').then(hydrateProjects);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
