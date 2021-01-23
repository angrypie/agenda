module.exports = {
	presets: ['module:metro-react-native-babel-preset'],
	plugins: [
		[
			'module-resolver',
			{
				extensions: ['.ts', '.tsx', '.android.tsx', '.ios.tsx'],
				root: ['./src'],
			},
		],
		'react-native-reanimated/plugin',
	],
}
