// Which section ("chapter") is on screen. The 3D world and the side gauge both follow it.

const listeners = new Set();
export const chapter = { index: 0, label: 'Intro' };

export function onChapter(fn) {
    listeners.add(fn);
    fn(chapter);
    return () => listeners.delete(fn);
}

export function trackChapters() {
    const sections = [...document.querySelectorAll('[data-chapter]')];
    if (!sections.length) return;

    // The current chapter is the last one whose top has crossed 45% of the viewport
    const update = () => {
        const line = window.innerHeight * 0.45;
        let current = sections[0];
        for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s;
        const index = Number(current.dataset.chapter);
        if (index === chapter.index) return;
        chapter.index = index;
        chapter.label = current.dataset.chapterLabel;
        listeners.forEach((fn) => fn(chapter));
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
}
