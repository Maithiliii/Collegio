import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/Home";
import GoodsList from "../screens/GoodsList";
import ServicesList from "../screens/ServicesList";
import LostFoundList from "../screens/LostFoundList";

export type MainTabParamList = {
  Home: { name?: string } | undefined;
  Goods: { focusId?: string } | undefined;
  Services: { focusId?: string } | undefined;
  LostFound: { focusId?: string } | undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false, tabBarStyle: { display: "none" }, animation: "fade" }}
    tabBar={() => null}
  >
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen name="Goods" component={GoodsList} />
    <Tab.Screen name="Services" component={ServicesList} />
    <Tab.Screen name="LostFound" component={LostFoundList} />
  </Tab.Navigator>
);

export default MainTabs;
