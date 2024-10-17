import Ability from "./Ability.js";
import DexConditions from "./DexConditions.js";
import Move from "./Move.js";
import Types from "./Types.js";
const DexAbilities = {
    no_ability: new Ability('no_ability', 'No Ability'),
    magic_guard: new Ability('magic_guard', 'Magic Guard', {
        handlers: [{
                onTargetDamagePriority: 200,
                async onTargetDamage({ data }) {
                    if (data.isDirect !== true) {
                        this.debug("magic guard proc");
                        return null;
                    }
                }
            }]
    }),
    flash_fire: new Ability('flash_fire', 'Flash Fire', {
        handlers: [{
                onTargetGetImmunityPriority: 200,
                async onTargetGetImmunity({ target, data, cause: move, source }) {
                    if (!(move instanceof Move))
                        return;
                    if (move.type !== Types.Type.FIRE)
                        return;
                    await this.showText(`[${target.name}'s Flash Fire]`);
                    data.isImmune = true;
                    await this.runEvt('ApplyCondition', { condition: DexConditions.flash_fire_boost }, target, source, move);
                }
            }]
    }),
    water_absorb: new Ability('water_absorb', 'Water Absorb', {
        handlers: [{
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
            }]
    }),
    mold_breaker: new Ability('mold_breaker', 'Mold Breaker', {
        handlers: [{
                onTargetStartPriority: 150,
                async onTargetStart({ target }) {
                    await this.showText(`[${target.name}'s Mold Breaker]`);
                    await this.showText(`${target.name} breaks the mold!`);
                },
                onSourceMovePriority: 200,
                async onSourceMove({ data }) {
                    data.ignoreAbility = true;
                }
            }]
    }),
    serence_grace: new Ability('serene_grace', 'Serene Grace', {
        handlers: [{
                onSourceChancePriority: 200,
                async onSourceChance({ data, cause }) {
                    if (cause instanceof Move)
                        data.odds[0] *= 2;
                }
            }]
    }),
    immunity: new Ability('immunity', 'Immunity', {
        handlers: [{
                onTargetCheckConditionImmunityPriority: 200,
                async onTargetCheckConditionImmunity({ data, target, cause, source }) {
                    if (![DexConditions.psn, DexConditions.tox].includes(data.condition))
                        return;
                    if (source !== target && !data.isImmune && !(cause instanceof Move && cause.isStandardDamagingAttack())) {
                        await this.showText(`[${target.name}'s Immunity]`);
                        await this.showText(`${target.name} cannot be poisoned.`);
                    }
                    data.isImmune = true;
                },
                onTargetUpdatePriority: 200,
                async onTargetUpdate({ target }) {
                    for (const poisoningCondition of [DexConditions.psn, DexConditions.tox]) {
                        await this.runEvt('RemoveCondition', { condition: poisoningCondition }, target, target, DexAbilities.immunity);
                    }
                },
                onCauseRemoveConditionPriority: 101,
                async onCauseRemoveCondition({ target }) {
                    await this.showText(`[${target.name}'s Immunity]`);
                }
            }]
    }),
    limber: new Ability('limber', 'Limber', {
        handlers: [{
                onTargetCheckConditionImmunityPriority: 200,
                async onTargetCheckConditionImmunity({ data, target, cause, source }) {
                    if (data.condition !== DexConditions.prz)
                        return;
                    if (source !== target && !data.isImmune && !(cause instanceof Move && cause.isStandardDamagingAttack())) {
                        await this.showText(`[${target.name}'s Limber]`);
                        await this.showText(`${target.name} cannot be paralyzed.`);
                    }
                    data.isImmune = true;
                },
                onTargetUpdatePriority: 200,
                async onTargetUpdate({ target }) {
                    await this.runEvt('RemoveCondition', { condition: DexConditions.prz }, target, target, DexAbilities.limber);
                },
                onCauseRemoveConditionPriority: 101,
                async onCauseRemoveCondition({ target }) {
                    await this.showText(`[${target.name}'s Limber]`);
                }
            }]
    }),
    insomnia: new Ability('insomnia', 'Insomnia', {
        handlers: [{
                onTargetCheckConditionImmunityPriority: 200,
                async onTargetCheckConditionImmunity({ data, target, cause, source }) {
                    if (data.condition !== DexConditions.slp)
                        return;
                    if (source !== target && !data.isImmune && !(cause instanceof Move && cause.isStandardDamagingAttack())) {
                        await this.showText(`[${target.name}'s Insomnia]`);
                        await this.showText(`${target.name} cannot fall asleep.`);
                    }
                    data.isImmune = true;
                },
                onTargetUpdatePriority: 200,
                async onTargetUpdate({ target }) {
                    await this.runEvt('RemoveCondition', { condition: DexConditions.slp }, target, target, DexAbilities.insomnia);
                },
                onCauseRemoveConditionPriority: 101,
                async onCauseRemoveCondition({ target }) {
                    await this.showText(`[${target.name}'s Insomnia]`);
                }
            }]
    }),
    corrosion: new Ability('corrosion', 'Corrosion', {
    // Effect implemented in ./DexConditions.ts#psn#tox
    }),
    multiscale: new Ability('multiscale', 'Multiscale', {
        handlers: [{
                async onTargetGetMoveDamageMultiplier({ target, data }) {
                    if (target.currentHP < target.stats.hp)
                        return;
                    data.multiplier *= 0.5;
                }
            }]
    }),
    shadow_shield: new Ability('shadow_shield', 'Shadow Shield', {
        ignorable: false,
        handlers: [{
                async onTargetGetMoveDamageMultiplier({ target, data }) {
                    if (target.currentHP < target.stats.hp)
                        return;
                    data.multiplier *= 0.5;
                }
            }]
    }),
    guts: new Ability('guts', 'Guts', {
        handlers: [{
                async onSourceGetMoveDamageMultiplier({ data, cause, source }) {
                    if (!(cause instanceof Move))
                        return;
                    if (cause.category !== Move.Category.PHYSICAL || !cause.isStandardDamagingAttack())
                        return;
                    if (source?.hasStatusCondition() !== true)
                        return;
                    data.multiplier *= 1.5;
                    // Burn attack drop negation implemented in ./DexConditions.ts#brn
                }
            }]
    }),
    poison_heal: new Ability('poison_heal', 'Poison Heal', {
        handlers: [{
                onTargetDamagePriority: 200,
                async onTargetDamage({ cause }) {
                    if ([DexConditions.psn, DexConditions.tox].includes(cause))
                        return null;
                },
                onTargetResidualPriority: 130,
                async onTargetResidual({ target }) {
                    if (![DexConditions.psn, DexConditions.tox].some(c => target.conditions.has(c)))
                        return;
                    await this.runEvt('Heal', { amount: target.stats.hp / 8 }, target, target, DexAbilities.poison_heal);
                },
                onCauseHealPriority: 101,
                async onCauseHeal({ target }) {
                    await this.showText(`[${target.name}'s Poison Heal]`);
                }
            }]
    }),
    sturdy: new Ability('sturdy', 'Sturdy', {
        handlers: [{
                onTargetGetImmunityPriority: 150,
                async onTargetGetImmunity({ data, target, cause: move }) {
                    if (!(move instanceof Move))
                        return;
                    if (move.ohko)
                        data.isImmune = true;
                },
                onTargetDamagePriority: 101,
                async onTargetDamage({ data, target }) {
                    data.isDirect ??= false;
                    if (!data.isDirect)
                        return;
                    if (target.currentHP < target.stats.hp)
                        return;
                    if (data.amount < target.stats.hp)
                        return;
                    await this.showText(`[${target.name}'s Sturdy]`);
                    await this.showText(`${target.name} survived the hit.`);
                    data.amount = target.stats.hp - 1;
                }
            }]
    }),
    rough_skin: new Ability('rough_skin', 'Rough Skin', {
        handlers: [{
                onTargetHitPriority: 70,
                async onTargetHit({ source, data, target }) {
                    if (!source)
                        return;
                    if (!data.moveEvt.data.move.contact)
                        return;
                    await this.runEvt(`Damage`, { amount: source.stats.hp / 8 }, source, target, DexAbilities.rough_skin);
                },
                onCauseDamagePriority: 101,
                async onCauseDamage({ source }) {
                    await this.showText(`[${source?.name}'s Rough Skin]`);
                }
            }]
    }),
    magic_bounce: new Ability('magic_bounce', 'Magic Bounce', {
        handlers: [{
                onTargetMovePriority: 300,
                async onTargetMove({ data }) {
                    if (!data.move.bounceable || data.causedByBounce === true)
                        return;
                    data.bounced = true;
                },
                onSourceMovePriority: 300,
                async onSourceMove({ data, source }) {
                    if (!data.causedByBounce)
                        return;
                    if (source?.conditions.has(DexConditions.magic_coated))
                        return;
                    await this.showText(`[${source?.name}'s Magic Bounce]`);
                }
            }]
    })
};
export default DexAbilities;
