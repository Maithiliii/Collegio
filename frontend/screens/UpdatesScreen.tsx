import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { REACT_APP_API_URL } from "@env";

type PostItem = {
  _id: string;
  title: string;
  description?: string;
  images?: string[];
  price?: number;
  payment?: number;
  deadline?: string;
  type: "Goods" | "Service";
};

type InterestItem = {
  user: { name?: string; email?: string; contactNumber?: string };
  post: PostItem;
};

const UpdatesScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"posts" | "interest">("posts");
  const [myPosts, setMyPosts] = useState<PostItem[]>([]);
  const [interests, setInterests] = useState<InterestItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const [resGoods, resServices] = await Promise.all([
          axios.get(`${REACT_APP_API_URL}/posts/my-posts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${REACT_APP_API_URL}/requests/my-posts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setMyPosts([
          ...resGoods.data.map((g: any) => ({ ...g, type: "Goods" as const })),
          ...resServices.data.map((s: any) => ({ ...s, type: "Service" as const })),
        ]);

        const [goodsInterestRes, servicesInterestRes] = await Promise.all([
          axios.get(`${REACT_APP_API_URL}/posts/my-interests`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${REACT_APP_API_URL}/requests/my-interests`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setInterests([
          ...goodsInterestRes.data.map((p: any) => ({ user: p.postedBy, post: { ...p, type: "Goods" as const } })),
          ...servicesInterestRes.data.map((r: any) => ({ user: r.requestedBy, post: { ...r, type: "Service" as const } })),
        ]);
      } catch (err) {
        console.error("Failed to fetch posts or interests:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "posts" && styles.activeTab]}
          onPress={() => setActiveTab("posts")}
        >
          <Text style={styles.tabText}>My Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "interest" && styles.activeTab]}
          onPress={() => setActiveTab("interest")}
        >
          <Text style={styles.tabText}>Shown Interest</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ marginTop: 10 }}>
        {activeTab === "posts" &&
          myPosts.map((item) => (
            <View key={item._id} style={styles.card}>
              {item.images?.length && <Image source={{ uri: item.images[0] }} style={styles.image} />}
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                {item.type === "Goods" && <Text>₹{item.price ?? "N/A"}</Text>}
                {item.type === "Service" && (
                  <>
                    <Text>Payment: ₹{item.payment ?? "N/A"}</Text>
                    {item.deadline && <Text>Deadline: {item.deadline.split("T")[0]}</Text>}
                  </>
                )}
              </View>
            </View>
          ))}

        {activeTab === "interest" &&
          interests.map((int, idx) => (
            <View key={idx} style={styles.interestBox}>
              <Text style={styles.user}>
                {int.user.name ?? "Unknown"} ({int.user.email ?? "N/A"} | {int.user.contactNumber ?? "N/A"})
              </Text>
              <View style={styles.card}>
                <Text style={styles.title}>{int.post.title}</Text>
                {int.post.type === "Goods" && <Text>₹{int.post.price ?? "N/A"}</Text>}
                {int.post.type === "Service" && (
                  <>
                    <Text>Payment: ₹{int.post.payment ?? "N/A"}</Text>
                    {int.post.deadline && <Text>Deadline: {int.post.deadline.split("T")[0]}</Text>}
                  </>
                )}
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#FDF8E1" },
  tabs: { flexDirection: "row", justifyContent: "space-around" },
  tab: { paddingVertical: 10, paddingHorizontal: 20 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#FFD000" },
  tabText: { fontWeight: "bold", fontSize: 16 },
  card: { flexDirection: "row", alignItems: "center", padding: 10, marginVertical: 8, borderRadius: 10, backgroundColor: "#fff", elevation: 2 },
  image: { width: 50, height: 50, borderRadius: 8, marginRight: 10 },
  title: { fontSize: 16, fontWeight: "bold" },
  interestBox: { marginBottom: 15, padding: 10, backgroundColor: "#fff6cc", borderRadius: 10 },
  user: { fontWeight: "bold", marginBottom: 5 },
});

export default UpdatesScreen;
