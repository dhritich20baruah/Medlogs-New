import { useState, useRef } from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-4558946228793580/5407601006';

export default function History({ route }) {
  const { users } = route.params
  return (
    <SQLiteProvider databaseName="Medlogs.db">
      <HistoryScreen users={users} />
    </SQLiteProvider>
  )
}

export function HistoryScreen(users) {
  const db = useSQLiteContext();
  const userID = users.users[0].id;
  const [pillsArr, setPillsArr] = useState([]);
  const [sugarArr, setSugarArr] = useState([]);
  const [pressureArr, setPressureArr] = useState([]);
  const [visible, setVisible] = useState(false)
  const [showDate, setShowDate] = useState(false);
  const [date, setDate] = useState(new Date());

  const bannerRef = useRef(null);

  const toggleShowDate = () => {
    setShowDate(!showDate);
  };

  const handleDate = (e, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate); // make sure you store the picked date
    let dateString = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
    fetchHistory(dateString);
    toggleShowDate();
    setVisible(!visible)
  };

  const fetchHistory = async (day) => {

    const medList = await db.getAllAsync(
      "SELECT * FROM medicine_list WHERE user_id = ? AND startDate <= ? AND endDate >= ?",
      [userID, day, day]
    );
    setPillsArr(medList);

    const bloodSugar = await db.getAllAsync(
      "SELECT * FROM blood_sugar WHERE user_id = ? AND date = ?",
      [userID, day.split("-").reverse().join("-")]
    );
    setSugarArr(bloodSugar);

    const bloodPressure = await db.getAllAsync(
      "SELECT * FROM blood_pressure WHERE user_id = ? AND date = ?",
      [userID, day.split("-").reverse().join("-")]
    );
    setPressureArr(bloodPressure);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View>
          <Text style={styles.textStyle}>
            Pick a date. By clicking on the date below.
          </Text>
          <TouchableOpacity onPress={toggleShowDate} style={styles.dateCard}>
            <Text style={styles.textStyleSecondary}>{date.toDateString()}</Text>
          </TouchableOpacity>
          {showDate && (
            <DateTimePicker
              value={date}
              mode={"date"}
              is24Hour={true}
              display="spinner"
              onChange={handleDate}
            />
          )}
        </View>
        {!visible ?
          <View></View>
          :
          <View>
            <Text style={styles.title}>
              Your activities are:
            </Text>
            {/* Medicines */}
            {pillsArr.length == 0 ? (
              <View style={styles.card}>
                <Text style={styles.title2}>
                  There is no record of you taking any medicine that day.
                </Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.title2}>You took the following medicines:</Text>
                {pillsArr.map((pill) => {
                  return (
                    <View key={pill.id} style={styles.pillContainer}>
                      <Text style={styles.medName}>{pill.medicineName}</Text>
                      <View style={styles.timings}>
                        <View>
                          {pill.BeforeBreakfast ? (
                            <Text style={styles.medName}>
                              Before Breakfast: {pill.BeforeBreakfast}
                            </Text>
                          ) : (
                            <View></View>
                          )}
                        </View>
                        <View>
                          {pill.AfterBreakfast ? (
                            <Text style={styles.medName}>
                              After Breakfast: {pill.AfterBreakfast}
                            </Text>
                          ) : (
                            <View></View>
                          )}
                        </View>
                        <View>
                          {pill.BeforeLunch ? (
                            <Text style={styles.medName}>
                              Before Lunch: {pill.BeforeLunch}
                            </Text>
                          ) : (
                            <View></View>
                          )}
                        </View>
                        <View>
                          {pill.AfterLunch ? (
                            <Text style={styles.medName}>
                              After Lunch: {pill.AfterLunch}
                            </Text>
                          ) : (
                            <View></View>
                          )}
                        </View>
                        <View>
                          {pill.BeforeDinner ? (
                            <Text style={styles.medName}>
                              Before Dinner: {pill.BeforeDinner}
                            </Text>
                          ) : (
                            <View></View>
                          )}
                        </View>
                        <View>
                          {pill.AfterDinner ? (
                            <Text style={styles.medName}>
                              After Dinner: {pill.AfterDinner}
                            </Text>
                          ) : (
                            <View></View>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
            {/* Blood Pressure */}
            {pressureArr.length == 0 ? (
              <View style={styles.card}>
                <Text style={styles.title2}>
                  You did not record your blood pressure values.
                </Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.title2}>
                  Your recorded blood pressure readings are:
                </Text>
                {pressureArr.map((values) => {
                  return (
                    <View key={values.id} style={styles.recordContainer}>
                      <View style={styles.recordItem}>
                        <Text style={styles.recordLabel}>Systolic</Text>
                        <Text style={styles.recordValue}>
                          {values.systolic}
                        </Text>
                        <Text style={styles.recordValue}>mmHg</Text>
                      </View>
                      <View style={styles.recordItem}>
                        <Text style={styles.recordLabel}>Diastolic</Text>
                        <Text style={styles.recordValue}>
                          {values.diastolic}
                        </Text>
                        <Text style={styles.recordValue}>mmHg</Text>
                      </View>
                      <View style={styles.recordItem}>
                        <Text style={styles.recordLabel}>Pulse</Text>
                        <Text style={styles.recordValue}>
                          {values.pulse}
                        </Text>
                        <Text style={styles.recordValue}>BPM</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
            {/* Blood Sugar */}
            {sugarArr.length == 0 ? (
              <View style={styles.card}>
                <Text style={styles.title2}>
                  You did not record your blood sugar values.
                </Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.title2}>
                  Your recorded blood sugar values are:
                </Text>
                {sugarArr.map((values) => {
                  return (
                    <View key={values.id} style={styles.sugarContainer}>
                      <Text style={styles.sugartestText}>{values.test_type} :</Text>
                      <Text style={styles.sugarValueText}>
                        {values.sugar_value} mg/dL
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        }

      </View>
      <View style={{marginTop: 20}}>
          <BannerAd ref={bannerRef} unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}/>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 50
  },
  dateCard:{
     flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#800000",
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  textStyle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#800000",
    margin: 10,
    textAlign: "center",
  },
  textStyleSecondary: {
    fontSize: 18, fontWeight: "600", color: "#800000", marginRight: 8
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
    margin: 10,
  },
  title2: {
    fontWeight: "600",
    fontSize: 17,
    marginVertical: 10,
    color: "#800000"
  },
  pillContainer: {
    display: "flex",
    flexDirection: "row",
  },
  medName: {
    fontSize: 17,
    width: "30%",
    color: '#333',
    margin: 3
  },
  timings: {
    width: "70%",
    marginHorizontal: 10,
    margin: 3
  },
  modalText: {
    fontSize: 17,
    color: "white",
  },
  card: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 15
  },
  recordContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  recordItem: {
    flex: 1,
    alignItems: "center",
  },
  recordLabel: {
    color: "#444",
    marginBottom: 5,
    fontSize: 17
  },
  recordValue: {
    color: "#800000",
    fontSize: 18,
  },
  readingsText: {
    fontWeight: "bold",
    color: "#800000",
  },
  sugarContainer: {
    display: "flex",
    flexDirection: "row",
  },
  sugartestText: {
    fontSize: 16,
    marginHorizontal: 10,
    marginVertical: 5,
    width: '50%',
    color: '#444'
  },
  sugarValueText: {
    fontSize: 16,
    marginHorizontal: 10,
    marginVertical: 5,
    color: "#800000",
    fontWeight: "700",
    width: '50%'
  },
  image: {
    width: "90%",
    height: 400,
    margin: 10,
    objectFit: "contain",
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 10
  },
  reportsText: {
    fontSize: 15,
    color: '#333',
    marginHorizontal: 5
  }
});