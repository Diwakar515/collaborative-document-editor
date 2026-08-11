import SockJS from "sockjs-client";

import {
  Client
} from "@stomp/stompjs";

const websocketUrl =
  import.meta.env.VITE_WS_URL ||
  "http://localhost:8081/ws";

const connectListeners =
  new Set();

const stompClient =
  new Client({

    webSocketFactory: () =>
      new SockJS(
        websocketUrl
      ),

    reconnectDelay: 5000,

    debug: (str) => {

      if (
        import.meta.env.DEV
      ) {

        console.log(
          "[STOMP]",
          str
        );
      }
    },

    onConnect: () => {

      if (
        import.meta.env.DEV
      ) {

        console.log(
          "[STOMP] Connected"
        );
      }

      connectListeners.forEach(
        (listener) => {

          try {

            listener();

          } catch (error) {

            console.error(
              "STOMP connect listener failed",
              error
            );
          }
        }
      );
    },

    onStompError: (frame) => {

      console.error(
        "[STOMP ERROR]",
        frame
      );
    }
  });

export const addStompConnectListener =
  (listener) => {

    connectListeners.add(
      listener
    );

    return () => {

      connectListeners.delete(
        listener
      );
    };
  };

export const activateStompClient =
  () => {

    if (
      !stompClient.active
    ) {

      stompClient.activate();
    }
  };

export default stompClient;