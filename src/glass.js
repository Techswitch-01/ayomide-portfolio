// Liquid glass for any element marked [data-glass].
//
// Technique from shuding/liquid-glass (MIT, github.com/shuding/liquid-glass): draw a
// displacement map on a canvas, then feed it to an SVG feDisplacementMap that runs as a
// backdrop-filter. Here the map is a rounded-rect bezel, so whatever is behind the element
// bends at the rim like the edge of a thick lens, with a slight colour split.
//
// Only Chromium can run SVG filters inside backdrop-filter. Safari and Firefox keep the
// frosted CSS fallback from styles.css, which is why this is an enhancement, not a requirement.

const NS = 'http://www.w3.org/2000/svg';
const MAP_MAX = 220; // the map is drawn small and stretched; refraction is smooth anyway

let defs;
let uid = 0;

export const supportsRefraction = () =>
    !!navigator.userAgentData?.brands?.some((b) => /Chromium/.test(b.brand));

function getDefs() {
    if (defs) return defs;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    defs = document.createElementNS(NS, 'defs');
    svg.append(defs);
    document.body.append(svg);
    return defs;
}

// R and G hold the x/y offset (128 = none). Pixels within `bezel` of the edge sample
// from further inside, strongest right at the rim.
function drawMap(w, h, radius, bezel) {
    const k = Math.min(1, MAP_MAX / Math.max(w, h));
    const cw = Math.max(2, Math.round(w * k));
    const ch = Math.max(2, Math.round(h * k));
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(cw, ch);
    const r = Math.min(radius, w / 2, h / 2);
    const hw = w / 2;
    const hh = h / 2;

    for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
            const px = (x + 0.5) / k - hw;
            const py = (y + 0.5) / k - hh;
            const qx = Math.abs(px) - (hw - r);
            const qy = Math.abs(py) - (hh - r);
            let depth, nx, ny;
            if (qx > 0 && qy > 0) {
                const l = Math.hypot(qx, qy) || 1;
                depth = r - l;
                nx = qx / l;
                ny = qy / l;
            } else if (qx > qy) {
                depth = r - qx; nx = 1; ny = 0;
            } else {
                depth = r - qy; nx = 0; ny = 1;
            }
            nx *= Math.sign(px) || 1;
            ny *= Math.sign(py) || 1;
            const t = Math.max(0, Math.min(1, 1 - depth / bezel));
            const m = t * t * (3 - 2 * t);
            const i = (y * cw + x) * 4;
            img.data[i] = 128 - nx * m * 127;
            img.data[i + 1] = 128 - ny * m * 127;
            img.data[i + 2] = 128;
            img.data[i + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
    return canvas.toDataURL();
}

function channel(scale, matrix, result) {
    return `<feDisplacementMap in="SourceGraphic" in2="map" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="${result}d"/>
        <feColorMatrix in="${result}d" type="matrix" values="${matrix}" result="${result}"/>`;
}

function buildFilter(id, w, h, radius) {
    const bezel = Math.min(28, Math.min(w, h) * 0.42);
    const scale = Math.min(42, bezel * 1.4);
    const filter = document.createElementNS(NS, 'filter');
    filter.id = id;
    filter.setAttribute('x', '0');
    filter.setAttribute('y', '0');
    filter.setAttribute('width', String(w));
    filter.setAttribute('height', String(h));
    filter.setAttribute('filterUnits', 'userSpaceOnUse');
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    filter.innerHTML = `
        <feImage href="${drawMap(w, h, radius, bezel)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="map"/>
        ${channel(scale, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', 'r')}
        ${channel(scale * 1.06, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', 'g')}
        ${channel(scale * 1.12, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', 'b')}
        <feBlend in="r" in2="g" mode="screen" result="rg"/>
        <feBlend in="rg" in2="b" mode="screen"/>`;
    return filter;
}

function enhance(el) {
    const id = `lg-${++uid}`;
    let filter;
    let last = '';

    const update = () => {
        const w = Math.round(el.offsetWidth);
        const h = Math.round(el.offsetHeight);
        if (!w || !h) return;
        const radius = Number(el.dataset.glassRadius) || Math.min(w, h) / 2;
        const key = `${w}x${h}x${radius}`;
        if (key === last) return;
        last = key;
        const next = buildFilter(id, w, h, radius);
        filter ? filter.replaceWith(next) : getDefs().append(next);
        filter = next;
        el.style.setProperty('--glass-filter', `url(#${id})`);
    };

    let frame = 0;
    new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(update);
    }).observe(el);
}

// Phones keep the frosted fallback: a filter per element over a live WebGL backdrop costs
// too much on mobile GPUs
export function initGlass({ compact }) {
    if (compact || !supportsRefraction()) return;
    document.documentElement.classList.add('has-refraction');
    document.querySelectorAll('[data-glass]').forEach(enhance);
}
