import { GameTemplate } from './GameTemplate';
import { GoBoard } from '@/components/GoBoard';
import * as Engine9x9 from '@/lib/go-game-amnesia9x9/engine';
import * as Engine13x13 from '@/lib/go-game-amnesia13x13/engine';
import { useRoute } from 'wouter';

export default function GameAmnesia() {
  const [, params] = useRoute("/game/:type/:size/:mode");
  const boardSize = params?.size === '13x13' ? 13 : 9;
  const Engine = boardSize === 13 ? Engine13x13 : Engine9x9;

  return (
    <GameTemplate
      Engine={Engine}
      BoardComponent={GoBoard}
      boardSize={boardSize}
      gameTypeName="Amnesia Go"
    />
  );
}
