import Battler from "./Battler.js";
import DexConditions from "./DexConditions.js";
import Evt from "./Evt.js";
import Move from "./Move.js";
import Types from "./Types.js";
import Util from "./util.js";

const DexMoves = {
	tackle: new Move('tackle', 'Tackle', {
		type: Types.Type.NORMAL,
		basePower: 40,
	}),
	ember: new Move('ember', 'Ember', {
		category: Move.Category.SPECIAL,
		type: Types.Type.FIRE,
		basePower: 40,
		handler: {
			async onCauseHit({ target, source }) {
				await this.runEvt('ApplyCondition', { condition: DexConditions.burn }, target, source, DexMoves.ember);
			}
		}
	}),
	recover: new Move('recover', 'Recover', {
		type: Types.Type.NORMAL,
		category: Move.Category.STATUS,
		targeting: Move.Targeting.SELF,
		handler: {
			async onCauseApplyMoveSecondary({ target }) {
				await this.runEvt('Heal', { amount: target.stats.hp / 2 }, target, target, DexMoves.recover);
			}
		}
	})
} as const;

export default DexMoves;