import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "../../firebase";
import { setDoc, doc } from "firebase/firestore";
import { AppUser, loadSavedUser, login, signup } from "../user/auth";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

import NetInfo from "@react-native-community/netinfo";
import { load } from "../storage/storage";
 
type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // only for register
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState<boolean>(true);
 
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOnline(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const loadName = async () => {
      if (!name) {
        const usr = await loadSavedUser();
        if (usr) {
          setName(usr.name);
        }
      }
    };

    loadName();
  }, [name]);

  const handleLogin = async () => {
    try {
      setError("");

      const usrdata = await login(email.trim(), password);

      console.log("========here be data==========");
      console.log(usrdata);

      const userName = typeof usrdata === "string" ? usrdata : usrdata.name;

      navigation.navigate("Chat", { name: userName });
    } catch (err: any) {
      Alert.alert("FUCK", err.message)
      setError(err.message);
    }
  };

  const handleRegister = async () => {
    try {
      setError("");

      const user = await signup(email.trim(), password, name)
      // const userCred = await createUserWithEmailAndPassword(
      //   auth,
      //   email.trim(),
      //   password
      // );

      // await setDoc(doc(db, "users", userCred.user.uid), {
      //   uid: userCred.user.uid,
      //   email: email.trim(),
      //   name,
      // });

      Alert.alert("Register Successful!");

      // AUTO SWITCH BACK TO LOGIN
      setMode("login");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {mode === "login" ? (
        <>
          <Text style={{ fontSize: 24 }}>Login</Text>
          {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
          />

          <Button title="Login" onPress={handleLogin} />

          <Button
            title="Go to Register"
            onPress={() => setMode("register")}
          />
        </>
      ) : (
        <>
          <Text style={{ fontSize: 24 }}>Register</Text>
          {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
          />

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
          />

          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
          />

          <Button title="Register" onPress={handleRegister} />

          <Button
            title="Back to Login"
            onPress={() => setMode("login")}
          />
        </>
      )}
    </View>
  );
}
