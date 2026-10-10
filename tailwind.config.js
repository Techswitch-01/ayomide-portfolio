/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./*.html'],
    theme: {
        extend: {
            colors: {
                ink: '#101017',
                paper: '#f4f4f5',
                steel: '#5b6170',
                brand: '#D30805',
            },
            fontFamily: {
                display: ['Outfit', 'system-ui', 'sans-serif'],
                body: ['Manrope', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
            },
            maxWidth: {
                container: '1200px',
            },
            borderRadius: {
                card: '20px',
            },
        },
    },
    plugins: [],
};
