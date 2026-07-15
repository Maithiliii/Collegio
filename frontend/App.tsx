import React from "react";
import { NavigationContainer, NavigatorScreenParams } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Splash from "./screens/Splash";
import Signup from "./screens/Signup";
import Login from "./screens/Login";
import PostScreen from "./screens/PostScreen";
import UpdatesScreen from "./screens/UpdatesScreen";
import MainTabs, { MainTabParamList } from "./navigation/MainTabs";

export type RootStackParamList = {
  Splash: undefined;
  Signup: undefined;
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Post: undefined;
  Updates: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Post" component={PostScreen} />
      <Stack.Screen name="Updates" component={UpdatesScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;
