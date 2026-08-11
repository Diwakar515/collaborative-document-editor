import { memo } from "react";

function ActivityTimelineModal({
  isOpen,
  activities,
  onClose
}) {

  const currentUserEmail =
    localStorage.getItem(
      "email"
    );

  if (!isOpen) {
    return null;
  }

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
            Activity Timeline
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

        {activities.length === 0 ? (

          <div
            className="
              rounded-xl

              bg-gray-50

              py-8

              text-center

              text-gray-500
            "
          >
            No activities found
          </div>

        ) : (

          <div
            className="
              space-y-4
            "
          >

            {activities.map(
              (activity) => (

                <div

                  key={activity.id}

                  className="
                    rounded-lg

                    border-l-4
                    border-blue-500

                    bg-gray-50

                    p-4
                  "
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
                        text-lg
                        font-semibold
                      "
                    >
                      {activity.action}
                    </h3>

                    <span
                      className="
                        text-sm
                        text-gray-500
                      "
                    >
                      {new Date(
                        activity.createdAt
                      ).toLocaleString()}
                    </span>

                  </div>

                  <p
                    className="
                      text-gray-700
                    "
                  >

                    Performed by:

                    <span
                      className="
                        ml-1
                        font-medium
                      "
                    >

                      {activity.userEmail === currentUserEmail

                        ? "You"

                        : activity.userName}

                    </span>

                  </p>

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
  ActivityTimelineModal
);