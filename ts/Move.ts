import Battle from "./Battle.js";
import Battler from "./Battler.js";
import Effect from "./Effect.js";
import Evt from "./Evt.js";
import Stats from "./Stats.js";
import Types from "./Types.js";
import Util from "./util.js";

class Move implements Effect, Move.Data {
	id: Effect.ID;

	targeting = Move.Targeting.ONE_OTHER;
	category = Move.Category.PHYSICAL;
	basePower = 0;
	type = Types.Type["???"];
	contact = false;
	bypassTypeImmunity = false;
	protectLike = false;
	ohko = false;
	bounceable = false;
	sound = false;
	PP = 10;
	priority = 0;
	accuracy = 100;
	hits = [1];
	critRatio = 0;

	handlers: Evt.Handler[] = [];

	constructor(id: string, public displayName: string, data: Partial<Move.Data> = {}) {
		this.id = id as Effect.ID;
		Object.assign(this, data);
	}

	verifyCorrectTargetSelection(user: Battler, target: Battler[] | Battle): boolean {
		if (target instanceof Battle) return this.targeting === Move.Targeting.BATTLE;

		if (this.targeting === Move.Targeting.ONE_OTHER && target.length === 1 && target[0] !== user && target[0]?.active) return true;

		if (this.targeting === Move.Targeting.SELF && target.length === 1 && target[0] === user) return true;

		return false;
	}

	calcDamage(attacker: Battler, defender: Battler, options: {
		additionalModifiers?: number;
		isCrit?: boolean;
	} = {}): number | null {
		const additionalModifiers = options.additionalModifiers ?? 1;
		const isCrit = options.isCrit ?? false;

		if (!this.isStandardDamagingAttack()) return null;
		const attackingStat = (this.category === Move.Category.PHYSICAL ? "atk" : "spA");
		const defendingStat = (this.category === Move.Category.PHYSICAL ? "def" : "spD");

		const typeEffectiveness = Types.calcEffectiveness([this.type], defender.types);
		if (typeEffectiveness === 0) return 0;

		const STABModifier = attacker.types.includes(this.type) ? 1.5 : 1;
		const critModifier = isCrit ? 1.5 : 1;
		const modifiers = additionalModifiers * STABModifier * critModifier;


		return Util.clamper(1)(Math.floor((this.basePower * attacker.getEffectiveStats({
			ignoreNegativeStatBoosts: isCrit
		})[attackingStat] / defender.getEffectiveStats({
			ignorePositiveStatBoosts: isCrit
		})[defendingStat]) * Util.Random.int(100, 100) / 100 * modifiers));
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

	export type Data = Pick<Move, "sound" | "critRatio" | "hits" | "accuracy" | "bounceable" | "priority" | "protectLike" | "ohko" | "category" | "targeting" | "basePower" | "type" | "contact" | "PP" | "handlers" | "bypassTypeImmunity">
}


export default Move;