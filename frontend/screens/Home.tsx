import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Image } from "react-native";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RootStackParamList } from "../App";
import { MainTabParamList } from "../navigation/MainTabs";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { REACT_APP_API_URL } from "@env";
import SearchBar from "../components/SearchBar";
import TabBar from "../components/TabBar";
import ShadowBox from "../components/ui/ShadowBox";
import { BellIcon, ChevronRightIcon } from "../components/ui/Icon";
import { colors, font } from "../theme/tokens";

type HomeProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

type GoodsItem = {
  _id: string;
  title: string;
  description: string;
  price?: number;
  images?: string[];
  postedBy?: { name?: string };
};
type ServiceItem = {
  _id: string;
  title: string;
  description: string;
  payment?: number;
  deadline?: string;
  requestedBy?: { name?: string };
};
type LostFoundItem = {
  _id: string;
  title: string;
  place?: string;
  kind: "Lost" | "Found";
  postedBy?: { name?: string };
};

type SearchResult = {
  key: string;
  title: string;
  meta: string;
  badge: string;
  badgeBg: string;
  badgeFg: string;
  onPress: () => void;
};

const Home: React.FC<HomeProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState(route.params?.name ?? "");
  const [goods, setGoods] = useState<GoodsItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [lostfound, setLostfound] = useState<LostFoundItem[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (route.params?.name) return;
    AsyncStorage.getItem("userName").then((stored) => {
      if (stored) setUserName(stored);
    });
  }, [route.params?.name]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const [goodsRes, servicesRes, lfRes] = await Promise.all([
          axios.get(`${REACT_APP_API_URL}/posts`),
          axios.get(`${REACT_APP_API_URL}/requests`),
          axios.get(`${REACT_APP_API_URL}/lostfound`),
        ]);
        setGoods(goodsRes.data);
        setServices(servicesRes.data);
        setLostfound(lfRes.data);
      } catch (err) {
        console.error("Failed to fetch feed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  useEffect(() => {
    const fetchNotifCount = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        const [g, s, l] = await Promise.all([
          axios.get(`${REACT_APP_API_URL}/posts/interests-in-my-posts`, { headers }),
          axios.get(`${REACT_APP_API_URL}/requests/interests-in-my-posts`, { headers }),
          axios.get(`${REACT_APP_API_URL}/lostfound/interests-in-my-posts`, { headers }),
        ]);
        setNotifCount(g.data.length + s.data.length + l.data.length);
      } catch (err) {
        // not logged in yet, or server unreachable — badge just stays 0
      }
    };
    fetchNotifCount();
  }, []);

  const q = search.trim().toLowerCase();
  const hit = (t?: string) => (t ?? "").toLowerCase().includes(q);

  const searchResults: SearchResult[] = useMemo(() => {
    if (!q) return [];
    const goodsHits = goods
      .filter((g) => hit(g.title) || hit(g.description))
      .map((g) => ({
        key: `g-${g._id}`,
        title: g.title,
        meta: `₹${g.price ?? 0} · ${g.postedBy?.name ?? "Unknown"}`,
        badge: "GOODS",
        badgeBg: colors.goodsBadgeBg,
        badgeFg: colors.goodsBadgeFg,
        onPress: () => navigation.navigate("Goods", { focusId: g._id }),
      }));
    const serviceHits = services
      .filter((s) => hit(s.title) || hit(s.description))
      .map((s) => ({
        key: `s-${s._id}`,
        title: s.title,
        meta: `₹${s.payment ?? 0} · due ${s.deadline ? s.deadline.split("T")[0] : "TBD"}`,
        badge: "SERVICE",
        badgeBg: colors.serviceBadgeBg,
        badgeFg: colors.serviceBadgeFg,
        onPress: () => navigation.navigate("Services", { focusId: s._id }),
      }));
    const lfHits = lostfound
      .filter((l) => hit(l.title) || hit(l.place))
      .map((l) => ({
        key: `l-${l._id}`,
        title: l.title,
        meta: `${l.place ?? "Campus"} · ${l.postedBy?.name ?? "Unknown"}`,
        badge: l.kind.toUpperCase(),
        badgeBg: l.kind === "Found" ? colors.goodsBadgeBg : colors.serviceBadgeBg,
        badgeFg: l.kind === "Found" ? colors.goodsBadgeFg : colors.serviceBadgeFg,
        onPress: () => navigation.navigate("LostFound", { focusId: l._id }),
      }));
    return [...goodsHits, ...serviceHits, ...lfHits];
  }, [q, goods, services, lostfound]);

  const fresh = useMemo(
    () =>
      [
        ...goods.slice(0, 2).map((g) => ({
          key: `g-${g._id}`,
          title: g.title,
          priceLabel: `₹${g.price ?? 0}`,
          image: g.images?.[0],
          onPress: () => navigation.navigate("Goods", {}),
        })),
        ...services.slice(0, 2).map((s) => ({
          key: `s-${s._id}`,
          title: s.title,
          priceLabel: `₹${s.payment ?? 0}`,
          image: undefined as string | undefined,
          onPress: () => navigation.navigate("Services", {}),
        })),
      ].slice(0, 4),
    [goods, services]
  );

  const latestLf = lostfound[0];
  const lfTeaser = latestLf
    ? `${latestLf.kind === "Found" ? "Found" : "Lost"}: ${latestLf.title}${
        lostfound.length > 1 ? ` · ${lostfound.length - 1} more` : ""
      }`
    : "Nothing reported yet";

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 30 }} />;

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={styles.headerTop}>
            <Text style={styles.greeting}>Hi, {userName || "there"}</Text>
            <ShadowBox
              onPress={() => navigation.navigate("Updates")}
              bg={colors.white}
              radius={21}
              shadowOffset={2.5}
              contentStyle={styles.bellContent}
            >
              <BellIcon />
              {notifCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notifCount}</Text>
                </View>
              )}
            </ShadowBox>
          </View>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search the campus market…" />
        </View>

        {q ? (
          <View style={styles.body}>
            <Text style={styles.sectionLabel}>
              {searchResults.length === 0
                ? "No results"
                : `${searchResults.length} ${searchResults.length === 1 ? "result" : "results"} across campus`}
            </Text>
            {searchResults.map((item) => (
              <Pressable
                key={item.key}
                onPress={item.onPress}
                style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.resultTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.resultMeta}>{item.meta}</Text>
                </View>
                <View style={[styles.resultBadge, { backgroundColor: item.badgeBg }]}>
                  <Text style={[styles.resultBadgeText, { color: item.badgeFg }]}>{item.badge}</Text>
                </View>
                <ChevronRightIcon />
              </Pressable>
            ))}
            {searchResults.length === 0 && (
              <Text style={styles.emptyText}>
                No matches on campus yet.{"\n"}Try another word, or post a request!
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.body}>
            <View style={styles.gridRow}>
              <ShadowBox
                onPress={() => navigation.navigate("Goods", {})}
                bg={colors.orange}
                radius={14}
                shadowOffset={3}
                style={styles.flexOne}
                contentStyle={styles.gridCard}
              >
                <Text style={styles.gridCardTitleLight}>Goods</Text>
                <Text style={styles.gridCardSubLight}>Books, kits & more</Text>
              </ShadowBox>
              <ShadowBox
                onPress={() => navigation.navigate("Services", {})}
                bg={colors.white}
                radius={14}
                shadowOffset={3}
                style={styles.flexOne}
                contentStyle={styles.gridCard}
              >
                <Text style={styles.gridCardTitle}>Services</Text>
                <Text style={styles.gridCardSub}>Tutoring & help</Text>
              </ShadowBox>
            </View>

            <ShadowBox
              onPress={() => navigation.navigate("LostFound", {})}
              bg={colors.yellow}
              radius={14}
              shadowOffset={3}
              contentStyle={styles.lfCard}
            >
              <View>
                <Text style={styles.lfTitle}>Lost & Found</Text>
                <Text style={styles.lfSub}>{lfTeaser}</Text>
              </View>
              <ChevronRightIcon size={20} />
            </ShadowBox>

            {fresh.length > 0 && (
              <View style={{ gap: 10 }}>
                <Text style={styles.sectionLabelUpper}>Fresh on campus</Text>
                <View style={styles.freshGrid}>
                  {fresh.map((item) => (
                    <Pressable key={item.key} onPress={item.onPress} style={styles.freshCard}>
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.freshImage} resizeMode="contain" />
                      ) : (
                        <View style={styles.freshImage} />
                      )}
                      <View style={{ padding: 9 }}>
                        <Text style={styles.freshTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.freshPrice}>{item.priceLabel}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      <TabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  scroll: { flex: 1 },
  header: {
    backgroundColor: colors.yellow,
    borderBottomWidth: 3,
    borderBottomColor: colors.ink,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
  headerTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  greeting: { fontSize: 26, fontFamily: font.extrabold, color: colors.ink, lineHeight: 30 },
  bellContent: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 3,
    backgroundColor: colors.orange,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 9, fontFamily: font.extrabold, color: colors.white },
  body: { padding: 20, paddingTop: 18, gap: 16 },
  sectionLabel: { fontSize: 12, fontFamily: font.extrabold, textTransform: "uppercase", letterSpacing: 0.7, color: colors.mutedText },
  sectionLabelUpper: { fontSize: 15, fontFamily: font.extrabold, textTransform: "uppercase", letterSpacing: 0.9, color: colors.ink },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  resultRowPressed: { transform: [{ translateX: 2 }, { translateY: 2 }] },
  resultTitle: { fontSize: 14.5, fontFamily: font.bold, color: colors.ink },
  resultMeta: { fontSize: 12, fontFamily: font.semibold, color: colors.bodySecondary },
  resultBadge: { paddingVertical: 3, paddingHorizontal: 9, borderWidth: 2, borderColor: colors.ink, borderRadius: 99 },
  resultBadgeText: { fontSize: 10, fontFamily: font.extrabold, letterSpacing: 0.5 },
  emptyText: { textAlign: "center", padding: 32, color: colors.mutedText, fontFamily: font.semibold, fontSize: 13.5 },
  gridRow: { flexDirection: "row", gap: 12 },
  flexOne: { flex: 1 },
  gridCard: { padding: 14, gap: 6 },
  gridCardTitleLight: { fontSize: 16, fontFamily: font.extrabold, color: colors.white },
  gridCardSubLight: { fontSize: 11.5, fontFamily: font.medium, color: colors.goodsBadgeBg },
  gridCardTitle: { fontSize: 16, fontFamily: font.extrabold, color: colors.ink },
  gridCardSub: { fontSize: 11.5, fontFamily: font.medium, color: colors.mutedText },
  lfCard: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lfTitle: { fontSize: 15, fontFamily: font.extrabold, color: colors.ink },
  lfSub: { fontSize: 11.5, fontFamily: font.medium, color: "rgba(42,33,24,.65)" },
  freshGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  freshCard: {
    width: "47%",
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 14,
    overflow: "hidden",
  },
  freshImage: { height: 64, backgroundColor: colors.imgStripeA, borderBottomWidth: 2.5, borderBottomColor: colors.ink },
  freshTitle: { fontSize: 13, fontFamily: font.bold, color: colors.ink },
  freshPrice: { fontSize: 13, fontFamily: font.extrabold, color: colors.priceEmphasis },
});

export default Home;
