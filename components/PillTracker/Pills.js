import { useCallback, useEffect, useState, useRef } from "react";
import { Text, StyleSheet, TouchableOpacity, View, Alert, Modal, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-4558946228793580/5407601006';


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
  const userID = userInfo[0].id;
  const [medicationList, setMedicationList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [medId, setMedID] = useState("")
  const [selectedMed, setSelectedMed] = useState([])
  const bannerRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      fetchMeds();
    }, [])
  );

  useEffect(() => {
    fetchMeds();
  }, []);

  useEffect(() => {
    const setupNotifications = async () => {
      await scheduleMedicineNotifications(medicationList)
    };
    if (medicationList.length > 0) {
      setupNotifications()
    }
  }, [medicationList])

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // function getNextTriggerDate(timeString, weekday) {
  //   const [hour, minute] = timeString.split(":").map(Number);

  //   let trigger = new Date();
  //   trigger.setHours(hour);
  //   trigger.setMinutes(minute);
  //   trigger.setSeconds(0);

  //   trigger.setDate(trigger.getDate() + ((7 + weekday - trigger.getDay()) % 7));

  //   return trigger;
  // }

  //Store active notification IDs:
  // const scheduleNotificationIds = [];

  // async function scheduleMedicineNotifications(meds) {
  // await Notifications.cancelAllScheduledNotificationsAsync();

  //   for (const med of meds) {
  //     const { medicineName, startDate, endDate } = med;

  //     const start = new Date(startDate);
  //     const end = new Date(endDate);

  //     //Weekday mapping
  //     const weekdays = [
  //       { key: "sunday", value: med.sunday, jsDay: 0 },
  //       { key: "monday", value: med.monday, jsDay: 1 },
  //       { key: "tuesday", value: med.tuesday, jsDay: 2 },
  //       { key: "wednesday", value: med.wednesday, jsDay: 3 },
  //       { key: "thursday", value: med.thursday, jsDay: 4 },
  //       { key: "friday", value: med.friday, jsDay: 5 },
  //       { key: "saturday", value: med.saturday, jsDay: 6 },
  //     ];

  //     //All possible times
  //     const timeSlots = [
  //       "BeforeBreakfast",
  //       "AfterBreakfast",
  //       "BeforeLunch",
  //       "AfterLunch",
  //       "BeforeDinner",
  //       "AfterDinner",
  //     ];

  //     for (const timeKey of timeSlots) {
  //       if (med[timeKey]) {
  //         //Loop over weekdays
  //         weekdays.forEach(async (day) => {
  //           if (day.value === 1) {
  //             const triggerDate = getNextTriggerDate(med[timeKey], day.jsDay);

  //             //Only schedule if within start-end date range
  //             if (triggerDate >= start && triggerDate <= end) {
  //               await Notifications.scheduleNotificationAsync({
  //                 content: {
  //                   title: "💊 Medicine Reminder",
  //                   body: `${medicineName} - ${timeKey.replace(/([A-Z])/g, " $1")}`,
  //                   sound: "default",
  //                 },
  //                 trigger: {
  //                   hour: Number(med[timeKey].split(":")[0]),
  //                   minute: Number(med[timeKey].split(":")[1]),
  //                   weekday: day.jsDay === 0 ? 7 : day.jsDay,
  //                   repeats: true,
  //                 }
  //               });
  //               scheduleMedicineNotifications.push(id);
  //             }
  //           }
  //         });
  //       }
  //     }
  //     //Cancel notification after end date
  //     const endDateCancel = new Date(end);
  //     endDateCancel.setHours(23, 59, 0, 0);

  //     await Notifications.scheduleNotificationAsync({
  //       content: {
  //         title: '⏹ Medicine Schedule Ended',
  //         body: `${medicineName} reminders have been stopped.`,
  //       },
  //       trigger: { type: 'date', date: endDateCancel }, // endDateCancel is a Date
  //     });

  //     //Actually cancel the notifications
  //     setTimeout(async () => {
  //       for (const id of scheduleNotificationIds) {
  //         await Notifications.cancelAllScheduledNotificationsAsync(id);
  //       }
  //     }, endDateCancel.getTime() - Date.now());
  //   }
  // }

  async function scheduleMedicineNotifications(medications) {
    const now = new Date();
    const notificationIds = []; // Array to store notification IDs

    for (const med of medications) {
      const startDate = new Date(med.startDate);
      const endDate = new Date(med.endDate);

      // Check if the current date is within the medication period
      if (now >= startDate && now <= endDate) {
        const daysOfWeek = [
          med.sunday,
          med.monday,
          med.tuesday,
          med.wednesday,
          med.thursday,
          med.friday,
          med.saturday,
        ];

        // Get today's day of the week (0-6 where 0 is Sunday)
        const today = now.getDay();

        if (daysOfWeek[today]) {
          // Schedule notifications for the relevant times
          const times = [
            { time: med.AfterBreakfast, label: "After Breakfast" },
            { time: med.AfterDinner, label: "After Dinner" },
            { time: med.AfterLunch, label: "After Lunch" },
            { time: med.BeforeBreakfast, label: "Before Breakfast" },
            { time: med.BeforeDinner, label: "Before Dinner" },
            { time: med.BeforeLunch, label: "Before Lunch" },
          ];
          for (const { time, label } of times) {
            if (time) {
              const [hours, minutes] = time.split(":").map(Number);
              const notificationTime = new Date(now);
              notificationTime.setHours(hours, minutes, 0, 0);

              const hour = notificationTime.getHours();
              const min = notificationTime.getMinutes();

              // Only schedule future notifications
              if (notificationTime > now) {
                try {
                  const id = await Notifications.scheduleNotificationAsync({
                    content: {
                      title: `💊 Time to take your medication: ${med.medicineName}`,
                      body: `${label}`,
                    },
                    trigger: {
                      hour: hour,
                      minute: min,
                      repeats: true,
                    },
                  });
                  console.log("Notification ID on scheduling", id);
                  notificationIds.push(id); // Store the notification ID
                } catch (error) {
                  console.error("Error scheduling notification:", error);
                }
              }
            }
          }
        }
      }
    }

    return notificationIds; // Return all notification IDs
  }

  const fetchMeds = async () => {
    const response = await db.getAllAsync(
      `SELECT * FROM medicine_list WHERE user_id = ?`,
      [userID]
    );

    const todayKey = getTodayKey(); // e.g. "monday"
    const today = new Date();

    const filtered = response.filter(med => {
      // check if medicine is active for today (day = 1)
      const isToday = med[todayKey] === 1;

      // check if today is within startDate and endDate
      const start = new Date(med.startDate);
      const end = new Date(med.endDate);
      const inDateRange = today >= start && today <= end;

      return isToday && inDateRange;
    });

    setMedicationList(filtered);
  };

  const getTodayKey = () => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[new Date().getDay()];
  };


  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const duration = end - start;
    const durationDays = Math.ceil(duration / (1000 * 60 * 60 * 24));

    return durationDays
  }

  const displayDeleteModal = (id) => {
    setModalVisible(true);
    setMedID(id)
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

  const today = new Date();

  const weekday = today.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., Monday
  const date = today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const EditMedicine = async (id) => {
    const result = await db.getAllAsync(`SELECT * FROM medicine_list WHERE id = ? AND user_id = ?`, [id, userID]);
    setSelectedMed(result);
    await navigation.navigate("Edit Medicine", result)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{date}</Text>
      <Text style={styles.header2}>Your Medication Schedule for {weekday}</Text>
      <ScrollView style={styles.scrollArea} >
        {medicationList.map((item, index) => {
          return (
            <View key={index} style={styles.tiles}>
              <Text style={styles.textStyle1}>{item.medicineName}</Text>
              <Text style={styles.textStyle2}>Started on: <Text style={styles.textStyle3}>{item.startDate.split("-").reverse().join("-")}</Text></Text>
              <Text style={styles.textStyle2}>Duration:
                <Text style={styles.textStyle3}> {calculateDuration(item.startDate, item.endDate)} Days</Text>
              </Text>
              <View style={{ display: "flex", flexDirection: "row" }}>
                <View>
                  <Text style={styles.textStyle2}>Timings:</Text>
                </View>
                <View style={styles.timings}>
                  <Text style={[styles.textStyle3, item.BeforeBreakfast ? { display: "flex" } : { display: "none" }]}>{item.BeforeBreakfast ? "Before Breakfast" : ""}</Text>
                  <Text style={[styles.textStyle3, item.AfterBreakfast ? { display: "flex" } : { display: "none" }]}>{item.AfterBreakfast ? "After Breakfast" : ""}</Text>
                  <Text style={[styles.textStyle3, item.BeforeLunch ? { display: "flex" } : { display: "none" }]}>{item.BeforeLunch ? "Before Lunch" : ""}</Text>
                  <Text style={[styles.textStyle3, item.AfterLunch ? { display: "flex" } : { display: "none" }]}>{item.AfterLunch ? "After Lunch" : ""}</Text>
                  <Text style={[styles.textStyle3, item.BeforeDinner ? { display: "flex" } : { display: "none" }]}>{item.BeforeDinner ? "Before Dinner" : ""}</Text>
                  <Text style={[styles.textStyle3, item.AfterDinner ? { display: "flex" } : { display: "none" }]}>{item.AfterDinner ? "After Dinner" : ""}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => EditMedicine(item.id)} >
                  <FontAwesome name="pen-to-square" size={25} color="#800000" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => displayDeleteModal(item.id)}>
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
                      <Text style={styles.modalActionText} onPress={deleteMed}>Yes</Text>
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
      </ScrollView>
      <TouchableOpacity
        onPress={() => navigation.navigate("Add Medicine", { users })}
        style={styles.floatBtn}
      >
        <Text style={styles.btnText}>Add Medicine</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("All Medicines", { users })}
        style={styles.floatBtnList}
      >
        <Text style={styles.btnText}>List All Medicine</Text>
      </TouchableOpacity>
      <BannerAd ref={bannerRef} unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
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
  },
  statusText: {
    fontSize: 16,
    marginBottom: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'semibold',
    color: "gray",
    textAlign: 'right',
  },
  header2: {
    marginVertical: 10,
    fontStyle: "italic",
    fontSize: 20,
    fontWeight: 'semibold',
    color: "black",
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
    marginRight: 5
  },
  textStyle3: {
    fontWeight: 'bold',
    color: '#444',
    fontSize: 16,
  },
  timings: {
    display: "flex",
    flexDirection: 'column'
  },
  floatBtn: {
    backgroundColor: '#800000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    position: 'absolute',
    bottom: 130,
    right: 20,
    elevation: 4,
  },
  floatBtnList: {
    backgroundColor: '#800000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    position: 'absolute',
    bottom: 130,
    left: 20,
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