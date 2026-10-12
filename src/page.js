import { onChapter } from './chapters.js';

export function initPage({ lenis, reduced }) {
    // Mobile menu
    const menuBtn = document.getElementById('menu-btn');
    const menu = document.getElementById('mobile-menu');
    const setMenu = (open) => {
        menu.hidden = !open;
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menuBtn.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
    };
    menuBtn.addEventListener('click', () => setMenu(menu.hidden));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

    // Reveal on scroll
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduced) {
        items.forEach((el) => el.classList.add('is-in'));
    } else {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                io.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        items.forEach((el) => io.observe(el));
    }

    // Work filter
    const filters = document.querySelectorAll('[data-filter]');
    const cases = document.querySelectorAll('#work [data-cat]');
    filters.forEach((btn) => btn.addEventListener('click', () => {
        const f = btn.dataset.filter;
        filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        cases.forEach((item) => { item.hidden = f !== 'all' && !item.dataset.cat.split(' ').includes(f); });
        // Hide a two-up row when both of its cards are filtered out
        document.querySelectorAll('#work .grid-2').forEach((row) => {
            row.hidden = [...row.children].every((c) => c.hidden);
        });
        lenis?.resize();
    }));

    // Dialogs: pause smooth scrolling while one is open
    const openDialog = (dialog) => {
        dialog.showModal();
        lenis?.stop();
    };
    document.querySelectorAll('dialog').forEach((dialog) => {
        dialog.addEventListener('close', () => lenis?.start());
        dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    });

    // Figma viewer: the embed only loads when someone opens it
    const figmaDialog = document.getElementById('figma-dialog');
    const figmaFrame = document.getElementById('figma-frame');
    document.querySelectorAll('[data-figma]').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (figmaFrame.getAttribute('src') !== btn.dataset.figma) figmaFrame.src = btn.dataset.figma;
            document.getElementById('figma-title').textContent = btn.dataset.title;
            document.getElementById('figma-open').href = btn.dataset.figmaUrl;
            openDialog(figmaDialog);
        });
    });
    document.getElementById('figma-close').addEventListener('click', () => figmaDialog.close());

    // Video viewer: the file only downloads when someone asks to watch it
    const videoDialog = document.getElementById('video-dialog');
    const video = document.getElementById('video-el');
    document.querySelectorAll('[data-video]').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (video.getAttribute('src') !== btn.dataset.video) video.src = btn.dataset.video;
            document.getElementById('video-title').textContent = btn.dataset.title;
            openDialog(videoDialog);
            video.play().catch(() => {});
        });
    });
    document.getElementById('video-close').addEventListener('click', () => videoDialog.close());
    videoDialog.addEventListener('close', () => video.pause());

    // Optional media (the cycling reel): hide any file that hasn't been added yet,
    // and the whole reel if none have
    document.querySelectorAll('[data-optional]').forEach((fig) => {
        const media = fig.querySelector('img, video');
        const missing = () => {
            fig.hidden = true;
            const group = fig.closest('[data-optional-group]');
            if (group && [...group.querySelectorAll('[data-optional]')].every((f) => f.hidden)) group.hidden = true;
        };
        media.addEventListener('error', missing);
        if (media.tagName === 'IMG' && media.complete && !media.naturalWidth) missing();
    });

    // Play muted preview clips only while they are on screen
    const clips = document.querySelectorAll('video[data-inview]');
    if (clips.length && !reduced) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()));
        }, { threshold: 0.4 });
        clips.forEach((v) => io.observe(v));
    }

    // Copy email
    const copyBtn = document.getElementById('copy-email');
    const copyLabel = copyBtn.querySelector('span');
    const copyIcon = copyBtn.querySelector('use');
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(copyBtn.dataset.email);
            copyLabel.textContent = 'Copied';
            copyIcon.setAttribute('href', '#i-check');
        } catch {
            copyLabel.textContent = copyBtn.dataset.email;
        }
        setTimeout(() => {
            copyLabel.textContent = 'Copy email';
            copyIcon.setAttribute('href', '#i-copy');
        }, 2000);
    });

    // Local time in Nigeria
    const timeEl = document.getElementById('local-time');
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' });
    const tick = () => { timeEl.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 30000);
    document.getElementById('year').textContent = new Date().getFullYear();

    // Chapter gauge and the nav's scrolled state
    const num = document.getElementById('gauge-num');
    const label = document.getElementById('gauge-label');
    const fill = document.getElementById('gauge-fill');
    const nav = document.querySelector('.nav-wrap');
    onChapter((c) => {
        document.documentElement.dataset.chapter = c.index;
        num.textContent = String(c.index).padStart(2, '0');
        label.textContent = c.label;
    });
    let queued = false;
    const onScroll = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
            queued = false;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            fill.style.transform = `scaleY(${max > 0 ? window.scrollY / max : 0})`;
            nav.classList.toggle('is-scrolled', window.scrollY > 24);
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}
