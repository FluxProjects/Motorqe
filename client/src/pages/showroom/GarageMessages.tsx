import {
  Search,
  Send,
  MoreHorizontal,
  MessageCircle,
  Users,
  Heart,
  Calendar,
  User,
  LogOut,
  Inbox,
  Mail,
  MailOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import GarageNavigation from "@/components/showroom/GarageNavigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { MessageSquareText, Phone, MessageSquareOff, ShieldAlert, UserX } from "lucide-react";

interface Message {
  id: number;
  content: string;
  createdAt: string;
  sender_id: number;
  receiver_id: number;
  sender_username: string;
  receiver_username: string;
  status: string;
  type: string;
}

export default function GarageMessaging() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "unread">(
    "inbox"
  );
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Fetch messages based on user role
  const {
    data: messages = [],
    isLoading,
    refetch,
    error,
  } = useQuery<Message[]>({
    queryKey: ["/api/messages", user?.id, user?.roleId],
    enabled: !!user?.id,
    queryFn: async () => {
      const isAdmin = user?.roleId === 1 || user?.roleId === 2;

      if (isAdmin) {
        const res = await fetch(`/api/messages/all`);
        if (!res.ok) throw new Error("Failed to fetch all messages");
        return res.json();
      } else {
        const res = await fetch(`/api/messages/${user?.id}`);
        if (!res.ok) throw new Error("Failed to fetch user messages");
        return res.json();
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete message");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", user?.id] });
    },
  });

  // Mutation for updating message status
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: "read" | "unread";
    }) => {
      const res = await fetch(`/api/messages/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update message status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (replyData: {
      originalMessageId: number;
      content: string;
      senderId: number;
      receiverId: number;
    }) => {
      const res = await fetch(`/api/messages/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(replyData),
      });
      if (!res.ok) throw new Error("Failed to send reply");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", user?.id] });
      setNewMessage("");
    },
  });

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedMessage) {
      replyMutation.mutate({
        originalMessageId: selectedMessage.id,
        content: newMessage,
        senderId: user?.id || 0,
        receiverId:
          selectedMessage.sender_id === user?.id
            ? selectedMessage.receiver_id
            : selectedMessage.sender_id,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTabClick = (tab: "inbox" | "sent" | "unread") => {
    setActiveTab(tab);
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
  };

  // Handle opening WhatsApp chat
  const handleWhatsAppClick = () => {
    if (!selectedMessage) return;

    const otherUserId =
      selectedMessage.sender_id === user?.id
        ? selectedMessage.receiver_id
        : selectedMessage.sender_id;
    const phoneNumber =
      selectedMessage.sender_id === user?.id
        ? selectedMessage.receiver_phone
        : selectedMessage.sender_phone;

    if (phoneNumber) {
      window.open(`https://wa.me/${phoneNumber}`, "_blank");
    } else {
      alert("Phone number not available for this user");
    }
  };

  const handleCallClick = () => {
    if (!selectedMessage) return;

    const phoneNumber =
      selectedMessage.sender_id === user?.id
        ? selectedMessage.receiver_phone
        : selectedMessage.sender_phone;

    if (phoneNumber) {
      // Open the default phone app (works on mobile or with tel handlers)
      window.open(`tel:${phoneNumber}`);
    } else {
      alert("Phone number not available for this user");
    }
  };

  // Handle marking message as read/unread
  const handleMarkAsUnread = () => {
    if (selectedMessage) {
      const newStatus = selectedMessage.status === "read" ? "unread" : "read";
      updateStatusMutation.mutate({
        id: selectedMessage.id,
        status: newStatus,
      });
      setShowActions(false);
    }
  };

  const handleDeleteMessage = (id: number) => {
    if (
      confirm(
        t("admin.confirmDeleteMessage") ||
          "Are you sure you want to delete this message?"
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  // Filter messages based on active tab
  const filteredMessages = messages.filter((msg) => {
    if (activeTab === "inbox") return msg.receiver_id === user?.id;
    if (activeTab === "sent") return msg.sender_id === user?.id;
    if (activeTab === "unread")
      return msg.status === "unread" && msg.receiver_id === user?.id;
    return true;
  });

  // Group messages by conversation (sender-receiver pair)
  const conversations = filteredMessages.reduce((acc: any[], message) => {
    const otherUserId =
      message.sender_id === user?.id ? message.receiver_id : message.sender_id;
    const otherUsername =
      message.sender_id === user?.id
        ? message.receiver_username
        : message.sender_username;

    const existingConversation = acc.find(
      (conv) =>
        conv.participants.includes(message.sender_id) &&
        conv.participants.includes(message.receiver_id)
    );

    if (existingConversation) {
      existingConversation.messages.push(message);
      if (
        new Date(message.created_at) >
        new Date(existingConversation.lastMessageDate)
      ) {
        existingConversation.lastMessage = message.content;
        existingConversation.lastMessageDate = message.created_at;
      }
    } else {
      acc.push({
        id: otherUserId,
        participants: [message.sender_id, message.receiver_id],
        name: otherUsername,
        lastMessage: message.content,
        lastMessageDate: message.created_at,
        subject: message.type,
        avatar: otherUsername.substring(0, 2).toUpperCase(),
        messages: [message],
        unread: message.status === "unread" && message.receiver_id === user?.id,
      });
    }

    return acc;
  }, []);

  // Sort conversations by most recent message
  conversations.sort(
    (a, b) =>
      new Date(b.lastMessageDate).getTime() -
      new Date(a.lastMessageDate).getTime()
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return "Today";
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showActions]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading messages</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sub Navigation */}
      <GarageNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          {/* Page Title */}
          <h1 className="text-2xl font-semibold text-gray-900">My Inbox</h1>
        </div>

        {/* Messaging Interface */}
        <div className="border-2 border-orange-500 rounded-2xl overflow-hidden bg-white">
          <div className="flex h-[500px]">
            {/* Left Sidebar - Conversations List */}
            <div className="w-80 border-r-2 border-orange-500">
              {/* Inbox Tabs */}
              <div className="flex border-b-2 border-orange-500/25 p-4 space-x-3 bg-neutral-50">
                <button
                  onClick={() => handleTabClick("inbox")}
                  className={`flex-1 px-3 py-2 text-sm font-medium flex items-center justify-center space-x-2 transition-all duration-200
      ${
        activeTab === "inbox"
          ? "text-orange-500 border-b-2 border-orange-500"
          : "text-blue-900 border-b-2 border-transparent hover:border-blue-900"
      }
    `}
                >
                  <Inbox
                    className={`w-4 h-4 ${
                      activeTab === "inbox"
                        ? "text-orange-500"
                        : "text-blue-900"
                    }`}
                  />
                  <span>Inbox</span>
                </button>

                <button
                  onClick={() => handleTabClick("sent")}
                  className={`flex-1 px-3 py-2 text-sm font-medium flex items-center justify-center space-x-2 transition-all duration-200
      ${
        activeTab === "sent"
          ? "text-orange-500 border-b-2 border-orange-500"
          : "text-blue-900 border-b-2 border-transparent hover:border-blue-900"
      }
    `}
                >
                  <svg
                    className={`w-4 h-4 ${
                      activeTab === "sent" ? "text-orange-500" : "text-blue-900"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 20v-6l8-2-8-2V4l18 8-18 8z" />
                  </svg>
                  <span>Sent</span>
                </button>

                <button
                  onClick={() => handleTabClick("unread")}
                  className={`flex-1 px-3 py-2 text-sm font-medium flex items-center justify-center space-x-2 transition-all duration-200
      ${
        activeTab === "unread"
          ? "text-orange-500 border-b-2 border-orange-500"
          : "text-blue-900 border-b-2 border-transparent hover:border-blue-900"
      }
    `}
                >
                  <MailOpen
                    className={`w-4 h-4 ${
                      activeTab === "unread"
                        ? "text-orange-500"
                        : "text-blue-900"
                    }`}
                  />
                  <span>Unread</span>
                </button>
              </div>

              {/* Search */}
              <div className="p-3 border-neutral-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search messages..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="p-3 space-y-2 overflow-y-auto h-full">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() =>
                      handleMessageClick(
                        conversation.messages[conversation.messages.length - 1]
                      )
                    }
                    className={`flex items-start space-x-3 p-2 rounded cursor-pointer ${
                      selectedMessage?.id ===
                      conversation.messages[conversation.messages.length - 1].id
                        ? "bg-gray-50"
                        : "hover:bg-gray-50"
                    } ${conversation.unread ? "font-semibold" : ""}`}
                  >
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mt-1">
                      <span className="text-xs font-semibold text-gray-600">
                        {conversation.avatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-sm ${
                            conversation.unread
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {conversation.name}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatDate(conversation.lastMessageDate)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-900">
                        {conversation.subject}
                      </p>
                      <p
                        className={`text-xs truncate ${
                          conversation.unread
                            ? "text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {conversation.lastMessage.length > 30
                          ? `${conversation.lastMessage.substring(0, 30)}...`
                          : conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Chat Area */}
            <div className="flex-1 flex flex-col relative">
              {/* Chat Header */}
              {selectedMessage ? (
                <div className="p-4 border-b-2 border-orange-500/25 bg-neutral-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-300 rounded flex items-center justify-center">
                        <div className="text-xs font-semibold text-gray-600">
                          {selectedMessage.sender_id === user?.id
                            ? selectedMessage.receiver_username
                                .substring(0, 2)
                                .toUpperCase()
                            : selectedMessage.sender_username
                                .substring(0, 2)
                                .toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedMessage.sender_id === user?.id
                            ? selectedMessage.receiver_username
                            : selectedMessage.sender_username}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedMessage.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 relative">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-sm"
                        onClick={handleWhatsAppClick}
                      >
                        <MessageSquareText className="w-4 h-4 text-blue-900 mr-1" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-sm"
                        onClick={handleCallClick}
                      >
                        <Phone className="w-4 h-4 text-blue-900 mr-1" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-2 py-1 relative"
                        onClick={() => setShowActions(!showActions)}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      Select a conversation
                    </h3>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {selectedMessage ? (
                  conversations
                    .find(
                      (conv) =>
                        conv.id ===
                        (selectedMessage.sender_id === user?.id
                          ? selectedMessage.receiver_id
                          : selectedMessage.sender_id)
                    )
                    ?.messages.sort(
                      (a, b) =>
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                    )
                    .map((message) => (
                      <div
                        key={message.id}
                        className={
                          message.sender_id === user?.id
                            ? "flex justify-end"
                            : "flex items-start space-x-3"
                        }
                      >
                        {message.sender_id !== user?.id && (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                        <div
                          className={`rounded-lg p-3 max-w-xs ${
                            message.sender_id === user?.id
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <p className="text-sm text-gray-900">
                            {message.content}
                          </p>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(message.created_at).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">
                      Select a conversation to view messages
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons Dropdown */}
              {showActions && selectedMessage && (
                <div
                  ref={actionMenuRef}
                  className="absolute right-4 top-16 z-20"
                >
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-1 w-56">
                    <button
                      onClick={() => {
                        handleDeleteMessage(selectedMessage.id);
                        setShowActions(false);
                      }}
                      className="flex items-center space-x-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left p-2 rounded"
                    >
                      <MessageSquareOff className="w-4 h-4 text-blue-900" />
                      <span>Delete conversation</span>
                    </button>

                    <button
                      onClick={handleMarkAsUnread}
                      className="flex items-center space-x-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left p-2 rounded"
                    >
                      <Mail className="w-4 h-4 text-blue-900" />
                      <span>
                        {selectedMessage.status === "read" ? "Mark as unread" : "Mark as read"}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        console.log("Block user clicked");
                        setShowActions(false);
                      }}
                      className="flex items-center space-x-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left p-2 rounded"
                    >
                      <UserX className="w-4 h-4 text-blue-900" />
                      <span>Block user</span>
                    </button>

                    <button
                      onClick={() => {
                        console.log("Report clicked");
                        setShowActions(false);
                      }}
                      className="flex items-center space-x-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left p-2 rounded"
                    >
                      <ShieldAlert className="w-4 h-4 text-blue-900" />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              {selectedMessage && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type Text Here..."
                      className="flex-1 bg-white"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="px-3"
                      onClick={() => console.log("Emoji clicked")}
                    >
                      😊
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="px-3"
                      onClick={() => console.log("Attachment clicked")}
                    >
                      📎
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      className="bg-motorqe-orange hover:bg-orange-600 text-white px-3"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
