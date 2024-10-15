import Battler from "./Battler.js";
import DexConditions from "./DexConditions.js";
import Evt from "./Evt.js";
import Move from "./Move.js";
import Types from "./Types.js";
import Util from "./util.js";

const DexMoves = {
	tackle: new Move('tackle', 'Tackle', {
		type: Types.Type.NORMAL,
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
		category: Move.Category.SPECIAL,
		handlers: [{
			onCauseHitPriority: 101,
			async onCauseHit({ data, target, source, cause }) {
				await this.runEvt('Damage', { amount: 60, isDirect: true }, target, source, cause);
			}
		}]
	}),
	glare: new Move('glare', 'Glare', {
		category: Move.Category.STATUS,
		type: Types.Type.NORMAL,
		bypassTypeImmunity: true,
		handlers: [{
			onCauseHitPriority: 101,
			async onCauseHit(evt) {
				evt.data.fail = !await this.runEvt('ApplyCondition', { condition: DexConditions.prz }, evt.target, evt.source, DexMoves.ember);
			}
		}]
	}),
	thunder_wave: new Move('thunder_wave', 'Thunder Wave', {
		category: Move.Category.STATUS,
		type: Types.Type.ELECTRIC,
		handlers: [{
			onCauseHitPriority: 101,
			async onCauseHit(evt) {
				evt.data.fail = !await this.runEvt('ApplyCondition', { condition: DexConditions.prz }, evt.target, evt.source, DexMoves.ember);
			}
		}]
	}),
	toxic: new Move('toxic', 'Toxic', {
		category: Move.Category.STATUS,
		type: Types.Type.POISON,
		handlers: [{
			onCauseHitPriority: 101,
			async onCauseHit(evt) {
				evt.data.fail = !await this.runEvt('ApplyCondition', { condition: DexConditions.tox }, evt.target, evt.source, DexMoves.ember);
			}
		}]
	}),
	recover: new Move('recover', 'Recover', {
		type: Types.Type.NORMAL,
		category: Move.Category.STATUS,
		targeting: Move.Targeting.SELF,
		handlers: [{
			onCauseApplyMoveSecondaryPriority: 150,
			async onCauseApplyMoveSecondary({ target, data }) {
				data.fail = !await this.runEvt('Heal', { amount: target.stats.hp / 2 }, target, target, DexMoves.recover);
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
				if (target.currentHP >= target.stats.hp) {
					data.fail = true;
					return;
				}

				const applyStatusEvt = await this.runEvt('ApplyCondition', { condition: DexConditions.slp }, target, source, DexMoves.rest)
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
				if (parent?.hasName("ApplyMoveSecondary") !== true) return;

				parent.data.fail = !await this.runEvt('Heal', { amount: target.stats.hp - target.currentHP }, target, target, DexMoves.rest);
			}
		}]
	})
} as const;

export default DexMoves;