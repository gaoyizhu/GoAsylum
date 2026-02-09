/**
 * Game Page - 根据URL参数显示不同的游戏
 */

import { useRoute } from "wouter";

export default function Game() {
  const [, params] = useRoute("/game/:type/:size/:mode");
  
  const gameType = params?.type || 'standard';
  const boardSize = params?.size || '9x9';
  const gameMode = params?.mode || 'pvp';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">游戏开发中</h1>
        <p>游戏类型: {gameType}</p>
        <p>棋盘大小: {boardSize}</p>
        <p>游戏模式: {gameMode}</p>
      </div>
    </div>
  );
}
