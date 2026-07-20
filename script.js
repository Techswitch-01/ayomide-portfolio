// =========================================================================
// 1. THE WEBGL SHADER ENGINE (Precision Automotive Background)
// =========================================================================
(function() {
    const canvas = document.getElementById('shader-canvas-ANIMATION_7');
    if (!canvas) return;

    function syncSize() {
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }
    }
    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(syncSize).observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;
    
    const vs = `attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
    }`;
    
    const fs = `precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
    }

    vec2 get_point(vec2 id) {
        float h = hash(id);
        return id + vec2(sin(u_time * 0.5 + h * 6.28), cos(u_time * 0.8 + h * 6.28)) * 0.4;
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
        uv *= 4.0;
        
        vec2 id = floor(uv);
        vec2 gv = fract(uv) - 0.5;
        
        float m = 0.0;
        float minDist = 100.0;
        
        for(float y=-1.0; y<=1.0; y++) {
            for(float x=-1.0; x<=1.0; x++) {
                vec2 offset = vec2(x, y);
                vec2 p = get_point(id + offset);
                float d = length(uv - p);
                
                vec2 mouse = (u_mouse / u_resolution - 0.5) * 8.0;
                float mouseDist = length(p - mouse);
                d -= exp(-mouseDist * 2.0) * 0.2;
                
                if(d < minDist) minDist = d;
                
                for(float y2=-1.0; y2<=1.0; y2++) {
                    for(float x2=-1.0; x2<=1.0; x2++) {
                        if(x == 0.0 && y == 0.0 && x2 == 0.0 && y2 == 0.0) continue;
                        vec2 offset2 = vec2(x2, y2);
                        vec2 p2 = get_point(id + offset2);
                        
                        float lineDist = length(p - p2);
                        if(lineDist < 1.5) {
                            float l = 1.0 - smoothstep(0.0, 1.5, lineDist);
                            vec2 pa = uv - p, ba = p2 - p;
                            float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
                            float dLine = length(pa - ba * h);
                            m += smoothstep(0.02, 0.0, dLine) * l * 0.3;
                        }
                    }
                }
            }
        }
        
        m += smoothstep(0.08, 0.0, minDist);
        vec3 color = vec3(0.01, 0.01, 0.01); 
        color += m * vec3(0.5, 0.5, 0.5); 
        gl_FragColor = vec4(color, 1.0);
    }`;
    
    function cs(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
    }
    
    const prog = gl.createProgram();
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = window.innerHeight - event.clientY;
    });

    function render(t) {
        if (typeof ResizeObserver === 'undefined') syncSize();
        gl.viewport(0, 0, canvas.width, canvas.height);
        if (uTime) gl.uniform1f(uTime, t * 0.001);
        if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
        if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }
    render(0);
})();

// =========================================================================
// 2. PRECISION SMOOTH SCROLLING (Maintaining your 90px Offset Logic)
// =========================================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        const headerOffset = 90;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});

// =========================================================================
// 3. THE CASCADE REVEAL ANIMATION (Updated for Tailwind Classes)
// =========================================================================
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Adds the 'active' class to trigger the Tailwind transition
            entry.target.classList.add('active');
            // Unobserve to optimize performance after revealing once
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Target the new specific class assigned in the HTML
document.querySelectorAll('.reveal-item').forEach(el => observer.observe(el));

// =========================================================================
// 4. MAGNETIC BUTTONS (Heavy Physical UI)
// =========================================================================
// Target the new .magnetic-btn class from the updated HTML
const magnets = document.querySelectorAll('.magnetic-btn');

magnets.forEach(magnet => {
    magnet.addEventListener('mousemove', function(e) {
        const position = magnet.getBoundingClientRect();
        const x = e.clientX - position.left - position.width / 2;
        const y = e.clientY - position.top - position.height / 2;

        magnet.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });

    magnet.addEventListener('mouseleave', function() {
        magnet.style.transform = 'translate(0px, 0px)';
    });
});
// Simple Odometer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-count'));
            let current = 0;
            const timer = setInterval(() => {
                current += Math.ceil(target / 50);
                el.innerText = current;
                if (current >= target) {
                    el.innerText = target;
                    clearInterval(timer);
                }
            }, 30);
            observer.unobserve(el);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.odometer').forEach(el => observer.observe(el));