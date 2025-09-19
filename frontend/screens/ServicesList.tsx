import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";

type ServiceItem = {
  _id: string;
  title: string;
  description: string;
  contactNumber?: string;
  payment?: number;
  deadline?: string;
  requestedBy?: { name?: string; email?: string };
};

export default function ServicesList() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const flatListRef = useRef<FlatList<ServiceItem>>(null);
  const route = useRoute<any>();
  const scrollToId = route.params?.scrollToId;

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get("http://10.0.2.2:5000/requests");
      setServices(res.data);

      if (scrollToId) {
        setTimeout(() => {
          const index = res.data.findIndex((s: ServiceItem) => s._id === scrollToId);
          if (index >= 0 && flatListRef.current) {
            flatListRef.current.scrollToIndex({ index, animated: true });
          }
        }, 500);
      }
    } catch {
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const confirmInterested = (item: ServiceItem) => {
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

  const handleInterested = async (item: ServiceItem) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return Alert.alert("Error", "You must be logged in to show interest");

      await axios.post(
        `http://10.0.2.2:5000/requests/${item._id}/interest`,
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

  const filteredServices = services.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />;
  if (error) return <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search services by title..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        ref={flatListRef}
        data={filteredServices}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.contact}>Payment: ₹{item.payment ?? "N/A"}</Text>
            <Text style={styles.contact}>
              Deadline: {item.deadline ? item.deadline.split("T")[0] : "N/A"}
            </Text>
            <Text style={styles.contact}>
              Contact: {item.requestedBy?.name ?? "Unknown"}
            </Text>
            <Text style={styles.contact}>{item.requestedBy?.email ?? "N/A"}</Text>
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
  name: { fontSize: 18, fontWeight: "bold" },
  desc: { fontSize: 14, marginVertical: 5 },
  contact: { fontSize: 13, color: "gray" },
  button: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#32CD32",
    borderRadius: 5,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
