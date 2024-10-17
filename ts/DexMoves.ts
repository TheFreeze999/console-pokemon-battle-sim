import Battler from "./Battler.js";
import DexConditions from "./DexConditions.js";
import Evt from "./Evt.js";
import Move from "./Move.js";
import Types from "./Types.js";
import Util from "./util.js";

const DexMoves = {
	tackle: new Move('tackle', 'Tackle', {
		type: Types.Type.NORMAL,
		contact: true,
		basePower: 40,
	}),
	ember: new Move('ember', 'Ember', {
		category: Move.Category.SPECIAL,
		type: Types.Type.FIRE,
		basePower: 40,
		handlers: [{
			async onCauseHit(evt) {
				if (await this.chance([10, 100], evt))
					await this.runEvt('ApplyCondition', { condition: DexConditions.brn }, evt.target, evt.source, DexMoves.ember);
			}
		}]
	}),
	water_pulse: new Move('water_pulse', 'Water Pulse', {
		category: Move.Category.SPECIAL,
		type: Types.Type.WATER,
		basePower: 60,
	}),
	dragon_rage: new Move('dragon_rage', 'Dragon Rage', {
		type: Types.Type.DRAGON,
		category: Move.Category.SPECIAL,
		handlers: [{
			onCauseHitPriority: 101,
			async onCauseHit({ data, target, source, cause }) {
				await this.runEvt('Damage', { amount: 60, isDirect: true }, target, source, cause);
			}
		}]
	}),
	/* sheer_cold: new Move('sheer_cold', 'Sheer Cold', {
		type: Types.Type.ICE,
		category: Move.Category.SPECIAL,
		ohko: true,
		handlers: [{
			onCauseHitPriority: 101,
			async onCauseHit({ data, target, source, cause }) {
				await this.runEvt('Damage', { amount: target.currentHP, isDirect: true }, target, source, cause);
			},

			onCauseGetImmunityPriority: 150,
			async onCauseGetImmunity({ data, target, source, cause }) {
				if (target.hasType(Types.Type.ICE)) data.isImmune = true;
			}
		}]
	}), */
	glare: new Move('glare', 'Glare', {
		category: Move.Category.STATUS,
		type: Types.Type.NORMAL,
		bypassTypeImmunity: true,
		bounceable: true,
		handlers: [{
			onCauseGetImmunityPriority: 99,
			async onCauseGetImmunity({ target, data, source }) {
				data.isImmune = (await this.runEvt('CheckConditionImmunity', { condition: DexConditions.prz, isImmune: false }, target, source, DexMoves.glare))?.isImmune ?? false;
			},
			onCauseHitPriority: 101,
			async onCauseHit(evt) {
				evt.data.fail = !await this.runEvt('ApplyCondition', { condition: DexConditions.prz }, evt.target, evt.source, DexMoves.ember);
			}
		}]
	}),
	thunder_wave: new Move('thunder_wave', 'Thunder Wave', {
		category: Move.Category.STATUS,
		type: Types.Type.ELECTRIC,
		bounceable: true,
		handlers: [{
			onCauseGetImmunityPriority: 99,
			async onCauseGetImmunity({ target, data, source }) {
				data.isImmune = (await this.runEvt('CheckConditionImmunity', { condition: DexConditions.prz, isImmune: false }, target, source, DexMoves.thunder_wave))?.isImmune ?? false;
			},
			onCauseHitPriority: 101,
			async onCauseHit(evt) {
				evt.data.fail = !await this.runEvt('ApplyCondition', { condition: DexConditions.prz }, evt.target, evt.source, DexMoves.ember);
			}
		}]
	}),
	toxic: new Move('toxic', 'Toxic', {
		category: Move.Category.STATUS,
		type: Types.Type.POISON,
		bounceable: true,
		handlers: [{
			onCauseGetImmunityPriority: 99,
			async onCauseGetImmunity({ target, data, source }) {
				data.isImmune = (await this.runEvt('CheckConditionImmunity', { condition: DexConditions.tox, isImmune: false }, target, source, DexMoves.toxic))?.isImmune ?? false;
			},
			onCauseHitPriority: 101,
			async onCauseHit(evt) {
				evt.data.fail = !await this.runEvt('ApplyCondition', { condition: DexConditions.tox }, evt.target, evt.source, DexMoves.toxic);
			},
		}]
	}),
	recover: new Move('recover', 'Recover', {
		type: Types.Type.NORMAL,
		category: Move.Category.STATUS,
		targeting: Move.Targeting.SELF,
		handlers: [{
			onCauseApplyMoveSecondaryPriority: 150,
			async onCauseApplyMoveSecondary({ data, source }) {
				data.fail = !await this.runEvt('Heal', { amount: source!.stats.hp / 2 }, source!, source!, DexMoves.recover);
			}
		}]
	}),
	rest: new Move('rest', 'Rest', {
		type: Types.Type.NORMAL,
		category: Move.Category.STATUS,
		targeting: Move.Targeting.SELF,
		handlers: [{
			onCauseApplyMoveSecondaryPriority: 150,
			async onCauseApplyMoveSecondary({ target, data, source }) {
				if (source!.currentHP >= source!.stats.hp) {
					data.fail = true;
					return;
				}

				const applyStatusEvt = await this.runEvt('ApplyCondition', { condition: DexConditions.slp }, source!, source!, DexMoves.rest)
				if (!applyStatusEvt) {
					data.fail = true;
					return;
				}
			},

			onCauseApplyConditionPriority: 101,
			async onCauseApplyCondition({ target, source, data }) {
				for (const status of [...target.conditions].filter(c => c.isStatus)) {
					if (status === DexConditions.slp) continue;
					await this.runEvt('RemoveCondition', { condition: status }, target, source, DexMoves.rest);
				}
			},
		},
		{
			onCauseApplyConditionPriority: 98,
			async onCauseApplyCondition({ target }) {
				const parent = this.parentEvent;
				if (!parent?.hasName("ApplyMoveSecondary")) return;
				parent.data.fail = !await this.runEvt('Heal', { amount: target.stats.hp - target.currentHP }, target, target, DexMoves.rest);
			}
		}]
	}),
	protect: new Move('protect', 'Protect', {
		type: Types.Type.NORMAL,
		category: Move.Category.STATUS,
		targeting: Move.Targeting.SELF,
		priority: 4,
		protectLike: true,
		handlers: [{
			onCauseApplyMoveSecondaryPriority: 80,
			async onCauseApplyMoveSecondary({ source }) {
				await this.showText(`${source!.name} protected itself.`);
				await this.runEvt('ApplyCondition', { condition: DexConditions.protected }, source!, source!, DexMoves.protect)
			},
		}]
	}),
	magic_coat: new Move('magic_coat', 'Magic Coat', {
		type: Types.Type.PSYCHIC,
		category: Move.Category.STATUS,
		targeting: Move.Targeting.SELF,
		priority: 3,
		handlers: [{
			onCauseApplyMoveSecondaryPriority: 80,
			async onCauseApplyMoveSecondary({ source }) {
				await this.runEvt('ApplyCondition', { condition: DexConditions.magic_coated }, source!, source!, DexMoves.magic_coat);
			},

			async onTargetResidual({ target }) {
				await this.runEvt('RemoveCondition', { condition: DexConditions.magic_coated }, target, target, DexMoves.magic_coat);
			}
		}]
	}),
	sludge_bomb: new Move('sludge_bomb', 'Sludge Bomb', {
		type: Types.Type.POISON,
		category: Move.Category.SPECIAL,
		basePower: 90,
		handlers: [{
			onCauseApplyMoveDamagePriority: 80,
			async onCauseApplyMoveDamage(evt) {
				if (await this.chance([100, 100], evt))
					await this.runEvt('ApplyCondition', { condition: DexConditions.psn }, evt.target, evt.source, DexMoves.sludge_bomb);
			}
		}]
	}),
	thunderbolt: new Move('thunderbolt', 'Thunderbolt', {
		type: Types.Type.ELECTRIC,
		category: Move.Category.SPECIAL,
		basePower: 90,
		handlers: [{
			onCauseApplyMoveDamagePriority: 80,
			async onCauseApplyMoveDamage(evt) {
				if (await this.chance([100, 100], evt))
					await this.runEvt('ApplyCondition', { condition: DexConditions.prz }, evt.target, evt.source, DexMoves.thunderbolt);
			}
		}]
	})
} as const;

export default DexMoves;