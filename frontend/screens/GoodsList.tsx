import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type GoodItem = {
  _id: string;
  title: string;
  description: string;
  price?: number;
  images?: string[];
  contactNumber?: string;
  postedBy?: { name?: string; email?: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "Goods">;

export default function GoodsList({ route }: Props) {
  const { focusId } = route.params || {};
  const [goods, setGoods] = useState<GoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const flatListRef = useRef<FlatList<GoodItem>>(null);

  useEffect(() => {
    fetchGoods();
  }, []);

  const fetchGoods = async () => {
    try {
      const res = await axios.get("http://10.0.2.2:5000/posts");
      setGoods(res.data);

      if (focusId) {
        const index = res.data.findIndex((g: GoodItem) => g._id === focusId);
        if (index !== -1) {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index, animated: true });
          }, 400);
        }
      }
    } catch {
      setError("Failed to load goods");
    } finally {
      setLoading(false);
    }
  };

  const confirmInterested = (item: GoodItem) => {
    Alert.alert(
      "Confirm Interest",
      `Are you sure you want to show interest in "${item.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => handleInterested(item),
        },
      ]
    );
  };

  const handleInterested = async (item: GoodItem) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Error", "You must be logged in to show interest");

      await axios.post(
        `http://10.0.2.2:5000/posts/${item._id}/interest`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert(
        "Success",
        `You have shown interest in "${item.title}". You’ll be contacted soon by the owner.`
      );
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.error || "Failed to show interest");
    }
  };

  const filteredGoods = goods.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
  if (error) return <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search goods by title..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        ref={flatListRef}
        data={filteredGoods}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.images?.length ? (
              <Image source={{ uri: item.images[0] }} style={styles.image} />
            ) : (
              <View style={styles.noImage}>
                <Text>No Image</Text>
              </View>
            )}
            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.price}>₹{item.price ?? "N/A"}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.contact}>
              Contact: {item.postedBy?.name ?? "Unknown"}
            </Text>
            <Text style={styles.contact}>{item.postedBy?.email ?? "N/A"}</Text>
            <Text style={styles.contact}>{item.contactNumber ?? "N/A"}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => confirmInterested(item)}
            >
              <Text style={styles.buttonText}>Interested</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 40,
  },
  card: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    elevation: 2,
  },
  image: { width: "100%", height: 150, borderRadius: 8, marginBottom: 10 },
  noImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontSize: 18, fontWeight: "bold" },
  price: { fontSize: 16, color: "green", marginVertical: 5 },
  desc: { fontSize: 14, marginBottom: 5 },
  contact: { fontSize: 13, color: "gray" },
  button: { marginTop: 8, padding: 10, backgroundColor: "#32CD32", borderRadius: 5 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
