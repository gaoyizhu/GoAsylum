import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Heart, Loader2, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { toast } from "sonner";

export default function MessageBoard() {
  const { t } = useLanguage();

  
  const [nickname, setNickname] = useState("");
  const [rank, setRank] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取留言列表
  const { data: messages = [], refetch, isLoading } = trpc.message.list.useQuery();
  
  // 发布留言
  const createMutation = trpc.message.create.useMutation({
    onSuccess: () => {
      toast({
        title: t.messageBoard.submitSuccess || "发布成功",
        description: t.messageBoard.submitSuccessDesc || "您的留言已发布",
      });
      setNickname("");
      setRank("");
      setContent("");
      refetch();
    },
    onError: (error) => {
      toast({
        title: t.messageBoard.submitError || "发布失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 点赞
  const likeMutation = trpc.message.like.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // 删除（管理员功能）
  const deleteMutation = trpc.message.delete.useMutation({
    onSuccess: () => {
      toast({
        title: t.messageBoard.deleteSuccess || "删除成功",
      });
      refetch();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        nickname,
        rank: rank || undefined,
        content,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = (id: number) => {
    // 检查本地存储，防止重复点赞
    const likedMessages = JSON.parse(localStorage.getItem("likedMessages") || "[]");
    if (likedMessages.includes(id)) {
      toast({
        title: t.messageBoard.alreadyLiked || "您已经点过赞了",
        variant: "default",
      });
      return;
    }
    
    likeMutation.mutate({ id });
    localStorage.setItem("likedMessages", JSON.stringify([...likedMessages, id]));
  };

  const handleDelete = (id: number) => {
    if (confirm(t.messageBoard.confirmDelete || "确定要删除这条留言吗？")) {
      deleteMutation.mutate({ id });
    }
  };

  const rankOptions = [
    { value: "", label: t.messageBoard.noRank || "不选择" },
    { value: "业余1段", label: "业余1段" },
    { value: "业余2段", label: "业余2段" },
    { value: "业余3段", label: "业余3段" },
    { value: "业余4段", label: "业余4段" },
    { value: "业余5段", label: "业余5段" },
    { value: "业余6段", label: "业余6段" },
    { value: "业余7段", label: "业余7段" },
    { value: "专业初段", label: "专业初段" },
    { value: "专业二段", label: "专业二段" },
    { value: "专业三段", label: "专业三段" },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <h1 className="text-3xl font-bold text-center mb-8 text-foreground">
          {t.messageBoard.title || "留言板"}
        </h1>

        {/* 发布留言表单 */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">{t.messageBoard.postMessage || "发布留言"}</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.messageBoard.nickname || "昵称"} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={t.messageBoard.nicknamePlaceholder || "请输入您的昵称（2-20字符）"}
                    required
                    minLength={2}
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.messageBoard.rank || "围棋段位"}
                  </label>
                  <Select value={rank} onValueChange={setRank}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.messageBoard.selectRank || "选择段位（可选）"} />
                    </SelectTrigger>
                    <SelectContent>
                      {rankOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.messageBoard.content || "留言内容"} <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t.messageBoard.contentPlaceholder || "分享您的围棋心得、对局感悟...（10-500字符）"}
                  required
                  minLength={10}
                  maxLength={500}
                  rows={5}
                  className="resize-none"
                />
                <div className="text-right text-sm text-muted-foreground mt-1">
                  {content.length}/500
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.messageBoard.submitting || "发布中..."}
                  </>
                ) : (
                  t.messageBoard.submit || "发布留言"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 留言列表 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">
            {t.messageBoard.messageList || "留言列表"} ({messages.length})
          </h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {t.messageBoard.noMessages || "还没有留言，快来发布第一条吧！"}
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card key={message.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{message.nickname}</span>
                      {message.rank && (
                        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                          {message.rank}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(message.id)}
                    disabled={likeMutation.isPending}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    {message.likes}
                  </Button>
                  {/* 管理员删除按钮 - 暂时隐藏，可以后续添加权限判断 */}
                  {false && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(message.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
