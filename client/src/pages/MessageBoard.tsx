import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Heart, Loader2, Trash2, ArrowLeft, ChevronLeft, ChevronRight, Pin } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function MessageBoard() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const [nickname, setNickname] = useState("");
  const [rank, setRank] = useState("none");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // 获取留言列表（带分页）
  const { data: messageData, refetch, isLoading } = trpc.message.list.useQuery({
    page: currentPage,
    pageSize,
  });

  const messages = messageData?.messages || [];
  const totalPages = messageData?.totalPages || 0;
  const total = messageData?.total || 0;
  
  // 发布留言
  const createMutation = trpc.message.create.useMutation({
    onSuccess: () => {
      toast.success(t.messageBoard.submitSuccess || "发布成功", {
        description: t.messageBoard.submitSuccessDesc || "您的留言已发布",
      });
      setNickname("");
      setRank("none");
      setContent("");
      setCurrentPage(1); // 回到第一页
      refetch();
    },
    onError: (error) => {
      toast.error(t.messageBoard.submitError || "发布失败", {
        description: error.message,
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
      toast.success(t.messageBoard.deleteSuccess || "删除成功");
      refetch();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        nickname,
        rank: rank === "none" ? undefined : rank,
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
      toast.info(t.messageBoard.alreadyLiked || "您已经点过赞了");
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const rankOptions = [
    { value: "none", label: t.messageBoard.noRank || "保密" },
    // 业余级位（10级到1级）
    { value: "业余10级", label: "业余10级" },
    { value: "业余9级", label: "业余9级" },
    { value: "业余8级", label: "业余8级" },
    { value: "业余7级", label: "业余7级" },
    { value: "业余6级", label: "业余6级" },
    { value: "业余5级", label: "业余5级" },
    { value: "业余4级", label: "业余4级" },
    { value: "业余3级", label: "业余3级" },
    { value: "业余2级", label: "业余2级" },
    { value: "业余1级", label: "业余1级" },
    // 业余段位（1段到8段）
    { value: "业余1段", label: "业余1段" },
    { value: "业余2段", label: "业余2段" },
    { value: "业余3段", label: "业余3段" },
    { value: "业余4段", label: "业余4段" },
    { value: "业余5段", label: "业余5段" },
    { value: "业余6段", label: "业余6段" },
    { value: "业余7段", label: "业余7段" },
    { value: "业余8段", label: "业余8段" },
    // 职业棋手
    { value: "职业棋手", label: "职业棋手" },
  ];

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // 如果总页数小于等于7，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总是显示第一页
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // 显示当前页附近的页码
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // 总是显示最后一页
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-background py-4 px-3">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-3 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.messageBoard.back || "返回"}
        </Button>

        {/* 页面标题 */}
        <h1 className="text-2xl font-bold text-center mb-4 text-foreground">
          {t.messageBoard.title || "留言板"}
        </h1>

        {/* 发布留言表单 */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <h2 className="text-lg font-semibold">{t.messageBoard.postMessage || "发布留言"}</h2>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-3">
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
                  placeholder={t.messageBoard.contentPlaceholder || "分享您的围棋心得、对局感悟...（1-100字符）"}
                  required
                  minLength={1}
                  maxLength={100}
                  rows={5}
                  className="resize-none"
                />
                <div className="text-right text-sm text-muted-foreground mt-1">
                  {content.length}/100
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
        <div className="space-y-3">
          <h2 className="text-lg font-semibold mb-3">
            {t.messageBoard.messageList || "留言列表"} ({total})
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
            <>
              {messages.map((message) => (
                <Card key={message.id} className="py-0.5 gap-0">
                  <CardHeader className="pb-0 pt-1 px-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {message.isPinned === 1 && (
                          <Pin className="h-3 w-3 text-primary fill-primary" />
                        )}
                        <span className="font-semibold text-sm">{message.nickname}</span>
                        {message.rank && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            {message.rank}
                          </span>
                        )}
                        {message.isPinned === 1 && (
                          <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                            置顶
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-0 pt-0 px-4">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-tight">{message.content}</p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between pt-0 pb-0 px-4">
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
              ))}

              {/* 分页导航 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page as number)}
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    )
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
