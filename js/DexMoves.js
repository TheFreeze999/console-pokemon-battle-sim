import DexConditions from "./DexConditions.js";
import Move from "./Move.js";
import Types from "./Types.js";
const DexMoves = {
    tackle: new Move('tackle', 'Tackle', {
        type: Types.Type.NORMAL,
        basePower: 40,
    }),
    ember: new Move('ember', 'Ember', {
        category: Move.Category.SPECIAL,
        type: Types.Type.FIRE,
        basePower: 40,
        handler: {
            async onCauseHit(evt) {
                if (await this.chance([100, 100], evt))
                    await this.runEvt('ApplyCondition', { condition: DexConditions.burn }, evt.target, evt.source, DexMoves.ember);
            }
        }
    }),
    water_pulse: new Move('water_pulse', 'Water Pulse', {
        category: Move.Category.SPECIAL,
        type: Types.Type.WATER,
        basePower: 60,
    }),
    dragon_rage: new Move('dragon_rage', 'Dragon Rage', {
        category: Move.Category.SPECIAL,
        handler: {
            onCauseHitPriority: 101,
            async onCauseHit({ data, target, source, cause }) {
                await this.runEvt('Damage', { amount: 60, isDirect: true }, target, source, cause);
            }
        }
    }),
    glare: new Move('glare', 'Glare', {
        category: Move.Category.STATUS,
        type: Types.Type.NORMAL,
        bypassTypeImmunity: true,
        handler: {
            onCauseHitPriority: 101,
            async onCauseHit(evt) {
                evt.data.fail = !await this.runEvt('ApplyCondition', { condition: DexConditions.prz }, evt.target, evt.source, DexMoves.ember);
            }
        }
    }),
    thunder_wave: new Move('thunder_wave', 'Thunder Wave', {
        category: Move.Category.STATUS,
        type: Types.Type.ELECTRIC,
        handler: {
            onCauseHitPriority: 101,
            async onCauseHit(evt) {
                evt.data.fail = !await this.runEvt('ApplyCondition', { condition: DexConditions.prz }, evt.target, evt.source, DexMoves.ember);
            }
        }
    }),
    toxic: new Move('toxic', 'Toxic', {
        category: Move.Category.STATUS,
        type: Types.Type.POISON,
        handler: {
            onCauseHitPriority: 101,
            async onCauseHit(evt) {
                evt.data.fail = !await this.runEvt('ApplyCondition', { condition: DexConditions.tox }, evt.target, evt.source, DexMoves.ember);
            }
        }
    }),
    recover: new Move('recover', 'Recover', {
        type: Types.Type.NORMAL,
        category: Move.Category.STATUS,
        targeting: Move.Targeting.SELF,
        handler: {
            onCauseApplyMoveSecondaryPriority: 150,
            async onCauseApplyMoveSecondary({ target, data }) {
                data.fail = !await this.runEvt('Heal', { amount: target.stats.hp / 2 }, target, target, DexMoves.recover);
            }
        }
    })
};
export default DexMoves;
