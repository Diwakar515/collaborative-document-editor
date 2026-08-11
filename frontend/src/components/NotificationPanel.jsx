import { memo } from "react";

function formatRelativeTime(
  timestamp
) {

  const now =
    new Date();

  const date =
    new Date(timestamp);

  const diffSeconds =
    Math.floor(
      (now - date) / 1000
    );

  if (
    diffSeconds < 60
  ) {

    return "Just now";
  }

  const diffMinutes =
    Math.floor(
      diffSeconds / 60
    );

  if (
    diffMinutes < 60
  ) {

    return `${diffMinutes} min ago`;
  }

  const diffHours =
    Math.floor(
      diffMinutes / 60
    );

  if (
    diffHours < 24
  ) {

    return `${diffHours} hour${
      diffHours > 1
        ? "s"
        : ""
    } ago`;
  }

  const diffDays =
    Math.floor(
      diffHours / 24
    );

  if (
    diffDays === 1
  ) {

    return "Yesterday";
  }

  return `${diffDays} days ago`;
}

function NotificationPanel({
  notifications,
  onNotificationClick,
  onMarkAllAsRead
}) {

  const hasUnreadNotifications =
    notifications.some(
      (notification) =>
        !notification.read
    );

  return (

    <div
      className="
        absolute
        right-0
        mt-2

        w-[400px]

        bg-white

        border
        border-gray-200

        rounded-xl
        shadow-lg

        z-50

        max-h-[500px]
        overflow-y-auto
      "
    >

      <div
        className="
          p-4

          border-b
          border-gray-200
        "
      >

        <div
          className="
            flex
            justify-between
            items-center
          "
        >

          <h3
            className="
              text-lg
              font-bold
            "
          >
            Notifications
          </h3>

          {hasUnreadNotifications && (

            <button

              type="button"

              aria-label="Mark all notifications as read"

              onClick={(event) => {

                event.stopPropagation();

                onMarkAllAsRead();
              }}

              className="
                cursor-pointer

                text-sm
                text-blue-600

                hover:underline

                transition-all
                duration-200
              "
            >

              Mark all as read

            </button>

          )}

        </div>

      </div>

      {notifications.length === 0 ? (

        <div
          className="
            p-4
            text-gray-500
          "
        >

          No notifications

        </div>

      ) : (

        notifications.map(
          (notification) => (

            <div

              key={notification.id}

              onClick={(event) => {

                event.stopPropagation();

                if (
                  !notification.read
                ) {

                  onNotificationClick(
                    notification.id
                  );
                }
              }}

              className={`
                cursor-pointer

                p-4

                border-b
                border-gray-100

                transition-all
                duration-200

                hover:bg-gray-50

                ${
                  !notification.read
                    ? "bg-blue-50"
                    : ""
                }
              `}
            >

              <p
                className="
                  text-sm
                  text-gray-800
                "
              >

                {notification.message}

              </p>

              <p
                className="
                  mt-2

                  text-xs
                  text-gray-500
                "
              >

                {formatRelativeTime(
                  notification.createdAt
                )}

              </p>

            </div>

          )
        )

      )}

    </div>
  );
}

export default memo(NotificationPanel);