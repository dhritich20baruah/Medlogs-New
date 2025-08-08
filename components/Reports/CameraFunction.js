import { StatusBar } from "expo-status-bar";
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    Alert,
    Image,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { CameraView, Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import Slider from "@react-native-community/slider";

export default function CameraFunction({ route }) {
    const { users } = route.params;
    return (
        <SQLiteProvider databaseName="Medlogs.db">
            <Snap users={users}/>
        </SQLiteProvider>
    )
}

export function Snap(users) {
    const db = useSQLiteContext();
    const userInfo = users.users;
    const userID = userInfo.users[0].id;
    let cameraRef = useRef();
    const [hasCameraPermission, setHasCameraPermission] = useState();
    const [hasMediaLibPermit, setHasMediaLibPermit] = useState();
    const [photo, setPhoto] = useState();
    const [cameraMode, setCameraMode] = useState("picture")
    const [zoom, setZoom] = useState(0);
    const [doctor, setDoctor] = useState("");
    const [notes, setNotes] = useState("");
    const [flashMode, setFlashMode] = useState("on");

    useEffect(() => {
        (async () => {
            const cameraPermission = await Camera.requestCameraPermissionsAsync();
            const mediaLibraryPermission =
                await MediaLibrary.requestPermissionsAsync();
            setHasCameraPermission(cameraPermission.status === "granted");
            setHasMediaLibPermit(mediaLibraryPermission.status === "granted");
        })();
    }, []);

    const toggleFlash = () => {
        setFlashMode(
            (current) => (current === "on" ? "off" : "on")
        );
    };

    if (hasCameraPermission === undefined) {
        return <Text>Requesting permission....</Text>;
    } else if (!hasCameraPermission) {
        return (
            <Text>
                Permission for camera not granted. Please change this in settings
            </Text>
        );
    }

    let takePic = async () => {
        let options = {
            quality: 1,
            base64: true,
            exif: false,
        };

        let newPhoto = await cameraRef.current.takePictureAsync(options);
        setPhoto(newPhoto);
    };

    if (photo) {
        let savePhoto = async () => {
            const asset = await MediaLibrary.createAssetAsync(photo.uri);
            let dateString = new Date().toISOString();
            let date = dateString
                .slice(0, dateString.indexOf("T"))
                .split("-")
                .reverse()
                .join("-");
            const response = await db.runAsync(`INSERT INTO diagnosticReports (user_id, date, uri, doctor, notes) values (?, ?, ?, ?, ?)`, [userID, date, asset.uri, doctor, notes])
            setNotes("");
            setDoctor("");
            Alert.alert("Image Saved");
            setPhoto(undefined);
        };

        return (
            <SafeAreaView style={styles.container}>
                <Image
                    style={styles.preview}
                    source={{ uri: "data:image/jpg;base64," + photo.base64 }}
                />
                <View>
                    <TextInput
                        style={styles.input}
                        placeholder="Advised by"
                        value={doctor}
                        onChangeText={setDoctor}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Notes"
                        value={notes}
                        onChangeText={setNotes}
                    />
                </View>
                <View style={styles.btnContainer}>
                    {hasMediaLibPermit ? (
                        <TouchableOpacity onPress={savePhoto} style={styles.btn}>
                            <FontAwesome name="floppy-disk" size={30} color="#800000" />
                        </TouchableOpacity>
                    ) : undefined}
                    <TouchableOpacity
                        onPress={() => setPhoto(undefined)}
                        style={styles.btn}
                    >
                        <FontAwesome name="trash-can" size={30} color="#800000" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                ref={cameraRef}
                flash={flashMode}
                mode={cameraMode}
                zoom={zoom}
            >
                <Slider
                    style={{ width: "100%", height: 40, position: "absolute", top: "75%" }}
                    minimumValue={0}
                    maximumValue={1}
                    minimumTrackTintColor="cyan"
                    maximumTrackTintColor="white"
                    value={zoom}
                    onValueChange={(value) => setZoom(value)}
                />
            </CameraView>
            <TouchableOpacity
                style={{
                    marginBottom: 20,
                    padding: 10,
                    backgroundColor: "white",
                    borderRadius: 5,
                    position: "absolute",
                    top: 5,
                    left: 5,
                }}
                onPress={toggleFlash}
            >
                <Text style={{ fontSize: 18 }}>
                    {flashMode === "on" ? (
                        <Ionicons
                            name="flash-outline"
                            size={25}
                            color="gray"
                            style={styles.btnText}
                        />
                    ) : (
                        <Ionicons
                            name="flash-off-outline"
                            size={25}
                            color="gray"
                            style={styles.btnText}
                        />
                    )}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraBtn}>
                <FontAwesome
                    name="camera"
                    size={50}
                    color="gray"
                    style={styles.btnText}
                    onPress={takePic}
                />
            </TouchableOpacity>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: "95%",
        width: "100%",
    },
    title: {
        fontWeight: "bold",
    },
    camera: {
        width: "100%",
        height: "90%",
    },
    preview: {
        alignSelf: "stretch",
        flex: 1,
        width: "auto",
    },
    input: {
        width: "90%",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#800000",
        marginHorizontal: 10,
    },
    btnContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    btn: {
        justifyContent: "center",
        margin: 10,
        elevation: 5,
    },
    btnText: {
        textAlign: "center",
        padding: 10,
    },
});
