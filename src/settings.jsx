import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* Profile Section */}
        <Text style={styles.sectionTitle}>Profile</Text>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Allison Arcand</Text>
        </TouchableOpacity>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.row}>
          <Text style={styles.rowText}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowText}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
          />
        </View>

        {/* Navigation */}
        <Text style={styles.sectionTitle}>General</Text>

        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>Privacy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>About</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 25,
    marginBottom: 10,
    paddingHorizontal: 20,
    color: "#555",
  },
  row: {
    backgroundColor: "white",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#E5E5EA",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowText: {
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: "white",
    paddingVertical: 18,
    alignItems: "center",
  },
  logoutText: {
    color: "red",
    fontSize: 16,
    fontWeight: "600",
  },
});
