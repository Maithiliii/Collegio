import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Signup from "./screens/Signup";
import Login from "./screens/Login";
import Home from "./screens/Home";
import PostScreen from "./screens/PostScreen";
import GoodsList from "./screens/GoodsList";
import ServicesList from "./screens/ServicesList";
import UpdatesScreen from "./screens/UpdatesScreen"; 

export type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: { name: string };
  Post: undefined;
  Goods: { focusId?: string };   
  Services: { focusId?: string };
  Updates: undefined;  
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="Post" component={PostScreen} options={{ title: "Post Something" }} />
      <Stack.Screen name="Goods" component={GoodsList} options={{ title: "Goods" }} />
      <Stack.Screen name="Services" component={ServicesList} options={{ title: "Services" }} />
      <Stack.Screen name="Updates" component={UpdatesScreen} options={{ title: "Your Updates" }} /> 
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;
