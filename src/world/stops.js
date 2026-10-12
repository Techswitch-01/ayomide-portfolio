// Heat tint: the straw-to-bronze-to-violet-to-blue colours a titanium exhaust takes on
export const PALETTE = {
    ink: '#06060b',
    straw: '#f2c27b',
    bronze: '#d9822f',
    violet: '#3a2ad0',
    blue: '#2f6bff',
};

// Camera and mesh pose for each chapter, in page order. The gradient's own controls
// ease between them, so scrolling to the next section swings the world round.
export const STOPS = [
    /* 0 Intro      */ { cAzimuthAngle: 180, cPolarAngle: 115, cDistance: 3.9, positionX: -0.5, positionY: 0.1, rotationZ: 235 },
    /* 1 Services   */ { cAzimuthAngle: 200, cPolarAngle: 95, cDistance: 3.2, positionX: 0, positionY: 0, rotationZ: 215 },
    /* 2 Work       */ { cAzimuthAngle: 160, cPolarAngle: 80, cDistance: 2.6, positionX: 0.4, positionY: -0.2, rotationZ: 255 },
    /* 3 Side proj. */ { cAzimuthAngle: 140, cPolarAngle: 100, cDistance: 3.0, positionX: -0.2, positionY: 0.3, rotationZ: 280 },
    /* 4 Experience */ { cAzimuthAngle: 190, cPolarAngle: 125, cDistance: 4.2, positionX: 0.3, positionY: 0, rotationZ: 225 },
    /* 5 Background */ { cAzimuthAngle: 220, cPolarAngle: 105, cDistance: 3.4, positionX: -0.4, positionY: -0.2, rotationZ: 200 },
    /* 6 Off clock  */ { cAzimuthAngle: 150, cPolarAngle: 85, cDistance: 3.0, positionX: 0.3, positionY: 0.2, rotationZ: 260 },
    /* 7 Contact    */ { cAzimuthAngle: 180, cPolarAngle: 90, cDistance: 2.4, positionX: 0, positionY: 0, rotationZ: 235 },
];
