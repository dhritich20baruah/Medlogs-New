import { useEffect, useState, useCallback, useRef } from "react";
import { Text, StyleSheet, TouchableOpacity, SafeAreaView, View, Alert, Modal, ViewBase } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";

export default function Pills({ route }) {
    const { userID } = route.params;
    return (
        <SQLiteProvider databaseName="Medlogs.db">
            <Medicine userID={userID} />
        </SQLiteProvider>
    )
}

export function Medicine(userID) {
    const db = useSQLiteContext();
    const navigation = useNavigation()
    const id = userID.userID;

    return (
        <View>
            <Text>Medicine</Text>
        </View>
    )
}