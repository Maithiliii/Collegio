import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import axios from "axios";
import BellIcon from "../assets/Bell.png";
import { BACKEND_URL } from '@env';

type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;

type Post = {
  _id: string;
  title: string;
  description: string;
  price?: number;
  payment?: number;
  deadline?: string;
  images?: string[];
  type: "Goods" | "Service";
  createdAt: string;
};

const Home: React.FC<HomeProps> = ({ navigation, route }) => {
  const userName = route.params.name;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const goodsRes = await axios.get(`${BACKEND_URL}/posts`);
      const servicesRes = await axios.get(`${BACKEND_URL}/requests`);

      const goods = goodsRes.data.map((g: any) => ({
        ...g,
        type: "Goods" as const,
        createdAt: g.createdAt ?? new Date().toISOString(),
      }));
      const services = servicesRes.data.map((s: any) => ({
        ...s,
        type: "Service" as const,
        createdAt: s.createdAt ?? new Date().toISOString(),
      }));

      const combined = [...goods, ...services].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPosts(combined);
    } catch (err) {
      console.error("Failed to fetch feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 30 }} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.greeting}>Hello, {userName}!</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Updates")}>
          <Image
            source={BellIcon}
            style={{ width: 28, height: 28, resizeMode: "contain" }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate("Goods", {})}
        >
          <Text style={styles.boxText}>Goods</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate("Services", {})}
        >
          <Text style={styles.boxText}>Services</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.postBox}
        onPress={() => navigation.navigate("Post")}
      >
        <Text style={styles.postText}>
          Post your goods or request a service
        </Text>
      </TouchableOpacity>

      <View style={styles.recentBox}>
        <Text style={styles.recentTitle}>Recent Posts</Text>
        {posts.map((item) => (
          <View key={item._id} style={styles.card}>
            {item.type === "Goods" && item.images?.length ? (
              <Image source={{ uri: item.images[0] }} style={styles.image} />
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.title}</Text>

              {item.type === "Goods" && (
                <Text style={styles.price}>₹{item.price}</Text>
              )}
              {item.type === "Service" && (
                <>
                  <Text style={styles.price}>
                    Payment: ₹{item.payment ?? "N/A"}
                  </Text>
                  {item.deadline && (
                    <Text style={styles.deadline}>
                      Deadline: {item.deadline.split("T")[0]}
                    </Text>
                  )}
                </>
              )}

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(
                    item.type === "Goods" ? "Goods" : "Services",
                    { focusId: item._id }
                  )
                }
              >
                <Text style={styles.more}>More Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#ffeea0ff" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: "bold" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  box: { flex: 1, height: 100, marginHorizontal: 5, backgroundColor: "#FFD000", justifyContent: "center", alignItems: "center", borderRadius: 10 },
  boxText: { fontSize: 18, fontWeight: "bold", color: "#ffffffff" },
  postBox: { height: 80, backgroundColor: "#FFD000", justifyContent: "center", alignItems: "center", borderRadius: 10, marginBottom: 20 },
  postText: { fontSize: 20, fontWeight: "bold", color: "#ffffffff" },
  recentBox: { marginTop: 10 },
  recentTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  card: { flexDirection: "row", alignItems: "center", padding: 10, marginBottom: 12, borderRadius: 10, backgroundColor: "#ffffffff", elevation: 2 },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "bold" },
  price: { fontSize: 14, color: "green", marginTop: 2 },
  deadline: { fontSize: 14, color: "red", marginTop: 2 },
  more: { marginTop: 5, color: "#007AFF", fontWeight: "bold" },
});

export default Home;
