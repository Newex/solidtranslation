import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [],
	test: {
		include: ['tests/**/*.{test,spec}.{js,ts}']
	}
});
