import { useEffect } from "react";

import stompClient, {
  addStompConnectListener,
  activateStompClient
} from "../websocket/websocket";

function useRealtimeComments({
  documentId,
  setComments
}) {

  useEffect(() => {

    if (!documentId) {
      return;
    }

    const subscriptionPath =
      `/topic/comments/${documentId}`;

    let subscription;

    const subscribeToComments =
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

                if (
                  received.type ===
                  "COMMENT_RESOLVED"
                ) {

                  setComments((prev) =>

                    prev.map((comment) =>

                      comment.id ===
                      received.commentId

                        ? {
                            ...comment,
                            resolved: true
                          }

                        : comment
                    )
                  );

                  return;
                }

                if (
                  received.type ===
                  "COMMENT_ADDED"
                ) {

                  setComments((prev) => {

                    const alreadyExists =
                      prev.some(
                        (comment) =>
                          comment.id ===
                          received.commentId
                      );

                    if (
                      alreadyExists
                    ) {
                      return prev;
                    }

                    return [

                      {
                        id:
                          received.commentId,

                        content:
                          received.content,

                        userEmail:
                          received.userEmail,

                        userName:
                          received.userName,

                        createdAt:
                          received.createdAt,

                        resolved:
                          received.resolved ??
                          false
                      },

                      ...prev
                    ];
                  });
                }

              } catch (error) {

                console.error(
                  "Failed to process realtime comment message",
                  error
                );
              }
            }
          );
      };

    const removeConnectListener =
      addStompConnectListener(
        subscribeToComments
      );

    if (
      stompClient.connected
    ) {

      subscribeToComments();
    }

    activateStompClient();

    return () => {

      removeConnectListener();

      if (
        subscription
      ) {

        subscription.unsubscribe();
      }
    };

  }, [
    documentId,
    setComments
  ]);
}

export default useRealtimeComments;