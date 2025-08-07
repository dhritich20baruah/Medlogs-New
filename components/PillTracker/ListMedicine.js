import { useState, useEffect } from "react";
import { Text, View, ScrollView, StyleSheet } from "react-native";
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

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollArea}>
                {medicationList.map((item, id) => {
                    return (
                        <View key={id} style={styles.tiles}>
                            <Text>{item.medicineName}</Text>
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
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 6, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    statusText: {
        fontSize: 16,
        marginBottom: 10,
    },
})