"use client";
import { envConfig } from "@/config";
import { refreshSession } from "@/lib/auth/session";
import { selectToken } from "@/redux/features/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import type { RootState } from "@/redux/store";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSelector, useStore } from "react-redux";
import { io, Socket } from "socket.io-client";

type TValueType = {
  socket: Socket;
  socketLoading: boolean;
};
const SocketContext = createContext({});

export const useSocket = () => {
  return useContext(SocketContext) as TValueType;
};

// connect_error messages the socket server sends when it rejects the handshake token.
const AUTH_ERROR = /jwt|unauthori[sz]ed|not authorized|token/i;

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const token = useSelector(selectToken);
  const isLoggedIn = Boolean(token);
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  // One socket per login. It is closed on logout and kept across token
  // refreshes, so listeners attached by consumers survive.
  useEffect(() => {
    if (!isLoggedIn) return;

    const socketStore = io(envConfig.socketApi, {
      transports: ["websocket"],
      // A function, so every (re)connect sends the latest token from the store.
      auth: (cb) => cb({ token: store.getState().auth.token }),
    });
    let refreshedForAuthError = false;

    socketStore.on("connect", () => {
      refreshedForAuthError = false;
      setConnected(true);
    });
    socketStore.on("disconnect", () => setConnected(false));

    // The server checks the token only during the handshake, and socket.io
    // doesn't retry handshakes rejected by server middleware. On an auth
    // rejection, refresh once and reconnect. If the refresh fails,
    // refreshSession logs the user out and this effect's cleanup closes the socket.
    socketStore.on("connect_error", async (error) => {
      if (refreshedForAuthError || !AUTH_ERROR.test(error.message)) return;
      refreshedForAuthError = true;
      const outcome = await refreshSession(dispatch, store.getState);
      if (outcome === "refreshed") socketStore.connect();
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect -- publishing the external socket instance to context
    setSocket(socketStore);

    return () => {
      socketStore.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [isLoggedIn, dispatch, store]);

  // After a token refresh the open connection still uses the old handshake
  // token. Reconnect so the server sees the new one.
  const lastToken = useRef(token);
  useEffect(() => {
    if (token === lastToken.current) return;
    const wasLoggedIn = Boolean(lastToken.current);
    lastToken.current = token;
    if (wasLoggedIn && token && socket?.connected) {
      socket.disconnect().connect();
    }
  }, [token, socket]);

  return (
    <SocketContext.Provider
      value={{ socket, socketLoading: Boolean(socket) && !connected }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
