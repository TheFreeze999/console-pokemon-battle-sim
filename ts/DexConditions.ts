import Condition from "./Condition.js";
import DexAbilities from "./DexAbilities.js";
import Move from "./Move.js";

const DexConditions = {
	toxic: new Condition('toxic', 'Toxic', {
		isStatus: true,
		handler: [{
			onApplyConditionPriority: 150,
			async onApplyCondition(data, target) {
				if (data.condition !== DexConditions.toxic) return;
				this.getEffectState(target, DexConditions.toxic).stage = 1;
				data.message ??= `${target.name} was badly poisoned.`
			},

			onTargetResidualPriority: 50,
			async onTargetResidual(data, target) {
				const state = this.getEffectState(target, DexConditions.toxic);
				state.stage ??= 1;
				await this.runEvent('Damage', { amount: target.stats.hp / 16 * state.stage }, target, null, DexConditions.toxic)
				state.stage++;
			},
			onCauseDamagePriority: 101,
			async onCauseDamage(data, target) {
				await this.showText(`${target.name} was hurt by poison.`)
			}
		}]
	}),

	burn: new Condition('burn', 'Burn', {
		isStatus: true,
		handler: [{
			onApplyConditionPriority: 150,
			async onApplyCondition(data, target) {
				if (data.condition !== DexConditions.burn) return;
				data.message ??= `${target.name} was burned.`;
			},

			async onSourceGetDamageMultiplier(data, target, wielder, source, cause) {
				if (!(cause instanceof Move)) return;
				if (cause.category !== Move.Category.PHYSICAL || !cause.isStandardDamagingAttack()) return;
				if (source?.ability === DexAbilities.guts) return;

				data.multiplier *= 0.5;
			},

			onTargetResidualPriority: 50,
			async onTargetResidual(data, target) {
				await this.runEvent('Damage', { amount: target.stats.hp / 16 }, target, null, DexConditions.burn)
			},
			onCauseDamagePriority: 101,
			async onCauseDamage(data, target) {
				await this.showText(`${target.name} was hurt by its burn.`)
			}
		}]
	})
} as const;

export default DexConditions;