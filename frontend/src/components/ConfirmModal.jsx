import { memo } from "react";

function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}) {

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
          w-full
          max-w-md

          rounded-2xl

          bg-white

          p-8

          shadow-2xl
        "
      >

        <h2
          className="
            text-2xl
            font-bold
            text-gray-800
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-4
            text-gray-600
          "
        >
          {message}
        </p>

        <div
          className="
            mt-8

            flex
            justify-end
            gap-4
          "
        >

          <button

            type="button"

            title="Cancel"

            onClick={onCancel}

            className="
              cursor-pointer

              rounded-lg

              bg-gray-200

              px-5
              py-2

              transition-all
              duration-200

              hover:bg-gray-300
            "
          >
            Cancel
          </button>

          <button

            type="button"

            title="Delete"

            onClick={onConfirm}

            className="
              cursor-pointer

              rounded-lg

              bg-red-500

              px-5
              py-2

              text-white

              transition-all
              duration-200

              hover:bg-red-600
            "
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}

export default memo(
  ConfirmModal
);