import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Copy, Facebook, Twitter, Mail, MessageCircle, LinkedinIcon } from "lucide-react";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  url?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ open, onClose, title, url }) => {
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title || document.title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Link copied to clipboard. Share it anywhere you like.",
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy the link.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Share Now</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2"
            onClick={() => window.open(`https://wa.me/?text=${encodedTitle}%0A${encodedUrl}`, "_blank")}
          >
            <MessageCircle size={18} /> <span>WhatsApp</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2"
            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank")}
          >
            <Facebook size={18} /> <span>Facebook</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2"
            onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, "_blank")}
          >
            <Twitter size={18} /> <span>Twitter</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2"
            onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank")}
          >
            <LinkedinIcon size={18} /> <span>LinkedIn</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2"
            onClick={() => window.open(`mailto:?subject=${encodedTitle}&body=${encodedUrl}`, "_blank")}
          >
            <Mail size={18} /> <span>Email</span>
          </Button>
        </div>

        <Button
          variant="default"
          className="w-full mt-4 flex items-center justify-center space-x-2"
          onClick={handleCopy}
        >
          <Copy size={18} /> <span>Copy Link</span>
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;