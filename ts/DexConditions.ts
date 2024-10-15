import Condition from "./Condition.js";
import DexAbilities from "./DexAbilities.js";
import Evt from "./Evt.js";
import Move from "./Move.js";

const DexConditions = {
	burn: new Condition('burn', 'Burn', {
		isStatus: true,
		handler: {
			onAnyApplyConditionPriority: 101,
			async onAnyApplyCondition({ target, data }) {
				if (data.condition !== DexConditions.burn) return;
				await this.showText(`${target.name} was burned.`)
			},
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
			onAnyApplyConditionPriority: 101,
			async onAnyApplyCondition({ target, data }) {
				if (data.condition !== DexConditions.psn) return;
				await this.showText(`${target.name} was poisoned.`)
			},
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
			onAnyApplyConditionPriority: 101,
			async onAnyApplyCondition({ target, data }) {
				if (data.condition !== DexConditions.tox) return;
				await this.showText(`${target.name} was badly poisoned.`)
			},
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
	})
} as const;

export default DexConditions;