import { useEffect, useState, useCallback, useRef } from "react";
import { Text, StyleSheet, TouchableOpacity, SafeAreaView, View, Alert, Modal, ViewBase, Button } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
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
  }

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const duration = end - start;
    const durationDays = Math.ceil(duration / (1000 * 60 * 60 * 24));

    return durationDays
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
              <Text style={styles.textStyle2}>Timings:  <Text style={styles.textStyle3}>{item.BeforeBreakfast?"Before Breakfast" : ""} {item.AfterBreakfast? "After Breakfast" : ""} {item.BeforeLunch ? "Before Lunch" : ""} {item.AfterLunch ? "After Lunch" : ""} {item.BeforeDinner ? "Before Dinner" : ""} {item.AfterDinner ? "After Dinner" : ""}</Text></Text>
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
  },
  tiles: {
    margin: 5,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#800000",
    shadowColor: "red",
    shadowOffset: {
      width: 25,
      height: 25,
    },
    shadowOpacity: 0.85,
    shadowRadius: 25,
    backgroundColor: "white"
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 10,
  },
  textStyle1: {
    color: "#800000", fontSize: 30, fontWeight: "bold"
  },
  textStyle2: {
    fontWeight: "bold", fontSize: 15
  },
  textStyle3: {
    color: "#800000", fontSize: 20
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