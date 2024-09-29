import Stats from "./Stats.js";
import DexAbilities from "./DexAbilities.js";
const BATTLER_SIGNATURE = Symbol('BATTLER_SIGNATURE');
class Battler {
    name;
    team;
    stats = Stats.Create.base();
    currentHP = -1;
    fainted = false;
    active = false;
    ability = DexAbilities.no_ability;
    heldItem = null;
    /** Move to PP map */
    moveSlots = new Map();
    getMoves() {
        return [...this.moveSlots.keys()];
    }
    moveHasPPLeft(move) {
        return Number(this.moveSlots.get(move)) >= 1;
    }
    decrementMovePP(move) {
        const PP = this.moveSlots.get(move);
        if (typeof PP !== 'number')
            return;
        this.moveSlots.set(move, PP - 1);
    }
    getUsableMoves() {
        return this.getMoves().filter(move => this.moveHasPPLeft(move));
    }
    [BATTLER_SIGNATURE] = true;
    constructor(name) {
        this.name = name;
    }
    get battle() {
        return this.team.battle;
    }
    setStats(partialStats) {
        this.stats = { ...this.stats, ...partialStats };
        if (this.currentHP < 0)
            this.currentHP = this.stats.hp;
    }
    getActiveAlliesAndSelf() {
        return this.team.getAllActive();
    }
    getActiveFoes() {
        return this.team.getOpposingTeam().getAllActive();
    }
    dealDamage(amount) {
        amount = Math.abs(Math.floor(amount));
        this.currentHP -= amount;
        if (this.currentHP < 0) {
            amount += this.currentHP;
            this.currentHP = 0;
            this.fainted = true;
        }
        return amount;
    }
    heal(amount) {
        amount = Math.abs(Math.floor(amount));
        this.currentHP += amount;
        if (this.currentHP > this.stats.hp) {
            amount -= (this.currentHP - this.stats.hp);
            this.currentHP = this.stats.hp;
        }
        return amount;
    }
    static isBattler(b) {
        return b?.[BATTLER_SIGNATURE] === true;
    }
    static assertIsBattler(b) {
        if (!this.isBattler(b))
            throw new Error("Argument is not a battler");
    }
}
export default Battler;
