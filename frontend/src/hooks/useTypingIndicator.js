import {
  useEffect,
  useRef,
  useState
} from "react";

import stompClient, {
  addStompConnectListener,
  activateStompClient
} from "../websocket/websocket";

function useTypingIndicator(
  documentId
) {

  const [
    typingUser,
    setTypingUser
  ] = useState("");

  const typingTimeoutRef =
    useRef(null);

  useEffect(() => {

    if (!documentId) {
      return;
    }

    const topic =
      `/topic/typing/${documentId}`;

    let subscription;

    const subscribeTyping =
      () => {

        if (
          subscription
        ) {

          subscription.unsubscribe();
        }

        subscription =
          stompClient.subscribe(

            topic,

            (message) => {

              try {

                const data =
                  JSON.parse(
                    message.body
                  );

                const currentUser =
                  localStorage.getItem(
                    "email"
                  );

                if (
                  data.userEmail ===
                  currentUser
                ) {
                  return;
                }

                if (
                  data.typing
                ) {

                  setTypingUser(
                    data.userEmail
                  );

                  if (
                    typingTimeoutRef.current
                  ) {

                    clearTimeout(
                      typingTimeoutRef.current
                    );
                  }

                  typingTimeoutRef.current =
                    setTimeout(() => {

                      setTypingUser(
                        ""
                      );

                      typingTimeoutRef.current =
                        null;

                    }, 1000);

                } else {

                  if (
                    typingTimeoutRef.current
                  ) {

                    clearTimeout(
                      typingTimeoutRef.current
                    );

                    typingTimeoutRef.current =
                      null;
                  }

                  setTypingUser(
                    ""
                  );
                }

              } catch (error) {

                console.error(
                  "Failed to process typing message",
                  error
                );
              }
            }
          );
      };

    const removeConnectListener =
      addStompConnectListener(
        subscribeTyping
      );

    if (
      stompClient.connected
    ) {

      subscribeTyping();
    }

    activateStompClient();

    return () => {

      removeConnectListener();

      if (
        subscription
      ) {

        subscription.unsubscribe();

        subscription =
          null;
      }

      if (
        typingTimeoutRef.current
      ) {

        clearTimeout(
          typingTimeoutRef.current
        );

        typingTimeoutRef.current =
          null;
      }
    };

  }, [
    documentId
  ]);

  const sendTypingStatus =
    (typing) => {

      if (!documentId) {
        return;
      }

      if (
        !stompClient.connected
      ) {
        return;
      }

      const currentUser =
        localStorage.getItem(
          "email"
        );

      if (!currentUser) {
        return;
      }

      stompClient.publish({

        destination:
          "/app/typing",

        body: JSON.stringify({
          documentId,
          userEmail:
            currentUser,
          typing
        })
      });
    };

  return {
    typingUser,
    sendTypingStatus
  };
}

export default useTypingIndicator;