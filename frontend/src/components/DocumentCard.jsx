import { memo } from "react";

import {
  History,
  Activity,
  MessageSquare,
  Share2,
  Trash2
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const permissionStyles = {

  OWNER:
    "bg-blue-100 text-blue-700",

  EDITOR:
    "bg-green-100 text-green-700",

  VIEWER:
    "bg-gray-200 text-gray-700"
};

function DocumentCard({
  doc,
  onDelete,
  onShare,
  onHistory,
  onActivity,
  onComments
}) {

  const navigate =
    useNavigate();

  return (

    <div
      className="
        bg-white
        rounded-xl
        shadow-md
        p-5
        border
        border-gray-200
        flex
        flex-col
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

          onClick={() =>
            navigate(
              `/documents/${doc.id}`
            )
          }

          className="
            text-xl
            font-bold
            text-gray-800

            cursor-pointer

            hover:text-blue-600
            hover:underline

            transition-colors
            duration-200
          "
        >

          {doc.title}

        </h3>

        <span
          className={`
            px-3
            py-1
            rounded-full
            text-xs
            font-semibold

            ${
              permissionStyles[
                doc.permissionType
              ] ||
              permissionStyles.VIEWER
            }
          `}
        >

          {doc.permissionType}

        </span>

      </div>

      <div
        className="
          mt-3
          h-24
          overflow-hidden
          text-gray-600
        "
      >

        <div
          className="line-clamp-5"
          dangerouslySetInnerHTML={{
            __html: doc.content
          }}
        />

      </div>

      <div
        className="
          mt-auto
          pt-4

          flex
          flex-wrap
          gap-2
        "
      >

        <button

          title="History"

          onClick={(event) => {

            event.stopPropagation();

            onHistory(doc.id);
          }}

          className="
            cursor-pointer

            bg-gray-600
            hover:bg-gray-700

            text-white

            px-4
            py-2

            rounded-lg

            transition-all
            duration-200
          "
        >

          <History size={18} />

        </button>

        <button

          title="Activity"

          onClick={(event) => {

            event.stopPropagation();

            onActivity(doc.id);
          }}

          className="
            cursor-pointer

            bg-gray-600
            hover:bg-gray-700

            text-white

            px-4
            py-2

            rounded-lg

            transition-all
            duration-200
          "
        >

          <Activity size={18} />

        </button>

        <button

          title="Comments"

          onClick={(event) => {

            event.stopPropagation();

            onComments(doc.id);
          }}

          className="
            cursor-pointer

            bg-gray-600
            hover:bg-gray-700

            text-white

            px-4
            py-2

            rounded-lg

            transition-all
            duration-200
          "
        >

          <MessageSquare size={18} />

        </button>

        {doc.permissionType ===
          "OWNER" && (

          <button

            title="Share"

            onClick={(event) => {

              event.stopPropagation();

              onShare(doc.id);
            }}

            className="
              cursor-pointer

              bg-blue-600
              hover:bg-blue-700

              text-white

              px-4
              py-2

              rounded-lg

              hover:scale-105

              transition-all
              duration-200
            "
          >

            <Share2 size={18} />

          </button>

        )}

        {doc.permissionType ===
          "OWNER" && (

          <button

            title="Delete"

            onClick={(event) => {

              event.stopPropagation();

              onDelete(doc.id);
            }}

            className="
              cursor-pointer

              bg-red-600
              hover:bg-red-700

              text-white

              px-4
              py-2

              rounded-lg

              transition-all
              duration-200
            "
          >

            <Trash2 size={18} />

          </button>

        )}

      </div>

    </div>
  );
}

export default memo(DocumentCard);