module.exports = {
	// 格式化选项
	printWidth: 130, // 单行长度
	tabWidth: 2, // 缩进长度
	useTabs: true, // 使用空格代替tab缩进
	semi: true, // 句末使用分号
	singleQuote: true, // 使用单引号
	quoteProps: 'as-needed', // 对象属性引号
	trailingComma: 'es5', // 尾随逗号
	bracketSpacing: true, // 对象括号空格
	bracketSameLine: false, // 标签结束符位置
	arrowParens: 'always', // 箭头函数参数括号
	endOfLine: 'crlf', // Windows使用CRLF换行符

	// Vue 文件格式化
	vueIndentScriptAndStyle: true, // Vue文件script和style标签缩进

	// HTML 格式化
	htmlWhitespaceSensitivity: 'css', // HTML空白敏感性

	// 文件类型覆盖
	overrides: [
		{
			files: '*.vue',
			options: {
				parser: 'vue',
				printWidth: 120,
			},
		},
		{
			files: '*.json',
			options: {
				printWidth: 200,
			},
		},
		{
			files: '*.md',
			options: {
				printWidth: 100,
				proseWrap: 'always',
			},
		},
	],
};
