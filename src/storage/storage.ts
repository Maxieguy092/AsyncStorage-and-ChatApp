// storage.ts
// INI IMPLEMENTASI ASYNCSTORAGE
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function save(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("AsyncStorage save error:", e);
  }
}

export async function load<T>(key: string): Promise<T | null> {
  try {
    const json = await AsyncStorage.getItem(key);
    return json ? (JSON.parse(json) as T) : null;
  } catch (e) {
    console.warn("AsyncStorage load error:", e);
    return null;
  }
}

export async function remove(key: string) {
  try {
    console.log("clearing");
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn("AsyncStorage remove error:", e);
  }
}
