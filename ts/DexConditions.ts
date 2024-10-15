import Condition from "./Condition.js";
import DexAbilities from "./DexAbilities.js";
import Evt from "./Evt.js";
import Move from "./Move.js";
import Types from "./Types.js";
import Util from "./util.js";

const DexConditions = {
	brn: new Condition('brn', 'Burn', {
		isStatus: true,
		handlers: [{
			onAnyCheckConditionImmunityPriority: 200,
			async onAnyCheckConditionImmunity({ data, target }) {
				if (data.condition !== DexConditions.brn) return;
				if (target.hasType(Types.Type.FIRE)) data.isImmune = true;
			},

			onAnyApplyConditionPriority: 99,
			async onAnyApplyCondition({ target, data }) {
				if (data.condition !== DexConditions.brn) return;
				await this.showText(`${target.name} was burned.`)
			},
			onAnyRemoveConditionPriority: 99,
			async onAnyRemoveCondition({ target, data }) {
				if (data.condition !== DexConditions.brn) return;
				await this.showText(`${target.name} was cured of its burn.`)
			},

			onSourceGetMoveDamageMultiplierPriority: 150,
			async onSourceGetMoveDamageMultiplier({ data, cause: move, source }) {
				if (!(move instanceof Move)) return;
				if (move.category !== Move.Category.PHYSICAL || !move.isStandardDamagingAttack()) return;
				if (source?.getAbility() === DexAbilities.guts) return;

				data.multiplier *= 0.5;
			},

			onTargetResidualPriority: 130,
			async onTargetResidual({ target }) {
				await this.runEvt('Damage', { amount: target.stats.hp / 16 }, target, null, DexConditions.brn);
			},
			onCauseDamagePriority: 101,
			async onCauseDamage({ target }) {
				await this.showText(`${target.name} was hurt by its burn.`)
			}
		}]
	}),
	psn: new Condition('psn', 'Poison', {
		isStatus: true,
		handlers: [{
			onAnyCheckConditionImmunityPriority: 200,
			async onAnyCheckConditionImmunity({ data, target, source }) {
				if (data.condition !== DexConditions.psn) return;
				if (source?.getAbility() === DexAbilities.corrosion) return;
				if (target.hasType(Types.Type.POISON) || target.hasType(Types.Type.STEEL)) data.isImmune = true;
			},

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
		}]
	}),
	tox: new Condition('tox', 'Toxic', {
		isStatus: true,
		handlers: [{
			onAnyCheckConditionImmunityPriority: 200,
			async onAnyCheckConditionImmunity({ data, target, source }) {
				if (data.condition !== DexConditions.tox) return;
				if (source?.getAbility() === DexAbilities.corrosion) return;
				if (target.hasType(Types.Type.POISON) || target.hasType(Types.Type.STEEL)) data.isImmune = true;
			},

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
		}]
	}),
	prz: new Condition('prz', 'Paralysis', {
		isStatus: true,
		handlers: [{
			onAnyCheckConditionImmunityPriority: 200,
			async onAnyCheckConditionImmunity({ data, target }) {
				if (data.condition !== DexConditions.prz) return;
				if (target.hasType(Types.Type.ELECTRIC)) data.isImmune = true;
			},

			onAnyApplyConditionPriority: 99,
			async onAnyApplyCondition({ target, data }) {
				if (data.condition !== DexConditions.prz) return;
				await this.showText(`${target.name} was paralyzed.`)
			},

			onTargetCheckCanUseMovePriority: 150,
			async onTargetCheckCanUseMove(evt) {
				const user = evt.target;
				await this.showText(`${user.name} is paralyzed.`)

				if (await this.chance([25, 100], evt)) {
					evt.data.canUseMove = false;
					await this.showText(`${user.name} can't move!`);
				}
			},

			onAnyRemoveConditionPriority: 99,
			async onAnyRemoveCondition({ target, data }) {
				if (data.condition !== DexConditions.prz) return;
				await this.showText(`${target.name} was cured of its paralysis.`)
			},
		}]
	}),
	slp: new Condition('slp', 'Sleep', {
		isStatus: true,
		handlers: [{
			onAnyApplyConditionPriority: 99,
			async onAnyApplyCondition({ target, data }) {
				if (data.condition !== DexConditions.slp) return;
				await this.showText(`${target.name} fell asleep.`);

				const state = this.getEffectState(target, DexConditions.slp);
				state.counter = Util.Random.int(1, 3);
			},

			onTargetCheckCanUseMovePriority: 150,
			async onTargetCheckCanUseMove(evt) {
				const user = evt.target;
				await this.showText(`${user.name} is fast asleep.`);

				const state = this.getEffectState(user, DexConditions.slp);

				if (state.counter <= 0) {
					await this.runEvt('RemoveCondition', { condition: DexConditions.slp }, user);
				} else {
					evt.data.canUseMove = false;
				}
			},

			onAnyRemoveConditionPriority: 99,
			async onAnyRemoveCondition({ target, data }) {
				if (data.condition !== DexConditions.slp) return;
				await this.showText(`${target.name} woke up.`)
			},

			async onTargetResidual({ target }) {
				const state = this.getEffectState(target, DexConditions.slp);
				state.counter--;
			}
		}]
	}),

	flash_fire_boost: new Condition('flash_fire_boost', 'Flash Fire Boost', {
		handlers: [{
			async onSourceGetMoveDamageMultiplier({ data, cause }) {
				if (!(cause instanceof Move)) return;
				if (cause.type !== Types.Type.FIRE) return;
				data.multiplier *= 1.5;
			}
		}]
	}),
} as const;

export default DexConditions;