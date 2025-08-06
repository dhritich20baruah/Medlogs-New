import { useEffect, useState } from "react";
import { Text, StyleSheet, TouchableOpacity, SafeAreaView, View, Alert, Modal, Button } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Calendar from 'expo-calendar';
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";

export default function Pills({ route }) {
  const { users } = route.params;
  return (
    <SQLiteProvider databaseName="Medlogs.db">
      <Medicine users={users} />
    </SQLiteProvider>
  )
}

export function Medicine(users) {
  const db = useSQLiteContext();
  const navigation = useNavigation()
  const userInfo = users.users;
  const [hasCalendarPermission, setHasCalendarPermission] = useState(false);
  const userID = userInfo[0].id;
  const [medicationList, setMedicationList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        setHasCalendarPermission(true);
      } else {
        Alert.alert('Permission Denied', 'Calendar permission is required to add events.')
      }
    })();
    fetchMeds();
  }, []);

  async function getDefaultCalendarSource() {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    return defaultCalendar.source;
  }

  async function createMedicationCalendar() {
    if (!hasCalendarPermission) {
      Alert.alert('Permission Error', 'Cannot create calendar without permission.');
      return;
    }

    try {
      const calendars = await Calendar.getCalendarAsync(Calendar.EntityTypes.EVENT);
      let medicationCalendar = calendars.find(
        (cal) => cal.title === 'Medlogs Reminders' && cal.accessLevel === Calendar.CalendarAccessLevel.OWNER
      );

      let newCalendarID;

      if (!medicationCalendar) {
        const defaultCalendarSource = Platform.OS === 'ios'
          ? await getDefaultCalendarSource()
          : { isLocalAccount: true, name: 'Medlogs Reminders' };

        newCalendarID = await Calendar.createCalendarAsync({
          title: 'Medlogs Reminders',
          color: '#2196F3', // A nice blue color
          entityType: Calendar.EntityTypes.EVENT,
          sourceId: defaultCalendarSource.id,
          source: defaultCalendarSource,
          name: 'Medlogs Reminders',
          ownerAccount: 'personal', // For Android
          accessLevel: Calendar.CalendarAccessLevel.OWNER,
        });
        console.log(`New calendar created with ID: ${newCalendarID}`);
      } else {
        newCalendarID = medicationCalendar.id;
        console.log(`Using existing calendar with ID: ${newCalendarID}`);
      }
      return newCalendarID;
    } catch (e) {
      console.error("Failed to create/get calendar:", e);
      Alert.alert("Error", "Could not create or find calendar.");
      return null;
    }
  }

  async function addMedicationEvent(calendarId, medicationName, dosage, date, time) {
    if (!hasCalendarPermission || !calendarId) {
      Alert.alert('Error', 'Missing calendar permission or ID.');
      return;
    }

    try {
      const startDateTime = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);

      const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30 minutes later

      const eventId = await Calendar.createEventAsync(calendarId, {
        title: `Take ${medicationName}`,
        startDate: startDateTime,
        endDate: endDateTime,
        notes: `Dosage: ${dosage}`,
        alarms: [{ relativeOffset: -15 }], // 15 minutes before
        allDay: false,
        location: 'Your Location (optional)',
      });
      Alert.alert('Success', `Medication event "${medicationName}" added to calendar! Event ID: ${eventId}`);
      console.log('Event created with ID:', eventId);
    } catch (e) {
      console.error("Failed to create event:", e);
      Alert.alert("Error", `Could not add event: ${e.message}`);
    }
  }

  const fetchMeds = async () => {
    const response = await db.getAllAsync(`select * from medicine_list where user_id = ?`, [userID])
    setMedicationList(response)
    console.log(response)
  }

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const duration = end - start;
    const durationDays = Math.ceil(duration / (1000 * 60 * 60 * 24));

    return durationDays
  }

  const deleteMed = async (id) => {
    try {
      await db.runAsync("DELETE FROM medicine_list WHERE id=?", [id])
      Alert.alert("Deleted")
      fetchMeds()
    } catch (error) {
      console.error(error)
    }
  }

  const EditMedicine = () => {
    setModalVisible(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Medication Schedule</Text>
      {/* {hasCalendarPermission ? (
        <>
          <Text style={styles.statusText}>Calendar permission granted!</Text>
          <Button
            title="Add Test Medication Reminder"
            onPress={async () => {
              const calendarId = await createMedicationCalendar();
              if (calendarId) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1); // Tomorrow's date
                await addMedicationEvent(calendarId, 'Ibuprofen', '200mg', tomorrow.toISOString().split('T')[0], '09:00');
              }
            }}
          />
        </>
      ) : (
        <Text style={styles.statusText}>Waiting for calendar permission...</Text>
      )} */}
      <View >
        {medicationList.map((item, index) => {
          return (
            <View key={index} style={styles.tiles}>
              <Text style={styles.textStyle1}>{item.medicineName}</Text>
              <Text style={styles.textStyle2}>Started on: <Text style={styles.textStyle3}>{item.startDate.split("-").reverse().join("-")}</Text></Text>
              <Text style={styles.textStyle2}>Duration:
                <Text style={styles.textStyle3}>{calculateDuration(item.startDate, item.endDate)} Days</Text> </Text>
              <Text style={styles.textStyle2}>Timings: 
                <View style={styles.timings}>
                  <Text style={styles.textStyle3}>{item.BeforeBreakfast ? "Before Breakfast" : ""}</Text>
                  <Text style={styles.textStyle3}>{item.AfterBreakfast ? "After Breakfast" : ""}</Text>
                  <Text style={styles.textStyle3}>{item.BeforeLunch ? "Before Lunch" : ""}</Text>
                  <Text style={styles.textStyle3}>{item.AfterLunch ? "After Lunch" : ""}</Text>
                  <Text style={styles.textStyle3}>{item.BeforeDinner ? "Before Dinner" : ""}</Text>
                  <Text style={styles.textStyle3}>{item.AfterDinner ? "After Dinner" : ""}</Text>
                </View>
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={EditMedicine}>
                  <FontAwesome name="pen-to-square" size={25} color="#800000" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <FontAwesome name="trash" size={25} color="#800000" />
                </TouchableOpacity>
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
          <Text style={styles.modalTitle}>Are you sure you want to delete?</Text>
          <View style={styles.modalBtns}>
            <TouchableOpacity style={[styles.modalAction, { backgroundColor: "red" }]}>
            <Text style={styles.modalActionText} onPress={()=>deleteMed(item.id)}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalAction, { backgroundColor: "green" }]}>
            <Text style={styles.modalActionText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
            </View>
          )
        })}
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate("Add Medicine", { users })}
        style={styles.floatBtn}
      >
        <Text style={styles.btnText}>Add Medicine +</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff"
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
  textStyle1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#800000',
    marginBottom: 8,
  },
  textStyle2: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  textStyle3: {
    fontWeight: 'bold',
    color: '#444',
  },
  timings:{
    display: "flex",
    flexDirection: 'column'
  },
  floatBtn: {
    backgroundColor: '#800000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    position: 'absolute',
    bottom: 70,
    right: 20,
    elevation: 4,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 16,
  },
  saveBtnContainer: {
    margin: 10,
    padding: 10,
    borderRadius: 50,
    backgroundColor: "orange",
  },
  saveBtn: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  modalView: {
    margin: 20,
    backgroundColor: "#fffeee",
    borderRadius: 20,
    padding: 20,
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
    justifyContent: "space-evenly",
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
  modalAction: {
    fontSize: 15,
    padding: 10,
    borderRadius: 25,
    width: 75,
  },
  modalActionText: {
    textAlign: "center",
    fontWeight: "400",
    color: "white"
  }
});