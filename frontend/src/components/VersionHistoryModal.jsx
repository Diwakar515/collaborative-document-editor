import { memo } from "react";

function VersionHistoryModal({
  isOpen,
  versions,
  onClose,
  onRestore,
  permissionType
}) {

  if (!isOpen) {
    return null;
  }

  const canRestore =
    permissionType !== "VIEWER";

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
            Version History
          </h2>

          <button

            type="button"

            title="Close"

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

        {versions.length === 0 ? (

          <div
            className="
              rounded-xl

              bg-gray-50

              py-8

              text-center

              text-gray-500
            "
          >
            No versions available
          </div>

        ) : (

          <div
            className="
              space-y-4
            "
          >

            {versions.map(
              (version) => (

                <div

                  key={version.id}

                  className="
                    rounded-xl

                    border

                    bg-gray-50

                    p-4
                  "
                >

                  <div
                    className="
                      mb-3

                      flex
                      items-center
                      justify-between
                    "
                  >

                    <div>

                      <h3
                        className="
                          text-lg
                          font-bold
                        "
                      >
                        {version.title}
                      </h3>

                      <p
                        className="
                          text-sm
                          text-gray-500
                        "
                      >
                        {new Date(
                          version.createdAt
                        ).toLocaleString()}
                      </p>

                    </div>

                    {canRestore && (

                      <button

                        type="button"

                        title="Restore Version"

                        onClick={() =>
                          onRestore(
                            version
                          )
                        }

                        className="
                          cursor-pointer

                          rounded-lg

                          bg-blue-600

                          px-4
                          py-2

                          text-white

                          transition-all
                          duration-200

                          hover:bg-blue-700
                          hover:scale-105
                        "
                      >

                        Restore

                      </button>

                    )}

                  </div>

                  <div
                    className="
                      prose
                      max-w-none
                    "
                    dangerouslySetInnerHTML={{
                      __html:
                        version.content
                    }}
                  />

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default memo(
  VersionHistoryModal
);