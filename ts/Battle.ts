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

	readonly evtAncestry: Evt<any>[] = [];
	get currentEvent() { return this.evtAncestry[0] ?? null };
	get parentEvent() { return this.evtAncestry[1] ?? null };


	private battlerIDGen = Util.createIDGen();
	generateBattlerID() { return `B-${this.battlerIDGen.next().value}` as Battler.ID }

	private effectStates: { [EffectID: Effect.ID]: { [AffectableID: Effect.Affectable["id"]]: Record<string, any> } } = {}

	winner: Team | null = null;
	get ended() { return this.winner !== null }

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
		console.log("***")
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

		console.log("===\n")
	}

	getAllBattlers() {
		return this.teams.flatMap(team => team.battlers);
	}

	/** Sorts all active battlers in speed order, fastest first. */
	getAllActiveInSpeedOrder() {
		return this.teams.flatMap(team => team.getAllActive()).sort((a, b) => b.getEffectiveStats().spe - a.getEffectiveStats().spe)
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

	async runEvt<N extends Evt.Name>(...args: ConstructorParameters<typeof Evt<N>> | [evt: Evt<N>]) {
		if (args.length === 1) {
			return this.runEvtImpl(args[0]);
		} else return this.runEvtImpl(new Evt<N>(...args));
	}

	private async runEvtImpl<N extends Evt.Name>(evt: Evt<N>) {
		if (this.ended) return null;

		this.evtAncestry.unshift(evt);

		if (this.parentEvent)
			for (const lb of this.parentEvent.listenerBlacklists)
				evt.listenerBlacklists.add(lb);

		let lastPriority: number | null = null;

		while (this.getRemainingListenersForEvt(evt, lastPriority).length > 0) {

			const listener = this.getRemainingListenersForEvt(evt, lastPriority)[0] as Evt.Listener<N>;

			lastPriority = listener.priority;
			evt.handledCallbacks.add(listener.callback);

			if ([...evt.listenerBlacklists].some(lb => lb.checker(listener) === true))
				continue;

			const result = await listener.callback.call(this, evt, listener);


			if (result === null) {
				this.evtAncestry.shift();
				return null;
			}
			if (result !== undefined) evt.data = result;
		}

		this.evtAncestry.shift();

		return evt.data;
	}

	private getRemainingListenersForEvt<N extends Evt.Name>(evt: Evt<N>, lastPriority: number | null) {
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
		return listeners.filter(listener => !evt.handledCallbacks.has(listener.callback)).filter(listener => lastPriority === null || listener.priority <= lastPriority);
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

	async startTurn() {
		console.log(`[[Turn #${this.turn}]]\n`)
	}

	async endTurn() {
		console.log("\n---")
		for (const battler of this.getAllActiveInSpeedOrder()) {
			await this.runEvt(new Evt('Residual', {}, battler));
		}
		this.turn++;
		console.log("---\n")

		if (this.winner) console.log(`Team ${this.winner.id} wins!`)
	}

	async chance(odds: [numerator: number, denominator: number], forEvt: Evt<any>) {
		return !!(await this.runEvt('Chance', { odds, forEvt }, forEvt.target, forEvt.source, forEvt.cause))?.result
	}

	getEventAncestors(evt: Evt<any>) {
		return this.evtAncestry.slice(this.evtAncestry.indexOf(evt) + 1);
	}
}

namespace Battle {
	export type ID = `Battle-${number}` & { _brand: 'Battle.ID' };
}

export default Battle;
