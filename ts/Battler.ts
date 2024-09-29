import Team from "./Team.js";
import Stats from "./Stats.js";
import Move from "./Move.js";
import DexAbilities from "./DexAbilities.js";
import Item from "./Item.js";

const BATTLER_SIGNATURE = Symbol('BATTLER_SIGNATURE');
class Battler {
	team!: Team;
	stats = Stats.Create.base();
	currentHP = -1;
	fainted = false;
	active = false;
	ability = DexAbilities.no_ability;
	heldItem: Item | null = null;

	/** Move to PP map */
	moveSlots = new Map<Move, number>();

	getMoves() {
		return [...this.moveSlots.keys()]
	}

	moveHasPPLeft(move: Move) {
		return Number(this.moveSlots.get(move)) >= 1
	}

	decrementMovePP(move: Move) {
		const PP = this.moveSlots.get(move)
		if (typeof PP !== 'number') return;
		this.moveSlots.set(move, PP - 1);
	}

	getUsableMoves() {
		return this.getMoves().filter(move => this.moveHasPPLeft(move));
	}

	private [BATTLER_SIGNATURE] = true;

	constructor(public name: string) {
	}


	get battle() {
		return this.team.battle;
	}

	setStats(partialStats: Partial<Stats.Base>) {
		this.stats = { ...this.stats, ...partialStats };

		if (this.currentHP < 0) this.currentHP = this.stats.hp;
	}

	getActiveAlliesAndSelf() {
		return this.team.getAllActive();
	}

	getActiveFoes() {
		return this.team.getOpposingTeam().getAllActive();
	}

	dealDamage(amount: number) {
		amount = Math.abs(Math.floor(amount));
		this.currentHP -= amount;
		if (this.currentHP < 0) {
			amount += this.currentHP;
			this.currentHP = 0;
			this.fainted = true;
		}
		return amount;
	}

	heal(amount: number) {
		amount = Math.abs(Math.floor(amount));
		this.currentHP += amount;
		if (this.currentHP > this.stats.hp) {
			amount -= (this.currentHP - this.stats.hp);
			this.currentHP = this.stats.hp;
		}
		return amount;
	}

	static isBattler(b: any): b is Battler {
		return b?.[BATTLER_SIGNATURE] === true;
	}

	static assertIsBattler(b: any): asserts b is Battler {
		if (!this.isBattler(b))
			throw new Error("Argument is not a battler");
	}

}

export default Battler;