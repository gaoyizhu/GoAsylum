import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import type { Context } from './_core/trpc';

// Mock context for testing
const mockContext: Context = {
  req: {} as any,
  res: {} as any,
  user: undefined,
};

describe('Message Board API', () => {
  const caller = appRouter.createCaller(mockContext);
  let testMessageId: number;

  it('should create a new message', async () => {
    const result = await caller.message.create({
      nickname: '测试用户',
      rank: '业余1段',
      content: '这是一条测试留言，用于验证留言板功能是否正常工作。围棋是一项非常有趣的运动！',
    });

    expect(result).toEqual({ success: true });
  });

  it('should fail to create message with short nickname', async () => {
    await expect(
      caller.message.create({
        nickname: '测',
        content: '这是一条测试留言，用于验证留言板功能是否正常工作。',
      })
    ).rejects.toThrow();
  });

  it('should fail to create message with short content', async () => {
    await expect(
      caller.message.create({
        nickname: '测试用户',
        content: '太短了',
      })
    ).rejects.toThrow();
  });

  it('should get message list', async () => {
    const messages = await caller.message.list();
    
    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThan(0);
    
    const latestMessage = messages[0];
    expect(latestMessage).toHaveProperty('id');
    expect(latestMessage).toHaveProperty('nickname');
    expect(latestMessage).toHaveProperty('content');
    expect(latestMessage).toHaveProperty('likes');
    expect(latestMessage).toHaveProperty('createdAt');
    
    testMessageId = latestMessage.id;
  });

  it('should like a message', async () => {
    const messagesBefore = await caller.message.list();
    const messageBefore = messagesBefore.find(m => m.id === testMessageId);
    const likesBefore = messageBefore?.likes || 0;

    const result = await caller.message.like({ id: testMessageId });
    expect(result).toEqual({ success: true });

    const messagesAfter = await caller.message.list();
    const messageAfter = messagesAfter.find(m => m.id === testMessageId);
    const likesAfter = messageAfter?.likes || 0;

    expect(likesAfter).toBe(likesBefore + 1);
  });

  it('should delete a message', async () => {
    const result = await caller.message.delete({ id: testMessageId });
    expect(result).toEqual({ success: true });

    const messages = await caller.message.list();
    const deletedMessage = messages.find(m => m.id === testMessageId);
    expect(deletedMessage).toBeUndefined();
  });
});
