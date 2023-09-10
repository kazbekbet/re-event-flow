module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: './tsconfig.json',
		tsconfigRootDir: __dirname,
	},
	settings: {
		react: {
			version: 'detect',
		},
		'import/resolver': {
			typescript: {},
		},
	},
	extends: [
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript',
		'plugin:jsx-a11y/recommended',
		'plugin:eslint-comments/recommended',
		'prettier',
		'plugin:prettier/recommended',
	],
	plugins: ['react', '@typescript-eslint', 'import', 'simple-import-sort', 'prettier'],
	rules: {
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/ban-types': 'off',
		'@typescript-eslint/no-namespace': 'off',
		'linebreak-style': ['error', 'unix'],
		'no-param-reassign': ['error', { props: false }], // запретить мутацию аргументов
		'no-unused-vars': 'off',
		'no-underscore-dangle': 'off', // подчеркивание перед именем (_name)
		'no-console': ['warn', { allow: ['warn', 'error'] }], // предупреждать об использовании console.log
		semi: ['warn', 'always'], // точка с запятой
		'spaced-comment': ['warn', 'always'], // пробел в начале коммента
		'react/prop-types': 'off',
		'react/jsx-uses-react': 'off',
		'react/react-in-jsx-scope': 'off',
		'prettier/prettier': 'warn',
		'prettier.bracketSpacing': 0,
		'@typescript-eslint/dot-notation': 'warn', // доступ к свойствам через точку target[id] -> target.id
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '(_)', varsIgnorePattern: '(_)' }], // не используемые переменные
		'@typescript-eslint/no-var-requires': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off', // запрещает знаки - "?" "!"
		'@typescript-eslint/ban-ts-comment': [
			'warn',
			{
				'ts-expect-error': 'allow-with-description',
				'ts-ignore': 'allow-with-description',
			},
		],
		'@typescript-eslint/naming-convention': [
			'warn',
			{
				selector: 'variableLike', // function, parameter, variable
				format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
				leadingUnderscore: 'allow',
			},
			{
				selector: 'typeLike', // class, enum, interface, typeAlias, typeParameter
				format: ['PascalCase'],
			},
		],
		'import/export': 'error',
		'import/no-duplicates': 'error',
		'import/order': 'off', // конфликтует с prettier и simple-import-sort
		'import/no-extraneous-dependencies': 'off', // сравнивает с зависимостями в package
		'import/no-cycle': 'off', // цикл зависимости модулей
		'import/prefer-default-export': 'off', // "export default"
		'simple-import-sort/imports': [
			'error',
			{
				groups: [
					['^react'], // Rreact
					['@\\/(.*)'], // Зависимости с @/
					['^@\\b(?:(?!helpers|hooks|libs|types|ui)\\w)+\\b'], // Зависимости с @
					['^\\w+'], // Зависимости
					['^(@helpers|@hooks|@libs|@types|@ui)'], // Элиасы, внутренние директории
					['^([.]+\\/(\\b(?:(?!.*?css$|.*?scss$)\\w)+\\b)|(\\.\\.)+\\/)'], // Относительные пути, кроме style
					['\\/*.*.s?css$'], // Стили
				],
			},
		],
	},
};
