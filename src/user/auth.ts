  // auth.ts
  import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    UserCredential
  } from "firebase/auth";

  import {
    doc,
    setDoc,
    getDoc
  } from "firebase/firestore";

  import { auth, db } from "../../firebase";
  import { save, load, remove } from "../storage/storage";

  export interface AppUser {
    uid: string;
    email: string;
    name: string;
  }

  export async function signup(
    email: string,
    password: string,
    name: string
  ): Promise<AppUser> {

    const cred: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = cred.user!.uid;

    const userData: AppUser = { uid, email, name };

    console.log("BEFORE SETDOC");
    
    try {
      await setDoc(doc(db, "users", uid), userData);
      await save("user", userData);
      console.log("WRITE OK");
    } catch (e) {
      console.log("WRITE ERROR", e);
    }

    return userData;
  }

  export async function login(
    email: string,
    password: string
  ): Promise<AppUser> {

    const cred: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = cred.user!.uid;

    const snap = await getDoc(doc(db, "users", uid));
    const userData = snap.data() as AppUser;

    return userData;
  }

  export async function loadSavedUser(): Promise<AppUser | null> {
    return await load<AppUser>("user");
  }
