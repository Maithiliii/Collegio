import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { launchImageLibrary } from "react-native-image-picker";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { REACT_APP_API_URL } from "@env";

type PostProps = NativeStackScreenProps<RootStackParamList, "Post">;

const PostScreen: React.FC<PostProps> = ({ navigation }) => {
  const [type, setType] = useState<"Goods" | "Service">("Goods");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceOrDeadline, setPriceOrDeadline] = useState("");
  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const resetFields = () => {
    setTitle("");
    setDescription("");
    setPriceOrDeadline("");
    setPhone("");
    setPayment("");
    setImageUri(null);
  };

  const onTypeChange = (newType: "Goods" | "Service") => {
    if (newType !== type) {
      resetFields();
      setType(newType);
    }
  };

  const pickImage = async () => {
    launchImageLibrary({ mediaType: "photo" }, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert("Error", res.errorMessage || "Image picker error");
        return;
      }
      if (res.assets && res.assets.length > 0) {
        setImageUri(res.assets[0].uri || null);
      }
    });
  };

  const handleSubmit = async () => {
    if (
      !title ||
      !description ||
      !phone ||
      (type === "Goods" && !priceOrDeadline) ||
      (type === "Service" && (!payment || !priceOrDeadline))
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "You must be logged in");
        return;
      }

      let url = "";
      let data: any = {};
      let headers: any = { Authorization: `Bearer ${token}` };

      if (type === "Goods") {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("contactNumber", phone);
        formData.append("price", String(priceOrDeadline));

        if (imageUri) {
          formData.append("images", {
            uri: imageUri,
            name: "photo.jpg",
            type: "image/jpeg",
          } as any);
        }

        data = formData;
        headers["Content-Type"] = "multipart/form-data";
        url = `${REACT_APP_API_URL}/posts`;
      } else {
        data = { title, description, contactNumber: phone, deadline: priceOrDeadline, payment };
        headers["Content-Type"] = "application/json";
        url = `${REACT_APP_API_URL}/requests`;
      }

      await axios.post(url, data, { headers });
      Alert.alert("Success", `Your ${type} has been posted!`);
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.error || "Something went wrong while posting");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Post {type}</Text>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, type === "Goods" && styles.activeToggle]}
          onPress={() => onTypeChange("Goods")}
        >
          <Text style={styles.toggleText}>Goods</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, type === "Service" && styles.activeToggle]}
          onPress={() => onTypeChange("Service")}
        >
          <Text style={styles.toggleText}>Service</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder={type === "Goods" ? "Goods Name" : "Service Title"}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        keyboardType="phone-pad"
        onChangeText={setPhone}
      />

      {type === "Goods" ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={priceOrDeadline}
            keyboardType="numeric"
            onChangeText={setPriceOrDeadline}
          />
          <TouchableOpacity style={styles.submitButton} onPress={pickImage}>
            <Text style={styles.submitText}>Pick Image</Text>
          </TouchableOpacity>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Payment (₹)"
            value={payment}
            keyboardType="numeric"
            onChangeText={setPayment}
          />
          <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
            <Text>{priceOrDeadline ? priceOrDeadline : "Select Deadline"}</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowPicker(false);
                if (selectedDate) setPriceOrDeadline(selectedDate.toISOString().split("T")[0]);
              }}
            />
          )}
        </>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Post {type}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  toggleRow: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  toggleButton: { flex: 1, padding: 10, marginHorizontal: 5, borderWidth: 1, borderColor: "#333", borderRadius: 8, alignItems: "center" },
  activeToggle: { backgroundColor: "#FFD000" },
  toggleText: { fontSize: 16, fontWeight: "bold" },
  input: { borderWidth: 1, borderColor: "#999", padding: 10, borderRadius: 8, marginBottom: 15, justifyContent: "center" },
  submitButton: { backgroundColor: "#32CD32", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 10 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  preview: { width: 100, height: 100, marginTop: 10, borderRadius: 8 },
});

export default PostScreen;
