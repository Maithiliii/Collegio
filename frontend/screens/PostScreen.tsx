import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, Image } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { launchImageLibrary } from "react-native-image-picker";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { REACT_APP_API_URL } from "@env";
import Header from "../components/Header";
import TabBar from "../components/TabBar";
import ShadowBox from "../components/ui/ShadowBox";
import { PhotoUploadIcon } from "../components/ui/Icon";
import { colors, font } from "../theme/tokens";

type PostProps = NativeStackScreenProps<RootStackParamList, "Post">;

type PostType = "Goods" | "Service" | "LostFound";

const TYPE_CHIPS: Array<{ key: PostType; label: string }> = [
  { key: "Goods", label: "Goods" },
  { key: "Service", label: "Service" },
  { key: "LostFound", label: "Lost & Found" },
];

const PostScreen: React.FC<PostProps> = ({ navigation }) => {
  const [type, setType] = useState<PostType>("Goods");
  const [kind, setKind] = useState<"Lost" | "Found">("Lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [payment, setPayment] = useState("");
  const [deadline, setDeadline] = useState("");
  const [location, setLocation] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const resetFields = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setPayment("");
    setDeadline("");
    setLocation("");
    setImageUri(null);
  };

  const onTypeChange = (newType: PostType) => {
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

  const titlePlaceholder =
    type === "Goods" ? "What are you selling?" : type === "Service" ? "What do you need done?" : "What was lost / found?";
  const submitLabel = type === "Goods" ? "Post goods" : type === "Service" ? "Post request" : "Post to Lost & Found";

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please add a title first");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const phone = await AsyncStorage.getItem("phone");
      if (!token || !phone) {
        Alert.alert("Error", "You must be logged in");
        return;
      }
      const headers: any = { Authorization: `Bearer ${token}` };

      if (type === "Goods") {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("contactNumber", phone);
        formData.append("price", String(price));
        if (imageUri) {
          formData.append("images", { uri: imageUri, name: "photo.jpg", type: "image/jpeg" } as any);
        }
        headers["Content-Type"] = "multipart/form-data";
        await axios.post(`${REACT_APP_API_URL}/posts`, formData, { headers });
        Alert.alert("Success", "Your goods post is live!");
        resetFields();
        navigation.navigate("Goods", {});
      } else if (type === "Service") {
        headers["Content-Type"] = "application/json";
        await axios.post(
          `${REACT_APP_API_URL}/requests`,
          { title, description, contactNumber: phone, deadline, payment },
          { headers }
        );
        Alert.alert("Success", "Your service request is live!");
        resetFields();
        navigation.navigate("Services", {});
      } else {
        headers["Content-Type"] = "application/json";
        await axios.post(
          `${REACT_APP_API_URL}/lostfound`,
          { title, description, contactNumber: phone, place: location, kind },
          { headers }
        );
        Alert.alert("Success", "Posted to Lost & Found!");
        resetFields();
        navigation.navigate("LostFound", {});
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Something went wrong while posting");
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="Post something" />
      <ScrollView style={styles.screen} contentContainerStyle={styles.form}>
        <View style={styles.chipsRow}>
          {TYPE_CHIPS.map((chip) => {
            const active = type === chip.key;
            return (
              <Pressable
                key={chip.key}
                onPress={() => onTypeChange(chip.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          placeholder={titlePlaceholder}
          placeholderTextColor={colors.placeholder}
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <TextInput
          placeholder="Description"
          placeholderTextColor={colors.placeholder}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textarea]}
        />

        {type === "Goods" && (
          <>
            <TextInput
              placeholder="Price (₹)"
              placeholderTextColor={colors.placeholder}
              value={price}
              keyboardType="numeric"
              onChangeText={setPrice}
              style={styles.input}
            />
            <Pressable onPress={pickImage} style={styles.dropzone}>
              <PhotoUploadIcon />
              <Text style={styles.dropzoneText}>Add a photo</Text>
            </Pressable>
            {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
          </>
        )}

        {type === "Service" && (
          <>
            <TextInput
              placeholder="Payment (₹)"
              placeholderTextColor={colors.placeholder}
              value={payment}
              keyboardType="numeric"
              onChangeText={setPayment}
              style={styles.input}
            />
            <Pressable onPress={() => setShowPicker(true)} style={styles.input}>
              <Text style={deadline ? styles.dateSetText : styles.datePlaceholder}>
                {deadline || "Deadline (e.g. Jul 25)"}
              </Text>
            </Pressable>
            {showPicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                minimumDate={new Date()}
                onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                  setShowPicker(false);
                  if (selectedDate) {
                    setDeadline(selectedDate.toISOString().split("T")[0]);
                  }
                }}
              />
            )}
          </>
        )}

        {type === "LostFound" && (
          <>
            <View style={styles.kindRow}>
              <Pressable
                onPress={() => setKind("Lost")}
                style={[styles.kindChip, kind === "Lost" && styles.chipActive]}
              >
                <Text style={[styles.chipText, kind === "Lost" && styles.chipTextActive]}>I lost this</Text>
              </Pressable>
              <Pressable
                onPress={() => setKind("Found")}
                style={[styles.kindChip, kind === "Found" && styles.chipActive]}
              >
                <Text style={[styles.chipText, kind === "Found" && styles.chipTextActive]}>I found this</Text>
              </Pressable>
            </View>
            <TextInput
              placeholder="Where? (e.g. Central Library, 2nd floor)"
              placeholderTextColor={colors.placeholder}
              value={location}
              onChangeText={setLocation}
              style={styles.input}
            />
          </>
        )}

        <ShadowBox
          onPress={handleSubmit}
          bg={colors.orange}
          radius={12}
          shadowOffset={3}
          style={styles.submitWrapper}
          contentStyle={styles.submitContent}
        >
          <Text style={styles.submitText}>{submitLabel}</Text>
        </ShadowBox>
      </ScrollView>
      <TabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  form: { padding: 20, gap: 14 },
  chipsRow: { flexDirection: "row", gap: 8 },
  chip: {
    flex: 1,
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.ink },
  chipText: { fontSize: 12.5, fontFamily: font.extrabold, color: colors.ink },
  chipTextActive: { color: colors.yellow },
  input: {
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
  textarea: { minHeight: 80, textAlignVertical: "top" },
  dropzone: {
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFDF4",
  },
  dropzoneText: { fontSize: 12.5, fontFamily: font.bold, color: colors.mutedText },
  preview: { width: 100, height: 100, borderRadius: 8, marginTop: 4 },
  datePlaceholder: { fontSize: 15, fontFamily: font.medium, color: colors.placeholder },
  dateSetText: { fontSize: 15, fontFamily: font.medium, color: colors.ink },
  kindRow: { flexDirection: "row", gap: 8 },
  kindChip: {
    flex: 1,
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 11,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  submitWrapper: { marginTop: 4 },
  submitContent: { paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  submitText: { fontSize: 16, fontFamily: font.extrabold, color: colors.white },
});

export default PostScreen;
