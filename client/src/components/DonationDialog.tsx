/**
 * 诊费随喜对话框组件 - 围棋主题版
 */

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

interface DonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DonationDialog({ open, onOpenChange }: DonationDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#EBF0F3] text-foreground max-w-2xl p-0 border-0">
        {/* 主图片 */}
        <div className="relative w-full">
          <img 
            src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663279187867/yxEkKNlcIcfCzzho.jpg"
            alt={t.donation.title}
            className="w-full h-auto rounded-lg"
          />
        </div>

        {/* 确认按钮 */}
        <div className="flex justify-center pb-6 px-6">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-primary text-background px-12 py-3 text-lg font-bold rounded-xl hover:scale-105 transition-transform"
          >
            {t.feedback.cancel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
