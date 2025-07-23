import { useEffect, useState, useCallback, useRef } from "react";
import { Text, StyleSheet, TouchableOpacity, SafeAreaView, View, Alert, Modal, ViewBase, Button } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import * as Calendar from 'expo-calendar';
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
    const [hasCalendarPermission, setHasCalendarPermission] = useState(false);

    useEffect(() => {
        (async () => {
            const {status} = await Calendar.requestCalendarPermissionsAsync();
            if (status === 'granted'){
                setHasCalendarPermission(true);
            } else {
                Alert.alert('Permission Denied', 'Calendar permission is required to add events.')
            }
        })();
    }, []);

    async function getDefaultCalendarSource(){
        const defaultCalendar = await Calendar.getDefaultCalendarAsync();
        return defaultCalendar.source;
    }

    async function createMedicationCalendar(){
        if(!hasCalendarPermission){
            Alert.alert('Permission Error', 'Cannot create calendar without permission.');
      return; 
        }

        try{
            const calendars = await Calendar.getCalendarAsync(Calendar.EntityTypes.EVENT);
             let medicationCalendar = calendars.find(
        (cal) => cal.title === 'Medlogs Reminders' && cal.accessLevel === Calendar.CalendarAccessLevel.OWNER
      );

      let newCalendarID;

      if(!medicationCalendar){
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

   return (
   <View style={styles.container}>
      <Text style={styles.header}>Expo Calendar Integration</Text>
      {hasCalendarPermission ? (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
   container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
});