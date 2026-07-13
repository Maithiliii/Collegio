import React, { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { REACT_APP_API_URL } from "@env";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import TabBar from "../components/TabBar";
import ShadowBox from "../components/ui/ShadowBox";
import ConfirmModal from "../components/ui/ConfirmModal";
import Toast, { useToast } from "../components/ui/Toast";
import { colors, font } from "../theme/tokens";

type ServiceItem = {
  _id: string;
  title: string;
  description: string;
  payment?: number;
  deadline?: string;
  requestedBy?: {
    name?: string;
    email?: string;
    contactNumber?: string;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, "Services">;

export default function ServicesList({ route }: Props) {
  const { focusId } = route.params || {};
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmItem, setConfirmItem] = useState<ServiceItem | null>(null);
  const { toast, showToast } = useToast();
  const flatListRef = useRef<FlatList<ServiceItem>>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${REACT_APP_API_URL}/requests`);
      setServices(res.data);

      if (focusId) {
        const index = res.data.findIndex((s: ServiceItem) => s._id === focusId);
        if (index !== -1) {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index, animated: true });
          }, 400);
        }
      }
    } catch {
      setError("Failed to load services");
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
        `${REACT_APP_API_URL}/requests/${item._id}/interest`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`${item.requestedBy?.name ?? "They"} will be notified that you're up for it!`);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to show interest");
    }
  };

  const filteredServices = services.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 30 }} />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <View style={styles.screen}>
      <Header title="Services">
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search services…" />
      </Header>
      <FlatList
        ref={flatListRef}
        data={filteredServices}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>SERVICE</Text>
              </View>
              <Text style={styles.due}>
                Due {item.deadline ? item.deadline.split("T")[0] : "TBD"}
              </Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <View style={styles.bottomRow}>
              <View style={styles.posterRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(item.requestedBy?.name ?? "?").trim().charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.posterText}>{item.requestedBy?.name ?? "Unknown"}</Text>
              </View>
              <Text style={styles.payment}>₹{item.payment ?? "N/A"}</Text>
            </View>
            <ShadowBox
              onPress={() => setConfirmItem(item)}
              bg={colors.yellow}
              radius={11}
              shadowOffset={2.5}
              style={styles.buttonWrapper}
              contentStyle={styles.buttonContent}
            >
              <Text style={styles.buttonText}>I can help</Text>
            </ShadowBox>
          </View>
        )}
      />
      <TabBar />
      <ConfirmModal
        visible={!!confirmItem}
        heading="Offer to help?"
        body={`"${confirmItem?.title}" — ${confirmItem?.requestedBy?.name ?? "they"} will be notified that you're up for it.`}
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
    padding: 15,
    gap: 7,
    marginBottom: 14,
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  badge: {
    backgroundColor: colors.serviceBadgeBg,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 99,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  badgeText: { fontSize: 10, fontFamily: font.extrabold, color: colors.serviceBadgeFg, letterSpacing: 0.5 },
  due: { fontSize: 11.5, fontFamily: font.bold, color: colors.deadlineText },
  title: { fontSize: 16, fontFamily: font.extrabold, color: colors.ink, lineHeight: 21 },
  desc: { fontSize: 13, fontFamily: font.regular, color: colors.bodySecondary, lineHeight: 18 },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
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
  payment: { fontSize: 16, fontFamily: font.extrabold, color: colors.priceEmphasis },
  buttonWrapper: { marginTop: 6 },
  buttonContent: { paddingVertical: 11, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 14, fontFamily: font.extrabold, color: colors.ink },
});
