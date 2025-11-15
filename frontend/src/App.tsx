import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setUser } from "./store/authSlice";
import { UseFetchAPIQuery } from "./Hook/UseFetchAPIQuery";
import { currentUserAPI } from "./api/admin/auth.api";
import { useEffect } from "react";

function App() {



  const queryClient = new QueryClient();







  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
