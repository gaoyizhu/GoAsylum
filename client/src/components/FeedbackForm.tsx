import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/language-context";

interface FeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackForm({ open, onOpenChange }: FeedbackFormProps) {
  const { t } = useLanguage();
  const [nickname, setNickname] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      toast.success(t.feedback?.submitSuccess || "提交成功！感谢您的反馈。");
      setNickname("");
      setContact("");
      setMessage("");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || t.feedback?.submitError || "提交失败，请稍后重试。");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      toast.error(t.feedback?.nicknameRequired || "请输入昵称");
      return;
    }
    
    if (!message.trim()) {
      toast.error(t.feedback?.messageRequired || "请输入反馈内容");
      return;
    }

    setIsSubmitting(true);
    submitFeedback.mutate({
      nickname: nickname.trim(),
      contact: contact.trim() || undefined,
      message: message.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground sm:max-w-[425px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            {t.home?.directorMailbox || "院长信箱"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">
              {t.feedback?.nickname || "昵称"} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t.feedback?.nicknamePlaceholder || "请输入您的昵称"}
              maxLength={100}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact">
              {t.feedback?.contact || "联系方式"} ({t.feedback?.optional || "可选"})
            </Label>
            <Input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={t.feedback?.contactPlaceholder || "邮箱或微信"}
              maxLength={320}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">
              {t.feedback?.message || "反馈内容"} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.feedback?.messagePlaceholder || "请输入您的反馈内容"}
              rows={5}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="flex justify-center gap-2 sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t.feedback?.cancel || "取消"}
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (t.feedback?.submitting || "提交中...") : (t.feedback?.submit || "提交")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
