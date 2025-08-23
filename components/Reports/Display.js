import {
  View,
  Image,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useState, useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import * as MediaLibrary from "expo-media-library";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { shareAsync } from "expo-sharing";
import { useNavigation } from "@react-navigation/native";

export default function Display({ route }){
    const { uri, doctor, notes, id } = route.params;
    return(
        <SQLiteProvider databaseName="Medlogs.db">
            <DisplayedImages uri={uri} doctor={doctor} notes={notes} id={id}/>
        </SQLiteProvider>
    )
}
export function DisplayedImages(items) {
  console.log(items)
  const db = useSQLiteContext();
  const [permission, setPermission] = useState(null);
  const navigation = useNavigation();
  const [doctor, ] = useState(items.doctor);
  const [imageId, ] = useState(items.imageId);
  const [notes, ] = useState(items.notes);
  const [url, ] = useState(items.uri)

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setPermission(status === "granted");
    })();
  }, []);

  const handleDelete = async () => {
    if (!permission) {
      Alert.alert(
        "Permission Denied",
        "You need to grant media library permissions first."
      );
      return;
    }

    if (!url) {
      Alert.alert("Invalid URI", "Please provide a valid URI.");
      return;
    }

    try {
      const assets = await MediaLibrary.getAssetsAsync({ url });

      if (assets.assets.length === 0) {
        Alert.alert("No asset found with provided URI");
        return;
      }

      const assetId = assets.assets[0].id;

      await MediaLibrary.deleteAssetsAsync([assetId]);
      await db.runAsync("DELETE FROM diagnosticReports WHERE id = ?", [imageId])
      Alert.alert("Image Deleted");
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting image:", error);
      Alert.alert("Error", "Failed to delete image");
    }
  };
  const handleShare = () => {
    shareAsync(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={{uri: url}} style={styles.image} />
      <Text style={styles.imageText}>Advised by: <Text style={{fontWeight: "bold"}}>{doctor}</Text></Text>
      <Text style={styles.imageText}>Notes: <Text style={{fontWeight:"bold"}}>{notes}</Text></Text>
      <View style={{ display: "flex", flexDirection: "row" }}>
        <TouchableOpacity
          style={{ margin: 10, padding: 10, elevation: 18 }}
          onPress={handleDelete}
        >
          <FontAwesome name="trash-can" size={30} color="#800000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ margin: 10, padding: 10, elevation: 18 }}
          onPress={handleShare}
        >
          <FontAwesome name="share-nodes" size={30} color="#800000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  image: {
    width: "95%",
    height: "80%",
    margin: 10,
    objectFit: "contain",
  },
  imageText: {
    fontSize: 15,
  },
});
