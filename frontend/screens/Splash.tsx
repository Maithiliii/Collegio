import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "../App";
import { colors, font } from "../theme/tokens";

import Logo from "../assets/Logo.png";

type SplashScreenProp = NativeStackNavigationProp<RootStackParamList, "Splash">;

const MIN_DISPLAY_MS = 900;

const Splash: React.FC = () => {
  const navigation = useNavigation<SplashScreenProp>();

  useEffect(() => {
    const run = async () => {
      const [token] = await Promise.all([
        AsyncStorage.getItem("token"),
        new Promise<void>((resolve) => setTimeout(resolve, MIN_DISPLAY_MS)),
      ]);
      navigation.reset({ index: 0, routes: [{ name: token ? "Main" : "Login" }] });
    };
    run();
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <View style={styles.logoWrapper}>
        <View pointerEvents="none" style={styles.logoShadow} />
        <Image source={Logo} style={styles.logo} />
      </View>
      <Text style={styles.appName}>Collegio</Text>
      <Text style={styles.tagline}>Your campus marketplace</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center", gap: 14 },
  logoWrapper: { position: "relative", width: 130, height: 130 },
  logoShadow: {
    position: "absolute",
    top: 5,
    left: 5,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.ink,
  },
  logo: { width: 130, height: 130, borderRadius: 65, borderWidth: 3, borderColor: colors.ink },
  appName: { fontSize: 32, fontFamily: font.extrabold, color: colors.ink, marginTop: 6 },
  tagline: { fontSize: 13.5, fontFamily: font.semibold, color: colors.bodySecondary },
});

export default Splash;
