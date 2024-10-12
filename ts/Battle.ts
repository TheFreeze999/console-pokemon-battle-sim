import Battler from "./Battler.js";
import DexAbilities from "./DexAbilities.js";
import DexConditions from "./DexConditions.js";
import DexItems from "./DexItems.js";
import Effect from "./Effect.js";
import event from "./Event.js";
import GLOBAL_EVENT_HANDLER from "./GlobalEventHandler.js";
import Move from "./Move.js";
import Stats from "./Stats.js";
import Team from "./Team.js";
import Types from "./Types.js";
import Util from "./util.js";

class Battle {
	id = 'Battle-0' as Battle.ID;
	teams!: [Team, Team];
	turn = 1;


	private battlerIDGen = Util.createIDGen();
	generateBattlerID() { return `B-${this.battlerIDGen.next().value}` as Battler.ID }

	private effectStates: { [EffectID: Effect.ID]: { [AffectableID: Effect.Affectable["id"]]: Record<string, any> } } = {}

	/** Gets the state tied to each Battler-Effect pair
	 * @param target By default, ID of last `runEvent` target that was a battler.
	 * @param effect By default, name of last `cause` that was passed into `runEvent`.
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
		return this.teams.flatMap(team => team.getAllActive())
	}


	async showText(...texts: any[]) {
		for (const text of texts) {
			// await Util.delay(500);
			console.log(String(text))
			// await Util.delay(500);
		}
	}
	async runEvent<T extends event.Name>(eventName: T, data: event.DataTypes[T], target: event.TargetType<T>, source?: Battler | null, cause?: Effect | null): Promise<event.DataTypes[T] | null>;

	async runEvent<T extends event.Name>(eventName: T, data: event.DataTypes[T], target: event.TargetType<T>, source: Battler | null = null, cause: Effect | null = null) {
		let listenerFns: { fn: event.ListenerFunction<T>, priority: number, wielder: Battler | null }[] = [];

		if (Array.isArray(target)) {
			for (const targetBattler of target) {
				listenerFns.push(...this.getBattlerListenerFns(eventName, targetBattler, false));
			}
		} else if (Battler.isBattler(target)) {
			listenerFns.push(...this.getBattlerListenerFns(eventName, target, false));
		} else {/* logic for if target is battle */ }

		if (source) {
			listenerFns.push(...this.getBattlerListenerFns(eventName, source, true))
		}

		if (cause) {
			for (const obj of cause.handler) {
				const fn = obj[`onCause${eventName}`] as event.ListenerFunction<T> | undefined;
				if (!fn) continue;
				const priority = obj[`onCause${eventName}Priority`] ?? 0;
				listenerFns.push({ fn, priority, wielder: null });
			}
		}

		for (const obj of GLOBAL_EVENT_HANDLER) {
			const fn = obj[`on${eventName}`] as event.ListenerFunction<T> | undefined;
			if (!fn) continue;
			const priority = obj[`on${eventName}Priority`] ?? 0;
			listenerFns.push({ fn, priority, wielder: null });
		}

		listenerFns.sort((objA, objB) => objB.priority - objA.priority);

		for (const { fn, wielder } of listenerFns) {
			const result = await fn.call(this, data, target, wielder, source, cause);
			if (result === null) return null;
			if (result !== undefined) data = result;
		}

		return data;
	}

	private getBattlerListenerFns<T extends event.Name>(eventName: T, battler: Battler, isSource: boolean) {
		const sourcePrefix = isSource ? 'Source' : 'Target';
		let listenerFns: { fn: event.ListenerFunction<T>, priority: number, wielder: Battler }[] = [];
		for (const obj of battler.getWieldedEffectsHandlerCombination()) {
			const fn = obj[`on${sourcePrefix}${eventName}`] as event.ListenerFunction<T> | undefined;
			if (!fn) continue;
			const priority = obj[`on${sourcePrefix}${eventName}Priority`] ?? 0;
			listenerFns.push({ fn, priority, wielder: battler });
		}

		for (const ally of battler.getActiveAlliesAndSelf()) {
			for (const obj of ally.getWieldedEffectsHandlerCombination()) {
				const fn = obj[`on${sourcePrefix}Ally${eventName}`] as event.ListenerFunction<T> | undefined;
				if (!fn) continue;
				const priority = obj[`on${sourcePrefix}Ally${eventName}Priority`] ?? 0;
				listenerFns.push({ fn, priority, wielder: ally });
			}
		}
		for (const foe of battler.getActiveFoes()) {
			for (const obj of foe.getWieldedEffectsHandlerCombination()) {
				const fn = obj[`on${sourcePrefix}Foe${eventName}`] as event.ListenerFunction<T> | undefined;
				if (!fn) continue;
				const priority = obj[`on${sourcePrefix}Foe${eventName}Priority`] ?? 0;
				listenerFns.push({ fn, priority, wielder: foe });
			}
		}
		return listenerFns;
	}

	getWinner() {
		if (this.teams[0].hasLost()) return this.teams[1];
		if (this.teams[1].hasLost()) return this.teams[0];
		return null;
	}

	async endTurn() {
		console.log("---")
		for (const battler of this.getAllActive()) {
			await this.runEvent('Residual', {}, battler);
		}
		this.turn++;
	}

	async getDamageMultiplier(defender: Battler, attacker: Battler, move: Move, baseMultiplier = 1) {
		const damageMultiplierResult = await this.runEvent('GetDamageMultiplier', { multiplier: baseMultiplier }, defender, attacker, move);

		return damageMultiplierResult?.multiplier ?? baseMultiplier;
	}

	async getTypeEffectiveness(defender: Battler, attacker: Battler, move: Move, baseEffectiveness = 1, matchupTable = Types.getMatchupTable()) {
		return (await this.runEvent('GetTypeEffectiveness', { effectiveness: baseEffectiveness, matchupTable }, defender, attacker, move))?.effectiveness ?? 1;
	}
}

namespace Battle {
	export type ID = `Battle-${number}` & { _brand: 'Battle.ID' };
}

export default Battle;
