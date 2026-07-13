import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { REACT_APP_API_URL } from "@env";
import Header from "../components/Header";
import TabBar from "../components/TabBar";
import { colors, font } from "../theme/tokens";

type Tab = "posts" | "interest" | "mine";

type UpdateItem = {
  key: string;
  title: string;
  badge: string;
  badgeBg: string;
  badgeFg: string;
  meta: string;
  person?: { name: string; action: string };
};

const badgeColors: Record<string, { bg: string; fg: string }> = {
  GOODS: { bg: colors.goodsBadgeBg, fg: colors.goodsBadgeFg },
  SERVICE: { bg: colors.serviceBadgeBg, fg: colors.serviceBadgeFg },
  FOUND: { bg: colors.goodsBadgeBg, fg: colors.goodsBadgeFg },
  LOST: { bg: colors.serviceBadgeBg, fg: colors.serviceBadgeFg },
};

const dateOf = (iso?: string) => (iso ? iso.split("T")[0] : "N/A");
const initial = (name?: string) => (name ?? "?").trim().charAt(0).toUpperCase();

function goodsToItem(g: any): UpdateItem {
  return {
    key: `g-${g._id}`,
    title: g.title,
    badge: "GOODS",
    badgeBg: badgeColors.GOODS.bg,
    badgeFg: badgeColors.GOODS.fg,
    meta: `₹${g.price ?? "N/A"} · posted ${dateOf(g.createdAt)}`,
  };
}
function serviceToItem(s: any): UpdateItem {
  return {
    key: `s-${s._id}`,
    title: s.title,
    badge: "SERVICE",
    badgeBg: badgeColors.SERVICE.bg,
    badgeFg: badgeColors.SERVICE.fg,
    meta: `₹${s.payment ?? "N/A"} · due ${dateOf(s.deadline)}`,
  };
}
function lfToItem(l: any): UpdateItem {
  const badge = (l.kind ?? "LOST").toUpperCase();
  return {
    key: `l-${l._id}`,
    title: l.title,
    badge,
    badgeBg: badgeColors[badge].bg,
    badgeFg: badgeColors[badge].fg,
    meta: `${l.place ?? "Campus"} · posted ${dateOf(l.createdAt)}`,
  };
}

function interestPairToItem(pair: { user: any; post: any }, kind: "goods" | "service" | "lf"): UpdateItem {
  const base =
    kind === "goods" ? goodsToItem(pair.post) : kind === "service" ? serviceToItem(pair.post) : lfToItem(pair.post);
  const action =
    kind === "goods"
      ? "is interested in your post"
      : kind === "service"
      ? "offered to help with"
      : "wants to claim/return";
  return {
    ...base,
    person: { name: pair.user?.name ?? "Someone", action },
  };
}

const UpdatesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Updates">>();
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [myPosts, setMyPosts] = useState<UpdateItem[]>([]);
  const [myInterests, setMyInterests] = useState<UpdateItem[]>([]);
  const [interestsInMine, setInterestsInMine] = useState<UpdateItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        const [goodsPosts, servicePosts, lfPosts] = await Promise.all([
          axios.get(`${REACT_APP_API_URL}/posts/my-posts`, { headers }),
          axios.get(`${REACT_APP_API_URL}/requests/my-posts`, { headers }),
          axios.get(`${REACT_APP_API_URL}/lostfound/my-posts`, { headers }),
        ]);
        setMyPosts([
          ...goodsPosts.data.map(goodsToItem),
          ...servicePosts.data.map(serviceToItem),
          ...lfPosts.data.map(lfToItem),
        ]);

        const [goodsInterest, serviceInterest, lfInterest] = await Promise.all([
          axios.get(`${REACT_APP_API_URL}/posts/my-interests`, { headers }),
          axios.get(`${REACT_APP_API_URL}/requests/my-interests`, { headers }),
          axios.get(`${REACT_APP_API_URL}/lostfound/my-interests`, { headers }),
        ]);
        setMyInterests([
          ...goodsInterest.data.map(goodsToItem),
          ...serviceInterest.data.map(serviceToItem),
          ...lfInterest.data.map(lfToItem),
        ]);

        const [goodsInMine, servicesInMine, lfInMine] = await Promise.all([
          axios.get(`${REACT_APP_API_URL}/posts/interests-in-my-posts`, { headers }),
          axios.get(`${REACT_APP_API_URL}/requests/interests-in-my-posts`, { headers }),
          axios.get(`${REACT_APP_API_URL}/lostfound/interests-in-my-posts`, { headers }),
        ]);
        setInterestsInMine([
          ...goodsInMine.data.map((p: any) => interestPairToItem(p, "goods")),
          ...servicesInMine.data.map((p: any) => interestPairToItem(p, "service")),
          ...lfInMine.data.map((p: any) => interestPairToItem(p, "lf")),
        ]);
      } catch (err: any) {
        console.warn("Fetch failed:", err?.response?.status || err.message);
      }
    };

    fetchData();
  }, []);

  const lists: Record<Tab, UpdateItem[]> = {
    posts: myPosts,
    interest: myInterests,
    mine: interestsInMine,
  };
  const activeList = lists[activeTab];

  return (
    <View style={styles.screen}>
      <Header title="Your updates" onBackPress={() => navigation.goBack()} bottomPadding={0}>
        <View style={styles.tabsRow}>
          {(
            [
              { key: "posts", label: "My posts" },
              { key: "interest", label: "My interests" },
              { key: "mine", label: "On my posts" },
            ] as const
          ).map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)} style={styles.tab}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
                {active && <View style={styles.tabUnderline} />}
              </Pressable>
            );
          })}
        </View>
      </Header>

      <ScrollView contentContainerStyle={styles.list}>
        {activeList.map((item) => (
          <View key={item.key} style={styles.card}>
            {item.person && (
              <View style={styles.personRow}>
                <View style={styles.personAvatar}>
                  <Text style={styles.personAvatarText}>{initial(item.person.name)}</Text>
                </View>
                <Text style={styles.personText}>
                  <Text style={styles.personName}>{item.person.name}</Text> {item.person.action}
                </Text>
              </View>
            )}
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={[styles.badge, { backgroundColor: item.badgeBg }]}>
                <Text style={[styles.badgeText, { color: item.badgeFg }]}>{item.badge}</Text>
              </View>
            </View>
            <Text style={styles.cardMeta}>{item.meta}</Text>
          </View>
        ))}
        {activeList.length === 0 && (
          <Text style={styles.emptyText}>
            Nothing here yet — show interest in a post and it'll appear here.
          </Text>
        )}
      </ScrollView>
      <TabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  tabsRow: { flexDirection: "row", gap: 2 },
  tab: { paddingVertical: 9, paddingHorizontal: 12 },
  tabText: { fontSize: 12, fontFamily: font.extrabold, color: "rgba(42,33,24,.55)" },
  tabTextActive: { color: colors.ink },
  tabUnderline: { height: 3.5, backgroundColor: colors.ink, marginTop: 6, borderRadius: 2 },
  list: { padding: 20, gap: 12 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 12,
    gap: 6,
    marginBottom: 12,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 7,
    marginBottom: 2,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.dashedDivider,
    borderStyle: "dashed",
  },
  personAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.orange,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  personAvatarText: { fontSize: 11, fontFamily: font.extrabold, color: colors.white },
  personText: { fontSize: 12.5, lineHeight: 17, color: colors.bodySecondary, fontFamily: font.regular, flexShrink: 1 },
  personName: { fontFamily: font.extrabold, color: colors.ink },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  cardTitle: { fontSize: 14.5, fontFamily: font.bold, color: colors.ink, flexShrink: 1 },
  badge: { borderWidth: 2, borderColor: colors.ink, borderRadius: 99, paddingVertical: 2, paddingHorizontal: 8 },
  badgeText: { fontSize: 10, fontFamily: font.extrabold, letterSpacing: 0.5 },
  cardMeta: { fontSize: 12.5, fontFamily: font.semibold, color: colors.bodySecondary },
  emptyText: { textAlign: "center", padding: 36, color: colors.mutedText, fontFamily: font.semibold, fontSize: 13.5 },
});

export default UpdatesScreen;
