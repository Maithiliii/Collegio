import React, { useState } from "react";
import { View, Text, TextInput, Alert, Image, StyleSheet, ScrollView, Pressable } from "react-native";
import axios from "axios";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { REACT_APP_API_URL } from "@env";
import ShadowBox from "../components/ui/ShadowBox";
import { colors, font } from "../theme/tokens";

import Logo from "../assets/Logo.png";

type SignupScreenProp = NativeStackNavigationProp<RootStackParamList, "Signup">;

const Signup = () => {
  const navigation = useNavigation<SignupScreenProp>();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const isFormComplete = Object.values(formData).every((v) => v.trim().length > 0);

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }

    try {
      const res = await axios.post(`${REACT_APP_API_URL}/users/signup`, {
        name: formData.name,
        email: formData.email,
        contactNumber: formData.contactNumber,
        password: formData.password,
      });

      const { token, user } = res.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userName", user.name || "");
      await AsyncStorage.setItem("userEmail", user.email || "");
      await AsyncStorage.setItem("phone", user.contactNumber || formData.contactNumber);

      navigation.navigate("Login");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.brand}>
        <Image source={Logo} style={styles.logo} />
        <Text style={styles.title}>Create account</Text>
      </View>

      <TextInput
        placeholder="Full name"
        placeholderTextColor={colors.placeholder}
        value={formData.name}
        onChangeText={(v) => handleChange("name", v)}
        style={styles.input}
      />
      <TextInput
        placeholder="College email"
        placeholderTextColor={colors.placeholder}
        value={formData.email}
        onChangeText={(v) => handleChange("email", v)}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Phone number"
        placeholderTextColor={colors.placeholder}
        value={formData.contactNumber}
        keyboardType="phone-pad"
        onChangeText={(v) => handleChange("contactNumber", v)}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor={colors.placeholder}
        secureTextEntry
        value={formData.password}
        onChangeText={(v) => handleChange("password", v)}
        style={styles.input}
      />
      <TextInput
        placeholder="Confirm password"
        placeholderTextColor={colors.placeholder}
        secureTextEntry
        value={formData.confirmPassword}
        onChangeText={(v) => handleChange("confirmPassword", v)}
        style={styles.input}
      />

      <ShadowBox
        onPress={handleSubmit}
        disabled={!isFormComplete}
        bg={isFormComplete ? colors.orange : colors.mutedText}
        radius={12}
        shadowOffset={isFormComplete ? 3 : 0}
        style={styles.buttonWrapper}
        contentStyle={styles.buttonContent}
      >
        <Text style={styles.buttonText}>Sign up</Text>
      </ShadowBox>

      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={styles.linkText}>
          Already have an account? <Text style={styles.linkBold}>Login</Text>
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
    gap: 12,
    backgroundColor: colors.cream,
  },
  brand: { alignItems: "center", gap: 10, marginBottom: 8 },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.ink,
  },
  title: { fontSize: 26, fontFamily: font.extrabold, color: colors.ink },
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

export default Signup;
