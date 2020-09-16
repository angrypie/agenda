import { SpotManagerProps } from 'components/spot-manager'
import { ParamListBase } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'

//export type NavScreen<T> = (props: T) => JSX.Element

//======LIB DEFINED
//======LIB DEFINED
export type ScreensProps<T extends ParamListBase> = {
	[P in keyof T]: StackScreenProps<T, P>
}

//==== USER DEFINED
//==== USER DEFINED
export type RootScreenParams = {
	Main: undefined
	SpotManager: SpotManagerProps
	AddTaskModal: undefined
}

//=== APPLY

export type RootScreensProps = ScreensProps<RootScreenParams>

//const getScreen = <T>(screen: (props: T) => JSX.Element): JSX.Element => (
//)
