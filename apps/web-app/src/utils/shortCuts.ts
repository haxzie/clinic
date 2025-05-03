import useApiStore from "@/store/api-store/api.store";

const altKeyShortcuts: Record<string, () => void> = {
  KeyN: () => {
    console.log("New API");
    useApiStore.getState().createAPI({});
  },
};

export const setupShortcuts = (event: KeyboardEvent) => {  // New request
  const { altKey, code } = event;
  if (altKey) {
    if (code in altKeyShortcuts) {
      event.preventDefault();
      altKeyShortcuts[code]();
    }
  }
};
