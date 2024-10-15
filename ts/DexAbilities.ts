import Ability from "./Ability.js";
import DexConditions from "./DexConditions.js";
import Move from "./Move.js";
import Types from "./Types.js";

const DexAbilities = {
	no_ability: new Ability('no_ability', 'No Ability'),
	magic_guard: new Ability('magic_guard', 'Magic Guard', {
		handlers: [{
			onTargetDamagePriority: 200,
			async onTargetDamage({ data }) {
				if (data.isDirect !== true) {
					this.debug("magic guard proc")
					return null;
				}
			}
		}]
	}),
	flash_fire: new Ability('flash_fire', 'Flash Fire', {
		handlers: [{
			onTargetGetImmunityPriority: 200,
			async onTargetGetImmunity({ target, data, cause: move, source }) {
				if (!(move instanceof Move)) return;
				if (move.type !== Types.Type.FIRE) return;

				await this.showText(`[${target.name}'s Flash Fire]`);
				data.isImmune = true;

				await this.runEvt('ApplyCondition', { condition: DexConditions.flash_fire_boost }, target, source, move);
			}
		}]
	}),
	water_absorb: new Ability('water_absorb', 'Water Absorb', {
		handlers: [{
			onTargetGetImmunityPriority: 200,
			async onTargetGetImmunity({ target, data, cause }) {
				if (!(cause instanceof Move)) return;
				if (cause.type !== Types.Type.WATER) return;

				await this.showText(`[${target.name}'s Water Absorb]`);
				data.isImmune = true;

				data.showImmunityText = !(await this.runEvt('Heal', { amount: target.stats.hp / 4 }, target, target, DexAbilities.water_absorb))?.amount;
			}
		}]
	}),
	mold_breaker: new Ability('mold_breaker', 'Mold Breaker', {
		handlers: [{
			onTargetStartPriority: 150,
			async onTargetStart({ target }) {
				await this.showText(`[${target.name}'s Mold Breaker]`);
				await this.showText(`${target.name} breaks the mold!`);
			},

			onSourceMovePriority: 200,
			async onSourceMove({ data }) {
				data.ignoreAbility = true;
			}
		}]
	}),
	serence_grace: new Ability('serene_grace', 'Serene Grace', {
		handlers: [{
			onSourceChancePriority: 200,
			async onSourceChance({ data, cause }) {
				if (cause instanceof Move) data.odds[0] *= 2;
			}
		}]
	}),
	immunity: new Ability('immunity', 'Immunity', {
		handlers: [{
			onTargetCheckConditionImmunityPriority: 200,
			async onTargetCheckConditionImmunity({ data, target, cause }) {
				if (![DexConditions.psn, DexConditions.tox].includes(data.condition)) return;
				data.isImmune = true;
				if (cause instanceof Move) {
					await this.showText(`[${target.name}'s Immunity]`);
					await this.showText(`${target.name} cannot be poisoned.`);
				}
			},

			onTargetResidualPriority: 500,
			async onTargetResidual({ target }) {
				for (const poisoningCondition of [DexConditions.psn, DexConditions.tox]) {
					await this.runEvt('RemoveCondition', { condition: poisoningCondition }, target, target, DexAbilities.immunity)
				}
			},

			onCauseRemoveConditionPriority: 101,
			async onCauseRemoveCondition({ target }) {
				await this.showText(`[${target.name}'s Immunity]`)
			}
		}]
	}),
	limber: new Ability('limber', 'Limber', {
		handlers: [{
			onTargetCheckConditionImmunityPriority: 200,
			async onTargetCheckConditionImmunity({ data, target, cause }) {
				if (data.condition !== DexConditions.prz) return;

				data.isImmune = true;
				if (cause instanceof Move) {
					await this.showText(`[${target.name}'s Limber]`);
					await this.showText(`${target.name} cannot be paralyzed.`);
				}
			},

			onTargetResidualPriority: 500,
			async onTargetResidual({ target }) {
				await this.runEvt('RemoveCondition', { condition: DexConditions.prz }, target, target, DexAbilities.limber)
			},

			onCauseRemoveConditionPriority: 101,
			async onCauseRemoveCondition({ target }) {
				await this.showText(`[${target.name}'s Limber]`)
			}
		}]
	}),
	insomnia: new Ability('insomnia', 'Insomnia', {
		handlers: [{
			onTargetCheckConditionImmunityPriority: 200,
			async onTargetCheckConditionImmunity({ data, target, cause }) {
				if (data.condition !== DexConditions.slp) return;

				data.isImmune = true;
				if (cause instanceof Move) {
					await this.showText(`[${target.name}'s Insomnia]`);
					await this.showText(`${target.name} cannot fall asleep.`);
				}
			},

			onTargetResidualPriority: 500,
			async onTargetResidual({ target }) {
				await this.runEvt('RemoveCondition', { condition: DexConditions.slp }, target, target, DexAbilities.insomnia)
			},

			onCauseRemoveConditionPriority: 101,
			async onCauseRemoveCondition({ target }) {
				await this.showText(`[${target.name}'s Insomnia]`)
			}
		}]
	}),
	corrosion: new Ability('corrosion', 'Corrosion', {
		// Effect implemented in ./DexConditions.ts#psn & #tox
	}),
	multiscale: new Ability('multiscale', 'Multiscale', {
		handlers: [{
			async onTargetGetMoveDamageMultiplier({ target, data }) {
				if (target.currentHP < target.stats.hp) return;
				data.multiplier *= 0.5;
			}
		}]
	}),
	shadow_shield: new Ability('shadow_shield', 'Shadow Shield', {
		ignorable: false,
		handlers: [{
			async onTargetGetMoveDamageMultiplier({ target, data }) {
				if (target.currentHP < target.stats.hp) return;
				data.multiplier *= 0.5;
			}
		}]
	}),
	guts: new Ability('guts', 'Guts', {
		handlers: [{
			async onSourceGetMoveDamageMultiplier({ data, cause, source }) {
				if (!(cause instanceof Move)) return;
				if (cause.category !== Move.Category.PHYSICAL || !cause.isStandardDamagingAttack()) return;
				if (source?.hasStatusCondition() !== true) return;

				data.multiplier *= 1.5;
				// Burn attack drop negation implemented in ./DexConditions.ts#brn
			}
		}]
	}),

	poison_heal: new Ability('poison_heal', 'Poison Heal', {
		handlers: [{
			onTargetDamagePriority: 200,
			async onTargetDamage({ cause }) {
				if ([DexConditions.psn, DexConditions.tox].includes(cause as any)) return null;
			},

			onTargetResidualPriority: 130,
			async onTargetResidual({ target }) {
				if (![DexConditions.psn, DexConditions.tox].some(c => target.conditions.has(c))) return;
				await this.runEvt('Heal', { amount: target.stats.hp / 8 }, target, target, DexAbilities.poison_heal);
			},

			onCauseHealPriority: 101,
			async onCauseHeal({ target }) {
				await this.showText(`[${target.name}'s Poison Heal]`)
			}
		}]
	})
} as const;

export default DexAbilities;