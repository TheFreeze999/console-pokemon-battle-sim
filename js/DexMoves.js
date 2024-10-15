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
                if (await this.chance([10, 100], evt))
                    await this.runEvt('ApplyCondition', { condition: DexConditions.burn }, evt.target, evt.source, DexMoves.ember);
            }
        }
    }),
    recover: new Move('recover', 'Recover', {
        type: Types.Type.NORMAL,
        category: Move.Category.STATUS,
        targeting: Move.Targeting.SELF,
        handler: {
            async onCauseApplyMoveSecondary({ target }) {
                await this.runEvt('Heal', { amount: target.stats.hp / 2 }, target, target, DexMoves.recover);
            }
        }
    })
};
export default DexMoves;
