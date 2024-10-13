import Battler from "./Battler.js";
import GLOBAL_EVENT_HANDLERS from "./GlobalEvtHandlers.js";
import Team from "./Team.js";
import Util from "./util.js";
class Battle {
    id = 'Battle-0';
    teams;
    turn = 1;
    battlerIDGen = Util.createIDGen();
    generateBattlerID() { return `B-${this.battlerIDGen.next().value}`; }
    effectStates = {};
    /** Gets the state tied to each Battler-Effect pair
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
    getWinner() {
        if (this.teams[0].hasLost())
            return this.teams[1];
        if (this.teams[1].hasLost())
            return this.teams[0];
        return null;
    }
    async runEvt(evt) {
        while (this.getRemainingListenersForEvt(evt).length > 0) {
            const listener = this.getRemainingListenersForEvt(evt)[0];
            evt.handledCallbacks.push(listener.callback);
            if (evt.listenerBlacklists.some(lb => lb.checker(listener) === true))
                continue;
            const result = await listener.callback.call(this, evt, listener);
            if (result === null)
                return null;
            if (result !== undefined)
                evt.data = result;
        }
        return evt.data;
    }
    getRemainingListenersForEvt(evt) {
        const listeners = [];
        if (Battler.isBattler(evt.target)) {
            listeners.push(...this.getListenersFromBattlerEffects(evt, evt.target, "Target", "self"));
            for (const ally of evt.target.getActiveAlliesAndSelf()) {
                listeners.push(...this.getListenersFromBattlerEffects(evt, ally, "Target", "ally"));
            }
            for (const foe of evt.target.getActiveFoes()) {
                listeners.push(...this.getListenersFromBattlerEffects(evt, foe, "Target", "foe"));
            }
        }
        if (Battler.isBattler(evt.source)) {
            listeners.push(...this.getListenersFromBattlerEffects(evt, evt.source, "Source", "self"));
            for (const ally of evt.source.getActiveAlliesAndSelf()) {
                listeners.push(...this.getListenersFromBattlerEffects(evt, ally, "Source", "ally"));
            }
            for (const foe of evt.source.getActiveFoes()) {
                listeners.push(...this.getListenersFromBattlerEffects(evt, foe, "Source", "foe"));
            }
        }
        if (evt.cause) {
            const callbackName = `onCause${evt.name}`;
            const callback = evt.cause.handler[callbackName];
            if (callback) {
                const listener = {
                    evt,
                    priority: evt.cause.handler[`${callbackName}Priority`] ?? 0,
                    callback: callback,
                    origin: { cause: evt.cause }
                };
                listeners.push(listener);
            }
        }
        for (const handler of GLOBAL_EVENT_HANDLERS) {
            const callbackName = `on${evt.name}`;
            const callback = handler[callbackName];
            if (callback) {
                const listener = {
                    evt,
                    priority: handler[`${callbackName}Priority`] ?? 0,
                    callback: callback,
                    origin: 'global'
                };
                listeners.push(listener);
            }
        }
        listeners.sort((a, b) => b.priority - a.priority);
        return listeners.filter(listener => !evt.handledCallbacks.includes(listener.callback));
    }
    getListenersFromBattlerEffects(evt, battler, targetOrSource, relation) {
        const listeners = [];
        for (const effect of battler.getWieldedEffects()) {
            const relationStr = {
                'self': '',
                'ally': 'Ally',
                'foe': 'Foe'
            }[relation];
            const callbackName = `on${targetOrSource}${relationStr}${evt.name}`;
            const callback = effect.handler[`${callbackName}`];
            if (!callback)
                continue;
            let origin;
            if (targetOrSource === 'Target') {
                origin = { target: battler, relation, wieldedEffect: effect };
            }
            else {
                origin = { source: battler, relation, wieldedEffect: effect };
            }
            const listener = {
                evt,
                priority: effect.handler[`${callbackName}Priority`] ?? 0,
                callback: callback,
                origin
            };
            listeners.push(listener);
        }
        return listeners;
    }
    async endTurn() {
        console.log("---");
        for (const battler of this.getAllActive()) {
            // await this.runEvent('Residual', {}, battler);
        }
        this.turn++;
    }
}
export default Battle;
