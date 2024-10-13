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
    async endTurn() {
        console.log("---");
        for (const battler of this.getAllActive()) {
            // await this.runEvent('Residual', {}, battler);
        }
        this.turn++;
    }
}
export default Battle;
