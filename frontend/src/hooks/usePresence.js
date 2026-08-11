import {
  useEffect,
  useState
} from "react";

import stompClient, {
  addStompConnectListener,
  activateStompClient
} from "../websocket/websocket";

function usePresence(
  documentId
) {

  const [
    activeUsers,
    setActiveUsers
  ] = useState([]);

  useEffect(() => {

    if (!documentId) {
      return;
    }

    const email =
      localStorage.getItem(
        "email"
      );

    if (!email) {
      return;
    }

    const topic =
      `/topic/presence/${documentId}`;

    let subscription;

    let joinTimeout;

    let joinPublished =
      false;

    let effectActive =
      true;

    const publishJoin =
      () => {

        if (
          !effectActive
        ) {
          return;
        }

        if (
          !stompClient.connected
        ) {
          return;
        }

        stompClient.publish({

          destination:
            "/app/presence/join",

          body: JSON.stringify({
            documentId,
            userEmail:
              email
          })
        });

        joinPublished =
          true;
      };

    const scheduleJoin =
      () => {

        if (
          joinTimeout
        ) {

          clearTimeout(
            joinTimeout
          );
        }

        joinTimeout =
          setTimeout(() => {

            joinTimeout =
              null;

            publishJoin();

          }, 200);
      };

    const subscribePresence =
      () => {

        if (
          !effectActive
        ) {
          return;
        }

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

                const users =
                  JSON.parse(
                    message.body
                  );

                if (
                  !effectActive
                ) {
                  return;
                }

                setActiveUsers(
                  users
                );

              } catch (error) {

                console.error(
                  "Failed to process presence message",
                  error
                );
              }
            }
          );

        scheduleJoin();
      };

    const removeConnectListener =
      addStompConnectListener(
        subscribePresence
      );

    if (
      stompClient.connected
    ) {

      subscribePresence();
    }

    activateStompClient();

    return () => {

      effectActive =
        false;

      removeConnectListener();

      if (
        joinTimeout
      ) {

        clearTimeout(
          joinTimeout
        );

        joinTimeout =
          null;
      }

      if (
        joinPublished &&
        stompClient.connected
      ) {

        stompClient.publish({

          destination:
            "/app/presence/leave",

          body: JSON.stringify({
            documentId,
            userEmail:
              email
          })
        });
      }

      if (
        subscription
      ) {

        subscription.unsubscribe();

        subscription =
          null;
      }
    };

  }, [
    documentId
  ]);

  return activeUsers;
}

export default usePresence;