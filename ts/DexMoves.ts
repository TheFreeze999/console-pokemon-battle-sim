import Battler from "./Battler.js";
import DexConditions from "./DexConditions.js";
import Move from "./Move.js";
import Types from "./Types.js";
import Util from "./util.js";

const DexMoves = {
	tackle: new Move('tackle', 'Tackle', {
		handler: {
			onCauseDamagePriority: 205,
			async onCauseDamage(evt) {
				evt.listenerBlacklists.push({
					key: 'tackle',
					checker(listener) {
						if (typeof listener.origin === 'string') return false;
						if ('wieldedEffect' in listener.origin) {
							return listener.origin.wieldedEffect === evt.target.getAbility() && listener.origin.relation === 'self' && ('target' in listener.origin);
						}
						return false;
					},
				})
			}
		}
	}),
} as const;

export default DexMoves;