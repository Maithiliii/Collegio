import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REACT_APP_API_URL } from "@env";

type SignupScreenProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

import Logo from '../assets/Logo.png'; 

const Signup = () => {
  const navigation = useNavigation<SignupScreenProp>();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    collegeId: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match');
    }

    try {
      const res = await axios.post(`${REACT_APP_API_URL}/users/signup`, {
        name: formData.name,
        email: formData.email,
        contactNumber: formData.contactNumber,
        collegeId: formData.collegeId,
        password: formData.password,
      });

      const { token, user } = res.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userName", user.name || '');
      await AsyncStorage.setItem("userEmail", user.email || '');
      await AsyncStorage.setItem("phone", user.contactNumber || formData.contactNumber);

      Alert.alert('Success', 'Signup successful!');
      navigation.navigate('Login');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={Logo} style={styles.logo} />
      <Text style={styles.title}>Sign Up</Text>
      <TextInput placeholder="Name" value={formData.name} onChangeText={(v) => handleChange('name', v)} style={styles.input} />
      <TextInput placeholder="Email" value={formData.email} onChangeText={(v) => handleChange('email', v)} style={styles.input} />
      <TextInput placeholder="Phone Number" value={formData.contactNumber} keyboardType="phone-pad" onChangeText={(v) => handleChange('contactNumber', v)} style={styles.input} />
      <TextInput placeholder="College ID" value={formData.collegeId} onChangeText={(v) => handleChange('collegeId', v)} style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry value={formData.password} onChangeText={(v) => handleChange('password', v)} style={styles.input} />
      <TextInput placeholder="Confirm Password" secureTextEntry value={formData.confirmPassword} onChangeText={(v) => handleChange('confirmPassword', v)} style={styles.input} />
      
      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#c99e7c' },
  logo: { width: 150, height: 150, marginBottom: 20, borderRadius: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold', color: '#fff' },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', marginBottom: 10, padding: 10, borderRadius: 8 },
  button: { width: '100%', backgroundColor: '#f98120', padding: 15, borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  linkText: { color: '#000000ff', textAlign: 'center', marginTop: 10 },
});

export default Signup;
