import { defineConfig } from 'vite';

// Workaround: carregar plugin ESM dinamicamente para evitar erro quando
// Vite/Node tentam carregar arquivos CJS que importam ESM-only packages.
export default defineConfig(async () => {
	const reactPlugin = (await import('@vitejs/plugin-react')).default;
	return {
		plugins: [reactPlugin()],
		server: { port: 5173 },
	};
});