import Battler from "./Battler.js";
import DexConditions from "./DexConditions.js";
import Move from "./Move.js";
import Types from "./Types.js";
const DexMoves = {
    tackle: new Move('tackle', 'Tackle', {
        type: Types.Type.NORMAL,
        basePower: 40,
        contact: true,
    }),
    powder_snow: new Move('powder_snow', 'Powder Snow', {
        type: Types.Type.ICE,
        basePower: 40,
        category: Move.Category.SPECIAL,
    }),
    recover: new Move('recover', 'Recover', {
        type: Types.Type.NORMAL,
        category: Move.Category.STATUS,
        targeting: Move.Targeting.SELF,
        handler: [{
                onCauseApplyMoveSecondaryPriority: 80,
                async onCauseApplyMoveSecondary(data, target, _, source) {
                    Battler.assertIsBattler(source);
                    data.allFailed = !await this.runEvent('Heal', { amount: source.stats.hp / 2 }, source, source, DexMoves.recover);
                }
            }]
    }),
    knock_off: new Move('knock_off', 'Knock Off', {
        type: Types.Type.DARK,
        basePower: 65,
        contact: true,
        handler: [{
                async onCauseGetDamageMultiplier(data, target) {
                    if (target.heldItem)
                        data.multiplier *= 1.5;
                },
                async onCauseApplyMoveSecondary(data, target, _, source) {
                    const item = target.heldItem;
                    if (!item)
                        return;
                    await this.runEvent(`RemoveItem`, {
                        reasonText: `${target.name} had its ${item.displayName} knocked off!`
                    }, target, source, DexMoves.knock_off);
                }
            }]
    }),
    super_fang: new Move('super_fang', 'Super Fang', {
        type: Types.Type.NORMAL,
        category: Move.Category.PHYSICAL,
        basePower: -1,
        PP: 3,
        handler: [{
                onCauseDamagePriority: 150,
                async onCauseDamage(data, target) {
                    data.amount = target.currentHP / 2;
                }
            }]
    }),
    dragon_rage: new Move('dragon_rage', 'Dragon Rage', {
        type: Types.Type.DRAGON,
        category: Move.Category.SPECIAL,
        basePower: -1,
        handler: [{
                onCauseDamagePriority: 150,
                async onCauseDamage(data) {
                    data.amount = 60;
                },
                onCauseGetTypeEffectivenessPriority: 99,
                async onCauseGetTypeEffectiveness(data) {
                    if (data.effectiveness !== 0)
                        data.effectiveness = 1;
                }
            }]
    }),
    freeze_dry: new Move('freeze_dry', 'Freeze Dry', {
        type: Types.Type.ICE,
        category: Move.Category.SPECIAL,
        basePower: 70,
        handler: [{
                onCauseGetTypeEffectivenessPriority: 101,
                async onCauseGetTypeEffectiveness(data) {
                    data.matchupTable[Types.Type.WATER].resistances = [];
                    data.matchupTable[Types.Type.WATER].weaknesses.push(Types.Type.ICE);
                }
            }]
    }),
    power_up_punch: new Move('power_up_punch', 'Power-Up Punch', {
        type: Types.Type.FIGHTING,
        basePower: 40,
        handler: [{
                async onCauseDamagingHit(data, target, wielder, source) {
                    await this.showText(`${source.name}'s attack rose!`);
                }
            }]
    }),
    swords_dance: new Move('swords_dance', 'Swords Dance', {
        category: Move.Category.STATUS,
        type: Types.Type.NORMAL,
        targeting: Move.Targeting.SELF,
        handler: [{
                async onCauseApplyMoveSecondary(data, target) {
                    data.allFailed = !await this.runEvent('StatBoost', { boosts: { atk: 2 } }, target, target, DexMoves.iron_defense);
                }
            }]
    }),
    iron_defense: new Move('iron_defense', 'Iron Defense', {
        category: Move.Category.STATUS,
        type: Types.Type.STEEL,
        targeting: Move.Targeting.SELF,
        handler: [{
                async onCauseApplyMoveSecondary(data, target) {
                    data.allFailed = !await this.runEvent('StatBoost', { boosts: { def: 2 } }, target, target, DexMoves.iron_defense);
                }
            }]
    }),
    topsy_turvy: new Move('topsy_turvy', 'Topsy Turvy', {
        category: Move.Category.STATUS,
        type: Types.Type.DARK,
        handler: []
    }),
    willowisp: new Move('willowisp', 'Will-O-Wisp', {
        type: Types.Type.FIRE,
        category: Move.Category.STATUS,
        handler: [{
                async onCauseApplyMoveSecondary(data, target, _, source) {
                    data.allFailed = !await this.runEvent('ApplyCondition', { condition: DexConditions.burn }, target, source, DexMoves.willowisp);
                }
            }]
    }),
    struggle: new Move('struggle', 'Struggle', {
        basePower: 30,
        contact: true,
        handler: []
    })
};
export default DexMoves;
