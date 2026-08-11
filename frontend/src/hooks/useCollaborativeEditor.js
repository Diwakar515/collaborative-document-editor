import { useEffect } from "react";

import stompClient, {
  addStompConnectListener,
  activateStompClient
} from "../websocket/websocket";

function useCollaborativeEditor({
  documentId,
  setContent,
  isRemoteUpdateRef
}) {

  useEffect(() => {

    if (!documentId) {
      return;
    }

    const subscriptionPath =
      `/topic/document/${documentId}`;

    let subscription;

    let remoteUpdateTimeout;

    const subscribeToDocument =
      () => {

        if (
          subscription
        ) {

          subscription.unsubscribe();
        }

        subscription =
          stompClient.subscribe(

            subscriptionPath,

            (message) => {

              try {

                const received =
                  JSON.parse(
                    message.body
                  );

                isRemoteUpdateRef.current =
                  true;

                setContent(
                  received.content
                );

                if (
                  remoteUpdateTimeout
                ) {

                  clearTimeout(
                    remoteUpdateTimeout
                  );
                }

                remoteUpdateTimeout =
                  setTimeout(() => {

                    isRemoteUpdateRef.current =
                      false;

                    remoteUpdateTimeout =
                      null;

                  }, 50);

              } catch (error) {

                console.error(
                  "Failed to process collaborative document message",
                  error
                );
              }
            }
          );
      };

    const removeConnectListener =
      addStompConnectListener(
        subscribeToDocument
      );

    if (
      stompClient.connected
    ) {

      subscribeToDocument();
    }

    activateStompClient();

    return () => {

      removeConnectListener();

      if (
        remoteUpdateTimeout
      ) {

        clearTimeout(
          remoteUpdateTimeout
        );

        remoteUpdateTimeout =
          null;
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
    documentId,
    setContent,
    isRemoteUpdateRef
  ]);

  const sendDocumentUpdate =
    (updatedContent) => {

      if (!documentId) {
        return;
      }

      if (
        !stompClient.connected
      ) {
        return;
      }

      stompClient.publish({

        destination:
          "/app/document-sync",

        body: JSON.stringify({
          documentId,
          content:
            updatedContent
        })
      });
    };

  return {
    sendDocumentUpdate
  };
}

export default useCollaborativeEditor;