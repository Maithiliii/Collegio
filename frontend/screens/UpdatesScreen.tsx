import React, { useEffect, useState, useRef } from "react";
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
  const [activeTab, setActiveTab] = useState<
    "posts" | "interest" | "interestInMine"
  >("posts");
  const [myPosts, setMyPosts] = useState<PostItem[]>([]);
  const [interests, setInterests] = useState<InterestItem[]>([]);
  const [interestsInMine, setInterestsInMine] = useState<InterestItem[]>([]);

  const tabScrollRef = useRef<ScrollView>(null);

  const handleTabPress = (tab: typeof activeTab, index: number) => {
    setActiveTab(tab);
    tabScrollRef.current?.scrollTo({ x: index * 120, animated: true });
  };

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

        const goodsPosts: PostItem[] = resGoods.data.map((g: any) => ({
          ...g,
          type: "Goods",
        }));
        const servicePosts: PostItem[] = resServices.data.map((s: any) => ({
          ...s,
          type: "Service",
        }));
        setMyPosts([...goodsPosts, ...servicePosts]);

        const [goodsInterestRes, servicesInterestRes] = await Promise.all([
          axios.get(`${REACT_APP_API_URL}/posts/my-interests`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${REACT_APP_API_URL}/requests/my-interests`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const interestsData: InterestItem[] = [
          ...goodsInterestRes.data.map((p: any) => ({
            user: p.postedBy,
            post: { ...p, type: "Goods" as const },
          })),
          ...servicesInterestRes.data.map((r: any) => ({
            user: r.requestedBy,
            post: { ...r, type: "Service" as const },
          })),
        ];
        setInterests(interestsData);

        const [goodsInMine, servicesInMine] = await Promise.all([
          axios.get(`${REACT_APP_API_URL}/posts/interests-in-my-posts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${REACT_APP_API_URL}/requests/interests-in-my-posts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const interestsInMineData: InterestItem[] = [
          ...goodsInMine.data.map((item: any) => ({
            user: item.user,
            post: { ...item.post, type: "Goods" as const },
          })),
          ...servicesInMine.data.map((item: any) => ({
            user: item.user,
            post: { ...item.post, type: "Service" as const },
          })),
        ];
        setInterestsInMine(interestsInMineData);
      } catch (err: any) {
        console.warn("Fetch failed:", err?.response?.status || err.message);
      }
    };

    fetchData();
  }, []);

  const renderPostCard = (item: PostItem) => (
    <View key={item._id} style={styles.card}>
      {item.images?.length ? (
        <Image source={{ uri: item.images[0] }} style={styles.image} />
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        {item.type === "Goods" && <Text>₹{item.price ?? "N/A"}</Text>}
        {item.type === "Service" && (
          <>
            <Text>Payment: ₹{item.payment ?? "N/A"}</Text>
            {item.deadline && (
              <Text>Deadline: {item.deadline.split("T")[0]}</Text>
            )}
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        <ScrollView
          horizontal
          ref={tabScrollRef}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === "posts" && styles.activeTab]}
            onPress={() => handleTabPress("posts", 0)}
          >
            <Text style={styles.tabText}>My Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "interest" && styles.activeTab]}
            onPress={() => handleTabPress("interest", 1)}
          >
            <Text style={styles.tabText}>Shown Interest</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "interestInMine" && styles.activeTab,
            ]}
            onPress={() => handleTabPress("interestInMine", 2)}
          >
            <Text style={styles.tabText}>Shown Interest in My Posts</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === "posts" && myPosts.map(renderPostCard)}

        {activeTab === "interest" &&
          interests.map((int, idx) => (
            <View key={idx} style={styles.interestBox}>
              <Text style={styles.user}>
                {int.user.name ?? "Unknown"} ({int.user.email ?? "N/A"} |{" "}
                {int.user.contactNumber ?? "N/A"})
              </Text>
              {renderPostCard(int.post)}
            </View>
          ))}

        {activeTab === "interestInMine" &&
          interestsInMine.map((int, idx) => (
            <View key={idx} style={styles.interestBox}>
              <Text style={styles.user}>
                {int.user.name ?? "Unknown"} ({int.user.email ?? "N/A"} |{" "}
                {int.user.contactNumber ?? "N/A"})
              </Text>
              {renderPostCard(int.post)}
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDF8E1" },
  tabsRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tabs: { flexDirection: "row" },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFD000",
  },
  tabText: { fontWeight: "bold", fontSize: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 2,
  },
  image: { width: 50, height: 50, borderRadius: 8, marginRight: 10 },
  title: { fontSize: 16, fontWeight: "bold" },
  interestBox: {
    marginBottom: 15,
    marginHorizontal: 15,
    padding: 10,
    backgroundColor: "#fff6cc",
    borderRadius: 10,
  },
  user: { fontWeight: "bold", marginBottom: 5 },
});

export default UpdatesScreen;
