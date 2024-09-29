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
            if (Array.isArray(target)) {
                for (const targetBattler of target) {
                    if (targetBattler.fainted)
                        continue;
                    if (data.move.isStandardDamagingAttack()) {
                        const damageAmount = data.move.calcDamage(sourceBattler, targetBattler);
                        if (damageAmount) {
                            const result = await this.runEvent('Damage', {
                                amount: damageAmount,
                                isDirect: true
                            }, targetBattler, sourceBattler, data.move);
                            if (result !== null) {
                                await data.move.applySecondariesOnHit(targetBattler, sourceBattler);
                            }
                        }
                    }
                }
                await data.move.applySecondary(target, sourceBattler);
            }
            // if target is battle: logic
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
const GLOBAL_EVENT_HANDLER = [...CLAUSES, ...EXECUTION];
export default GLOBAL_EVENT_HANDLER;
