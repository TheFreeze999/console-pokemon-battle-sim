import Battler from "./Battler.js";
import GLOBAL_EVENT_HANDLER from "./GlobalEventHandler.js";
import Team from "./Team.js";
import Types from "./Types.js";
import Util from "./util.js";
class Battle {
    id = 'Battle-0';
    teams;
    turn = 1;
    battlerIDGen = Util.createIDGen();
    generateBattlerID() { return `B-${this.battlerIDGen.next().value}`; }
    effectStates = {};
    /** Gets the state tied to each Battler-Effect pair
     * @param target By default, ID of last `runEvent` target that was a battler.
     * @param effect By default, name of last `cause` that was passed into `runEvent`.
     */
    getEffectState(target, effect) {
        if (typeof target !== "string")
            target = target.id;
        if (typeof effect !== 'string')
            effect = effect.id;
        this.effectStates[effect] ??= {};
        this.effectStates[effect][target] ??= {};
        return this.effectStates[effect][target];
    }
    constructor() {
        this.initTeams();
    }
    initTeams() {
        const team0 = new Team(this, 'T-0');
        const team1 = new Team(this, 'T-1');
        this.teams = [team0, team1];
    }
    logStatus() {
        for (const team of this.teams) {
            console.log(`// TEAM: ${team.id}`);
            for (const battler of team.battlers) {
                console.log(`${battler.name} [${battler.id}]:`, battler.stats);
            }
            console.log('\n');
        }
    }
    start() {
        for (const team of this.teams) {
            for (const [i, battler] of team.battlers.entries()) {
                battler.active = i === 0;
            }
        }
    }
    getAllBattlers() {
        return this.teams.flatMap(team => team.battlers);
    }
    getAllActive() {
        return this.teams.flatMap(team => team.getAllActive());
    }
    async showText(...texts) {
        for (const text of texts) {
            // await Util.delay(500);
            console.log(String(text));
            // await Util.delay(500);
        }
    }
    async runEvent(eventName, data, target, source = null, cause = null) {
        let listenerFns = [];
        if (Array.isArray(target)) {
            for (const targetBattler of target) {
                listenerFns.push(...this.getBattlerListenerFns(eventName, targetBattler, false));
            }
        }
        else if (Battler.isBattler(target)) {
            listenerFns.push(...this.getBattlerListenerFns(eventName, target, false));
        }
        else { /* logic for if target is battle */ }
        if (source) {
            listenerFns.push(...this.getBattlerListenerFns(eventName, source, true));
        }
        if (cause) {
            for (const obj of cause.handler) {
                const fn = obj[`onCause${eventName}`];
                if (!fn)
                    continue;
                const priority = obj[`onCause${eventName}Priority`] ?? 0;
                listenerFns.push({ fn, priority, wielder: null });
            }
        }
        for (const obj of GLOBAL_EVENT_HANDLER) {
            const fn = obj[`on${eventName}`];
            if (!fn)
                continue;
            const priority = obj[`on${eventName}Priority`] ?? 0;
            listenerFns.push({ fn, priority, wielder: null });
        }
        listenerFns.sort((objA, objB) => objB.priority - objA.priority);
        for (const { fn, wielder } of listenerFns) {
            const result = await fn.call(this, data, target, wielder, source, cause);
            if (result === null)
                return null;
            if (result !== undefined)
                data = result;
        }
        return data;
    }
    getBattlerListenerFns(eventName, battler, isSource) {
        const sourcePrefix = isSource ? 'Source' : 'Target';
        let listenerFns = [];
        for (const obj of battler.getWieldedEffectsHandlerCombination()) {
            const fn = obj[`on${sourcePrefix}${eventName}`];
            if (!fn)
                continue;
            const priority = obj[`on${sourcePrefix}${eventName}Priority`] ?? 0;
            listenerFns.push({ fn, priority, wielder: battler });
        }
        for (const ally of battler.getActiveAlliesAndSelf()) {
            for (const obj of ally.getWieldedEffectsHandlerCombination()) {
                const fn = obj[`on${sourcePrefix}Ally${eventName}`];
                if (!fn)
                    continue;
                const priority = obj[`on${sourcePrefix}Ally${eventName}Priority`] ?? 0;
                listenerFns.push({ fn, priority, wielder: ally });
            }
        }
        for (const foe of battler.getActiveFoes()) {
            for (const obj of foe.getWieldedEffectsHandlerCombination()) {
                const fn = obj[`on${sourcePrefix}Foe${eventName}`];
                if (!fn)
                    continue;
                const priority = obj[`on${sourcePrefix}Foe${eventName}Priority`] ?? 0;
                listenerFns.push({ fn, priority, wielder: foe });
            }
        }
        return listenerFns;
    }
    getWinner() {
        if (this.teams[0].hasLost())
            return this.teams[1];
        if (this.teams[1].hasLost())
            return this.teams[0];
        return null;
    }
    async endTurn() {
        console.log("---");
        for (const battler of this.getAllActive()) {
            await this.runEvent('Residual', {}, battler);
        }
        this.turn++;
    }
    async getDamageMultiplier(defender, attacker, move, baseMultiplier = 1) {
        const damageMultiplierResult = await this.runEvent('GetDamageMultiplier', { multiplier: baseMultiplier }, defender, attacker, move);
        return damageMultiplierResult?.multiplier ?? baseMultiplier;
    }
    async getTypeEffectiveness(defender, attacker, move, baseEffectiveness = 1, matchupTable = Types.getMatchupTable()) {
        return (await this.runEvent('GetTypeEffectiveness', { effectiveness: baseEffectiveness, matchupTable }, defender, attacker, move))?.effectiveness ?? 1;
    }
}
export default Battle;
