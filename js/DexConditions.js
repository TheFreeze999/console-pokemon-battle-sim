import Condition from "./Condition.js";
import Move from "./Move.js";
const DexConditions = {
    test: new Condition('test', 'Test', {
        handler: [{
                async onResidual(data, target) {
                    this.eventState.stage = 10;
                }
            }]
    }),
    toxic: new Condition('toxic', 'Toxic', {
        isStatus: true,
        handler: [{
                async onResidual(data, target) {
                    const stageSym = Symbol.for('toxic stage');
                    target.data[stageSym] ??= 1;
                    await this.runEvent('Damage', { amount: target.stats.hp / 16 * target.data[stageSym] }, target, null, DexConditions.toxic);
                    target.data[stageSym]++;
                },
                async onSourceEffectConditionGetApplied(data, target) {
                    await this.showText(`${target.name} was badly poisoned.`);
                },
                onSourceEffectDamagePriority: 101,
                async onSourceEffectDamage(data, target) {
                    await this.showText(`${target.name} was hurt by poison.`);
                },
            }]
    }),
    burn: new Condition('burn', 'Burn', {
        isStatus: true,
        handler: [{
                async onResidual(data, target) {
                    await this.runEvent('Damage', { amount: target.stats.hp / 16 }, target, null, DexConditions.burn);
                },
                async onSourceEffectConditionGetApplied(data, target) {
                    await this.showText(`${target.name} was burned.`);
                },
                onSourceEffectDamagePriority: 101,
                async onSourceEffectDamage(data, target) {
                    await this.showText(`${target.name} was hurt by its burn.`);
                },
                async onSourceGetDamageMultiplier(data, target, wielder, sourceBattler, sourceEffect) {
                    if (!(sourceEffect instanceof Move))
                        return;
                    if (sourceEffect.category !== Move.Category.PHYSICAL)
                        return;
                    if (!sourceEffect.isStandardDamagingAttack())
                        return;
                    return data / 2;
                }
            }]
    })
};
export default DexConditions;
