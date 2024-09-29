import Move from "./Move.js";
import Types from "./Type.js";
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
        handler: [
            {
                async onSourceEffectApplyMoveSecondary(data, target, _, user) {
                    if (!user)
                        return null;
                    const result = await user.battle.runEvent('Heal', { amount: user.stats.hp / 2 }, user);
                    if (result === null)
                        return null;
                }
            }
        ]
    }),
    knock_off: new Move('knock_off', 'Knock Off', {
        type: Types.Type.DARK,
        basePower: 65,
        contact: true,
        handler: [
            {
                async onSourceEffectApplyMoveSecondary(data, target, _, user) {
                    const targetBattler = data.hitBattlers[0];
                    if (!targetBattler || !user)
                        return;
                    const item = targetBattler.heldItem;
                    if (!item)
                        return;
                    await user.battle.runEvent('RemoveItem', { reasonText: `${targetBattler.name} had its ${item.displayName} knocked off.` }, targetBattler, user, DexMoves.knock_off);
                },
                async onSourceEffectGetDamageMultiplier(mult, target) {
                    if (target.heldItem !== null)
                        return mult * 1.5;
                },
            }
        ]
    }),
    struggle: new Move('struggle', 'Struggle', {
        basePower: 65,
        contact: true,
        handler: [
            {
                async onSourceEffectApplyMoveSecondary(data, target, _, user) {
                    if (!Array.isArray(target) || !target[0] || !user)
                        return;
                    await user.battle.runEvent('Damage', {
                        amount: user.stats.hp / 4,
                        recoil: {
                            isRecoil: true,
                            showText: true
                        }
                    }, user, user, DexMoves.struggle);
                }
            }
        ]
    })
};
export default DexMoves;
