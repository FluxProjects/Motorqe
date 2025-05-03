// components/notifications/MessageThread.tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

type ExtendedMessage = Message & {
  sender?: {
    firstName?: string;
    lastName?: string;
    image?: string;
  };
};

export function MessageThread() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const auth = useAuth();
  const params = useParams();
  const [message, setMessage] = useState("");

  const threadId = params.threadId;

  const { data: messages, refetch } = useQuery<ExtendedMessage[]>({
    queryKey: ["message-thread", threadId],
    queryFn: () =>
      fetch(`/api/messages/thread/${threadId}`).then((res) => res.json()),
    enabled: !!threadId,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!message.trim()) {
        throw new Error("Message cannot be empty");
      }

      return fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId,
          senderId: auth.user?.id,
          content: message,
        }),
      }).then((res) => res.json());
    },
    onSuccess: () => {
      setMessage("");
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: t("message.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">{t("message.thread")}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.senderId === auth.user?.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-lg p-3 ${
                msg.senderId === auth.user?.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.senderId !== auth.user?.id && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={msg.sender?.image} />
                    <AvatarFallback>
                      {msg.sender?.firstName?.charAt(0)}
                      {msg.sender?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="text-sm font-medium">
                  {msg.senderId === auth.user?.id
                    ? t("common.you")
                    : `${msg.sender?.firstName} ${msg.sender?.lastName}`}
                </span>
                {msg.createdAt && (
                  <span className="text-xs opacity-70">
                    {format(new Date(msg.createdAt), "p")}
                  </span>
                )}
              </div>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage.mutate();
          }}
          className="flex gap-2"
        >
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("message.typeHere")}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={sendMessage.isPending || !message.trim()}
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
