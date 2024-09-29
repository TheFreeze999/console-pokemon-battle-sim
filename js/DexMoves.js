import Move from "./Move.js";
const DexMoves = {
    tackle: new Move('tackle', 'Tackle', {
        basePower: 40
    }),
    recover: new Move('recover', 'Recover', {
        category: Move.Category.STATUS,
        targeting: Move.Targeting.SELF,
        async applySecondary(target, user) {
            await user.battle.runEvent('Heal', { amount: user.stats.hp / 2 }, user);
        },
    }),
    knock_off: new Move('knock_off', 'Knock Off', {
        basePower: 65,
        async applySecondariesOnHit(targetBattler, user) {
            const item = targetBattler.heldItem;
            if (!item)
                return;
            await user.battle.runEvent('RemoveItem', { reasonText: `${targetBattler.name} had its ${item.displayName} knocked off.` }, targetBattler, user, DexMoves.knock_off);
        },
    }),
    struggle: new Move('struggle', 'Struggle', {
        basePower: 65,
        async applySecondariesOnHit(targetBattler, user) {
            await user.battle.runEvent('Damage', { amount: user.stats.hp / 4 }, user, user, DexMoves.struggle);
        },
    })
};
export default DexMoves;
