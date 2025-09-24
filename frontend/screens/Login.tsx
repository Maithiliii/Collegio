import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import axios from "axios";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { REACT_APP_API_URL } from "@env";

type LoginScreenProp = NativeStackNavigationProp<RootStackParamList, "Login">;

import Logo from "../assets/Logo.png";


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
      
      console.log("API URL from .env:", REACT_APP_API_URL);
      console.log("Final Login URL:", `${REACT_APP_API_URL}/users/login`);

      const res = await api.post("/users/login", formData);
      const { token, user } = res.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userName", user.name || "");
      await AsyncStorage.setItem("userEmail", user.email || "");

      Alert.alert("Success", "Login successful!");
      navigation.replace("Home", { name: user.name });
    } catch (err: any) {
      console.log("Login error:", err.response?.data || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.error || "Invalid credentials or server error"
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={Logo} style={styles.logo} />
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value={formData.email}
        onChangeText={(v) => handleChange("email", v)}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={formData.password}
        onChangeText={(v) => handleChange("password", v)}
        style={styles.input}
      />
      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.linkText}>
          Don&apos;t have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#c99e7c",
  },
  logo: { width: 150, height: 150, marginBottom: 20, borderRadius: 20 },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#fff",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  button: {
    width: "100%",
    backgroundColor: "#f98120",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  linkText: { color: "#000000ff", textAlign: "center", marginTop: 10 },
});

export default Login;
