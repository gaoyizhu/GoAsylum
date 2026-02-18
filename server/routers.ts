import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createFeedback, getAllFeedbacks } from "./db";

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
  }),
});

export type AppRouter = typeof appRouter;
