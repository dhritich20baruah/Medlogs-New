import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ImageBackground } from "react-native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";

export default function BMIScreen({ route }) {
  const { users } = route.params;
  return (
    <SQLiteProvider databaseName="Medlogs.db">
      <BMICalculator users={users} />
    </SQLiteProvider>
  )
}

export function BMICalculator(users) {
  const db = useSQLiteContext();
  const userInfo = users.users;
  const [currentBMI, setCurrentBMI] = useState(null);
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [newBMI, setNewBMI] = useState(null);
  const [newCategory, setNewCategory] = useState("");

  // Fetch latest BMI from database
  useEffect(() => {
    // Example static data, replace with SQLite query
    const dbWeight = userInfo[0].weight; // from DB
    const dbHeight = userInfo[0].height; // from DB (cm)
    const bmiValue = calculateBMI(dbWeight, dbHeight);
    setCurrentBMI(bmiValue);
    setCategory(getBMICategory(bmiValue));
    setDate(new Date().toLocaleDateString());
  }, []);

  function calculateBMI(weight, heightCm) {
    const heightM = heightCm / 100;
    return (weight / (heightM * heightM)).toFixed(1);
  }

  function getBMICategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }

  function handleNewCalculation() {
    if (!weight || !height) return;
    const bmiValue = calculateBMI(parseFloat(weight), parseFloat(height));
    setNewBMI(bmiValue);
    setNewCategory(getBMICategory(bmiValue));
  }

  return (
    <ScrollView style={styles.container}>
      {/* Section 1: Current BMI */}
      <Text style={styles.heading}>Your Current BMI</Text>
      <View style={styles.card}>
        <Text style={styles.bmiValue}>{currentBMI ?? "--"}</Text>
        <Text style={styles.bmiCategory}>{category}</Text>
        <Text style={styles.dateText}>Measured on: {date}</Text>
      </View>

      {/* Section 2: New BMI */}
      <Text style={styles.heading}>Calculate New BMI</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Weight (kg)"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
        <TextInput
          style={styles.input}
          placeholder="Height (cm)"
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
        />
        <TouchableOpacity style={styles.button} onPress={handleNewCalculation}>
          <Text style={styles.buttonText}>Calculate</Text>
        </TouchableOpacity>
        {newBMI && (
          <View style={styles.result}>
            <Text style={styles.bmiValue}>{newBMI}</Text>
            <Text style={styles.bmiCategory}>{newCategory}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a24848ff",
    padding: 16,
  },
  heading: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },
  bmiValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#800000",
    textAlign: "center",
  },
  bmiCategory: {
    fontSize: 18,
    color: "#800000",
    textAlign: "center",
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#800000",
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    fontSize: 16,
    color: "#800000",
  },
  button: {
    backgroundColor: "#800000",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  result: {
    marginTop: 12,
    alignItems: "center",
  },
});
