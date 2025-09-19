import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import axios from "axios";
import { REACT_APP_API_URL } from "@env";

type SignupProps = NativeStackScreenProps<RootStackParamList, "Signup">;

const Signup: React.FC<SignupProps> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${REACT_APP_API_URL}/signup`, { name, email, password });
      Alert.alert("Signup successful!", "You can now login.", [{ text: "OK", onPress: () => navigation.navigate("Login") }]);
    } catch (err: any) {
      Alert.alert("Signup failed", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput placeholder="Password" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Signing up..." : "Sign Up"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginLink}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#ffeea0ff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { height: 50, borderColor: "#ccc", borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 10, backgroundColor: "#fff" },
  button: { height: 50, backgroundColor: "#FFD000", borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  loginLink: { textAlign: "center", color: "#007AFF", marginTop: 10, fontWeight: "bold" },
});

export default Signup;
