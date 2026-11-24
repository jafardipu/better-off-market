"use client";
import SocketProvider from "@/context/SocketContextApi";
import { persistor, store } from "@/redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import FirebaseProvider from "./FirebaseProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import SessionRefresher from "./SessionRefresher";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SessionRefresher />
        <FirebaseProvider>
          <SocketProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </SocketProvider>
        </FirebaseProvider>
      </PersistGate>
    </Provider>
  );
};

export default Providers;
