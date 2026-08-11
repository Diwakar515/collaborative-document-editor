import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../api/axios";

import DocumentCard from "../components/DocumentCard";
import ConfirmModal from "../components/ConfirmModal";
import VersionHistoryModal from "../components/VersionHistoryModal";
import ActivityTimelineModal from "../components/ActivityTimelineModal";
import ShareDocumentModal from "../components/ShareDocumentModal";
import CommentsModal from "../components/CommentsModal";
import NotificationPanel from "../components/NotificationPanel";

import useRealtimeComments from "../hooks/useRealtimeComments";

import stompClient, {
  addStompConnectListener,
  activateStompClient
} from "../websocket/websocket";

function Dashboard() {

  const location = useLocation();
  const navigate = useNavigate();
  const hasShownNavigationToast = useRef(false);

  const [documents, setDocuments] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [
    showDeleteModal,
    setShowDeleteModal
  ] = useState(false);

  const [
    documentToDelete,
    setDocumentToDelete
  ] = useState(null);

  const [
    shareDocumentId,
    setShareDocumentId
  ] = useState(null);

  const [shareEmail, setShareEmail] =
    useState("");

  const [
    sharePermission,
    setSharePermission
  ] = useState("EDITOR");

  const [
    showShareModal,
    setShowShareModal
  ] = useState(false);

  const [sharing, setSharing] =
    useState(false);

  const [
    collaborators,
    setCollaborators
  ] = useState([]);

  const [
    notifications,
    setNotifications
  ] = useState([]);

  const [
    showNotifications,
    setShowNotifications
  ] = useState(false);

  const [versions, setVersions] =
    useState([]);

  const [
    showVersionsModal,
    setShowVersionsModal
  ] = useState(false);

  const [activities, setActivities] =
    useState([]);

  const [
    showActivityModal,
    setShowActivityModal
  ] = useState(false);

  const [comments, setComments] =
    useState([]);

  const [
    commentFilter,
    setCommentFilter
  ] = useState("ACTIVE");

  const [
    showCommentsModal,
    setShowCommentsModal
  ] = useState(false);

  const [
    commentDocumentId,
    setCommentDocumentId
  ] = useState(null);

  const [
    commentPermissionType,
    setCommentPermissionType
  ] = useState(null);

  const [userName, setUserName] =
    useState("");

  const email =
    localStorage.getItem("email");

  useEffect(() => {

    const fetchProfile =
      async () => {

        try {

          const response =
            await api.get(
              "/users/profile"
            );

          setUserName(
            response.data.data.name
          );

        } catch (error) {

          console.error(
            "Failed to fetch profile",
            error
          );
        }
      };

    fetchProfile();

  }, []);

  const fetchNotifications =
    async () => {

      try {

        const response =
          await api.get(
            "/notifications"
          );

        setNotifications(
          response.data.data
        );

      } catch (error) {

        console.error(
          "Failed to fetch notifications",
          error
        );
      }
    };

  const markNotificationAsRead =
    async (notificationId) => {

      try {

        await api.patch(
          `/notifications/${notificationId}/read`
        );

        setNotifications((prev) =>

          prev.map((notification) =>

            notification.id ===
            notificationId

              ? {
                  ...notification,
                  read: true
                }

              : notification
          )
        );

      } catch (error) {

        console.error(
          "Failed to mark notification as read",
          error
        );
      }
    };

  const markAllNotificationsAsRead =
    async () => {

      try {

        await api.patch(
          "/notifications/read-all"
        );

        setNotifications((prev) =>

          prev.map((notification) => ({
            ...notification,
            read: true
          }))
        );

      } catch (error) {

        console.error(
          "Failed to mark all notifications as read",
          error
        );
      }
    };

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

    useRealtimeComments({
      documentId:commentDocumentId,
      setComments
    });

  useEffect(() => {

    const email =
      localStorage.getItem(
        "email"
      );

    if (!email) {
      return;
    }

    let subscription;

    const subscribeToNotifications =
      () => {

        if (
          subscription
        ) {

          subscription.unsubscribe();
        }

        subscription =
          stompClient.subscribe(

            `/topic/notifications/${email}`,

            (message) => {

              try {

                const notification =
                  JSON.parse(
                    message.body
                  );

                setNotifications(
                  (prev) => {

                    const alreadyExists =
                      prev.some(
                        (item) =>
                          item.id ===
                          notification.id
                      );

                    if (
                      alreadyExists
                    ) {
                      return prev;
                    }

                    return [
                      notification,
                      ...prev
                    ];
                  }
                );

              } catch (error) {

                console.error(
                  "Failed to process realtime notification",
                  error
                );
              }
            }
          );
      };

    const removeConnectListener =
      addStompConnectListener(
        subscribeToNotifications
      );

    if (
      stompClient.connected
    ) {

      subscribeToNotifications();
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

  }, []);

  const fetchComments =
    async (
      documentId,
      permissionType
    ) => {

      try {

        const response =
          await api.get(
            `/documents/${documentId}/comments`
          );

        setComments(
          response.data.data
        );

        setCommentDocumentId(
          documentId
        );

        setCommentPermissionType(
          permissionType
        );

        setShowCommentsModal(
          true
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

  const fetchActivities =
    async (documentId) => {

      try {

        const response =
          await api.get(
            `/documents/${documentId}/activities`
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

  const handleAddComment =
    async (content) => {

      if (!content.trim()) {

        toast.error(
          "Comment cannot be empty"
        );

        return;
      }

      try {

        await api.post(
          `/documents/${commentDocumentId}/comments`,
          {
            content
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

  const handleResolveComment = async (commentId) => {

    try {

      await api.patch(

        `/documents/${commentDocumentId}` +
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
    async (documentId) => {

      try {

        const response =
          await api.get(
            `/documents/${documentId}/versions`
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

  const fetchDocuments = () => {

    setLoading(true);

    api.get(
      `/documents?page=${page}` +
      `&size=5` +
      `&search=${search}`
    )
      .then((res) => {

        setDocuments(
          res.data.data.items
        );

        setTotalPages(
          res.data.data.totalPages
        );

        setLoading(false);
      })
      .catch((err) => {

        console.error(
          "Error fetching documents:",
          err
        );

        toast.error(
          "Error fetching documents"
        );

        setLoading(false);
      });
  };

  useEffect(() => {

    fetchDocuments();

  }, [search, page]);

  useEffect(() => {

    fetchNotifications();

  }, []);

  useEffect(() => {

      if (!location.state?.message) {
          hasShownNavigationToast.current = false;
          return;
      }

      if (hasShownNavigationToast.current) {
          return;
      }

      hasShownNavigationToast.current = true;

      toast.error(location.state.message);

      navigate(location.pathname, {
          replace: true,
          state: null
      });

  }, [location, navigate]);

  const handleCreateDocument =
    async () => {

      try {

        const response =
          await api.post(
            "/documents",
            {
              title:
                "Untitled Document",

              content:
                "<p>New Document</p>"
            }
          );

        toast.success(
          "Document created"
        );

        navigate(
          `/documents/${
            response.data.data.id
          }`
        );

      } catch (error) {

        console.error(
          "Failed to create document",
          error
        );

        toast.error(
          "Failed to create document"
        );
      }
    };

  const handleShareDocument =
    async () => {

      if (sharing) {
        return;
      }

      try {

        setSharing(true);

        await api.post(
          `/documents/${shareDocumentId}/share`,
          {
            collaboratorEmail:
              shareEmail,

            permissionType:
              sharePermission
          }
        );

        toast.success(
          "Document shared successfully"
        );

        setShowShareModal(
          false
        );

        setShareEmail(
          ""
        );

        setSharePermission(
          "EDITOR"
        );

      } catch (error) {

        console.error(
          "Share failed",
          error
        );

        toast.error(
          error.response?.data?.message ||
          "Failed to share document"
        );

      } finally {

        setSharing(false);
      }
    };

  const handleRemoveCollaborator =
    async (collaboratorEmail) => {

      try {

        await api.delete(
          `/documents/${shareDocumentId}` +
          `/collaborators/` +
          encodeURIComponent(
            collaboratorEmail
          )
        );

        toast.success(
          "Collaborator removed"
        );

        fetchCollaborators(
          shareDocumentId
        );

      } catch (error) {

        console.error(
          "Failed to remove collaborator",
          error
        );

        toast.error(
          "Failed to remove collaborator"
        );
      }
    };

  const fetchCollaborators =
    async (documentId) => {

      try {

        const response =
          await api.get(
            `/documents/${documentId}` +
            `/collaborators`
          );

        setCollaborators(
          response.data.data
        );

      } catch (error) {

        console.error(
          "Failed to fetch collaborators",
          error
        );

        toast.error(
          "Failed to fetch collaborators"
        );
      }
    };

  const updateCollaboratorPermission =
    async (
      collaboratorEmail,
      permissionType
    ) => {

      try {

        await api.patch(
          `/documents/${shareDocumentId}` +
          `/collaborators/permissions`,
          {
            collaboratorEmail,
            permissionType
          }
        );

        setCollaborators((prev) =>

          prev.map((collaborator) =>

            collaborator
              .collaboratorEmail ===
            collaboratorEmail

              ? {
                  ...collaborator,
                  permissionType
                }

              : collaborator
          )
        );

        toast.success(
          "Permission updated"
        );

        fetchDocuments();

      } catch (error) {

        console.error(
          "Failed to update permission",
          error
        );

        toast.error(
          "Failed to update permission"
        );
      }
    };

  const requestDeleteDocument =
    (id) => {

      setDocumentToDelete(
        id
      );

      setShowDeleteModal(
        true
      );
    };

  const handleDeleteDocument =
    async (id) => {

      try {

        await api.delete(
          `/documents/${id}`
        );

        toast.success(
          "Document deleted"
        );

        fetchDocuments();

      } catch (error) {

        console.error(
          "Delete failed:",
          error.response?.data
        );

        toast.error(
          error.response?.data?.message ||
          "Delete failed"
        );
      }
    };

  const handleLogout = () => {

    if (
      stompClient.connected
    ) {

      stompClient.deactivate();
    }

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "email"
    );

    window.location.reload();
  };

  const unreadNotificationCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  return (

    <div>

      <div className="
        min-h-screen
        bg-gray-100
        p-8
      ">

        <div className="
          max-w-5xl
          mx-auto
        ">

          <div className="
            bg-white
            rounded-2xl
            shadow-md
            px-6
            py-5
            flex
            justify-between
            items-center
            mb-8
            sticky
            top-0
            z-49
            overflow-visible
          ">

            <div>

              <h1 className="
                text-4xl
                font-bold
                text-blue-600
              ">
                Your Documents
              </h1>

              <p className="
                text-gray-500
                mt-1
              ">
                Manage your documents securely
              </p>

            </div>

            <div className="
              flex
              items-center
              gap-5
            ">

              <div className="
                text-right
                group
                relative
              ">

                <p className="
                  font-semibold
                  text-gray-800
                  cursor-default
                ">
                  {userName}
                </p>

                <p className="
                  text-sm
                  text-gray-500
                ">
                  Logged In
                </p>

                <div className="
                  hidden
                  group-hover:block
                  absolute
                  right-0
                  mt-2
                  bg-gray-900
                  text-white
                  text-xs
                  px-3
                  py-2
                  rounded-lg
                  whitespace-nowrap
                  shadow-lg
                  z-50
                ">
                  {email}
                </div>

              </div>

              <div className="relative">

                <button
                  onClick={() =>
                    setShowNotifications(
                      !showNotifications
                    )
                  }
                  className="
                    cursor-pointer
                    relative
                    bg-white
                    border
                    border-gray-300
                    rounded-full
                    px-4
                    py-2
                    hover:bg-gray-100
                    transition-all
                    duration-200
                  "
                >

                  🔔

                  {
                    unreadNotificationCount >
                    0 && (

                      <span className="
                        absolute
                        -top-2
                        -right-2
                        bg-red-500
                        text-white
                        text-xs
                        rounded-full
                        px-2
                        py-1
                      ">
                        {
                          unreadNotificationCount
                        }
                      </span>
                    )
                  }

                </button>

                {
                  showNotifications && (

                    <NotificationPanel
                      notifications={
                        notifications
                      }
                      onNotificationClick={
                        markNotificationAsRead
                      }
                      onMarkAllAsRead={
                        markAllNotificationsAsRead
                      }
                    />
                  )
                }

              </div>

              <button
                onClick={handleLogout}
                className="
                  cursor-pointer
                  bg-gray-800
                  text-white
                  px-5
                  py-2
                  rounded-lg
                  hover:bg-black
                  transition-all
                  duration-200
                "
              >
                Logout
              </button>

            </div>

          </div>

          <div className="mb-6">

            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => {

                setSearch(
                  e.target.value
                );

                setPage(
                  0
                );
              }}
              className="
                w-full
                border
                border-gray-300
                rounded-lg
                px-4
                py-3
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />

          </div>

          <div
            onClick={
              handleCreateDocument
            }
            className="
              bg-white
              rounded-2xl
              shadow-md
              p-6
              mb-8
              cursor-pointer
              hover:shadow-lg
              hover:-translate-y-1
              transition-all
              duration-200
            "
          >

            <div className="
              flex
              items-center
              gap-4
            ">

              <div className="
                w-14
                h-14
                rounded-xl
                bg-blue-600
                text-white
                flex
                items-center
                justify-center
                text-3xl
                font-light
              ">
                +
              </div>

              <div>

                <h2 className="
                  text-xl
                  font-bold
                  text-gray-800
                ">
                  New Document
                </h2>

                <p className="
                  text-gray-500
                ">
                  Create a blank document
                </p>

              </div>

            </div>

          </div>

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-6
          ">

            {
              loading ? (

                <p className="
                  text-center
                  text-lg
                ">
                  Loading documents...
                </p>

              ) : documents.length === 0 ? (

                <div className="
                  bg-white
                  rounded-xl
                  p-10
                  text-center
                  shadow-md
                  col-span-full
                ">

                  <h3 className="
                    text-2xl
                    font-bold
                    text-gray-700
                  ">
                    No documents found
                  </h3>

                  <p className="
                    text-gray-500
                    mt-3
                  ">
                    Try creating a document or changing your search.
                  </p>

                </div>

              ) : (

                documents.map(
                  (doc) => (

                    <DocumentCard
                      key={doc.id}
                      doc={doc}

                      onShare={(documentId) => {

                        setShareDocumentId(documentId);

                        setShareEmail("");

                        setSharePermission("EDITOR");

                        fetchCollaborators(documentId);

                        setShowShareModal(true);
                      }}

                      onDelete={
                        requestDeleteDocument
                      }

                      onHistory={
                        fetchVersions
                      }

                      onActivity={
                        fetchActivities
                      }

                      onComments={(
                        documentId
                      ) =>
                        fetchComments(
                          documentId,
                          doc.permissionType
                        )
                      }
                    />
                  )
                )
              )
            }

          </div>

          <div className="
            flex
            justify-center
            items-center
            gap-4
            mt-10
          ">

            <button
              onClick={() =>
                setPage(
                  page - 1
                )
              }
              disabled={
                page === 0
              }
              className="
                cursor-pointer
                disabled:cursor-not-allowed
                bg-gray-700
                text-white
                px-4
                py-2
                rounded-lg
                disabled:opacity-50
                transition-all
                duration-200
              "
            >
              Previous
            </button>

            <span className="
              font-semibold
            ">
              Page {page + 1} of {totalPages}
            </span>

            <button
              onClick={() =>
                setPage(
                  page + 1
                )
              }
              disabled={
                page + 1 >=
                totalPages
              }
              className="
                cursor-pointer
                disabled:cursor-not-allowed
                bg-gray-700
                text-white
                px-4
                py-2
                rounded-lg
                disabled:opacity-50
                transition-all
                duration-200
              "
            >
              Next
            </button>

          </div>

        </div>

        <ConfirmModal
          isOpen={
            showDeleteModal
          }
          title={
            "Delete Document"
          }
          message={
            "Are you sure you want to delete this document?"
          }
          onCancel={() => {

            setShowDeleteModal(
              false
            );

            setDocumentToDelete(
              null
            );
          }}
          onConfirm={() => {

            handleDeleteDocument(
              documentToDelete
            );

            setShowDeleteModal(
              false
            );

            setDocumentToDelete(
              null
            );
          }}
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
          onRestore={() => {}}
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

        <CommentsModal
          isOpen={
            showCommentsModal
          }
          documentId={commentDocumentId}
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
            commentPermissionType
          }
          commentFilter={
            commentFilter
          }
          setCommentFilter={
            setCommentFilter
          }
        />

        <ShareDocumentModal
          isOpen={
            showShareModal
          }
          onClose={() =>{
            setShowShareModal(
              false
            )
            setShareEmail("");

            setSharePermission("EDITOR");
          }}
          shareEmail={
            shareEmail
          }
          setShareEmail={
            setShareEmail
          }
          onShare={
            handleShareDocument
          }
          sharing={
            sharing
          }
          sharePermission={
            sharePermission
          }
          setSharePermission={
            setSharePermission
          }
          collaborators={
            collaborators
          }
          onUpdatePermission={
            updateCollaboratorPermission
          }
          onRemoveCollaborator={
            handleRemoveCollaborator
          }
        />

      </div>

    </div>
  );
}

export default Dashboard;