import Ability from "./Ability.js";
import DexAbilities from "./DexAbilities.js";
import DexConditions from "./DexConditions.js";
import DexItems from "./DexItems.js";
import Evt from "./Evt.js";
import Move from "./Move.js";
import Types from "./Types.js";
import Util from "./util.js";
const EFFECT_GLOBAL_HANDLERS = [];
for (const effect of ([DexAbilities, DexItems, DexConditions].flatMap(dex => Object.values(dex)))) {
    const handler = { ...effect.handler };
    for (const key in effect.handler) {
        if (!key.startsWith('onAny'))
            delete handler[key];
    }
    EFFECT_GLOBAL_HANDLERS.push(handler);
}
const PRE_EXECUTION = {
    onAnyApplyConditionPriority: 110,
    async onAnyApplyCondition({ target, data }) {
        if (data.condition.isStatus && target.hasStatusCondition())
            return null;
    },
    onAnyRemoveConditionPriority: 110,
    async onAnyRemoveCondition({ target, data }) {
        if (!target.conditions.has(data.condition))
            return null;
    },
};
const EXECUTION = {
    onAnySwitchInPriority: 100,
    async onAnySwitchIn({ target, data }) {
        await this.showText(`${target.team.id} sent out ${target.name}!`);
        data.autostart ??= true;
        if (data.autostart)
            await this.runEvt('Start', {}, target);
    },
    onAnyChancePriority: 100,
    async onAnyChance({ data }) {
        const [numerator, denominator] = data.odds;
        data.result = Util.Random.int(1, denominator) <= numerator;
    },
    onAnyDamagePriority: 100,
    async onAnyDamage({ target, data }) {
        data.amount = target.dealDamage(data.amount);
        if (data.amount <= 0)
            return null;
        await this.showText(`${target.name} was hit with ${data.amount} damage.`);
        await this.showText(`${target.name} now has ${target.currentHP} HP!`);
    },
    onAnyHealPriority: 100,
    async onAnyHeal({ target, data }) {
        data.amount = target.heal(data.amount);
        if (data.amount <= 0)
            return null;
        await this.showText(`${target.name} was healed by ${data.amount} HP.`);
        await this.showText(`${target.name} now has ${target.currentHP} HP!`);
    },
    onAnyMovePriority: 100,
    async onAnyMove(evt) {
        const { target, data, source } = evt;
        const move = data.move;
        if (!source)
            return;
        await this.showText(`: ${source.name} used ${move.displayName}!`);
        data.ignoreAbility ??= false;
        const ignoreAbilityBlacklist = {
            key: 'ability ignore',
            checker: (listener) => {
                return typeof listener.origin === "object" && 'wieldedEffect' in listener.origin && listener.origin.wieldedEffect instanceof Ability && listener.origin.wieldedEffect.ignorable;
            },
        };
        for (const targetBattler of target) {
            if (targetBattler === source) {
                await this.runEvt('ApplyMoveSecondary', { moveEvt: evt }, targetBattler, source, move);
                continue;
            }
            const getImmunityEvt = new Evt('GetImmunity', { isImmune: false }, targetBattler, source, move);
            if (data.ignoreAbility)
                getImmunityEvt.listenerBlacklists.push(ignoreAbilityBlacklist);
            const getImmunityEvtResult = await this.runEvt(getImmunityEvt);
            const isImmune = getImmunityEvtResult?.isImmune ?? false;
            const showImmunityText = getImmunityEvtResult?.showImmunityText ?? true;
            if (isImmune) {
                if (showImmunityText)
                    await this.showText(`It doesn't affect ${targetBattler.name}...`);
            }
            else {
                if (move.isStandardDamagingAttack()) {
                    const applyMoveDamageEvt = new Evt('ApplyMoveDamage', { moveEvt: evt }, targetBattler, source, move);
                    if (data.ignoreAbility)
                        applyMoveDamageEvt.listenerBlacklists.push(ignoreAbilityBlacklist);
                    await this.runEvt(applyMoveDamageEvt);
                }
                const hitEvt = new Evt('Hit', { moveEvt: evt }, targetBattler, source, move);
                if (data.ignoreAbility)
                    hitEvt.listenerBlacklists.push(ignoreAbilityBlacklist);
                await this.runEvt(hitEvt);
            }
            await this.runEvt('ApplyMoveSecondary', { moveEvt: evt }, targetBattler, source, move);
        }
    },
    onAnyApplyMoveDamagePriority: 100,
    async onAnyApplyMoveDamage({ target, data, source, listenerBlacklists }) {
        if (!source)
            return;
        const move = data.moveEvt.data.move;
        const typeEffectiveness = (await this.runEvt('GetTypeEffectiveness', { effectiveness: 1 }, target, source, move))?.effectiveness ?? 1;
        const damageMultiplier = (await this.runEvt('GetMoveDamageMultiplier', { multiplier: 1 }, target, source, move))?.multiplier ?? 1;
        if (typeEffectiveness !== 1) {
            await this.showText(Types.getEffectivenessText(typeEffectiveness, target.name));
        }
        const damage = move.calcDamage(source, target, typeEffectiveness * damageMultiplier);
        if (!damage)
            return;
        await this.runEvt('Damage', { amount: damage, isDirect: true }, target, source, move);
    },
    onAnyHitPriority: 100,
    async onAnyHit({ data }) {
        data.fail ??= false;
        if (data.fail)
            await this.showText(`But it failed...`);
    },
    onAnyApplyMoveSecondaryPriority: 100,
    async onAnyApplyMoveSecondary({ data }) {
        data.fail ??= false;
        if (data.fail)
            await this.showText(`But it failed...`);
    },
    onAnyApplyConditionPriority: 100,
    async onAnyApplyCondition({ target, data }) {
        target.conditions.add(data.condition);
    },
    onAnyRemoveConditionPriority: 100,
    async onAnyRemoveCondition({ target, data }) {
        target.conditions.delete(data.condition);
    },
    onAnyGetImmunityPriority: 100,
    async onAnyGetImmunity({ target, data, cause: move }) {
        if (!(move instanceof Move))
            return;
        if (Types.calcEffectiveness([move.type], target.types) === 0 && !move.bypassTypeImmunity)
            data.isImmune = true;
    },
    onAnyGetTypeEffectivenessPriority: 100,
    async onAnyGetTypeEffectiveness({ target, data, cause: move }) {
        if (!(move instanceof Move))
            return;
        data.effectiveness = Types.calcEffectiveness([move.type], target.types);
    }
};
const POST_EXECUTION = {};
const GLOBAL_EVENT_HANDLERS = [PRE_EXECUTION, EXECUTION, POST_EXECUTION, ...EFFECT_GLOBAL_HANDLERS];
export default GLOBAL_EVENT_HANDLERS;
