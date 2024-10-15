import Ability from "./Ability.js";
import Move from "./Move.js";
import Types from "./Types.js";

const DexAbilities = {
	no_ability: new Ability('no_ability', 'No Ability'),
	magic_guard: new Ability('magic_guard', 'Magic Guard', {
		handler: {
			onTargetDamagePriority: 200,
			async onTargetDamage({ data }) {
				if (data.isDirect !== true) {
					this.debug("magic guard proc")
					return null;
				}
			}
		}
	}),
	flash_fire: new Ability('flash_fire', 'Flash Fire', {
		handler: {
			onTargetGetImmunityPriority: 200,
			async onTargetGetImmunity({ target, data, cause }) {
				if (!(cause instanceof Move)) return;
				if (cause.type !== Types.Type.FIRE) return;

				await this.showText(`[${target.name}'s Flash Fire]`)
				data.isImmune = true;
			}
		}
	}),
	mold_breaker: new Ability('mold_breaker', 'Mold Breaker', {
		handler: {
			onTargetStartPriority: 150,
			async onTargetStart({ target }) {
				await this.showText(`[${target.name}'s Mold Breaker]`);
				await this.showText(`${target.name} breaks the mold!`);
			},

			onSourceMovePriority: 200,
			async onSourceMove({ data }) {
				data.ignoreAbility = true;
			}
		}
	})
} as const;

export default DexAbilities;