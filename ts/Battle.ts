import Battler from "./Battler.js";
import Effect from "./Effect.js";
import event from "./Event.js";
import Move from "./Move.js";
import Stats from "./Stats.js";
import Team from "./Team.js";
import Util from "./util.js";

const WIELDER = Symbol('WIELDER');
const PRIORITY = Symbol('WIELDER');

class Battle {
	teams!: [Team, Team];
	turn = 1;

	constructor() {
		this.initTeams()
	}

	private initTeams() {
		const team0 = new Team(this, 'team0');
		const team1 = new Team(this, 'team1');

		this.teams = [team0, team1];
	}

	logStatus() {
		for (const team of this.teams) {
			console.log(`// TEAM: ${team.name}`);
			for (const battler of team.battlers) {
				console.log(`${battler.name}: ${Util.stringify(battler.stats)}`)
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

	getAllActive() {
		return this.teams.flatMap(team => team.getAllActive())
	}


	async showText(...texts: any[]) {
		for (const text of texts) {
			await Util.delay(500);
			console.log(String(text))
			await Util.delay(500);
		}
	}

	async runEvent<T extends event.Name>(name: T, data: event.DataTypes[T], target: Battler[] | Battler | Battle | null = null, sourceBattler: Battler | null = null, sourceEffect: Effect | null = null) {
		target ??= this;
		let listenerFunctions: event.ListenerFunction[] = [];

		if (sourceBattler !== null) {
			listenerFunctions.push(...this.getBattlerListenerFunctions(`onSource${name}`, sourceBattler));

			for (const activeAllyOrSelf of sourceBattler.getActiveAlliesAndSelf()) {
				listenerFunctions.push(...this.getBattlerListenerFunctions(`onSourceAlly${name}`, activeAllyOrSelf));
			}

			for (const activeFoe of sourceBattler.getActiveFoes()) {
				listenerFunctions.push(...this.getBattlerListenerFunctions(`onSourceFoe${name}`, activeFoe));
			}
		}

		for (const targetBattler of (Array.isArray(target) ? target : [target])) {
			if (Battler.isBattler(targetBattler)) {
				listenerFunctions.push(...this.getBattlerListenerFunctions(`on${name}`, targetBattler));

				for (const activeAllyOrSelf of targetBattler.getActiveAlliesAndSelf()) {
					listenerFunctions.push(...this.getBattlerListenerFunctions(`onAlly${name}`, activeAllyOrSelf));
				}

				for (const activeFoe of targetBattler.getActiveFoes()) {
					listenerFunctions.push(...this.getBattlerListenerFunctions(`onFoe${name}`, activeFoe));
				}
			}
		}

		if (target === this) {
			listenerFunctions.push(...this.getBattleListenerFunctions(`on${name}`));
		}

		for (const activeBattler of this.getAllActive()) {
			listenerFunctions.push(...this.getBattlerListenerFunctions(`onAny${name}`, activeBattler));
		}

		listenerFunctions = listenerFunctions.sort((a, b) => {
			// @ts-expect-error
			return (b[PRIORITY] ?? 0) - (a[PRIORITY] ?? 0)
		})

		let nullResultOccured = false;
		for (const listenerFunction of listenerFunctions) {
			// @ts-expect-error
			const wielder = listenerFunction[WIELDER] as Battler;

			const result = await listenerFunction.call(this, data, target, wielder, sourceBattler, sourceEffect) as typeof data | null | undefined;

			if (result === null) {
				nullResultOccured = true;
				break;
			}

			if (result !== undefined) {
				data = result;
			}
		}

		for (const listenerFunction of listenerFunctions) {
			// @ts-expect-error
			delete listenerFunction[WIELDER];
		}

		return nullResultOccured ? null : data;
	}


	private getBattlerListenerFunctions<T extends event.MethodName>(methodName: T, battler: Battler) {
		let combinedHandler = [
			...event.globalHandler,
			...battler.ability.handler,
			...(battler.heldItem?.handler ?? [])
		];

		combinedHandler = combinedHandler.sort((a, b) => (b[`${methodName}Priority`] ?? 0) - (a[`${methodName}Priority`] ?? 0));

		const listeners = combinedHandler.map(handler => {
			if (handler[methodName]) {
				// @ts-expect-error
				handler[methodName][PRIORITY] = handler[`${methodName}Priority`] ?? 0;
			}
			return handler[methodName]
		}).filter(l => l != undefined) as event.ListenerFunction[];

		for (const listener of listeners) {
			// @ts-expect-error
			listener[WIELDER] = battler;
		}

		return listeners;
	}

	private getBattleListenerFunctions<T extends event.MethodName>(methodName: T) {
		let combinedHandler = [
			...event.globalHandler,
		];

		combinedHandler = combinedHandler.sort((a, b) => (b[`${methodName}Priority`] ?? 0) - (a[`${methodName}Priority`] ?? 0));

		const listeners = combinedHandler.map(handler => {
			if (handler[methodName]) {
				// @ts-expect-error
				handler[methodName][PRIORITY] = handler[`${methodName}Priority`] ?? 0;
			}
			return handler[methodName]
		}).filter(l => l != undefined) as event.ListenerFunction[];

		return listeners;
	}

	getWinner() {
		if (this.teams[0].hasLost()) return this.teams[1];
		if (this.teams[1].hasLost()) return this.teams[0];
		return null;
	}

	async endTurn() {
		for (const battler of this.getAllActive()) {
			await this.runEvent('Residual', null, battler);
		}
		this.turn++;
	}
}

export default Battle;
