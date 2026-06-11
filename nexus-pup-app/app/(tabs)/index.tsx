import {
  API,
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
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const KEY_REGISTERED = "NEXUSNON_DEVICE_REGISTERED";
const KEY_EMAIL = "NEXUSNON_DEVICE_EMAIL";
const KEY_PHONE = "NEXUSNON_DEVICE_PHONE";
const KEY_CAPSULE_ID = "NEXUSNON_DEVICE_CAPSULE_ID";
const KEY_WALLET = "NEXUSNON_DEVICE_WALLET";
const KEY_PIN = "NEXUSNON_DEVICE_PIN";
const KEY_BIOMETRIC = "NEXUSNON_DEVICE_BIOMETRIC";

export default function HomeScreen() {
  const [registered, setRegistered] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [antiPhishing, setAntiPhishing] = useState("");
  const [pin, setPin] = useState("");
  const [repeatPin, setRepeatPin] = useState("");
  const [unlockPin, setUnlockPin] = useState("");

  const [capsuleId, setCapsuleId] = useState("");
  const [wallet, setWallet] = useState("");
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const [requests, setRequests] = useState<PupRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");

  const [activationAntiPhishing, setActivationAntiPhishing] = useState("");
  const [activationPin, setActivationPin] = useState("");
  const [activationRepeatPin, setActivationRepeatPin] = useState("");

  useEffect(() => {
    boot();
  }, []);

  useEffect(() => {
    if (!registered || !unlocked) return;

    loadRequests();

    const timer = setInterval(loadRequests, 4000);

    return () => clearInterval(timer);
  }, [registered, unlocked, capsuleId, wallet]);

  async function boot() {
    const savedRegistered = await SecureStore.getItemAsync(KEY_REGISTERED);
    const savedEmail = await SecureStore.getItemAsync(KEY_EMAIL);
    const savedPhone = await SecureStore.getItemAsync(KEY_PHONE);
    const savedCapsuleId = await SecureStore.getItemAsync(KEY_CAPSULE_ID);
    const savedWallet = await SecureStore.getItemAsync(KEY_WALLET);
    const savedBio = await SecureStore.getItemAsync(KEY_BIOMETRIC);

    if (
      savedRegistered === "true" &&
      savedCapsuleId &&
      savedWallet
    ) {
      setRegistered(true);
      setEmail(savedEmail || "");
      setPhone(savedPhone || "");
      setCapsuleId(savedCapsuleId);
      setWallet(savedWallet);
      setBiometricEnabled(savedBio === "true");

      if (savedBio === "true") {
        setTimeout(unlockWithBiometric, 450);
      }
    }
  }

  async function registerDevice() {
    try {
      setLoading(true);

      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = phone.trim();
      const cleanAnti = antiPhishing.trim();
      const cleanPin = pin.trim();
      const cleanRepeat = repeatPin.trim();

      if (!cleanEmail || !cleanPhone || !cleanAnti) {
        Alert.alert(
          "Missing Data",
          "Email, phone and Anti-Phishing Code are required."
        );
        return;
      }

      if (cleanAnti.length < 4) {
        Alert.alert(
          "Invalid Anti-Phishing Code",
          "Anti-Phishing Code must contain at least 4 characters."
        );
        return;
      }

      if (cleanPin.length !== 6 || cleanRepeat.length !== 6) {
        Alert.alert(
          "Invalid PIN",
          "Create a 6-digit app PIN."
        );
        return;
      }

      if (cleanPin !== cleanRepeat) {
        Alert.alert(
          "PIN Mismatch",
          "PIN codes do not match."
        );
        return;
      }

      const findResponse = await fetch(
        `${API}/api/genesis/findCapsule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            phone: cleanPhone,
          }),
        }
      );

      const findData = await findResponse.json();

      if (
        !findResponse.ok ||
        findData.success !== true ||
        findData.exists !== true ||
        findData.matched !== true
      ) {
        Alert.alert(
          "Capsule Not Found",
          findData.message ||
            findData.error ||
            "No matching Capsule was found for this email and phone."
        );
        return;
      }

      const foundCapsuleId = String(findData.capsuleId || "");
      const foundWallet = String(findData.capsuleWallet || "");

      if (!foundCapsuleId || !foundWallet) {
        Alert.alert(
          "Invalid Capsule",
          "Capsule data is missing."
        );
        return;
      }

      const verifyResponse = await fetch(
        `${API}/api/genesis/verify-anti-phishing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            capsuleId: foundCapsuleId,
            wallet: foundWallet,
            email: cleanEmail,
            phone: cleanPhone,
            antiPhishing: cleanAnti,
          }),
        }
      );

      const verifyData = await verifyResponse.json();

      if (
        !verifyResponse.ok ||
        verifyData.success !== true
      ) {
        Alert.alert(
          "Verification Failed",
          verifyData.message ||
            verifyData.error ||
            "Anti-Phishing Code could not be verified."
        );
        return;
      }

      await SecureStore.setItemAsync(KEY_REGISTERED, "true");
      await SecureStore.setItemAsync(KEY_EMAIL, cleanEmail);
      await SecureStore.setItemAsync(KEY_PHONE, cleanPhone);
      await SecureStore.setItemAsync(KEY_CAPSULE_ID, foundCapsuleId);
      await SecureStore.setItemAsync(KEY_WALLET, foundWallet);
      await SecureStore.setItemAsync(KEY_PIN, cleanPin);

      setRegistered(true);
      setUnlocked(true);
      setCapsuleId(foundCapsuleId);
      setWallet(foundWallet);
      setPin("");
      setRepeatPin("");
      setAntiPhishing("");

      Alert.alert(
        "Device Registered",
        "This phone is now registered as your NEXUSNON.ID approval device."
      );
    } catch (err: any) {
      Alert.alert(
        "Registration Failed",
        err?.message || "Could not register this device."
      );
    } finally {
      setLoading(false);
    }
  }

  async function unlockWithPin() {
    const savedPin = await SecureStore.getItemAsync(KEY_PIN);

    if (!savedPin) {
      Alert.alert(
        "PIN Missing",
        "Register this device again."
      );
      return;
    }

    if (unlockPin.trim() !== savedPin) {
      Alert.alert(
        "Wrong PIN",
        "The PIN is incorrect."
      );
      return;
    }

    setUnlockPin("");
    setUnlocked(true);
  }

  async function unlockWithBiometric() {
    const savedBio = await SecureStore.getItemAsync(KEY_BIOMETRIC);

    if (savedBio !== "true") return;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock NEXUSNON.ID",
      fallbackLabel: "Use PIN",
    });

    if (result.success) {
      setUnlocked(true);
    }
  }

  async function enableBiometric() {
    const compatible = await LocalAuthentication.hasHardwareAsync();

    if (!compatible) {
      Alert.alert(
        "Not Supported",
        "This device does not support biometrics."
      );
      return;
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (!enrolled) {
      Alert.alert(
        "Not Enabled",
        "Biometrics are not enabled on this device."
      );
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Enable NEXUSNON.ID biometric unlock",
      fallbackLabel: "Use PIN",
    });

    if (result.success) {
      await SecureStore.setItemAsync(KEY_BIOMETRIC, "true");
      setBiometricEnabled(true);

      Alert.alert(
        "Enabled",
        "Biometric unlock is now enabled."
      );
    }
  }

  async function loadRequests() {
    try {
      const list = await fetchPupRequests();

      const mine = list.filter((request) => {
        const sameCapsule =
          String(request.capsuleId || "") === String(capsuleId);

        const sameWallet =
          String(request.wallet || "").toLowerCase() ===
          String(wallet || "").toLowerCase();

        return (
          request.status === "pending" &&
          sameCapsule &&
          sameWallet
        );
      });

      setRequests(mine);
    } catch {
      Alert.alert(
        "Connection Error",
        "Could not load approval requests."
      );
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

  function describeAction(action: string) {
    const value =
      String(action || "REQUEST");

    if (value === "LOGIN_DASHBOARD") {
      return "This request wants to open your Capsule dashboard.";
    }

    if (value === "ACTIVATE_PUP") {
      return "This request wants to activate your PUP approval layer.";
    }

    if (value.startsWith("BUSINESS_CAPSULE_APPROVAL")) {
      return "This request wants to approve a Business Capsule action.";
    }

    return "This request needs approval from your NEXUSNON.ID device.";
  }

  function formatAction(action: string) {
    return String(action || "REQUEST").replace(/_/g, " ");
  }

  async function approve(request: PupRequest) {
    try {
      setActionLoading(request.id);

      const activation = isActivationRequest(request);

      if (activation) {
        if (
          !activationAntiPhishing.trim() ||
          activationAntiPhishing.trim().length < 4
        ) {
          Alert.alert(
            "Anti-Phishing Required",
            "Enter your Anti-Phishing Code."
          );
          return;
        }

        if (
          activationPin.trim().length !== 6 ||
          activationRepeatPin.trim().length !== 6
        ) {
          Alert.alert(
            "Invalid PIN",
            "Create a 6-digit PUP PIN."
          );
          return;
        }

        if (activationPin.trim() !== activationRepeatPin.trim()) {
          Alert.alert(
            "PIN Mismatch",
            "PUP PINs do not match."
          );
          return;
        }

        const result = await mobileActivateAndApprove({
          requestId: request.id,
          antiPhishing: activationAntiPhishing.trim(),
          newPin: activationPin.trim(),
          repeatPin: activationRepeatPin.trim(),
        });

        if (result?.success) {
          await SecureStore.setItemAsync(KEY_PIN, activationPin.trim());

          setActivationAntiPhishing("");
          setActivationPin("");
          setActivationRepeatPin("");
          setSelectedRequestId("");

          Alert.alert(
            "Approved",
            "PUP activated and request approved."
          );

          await loadRequests();
        } else {
          Alert.alert(
            "Activation Failed",
            result?.error ||
              result?.message ||
              "Could not activate PUP."
          );
        }

        return;
      }

      const result = await approvePupRequest(request.id);

      if (result?.success) {
        Alert.alert(
          "Approved",
          "Request approved."
        );

        await loadRequests();
      } else {
        Alert.alert(
          "Approval Failed",
          result?.error || "Could not approve request."
        );
      }
    } catch (err: any) {
      Alert.alert(
        "Approval Failed",
        err?.message || "Could not approve request."
      );
    } finally {
      setActionLoading("");
    }
  }

  async function deny(request: PupRequest) {
    try {
      setActionLoading(request.id);

      const result = await denyPupRequest(request.id);

      if (result?.success) {
        Alert.alert(
          "Denied",
          "Request denied."
        );

        await loadRequests();
      } else {
        Alert.alert(
          "Deny Failed",
          result?.error || "Could not deny request."
        );
      }
    } catch {
      Alert.alert(
        "Deny Failed",
        "Could not deny request."
      );
    } finally {
      setActionLoading("");
    }
  }

  async function resetDevice() {
    await SecureStore.deleteItemAsync(KEY_REGISTERED);
    await SecureStore.deleteItemAsync(KEY_EMAIL);
    await SecureStore.deleteItemAsync(KEY_PHONE);
    await SecureStore.deleteItemAsync(KEY_CAPSULE_ID);
    await SecureStore.deleteItemAsync(KEY_WALLET);
    await SecureStore.deleteItemAsync(KEY_PIN);
    await SecureStore.deleteItemAsync(KEY_BIOMETRIC);

    setRegistered(false);
    setUnlocked(false);
    setEmail("");
    setPhone("");
    setCapsuleId("");
    setWallet("");
    setRequests([]);
    setBiometricEnabled(false);
  }

  if (!registered) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={["#020617", "#07111f", "#0b1020"]}
          style={styles.bg}
        >
          <ScrollView contentContainerStyle={styles.container}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />

            <Text style={styles.kicker}>NEXUSNON.ID</Text>
            <Text style={styles.title}>Register Device</Text>

            <Text style={styles.subtitle}>
              Register this phone as your secure NEXUSNON.ID approval device.
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Identity Verification</Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />

              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone with country code"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
                style={styles.input}
              />

              <TextInput
                value={antiPhishing}
                onChangeText={setAntiPhishing}
                placeholder="Anti-Phishing Code"
                placeholderTextColor="#64748b"
                secureTextEntry
                style={styles.input}
              />

              <TextInput
                value={pin}
                onChangeText={(value) =>
                  setPin(value.replace(/[^0-9]/g, "").slice(0, 6))
                }
                placeholder="Create 6-digit PIN"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                secureTextEntry
                style={styles.input}
              />

              <TextInput
                value={repeatPin}
                onChangeText={(value) =>
                  setRepeatPin(value.replace(/[^0-9]/g, "").slice(0, 6))
                }
                placeholder="Repeat PIN"
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                secureTextEntry
                style={styles.input}
              />

              <Pressable
                style={styles.button}
                onPress={registerDevice}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Registering..." : "Register Device"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!unlocked) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={["#020617", "#07111f", "#0b1020"]}
          style={styles.bg}
        >
          <View style={styles.centerContainer}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logoImageSmall}
              resizeMode="contain"
            />

            <Text style={styles.kicker}>NEXUSNON.ID</Text>
            <Text style={styles.titleSmall}>Unlock</Text>

            <Text style={styles.subtitle}>
              Enter your PIN to unlock this approval device.
            </Text>

            <TextInput
              value={unlockPin}
              onChangeText={(value) =>
                setUnlockPin(value.replace(/[^0-9]/g, "").slice(0, 6))
              }
              placeholder="6-digit PIN"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              secureTextEntry
              style={styles.input}
            />

            <Pressable
              style={styles.button}
              onPress={unlockWithPin}
            >
              <Text style={styles.buttonText}>
                Unlock
              </Text>
            </Pressable>

            {biometricEnabled && (
              <Pressable
                style={styles.buttonSecondary}
                onPress={unlockWithBiometric}
              >
                <Text style={styles.buttonSecondaryText}>
                  Use Biometrics
                </Text>
              </Pressable>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#020617", "#07111f", "#0b1020"]}
        style={styles.bg}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logoImageSmall}
            resizeMode="contain"
          />

          <Text style={styles.kicker}>NEXUSNON.ID</Text>
          <Text style={styles.titleSmall}>Approval Device</Text>

          <Text style={styles.subtitle}>
            {requests.length === 0
              ? "Waiting for secure verification requests."
              : "A secure request is waiting for your approval."}
          </Text>

          {requests.length === 0 ? (
            <View style={styles.waitingCard}>
              <Text style={styles.waitingIcon}>⌁</Text>
              <Text style={styles.waitingTitle}>No pending requests</Text>
              <Text style={styles.waitingText}>
                Keep this app open when logging in to NEXUSNON.ID.
              </Text>

              <Pressable
                style={styles.refreshButton}
                onPress={loadRequests}
              >
                <Text style={styles.refreshText}>Refresh</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.requestList}>
              {requests.map((request) => {
                const activation = isActivationRequest(request);
                const selected = selectedRequestId === request.id;

                return (
                  <View key={request.id} style={styles.requestCard}>
                    <Text style={styles.requestLabel}>
                      Verification request
                    </Text>

                    <Text style={styles.requestTitle}>
                      {activation
                        ? "Activate PUP"
                        : formatAction(request.action)}
                    </Text>

                    <Text style={styles.requestDescription}>
                      {describeAction(request.action)}
                    </Text>

                    {activation && selected && (
                      <View style={styles.activationBox}>
                        <TextInput
                          value={activationAntiPhishing}
                          onChangeText={setActivationAntiPhishing}
                          placeholder="Anti-Phishing Code"
                          placeholderTextColor="#64748b"
                          secureTextEntry
                          style={styles.input}
                        />

                        <TextInput
                          value={activationPin}
                          onChangeText={(value) =>
                            setActivationPin(
                              value.replace(/[^0-9]/g, "").slice(0, 6)
                            )
                          }
                          placeholder="Create PUP PIN"
                          placeholderTextColor="#64748b"
                          keyboardType="number-pad"
                          secureTextEntry
                          style={styles.input}
                        />

                        <TextInput
                          value={activationRepeatPin}
                          onChangeText={(value) =>
                            setActivationRepeatPin(
                              value.replace(/[^0-9]/g, "").slice(0, 6)
                            )
                          }
                          placeholder="Repeat PUP PIN"
                          placeholderTextColor="#64748b"
                          keyboardType="number-pad"
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
                          if (activation && !selected) {
                            setSelectedRequestId(request.id);
                            return;
                          }

                          approve(request);
                        }}
                      >
                        <Text style={styles.approveText}>
                          {actionLoading === request.id
                            ? "Working..."
                            : activation && !selected
                              ? "Continue"
                              : "Approve"}
                        </Text>
                      </Pressable>

                      <Pressable
                        disabled={actionLoading === request.id}
                        style={[
                          styles.denyButton,
                          actionLoading === request.id && styles.disabledButton,
                        ]}
                        onPress={() => deny(request)}
                      >
                        <Text style={styles.denyText}>
                          Deny
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.settingsCard}>
            <Pressable
              style={styles.buttonSecondary}
              onPress={enableBiometric}
            >
              <Text style={styles.buttonSecondaryText}>
                {biometricEnabled
                  ? "Biometrics Enabled"
                  : "Enable Biometrics"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.logoutButton}
              onPress={resetDevice}
            >
              <Text style={styles.logoutText}>
                Remove Device
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#020617",
  },
  bg: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 36,
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 118,
    height: 118,
    marginTop: 18,
    marginBottom: 16,
  },
  logoImageSmall: {
    width: 86,
    height: 86,
    marginTop: 14,
    marginBottom: 14,
  },
  kicker: {
    color: "#22d3ee",
    fontWeight: "900",
    letterSpacing: 4,
    fontSize: 12,
    textAlign: "center",
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 8,
  },
  titleSmall: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 8,
  },
  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 22,
  },
  card: {
    width: "100%",
    borderRadius: 26,
    padding: 18,
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.18)",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 14,
  },
  input: {
    height: 52,
    width: "100%",
    borderRadius: 15,
    paddingHorizontal: 15,
    color: "#fff",
    backgroundColor: "rgba(2,6,23,0.9)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.22)",
    marginBottom: 12,
  },
  button: {
    height: 52,
    width: "100%",
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
    height: 50,
    width: "100%",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(34,211,238,0.1)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.35)",
    marginTop: 10,
  },
  buttonSecondaryText: {
    color: "#67e8f9",
    fontWeight: "900",
    fontSize: 14,
  },
  waitingCard: {
    width: "100%",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.78)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  waitingIcon: {
    color: "#22d3ee",
    fontSize: 42,
    marginBottom: 8,
  },
  waitingTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  waitingText: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
  },
  refreshButton: {
    marginTop: 18,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "rgba(34,211,238,0.1)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.25)",
  },
  refreshText: {
    color: "#67e8f9",
    fontSize: 12,
    fontWeight: "900",
  },
  requestList: {
    width: "100%",
    gap: 12,
  },
  requestCard: {
    width: "100%",
    borderRadius: 28,
    padding: 20,
    backgroundColor: "rgba(15,23,42,0.92)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.18)",
  },
  requestLabel: {
    color: "#22d3ee",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  requestTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 10,
    textTransform: "capitalize",
  },
  requestDescription: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  activationBox: {
    marginTop: 16,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(250,204,21,0.08)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.25)",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  approveButton: {
    flex: 1,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22d3ee",
  },
  approveText: {
    color: "#020617",
    fontWeight: "900",
  },
  denyButton: {
    flex: 1,
    height: 48,
    borderRadius: 15,
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
  settingsCard: {
    width: "100%",
    marginTop: 18,
  },
  logoutButton: {
    height: 48,
    width: "100%",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(248,113,113,0.1)",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.3)",
    marginTop: 10,
  },
  logoutText: {
    color: "#fecaca",
    fontWeight: "900",
  },
});