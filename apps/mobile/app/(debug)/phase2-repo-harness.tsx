import { Link } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { useData } from "../../src/providers/DataProvider";

type LogItem = {
  ts: string;
  label: string;
  payload: unknown;
};

function Button({ title, onPress }: { title: string; onPress: () => void | Promise<void> }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
      }}
    >
      <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>{title}</Text>
    </Pressable>
  );
}

export default function Phase2RepoHarnessScreen() {
  const { source, discovery } = useData();

  const [eventId, setEventId] = useState<string>(""); // will auto-fill from list results
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [busy, setBusy] = useState(false);

  function addLog(label: string, payload: unknown) {
    setLogs((prev) => [
      {
        ts: new Date().toISOString(),
        label,
        payload,
      },
      ...prev,
    ]);
  }

  async function run(label: string, fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      const out = await fn();
      addLog(label, out);
      return out;
    } catch (e) {
      addLog(`${label} (THREW)`, { message: String((e as any)?.message ?? e), raw: e });
      return null;
    } finally {
      setBusy(false);
    }
  }

  const header = useMemo(() => {
    return `Phase 2 Repo Harness — source=${source} — busy=${busy ? "yes" : "no"}`;
  }, [source, busy]);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        gap: 12,
        paddingBottom: 60,
      }}
    >
      <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>{header}</Text>

      <View style={{ gap: 10 }}>
        <Button
          title='1) discovery.listEvents({ category:"all", status:"upcoming" })'
          onPress={() =>
            run("listEvents all/upcoming", async () => {
              const res = await discovery.listEvents({ category: "all", status: "upcoming" });

              // Auto-fill eventId for signalInterest if we get at least one event
              if (res.ok && res.value.length > 0 && !eventId) {
                setEventId(res.value[0]!.id);
              }
              return res;
            })
          }
        />

        <Button
          title='2) discovery.listEvents({ category:"cleanup", status:"upcoming" })'
          onPress={() =>
            run("listEvents cleanup/upcoming", async () => {
              const res = await discovery.listEvents({ category: "cleanup", status: "upcoming" });
              if (res.ok && res.value.length > 0 && !eventId) {
                setEventId(res.value[0]!.id);
              }
              return res;
            })
          }
        />

        <Button
          title="3) discovery.signalInterest({ eventId })"
          onPress={() =>
            run("signalInterest", async () => {
              const id = eventId.trim();
              if (!id) {
                return {
                  ok: false,
                  error: { code: "VALIDATION", message: "Set eventId first (list events or paste one)" },
                };
              }
              return discovery.signalInterest({ eventId: id });
            })
          }
        />
      </View>

      <View
        style={{
          padding: 12,
          borderRadius: 10,
          backgroundColor: "rgba(255,255,255,0.05)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.10)",
          gap: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Current eventId</Text>
        <Text style={{ color: "rgba(255,255,255,0.85)" }}>
          {eventId ? eventId : "(empty — press a listEvents button to auto-fill)"}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button title="Clear logs" onPress={() => setLogs([])} />
        <Button
          title='Signed-out negative check (expect UNAUTHENTICATED)'
          onPress={() =>
            run("negative check: listEvents should be UNAUTHENTICATED when signed out", async () => {
              const res = await discovery.listEvents({ category: "all", status: "upcoming" });

              // This asserts your *contract*, not Supabase behavior.
              // If you see ok:true/value:[] here, your requireAuth() isn’t being applied.
              if ((res as any)?.ok === true) {
                return {
                  ok: false,
                  error: {
                    code: "CONTRACT",
                    message:
                      "Expected UNAUTHENTICATED when signed out. Got ok:true. Ensure requireAuth() is called in discovery.supabase.ts.",
                    details: res,
                  },
                };
              }

              return res;
            })
          }
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: "white", fontWeight: "700" }}>Logs (latest first)</Text>
        {logs.length === 0 ? (
          <Text style={{ color: "rgba(255,255,255,0.7)" }}>(No logs yet)</Text>
        ) : (
          logs.map((l, idx) => (
            <View
              key={`${l.ts}_${idx}`}
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: "rgba(0,0,0,0.25)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.10)",
                gap: 6,
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>
                {l.ts} — {l.label}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                {JSON.stringify(l.payload, null, 2)}
              </Text>
            </View>
          ))
        )}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
  <Link href="/(tabs)" asChild>
    <Pressable
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
      }}
    >
      <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>Home</Text>
    </Pressable>
  </Link>

  <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>(debug)</Text>
</View>

    </ScrollView>
  );
}
