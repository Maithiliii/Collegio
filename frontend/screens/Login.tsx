import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import axios from "axios";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { REACT_APP_API_URL } from "@env";
import ShadowBox from "../components/ui/ShadowBox";
import { colors, font } from "../theme/tokens";

import Logo from "../assets/Logo.png";

type LoginScreenProp = NativeStackNavigationProp<RootStackParamList, "Login">;

const api = axios.create({
  baseURL: REACT_APP_API_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

const Login = () => {
  const navigation = useNavigation<LoginScreenProp>();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post("/users/login", formData);
      const { token, user } = res.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userName", user.name || "");
      await AsyncStorage.setItem("userEmail", user.email || "");

      navigation.replace("Home", { name: user.name });
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.error || "Invalid credentials or server error"
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.brand}>
        <Image source={Logo} style={styles.logo} />
        <Text style={styles.appName}>Collegio</Text>
        <Text style={styles.tagline}>
          Your campus marketplace —{"\n"}buy, sell & help each other out
        </Text>
      </View>

      <TextInput
        placeholder="College email"
        placeholderTextColor={colors.placeholder}
        value={formData.email}
        onChangeText={(v) => handleChange("email", v)}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor={colors.placeholder}
        secureTextEntry
        value={formData.password}
        onChangeText={(v) => handleChange("password", v)}
        style={styles.input}
      />

      <ShadowBox
        onPress={handleSubmit}
        bg={colors.orange}
        radius={12}
        shadowOffset={3}
        style={styles.buttonWrapper}
        contentStyle={styles.buttonContent}
      >
        <Text style={styles.buttonText}>Login</Text>
      </ShadowBox>

      <Pressable onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.linkText}>
          Don't have an account? <Text style={styles.linkBold}>Sign up</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 26,
    gap: 14,
    backgroundColor: colors.cream,
  },
  brand: { alignItems: "center", gap: 12, marginBottom: 10 },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: colors.ink,
  },
  appName: { fontSize: 30, fontFamily: font.extrabold, color: colors.ink },
  tagline: {
    fontSize: 14,
    fontFamily: font.medium,
    color: colors.mutedText,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 15,
    fontFamily: font.medium,
    fontSize: 15,
    color: colors.ink,
  },
  buttonWrapper: { marginTop: 4 },
  buttonContent: { paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 16, fontFamily: font.extrabold, color: colors.white },
  linkText: {
    textAlign: "center",
    fontSize: 13.5,
    fontFamily: font.semibold,
    color: colors.mutedText,
    padding: 6,
  },
  linkBold: { color: colors.link, fontFamily: font.bold },
});

export default Login;
