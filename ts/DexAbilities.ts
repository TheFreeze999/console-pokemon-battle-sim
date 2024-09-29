import Ability from "./Ability.js";
import Types from "./Type.js";

const DexAbilities = {
	no_ability: new Ability('no_ability', 'No Ability'),

	rough_skin: new Ability('rough_skin', 'Rough Skin', {
		handler: [{
			onMovePriority: 50,
			async onMove(data, target, wielder, sourceBattler) {
				if (!Array.isArray(target) || !sourceBattler) return;
				if (!data.move.isStandardDamagingAttack()) return;
				if (data.move.contact !== true) return;

				await this.runEvent('Damage', { amount: sourceBattler.stats.hp / 8 }, sourceBattler, wielder, DexAbilities.rough_skin);
			},

			onSourceEffectDamagePriority: 101,
			async onSourceEffectDamage(data, target, wielder, sourceBattler, sourceEffect) {
				await this.showText(`[${sourceBattler?.name}'s Rough Skin]`)
			}
		}]
	}),

	magic_guard: new Ability('magic_guard', 'Magic Guard', {
		handler: [{
			onDamagePriority: 200,
			async onDamage(data) {
				if (data.isDirect !== true) return null;
			}
		}]
	}),

	ice_absorb: new Ability('ice_absorb', 'Ice Absorb', {
		handler: [{
			onMovePriority: 120,
			async onMove(data, target, wielder, sourceBattler, sourceEffect) {
				if (data.move.type !== Types.Type.ICE) return;
				data.skipDamage = true;
				data.skipSecondaryEffects = true;
				data.flags ??= {}, data.flags['ice_absorb'] = true;
			}
		}, {
			onMovePriority: 90,
			async onMove(data, target, wielder, sourceBattler, sourceEffect) {
				if (data.flags?.['ice_absorb'] !== true) return;
				const result = await this.runEvent('Heal', { amount: wielder.stats.hp / 4 }, wielder, wielder, DexAbilities.ice_absorb);
				if (!result) {
					await this.showText(`[${wielder.name}'s Ice Absorb]`)
					await this.showText(`${wielder.name} is immune.`)
				}
			},

			onSourceEffectHealPriority: 101,
			async onSourceEffectHeal(data, target) {
				await this.showText(`[${target.name}'s Ice Absorb]`)
			}
		}]
	}),
} as const;

export default DexAbilities;