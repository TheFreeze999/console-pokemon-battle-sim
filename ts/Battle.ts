import Battler from "./Battler.js";
import DexAbilities from "./DexAbilities.js";
import DexConditions from "./DexConditions.js";
import DexItems from "./DexItems.js";
import Effect from "./Effect.js";
import Evt from "./Evt.js";
import GLOBAL_EVENT_HANDLERS from "./GlobalEvtHandlers.js";
import Team from "./Team.js";
import Util from "./util.js";

class Battle {
	id = 'Battle-0' as Battle.ID;
	teams!: [Team, Team];
	turn = 1;


	private battlerIDGen = Util.createIDGen();
	generateBattlerID() { return `B-${this.battlerIDGen.next().value}` as Battler.ID }

	private effectStates: { [EffectID: Effect.ID]: { [AffectableID: Effect.Affectable["id"]]: Record<string, any> } } = {}

	/** Gets the state tied to each Battler-Effect pair
	 */

	getEffectState(target: Effect.Affectable | Effect.Affectable["id"], effect: Effect | Effect.ID) {

		if (typeof target !== "string") target = target.id;
		if (typeof effect !== 'string') effect = effect.id;


		this.effectStates[effect] ??= {};
		this.effectStates[effect]![target] ??= {}

		return this.effectStates[effect]![target]!;
	}


	constructor() {
		this.initTeams()
	}

	private initTeams() {
		const team0 = new Team(this, 'T-0' as Team.ID);
		const team1 = new Team(this, 'T-1' as Team.ID);

		this.teams = [team0, team1];
	}

	logStatus() {
		for (const team of this.teams) {
			console.log(`// TEAM: ${team.id}`);
			for (const battler of team.battlers) {
				console.log(`${battler.name} [${battler.id}]:`, battler.stats)
			}

			console.log('\n');
		}
	}

	async start() {
		for (const team of this.teams) {
			for (const [i, battler] of team.battlers.entries()) {
				battler.active = i === 0;
			}
		}

		for (const active of this.getAllActive()) {
			await this.runEvt('SwitchIn', {}, active);
		}
	}

	getAllBattlers() {
		return this.teams.flatMap(team => team.battlers);
	}

	getAllActive() {
		return this.teams.flatMap(team => team.getAllActive())
	}


	async showText(...texts: any[]) {
		for (const text of texts) {
			// await Util.delay(500);
			console.log(String(text))
			// await Util.delay(500);
		}
	}

	debug(...texts: any[]) {
		const smartText = (t: any): any => {
			if (typeof t !== 'object') return t;
			if (t === null) return t;
			for (const key of ["displayName", "name", "id"]) {
				if (t[key] !== undefined && t[key] !== null && typeof t[key] !== "object") return t[key];
			}
			if (Array.isArray(t)) return t.map((el) => smartText(el));
			return t;
		}
		console.log("\x1b[34m", ">", ...texts.map(text => smartText(text)), "\x1b[0m");
	}

	getWinner() {
		if (this.teams[0].hasLost()) return this.teams[1];
		if (this.teams[1].hasLost()) return this.teams[0];
		return null;
	}

	async runEvt<N extends Evt.Name>(...args: ConstructorParameters<typeof Evt<N>> | [evt: Evt<N>]) {
		if (args.length === 1) {
			return this.runEvtImpl(args[0]);
		} else return this.runEvtImpl(new Evt<N>(...args));
	}

	private async runEvtImpl<N extends Evt.Name>(evt: Evt<N>) {
		while (this.getRemainingListenersForEvt(evt).length > 0) {
			const listener = this.getRemainingListenersForEvt(evt)[0]!

			evt.handledCallbacks.push(listener.callback)

			if (evt.listenerBlacklists.some(lb => lb.checker(listener) === true))
				continue;

			const result = await listener.callback.call(this, evt, listener);


			if (result === null) return null;
			if (result !== undefined) evt.data = result;
		}

		return evt.data;
	}

	private getRemainingListenersForEvt<N extends Evt.Name>(evt: Evt<N>) {
		const listeners: Evt.Listener<N>[] = [];
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
				if (!Battler.isBattler(targetBattler)) continue;
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
			const callbackName: Evt.CallbackName<N> = `onCause${evt.name}`;
			const callback = evt.cause.handler[callbackName];
			if (callback) {
				const listener: Evt.Listener<N> = {
					evt,
					priority: evt.cause.handler[`${callbackName}Priority`] ?? 0,
					callback: callback as any,
					origin: { cause: evt.cause }
				}
				listeners.push(listener)
			}
		}

		for (const handler of GLOBAL_EVENT_HANDLERS) {
			const callbackName: Evt.CallbackName<N> = `onAny${evt.name}`;
			const callback = handler[callbackName];
			if (callback) {
				const listener: Evt.Listener<N> = {
					evt,
					priority: handler[`${callbackName}Priority`] ?? 0,
					callback: callback as any,
					origin: 'global'
				}
				listeners.push(listener)
			}
		}

		listeners.sort((a, b) => b.priority - a.priority);
		return listeners.filter(listener => !evt.handledCallbacks.includes(listener.callback));
	}

	private getListenersFromBattlerEffects<N extends Evt.Name>(evt: Evt<N>, battler: Battler, targetOrSource: 'Target' | 'Source', relation: 'self' | 'ally' | 'foe') {
		const listeners: Evt.Listener<N>[] = [];
		for (const effect of battler.getWieldedEffects()) {
			const relationStr = ({
				'self': '',
				'ally': 'Ally',
				'foe': 'Foe'
			} as const)[relation]
			const callbackName: Evt.CallbackName<N> = `on${targetOrSource}${relationStr}${evt.name}`;
			const callback = effect.handler[`${callbackName}`];
			if (!callback) continue;

			let origin: Evt.Listener<N>["origin"];

			if (targetOrSource === 'Target') {
				origin = { target: battler, relation, wieldedEffect: effect }
			} else {
				origin = { source: battler, relation, wieldedEffect: effect }
			}

			const listener: Evt.Listener<N> = {
				evt,
				priority: effect.handler[`${callbackName}Priority`] ?? 0,
				callback: callback as any,
				origin
			}
			listeners.push(listener);
		}
		return listeners;
	}

	async endTurn() {
		console.log("---")
		for (const battler of this.getAllActive()) {
			await this.runEvt(new Evt('Residual', {}, battler));
		}
		this.turn++;
	}

	async chance(odds: [numerator: number, denominator: number], forEvt: Evt<any>) {
		return !!(await this.runEvt('Chance', { odds, forEvt }, forEvt.target, forEvt.source, forEvt.cause))?.result
	}
}

namespace Battle {
	export type ID = `Battle-${number}` & { _brand: 'Battle.ID' };
}

export default Battle;
