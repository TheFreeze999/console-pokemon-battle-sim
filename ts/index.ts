import Battle from "./Battle.js"
import Battler from "./Battler.js";
import DexAbilities from './DexAbilities.js';
import DexConditions from "./DexConditions.js";
import DexItems from "./DexItems.js";
import DexMoves from "./DexMoves.js";
import Evt from "./Evt.js";
import Move from "./Move.js";
import Types from "./Types.js";
import Util from "./util.js";

const battle = new Battle();

const abra = new Battler('Abra');
abra.setStats({
	hp: 130,
	atk: 35,
	def: 25,
	spA: 10,
	spD: 30,
	spe: 100
});

const gibble = new Battler('Gibble');
gibble.setStats({
	hp: 130,
	atk: 35,
	def: 25,
	spA: 10,
	spD: 30,
	spe: 90
});

gibble.types = [Types.Type.DRAGON, Types.Type.STEEL/* , Types.Type.ELECTRIC */];
abra.types = [Types.Type.PSYCHIC];

// gibble.abilitySlot.baseAbility = Util.getRandomFromDex(DexAbilities);
// abra.abilitySlot.baseAbility = Util.getRandomFromDex(DexAbilities);
gibble.abilitySlot.baseAbility = DexAbilities.magic_bounce;

// gibble.itemSlot.item = Util.getRandomFromDex(DexItems);
// abra.itemSlot.item = Util.getRandomFromDex(DexItems);


battle.teams[0].addBattlers(abra);
battle.teams[1].addBattlers(gibble);

for (const battler of [abra, gibble]) {
	battle.debug(`${battler.name}'s Item: ${battler.getItem()?.displayName}.`)
	battle.debug(`${battler.name}'s Ability: ${battler.getAbility().displayName}.`)
}

await battle.start();

await battle.startTurn();

battle.submitAction(abra, { type: 'move', move: DexMoves.glare });
battle.submitAction(gibble, { type: 'move', move: DexMoves.ember });

await battle.executeAllActions();

await battle.endTurn();


await battle.startTurn();

battle.submitAction(abra, { type: 'move', move: DexMoves.glare });
battle.submitAction(gibble, { type: 'move', move: DexMoves.ember });

await battle.executeAllActions();

await battle.endTurn();




/* while (!battle.ended) {
	gibble.abilitySlot.baseAbility = Util.getRandomFromDex(DexAbilities);
	abra.abilitySlot.baseAbility = Util.getRandomFromDex(DexAbilities);

	gibble.itemSlot.item = Util.getRandomFromDex(DexItems);
	abra.itemSlot.item = Util.getRandomFromDex(DexItems);

	battle.debug(`${gibble.name}'s Item: ${gibble.getItem()?.displayName}`)
	battle.debug(`${gibble.name}'s Ability: ${gibble.getAbility()?.displayName}`)

	battle.debug(`${abra.name}'s Item: ${abra.getItem()?.displayName}`)
	battle.debug(`${abra.name}'s Ability: ${abra.getAbility()?.displayName}`)

	await battle.startTurn();

	const first = Util.Random.arrayEl([abra, gibble]);
	const second = first.getActiveFoes()[0]!;

	await first.useMove(Util.getRandomFromDex(DexMoves));
	await second.useMove(Util.getRandomFromDex(DexMoves));

	await battle.endTurn();
} */



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

