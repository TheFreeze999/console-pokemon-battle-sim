import Battle from "./Battle.js"
import Battler from "./Battler.js";
import DexAbilities from './DexAbilities.js';
import DexItems from "./DexItems.js";
import DexMoves from "./DexMoves.js";
import Move from "./Move.js";
import Util from "./util.js";


const battle = new Battle();

const abra = new Battler('Abra');
abra.setStats({
	hp: 220,
	atk: 35,
	def: 25,
	spA: 10,
	spD: 30,
	spe: 90
});

const gibble = new Battler('Gibble');
gibble.setStats({
	hp: 130,
	atk: 20,
	def: 50,
	spA: 20,
	spD: 30,
	spe: 70
});
// abra.ability = DexAbilities.magic_guard;
gibble.ability = DexAbilities.rough_skin;

abra.heldItem = DexItems.leftovers;
gibble.heldItem = DexItems.leftovers;

abra.moveSlots.set(DexMoves.tackle, 1);
abra.moveSlots.set(DexMoves.recover, 3);

gibble.moveSlots.set(DexMoves.tackle, 1);
gibble.moveSlots.set(DexMoves.recover, 3);

battle.teams[0].addBattlers(abra);
battle.teams[1].addBattlers(gibble);

battle.start();

while (battle.getWinner() === null) {
	await battle.showText(`//////////////// Turn ${battle.turn}`);

	for (const battler of battle.getAllActive()) {
		const randomMove = Util.Random.arrayEl(battler.getUsableMoves()) ?? DexMoves.struggle;
		let target: Battler[] | Battle = [Util.Random.arrayEl(battler.getActiveFoes())];
		if (randomMove.targeting === Move.Targeting.BATTLE) target = battle;
		if (randomMove.targeting === Move.Targeting.SELF) target = [battler];
		battler.decrementMovePP(randomMove)
		await battle.runEvent(`Move`, { move: randomMove }, target, battler);
	}

	await battle.endTurn();
}
