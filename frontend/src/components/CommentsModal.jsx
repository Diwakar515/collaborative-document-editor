import { memo, useEffect, useState } from "react";

function CommentsModal({
  isOpen,
  documentId,
  comments,
  commentFilter,
  setCommentFilter,
  onClose,
  onAddComment,
  onResolveComment,
  permissionType
}) {

  const [commentText, setCommentText] =
    useState("");

  const currentUserEmail =
    localStorage.getItem("email");

  const canResolveComments =
    permissionType === "OWNER" ||
    permissionType === "EDITOR";

  useEffect(() => {

      if (!isOpen) {

          setCommentText("");
      }

  }, [isOpen]);

  useEffect(() => {

      setCommentText("");

  }, [documentId]);

  if (!isOpen) {
    return null;
  }

  const getFilterButtonClass =
    (filter) => `

      cursor-pointer

      px-4
      py-2

      rounded-lg
      font-medium

      transition-all
      duration-200

      ${
        commentFilter === filter

          ? `
            bg-blue-600
            text-white
          `

          : `
            bg-gray-200
            text-gray-700
            hover:bg-gray-300
          `
      }
    `;

  const handleAddComment =
    () => {

      const trimmedComment =
        commentText.trim();

      if (!trimmedComment) {
        return;
      }

      onAddComment(
        trimmedComment
      );

      setCommentText("");
    };

  return (

    <div
      className="
        fixed
        inset-0

        z-50

        flex
        items-center
        justify-center

        bg-black/10
        backdrop-blur-sm
      "
    >

      <div
        className="
          w-[700px]
          max-h-[80vh]

          overflow-y-auto

          rounded-2xl
          bg-white
          p-6
          shadow-2xl
        "
      >

        <div
          className="
            mb-6

            flex
            items-center
            justify-between
          "
        >

          <h2
            className="
              text-2xl
              font-bold
            "
          >
            Comments
          </h2>

          <button

            type="button"

            onClick={onClose}

            className="
              cursor-pointer

              rounded-lg

              bg-gray-200

              px-4
              py-2

              transition-all
              duration-200

              hover:bg-gray-300
            "
          >

            Close

          </button>

        </div>

        <div
          className="
            mb-6

            flex
            gap-3
          "
        >

          <button

            type="button"

            onClick={() =>
              setCommentFilter(
                "ACTIVE"
              )
            }

            className={
              getFilterButtonClass(
                "ACTIVE"
              )
            }
          >

            Active

          </button>

          <button

            type="button"

            onClick={() =>
              setCommentFilter(
                "RESOLVED"
              )
            }

            className={
              getFilterButtonClass(
                "RESOLVED"
              )
            }
          >

            Resolved

          </button>

          <button

            type="button"

            onClick={() =>
              setCommentFilter(
                "ALL"
              )
            }

            className={
              getFilterButtonClass(
                "ALL"
              )
            }
          >

            All

          </button>

        </div>

        <div
          className="mb-6"
        >

          <textarea

            autoFocus

            placeholder="Add a comment..."

            value={commentText}

            onChange={(event) =>
              setCommentText(
                event.target.value
              )
            }

            className="
              mb-4

              min-h-[120px]
              w-full

              rounded-lg
              border
              border-gray-300

              px-4
              py-3

              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />

          <button

            type="button"

            disabled={
              !commentText.trim()
            }

            onClick={
              handleAddComment
            }

            className="
              cursor-pointer

              rounded-lg

              bg-blue-600
              px-6
              py-3

              text-white

              transition-all
              duration-200

              hover:bg-blue-700
              hover:scale-105

              disabled:cursor-not-allowed
              disabled:opacity-50
              disabled:hover:scale-100
            "
          >

            Add Comment

          </button>

        </div>

        <div
          className="space-y-4"
        >

          {comments.length === 0 ? (

            <div
              className="
                rounded-lg

                bg-gray-50

                p-6

                text-center
                text-gray-500
              "
            >

              No comments yet

            </div>

          ) : (

            comments.map(
              (comment) => (

                <div

                  key={comment.id}

                  className={`
                    rounded-lg

                    border-l-4

                    p-4

                    transition-all

                    ${
                      comment.resolved

                        ? `
                          border-gray-400
                          bg-gray-100
                          opacity-70
                        `

                        : `
                          border-green-500
                          bg-gray-50
                        `
                    }
                  `}
                >

                  <div
                    className="
                      mb-2

                      flex
                      items-center
                      justify-between
                    "
                  >

                    <h3
                      className="
                        text-sm
                        font-semibold
                        text-gray-700
                      "
                    >

                      {
                        comment.userEmail ===
                        currentUserEmail

                          ? "You"

                          : comment.userName
                      }

                    </h3>

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >

                      {comment.resolved && (

                        <span
                          className="
                            rounded-full

                            bg-gray-300

                            px-2
                            py-1

                            text-xs
                            font-medium
                            text-gray-700
                          "
                        >

                          Resolved

                        </span>

                      )}

                      <span
                        className="
                          text-sm
                          text-gray-500
                        "
                      >

                        {
                          new Date(
                            comment.createdAt
                          ).toLocaleString()
                        }

                      </span>

                    </div>

                  </div>

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    "
                  >

                    <p
                      className="
                        flex-1
                        text-gray-800
                      "
                    >

                      {comment.content}

                    </p>

                    {!comment.resolved &&
                      canResolveComments && (

                        <button

                          type="button"

                          onClick={() =>
                            onResolveComment(
                              comment.id
                            )
                          }

                          className="
                            cursor-pointer

                            rounded-lg

                            bg-green-600

                            px-3
                            py-2

                            text-sm
                            text-white

                            transition-all
                            duration-200

                            hover:bg-green-700
                          "
                        >

                          Resolve

                        </button>

                    )}

                  </div>

                </div>

              )
            )

          )}

        </div>

      </div>

    </div>
  );
}

export default memo(CommentsModal);