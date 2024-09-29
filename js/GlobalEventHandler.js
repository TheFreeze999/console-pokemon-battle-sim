import Types from "./Type.js";
const CLAUSES = [{
        onDamagePriority: 500,
        async onDamage(data, target) {
            if (target.fainted)
                return null;
        },
        onHealPriority: 500,
        async onHeal(data, target) {
            if (target.fainted)
                return null;
        }
    }, {
        onDamagePriority: 105,
        async onDamage(data, target) {
            if (data.amount <= 0 || target.currentHP <= 0)
                return null;
        },
        onHealPriority: 105,
        async onHeal(data, target) {
            if (data.amount <= 0 || target.currentHP >= target.stats.hp)
                return null;
        }
    }];
const BEFORE_EXECUTION = [{
        onDamagePriority: 101,
        async onDamage(data, target) {
            if (data.typeEffectivenessText)
                await this.showText(data.typeEffectivenessText);
            if (data.recoil?.isRecoil && data.recoil.showText)
                await this.showText(`${target.name} was hurt by recoil.`);
        }
    }];
const EXECUTION = [{
        onDamagePriority: 100,
        async onDamage(data, target) {
            const amountDealt = target.dealDamage(data.amount);
            await this.showText(`${target.name} took ${amountDealt} damage!`);
            await this.showText(`${target.name} has ${target.currentHP} HP remaining.`);
            if (target.fainted)
                await this.runEvent(`Faint`, null, target);
        },
        onHealPriority: 100,
        async onHeal(data, target) {
            const amountHealed = target.heal(data.amount);
            await this.showText(`${target.name} was healed by ${amountHealed} HP!`);
            await this.showText(`${target.name} now has ${target.currentHP} HP.`);
        },
        onMovePriority: 100,
        async onMove(data, target, _, sourceBattler) {
            if (!sourceBattler)
                return null;
            if (!data.move.verifyCorrectTargetSelection(sourceBattler, target))
                return null;
            if (sourceBattler.fainted)
                return null;
            if (Array.isArray(target) && target.every(b => b.fainted))
                return null;
            await this.showText(`${sourceBattler.name} used ${data.move.displayName}!`);
            let hitBattlers = [];
            if (Array.isArray(target)) {
                for (const targetBattler of target) {
                    if (targetBattler.fainted)
                        continue;
                    if (data.move.isStandardDamagingAttack()) {
                        const damageMultiplier = await this.runEvent('GetDamageMultiplier', 1, targetBattler, sourceBattler, data.move) ?? 1;
                        let damageAmount = data.move.calcDamage(sourceBattler, targetBattler);
                        if (damageAmount !== null && data.skipDamage !== true) {
                            damageAmount *= damageMultiplier;
                            const typeEffectiveness = Types.calcEffectiveness([data.move.type], targetBattler.types);
                            const typeEffectivenessText = Types.getEffectivenessText(typeEffectiveness, targetBattler.name);
                            if (typeEffectiveness === 0) {
                                await this.showText(`It doesn't affect ${targetBattler.name}...`);
                                return null;
                            }
                            const result = await this.runEvent('Damage', {
                                amount: damageAmount,
                                isDirect: true,
                                typeEffectivenessText,
                            }, targetBattler, sourceBattler, data.move);
                            if (result !== null) {
                                hitBattlers.push(targetBattler);
                            }
                        }
                    }
                }
            }
            // if target is battle: logic
            if (data.skipSecondaryEffects !== true) {
                const result = await this.runEvent('ApplyMoveSecondary', { hitBattlers }, target, sourceBattler, data.move);
                if (result === null)
                    data.failed = true;
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
            if (data.reasonText)
                await this.showText(data.reasonText);
        }
    }];
const AFTER_EXECUTION = [{
        onMovePriority: 99,
        async onMove(data) {
            if (data.failed)
                await this.showText(`But it failed!`);
        }
    }];
const GLOBAL_EVENT_HANDLER = [...CLAUSES, ...BEFORE_EXECUTION, ...EXECUTION, ...AFTER_EXECUTION,];
export default GLOBAL_EVENT_HANDLER;
