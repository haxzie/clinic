// import { create } from "zustand";
// import { devtools } from "zustand/middleware";
// import useApiStore from "../api-store/api.store";

// const initialState = {
//   activeApi: null,
// };

// /**
//  * Editor store
//  */
// const useEditorStore = create<EditorStoreState>()((set, get) => ({
//   ...initialState,
//   setActiveApi: (apiId) => {
//     const { apis } = useApiStore.getState();
//     // Check if the API ID is valid
//     if (!apiId || !apis[apiId]) {
//       set({ activeApi: null });
//     } else {
//       set({ activeApi: apiId });
//     }
//   }
// }));

// export default devtools(useEditorStore);
