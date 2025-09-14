import { Studio, StudioProvider } from "@apiclinic/studio";
import { requestClient } from "./services/clinic-server/relay";
import "@apiclinic/studio/style.css";
import AppLayout from "./layouts/AppLayout";

function App() {
  return (
    <AppLayout>
      <StudioProvider client={requestClient}>
        <Studio />
      </StudioProvider>
    </AppLayout>
  );
}

export default App;
