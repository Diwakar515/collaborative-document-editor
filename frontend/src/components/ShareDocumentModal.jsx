import { memo } from "react";

import { UserMinus } from "lucide-react";

function ShareDocumentModal({
  isOpen,
  onClose,
  shareEmail,
  setShareEmail,
  sharePermission,
  setSharePermission,
  collaborators,
  onUpdatePermission,
  onRemoveCollaborator,
  onShare,
  sharing
}) {

  if (!isOpen) {
    return null;
  }

  const canShare =
    shareEmail.trim().length > 0 &&
    !sharing;

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
          w-[500px]

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

            Share Document

          </h2>

          <button

            type="button"

            onClick={(event) => {

              event.stopPropagation();

              onClose();
            }}

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

        <input

          type="email"

          placeholder="Enter collaborator email"

          value={shareEmail}

          onChange={(event) =>
            setShareEmail(
              event.target.value
            )
          }

          className="
            mb-4

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

        <select

          value={sharePermission}

          onChange={(event) =>
            setSharePermission(
              event.target.value
            )
          }

          className="
            mb-4

            w-full

            rounded-lg

            border
            border-gray-300

            bg-white

            px-4
            py-3

            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        >

          <option value="EDITOR">
            Editor
          </option>

          <option value="VIEWER">
            Viewer
          </option>

        </select>

        <button

          type="button"

          onClick={(event) => {

            event.stopPropagation();

            onShare();
          }}

          disabled={!canShare}

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

          Share

        </button>

        <div
          className="mt-8"
        >

          <h3
            className="
              mb-4

              text-lg
              font-semibold
            "
          >

            Collaborators

          </h3>

          {collaborators.length === 0 ? (

            <div
              className="
                rounded-lg

                bg-gray-50

                p-4

                text-center
                text-gray-500
              "
            >

              No collaborators yet

            </div>

          ) : (

            <div
              className="
                space-y-3
              "
            >

              {collaborators.map(
                (collaborator) => (

                  <div

                    key={
                      collaborator
                        .collaboratorEmail
                    }

                    className="
                      flex
                      items-center
                      justify-between

                      rounded-xl

                      border
                      border-gray-200

                      px-4
                      py-3

                      transition-all
                      duration-200

                      hover:bg-gray-100
                    "
                  >

                    <div>

                      <p
                        className="
                          font-semibold
                          text-gray-800
                        "
                      >

                        {
                          collaborator
                            .collaboratorName
                        }

                      </p>

                      <p
                        className="
                          text-sm
                          text-gray-500
                        "
                      >

                        {
                          collaborator
                            .collaboratorEmail
                        }

                      </p>

                    </div>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <select

                        value={
                          collaborator
                            .permissionType
                        }

                        onChange={(event) =>

                          onUpdatePermission(

                            collaborator
                              .collaboratorEmail,

                            event.target.value
                          )
                        }

                        className="
                          rounded-lg

                          border
                          border-gray-300

                          bg-white

                          px-3
                          py-2

                          focus:outline-none
                          focus:ring-2
                          focus:ring-blue-500
                        "
                      >

                        <option value="EDITOR">
                          Editor
                        </option>

                        <option value="VIEWER">
                          Viewer
                        </option>

                      </select>

                      <button

                        type="button"

                        title="Remove Access"

                        onClick={(event) => {

                          event.stopPropagation();

                          onRemoveCollaborator(

                            collaborator
                              .collaboratorEmail
                          );
                        }}

                        className="
                          cursor-pointer

                          rounded-lg

                          bg-red-600

                          p-2

                          text-white

                          transition-all
                          duration-200

                          hover:bg-red-700
                        "
                      >

                        <UserMinus
                          size={16}
                        />

                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default memo(ShareDocumentModal);