import Battle from "./Battle.js";
import Battler from "./Battler.js";
import Effect from "./Effect.js";
import Stats from "./Stats.js";
import Util from "./util.js";

class Move implements Effect, Move.Data {

	targeting = Move.Targeting.ONE_OTHER;
	category = Move.Category.PHYSICAL;
	basePower = 0;
	async applySecondary(target: Battler[], user: Battler) { }
	async applySecondariesOnHit(targetBattler: Battler, user: Battler) { }



	constructor(public name: string, public displayName: string, data: Partial<Move.Data> = {}) {
		Object.assign(this, data);
	}

	verifyCorrectTargetSelection(user: Battler, target: Battler[] | Battle): boolean {
		if (target instanceof Battle) return this.targeting === Move.Targeting.BATTLE;

		if (this.targeting === Move.Targeting.ONE_OTHER && target.length === 1 && target[0] !== user && target[0]?.active) return true;

		if (this.targeting === Move.Targeting.SELF && target.length === 1 && target[0] === user) return true;

		return false;
	}

	calcDamage(attacker: Battler, defender: Battler): number | null {
		if (!this.isStandardDamagingAttack()) return null;
		const attackingStat = (this.category === Move.Category.PHYSICAL ? "atk" : "spA");
		const defendingStat = (this.category === Move.Category.PHYSICAL ? "def" : "spD");
		return Math.floor((this.basePower + attacker.stats[attackingStat] - defender.stats[defendingStat]) * Util.Random.int(85, 100) / 100);
	}

	isStandardDamagingAttack() {
		return this.category !== Move.Category.STATUS && this.basePower > 0;
	}
}

namespace Move {
	export enum Targeting {
		ONE_OTHER = 'ONE_OTHER',
		SELF = 'SELF',
		BATTLE = 'BATTLE',
	}
	export enum Category {
		PHYSICAL = 'PHYSICAL',
		SPECIAL = 'SPECIAL',
		STATUS = 'STATUS',
	}

	export type Data = Pick<Move, "category" | "targeting" | "basePower" | "applySecondary" | "applySecondariesOnHit">
}


export default Move;