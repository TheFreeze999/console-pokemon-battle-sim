import Condition from "./Condition.js";
import DexAbilities from "./DexAbilities.js";
import Evt from "./Evt.js";
import Move from "./Move.js";

const DexConditions = {
	burn: new Condition('burn', 'Burn', {
		isStatus: true,
		handler: {
			onAnyApplyConditionPriority: 99,
			async onAnyApplyCondition({ target, data }) {
				if (data.condition !== DexConditions.burn) return;
				await this.showText(`${target.name} was burned.`)
			},
			onAnyRemoveConditionPriority: 99,
			async onAnyRemoveCondition({ target, data }) {
				if (data.condition !== DexConditions.burn) return;
				await this.showText(`${target.name} was cured of its burn.`)
			},

			onSourceGetMoveDamageMultiplierPriority: 150,
			async onSourceGetMoveDamageMultiplier({ target, data, cause: move }) {
				if (!(move instanceof Move)) return;
				if (move.category !== Move.Category.PHYSICAL || !move.isStandardDamagingAttack()) return;

				data.multiplier *= 0.5;
			},

			onTargetResidualPriority: 130,
			async onTargetResidual({ target }) {
				await this.runEvt('Damage', { amount: target.stats.hp / 16 }, target, null, DexConditions.burn);
			},
			onCauseDamagePriority: 101,
			async onCauseDamage({ target }) {
				await this.showText(`${target.name} was hurt by its burn.`)
			}
		}
	}),
	psn: new Condition('psn', 'Poison', {
		isStatus: true,
		handler: {
			onAnyApplyConditionPriority: 99,
			async onAnyApplyCondition({ target, data }) {
				if (data.condition !== DexConditions.psn) return;
				await this.showText(`${target.name} was poisoned.`)
			},
			onAnyRemoveConditionPriority: 99,
			async onAnyRemoveCondition({ target, data }) {
				if (data.condition !== DexConditions.psn) return;
				await this.showText(`${target.name} was cured of its poisoning.`)
			},
			onTargetResidualPriority: 130,
			async onTargetResidual({ target }) {
				await this.runEvt('Damage', { amount: target.stats.hp / 8 }, target, null, DexConditions.psn);
			},
			onCauseDamagePriority: 101,
			async onCauseDamage({ target }) {
				await this.showText(`${target.name} was hurt by poison.`)
			}
		}
	}),
	tox: new Condition('tox', 'Toxic', {
		isStatus: true,
		handler: {
			onAnyApplyConditionPriority: 99,
			async onAnyApplyCondition({ target, data }) {
				if (data.condition !== DexConditions.tox) return;
				await this.showText(`${target.name} was badly poisoned.`)
			},
			onAnyRemoveConditionPriority: 99,
			async onAnyRemoveCondition({ target, data }) {
				if (data.condition !== DexConditions.tox) return;
				await this.showText(`${target.name} was cured of its poisoning.`)
			},
			onTargetResidualPriority: 130,
			async onTargetResidual({ target }) {
				const state = this.getEffectState(target, DexConditions.tox)
				state.stage ??= 1;
				await this.runEvt('Damage', { amount: target.stats.hp / 16 * state.stage }, target, null, DexConditions.tox);
				state.stage++;
			},
			onCauseDamagePriority: 101,
			async onCauseDamage({ target }) {
				await this.showText(`${target.name} was hurt by poison.`)
			}
		}
	}),
	prz: new Condition('prz', 'Paralysis', {
		isStatus: true,
		handler: {
			onAnyApplyConditionPriority: 99,
			async onAnyApplyCondition({ target, data }) {
				if (data.condition !== DexConditions.prz) return;
				await this.showText(`${target.name} was paralyzed.`)
			},
			onAnyRemoveConditionPriority: 99,
			async onAnyRemoveCondition({ target, data }) {
				if (data.condition !== DexConditions.prz) return;
				await this.showText(`${target.name} was cured of its paralysis.`)
			},
		}
	}),
} as const;

export default DexConditions;