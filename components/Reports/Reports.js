import { useState, useEffect, useCallback, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    TextInput,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as MediaLibrary from "expo-media-library";
import { useFocusEffect } from "@react-navigation/native";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

export default function Reports({ route }) {
    const { users } = route.params;
    return (
        <SQLiteProvider databaseName="Medlogs.db">
            <ReportGrid users={users} />
        </SQLiteProvider>
    )

}

export function ReportGrid(users) {
    const db = useSQLiteContext();
    const navigation = useNavigation()
    const userInfo = users.users;
    const userID = userInfo[0].id;
    const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
        useState(null);
    const [photos, setPhotos] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredPhotos, setFilteredPhotos] = useState([]);

    const toggleCamera = () => {
        navigation.navigate("Camera", { users });
    };

    useFocusEffect(
        useCallback(() => {
            fetchImages();
        }, [])
    );

    useEffect(() => {
        (async () => {
            const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
            setHasMediaLibraryPermission(mediaLibraryStatus.status === "granted");
        })();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await db.getAllAsync(`SELECT * FROM diagnosticReports WHERE user_id = ? ORDER BY id DESC`, [userID])
            setPhotos(response)
            setFilteredPhotos(response)
        } catch (error) {
            console.error(error)
        }
    };

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filteredData = photos.filter(
            (photo) =>
                photo.doctor.toLowerCase().includes(lowercasedQuery) ||
                photo.notes.toLowerCase().includes(lowercasedQuery)
        );
        setFilteredPhotos(filteredData);
    }, [searchQuery, photos]);

    if (hasMediaLibraryPermission === false) {
        return (
            <View>
                <Text>No access to media library</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search by Doctor's name or notes"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <FlatList
                data={filteredPhotos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("Image", item)
                        }
                    >
                        <Image source={{ uri: item.uri }} style={styles.photo} />
                    </TouchableOpacity>
                )}
                numColumns={3}
            />
            <TouchableOpacity onPress={toggleCamera} style={styles.floatBtn}>
                <Ionicons
                    name="camera-outline"
                    size={50}
                    color="white"
                    style={styles.btnText}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        margin: 10,
    },
    searchBar: {
        width: "100%",
        padding: 10,
        borderWidth: 1,
        borderColor: "#800000",
        borderRadius: 5,
        marginBottom: 10,
    },
    photo: {
        width: 115,
        height: 115,
        margin: 1,
        borderRadius: 5
    },
    floatBtn: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#800000",
        position: "absolute",
        borderRadius: 10,
        bottom: 80,
        right: 30,
        padding: 10,
        elevation: 15,
    },
    btnText: {
        color: "white",
        fontSize: 30,
        padding: 3,
    },
});
