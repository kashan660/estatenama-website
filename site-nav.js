/**
 * site-nav.js — single source of truth for the site chrome (header nav,
 * Projects dropdown, and footer link columns).
 *
 * It rebuilds those menus from LIVE database data on every page load:
 *   - /api/pages/nav  -> published Pages flagged "show in nav"
 *   - /api/projects   -> active Projects
 *
 * Because the menus are rendered from the DB each load, creating or deleting a
 * Page/Project in the admin makes it appear/disappear in the header, dropdown,
 * and footer everywhere automatically — no manual menu editing.
 *
 * Load this LAST on a page (after any page-specific script) so it owns the
 * mobile hamburger toggle and there are no double-bound handlers.
 */
(function () {
    'use strict';

    function api(path) {
        return fetch(path, { headers: { Accept: 'application/json' } })
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return null; });
    }
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    // Absolute paths so links resolve from any URL depth (/, /post/x, /page/x, subfiles).
    function pageUrl(slug) { return '/page/' + encodeURIComponent(slug); }
    function projectUrl(slug) { return '/project-details.html?project=' + encodeURIComponent(slug); }

    // --- Header: inject dynamic Pages before the Contact item -------------
    function hydrateHeaderPages(pages) {
        if (!Array.isArray(pages)) return;
        document.querySelectorAll('.nav-menu').forEach(function (menu) {
            menu.querySelectorAll('li.dyn-page').forEach(function (el) { el.remove(); });
            var contact = menu.querySelector('a[href$="#contact"]');
            var ref = contact ? contact.closest('li') : null;
            pages.forEach(function (p) {
                var li = document.createElement('li');
                li.className = 'dyn-page';
                var a = document.createElement('a');
                a.className = 'nav-link';
                a.href = pageUrl(p.slug);
                a.textContent = p.title;
                li.appendChild(a);
                if (ref) menu.insertBefore(li, ref); else menu.appendChild(li);
            });
        });
    }

    // --- Header: rebuild the Projects dropdown from DB projects -----------
    function hydrateProjectsDropdown(projects) {
        if (!Array.isArray(projects)) return;
        document.querySelectorAll('.dropdown-menu').forEach(function (menu) {
            menu.innerHTML =
                '<li><a href="/index.html#projects" class="dropdown-link">All Projects</a></li>' +
                projects.map(function (p) {
                    return '<li><a class="dropdown-link" href="' + esc(projectUrl(p.slug)) + '">' + esc(p.title) + '</a></li>';
                }).join('');
        });
    }

    // --- Footer helpers ---------------------------------------------------
    function footerLists(heading) {
        var out = [];
        document.querySelectorAll('.footer-section').forEach(function (sec) {
            var h = sec.querySelector('h4');
            if (h && h.textContent.trim().toLowerCase() === heading.toLowerCase()) {
                var ul = sec.querySelector('ul');
                if (ul) out.push(ul);
            }
        });
        return out;
    }
    function hydrateFooterProjects(projects) {
        if (!Array.isArray(projects)) return;
        footerLists('Our Projects').forEach(function (ul) {
            ul.innerHTML = projects.map(function (p) {
                return '<li><a href="' + esc(projectUrl(p.slug)) + '">' + esc(p.title) + '</a></li>';
            }).join('');
        });
    }
    function hydrateFooterPages(pages) {
        if (!Array.isArray(pages) || !pages.length) return;
        footerLists('Quick Links').forEach(function (ul) {
            ul.querySelectorAll('li.dyn-page').forEach(function (el) { el.remove(); });
            pages.forEach(function (p) {
                var li = document.createElement('li');
                li.className = 'dyn-page';
                var a = document.createElement('a');
                a.href = pageUrl(p.slug);
                a.textContent = p.title;
                li.appendChild(a);
                ul.appendChild(li);
            });
        });
    }

    // --- Mobile hamburger: own it exclusively -----------------------------
    // Clone the node to strip any handler bound by an earlier page script,
    // guaranteeing a single, working toggle regardless of load order.
    function setupHamburger() {
        var hamburger = document.querySelector('.hamburger');
        var navMenu = document.querySelector('.nav-menu');
        if (!hamburger || !navMenu) return;
        var fresh = hamburger.cloneNode(true);
        hamburger.parentNode.replaceChild(fresh, hamburger);
        fresh.addEventListener('click', function () {
            fresh.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        // Close the menu after a link is chosen (works for dynamic links too).
        navMenu.addEventListener('click', function (e) {
            if (e.target.closest('a')) {
                fresh.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    function boot() {
        setupHamburger();
        api('/api/pages/nav').then(function (pages) {
            hydrateHeaderPages(pages);
            hydrateFooterPages(pages);
        });
        api('/api/projects').then(function (list) {
            var projects = Array.isArray(list) ? list.filter(function (p) {
                var s = p.status || 'active';
                return s !== 'inactive' && s !== 'draft';
            }) : [];
            hydrateProjectsDropdown(projects);
            hydrateFooterProjects(projects);
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
