/** Payload the socket server passes to an emit's acknowledgement callback. */
export type SocketAck<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

/**
 * Chats requested per load. The server's own "chat_list" pushes (after a new
 * message or "seen") must use the same limit, or the list shrinks.
 */
export const CHAT_LIST_LIMIT = 100;

/** Show "Try again" instead of a spinner when the server doesn't answer in time. */
export const SOCKET_ACK_TIMEOUT_MS = 10_000;
