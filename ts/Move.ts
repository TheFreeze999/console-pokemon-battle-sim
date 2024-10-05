import Battle from "./Battle.js";
import Battler from "./Battler.js";
import Effect from "./Effect.js";
import event from "./Event.js";
import Stats from "./Stats.js";
import Types from "./Types.js";
import Util from "./util.js";

class Move implements Effect, Move.Data {

	targeting = Move.Targeting.ONE_OTHER;
	category = Move.Category.PHYSICAL;
	basePower = 0;
	type = Types.Type["???"];
	contact = false;
	handler: event.Handler = [];
	PP = 10;

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

		const typeEffectivenessModifier = Types.calcEffectiveness([this.type], defender.types);
		const STABModifier = attacker.types.includes(this.type) ? 1.5 : 1;
		const modifiers = typeEffectivenessModifier * STABModifier;

		return Util.clamper(1)(Math.floor((this.basePower + attacker.getEffectiveStats()[attackingStat] - defender.getEffectiveStats()[defendingStat]) * Util.Random.int(85, 100) / 100 * modifiers));
	}

	isStandardDamagingAttack() {
		return this.category !== Move.Category.STATUS && !!this.basePower;
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

	export type Data = Pick<Move, "category" | "targeting" | "basePower" | "type" | "contact" | "handler" | "PP">
}


export default Move;