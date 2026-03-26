// @see: https://stylelint.io

module.exports = {
	/* 继承某些已有的规则 */
	extends: [
		'stylelint-config-standard', // 配置stylelint拓展插件
		'stylelint-config-html/vue', // 配置 vue 中 template 样式格式化
		'stylelint-config-standard-scss', // 配置stylelint scss插件
		'stylelint-config-standard-vue/scss', // 配置 vue 中 scss 样式格式化
		// 'stylelint-config-recess-order', // 配置stylelint css属性书写顺序插件
	],
	overrides: [
		// 扫描 .vue/html 文件中的<style>标签内的样式
		{
			files: ['**/*.{vue,html}'],
			customSyntax: 'postcss-html',
		},
	],
	/**
	 * null  => 关闭该规则
	 */
	rules: {
		'at-rule-no-unknown': null, //解决tailwindcss警告
		'block-no-empty': null,
		'scss/at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: ['tailwind'],
			},
		],
		'declaration-block-no-duplicate-properties': true, // 禁止在声明块中使用重复的属性
		'no-descending-specificity': null, // 禁止在具有较高优先级的选择器后出现被其覆盖的较低优先级的选择器
		'property-no-unknown': [true, { ignoreProperties: ['/deep/', 'v-deep', 'deep'] }], // 禁止未知的属性(允许一些特殊的深度选择器)
		'no-empty-source': null, // 禁止空源码
		'selector-class-pattern': null, // 不强制选择器类名的格式
		'scss/at-import-partial-extension': null, // 解决不能引入scss文件
		'value-no-vendor-prefix': null, // 关闭 vendor-prefix(为了解决多行省略 -webkit-box)
		'selector-pseudo-class-no-unknown': [
			true,
			{
				ignorePseudoClasses: ['global', 'v-deep', 'deep'],
			},
		],
		// Note: The following stylistic rules were removed in stylelint v16
		// Use Prettier for formatting: string-quotes, unit-case, color-hex-case,
		// color-hex-length, rule-empty-line-before, block-opening-brace-space-before,
		// declaration-block-trailing-semicolon, function-url-quotes
	},
};
