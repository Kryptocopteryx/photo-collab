import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { Image } from "expo-image";
import React, { useRef, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ 
          textAlign: "center",
          color: "#AEEFE1",
          fontSize: 16,
          marginBottom: 5
        }}>
          Photo-Collab benötigt deine Erlaubnis, die Kamera zu verwenden
        </Text>
        <Button onPress={requestPermission} title="Zugriff erlauben" />
      </View>
    );
  }

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    setUri(photo?.uri ?? null);
    console.log({ photo });
  };

  const pickAndUploadImage = async () => {
    try {
      // Step 1: Let user pick an image
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1, // or >1 for multiple
      });

      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      const image = result.assets?.[0];

      if (image && image.uri)
      {
        uploadImage(image.uri)
      }
    } catch (error) {
      console.error('Error picking or uploading image:', error);
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const saveImage = async (imageUri: string) => {
    const link = document.createElement('a');
    link.href = imageUri;
    link.download = 'photo.jpg';
    link.click();
  }

  const uploadImage = async (imageUri: string) => {
    const path = '/upload-image';
    console.log(`Trying to write to ${path}:\n ${imageUri}`);

    try {
      const response = await fetch(path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageUri,
        }),
      });
  
      const result = await response.json();
      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }

  const renderPicture = () => {
    if (uri != null) {
      return (
        <View style={{ 
          width: "100%",
          justifyContent: "center",
          alignItems: "center"
        }}>
         <Image
            source={{ uri }}
            contentFit="contain"
            style={{ 
              width: "90%", 
              aspectRatio: 1,
            }}
          />
          <View style={{
            width: "80%",
            flexDirection: "row",
            justifyContent: "space-between",
          }}>
            <Pressable onPress={() => { setUri(null); }}>
              <Feather name="trash-2" size={32} color="#AEEFE1" />
            </Pressable>
            <Pressable 
              onPress={() => {
              saveImage(uri);
              uploadImage(uri);
              setUri(null); 
            }}>
              <Feather name="upload-cloud" size={32} color="#AEEFE1" />
            </Pressable>
          </View>       
        </View>
      );
    }
    else return
  };

  const renderCamera = () => {
    return (
      <CameraView
        style={styles.camera}
        ref={ref}
        mode={"picture"}
        facing={facing}
        mute={false}
        responsiveOrientationWhenOrientationLocked
      >
        <View style={styles.shutterContainer}>
          <Pressable onPress={pickAndUploadImage}>
            <AntDesign name="picture" size={32} color="white" />
          </Pressable>
          <Pressable onPress={takePicture}>
            {({ pressed }) => (
              <View
                style={[
                  styles.shutterBtn,
                  {
                    opacity: pressed ? 0.5 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.shutterBtnInner,
                    { backgroundColor:"white" },
                  ]}
                />
              </View>
            )}
          </Pressable>
          <Pressable onPress={toggleFacing}>
            <FontAwesome6 name="rotate-left" size={32} color="white" />
          </Pressable>
        </View>
      </CameraView>
    );
  };

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : renderCamera()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#51101E",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
});