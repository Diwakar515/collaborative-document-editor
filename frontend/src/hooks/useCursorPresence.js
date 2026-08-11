import {
  useEffect,
  useRef,
  useState
} from "react";

import stompClient, {
  addStompConnectListener,
  activateStompClient
} from "../websocket/websocket";

function useCursorPresence(
  documentId
) {

  const [
    cursorUsers,
    setCursorUsers
  ] = useState([]);

  const cursorTimeoutsRef =
    useRef({});

  useEffect(() => {

    if (!documentId) {
      return;
    }

    const topic =
      `/topic/cursor/${documentId}`;

    let subscription;

    const subscribeCursor =
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
                  !data.userEmail
                ) {
                  return;
                }

                setCursorUsers((prev) => {

                  const filtered =
                    prev.filter(
                      (user) =>
                        user.userEmail !==
                        data.userEmail
                    );

                  return [
                    ...filtered,
                    data
                  ];
                });

                const existingTimeout =
                  cursorTimeoutsRef.current[
                    data.userEmail
                  ];

                if (
                  existingTimeout
                ) {

                  clearTimeout(
                    existingTimeout
                  );
                }

                cursorTimeoutsRef.current[
                  data.userEmail
                ] = setTimeout(() => {

                  setCursorUsers((prev) =>

                    prev.filter(
                      (user) =>
                        user.userEmail !==
                        data.userEmail
                    )
                  );

                  delete (
                    cursorTimeoutsRef.current[
                      data.userEmail
                    ]
                  );

                }, 2000);

              } catch (error) {

                console.error(
                  "Failed to process cursor message",
                  error
                );
              }
            }
          );
      };

    const removeConnectListener =
      addStompConnectListener(
        subscribeCursor
      );

    if (
      stompClient.connected
    ) {

      subscribeCursor();
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

      Object.values(
        cursorTimeoutsRef.current
      ).forEach(
        (timeoutId) => {

          clearTimeout(
            timeoutId
          );
        }
      );

      cursorTimeoutsRef.current =
        {};
    };

  }, [
    documentId
  ]);

  const sendCursorPosition =
    (position) => {

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
          "/app/cursor",

        body: JSON.stringify({
          documentId,
          userEmail:
            currentUser,
          position
        })
      });
    };

  return {
    cursorUsers,
    sendCursorPosition
  };
}

export default useCursorPresence;