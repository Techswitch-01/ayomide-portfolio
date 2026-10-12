// React islands: the page itself is static HTML; only the WebGL pieces are React.

import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { LiquidMetal } from '@paper-design/shaders-react';
import World from './world/World.jsx';

const MARK = '/assets/logo-mark.svg';

export function mountWorld(el, opts) {
    createRoot(el).render(<World {...opts} />);
}

// The mark in liquid metal (paper-design/shaders), a warm chrome. The flat mark stays
// on screen while the shader prepares the image.
export function mountLiquidLogos(els, { reduced }) {
    els.forEach((el) => {
        createRoot(el).render(
            <Suspense fallback={<img src={MARK} alt="" />}>
                <LiquidMetal
                    image={MARK}
                    suspendWhenProcessingImage
                    colorBack="#00000000"
                    colorTint="#ffe9c9"
                    repetition={2.2}
                    softness={0.12}
                    shiftRed={0.32}
                    shiftBlue={0.38}
                    distortion={0.08}
                    contour={0.45}
                    angle={70}
                    speed={reduced ? 0 : 0.9}
                    scale={0.92}
                    fit="contain"
                    minPixelRatio={2}
                    style={{ width: '100%', height: '100%' }}
                />
            </Suspense>
        );
        el.classList.add('is-live');
    });
}
