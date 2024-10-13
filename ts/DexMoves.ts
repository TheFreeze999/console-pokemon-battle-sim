import Battler from "./Battler.js";
import DexConditions from "./DexConditions.js";
import Move from "./Move.js";
import Types from "./Types.js";
import Util from "./util.js";

const DexMoves = {
	tackle: new Move('tackle', 'Tackle'),
} as const;

export default DexMoves;