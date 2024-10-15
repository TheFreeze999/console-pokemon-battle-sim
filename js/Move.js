import Battle from "./Battle.js";
import Types from "./Types.js";
import Util from "./util.js";
class Move {
    displayName;
    targeting = Move.Targeting.ONE_OTHER;
    category = Move.Category.PHYSICAL;
    basePower = 0;
    type = Types.Type["???"];
    contact = false;
    bypassTypeImmunity = false;
    PP = 10;
    id;
    handlers = [];
    constructor(id, displayName, data = {}) {
        this.displayName = displayName;
        this.id = id;
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
    calcDamage(attacker, defender, additionalModifiers = 1) {
        if (!this.isStandardDamagingAttack())
            return null;
        const attackingStat = (this.category === Move.Category.PHYSICAL ? "atk" : "spA");
        const defendingStat = (this.category === Move.Category.PHYSICAL ? "def" : "spD");
        const typeEffectiveness = Types.calcEffectiveness([this.type], defender.types);
        if (typeEffectiveness === 0)
            return 0;
        const STABModifier = attacker.types.includes(this.type) ? 1.5 : 1;
        const modifiers = additionalModifiers * STABModifier;
        return Util.clamper(1)(Math.floor((this.basePower * attacker.getEffectiveStats()[attackingStat] / defender.getEffectiveStats()[defendingStat]) * Util.Random.int(100, 100) / 100 * modifiers));
    }
    isStandardDamagingAttack() {
        return this.category !== Move.Category.STATUS && !!this.basePower;
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
