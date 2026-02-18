import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, CheckCircle2, Mail } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Admin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const utils = trpc.useUtils();
  
  const { data: feedbacks, isLoading } = trpc.feedback.list.useQuery();
  
  const markAsReadMutation = trpc.feedback.markAsRead.useMutation({
    onSuccess: () => {
      utils.feedback.list.invalidate();
      toast.success("已标记为已读");
    },
    onError: () => {
      toast.error("标记失败，请重试");
    },
  });
  
  const deleteMutation = trpc.feedback.delete.useMutation({
    onSuccess: () => {
      utils.feedback.list.invalidate();
      toast.success("删除成功");
    },
    onError: () => {
      toast.error("删除失败，请重试");
    },
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate({ id });
  };

  const handleDelete = (id: number) => {
    if (confirm("确定要删除这条反馈吗？")) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredFeedbacks = feedbacks?.filter(
    (feedback) =>
      feedback.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (feedback.contact && feedback.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const unreadCount = feedbacks?.filter((f) => f.isRead === 0).length || 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">院长信箱管理</h1>
            <p className="text-muted-foreground mt-1">
              共 {feedbacks?.length || 0} 条反馈，{unreadCount} 条未读
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            返回主页
          </Button>
        </div>

        <div className="mb-4">
          <Input
            type="text"
            placeholder="搜索昵称、联系方式或反馈内容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">加载中...</div>
        ) : filteredFeedbacks && filteredFeedbacks.length > 0 ? (
          <div className="bg-card rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">状态</TableHead>
                  <TableHead className="w-[150px]">昵称</TableHead>
                  <TableHead className="w-[200px]">联系方式</TableHead>
                  <TableHead>反馈内容</TableHead>
                  <TableHead className="w-[180px]">提交时间</TableHead>
                  <TableHead className="w-[150px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>
                      {feedback.isRead === 0 ? (
                        <Badge variant="default" className="bg-blue-500">
                          <Mail className="w-3 h-3 mr-1" />
                          未读
                        </Badge>
                      ) : (
                        <Badge variant="secondary">已读</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{feedback.nickname}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {feedback.contact || "-"}
                    </TableCell>
                    <TableCell className="max-w-md truncate cursor-pointer hover:text-primary" onClick={() => setSelectedFeedback(feedback)}>
                      {feedback.message}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(feedback.createdAt).toLocaleString("zh-CN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {feedback.isRead === 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(feedback.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(feedback.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {searchTerm ? "没有找到匹配的反馈" : "暂无反馈"}
          </div>
        )}

        {/* 查看完整反馈对话框 */}
        <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>反馈详情</DialogTitle>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">昵称</label>
                  <p className="mt-1 text-foreground">{selectedFeedback.nickname}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">联系方式</label>
                  <p className="mt-1 text-foreground">{selectedFeedback.contact || "未提供"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">反馈内容</label>
                  <p className="mt-1 text-foreground whitespace-pre-wrap">{selectedFeedback.message}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">提交时间</label>
                  <p className="mt-1 text-foreground">
                    {new Date(selectedFeedback.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  {selectedFeedback.isRead === 0 && (
                    <Button
                      onClick={() => {
                        handleMarkAsRead(selectedFeedback.id);
                        setSelectedFeedback(null);
                      }}
                      disabled={markAsReadMutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      标记为已读
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDelete(selectedFeedback.id);
                      setSelectedFeedback(null);
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除反馈
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedFeedback(null)}>
                    关闭
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
