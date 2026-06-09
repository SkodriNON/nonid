import {
  approvePupRequest,
  denyPupRequest,
  fetchPupRequests,
  mobileActivateAndApprove,
  type PupRequest,
} from "@/lib/pupApi";

import { LinearGradient } from "expo-linear-gradient";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function HomeScreen() {
  const [pairCode, setPairCode] = useState("");
  const [pin, setPin] = useState("");
  const [paired, setPaired] = useState(false);
  const [pinCreated, setPinCreated] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [requests, setRequests] = useState<PupRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [antiPhishing, setAntiPhishing] = useState("");
  const [newPin, setNewPin] = useState("");
  const [repeatPin, setRepeatPin] = useState("");

  useEffect(() => {
    loadLocalState();
    loadPupRequests();

    const timer = setInterval(loadPupRequests, 4000);

    return () => clearInterval(timer);
  }, []);

  async function loadLocalState() {
    const savedPair = await SecureStore.getItemAsync("NEXUS_PUP_PAIR_CODE");
    const savedPin = await SecureStore.getItemAsync("NEXUS_PUP_PIN");
    const savedBio = await SecureStore.getItemAsync("NEXUS_PUP_BIOMETRIC");

    if (savedPair) {
      setPairCode(savedPair);
      setPaired(true);
    }

    if (savedPin) setPinCreated(true);
    if (savedBio === "true") setBiometricEnabled(true);
  }

  async function loadPupRequests() {
    try {
      setLoadingRequests(true);

      const list = await fetchPupRequests();

      setRequests(list.filter((request) => request.status === "pending"));
    } catch {
      Alert.alert(
        "PUP API Error",
        "Could not load pending requests from NexusNON.ID."
      );
    } finally {
      setLoadingRequests(false);
    }
  }

  function isActivationRequest(request: PupRequest) {
    return (
      request.activationRequired === true ||
      Number(request.capsuleStatus) === 1 ||
      request.action === "ACTIVATE_PUP" ||
      request.action === "PENDING_ACTIVATION"
    );
  }

  async function requireLocalApproval() {
    const savedPin = await SecureStore.getItemAsync("NEXUS_PUP_PIN");
    const savedBio = await SecureStore.getItemAsync("NEXUS_PUP_BIOMETRIC");

    if (!savedPin) {
      Alert.alert("PIN Required", "Create your local PUP PIN first.");
      return false;
    }

    if (savedBio === "true") {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirm Nexus PUP approval",
        fallbackLabel: "Use PUP PIN",
      });

      if (!result.success) {
        Alert.alert("Approval Cancelled", "Biometric confirmation failed.");
        return false;
      }
    }

    return true;
  }

  async function handleApprove(request: PupRequest) {
    try {
      setActionLoading(request.id);

      const activationMode = isActivationRequest(request);

      if (activationMode) {
        if (!antiPhishing.trim() || antiPhishing.trim().length < 4) {
          Alert.alert("Anti-Phishing Required", "Enter your Anti-Phishing Code.");
          return;
        }

        if (!newPin.trim() || newPin.trim().length < 6) {
          Alert.alert("PIN Required", "Create a PUP PIN with at least 6 characters.");
          return;
        }

        if (newPin.trim() !== repeatPin.trim()) {
          Alert.alert("PIN Mismatch", "PUP PINs do not match.");
          return;
        }

        const result = await mobileActivateAndApprove({
          requestId: request.id,
          antiPhishing: antiPhishing.trim(),
          newPin: newPin.trim(),
          repeatPin: repeatPin.trim(),
        });

        if (result?.success) {
          await SecureStore.setItemAsync("NEXUS_PUP_PIN", newPin.trim());
          setPinCreated(true);
          setAntiPhishing("");
          setNewPin("");
          setRepeatPin("");
          setSelectedRequestId("");

          Alert.alert(
            "PUP Activated",
            "PUP was activated, 1 USDT fee was processed, and request was approved."
          );

          await loadPupRequests();
        } else {
          Alert.alert(
            "Activation Failed",
            result?.error || result?.message || "Could not activate PUP."
          );
        }

        return;
      }

      const allowed = await requireLocalApproval();

      if (!allowed) return;

      const result = await approvePupRequest(request.id);

      if (result?.success) {
        Alert.alert("Approved", "PUP request approved.");
        await loadPupRequests();
      } else {
        Alert.alert(
          "Approve Failed",
          result?.error || "Could not approve request."
        );
      }
    } catch (err: any) {
      Alert.alert(
        "Approve Failed",
        err?.message || "Could not approve request."
      );
    } finally {
      setActionLoading("");
    }
  }

  async function handleDeny(request: PupRequest) {
    try {
      setActionLoading(request.id);

      const result = await denyPupRequest(request.id);

      if (result?.success) {
        Alert.alert("Denied", "PUP request denied.");
        await loadPupRequests();
      } else {
        Alert.alert("Deny Failed", result?.error || "Could not deny request.");
      }
    } catch {
      Alert.alert("Deny Failed", "Could not deny request.");
    } finally {
      setActionLoading("");
    }
  }

  async function handlePairDevice() {
    if (pairCode.trim().length < 4) {
      Alert.alert("Invalid Pair Code", "Enter the pair code from NexusNON.ID.");
      return;
    }

    await SecureStore.setItemAsync("NEXUS_PUP_PAIR_CODE", pairCode.trim());
    setPaired(true);

    Alert.alert(
      "Device Paired",
      "This phone is now linked as a PUP approval device."
    );
  }

  async function handleCreatePin() {
    if (pin.length !== 6) {
      Alert.alert("Invalid PIN", "PUP PIN must be exactly 6 digits.");
      return;
    }

    await SecureStore.setItemAsync("NEXUS_PUP_PIN", pin);
    setPin("");
    setPinCreated(true);

    Alert.alert(
      "PIN Created",
      "Your local PUP PIN has been saved securely on this device."
    );
  }

  async function handleEnableBiometric() {
    const compatible = await LocalAuthentication.hasHardwareAsync();

    if (!compatible) {
      Alert.alert(
        "Not Supported",
        "This device does not support Face ID or biometrics."
      );
      return;
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (!enrolled) {
      Alert.alert(
        "Not Enabled",
        "Face ID or biometrics are not enabled on this device."
      );
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Enable Nexus PUP biometric approval",
      fallbackLabel: "Use PUP PIN",
    });

    if (result.success) {
      await SecureStore.setItemAsync("NEXUS_PUP_BIOMETRIC", "true");
      setBiometricEnabled(true);

      Alert.alert(
        "Face ID Enabled",
        "Biometric approval is now enabled for Nexus PUP."
      );
    }
  }

  function formatWallet(wallet: string) {
    if (!wallet) return "Unknown wallet";
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  }

  function formatAction(action: string) {
    return String(action || "PUP_REQUEST").replace(/_/g, " ");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#020617", "#07111f", "#0b1020"]}
        style={styles.bg}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.logoCircle}>
            <Text style={styles.logo}>NΩN</Text>
          </View>

          <Text style={styles.kicker}>NEXUS PUP</Text>
          <Text style={styles.title}>Approval Device</Text>

          <Text style={styles.subtitle}>
            Pair this phone with your Capsule and approve sensitive actions securely.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>1. Pair Capsule</Text>
            <Text style={styles.cardText}>
              Enter the PUP pairing code generated from your NexusNON.ID dashboard.
            </Text>

            <TextInput
              value={pairCode}
              onChangeText={setPairCode}
              placeholder="Enter Pair Code"
              placeholderTextColor="#64748b"
              autoCapitalize="characters"
              style={styles.input}
            />

            <Pressable style={styles.button} onPress={handlePairDevice}>
              <Text style={styles.buttonText}>
                {paired ? "Device Paired" : "Pair This Device"}
              </Text>
            </Pressable>

            {paired && (
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>Capsule Linked</Text>
                <Text style={styles.successText}>
                  This phone is paired locally as your PUP approval device.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>2. Create PUP PIN</Text>
            <Text style={styles.cardText}>
              This PIN stays only on this phone and protects approval actions.
            </Text>

            <TextInput
              value={pin}
              onChangeText={(value) =>
                setPin(value.replace(/[^0-9]/g, "").slice(0, 6))
              }
              placeholder="6-digit PUP PIN"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              secureTextEntry
              style={styles.input}
            />

            <Pressable style={styles.button} onPress={handleCreatePin}>
              <Text style={styles.buttonText}>
                {pinCreated ? "PIN Created" : "Create Local PIN"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>3. Face ID / Biometrics</Text>
            <Text style={styles.cardText}>
              Enable biometric confirmation before approving sensitive requests.
            </Text>

            <Pressable
              style={styles.buttonSecondary}
              onPress={handleEnableBiometric}
            >
              <Text style={styles.buttonSecondaryText}>
                {biometricEnabled ? "Biometrics Enabled" : "Enable Face ID"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View>
                <Text style={styles.cardTitle}>Pending Requests</Text>
                <Text style={styles.requestSubtitle}>
                  {loadingRequests
                    ? "Loading from NexusNON.ID..."
                    : `${requests.length} pending request(s)`}
                </Text>
              </View>

              <Pressable style={styles.refreshButton} onPress={loadPupRequests}>
                <Text style={styles.refreshText}>Refresh</Text>
              </Pressable>
            </View>

            {requests.length === 0 ? (
              <Text style={styles.empty}>No pending approvals yet.</Text>
            ) : (
              <View style={styles.requestList}>
                {requests.map((request) => {
                  const activationMode = isActivationRequest(request);
                  const selected = selectedRequestId === request.id;

                  return (
                    <View key={request.id} style={styles.pendingItem}>
                      <Text style={styles.pendingAction}>
                        {activationMode
                          ? "First PUP Activation"
                          : formatAction(request.action)}
                      </Text>

                      <Text style={styles.pendingMeta}>
                        Capsule #{request.capsuleId}
                      </Text>

                      <Text style={styles.pendingMeta}>
                        {formatWallet(request.wallet)}
                      </Text>

                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>
                          {activationMode ? "ACTIVATION REQUIRED" : "PENDING"}
                        </Text>
                      </View>

                      {activationMode && selected && (
                        <View style={styles.activationBox}>
                          <Text style={styles.activationTitle}>
                            Activate PUP
                          </Text>

                          <Text style={styles.activationText}>
                            This first activation requires your Anti-Phishing Code
                            and charges 1 USDT from the Capsule Wallet.
                          </Text>

                          <TextInput
                            value={antiPhishing}
                            onChangeText={setAntiPhishing}
                            placeholder="Anti-Phishing Code"
                            placeholderTextColor="#64748b"
                            secureTextEntry
                            style={styles.input}
                          />

                          <TextInput
                            value={newPin}
                            onChangeText={setNewPin}
                            placeholder="Create PUP PIN"
                            placeholderTextColor="#64748b"
                            secureTextEntry
                            style={styles.input}
                          />

                          <TextInput
                            value={repeatPin}
                            onChangeText={setRepeatPin}
                            placeholder="Repeat PUP PIN"
                            placeholderTextColor="#64748b"
                            secureTextEntry
                            style={styles.input}
                          />
                        </View>
                      )}

                      <View style={styles.actionRow}>
                        <Pressable
                          disabled={actionLoading === request.id}
                          style={[
                            styles.approveButton,
                            actionLoading === request.id && styles.disabledButton,
                          ]}
                          onPress={() => {
                            if (activationMode && !selected) {
                              setSelectedRequestId(request.id);
                              return;
                            }

                            handleApprove(request);
                          }}
                        >
                          <Text style={styles.approveText}>
                            {actionLoading === request.id
                              ? "Working..."
                              : activationMode && !selected
                                ? "Start Activation"
                                : activationMode
                                  ? "Activate & Approve"
                                  : "Approve"}
                          </Text>
                        </Pressable>

                        <Pressable
                          disabled={actionLoading === request.id}
                          style={[
                            styles.denyButton,
                            actionLoading === request.id && styles.disabledButton,
                          ]}
                          onPress={() => handleDeny(request)}
                        >
                          <Text style={styles.denyText}>Deny</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <Text style={styles.footer}>
            Capsule = Identity • Contract = Source of Truth • PUP = Approval Layer
          </Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#020617" },
  bg: { flex: 1 },
  container: {
    padding: 22,
    paddingBottom: 50,
    alignItems: "center",
  },
  logoCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "rgba(15,23,42,0.8)",
  },
  logo: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 2,
  },
  kicker: {
    color: "#22d3ee",
    fontWeight: "800",
    letterSpacing: 4,
    marginTop: 24,
  },
  title: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 8,
  },
  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
    marginBottom: 24,
  },
  card: {
    width: "100%",
    borderRadius: 28,
    padding: 20,
    marginBottom: 14,
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.18)",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 8,
  },
  cardText: {
    color: "#94a3b8",
    lineHeight: 21,
    marginBottom: 16,
  },
  input: {
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    color: "#fff",
    backgroundColor: "rgba(2,6,23,0.9)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.22)",
    marginBottom: 14,
  },
  button: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22d3ee",
  },
  buttonText: {
    color: "#020617",
    fontWeight: "900",
    fontSize: 15,
  },
  buttonSecondary: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34,211,238,0.1)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.35)",
  },
  buttonSecondaryText: {
    color: "#67e8f9",
    fontWeight: "900",
    fontSize: 15,
  },
  successBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(34,197,94,0.12)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.35)",
  },
  successTitle: {
    color: "#86efac",
    fontWeight: "900",
    marginBottom: 4,
  },
  successText: {
    color: "#bbf7d0",
    lineHeight: 20,
  },
  requestCard: {
    width: "100%",
    marginTop: 0,
    borderRadius: 26,
    padding: 20,
    backgroundColor: "rgba(15,23,42,0.65)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  requestSubtitle: {
    color: "#64748b",
    fontSize: 12,
    marginTop: -2,
  },
  refreshButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(34,211,238,0.1)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.25)",
  },
  refreshText: {
    color: "#67e8f9",
    fontSize: 12,
    fontWeight: "900",
  },
  empty: {
    color: "#64748b",
    marginTop: 14,
  },
  requestList: {
    gap: 10,
    marginTop: 14,
  },
  pendingItem: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(2,6,23,0.75)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.12)",
  },
  pendingAction: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 6,
    textTransform: "capitalize",
  },
  pendingMeta: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 10,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(250,204,21,0.12)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.25)",
  },
  statusText: {
    color: "#fde68a",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  activationBox: {
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(250,204,21,0.08)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.25)",
  },
  activationTitle: {
    color: "#fde68a",
    fontWeight: "900",
    marginBottom: 6,
  },
  activationText: {
    color: "#fef3c7",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  approveButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22d3ee",
  },
  approveText: {
    color: "#020617",
    fontWeight: "900",
    fontSize: 12,
  },
  denyButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(248,113,113,0.12)",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.35)",
  },
  denyText: {
    color: "#fecaca",
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.55,
  },
  footer: {
    color: "#64748b",
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 24,
  },
});