import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createFeedback, createMessage, deleteFeedback, deleteMessage, getAllFeedbacks, getAllMessages, getMessageStats, likeMessage, markFeedbackAsRead, toggleMessagePin, updateMessage } from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Feedback router for Director's Mailbox
  feedback: router({
    submit: publicProcedure
      .input(
        z.object({
          nickname: z.string().min(1, "昵称不能为空").max(100, "昵称不能超过100个字符"),
          contact: z.string().max(320, "联系方式不能超过320个字符").optional(),
          message: z.string().min(1, "消息内容不能为空"),
        })
      )
      .mutation(async ({ input }) => {
        await createFeedback({
          nickname: input.nickname,
          contact: input.contact || null,
          message: input.message,
        });
        return { success: true };
      }),
    list: publicProcedure.query(async () => {
      return await getAllFeedbacks();
    }),
    markAsRead: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markFeedbackAsRead(input.id);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteFeedback(input.id);
        return { success: true };
      }),
  }),

  // Message board router
  message: router({
    create: publicProcedure
      .input(
        z.object({
          nickname: z.string().min(2, "昵称至少2个字符").max(20, "昵称不能超过20个字符"),
          rank: z.string().max(50, "段位不能超过50个字符").optional(),
          content: z.string().min(1, "留言内容不能为空").max(100, "留言内容不能超过100个字符"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await createMessage({
          nickname: input.nickname,
          rank: input.rank,
          content: input.content,
          userId: ctx.user?.id, // Add userId if user is logged in
        });
        return { success: true };
      }),
    list: publicProcedure
      .input(
        z.object({
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(20),
        }).optional()
      )
      .query(async ({ input }) => {
        const page = input?.page || 1;
        const pageSize = input?.pageSize || 20;
        return await getAllMessages(page, pageSize);
      }),
    like: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await likeMessage(input.id);
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteMessage(input.id);
        return { success: true };
      }),
    stats: publicProcedure.query(async () => {
      return await getMessageStats();
    }),
    togglePin: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await toggleMessagePin(input.id);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({ 
        id: z.number(),
        content: z.string().min(1, "留言内容不能为空").max(100, "留言内容不能超过100个字符")
      }))
      .mutation(async ({ input }) => {
        await updateMessage(input.id, input.content);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
