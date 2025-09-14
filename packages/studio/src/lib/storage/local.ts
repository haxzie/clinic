export class LocalStore {
  static get(key: string) {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem(key);
  }

  static set(key: string, value: string) {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(key, value);
  }

  static remove(key: string) {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.removeItem(key);
  }
}