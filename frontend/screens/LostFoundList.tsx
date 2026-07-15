import React, { useCallback, useRef, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable, Image, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RootStackParamList } from "../App";
import { MainTabParamList } from "../navigation/MainTabs";
import { REACT_APP_API_URL } from "@env";
import Header from "../components/Header";
import TabBar from "../components/TabBar";
import ShadowBox from "../components/ui/ShadowBox";
import ConfirmModal from "../components/ui/ConfirmModal";
import Toast, { useToast } from "../components/ui/Toast";
import { MapPinIcon } from "../components/ui/Icon";
import { colors, font } from "../theme/tokens";
import { timeAgo } from "../utils/timeAgo";
import { getUserIdFromToken } from "../utils/auth";

type LostFoundItem = {
  _id: string;
  title: string;
  place?: string;
  kind: "Lost" | "Found";
  createdAt?: string;
  images?: string[];
  postedBy?: {
    name?: string;
    email?: string;
    contactNumber?: string;
  };
  interestedUsers?: string[];
};

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "LostFound">,
  NativeStackScreenProps<RootStackParamList>
>;

const FILTERS: Array<"All" | "Lost" | "Found"> = ["All", "Lost", "Found"];

export default function LostFoundList({ route }: Props) {
  const { focusId } = route.params || {};
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"All" | "Lost" | "Found">("All");
  const [confirmItem, setConfirmItem] = useState<LostFoundItem | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast, showToast } = useToast();
  const flatListRef = useRef<FlatList<LostFoundItem>>(null);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
      AsyncStorage.getItem("userEmail").then(setCurrentUserEmail);
      AsyncStorage.getItem("token").then((t) => setCurrentUserId(t ? getUserIdFromToken(t) : null));
    }, [])
  );

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${REACT_APP_API_URL}/lostfound`);
      setItems(res.data);

      if (focusId) {
        const index = res.data.findIndex((i: LostFoundItem) => i._id === focusId);
        if (index !== -1) {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index, animated: true });
          }, 400);
        }
      }
    } catch {
      setError("Failed to load Lost & Found");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    const item = confirmItem;
    setConfirmItem(null);
    if (!item) return;
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return showToast("You must be logged in to send a message");

      await axios.post(
        `${REACT_APP_API_URL}/lostfound/${item._id}/interest`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (currentUserId) {
        setItems((prev) =>
          prev.map((i) =>
            i._id === item._id
              ? { ...i, interestedUsers: [...(i.interestedUsers ?? []), currentUserId] }
              : i
          )
        );
      }
      showToast(`Message sent to ${item.postedBy?.name ?? "them"}!`);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to send message");
    }
  };

  const filteredItems = items.filter((item) => filter === "All" || item.kind === filter);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 30 }} />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <View style={styles.screen}>
      <Header title="Lost & Found">
        <View style={styles.chipsRow}>
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f}</Text>
              </Pressable>
            );
          })}
        </View>
      </Header>
      <FlatList
        ref={flatListRef}
        data={filteredItems}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isFound = item.kind === "Found";
          const isOwnPost = !!currentUserEmail && item.postedBy?.email === currentUserEmail;
          const hasResponded = !!currentUserId && !!item.interestedUsers?.includes(currentUserId);
          return (
            <View style={styles.card}>
              {item.images?.length ? (
                <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="contain" />
              ) : (
                <View style={styles.imagePlaceholder} />
              )}
              <View style={styles.cardBody}>
                <View style={styles.topRow}>
                  <View style={[styles.badge, { backgroundColor: isFound ? colors.goodsBadgeBg : colors.serviceBadgeBg }]}>
                    <Text style={[styles.badgeText, { color: isFound ? colors.goodsBadgeFg : colors.serviceBadgeFg }]}>
                      {item.kind.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.placeRow}>
                  <MapPinIcon />
                  <Text style={styles.place}>{item.place ?? "Campus"}</Text>
                </View>
                <View style={styles.posterRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(item.postedBy?.name ?? "?").trim().charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.posterText}>Posted by {item.postedBy?.name ?? "Unknown"}</Text>
                </View>
                {!isOwnPost && (
                  <ShadowBox
                    onPress={() => setConfirmItem(item)}
                    disabled={hasResponded}
                    bg={hasResponded ? colors.imgStripeB : colors.orange}
                    radius={11}
                    shadowOffset={hasResponded ? 0 : 2.5}
                    style={styles.buttonWrapper}
                    contentStyle={styles.buttonContent}
                  >
                    <Text style={[styles.buttonText, hasResponded && styles.buttonTextMuted]}>
                      {hasResponded ? "Message sent" : isFound ? "This is mine, message" : "I found it, message"}
                    </Text>
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
        heading="Send a message?"
        body={`${confirmItem?.postedBy?.name ?? "They"} will get your contact details so you can sort out "${confirmItem?.title}".`}
        onCancel={() => setConfirmItem(null)}
        onConfirm={handleClaim}
      />
      <Toast message={toast} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  errorText: { color: "red", textAlign: "center", marginTop: 30 },
  chipsRow: { flexDirection: "row", gap: 8 },
  chip: {
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 99,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.ink },
  chipText: { fontSize: 13, fontFamily: font.bold, color: colors.ink },
  chipTextActive: { color: colors.yellow },
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
    backgroundColor: colors.imgStripeB,
    borderBottomWidth: 2.5,
    borderBottomColor: colors.ink,
  },
  imagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: colors.imgStripeB,
    borderBottomWidth: 2.5,
    borderBottomColor: colors.ink,
  },
  cardBody: { padding: 15, gap: 7 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  badge: { borderWidth: 2, borderColor: colors.ink, borderRadius: 99, paddingVertical: 3, paddingHorizontal: 9 },
  badgeText: { fontSize: 10, fontFamily: font.extrabold, letterSpacing: 0.5 },
  time: { fontSize: 11.5, fontFamily: font.semibold, color: colors.mutedText },
  title: { fontSize: 16, fontFamily: font.extrabold, color: colors.ink, lineHeight: 21 },
  placeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  place: { fontSize: 13, fontFamily: font.semibold, color: colors.bodySecondary },
  posterRow: { flexDirection: "row", alignItems: "center", gap: 8 },
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
  buttonText: { fontSize: 14, fontFamily: font.extrabold, color: colors.white },
  buttonTextMuted: { color: colors.mutedText },
});
