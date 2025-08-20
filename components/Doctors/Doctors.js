import React, { useState, useCallback, useRef } from "react";
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Modal,
    Share,
    Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
// import * as Linking from 'expo-linking';

export default function Doctors({ route }) {
    const { users } = route.params;
    return (
        <SQLiteProvider databaseName="Medlogs.db">
            <DoctorsScreen users={users} />
        </SQLiteProvider>
    )
}

export function DoctorsScreen(users) {
    const db = useSQLiteContext();
    const navigation = useNavigation()
    const userInfo = users.users[0];
    const userID = userInfo.id;
    const [doctorList, setDoctorList] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [doctorsDetails, setDoctorsDetails] = useState([]);

    // const bannerRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            fetchDoctors();
        }, [])
    );

    const fetchDoctors = async () => {
        try {
            const response = await db.getAllAsync("SELECT * FROM doctors_Info WHERE user_id = ?", [userID])
            setDoctorList(response);
        } catch (error) {
            console.error(error)
        }
    };

    // MODAL FUNCTION
    const doctorInfo = async (id) => {
        const doctorInfo = await db.getAllAsync("SELECT * FROM doctors_Info WHERE id = ? AND user_id = ?",
            [id, userID]);
        setDoctorsDetails(doctorInfo);
        setModalVisible(true);

    };

    //SHARE DETAILS
    const shareDoctorDetails = (name, specialty, contactNumber, address) => {
        const message = `
    Doctor's Name: ${name}
    Specialty: ${specialty}
    Contact Number: ${contactNumber}
    Address: ${address}`;

        Share.share({
            message,
        }).catch((error) => console.log(error));
    };

    //CALL
    const triggerCall = (phoneNo) => {
        // if (phoneNo) {
        //     Linking.openURL(`tel:${phoneNumber}`);
        // } else {
        //     alert("No contact number available");
        // }
    };

    //DELETE DOCTOR'S INFORMATION
    const deleteInfo = async (doctorId) => {
        try {
            await db.runAsync("DELETE FROM doctors_Info WHERE id = ?",
                [doctorId])
            Alert.alert("Success", "Doctor's information deleted successfully!");
            fetchDoctors(); // Refresh the doctor list
            setModalVisible(false); // Close the modal
        }
        catch (error) {
            console.log(error);
            Alert.alert(
                "Error",
                "An error occurred while deleting the doctor's information."
            );
        }
    };

    //EDIT DOCTOR'S INFORMATION
    const editInfo = () => {
        setModalVisible(false);
        navigation.navigate("Edit Doctor Information", {
            doctorsDetails
        });
    };

    return (
        <View style={styles.container}>
            <View>
                {doctorList.map((item) => {
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.doctorCard}
                            onPress={() => doctorInfo(item.id)}
                        >
                            <FontAwesome
                                name="user-doctor"
                                size={60}
                                color="#3b3b3b"
                                style={{ marginHorizontal: 10 }}
                            />
                            <View style={{ marginHorizontal: 15 }}>
                                <Text style={{ fontSize: 20, fontWeight: "600" }}>
                                    {item.name}
                                </Text>
                                <Text style={{ fontSize: 15, fontWeight: "300" }}>
                                    {item.specialty}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View style={styles.modalView}>
                    <View>
                        {doctorsDetails.map((item) => {
                            return (
                                <View key={item.id} style={{}}>
                                    <View style={styles.modalBtns}>
                                        <TouchableOpacity
                                            style={{ margin: 10 }}
                                            onPress={() => deleteInfo(item.id)}
                                        >
                                            <FontAwesome name="trash-can" size={25} color="#800000" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ margin: 10 }} onPress={editInfo}>
                                            <FontAwesome
                                                name="pen-to-square"
                                                size={25}
                                                color="#800000"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <Text
                                        style={{
                                            textAlign: "center",
                                            fontSize: 20,
                                            fontWeight: "600",
                                            color: "#492323ff",
                                        }}
                                    >
                                        {item.name}
                                    </Text>
                                    <Text
                                        style={{
                                            textAlign: "center",
                                            fontSize: 16,
                                            fontWeight: "400",
                                            color: "#492323ff",
                                        }}
                                    >
                                        {item.specialty}
                                    </Text>
                                    <Text
                                        style={{
                                            textAlign: "center",
                                            fontSize: 16,
                                            fontWeight: "400",
                                            color: "#492323ff",
                                        }}
                                    >
                                        {item.contactNumber}
                                    </Text>
                                    <Text
                                        style={{
                                            textAlign: "center",
                                            fontSize: 16,
                                            fontWeight: "400",
                                            color: "#492323ff",
                                        }}
                                    >
                                        {item.address}
                                    </Text>
                                    <Text
                                        style={{
                                            textAlign: "center",
                                            fontSize: 16,
                                            fontWeight: "400",
                                            color: "#492323ff",
                                        }}
                                    >
                                        {item.prescription}
                                    </Text>
                                    <Text
                                        style={{
                                            textAlign: "center",
                                            fontSize: 16,
                                            fontWeight: "400",
                                            color: "#492323ff",
                                        }}
                                    >
                                        Last Visited:
                                        {item.lastVisited}
                                    </Text>
                                    <Text
                                        style={{
                                            textAlign: "center",
                                            fontSize: 16,
                                            fontWeight: "400",
                                            color: "#492323ff",
                                        }}
                                    >
                                        Next Visit:
                                        {item.nextVisit}
                                    </Text>
                                    <View
                                        style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-evenly",
                                            marginVertical: 20,
                                        }}
                                    >
                                        {/* <TouchableOpacity
                                            onPress={() => triggerCall(item.contactNumber)}
                                        >
                                            <FontAwesome
                                                name="square-phone"
                                                size={40}
                                                color="#800000"
                                            />
                                        </TouchableOpacity> */}
                                        <TouchableOpacity
                                            onPress={() =>
                                                shareDoctorDetails(
                                                    item.name,
                                                    item.specialty,
                                                    item.contactNumber,
                                                    item.address
                                                )
                                            }
                                        >
                                            <FontAwesome
                                                name="share-nodes"
                                                size={40}
                                                color="#800000"
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                                            <FontAwesome name="xmark" size={40} color="#800000" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </Modal>
            <TouchableOpacity
                onPress={() =>
                    navigation.navigate("Add Doctor Information", { users })
                }
                style={styles.floatBtn}
            >
                <Text style={styles.btnText}>Add Doctor</Text>
            </TouchableOpacity>
            {/* <BannerAd ref={bannerRef} unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} /> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    doctorCard: {
        display: "flex",
        flexDirection: "row",
        margin: 10,
        borderWidth: 1,
        borderColor: "#800000",
        padding: 10,
        borderRadius: 10,
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalBtns: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        borderBottomWidth: 2,
        borderBottomColor: "#800000",
    },
    modalTitle: {
        margin: 5,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "600",
        color: "#800000",
    },
    modalText: {
        margin: 5,
        textAlign: "center",
        fontSize: 15,
        color: "#800000",
    },
    floatBtn: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#800000",
        position: "absolute",
        borderRadius: 10,
        top: "80%",
        right: 30,
        padding: 3,
    },
    btnText: {
        color: "white",
        fontSize: 18,
        padding: 3,
    },
});
