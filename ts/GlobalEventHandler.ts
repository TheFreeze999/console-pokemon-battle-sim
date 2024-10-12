import Battle from "./Battle.js";
import Battler from "./Battler.js";
import Condition from "./Condition.js";
import DexAbilities from "./DexAbilities.js";
import DexConditions from "./DexConditions.js";
import DexItems from "./DexItems.js";
import DexMoves from "./DexMoves.js";
import Effect from "./Effect.js";
import event from "./Event.js";
import Move from "./Move.js";
import Types from "./Types.js";
import Util from "./util.js";

const COMBINED_HANDLER_FROM_ALL_DEXES: event.Handler = [];
{
	const allDexes: Record<string, Effect>[] = [DexAbilities, DexItems, DexConditions, DexMoves];
	for (const dex of allDexes) {
		for (const effectName in dex) {
			if (!dex[effectName]?.handler) continue;

			COMBINED_HANDLER_FROM_ALL_DEXES.push(...dex[effectName].handler);
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////

const CLAUSES: event.Handler = [{

}]

const BEFORE_EXECUTION: event.Handler = [{
	onDamagePriority: 105,
	async onDamage(data, target) {
		if (target.currentHP <= 0) return null;
		if (target.fainted) return null;
		if (!target.active) return null;

		data.amount = Math.floor(data.amount);
		if (data.amount <= 0) return null;
	},

	onHealPriority: 105,
	async onHeal(data, target) {
		if (target.currentHP >= target.stats.hp) return null;
		if (target.fainted) return null;
		if (!target.active) return null;

		data.amount = Math.floor(data.amount);
		if (data.amount <= 0) return null;
	},

	onMovePriority: 105,
	async onMove(data, target, _, source) {
		if (!source || source.fainted) return null;
		if (Array.isArray(target) && target.every(b => b.fainted)) return null;
		if (!data.move.verifyCorrectTargetSelection(source, target)) return null;
	},

	onFaintPriority: 105,
	async onFaint(data, target) {
		if (!target.active) return null;
	}
}]

const EXECUTION: event.Handler = [{
	onDamagePriority: 100,
	async onDamage(data, target) {
		data.amount = target.dealDamage(data.amount);
		await this.showText(`${target.name} took ${data.amount} damage!`);
		await this.showText(`${target.name} has ${target.currentHP} HP remaining.`);
	},

	onHealPriority: 100,
	async onHeal(data, target) {
		data.amount = target.heal(data.amount);
		await this.showText(`${target.name} was healed by ${data.amount} HP!`);
		await this.showText(`${target.name} now has ${target.currentHP} HP.`);
	},

	onMovePriority: 100,
	async onMove(data, target, _, source) {
		await this.showText(`${source!.name} used ${data.move.displayName}!`);


		if (target instanceof Battle) return;

		let allSecondariesFailed = true;

		for (const defender of target) {
			if (data.move.isStandardDamagingAttack()) dealDamage: {
				const typeEffectiveness = await this.getTypeEffectiveness(defender, source!, data.move);
				if (typeEffectiveness !== 1)
					await this.showText(Types.getEffectivenessText(typeEffectiveness, defender.name))
				if (typeEffectiveness === 0) break dealDamage;

				const damageMultiplier = await this.getDamageMultiplier(defender, source!, data.move);
				const baseDamage = data.move.calcDamage(source!, defender, typeEffectiveness * damageMultiplier);

				if (!baseDamage) break dealDamage;

				await this.runEvent('Damage', { amount: baseDamage, isDirect: true }, defender, source!, data.move);
			}

			const secondaryResult = await this.runEvent('ApplyMoveSecondary', { allFailed: false }, defender, source!, data.move);
			if (secondaryResult && !secondaryResult.allFailed) allSecondariesFailed = false;
		}

		data.failed = allSecondariesFailed;
	},

	onFaintPriority: 100,
	async onFaint(data, target) {
		await this.showText(`${target.name} fainted!`)
	},

	onGetTypeEffectivenessPriority: 100,
	async onGetTypeEffectiveness(data, target, _, source, move) {
		if (!(move instanceof Move)) return;
		data.effectiveness = Types.calcEffectiveness([move.type], target.types, data.matchupTable);
	},

	onApplyConditionPriority: 100,
	async onApplyCondition(data, target) {
		target.conditions.add(data.condition);
		data.message ??= `${target.name} now has ${data.condition.displayName}!`;
		await this.showText(data.message)
	},

	onRemoveConditionPriority: 100,
	async onRemoveCondition(data, target) {
		target.conditions.delete(data.condition);
		data.message ??= `${target.name} no longer has ${data.condition.displayName}.`;
		await this.showText(data.message)
	},

	onRemoveItemPriority: 100,
	async onRemoveItem(data, target) {
		target.heldItem = null;
		if (data.reasonText)
			await this.showText(data.reasonText)
	},

	onStatBoostPriority: 100,
	async onStatBoost(data, target) {
		const changes = target.applyBoosts(data.boosts);
		for (const [stat, change] of Util.objectEntries(changes)) {
			let text = `${target.name}'s ${stat}`;
			if (change > 0) text += " rose";
			else text += " fell";
			if (change === 2) text += " sharply";
			else if (change === -2) text += " harshly";
			else if (Math.abs(change) >= 3) text += " drastically";
			text += "!";
			await this.showText(text);
		}
	}
}]

const AFTER_EXECUTION: event.Handler = [{
	onDamagePriority: 95,
	async onDamage(data, target, _, source, cause) {
		if (data.isDirect) {
			await this.runEvent('DamagingHit', { ...data }, target, source, cause);
		}

		if (target.currentHP <= 0) {
			await this.runEvent('Faint', {}, target, source, cause)
		}
	},

	onMovePriority: 95,
	async onMove(data) {
		if (data.failed === true) await this.showText('But it failed...')
	}
}];




const GLOBAL_EVENT_HANDLER = [...COMBINED_HANDLER_FROM_ALL_DEXES, ...CLAUSES, ...BEFORE_EXECUTION, ...EXECUTION, ...AFTER_EXECUTION,]

export default GLOBAL_EVENT_HANDLER;

