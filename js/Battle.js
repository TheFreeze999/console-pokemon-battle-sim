import Battler from "./Battler.js";
import Evt from "./Evt.js";
import GLOBAL_EVENT_HANDLERS from "./GlobalEvtHandlers.js";
import Team from "./Team.js";
import Util from "./util.js";
class Battle {
    id = 'Battle-0';
    teams;
    turn = 1;
    evtAncestry = [];
    get currentEvent() { return this.evtAncestry[0] ?? null; }
    ;
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
    async start() {
        console.log("***");
        for (const team of this.teams) {
            for (const [i, battler] of team.battlers.entries()) {
                battler.active = i === 0;
            }
        }
        for (const active of this.getAllActiveInSpeedOrder()) {
            await this.runEvt('SwitchIn', { autostart: false }, active);
        }
        for (const active of this.getAllActiveInSpeedOrder()) {
            await this.runEvt('Start', {}, active);
        }
        console.log("===\n");
    }
    getAllBattlers() {
        return this.teams.flatMap(team => team.battlers);
    }
    /** Sorts all active battlers in speed order, fastest first. */
    getAllActiveInSpeedOrder() {
        return this.teams.flatMap(team => team.getAllActive()).sort((a, b) => b.getEffectiveStats().spe - a.getEffectiveStats().spe);
    }
    async showText(...texts) {
        for (const text of texts) {
            // await Util.delay(500);
            console.log(String(text));
            // await Util.delay(500);
        }
    }
    debug(...texts) {
        const smartText = (t) => {
            if (typeof t !== 'object')
                return t;
            if (t === null)
                return t;
            for (const key of ["displayName", "name", "id"]) {
                if (t[key] !== undefined && t[key] !== null && typeof t[key] !== "object")
                    return t[key];
            }
            if (Array.isArray(t))
                return t.map((el) => smartText(el));
            return t;
        };
        console.log("\x1b[34m", ">", ...texts.map(text => smartText(text)), "\x1b[0m");
    }
    getWinner() {
        if (this.teams[0].hasLost())
            return this.teams[1];
        if (this.teams[1].hasLost())
            return this.teams[0];
        return null;
    }
    async runEvt(...args) {
        if (args.length === 1) {
            return this.runEvtImpl(args[0]);
        }
        else
            return this.runEvtImpl(new Evt(...args));
    }
    async runEvtImpl(evt) {
        this.evtAncestry.unshift(evt);
        while (this.getRemainingListenersForEvt(evt).length > 0) {
            const listener = this.getRemainingListenersForEvt(evt)[0];
            evt.handledCallbacks.push(listener.callback);
            if (evt.listenerBlacklists.some(lb => lb.checker(listener) === true))
                continue;
            const result = await listener.callback.call(this, evt, listener);
            if (result === null) {
                this.evtAncestry.shift();
                return null;
            }
            if (result !== undefined)
                evt.data = result;
        }
        this.evtAncestry.shift();
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
        if (Array.isArray(evt.target)) {
            for (const targetBattler of evt.target) {
                if (!Battler.isBattler(targetBattler))
                    continue;
                listeners.push(...this.getListenersFromBattlerEffects(evt, targetBattler, "Target", "self"));
                for (const ally of targetBattler.getActiveAlliesAndSelf()) {
                    listeners.push(...this.getListenersFromBattlerEffects(evt, ally, "Target", "ally"));
                }
                for (const foe of targetBattler.getActiveFoes()) {
                    listeners.push(...this.getListenersFromBattlerEffects(evt, foe, "Target", "foe"));
                }
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
            const callbackName = `onAny${evt.name}`;
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
    async startTurn() {
        console.log(`[[Turn #${this.turn}]]\n`);
    }
    async endTurn() {
        console.log("\n---");
        for (const battler of this.getAllActiveInSpeedOrder()) {
            await this.runEvt(new Evt('Residual', {}, battler));
        }
        this.turn++;
        console.log("---\n");
    }
    async chance(odds, forEvt) {
        return !!(await this.runEvt('Chance', { odds, forEvt }, forEvt.target, forEvt.source, forEvt.cause))?.result;
    }
    getEventAncestors(evt) {
        return this.evtAncestry.slice(this.evtAncestry.indexOf(evt) + 1);
    }
}
export default Battle;
