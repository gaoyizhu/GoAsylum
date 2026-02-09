import { GameTemplate } from './GameTemplate';
import { LineBoard } from '@/components/LineBoard';
import * as EngineLine from '@/lib/go-game-line/engine';

export default function GameLine() {
  return (
    <GameTemplate
      Engine={EngineLine}
      BoardComponent={LineBoard}
      boardSize={13}
      gameTypeName="Line Go"
    />
  );
}
