import Ability from "./Ability.js";
import DexConditions from "./DexConditions.js";
import Move from "./Move.js";
import Types from "./Types.js";
const DexAbilities = {
    no_ability: new Ability('no_ability', 'No Ability'),
    magic_guard: new Ability('magic_guard', 'Magic Guard', {
        handler: {
            onTargetDamagePriority: 200,
            async onTargetDamage({ data }) {
                if (data.isDirect !== true) {
                    this.debug("magic guard proc");
                    return null;
                }
            }
        }
    }),
    flash_fire: new Ability('flash_fire', 'Flash Fire', {
        handler: {
            onTargetGetImmunityPriority: 200,
            async onTargetGetImmunity({ target, data, cause }) {
                if (!(cause instanceof Move))
                    return;
                if (cause.type !== Types.Type.FIRE)
                    return;
                await this.showText(`[${target.name}'s Flash Fire]`);
                data.isImmune = true;
            }
        }
    }),
    water_absorb: new Ability('water_absorb', 'Water Absorb', {
        handler: {
            onTargetGetImmunityPriority: 200,
            async onTargetGetImmunity({ target, data, cause }) {
                if (!(cause instanceof Move))
                    return;
                if (cause.type !== Types.Type.WATER)
                    return;
                await this.showText(`[${target.name}'s Water Absorb]`);
                data.isImmune = true;
                data.showImmunityText = !(await this.runEvt('Heal', { amount: target.stats.hp / 4 }, target, target, DexAbilities.water_absorb))?.amount;
            }
        }
    }),
    mold_breaker: new Ability('mold_breaker', 'Mold Breaker', {
        handler: {
            onTargetStartPriority: 150,
            async onTargetStart({ target }) {
                await this.showText(`[${target.name}'s Mold Breaker]`);
                await this.showText(`${target.name} breaks the mold!`);
            },
            onSourceMovePriority: 200,
            async onSourceMove({ data }) {
                data.ignoreAbility = true;
            }
        }
    }),
    serence_grace: new Ability('serene_grace', 'Serene Grace', {
        handler: {
            onSourceChancePriority: 200,
            async onSourceChance({ data, cause }) {
                if (cause instanceof Move)
                    data.odds[0] *= 2;
            }
        }
    }),
    immunity: new Ability('immunity', 'Immunity', {
        handler: {
            onTargetApplyConditionPriority: 200,
            async onTargetApplyCondition({ data, target }) {
                if ([DexConditions.psn, DexConditions.tox].includes(data.condition)) {
                    await this.showText(`[${target.name}'s Immunity]`);
                    await this.showText(`${target.name} cannot be poisoned.`);
                    return null;
                }
            },
            onTargetResidualPriority: 500,
            async onTargetResidual({ target }) {
                for (const poisoningCondition of [DexConditions.psn, DexConditions.tox]) {
                    await this.runEvt('RemoveCondition', { condition: poisoningCondition }, target, target, DexAbilities.immunity);
                }
            },
            onCauseRemoveConditionPriority: 101,
            async onCauseRemoveCondition({ target }) {
                await this.showText(`[${target.name}'s Immunity]`);
            }
        }
    })
};
export default DexAbilities;
