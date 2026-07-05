import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import AppToastContainer from "./components/AppToastContainer/AppToastContainer";

const queryClient = new QueryClient();

import { useEffect } from "react";
import axiosClient from "./api/axiosClient";

function App() {
  useEffect(() => {
    const trackVisit = async () => {
      let visitorId = localStorage.getItem("visitor_id");
      if (!visitorId) {
        visitorId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        localStorage.setItem("visitor_id", visitorId);
      }
      try {
        await axiosClient.post("/analytics/visit", { visitorId });
      } catch (error) {
        // Silently fail, don't disrupt user experience
        console.error("Failed to track visit", error);
      }
    };
    trackVisit();
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <AppRoutes />
            <AppToastContainer />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}


export default App;
