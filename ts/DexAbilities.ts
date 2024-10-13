import Ability from "./Ability.js";
import DexConditions from "./DexConditions.js";
import Move from "./Move.js";
import Types from "./Types.js";

const DexAbilities = {
	no_ability: new Ability('no_ability', 'No Ability'),
	magic_guard: new Ability('magic_guard', 'Magic Guard', {
		handler: {
			onTargetDamagePriority: 200,
			async onTargetDamage({ data }) {
				console.log("== magic guard proc")
				if (data.isDirect !== true) return null;
			}
		}
	}),
} as const;

export default DexAbilities;