import React, { useEffect, useState, useRef } from "react";
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Button,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome6";

const Dashboard = () => {
    return (
        <ScrollView>
            <SafeAreaView style={{ flex: 1, alignContent: "center" }}>
                <Text
                    style={{
                        textAlign: "center",
                        fontSize: 20,
                        color: "#800000",
                        fontWeight: "500",
                        paddingVertical: 10,
                    }}
                >
                    Hello User
                </Text>
            </SafeAreaView>
        </ScrollView>
    )
}

export default Dashboard;