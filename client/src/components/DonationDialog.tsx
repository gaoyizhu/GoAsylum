import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

interface DonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DonationDialog({ open, onOpenChange }: DonationDialogProps) {
  const { t } = useLanguage();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const wechatQRCode = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663279187867/bISbzoPHqhSaBYSZ.jpg";
  const alipayQRCode = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663279187867/fNRKJNFRDTkbLaoP.jpg";

  const amounts = [10, 20, 50];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#EBF0F3] text-foreground max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{t.donation.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 说明文案 */}
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>{t.donation.description}</p>
            <p className="text-xs">{t.donation.usage}</p>
          </div>

          {/* 建议金额 */}
          <div className="space-y-3">
            <p className="text-center font-medium">{t.donation.suggestedAmount}</p>
            <div className="flex gap-3 justify-center">
              {amounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  onClick={() => setSelectedAmount(amount)}
                  className={`px-6 py-2 ${
                    selectedAmount === amount 
                      ? 'bg-primary text-background' 
                      : 'bg-white border-primary text-foreground hover:bg-primary/10'
                  }`}
                >
                  ¥{amount}
                </Button>
              ))}
            </div>
          </div>

          {/* 收款码 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 微信收款码 */}
            <div className="flex flex-col items-center space-y-2">
              <p className="font-medium text-sm">{t.donation.wechat}</p>
              <div className="relative bg-white p-2 rounded-lg shadow-md">
                <img 
                  src={wechatQRCode} 
                  alt="微信收款码" 
                  className="w-36 h-36 object-contain"
                />
                {/* 水印 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-xs font-bold text-black/30 rotate-[-30deg] whitespace-nowrap">
                    围棋疯人院官方
                  </div>
                </div>
              </div>
            </div>

            {/* 支付宝收款码 */}
            <div className="flex flex-col items-center space-y-2">
              <p className="font-medium text-sm">{t.donation.alipay}</p>
              <div className="relative bg-white p-2 rounded-lg shadow-md">
                <img 
                  src={alipayQRCode} 
                  alt="支付宝收款码" 
                  className="w-36 h-36 object-contain"
                />
                {/* 水印 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-xs font-bold text-black/30 rotate-[-30deg] whitespace-nowrap">
                    围棋疯人院官方
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              💡 {t.donation.note}
            </p>
            <p className="text-sm font-medium text-primary">{t.donation.disclaimer}</p>
          </div>

          {/* 确认按钮 */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-primary text-background px-8 py-2"
            >
              确认
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
