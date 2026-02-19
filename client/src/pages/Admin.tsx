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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, CheckCircle2, Mail, MessageSquare, ThumbsUp, TrendingUp } from "lucide-react";
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
  const [feedbackSearchTerm, setFeedbackSearchTerm] = useState("");
  const [messageSearchTerm, setMessageSearchTerm] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const utils = trpc.useUtils();
  
  // Feedback queries
  const { data: feedbacks, isLoading: feedbacksLoading } = trpc.feedback.list.useQuery();
  
  // Message queries
  const { data: messageData, isLoading: messagesLoading } = trpc.message.list.useQuery({ page: 1, pageSize: 100 });
  const { data: messageStats } = trpc.message.stats.useQuery();
  const messages = messageData?.messages || [];
  
  // Feedback mutations
  const markAsReadMutation = trpc.feedback.markAsRead.useMutation({
    onSuccess: () => {
      utils.feedback.list.invalidate();
      toast.success("已标记为已读");
    },
    onError: () => {
      toast.error("标记失败，请重试");
    },
  });
  
  const deleteFeedbackMutation = trpc.feedback.delete.useMutation({
    onSuccess: () => {
      utils.feedback.list.invalidate();
      toast.success("删除成功");
    },
    onError: () => {
      toast.error("删除失败，请重试");
    },
  });

  // Message mutations
  const deleteMessageMutation = trpc.message.delete.useMutation({
    onSuccess: () => {
      utils.message.list.invalidate();
      utils.message.stats.invalidate();
      toast.success("留言删除成功");
    },
    onError: () => {
      toast.error("删除失败，请重试");
    },
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate({ id });
  };

  const handleDeleteFeedback = (id: number) => {
    if (confirm("确定要删除这条反馈吗？")) {
      deleteFeedbackMutation.mutate({ id });
    }
  };

  const handleDeleteMessage = (id: number) => {
    if (confirm("确定要删除这条留言吗？")) {
      deleteMessageMutation.mutate({ id });
    }
  };

  const filteredFeedbacks = feedbacks?.filter(
    (feedback) =>
      feedback.nickname.toLowerCase().includes(feedbackSearchTerm.toLowerCase()) ||
      feedback.message.toLowerCase().includes(feedbackSearchTerm.toLowerCase()) ||
      (feedback.contact && feedback.contact.toLowerCase().includes(feedbackSearchTerm.toLowerCase()))
  );

  const filteredMessages = messages.filter(
    (message) =>
      message.nickname.toLowerCase().includes(messageSearchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(messageSearchTerm.toLowerCase()) ||
      (message.rank && message.rank.toLowerCase().includes(messageSearchTerm.toLowerCase()))
  );

  const unreadCount = feedbacks?.filter((f) => f.isRead === 0).length || 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">管理后台</h1>
            <p className="text-muted-foreground mt-1">
              院长信箱和留言板管理
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            返回主页
          </Button>
        </div>

        <Tabs defaultValue="feedback" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              院长信箱
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              留言板
            </TabsTrigger>
          </TabsList>

          {/* 院长信箱管理 */}
          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>反馈统计</CardTitle>
                <CardDescription>
                  共 {feedbacks?.length || 0} 条反馈，{unreadCount} 条未读
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="mb-4">
              <Input
                type="text"
                placeholder="搜索昵称、联系方式或反馈内容..."
                value={feedbackSearchTerm}
                onChange={(e) => setFeedbackSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            {feedbacksLoading ? (
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
                              onClick={() => handleDeleteFeedback(feedback.id)}
                              disabled={deleteFeedbackMutation.isPending}
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
                {feedbackSearchTerm ? "没有找到匹配的反馈" : "暂无反馈"}
              </div>
            )}
          </TabsContent>

          {/* 留言板管理 */}
          <TabsContent value="messages" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总留言数</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{messageStats?.totalMessages || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">今日新增</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{messageStats?.todayMessages || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总点赞数</CardTitle>
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{messageStats?.totalLikes || 0}</div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-4">
              <Input
                type="text"
                placeholder="搜索昵称、段位或留言内容..."
                value={messageSearchTerm}
                onChange={(e) => setMessageSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            {messagesLoading ? (
              <div className="text-center py-12 text-muted-foreground">加载中...</div>
            ) : filteredMessages && filteredMessages.length > 0 ? (
              <div className="bg-card rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">昵称</TableHead>
                      <TableHead className="w-[120px]">段位</TableHead>
                      <TableHead>留言内容</TableHead>
                      <TableHead className="w-[100px]">点赞数</TableHead>
                      <TableHead className="w-[180px]">发布时间</TableHead>
                      <TableHead className="w-[100px] text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMessages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-medium">{message.nickname}</TableCell>
                        <TableCell>
                          {message.rank ? (
                            <Badge variant="outline">{message.rank}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-md truncate cursor-pointer hover:text-primary" onClick={() => setSelectedMessage(message)}>
                          {message.content}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                            <span>{message.likes}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(message.createdAt).toLocaleString("zh-CN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMessage(message.id)}
                            disabled={deleteMessageMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {messageSearchTerm ? "没有找到匹配的留言" : "暂无留言"}
              </div>
            )}
          </TabsContent>
        </Tabs>

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
                      handleDeleteFeedback(selectedFeedback.id);
                      setSelectedFeedback(null);
                    }}
                    disabled={deleteFeedbackMutation.isPending}
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

        {/* 查看完整留言对话框 */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>留言详情</DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">昵称</label>
                  <p className="mt-1 text-foreground">{selectedMessage.nickname}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">段位</label>
                  <p className="mt-1 text-foreground">{selectedMessage.rank || "未提供"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">留言内容</label>
                  <p className="mt-1 text-foreground whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">点赞数</label>
                  <p className="mt-1 text-foreground">{selectedMessage.likes}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">发布时间</label>
                  <p className="mt-1 text-foreground">
                    {new Date(selectedMessage.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDeleteMessage(selectedMessage.id);
                      setSelectedMessage(null);
                    }}
                    disabled={deleteMessageMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除留言
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedMessage(null)}>
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
