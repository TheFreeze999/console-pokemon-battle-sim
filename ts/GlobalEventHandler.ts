import Battler from "./Battler.js";
import Condition from "./Condition.js";
import event from "./Event.js";
import Move from "./Move.js";
import Types from "./Types.js";
import Util from "./util.js";

const CLAUSES: event.Handler = [{
	onDamagePriority: 500,
	async onDamage(data, target) {
		if (target.fainted) return null;
	},
	onHealPriority: 500,
	async onHeal(data, target) {
		if (target.fainted) return null;
	}
}, {
	onDamagePriority: 101,
	async onDamage(data, target) {
		if (data.amount <= 0 || target.currentHP <= 0) return null;
	},
	onHealPriority: 101,
	async onHeal(data, target) {
		if (data.amount <= 0 || target.currentHP >= target.stats.hp) return null;
	},

	onApplyConditionPriority: 101,
	async onApplyCondition(data, target) {
		if (!(data.condition instanceof Condition)) return null;
		if (data.condition.isStatus && target.hasStatusCondition()) {
			return null;
		}
	}
}]

const BEFORE_EXECUTION: event.Handler = [{
	onDamagePriority: 101,
	async onDamage(data, target) {
		if (data.typeEffectivenessText) await this.showText(data.typeEffectivenessText)

		if (data.recoil?.isRecoil && data.recoil.showText) await this.showText(`${target.name} was hurt by recoil.`)
	}
}]

const EXECUTION: event.Handler = [{
	onDamagePriority: 100,
	async onDamage(data, target) {
		const amountDealt = target.dealDamage(data.amount);

		await this.showText(`${target.name} took ${amountDealt} damage!`);
		await this.showText(`${target.name} has ${target.currentHP} HP remaining.`);

		if (target.fainted) await this.runEvent(`Faint`, {}, target);
	},

	onHealPriority: 100,
	async onHeal(data, target) {
		const amountHealed = target.heal(data.amount);

		await this.showText(`${target.name} was healed by ${amountHealed} HP!`);
		await this.showText(`${target.name} now has ${target.currentHP} HP.`);
	},

	onGetTypeEffectivenessPriority: 100,
	async onGetTypeEffectiveness(data, target, _, user, move) {
		if (!(move instanceof Move)) return;

		return Types.calcEffectiveness([move.type], target.types)
	},

	onMovePriority: 100,
	async onMove(data, target, _, user, sourceEffect) {
		if (user?.fainted !== false) return null;

		if (!data.move.verifyCorrectTargetSelection(user, target)) return null;
		if (Array.isArray(target) && target.every(b => b.fainted)) return null;


		await this.showText(`> ${user.name} used ${data.move.displayName}!`);

		if (!Array.isArray(target)) return;

		data.failed ??= false;

		for (const targetBattler of target) {
			if (targetBattler.fainted) continue;
			if (data.move.isStandardDamagingAttack()) {
				let skipDamage = data.skipDamage ?? false;
				const typeEffectiveness = await this.runEvent('GetTypeEffectiveness', 1, targetBattler, user, data.move)
				const immunityCheck = await this.runEvent('CheckImmunity', false, targetBattler, user, data.move);
				const isImmune = typeEffectiveness === 0 || immunityCheck === true;
				if (isImmune) {
					skipDamage = true;

					await this.showText(Types.getEffectivenessText(0, targetBattler.name))
				}

				let damageDealt = false;
				if (!skipDamage) {
					const initialDamageValue = data.move.calcDamage(user, targetBattler);
					const damageMultiplier = await this.runEvent('GetDamageMultiplier', 1, targetBattler, user, data.move);
					const damageAmount = (initialDamageValue ?? 0) * (damageMultiplier ?? 0);
					if (damageAmount) {
						if (typeof typeEffectiveness === "number" && typeEffectiveness !== 1 && !isImmune) await this.showText(Types.getEffectivenessText(typeEffectiveness, targetBattler.name));

						const damageEvent = await this.runEvent('Damage', {
							amount: damageAmount,
							isDirect: true
						}, targetBattler, user, data.move);

						damageDealt = !!damageEvent
					}
				}
				if (damageDealt) {
					await this.runEvent('DamagingHit', {}, targetBattler, user, data.move);
				}
			}
			if (data.skipSecondaryEffects !== true) {
				const moveSecondaryResult = await this.runEvent('ApplyMoveSecondary', { allFailed: false }, targetBattler, user, data.move);
				if (moveSecondaryResult?.allFailed === true) {
					data.failed = true;
				}
			}

			if (data.failed === false) await this.runEvent('MoveSuccess', data, target, user, sourceEffect);
		}
	},

	onFaintPriority: 100,
	async onFaint(data, target) {
		target.fainted = true;
		await this.showText(`${target.name} fainted!`);
	},

	onRemoveItemPriority: 100,
	async onRemoveItem(data, target) {
		target.heldItem = null;
		if (data.reasonText) await this.showText(data.reasonText);
	},

	onStatBoostPriority: 100,
	async onStatBoost(data, target) {
		const changes = target.applyBoosts(data.boosts)

		if (Object.entries(changes).length === 0) return null;

		for (const [stat, diff] of Util.objectEntries(changes)) {
			let text = diff > 0 ? 'rose' : 'fell';
			if (diff === 2) text += ' sharply';
			if (diff === -2) text += ' harshly';
			if (Math.abs(diff) >= 3) text += ' drastically';

			await this.showText(`${target.name}'s ${stat} ${text}!`);
		}
	},

	onApplyConditionPriority: 100,
	async onApplyCondition(data, target, wielder, sourceBattler) {
		if (!(data.condition instanceof Condition)) return null;
		target.conditions.add(data.condition);
		await this.runEvent('ConditionGetApplied', {}, target, sourceBattler, data.condition)
	},

	onRemoveConditionPriority: 100,
	async onRemoveCondition(data, target, wielder, sourceBattler) {
		if (!(data.condition instanceof Condition)) return null;
		target.conditions.delete(data.condition);
		await this.runEvent('ConditionGetRemoved', {}, target, sourceBattler, data.condition)
	},
}]

const AFTER_EXECUTION: event.Handler = [{
	onMovePriority: 99,
	async onMove(data) {
		if (data.failed === true) await this.showText(`But it failed!`)
	},
}]


const GLOBAL_EVENT_HANDLER = [...CLAUSES, ...BEFORE_EXECUTION, ...EXECUTION, ...AFTER_EXECUTION,]

export default GLOBAL_EVENT_HANDLER;

