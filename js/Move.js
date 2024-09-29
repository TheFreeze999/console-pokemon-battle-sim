import Battle from "./Battle.js";
import Util from "./util.js";
class Move {
    name;
    displayName;
    targeting = Move.Targeting.ONE_OTHER;
    category = Move.Category.PHYSICAL;
    basePower = 0;
    async applySecondary(target, user) { }
    async applySecondariesOnHit(targetBattler, user) { }
    constructor(name, displayName, data = {}) {
        this.name = name;
        this.displayName = displayName;
        Object.assign(this, data);
    }
    verifyCorrectTargetSelection(user, target) {
        if (target instanceof Battle)
            return this.targeting === Move.Targeting.BATTLE;
        if (this.targeting === Move.Targeting.ONE_OTHER && target.length === 1 && target[0] !== user && target[0]?.active)
            return true;
        if (this.targeting === Move.Targeting.SELF && target.length === 1 && target[0] === user)
            return true;
        return false;
    }
    calcDamage(attacker, defender) {
        if (!this.isStandardDamagingAttack())
            return null;
        const attackingStat = (this.category === Move.Category.PHYSICAL ? "atk" : "spA");
        const defendingStat = (this.category === Move.Category.PHYSICAL ? "def" : "spD");
        return Math.floor((this.basePower + attacker.stats[attackingStat] - defender.stats[defendingStat]) * Util.Random.int(85, 100) / 100);
    }
    isStandardDamagingAttack() {
        return this.category !== Move.Category.STATUS && this.basePower > 0;
    }
}
(function (Move) {
    let Targeting;
    (function (Targeting) {
        Targeting["ONE_OTHER"] = "ONE_OTHER";
        Targeting["SELF"] = "SELF";
        Targeting["BATTLE"] = "BATTLE";
    })(Targeting = Move.Targeting || (Move.Targeting = {}));
    let Category;
    (function (Category) {
        Category["PHYSICAL"] = "PHYSICAL";
        Category["SPECIAL"] = "SPECIAL";
        Category["STATUS"] = "STATUS";
    })(Category = Move.Category || (Move.Category = {}));
})(Move || (Move = {}));
export default Move;
