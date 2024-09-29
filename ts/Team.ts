import Battle from "./Battle.js";
import Battler from "./Battler.js";

class Team {
	battlers: Battler[] = [];

	constructor(public battle: Battle, public name: string) {

	}

	addBattlers(...battlers: Battler[]) {
		for (const battler of battlers) {
			battler.team = this;
			if (this.battlers.includes(battler)) continue;
			this.battlers.push(battler);
		}
	}

	getActiveBattler() {
		return this.getAllActive()[0]!
	}

	getAllActive() {
		return this.battlers.filter(b => b.active)
	}

	getOpposingTeam() {
		return this.battle.teams.find(t => t !== this)!
	}

	hasLost() {
		return this.battlers.every(b => b.fainted);
	}
}

export default Team;