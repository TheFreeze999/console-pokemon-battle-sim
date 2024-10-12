import Stats from "./Stats.js";
import DexAbilities from "./DexAbilities.js";
import Types from "./Types.js";
import Util from "./util.js";
const BATTLER_SIGNATURE = Symbol('BATTLER_SIGNATURE');
class Battler {
    name;
    id;
    team;
    stats = Stats.Create.base();
    statBoosts = Stats.Create.boostable();
    currentHP = -1;
    fainted = false;
    active = false;
    ability = DexAbilities.no_ability;
    heldItem = null;
    conditions = new Set();
    data = {};
    types = [Types.Type["???"]];
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
    getWieldedEffects() {
        const effects = [this.ability, ...this.conditions, ...this.getMoves()];
        if (this.heldItem)
            effects.push(this.heldItem);
        return effects;
    }
    getWieldedEffectsHandlerCombination() {
        return this.getWieldedEffects().flatMap(effect => effect.handler);
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
        if (this.currentHP <= 0) {
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
    setMoveset(moves) {
        this.moveSlots.clear();
        for (const move of moves) {
            this.moveSlots.set(move, move.PP);
        }
    }
    static isBattler(b) {
        return b?.[BATTLER_SIGNATURE] === true;
    }
    static assertIsBattler(b) {
        if (!this.isBattler(b))
            throw new Error("Argument is not a battler");
    }
    applyBoosts(boosts) {
        const statClamp = Util.clamper(-6, 6);
        const changes = {};
        for (const [stat, boost] of Util.objectEntries(boosts)) {
            const oldValue = this.statBoosts[stat];
            this.statBoosts[stat] = statClamp(oldValue + boost);
            if (oldValue !== this.statBoosts[stat]) {
                changes[stat] = this.statBoosts[stat] - oldValue;
            }
        }
        return changes;
    }
    getEffectiveStats() {
        const result = Stats.Create.withoutHP();
        for (const [stat] of Util.objectEntries(this.stats)) {
            if (stat === 'hp')
                continue;
            let numerator = 2;
            let denominator = 2;
            if (this.statBoosts[stat] > 0)
                numerator += this.statBoosts[stat];
            else if (this.statBoosts[stat] < 0)
                denominator += this.statBoosts[stat];
            result[stat] = this.stats[stat] * (numerator / denominator);
        }
        return result;
    }
    hasStatusCondition() {
        return [...this.conditions].some(c => c.isStatus);
    }
}
export default Battler;
