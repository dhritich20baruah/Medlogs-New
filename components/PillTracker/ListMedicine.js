import { useState, useEffect } from "react";
import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";

export default function ListMedicine({ route }) {
    const { users } = route.params
    return (
        <SQLiteProvider databaseName="Medlogs.db">
            <AllMedicines users={users} />
        </SQLiteProvider>
    )
}

export function AllMedicines(users) {
    const db = useSQLiteContext();
    const navigation = useNavigation()
    const userInfo = users.users;
    const userID = userInfo.users[0].id;
    const [medicationList, setMedicationList] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [medId, setMedID] = useState("")

    const fetchMeds = async () => {
        const response = await db.getAllAsync(`select * from medicine_list where user_id = ?`, [userID])
        setMedicationList(response)
    }

    useEffect(() => {
        fetchMeds()
    }, [])

    function checkCourseStatus(endDateStr) {
        // Parse the given end date string (format: yyyy-mm-dd)
        const endDate = new Date(endDateStr);
        const today = new Date();

        // Remove the time part so we only compare dates
        endDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (today > endDate) {
            return "course over";
        } else {
            // Calculate difference in milliseconds
            const diffTime = endDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return `${diffDays} day(s) left`;
        }
    }

    const deleteMed = async () => {
        try {
            await db.runAsync("DELETE FROM medicine_list WHERE id=?", [medId]);
            Alert.alert("Deleted");
            fetchMeds();
            setModalVisible(false);
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollArea}>
                {medicationList.map((item, id) => {
                    return (
                        <View key={id} style={styles.tiles}>
                            <View>
                                <Text style={{fontSize: 20}}>{item.medicineName}</Text>
                                <Text>{item.startDate.split("-").reverse().join("-")}</Text>
                                <Text>{checkCourseStatus(item.endDate)}</Text>
                            </View>
                            <View>
                                <View style={styles.actions}>
                                    <TouchableOpacity>
                                        <FontAwesome name="pen-to-square" size={20} color="#800000" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => deleteMed(item.id)}>
                                        <FontAwesome name="trash" size={20} color="#800000" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )
                })}
            </ScrollView>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff"
    },
    scrollArea: {
        maxHeight: 620,
    },
    tiles: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginVertical: 10,
        marginHorizontal: 5,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 6, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    statusText: {
        fontSize: 16,
        marginBottom: 10,
    },
     actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 16,
  },
})