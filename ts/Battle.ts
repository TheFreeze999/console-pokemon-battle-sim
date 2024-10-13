import Battler from "./Battler.js";
import DexAbilities from "./DexAbilities.js";
import DexConditions from "./DexConditions.js";
import DexItems from "./DexItems.js";
import Effect from "./Effect.js";
import event from "./Event.js";
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






	getWinner() {
		if (this.teams[0].hasLost()) return this.teams[1];
		if (this.teams[1].hasLost()) return this.teams[0];
		return null;
	}

	async endTurn() {
		console.log("---")
		for (const battler of this.getAllActive()) {
			// await this.runEvent('Residual', {}, battler);
		}
		this.turn++;
	}
}

namespace Battle {
	export type ID = `Battle-${number}` & { _brand: 'Battle.ID' };
}

export default Battle;
