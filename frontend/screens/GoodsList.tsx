import React, { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Image, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RootStackParamList } from "../App";
import { MainTabParamList } from "../navigation/MainTabs";
import { REACT_APP_API_URL } from "@env";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import TabBar from "../components/TabBar";
import ShadowBox from "../components/ui/ShadowBox";
import ConfirmModal from "../components/ui/ConfirmModal";
import Toast, { useToast } from "../components/ui/Toast";
import { colors, font } from "../theme/tokens";
import { timeAgo } from "../utils/timeAgo";

type GoodItem = {
  _id: string;
  title: string;
  description: string;
  price?: number;
  images?: string[];
  postedBy?: {
    name?: string;
    email?: string;
    contactNumber?: string;
  };
  createdAt?: string;
};

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Goods">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function GoodsList({ route }: Props) {
  const { focusId } = route.params || {};
  const [goods, setGoods] = useState<GoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmItem, setConfirmItem] = useState<GoodItem | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const { toast, showToast } = useToast();
  const flatListRef = useRef<FlatList<GoodItem>>(null);

  useEffect(() => {
    fetchGoods();
    AsyncStorage.getItem("userEmail").then(setCurrentUserEmail);
  }, []);

  const fetchGoods = async () => {
    try {
      const res = await axios.get(`${REACT_APP_API_URL}/posts`);
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

  const handleInterested = async () => {
    const item = confirmItem;
    setConfirmItem(null);
    if (!item) return;
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return showToast("You must be logged in to show interest");

      await axios.post(
        `${REACT_APP_API_URL}/posts/${item._id}/interest`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`${item.postedBy?.name ?? "The seller"} has been notified!`);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to show interest");
    }
  };

  const filteredGoods = goods.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 30 }} />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <View style={styles.screen}>
      <Header title="Goods">
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search goods…" />
      </Header>
      <FlatList
        ref={flatListRef}
        data={filteredGoods}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isOwnPost = !!currentUserEmail && item.postedBy?.email === currentUserEmail;
          return (
            <View style={styles.card}>
              {item.images?.length ? (
                <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="contain" />
              ) : (
                <View style={styles.imagePlaceholder} />
              )}
              <View style={styles.cardBody}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.price}>₹{item.price ?? "N/A"}</Text>
                </View>
                <Text style={styles.desc}>{item.description}</Text>
                <View style={styles.posterRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(item.postedBy?.name ?? "?").trim().charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.posterText}>
                    {item.postedBy?.name ?? "Unknown"} · {timeAgo(item.createdAt)}
                  </Text>
                </View>
                {!isOwnPost && (
                  <ShadowBox
                    onPress={() => setConfirmItem(item)}
                    bg={colors.yellow}
                    radius={11}
                    shadowOffset={2.5}
                    style={styles.buttonWrapper}
                    contentStyle={styles.buttonContent}
                  >
                    <Text style={styles.buttonText}>I'm interested</Text>
                  </ShadowBox>
                )}
              </View>
            </View>
          );
        }}
      />
      <TabBar />
      <ConfirmModal
        visible={!!confirmItem}
        heading="Show interest?"
        body={`You're showing interest in "${confirmItem?.title}". The seller, ${confirmItem?.postedBy?.name ?? "the owner"}, will be notified and can contact you.`}
        onCancel={() => setConfirmItem(null)}
        onConfirm={handleInterested}
      />
      <Toast message={toast} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  errorText: { color: "red", textAlign: "center", marginTop: 30 },
  list: { padding: 20, gap: 14 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
  },
  image: {
    width: "100%",
    height: 120,
    backgroundColor: colors.imgStripeA,
    borderBottomWidth: 2.5,
    borderBottomColor: colors.ink,
  },
  imagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: colors.imgStripeA,
    borderBottomWidth: 2.5,
    borderBottomColor: colors.ink,
  },
  cardBody: { padding: 15, gap: 6 },
  titleRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 10 },
  title: { fontSize: 16, fontFamily: font.extrabold, color: colors.ink, flexShrink: 1 },
  price: { fontSize: 16, fontFamily: font.extrabold, color: colors.priceEmphasis },
  desc: { fontSize: 13, fontFamily: font.regular, color: colors.bodySecondary, lineHeight: 18 },
  posterRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.yellow,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 11, fontFamily: font.extrabold, color: colors.ink },
  posterText: { fontSize: 12, fontFamily: font.semibold, color: colors.bodySecondary },
  buttonWrapper: { marginTop: 6 },
  buttonContent: { paddingVertical: 11, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 14, fontFamily: font.extrabold, color: colors.ink },
});
