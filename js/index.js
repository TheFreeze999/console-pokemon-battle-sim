import Battle from "./Battle.js";
import Battler from "./Battler.js";
import DexAbilities from './DexAbilities.js';
import DexItems from "./DexItems.js";
import DexMoves from "./DexMoves.js";
import Types from "./Types.js";
const battle = new Battle();
const abra = new Battler('Abra');
abra.setStats({
    hp: 240,
    atk: 35,
    def: 25,
    spA: 10,
    spD: 30,
    spe: 90
});
const gibble = new Battler('Gibble');
gibble.setStats({
    hp: 160,
    atk: 20,
    def: 50,
    spA: 20,
    spD: 30,
    spe: 70
});
gibble.types = [Types.Type.DRAGON, Types.Type.GROUND];
abra.types = [Types.Type.PSYCHIC];
gibble.abilitySlot.baseAbility = DexAbilities.shadow_shield;
// abra.abilitySlot.baseAbility = DexAbilities.insomnia;
abra.itemSlot.item = DexItems.toxic_orb;
battle.teams[0].addBattlers(abra);
battle.teams[1].addBattlers(gibble);
await battle.start();
await battle.startTurn();
await battle.runEvt('Move', { move: DexMoves.tackle }, [abra], gibble);
await battle.runEvt('Move', { move: DexMoves.tackle }, [gibble], abra);
await battle.endTurn();
await battle.startTurn();
await battle.runEvt('Move', { move: DexMoves.tackle }, [abra], gibble);
await battle.runEvt('Move', { move: DexMoves.rest }, [abra], abra);
await battle.endTurn();
await battle.startTurn();
await battle.runEvt('Move', { move: DexMoves.tackle }, [abra], gibble);
await battle.runEvt('Move', { move: DexMoves.tackle }, [gibble], abra);
await battle.endTurn();
/* while (battle.getWinner() === null) {
    console.log(`=== Turn ${battle.turn} ===`);

    for (const battler of battle.getAllActive()) {
        const randomMove = Util.Random.arrayEl(battler.getUsableMoves()) ?? DexMoves.struggle;
        let target: Battler[] | Battle = [Util.Random.arrayEl(battler.getActiveFoes())];
        if (randomMove.targeting === Move.Targeting.BATTLE) target = battle;
        if (randomMove.targeting === Move.Targeting.SELF) target = [battler];
        battler.decrementMovePP(randomMove)
        await battle.runEvent(`Move`, { move: randomMove }, target, battler);

        console.log("---")
    }

    await battle.endTurn();
}
 */
