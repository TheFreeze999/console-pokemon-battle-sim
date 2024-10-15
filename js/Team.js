class Team {
    battle;
    id;
    battlers = [];
    constructor(battle, id) {
        this.battle = battle;
        this.id = id;
    }
    addBattlers(...battlers) {
        for (const battler of battlers) {
            battler.team = this;
            if (this.battlers.includes(battler))
                continue;
            battler.id = this.battle.generateBattlerID();
            this.battlers.push(battler);
        }
    }
    getActiveBattler() {
        return this.getAllActive()[0];
    }
    getAllActive() {
        return this.battlers.filter(b => b.active);
    }
    getOpposingTeam() {
        return this.battle.teams.find(t => t !== this);
    }
    allFainted() {
        return this.battlers.every(b => b.fainted);
    }
}
export default Team;
