import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";

import {
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "../../firebase";

import { messagesCollection } from "../../firebase";
import NetInfo from "@react-native-community/netinfo";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

import { load, remove, save } from "../storage/storage"; 
import { launchImageLibrary } from "react-native-image-picker";   

type MessageType = {
  id: string;
  text?: string;
  image?: string;     
  user: string;
  createdAt: { seconds: number; nanoseconds: number } | null;
};

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

export default function ChatScreen({ route }: Props) {
  const { name } = route.params;

  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // ---------- IMAGE PICKER ----------
  const pickImage = () => {
    launchImageLibrary(
      { mediaType: "photo", quality: 0.8 },
      async (response) => {
        if (response.didCancel || !response.assets) return;

        const uri = response.assets[0].uri;

        const localMsg: MessageType = {
          id: Date.now().toString(),
          image: uri,             
          user: name,
          createdAt: {
            seconds: Date.now() / 1000,
            nanoseconds: 0,
          },
        };

        const updated = [...messages, localMsg];
        setMessages(updated);
        await save("chat", updated);

        if (isOnline) {
          await addDoc(messagesCollection, {
            image: uri,           
            user: name,
            createdAt: serverTimestamp(),
          });
        }
      }
    );
  };

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected === true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const loadMessagesOffline = async () => {
      const list = await load<MessageType[]>("chat");
      if (Array.isArray(list)) setMessages(list);
    };
    loadMessagesOffline();
  }, []);

  useEffect(() => {
    if (!isOnline) return;

    const q = query(messagesCollection, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const list: MessageType[] = [];
      snapshot.forEach((doc) => {
        list.push({
          id: doc.id,
          ...(doc.data() as Omit<MessageType, "id">),
        });
      });

      setMessages(list);
    });

    return () => unsub();
  }, [isOnline]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const localMsg: MessageType = {
      id: Date.now().toString(),
      text: message,
      user: name,
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    };

    const updated = [...messages, localMsg];
    setMessages(updated);
    setMessage("");
    await save("chat", updated);

    if (isOnline) {
      await addDoc(messagesCollection, {
        text: localMsg.text,
        user: name,
        createdAt: serverTimestamp(),
      });
    }
  };

  const renderItem = ({ item }: { item: MessageType }) => (
    <View
      style={[
        styles.msgBox,
        item.user === name ? styles.myMsg : styles.otherMsg,
      ]}
    >
      <Text style={styles.sender}>{item.user}</Text>

      {item.text ? <Text>{item.text}</Text> : null}

      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={{ width: 180, height: 180, marginTop: 5, borderRadius: 8 }}
        />
      ) : null}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
      />

      <View style={styles.inputRow}>
        <Button title="Image" onPress={pickImage} /> 
        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          value={message}
          onChangeText={setMessage}
        />
        <Button title="Kirim" onPress={sendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  msgBox: {
    padding: 10,
    marginVertical: 6,
    borderRadius: 6,
    maxWidth: "80%",
  },
  myMsg: { backgroundColor: "#d1f0ff", alignSelf: "flex-end" },
  otherMsg: { backgroundColor: "#eee", alignSelf: "flex-start" },
  sender: { fontWeight: "bold", marginBottom: 2, fontSize: 12 },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    gap: 6,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
  },
});
