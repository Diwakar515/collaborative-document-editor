import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  useNavigate,
  useParams
} from "react-router-dom";

import {
  Activity,
  ArrowLeft,
  History,
  MessageSquare,
  Save
} from "lucide-react";

import { toast } from "react-toastify";

import api from "../api/axios";

import RichTextEditor from "../components/RichTextEditor";
import CommentsModal from "../components/CommentsModal";
import VersionHistoryModal from "../components/VersionHistoryModal";
import ActivityTimelineModal from "../components/ActivityTimelineModal";

import useCollaborativeEditor from "../hooks/useCollaborativeEditor";
import usePresence from "../hooks/usePresence";
import useTypingIndicator from "../hooks/useTypingIndicator";
import useCursorPresence from "../hooks/useCursorPresence";
import useRealtimeComments from "../hooks/useRealtimeComments";

function DocumentEditorPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const documentId =
    Number(id);

  const [loading, setLoading] =
    useState(true);

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [saveStatus, setSaveStatus] =
    useState("");

  const [
    permissionType,
    setPermissionType
  ] = useState(null);

  const [
    comments,
    setComments
  ] = useState([]);

  const [
    commentFilter,
    setCommentFilter
  ] = useState("ACTIVE");

  const [
    showCommentsModal,
    setShowCommentsModal
  ] = useState(false);

  const [
    versions,
    setVersions
  ] = useState([]);

  const [
    showVersionsModal,
    setShowVersionsModal
  ] = useState(false);

  const [
    activities,
    setActivities
  ] = useState([]);

  const [
    showActivityModal,
    setShowActivityModal
  ] = useState(false);

  const [
    documentLoaded,
    setDocumentLoaded
  ] = useState(false);

  const autosaveTimeoutRef =
    useRef(null);

  const saveStatusTimeoutRef =
    useRef(null);

  const isRemoteUpdateRef =
    useRef(false);

  const isInitialLoadRef =
    useRef(true);

  const isReadOnly =
    permissionType === "VIEWER";

  const collaborativeEditor =
    useCollaborativeEditor({
      documentId: documentLoaded ? documentId : null,
      setContent,
      isRemoteUpdateRef
    });

  const activeUsers =
    usePresence(
      documentLoaded ? documentId : null
    );

  const {
    typingUser,
    sendTypingStatus
  } = useTypingIndicator(
    documentLoaded ? documentId : null
  );

  const {
    cursorUsers,
    sendCursorPosition
  } = useCursorPresence(
    documentLoaded ? documentId : null
  );

  useRealtimeComments({
    documentId: documentLoaded ? documentId : null,
    setComments
  });

  const filteredComments =
    comments.filter((comment) => {

      if (
        commentFilter ===
        "ACTIVE"
      ) {

        return !comment.resolved;
      }

      if (
        commentFilter ===
        "RESOLVED"
      ) {

        return comment.resolved;
      }

      return true;
    });

  const fetchDocument =
    async () => {

      try {

        setLoading(true);

        setDocumentLoaded(false);

        const response =
          await api.get(
            `/documents/${id}`
          );

        const document =
          response.data.data;

        isInitialLoadRef.current =
          true;

        setTitle(
          document.title
        );

        setContent(
          document.content
        );

        setPermissionType(
          document.permissionType
        );

        setDocumentLoaded(true);

      } catch (error) {

        console.error(
          "Failed to fetch document",
          error
        );

        if (!error.response) {

          toast.error("Unable to connect to the server.");

          return;
        }

        const status = error.response.status;

        if (status === 404) {

          navigate("/dashboard", {
            replace: true,
            state: {
                message: "Document not found."
            }
          });

          return;
        }

        if (status === 403) {

          navigate("/dashboard", {
            replace: true,
            state: {
                message: "You no longer have access to this document."
            }
          });

          return;
        }

        toast.error(
          error.response?.data?.message ||
          "Failed to load document"
        );

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    if (!id) {
      return;
    }

    fetchDocument();

  }, [id]);

  const fetchComments =
    async () => {

      try {

        const response =
          await api.get(
            `/documents/${id}/comments`
          );

        setComments(
          response.data.data
        );

      } catch (error) {

        console.error(
          "Failed to fetch comments",
          error
        );

        toast.error(
          "Failed to fetch comments"
        );
      }
    };

  useEffect(() => {

    if (!documentLoaded) {
      return;
    }

    fetchComments();

  }, [documentLoaded]);

  const handleAddComment =
    async (commentContent) => {

      if (
        !commentContent.trim()
      ) {

        toast.error(
          "Comment cannot be empty"
        );

        return;
      }

      try {

        await api.post(
          `/documents/${id}/comments`,
          {
            content:
              commentContent
          }
        );

        toast.success(
          "Comment added"
        );

      } catch (error) {

        console.error(
          "Failed to add comment",
          error
        );

        toast.error(
          "Failed to add comment"
        );
      }
    };

  const handleResolveComment =
    async (commentId) => {

      try {

        await api.patch(
          `/documents/${id}` +
          `/comments/${commentId}` +
          `/resolve`
        );

        toast.success(
          "Comment resolved"
        );

      } catch (error) {

        console.error(
          "Failed to resolve comment",
          error
        );

        toast.error(
          "Failed to resolve comment"
        );
      }
    };

  const fetchVersions =
    async () => {

      if (!documentLoaded) {
          return;
      }

      try {

        const response =
          await api.get(
            `/documents/${id}/versions`
          );

        setVersions(
          response.data.data
        );

        setShowVersionsModal(
          true
        );

      } catch (error) {

        console.error(
          "Failed to fetch versions",
          error
        );

        toast.error(
          "Failed to fetch versions"
        );
      }
    };

  const handleRestoreVersion =
    (version) => {

      if (isReadOnly) {

        toast.error(
          "You do not have permission to restore versions"
        );

        return;
      }

      isRemoteUpdateRef.current =
        true;

      setTitle(
        version.title
      );

      setContent(
        version.content
      );

      collaborativeEditor
        .sendDocumentUpdate(
          version.content
        );

      setShowVersionsModal(
        false
      );

      toast.success(
        "Version restored"
      );
    };

  const fetchActivities =
    async () => {

      if (!documentLoaded) {
          return;
      }

      try {

        const response =
          await api.get(
            `/documents/${id}/activities`
          );

        setActivities(
          response.data.data
        );

        setShowActivityModal(
          true
        );

      } catch (error) {

        console.error(
          "Failed to fetch activities",
          error
        );

        toast.error(
          "Failed to fetch activities"
        );
      }
    };

  const autoSaveDocument =
    async (
      currentTitle,
      currentContent
    ) => {

      if (isReadOnly) {
        return;
      }

      try {

        await api.put(
          `/documents/${id}/autosave`,
          {
            title:
              currentTitle,

            content:
              currentContent
          }
        );

        setSaveStatus(
          "Saved"
        );

        if (
          saveStatusTimeoutRef.current
        ) {

          clearTimeout(
            saveStatusTimeoutRef.current
          );
        }

        saveStatusTimeoutRef.current =
          setTimeout(() => {

            setSaveStatus(
              ""
            );

          }, 2000);

      } catch (error) {

        console.error(
          "Save failed",
          error
        );

        setSaveStatus(
          "Save failed"
        );

        toast.error(
          "Failed to save document"
        );
      }
    };

  useEffect(() => {

    if (loading || !documentLoaded) {
      return;
    }

    if (isReadOnly) {
      return;
    }

    if (
      isInitialLoadRef.current
    ) {

      isInitialLoadRef.current =
        false;

      return;
    }

    if (
      !title &&
      !content
    ) {
      return;
    }

    setSaveStatus(
      "Saving..."
    );

    if (
      autosaveTimeoutRef.current
    ) {

      clearTimeout(
        autosaveTimeoutRef.current
      );
    }

    autosaveTimeoutRef.current =
      setTimeout(() => {

        autoSaveDocument(
          title,
          content
        );

      }, 1500);

    return () => {

      if (
        autosaveTimeoutRef.current
      ) {

        clearTimeout(
          autosaveTimeoutRef.current
        );
      }
    };

  }, [
    title,
    content,
    loading,
    isReadOnly,
    id
  ]);

  useEffect(() => {

    return () => {

      if (
        autosaveTimeoutRef.current
      ) {

        clearTimeout(
          autosaveTimeoutRef.current
        );
      }

      if (
        saveStatusTimeoutRef.current
      ) {

        clearTimeout(
          saveStatusTimeoutRef.current
        );
      }
    };

  }, []);

  const saveVersion =
    async () => {

      if (isReadOnly) {

        toast.error(
          "You do not have permission to edit this document"
        );

        return;
      }

      try {

        await api.put(
          `/documents/${id}`,
          {
            title,
            content
          }
        );

        toast.success(
          "Version saved"
        );

      } catch (error) {

        console.error(
          "Version save failed",
          error
        );

        toast.error(
          "Save failed"
        );
      }
    };

  if (loading) {

    return (

      <div className="p-6">
        Loading...
      </div>
    );
  }

  return (

    <div className="
      min-h-screen
      bg-gray-100
      py-8
    ">

      <div className="
        max-w-5xl
        mx-auto
      ">

        <div className="mb-4">

          <button
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
            className="
              flex
              items-center
              gap-2
              text-gray-600
              hover:text-blue-600
              transition-colors
              duration-200
              cursor-pointer
            "
          >

            <ArrowLeft size={18} />

            Back to Dashboard

          </button>

        </div>

        <div className="
          flex
          justify-between
          items-start
          mb-6
        ">

          <div className="
            flex-1
          ">

            <div className="
              flex
              items-center
              gap-3
            ">

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                disabled={isReadOnly}
                className="
                  w-full
                  text-3xl
                  font-bold
                  bg-transparent
                  border-none
                  outline-none
                  focus:outline-none
                  text-gray-800
                  disabled:text-gray-600
                "
                placeholder="Untitled Document"
              />

              {
                isReadOnly && (

                  <span className="
                    px-3
                    py-1
                    text-sm
                    font-medium
                    bg-gray-200
                    text-gray-700
                    rounded-full
                    whitespace-nowrap
                  ">
                    🔒 Read Only
                  </span>
                )
              }

            </div>

            {
              saveStatus && (

                <div className="
                  text-sm
                  text-gray-500
                  mt-1
                ">
                  {saveStatus}
                </div>
              )
            }

          </div>

          <div className="
            flex
            flex-col
            items-end
            ml-6
          ">

            <div className="
              flex
              -space-x-2
            ">

              {
                activeUsers.map(
                  (user) => (

                    <div
                      key={user}
                      title={user}
                      className="
                        w-8
                        h-8
                        rounded-full
                        bg-blue-600
                        text-white
                        flex
                        items-center
                        justify-center
                        text-sm
                        font-semibold
                        border-2
                        border-white
                      "
                    >

                      {
                        user
                          .split("@")[0]
                          .split(/[._-]/)
                          .slice(0, 2)
                          .map(
                            (part) =>
                              part
                                .charAt(0)
                                .toUpperCase()
                          )
                          .join("")
                      }

                    </div>
                  )
                )
              }

            </div>

            <span className="
              text-sm
              text-gray-500
              mt-2
            ">
              {activeUsers.length} online
            </span>

          </div>

        </div>

        <div className="
          flex
          justify-between
          items-center
          mb-4
        ">

          <div className="
            flex
            gap-2
          ">

            <button
              title="Save"
              onClick={
                saveVersion
              }
              disabled={
                isReadOnly
              }
              className={`
                p-2
                rounded-lg

                ${
                  isReadOnly
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                }
              `}
            >
              <Save size={18} />
            </button>

            <button
              title="Comments"
              onClick={() =>
                setShowCommentsModal(
                  true
                )
              }
              className="
                bg-blue-600
                hover:bg-blue-700
                text-white
                p-2
                rounded-lg
                cursor-pointer
              "
            >
              <MessageSquare size={18} />
            </button>

            <button
              title="History"
              onClick={
                fetchVersions
              }
              className="
                bg-gray-700
                hover:bg-gray-800
                text-white
                p-2
                rounded-lg
                cursor-pointer
              "
            >
              <History size={18} />
            </button>

            <button
              title="Activity"
              onClick={
                fetchActivities
              }
              className="
                bg-purple-600
                hover:bg-purple-700
                text-white
                p-2
                rounded-lg
                cursor-pointer
              "
            >
              <Activity size={18} />
            </button>

          </div>

          <div className="
            flex
            flex-col
            items-end
          ">

            {
              typingUser && (

                <span className="
                  text-xs
                  text-blue-600
                ">

                  {
                    typingUser ===
                    localStorage.getItem(
                      "email"
                    )

                      ? "You"

                      : typingUser
                  }

                  {" "}
                  is typing...

                </span>
              )
            }

            {
              cursorUsers.length > 0 && (

                <div className="
                  text-xs
                  text-purple-600
                ">

                  {
                    cursorUsers.map(
                      (user) => (

                        <div
                          key={
                            user.userEmail
                          }
                        >

                          {
                            user.userEmail
                          }

                          {" active"}

                        </div>
                      )
                    )
                  }

                </div>
              )
            }

          </div>

        </div>

        <div className="
          bg-white
          rounded-lg
          p-6
        ">

          <RichTextEditor
            content={
              content
            }
            setContent={
              setContent
            }
            isReadOnly={
              isReadOnly
            }
            onUserTyping={(value) => {

              if (isReadOnly) {
                return;
              }

              if (
                isRemoteUpdateRef.current
              ) {
                return;
              }

              sendTypingStatus(
                true
              );

              sendCursorPosition(
                value.length
              );

              collaborativeEditor
                .sendDocumentUpdate(
                  value
                );
            }}
          />

        </div>

      </div>

      <CommentsModal
        isOpen={
          showCommentsModal
        }
        documentId={Number(id)}
        comments={
          filteredComments
        }
        onClose={() =>
          setShowCommentsModal(
            false
          )
        }
        onAddComment={
          handleAddComment
        }
        onResolveComment={
          handleResolveComment
        }
        permissionType={
          permissionType
        }
        commentFilter={
          commentFilter
        }
        setCommentFilter={
          setCommentFilter
        }
      />

      <VersionHistoryModal
        isOpen={
          showVersionsModal
        }
        versions={
          versions
        }
        onClose={() =>
          setShowVersionsModal(
            false
          )
        }
        permissionType={
          permissionType
        }
        onRestore={
          handleRestoreVersion
        }
      />

      <ActivityTimelineModal
        isOpen={
          showActivityModal
        }
        activities={
          activities
        }
        onClose={() =>
          setShowActivityModal(
            false
          )
        }
      />

    </div>
  );
}

export default DocumentEditorPage;