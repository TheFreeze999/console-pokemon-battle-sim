import Ability from "./Ability.js";
import Move from "./Move.js";
import Types from "./Types.js";

const DexAbilities = {
	no_ability: new Ability('no_ability', 'No Ability'),

	rough_skin: new Ability('rough_skin', 'Rough Skin', {
		handler: [{
			onMoveSuccessPriority: 100,
			async onMoveSuccess(data, target, wielder, user) {
				if (!user || user === wielder) return;
				if (data.move.contact !== true) return;

				await this.runEvent('Damage', {
					amount: user.stats.hp / 8
				}, user, wielder, DexAbilities.rough_skin);
			},

			onAnyDamagePriority: 101,
			async onAnyDamage(data, target, wielder, sourceBattler, sourceEffect) {
				if (sourceEffect !== DexAbilities.rough_skin) return;
				await this.showText(`[${wielder.name}'s Rough Skin]`)
			}
		}]
	}),

	magic_guard: new Ability('magic_guard', 'Magic Guard', {
		handler: [{
			onDamagePriority: 150,
			async onDamage(data) {
				if (data.isDirect !== true) return null;
			}
		}]
	}),

	ice_absorb: new Ability('ice_absorb', 'Ice Absorb', {
		handler: [{
			onCheckImmunityPriority: 200,
			async onCheckImmunity(data, target, wielder, user, sourceEffect) {
				if (!(sourceEffect instanceof Move)) return;
				if (sourceEffect.type !== Types.Type.ICE) return;
				if (user === wielder) return;

				await this.showText(`[${wielder.name}'s Ice Absorb]`);
				return true;
			},

			onMovePriority: 99,
			async onMove(data, target, wielder) {
				if (data.move.type !== Types.Type.ICE) return;
				await this.runEvent('Heal', {
					amount: wielder.stats.hp / 4
				}, wielder, wielder, DexAbilities.ice_absorb);
			}
		}]
	}),

	sticky_hold: new Ability('sticky_hold', 'Sticky Hold', {
		handler: [
			{
				onRemoveItemPriority: 101,
				async onRemoveItem() {
					return null;
				}
			}
		]
	})
} as const;

export default DexAbilities;