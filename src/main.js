import '@fontsource-variable/bricolage-grotesque/standard.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import 'lenis/dist/lenis.css';
import './styles.css';

import Lenis from 'lenis';
import { initGlass } from './glass.js';
import { trackChapters } from './chapters.js';
import { initPage } from './page.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const compact = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;

let lenis = null;
if (!reduced) {
    lenis = new Lenis({ autoRaf: true, anchors: { offset: -96 } });
}

initPage({ lenis, reduced });
initGlass({ compact });
trackChapters();

// WebGL loads after the page is usable, in its own chunk
const hasWebGL = (() => {
    try {
        return !!document.createElement('canvas').getContext('webgl2');
    } catch {
        return false;
    }
})();

if (hasWebGL) {
    import('./islands.jsx').then(({ mountWorld, mountLiquidLogos }) => {
        mountWorld(document.getElementById('world'), { reduced, compact });
        mountLiquidLogos(document.querySelectorAll('[data-liquid-logo]'), { reduced });
    });
} else {
    document.documentElement.classList.add('no-webgl');
}
