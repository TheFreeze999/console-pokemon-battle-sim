import Ability from "./Ability.js";
import DexConditions from "./DexConditions.js";
import Move from "./Move.js";
import Types from "./Types.js";

const DexAbilities = {
	no_ability: new Ability('no_ability', 'No Ability'),

	rough_skin: new Ability('rough_skin', 'Rough Skin', {
		handler: [{
			async onTargetDamagingHit(data, target, wielder, source, cause) {
				if (!source || !(cause instanceof Move)) return;
				if (!cause.contact) return;

				await this.runEvent('Damage', { amount: source.stats.hp / 8 }, source, wielder, DexAbilities.rough_skin);
			},

			onCauseDamagePriority: 101,
			async onCauseDamage(data, target, wielder, source) {
				await this.showText(`[${source?.name}'s Rough Skin]`)
			}
		}]
	}),

	magic_guard: new Ability('magic_guard', 'Magic Guard', {
		handler: [{
			onTargetDamagePriority: 105,
			async onTargetDamage(data, target) {
				if (!data.isDirect) return null;
			}
		}]
	}),

	ice_absorb: new Ability('ice_absorb', 'Ice Absorb', {
		handler: []
	}),

	sticky_hold: new Ability('sticky_hold', 'Sticky Hold', {
		handler: []
	}),

	guts: new Ability('guts', 'Guts', {
		handler: [{
			async onSourceGetDamageMultiplier(data, target, wielder, source, cause) {
				if (!wielder || !(cause instanceof Move)) return;
				if (!wielder.hasStatusCondition()) return;
				if (cause.category !== Move.Category.PHYSICAL || !cause.isStandardDamagingAttack()) return;
				// Burn nerf negation implemented in ./DexConditions.ts:burn
				data.multiplier *= 1.5;
			}
		}]
	}),

	water_veil: new Ability('water_veil', 'Water Veil', {
		handler: [{
			onTargetApplyConditionPriority: 101,
			async onTargetApplyCondition(data, target, wielder, source, cause) {
				if (data.condition !== DexConditions.burn) return;
				if ((cause instanceof Move) && !cause.isStandardDamagingAttack()) await this.showText(`[${target.name}'s Water Veil]`)
				return null;
			},

			onTargetResidualPriority: 70,
			async onTargetResidual(data, target) {
				if (target.conditions.has(DexConditions.burn)) this.runEvent('RemoveCondition', { condition: DexConditions.burn }, target, target, DexAbilities.water_veil);
			}
		}]
	})
} as const;

export default DexAbilities;