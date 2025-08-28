import { useEffect, useState, useRef } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";

import {
    BannerAd,
    BannerAdSize,
    TestIds,
    useForeground,
} from "react-native-google-mobile-ads";

const adUnitId = __DEV__
    ? TestIds.ADAPTIVE_BANNER
    : "ca-app-pub-4558946228793580/5407601006";

const Dashboard = ({ route }) => {
    const { userID } = route.params;
    return (
        <SQLiteProvider databaseName="Medlogs.db">
            <Menu userID={userID} />
        </SQLiteProvider>
    )
}

export function Menu(userID) {
    const db = useSQLiteContext();
    const navigation = useNavigation()
    const id = userID.userID;
    const [users, setUsers] = useState([
        {
            id: "",
            name: "",
            weight: "",
            height: "",
            breakfast: "",
            dinner: "",
            lunch: "",
        },
    ])

    const bannerRef = useRef(null);

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        const result = await db.getAllAsync("SELECT * FROM userData WHERE id = ?", [id]);
        setUsers(result)
    }

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
                    Hello {users[0].name}
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Pills", {
                        users
                    })}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        margin: 10,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: "#800000",
                        borderRadius: 10,
                    }}
                >
                    <FontAwesome name="pills" size={30} color="#800000" />
                    <Text
                        style={{ marginHorizontal: 20, color: "#800000", fontSize: 15 }}
                    >
                        Pill Tracker
                    </Text>
                    <FontAwesome name="circle-arrow-right" size={20} color="#800000" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Blood Pressure", {
                        users
                    })}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        margin: 10,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: "#800000",
                        borderRadius: 10,
                    }}
                >
                    <FontAwesome name="heart-pulse" size={30} color="#800000" />
                    <Text
                        style={{ marginHorizontal: 20, color: "#800000", fontSize: 15 }}
                    >
                        Blood Pressure
                    </Text>
                    <FontAwesome name="circle-arrow-right" size={20} color="#800000" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Blood Sugar", {
                        users
                    })}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        margin: 10,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: "#800000",
                        borderRadius: 10,
                    }}
                >
                    <FontAwesome name="droplet" size={30} color="#800000" />
                    <Text
                        style={{ marginHorizontal: 20, color: "#800000", fontSize: 15 }}
                    >
                        Blood Sugar
                    </Text>
                    <FontAwesome name="circle-arrow-right" size={20} color="#800000" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Doctors", {
                        users
                    })}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        margin: 10,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: "#800000",
                        borderRadius: 10,
                    }}
                >
                    <FontAwesome name="user-doctor" size={30} color="#800000" />
                    <Text
                        style={{ marginHorizontal: 20, color: "#800000", fontSize: 15 }}
                    >
                        Your Doctors
                    </Text>
                    <FontAwesome name="circle-arrow-right" size={20} color="#800000" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate("BMI", {
                        users
                    })}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        margin: 10,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: "#800000",
                        borderRadius: 10,
                    }}
                >
                    <FontAwesome name="weight-scale" size={30} color="#800000" />
                    <Text
                        style={{ marginHorizontal: 20, color: "#800000", fontSize: 15 }}
                    >
                        BMI
                    </Text>
                    <FontAwesome name="circle-arrow-right" size={20} color="#800000" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate("History", {
                        users
                    })}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        margin: 10,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: "#800000",
                        borderRadius: 10,
                    }}
                >
                    <FontAwesome name="calendar-days" size={30} color="#800000" />
                    <Text
                        style={{ marginHorizontal: 20, color: "#800000", fontSize: 15 }}
                    >
                        History
                    </Text>
                    <FontAwesome name="circle-arrow-right" size={20} color="#800000" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Settings", {
                        users
                    })}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        margin: 10,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: "#800000",
                        borderRadius: 10,
                    }}
                >
                    <FontAwesome name="gear" size={30} color="#800000" />
                    <Text
                        style={{ marginHorizontal: 20, color: "#800000", fontSize: 15 }}
                    >
                        Settings
                    </Text>
                    <FontAwesome name="circle-arrow-right" size={20} color="#800000" />
                </TouchableOpacity>
            </SafeAreaView>
            <BannerAd
                ref={bannerRef}
                unitId={adUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            />
        </ScrollView>
    )
}

export default Dashboard;