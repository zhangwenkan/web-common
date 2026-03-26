// eslint.config.js
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
	js.configs.recommended,
	...pluginVue.configs['flat/essential'],
	{
		files: ['**/*.{js,mjs,cjs,ts,vue}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
			},
			parser: pluginVue.parser,
			parserOptions: {
				parser: typescriptParser,
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		plugins: {
			'@typescript-eslint': typescriptEslint,
			prettier,
		},
		rules: {
			'vue/multi-word-component-names': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/no-this-alias': 'off',
			'no-undef': 'off',
			'no-unused-vars': 'off',
			...prettierConfig.rules,
		},
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
	},
	{
		files: ['**/*.cjs'],
		languageOptions: {
			sourceType: 'commonjs',
			globals: {
				module: 'writable',
				require: 'readonly',
				exports: 'writable',
				__dirname: 'readonly',
				__filename: 'readonly',
			},
		},
	},
	{
		ignores: [
			'dist/**',
			'node_modules/**',
			'*.woff',
			'*.ttf',
			'*.md',
			'.vscode/**',
			'.idea/**',
			'.husky/**',
			'public/**',
			'.npmrc',
			'Dockerfile',
			'types/auto-imports.d.ts',
			'types/components.d.ts',
			'vite.config.ts',
		],
	},
];
