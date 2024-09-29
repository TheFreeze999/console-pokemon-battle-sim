import Battle from "./Battle.js";
import Types from "./Type.js";
import Util from "./util.js";
class Move {
    name;
    displayName;
    targeting = Move.Targeting.ONE_OTHER;
    category = Move.Category.PHYSICAL;
    basePower = 0;
    type = Types.Type["???"];
    contact = false;
    handler = [];
    PP = 10;
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
        const typeEffectivenessModifier = Types.calcEffectiveness([this.type], defender.types);
        const STABModifier = attacker.types.includes(this.type) ? 1.5 : 1;
        const modifiers = typeEffectivenessModifier * STABModifier;
        return Math.floor((this.basePower + attacker.stats[attackingStat] - defender.stats[defendingStat]) * Util.Random.int(85, 100) / 100 * modifiers);
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
