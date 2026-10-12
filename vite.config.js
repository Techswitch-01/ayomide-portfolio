import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                // Keep the WebGL stack in its own cacheable chunk
                manualChunks(id) {
                    if (/node_modules[\/](three|@react-three|@shadergradient|camera-controls)/.test(id)) return 'three';
                },
            },
        },
    },
});
