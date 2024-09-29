import Ability from "./Ability.js";

const DexAbilities = {
	no_ability: new Ability('no_ability', 'No Ability'),

	rough_skin: new Ability('rough_skin', 'Rough Skin', {
		handler: [{
			onMovePriority: 50,
			async onMove(data, target, wielder, sourceBattler) {
				if (!Array.isArray(target) || !sourceBattler) return;
				if (!data.move.isStandardDamagingAttack()) return;

				await this.runEvent('Damage', { amount: sourceBattler.stats.hp / 8 }, sourceBattler, wielder, DexAbilities.rough_skin);
			},

			onSourceDamagePriority: 101,
			async onSourceDamage(data, target, wielder, sourceBattler, sourceEffect) {
				if (sourceEffect !== DexAbilities.rough_skin) return;
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
} as const;

export default DexAbilities;