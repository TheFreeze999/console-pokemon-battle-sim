import DexConditions from "./DexConditions.js";
import Move from "./Move.js";
import Types from "./Types.js";
import Util from "./util.js";

const DexMoves = {
	tackle: new Move('tackle', 'Tackle', {
		type: Types.Type.NORMAL,
		basePower: 40,
		contact: true,
	}),

	powder_snow: new Move('powder_snow', 'Powder Snow', {
		type: Types.Type.ICE,
		basePower: 40,
		category: Move.Category.SPECIAL,
	}),

	recover: new Move('recover', 'Recover', {
		type: Types.Type.NORMAL,
		category: Move.Category.STATUS,
		targeting: Move.Targeting.SELF,
		handler: [
			{
				async onSourceEffectApplyMoveSecondary(data, target, _, user) {
					data.allFailed = !await user!.battle.runEvent('Heal', { amount: user!.stats.hp / 2 }, user)
				}
			}
		]
	}),

	knock_off: new Move('knock_off', 'Knock Off', {
		type: Types.Type.DARK,
		basePower: 65,
		contact: true,
		handler: [
			{
				async onSourceEffectGetDamageMultiplier(data, target) {
					if (target.heldItem) return data * 1.5;
				},
				async onSourceEffectDamagingHit(data, target, _, sourceBattler) {
					const item = target.heldItem;
					if (!item) return;
					await this.runEvent('RemoveItem', { reasonText: `${target.name} had its ${item.name} knocked off.` }, target, sourceBattler, DexMoves.knock_off)
				}
			}
		]
	}),

	super_fang: new Move('super_fang', 'Super Fang', {
		type: Types.Type.NORMAL,
		category: Move.Category.PHYSICAL,
		basePower: -1,
		PP: 3,
		handler: [
			{
				onSourceEffectDamagePriority: 105,
				async onSourceEffectDamage(data, target) {
					data.amount = target.currentHP / 2;
					return data;
				}
			}
		]
	}),

	freeze_dry: new Move('freeze_dry', 'Freeze Dry', {
		type: Types.Type.ICE,
		category: Move.Category.SPECIAL,
		basePower: 70,
		handler: [{
			async onSourceEffectGetTypeEffectiveness(data, target) {
				const newTable = { ...Types.MATCHUP_TABLE };
				newTable[Types.Type.WATER].resistances = newTable[Types.Type.WATER].resistances.filter(r => r !== Types.Type.ICE);
				newTable[Types.Type.WATER].weaknesses.push(Types.Type.ICE);
				return Types.calcEffectiveness([Types.Type.ICE], target.types, newTable);
			}
		}]
	}),

	power_up_punch: new Move('power_up_punch', 'Power-Up Punch', {
		type: Types.Type.FIGHTING,
		basePower: 40,
		handler: [{
			async onSourceEffectDamagingHit(data, target, _, user) {
				await this.runEvent('StatBoost', { boosts: { atk: 1 } }, user, user, DexMoves.power_up_punch);
			}
		}]
	}),

	swords_dance: new Move('swords_dance', 'Swords Dance', {
		category: Move.Category.STATUS,
		type: Types.Type.NORMAL,
		handler: [{
			async onSourceEffectApplyMoveSecondary(data, target, _, user) {
				data.allFailed = !await this.runEvent('StatBoost', { boosts: { atk: 2 } }, user, user, DexMoves.swords_dance);
			}
		}]
	}),

	topsy_turvy: new Move('topsy_turvy', 'Topsy Turvy', {
		category: Move.Category.STATUS,
		type: Types.Type.DARK,
		handler: [{
			async onSourceEffectApplyMoveSecondary(data, target, _, user) {

				data.allFailed = true;
				for (const [stat, boost] of Util.objectEntries(target.statBoosts)) {
					const result = await this.runEvent('StatBoost', { boosts: { [stat]: boost * -2 } }, target, user, DexMoves.topsy_turvy);
					if (result) data.allFailed = false;
				}
			}
		}]
	}),

	willowisp: new Move('willowisp', 'Will-O-Wisp', {
		type: Types.Type.FIRE,
		category: Move.Category.STATUS,
		handler: [{
			async onSourceEffectApplyMoveSecondary(data, target, _, user, move) {
				data.allFailed = !await this.runEvent('ApplyCondition', { condition: DexConditions.burn }, target, user, DexMoves.willowisp);
			}
		}]
	}),

	struggle: new Move('struggle', 'Struggle', {
		basePower: 30,
		contact: true,
		handler: [
			{
				async onSourceEffectDamagingHit(data, target, _, user) {
					await user!.battle.runEvent('Damage', {
						amount: user!.stats.hp / 4,
						recoil: {
							isRecoil: true,
							showText: true
						}
					}, user, user, DexMoves.struggle)
				}
			}
		]
	})
} as const;

export default DexMoves;