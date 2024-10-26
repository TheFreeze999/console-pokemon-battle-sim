import Ability from "./Ability.js";
import DexAbilities from "./DexAbilities.js";
import DexConditions from "./DexConditions.js";
import DexItems from "./DexItems.js";
import DexMoves from "./DexMoves.js";
import Evt from "./Evt.js";
import Move from "./Move.js";
import Types from "./Types.js";
import Util from "./util.js";
const EFFECT_GLOBAL_HANDLERS = [];
for (const effect of ([DexAbilities, DexItems, DexConditions, DexMoves].flatMap(dex => Object.values(dex)))) {
    const handlers = [...effect.handlers];
    for (let { ...handler } of handlers) {
        for (const key in handler) {
            if (!key.startsWith('onAny'))
                delete handler[key];
        }
    }
    EFFECT_GLOBAL_HANDLERS.push(...handlers);
}
const PRE_EXECUTION = {
    onAnyMovePriority: 110,
    async onAnyMove(evt) {
        const { target, data, source } = evt;
        if (!source || source.fainted)
            return;
        if (!data.causedByBounce) {
            const canUseMove = (await this.runEvt('CheckCanUseMove', { canUseMove: true }, source))?.canUseMove ?? true;
            if (!canUseMove)
                return null;
        }
        if (!data.move.verifyCorrectTargetSelection(source, target))
            return null;
        ////////////////
        if (data.move.protectLike) {
            if (!await this.chance([1, 3 ** source.consecutiveProtectLikeUsages], evt))
                data.moveFailed = true;
        }
    },
    onAnyApplyConditionPriority: 110,
    async onAnyApplyCondition({ target, data, source, cause }) {
        if (target.fainted)
            return null;
        if (data.condition.isStatus && target.hasStatusCondition() && cause !== DexMoves.rest)
            return null;
        const immunityEvtResult = await this.runEvt('CheckConditionImmunity', { condition: data.condition, isImmune: false }, target, source, cause);
        if (immunityEvtResult?.isImmune === true)
            return null;
        if (target.conditions.has(data.condition))
            return null;
    },
    onAnyRemoveConditionPriority: 110,
    async onAnyRemoveCondition({ target, data }) {
        if (target.fainted)
            return null;
        if (!target.conditions.has(data.condition))
            return null;
    },
    onAnyDamagePriority: 110,
    async onAnyDamage({ target, data }) {
        if (target.fainted)
            return null;
        if (data.amount <= 0)
            return null;
    },
    onAnyHealPriority: 110,
    async onAnyHeal({ target, data }) {
        if (target.fainted)
            return null;
        if (target.currentHP >= target.stats.hp)
            return null;
        if (data.amount <= 0)
            return null;
    }
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
        await this.showText(`${target.name} took ${data.amount} damage.`);
        await this.showText(`${target.name} has ${target.currentHP} HP remaining!`);
    },
    onAnyFaintPriority: 100,
    async onAnyFaint({ target }) {
        await this.showText(`${target.name} fainted!`);
        if (target.team.allFainted())
            this.winner ??= target.team.getOpposingTeam();
    },
    onAnyHealPriority: 100,
    async onAnyHeal({ target, data }) {
        data.amount = target.heal(data.amount);
        await this.showText(`${target.name} was healed by ${data.amount} HP.`);
        await this.showText(`${target.name} now has ${target.currentHP} HP!`);
    },
    onAnyMovePriority: 100,
    async onAnyMove(evt) {
        const { target, data, source } = evt;
        const move = data.move;
        if (!source)
            return;
        await this.showText(`> ${source.name} used ${move.displayName}!`);
        if (data.moveFailed)
            return;
        data.ignoreAbility ??= false;
        const ignoreAbilityBlacklist = {
            key: 'ability ignore',
            checker: (listener) => {
                return typeof listener.origin === "object" && 'wieldedEffect' in listener.origin && listener.origin.wieldedEffect instanceof Ability && listener.origin.wieldedEffect.ignorable && listener.priority > 100;
            },
        };
        for (const targetBattler of target) {
            if (targetBattler === source) {
                continue;
            }
            if ((await this.runEvt('CheckMoveMiss', { accuracy: move.accuracy, miss: false }, targetBattler, source, move))?.miss === true) {
                await this.showText(`${targetBattler.name} avoided the attack.`);
                continue;
            }
            if (data.bounced) {
                let targ = undefined;
                if (move.targeting === Move.Targeting.ONE_OTHER)
                    targ = [source];
                await targetBattler.useMove(move, targ, { causedByBounce: true });
                continue;
            }
            if (targetBattler.conditions.has(DexConditions.protected)) {
                await this.showText(`${targetBattler.name} was protected.`);
                continue;
            }
            const getImmunityEvt = new Evt('GetImmunity', { isImmune: false }, targetBattler, source, move);
            if (data.ignoreAbility)
                getImmunityEvt.listenerBlacklists.add(ignoreAbilityBlacklist);
            const getImmunityEvtResult = await this.runEvt(getImmunityEvt);
            const isImmune = getImmunityEvtResult?.isImmune ?? false;
            const showImmunityText = getImmunityEvtResult?.showImmunityText ?? true;
            if (isImmune) {
                if (showImmunityText)
                    await this.showText(`It doesn't affect ${targetBattler.name}...`);
            }
            else {
                const hitCount = Util.Random.arrayEl(move.hits);
                for (let i = 0; i < hitCount; i++) {
                    if (hitCount > 1)
                        await Util.delay(500);
                    if (move.isStandardDamagingAttack()) {
                        const applyMoveDamageEvt = new Evt('ApplyMoveDamage', { moveEvt: evt }, targetBattler, source, move);
                        if (data.ignoreAbility)
                            applyMoveDamageEvt.listenerBlacklists.add(ignoreAbilityBlacklist);
                        await this.runEvt(applyMoveDamageEvt);
                    }
                    const hitEvt = new Evt('Hit', { moveEvt: evt }, targetBattler, source, move);
                    if (data.ignoreAbility)
                        hitEvt.listenerBlacklists.add(ignoreAbilityBlacklist);
                    await this.runEvt(hitEvt);
                }
                if (hitCount > 1)
                    await this.showText(`Hit ${hitCount} time(s).`);
            }
        }
        await this.runEvt('ApplyMoveSecondary', { moveEvt: evt }, target, source, move);
    },
    onAnyApplyMoveDamagePriority: 100,
    async onAnyApplyMoveDamage({ target, data, source }) {
        if (!source)
            return;
        const move = data.moveEvt.data.move;
        const typeEffectiveness = (await this.runEvt('GetTypeEffectiveness', { effectiveness: 1 }, target, source, move))?.effectiveness ?? 1;
        const damageMultiplier = (await this.runEvt('GetMoveDamageMultiplier', { multiplier: 1 }, target, source, move))?.multiplier ?? 1;
        if (typeEffectiveness !== 1) {
            await this.showText(Types.getEffectivenessText(typeEffectiveness, target.name));
        }
        const isCrit = (await this.runEvt('CheckMoveCrit', { critRatio: move.critRatio, crit: false }, target, source, move))
            ?.crit ?? false;
        const damage = move.calcDamage(source, target, {
            additionalModifiers: typeEffectiveness * damageMultiplier,
            isCrit
        });
        if (!damage)
            return;
        if (isCrit)
            await this.showText('A critical hit!');
        await this.runEvt('Damage', { amount: damage, isDirect: true }, target, source, move);
    },
    onAnyHitPriority: 100,
    async onAnyHit({ data }) {
        data.fail ??= false;
        if (data.fail)
            data.moveEvt.data.moveFailed = true;
    },
    onAnyApplyMoveSecondaryPriority: 100,
    async onAnyApplyMoveSecondary({ data }) {
        data.fail ??= false;
        if (data.fail)
            data.moveEvt.data.moveFailed = true;
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
    },
    onAnyRemoveItemPriority: 100,
    async onAnyRemoveItem({ target, data }) {
        data.itemRemoved ??= target.itemSlot.item ?? undefined;
        target.itemSlot.item = null;
    },
    onAnyCheckMoveMissPriority: 100,
    async onAnyCheckMoveMiss(evt) {
        const multiplier = (evt.source?.getEffectiveStats().acc ?? 1) / (evt.target?.getEffectiveStats().eva ?? 1);
        evt.data.miss = !await this.chance([evt.data.accuracy * multiplier, 100], evt);
    },
    onAnyCheckMoveCritPriority: 100,
    async onAnyCheckMoveCrit(evt) {
        let chance = [1, 24];
        if (evt.data.critRatio >= 1)
            chance = [1, 8];
        if (evt.data.critRatio >= 2)
            chance = [1, 2];
        if (evt.data.critRatio >= 3)
            chance = [1, 1];
        evt.data.crit = await this.chance(chance, evt);
    }
};
const POST_EXECUTION = {
    onAnyDamagePriority: 90,
    async onAnyDamage({ target, source, cause }) {
        if (target.fainted)
            await this.runEvt('Faint', {}, target, source, cause);
    },
    onAnyMovePriority: 90,
    async onAnyMove({ data, source }) {
        if (!source)
            return;
        if (data.moveFailed)
            await this.showText('But it failed...');
        // Implementing fail chance for consecutive use of protect-like moves
        if (data.move.protectLike && !data.moveFailed)
            source.consecutiveProtectLikeUsages++;
        else
            source.consecutiveProtectLikeUsages = 0;
    }
};
const MISC = [{
        // Item Consumption Text
        onAnyRemoveItemPriority: 99,
        async onAnyRemoveItem({ target, data }) {
            if (data.method !== "consume" || !data.itemRemoved)
                return;
            if (data.itemRemoved.isBerry === true)
                await this.showText(`${target.name} ate its ${data.itemRemoved.displayName}.`);
            else
                await this.showText(`${target.name}'s ${data.itemRemoved.displayName} was used up!`);
        }
    }];
const GLOBAL_EVENT_HANDLERS = [PRE_EXECUTION, EXECUTION, POST_EXECUTION, ...MISC, ...EFFECT_GLOBAL_HANDLERS];
export default GLOBAL_EVENT_HANDLERS;
