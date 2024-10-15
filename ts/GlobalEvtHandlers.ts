import Ability from "./Ability.js";
import DexAbilities from "./DexAbilities.js";
import DexConditions from "./DexConditions.js";
import DexItems from "./DexItems.js";
import Effect from "./Effect.js";
import Evt from "./Evt.js";
import Move from "./Move.js";
import Types from "./Types.js";

const EFFECT_GLOBAL_HANDLERS: Evt.Handler[] = [];
for (const effect of ([DexAbilities, DexItems, DexConditions].flatMap(dex => Object.values(dex))) as Effect[]) {
	const handler: Evt.Handler = { ...effect.handler };
	for (const key in effect.handler) {
		if (!key.startsWith('onAny')) delete handler[key as keyof Evt.Handler];
	}
	EFFECT_GLOBAL_HANDLERS.push(handler)
}


const EXECUTION: Evt.Handler = {
	onAnySwitchInPriority: 100,
	async onAnySwitchIn({ target }) {
		await this.showText(`${target.team.id} sent out ${target.name}!`);
		await this.runEvt('Start', {}, target);
	},

	onAnyDamagePriority: 100,
	async onAnyDamage({ target, data, cause }) {
		const amountDealt = target.dealDamage(data.amount)
		await this.showText(`${target.name} was hit with ${amountDealt} damage.`);
		await this.showText(`${target.name} now has ${target.currentHP} HP!`);
	},

	onAnyHealPriority: 100,
	async onAnyHeal({ target, data }) {
		const amountHealed = target.heal(data.amount);
		await this.showText(`${target.name} was healed by ${amountHealed} HP.`);
		await this.showText(`${target.name} now has ${target.currentHP} HP!`);
	},

	onAnyMovePriority: 100,
	async onAnyMove(evt) {
		const { target, data, source } = evt;
		const move = data.move;
		if (!source) return;
		await this.showText(`${source.name} used ${move.displayName}!`);

		data.ignoreAbility ??= false;

		const ignoreAbilityBlacklist: Evt.Listener.Blacklist<any> = {
			key: 'ability ignore',
			checker: (listener) => {
				return typeof listener.origin === "object" && 'wieldedEffect' in listener.origin && listener.origin.wieldedEffect instanceof Ability && listener.origin.wieldedEffect.ignorable
			},
		}

		for (const targetBattler of target) {
			const getImmunityEvt = new Evt('GetImmunity', { isImmune: false }, targetBattler, source, move);
			if (data.ignoreAbility) getImmunityEvt.listenerBlacklists.push(ignoreAbilityBlacklist);
			const isImmune = (await this.runEvt(getImmunityEvt))?.isImmune === true;

			if (isImmune) {
				await this.showText(`It doesn't affect ${targetBattler.name}...`)
			} else {
				if (move.isStandardDamagingAttack()) {
					const applyMoveDamageEvt = new Evt('ApplyMoveDamage', { moveEvt: evt }, targetBattler, source, move);
					if (data.ignoreAbility) applyMoveDamageEvt.listenerBlacklists.push(ignoreAbilityBlacklist);
					await this.runEvt(applyMoveDamageEvt);
				}

				const hitEvt = new Evt('Hit', { moveEvt: evt }, targetBattler, source, move);
				if (data.ignoreAbility) hitEvt.listenerBlacklists.push(ignoreAbilityBlacklist);
				await this.runEvt(hitEvt);
			}
			await this.runEvt('ApplyMoveSecondary', { moveEvt: evt }, targetBattler, source, move);
		}
	},

	onAnyApplyMoveDamagePriority: 100,
	async onAnyApplyMoveDamage({ target, data, source }) {
		if (!source) return;
		const move = data.moveEvt.data.move;
		const damage = move.calcDamage(source, target);
		if (!damage) return;
		await this.runEvt('Damage', { amount: damage, isDirect: true }, target, source, move)
	},

	onAnyApplyConditionPriority: 100,
	async onAnyApplyCondition({ target, data }) {
		target.conditions.add(data.condition);
	},

	onAnyGetImmunityPriority: 100,
	async onAnyGetImmunity({ target, data, cause: move }) {
		if (!(move instanceof Move)) return;
		if (Types.calcEffectiveness([move.type], target.types) === 0) data.isImmune = true;
	}
}

const POST_EXECUTION: Evt.Handler = {

}

const GLOBAL_EVENT_HANDLERS = [EXECUTION, POST_EXECUTION, ...EFFECT_GLOBAL_HANDLERS];

export default GLOBAL_EVENT_HANDLERS;