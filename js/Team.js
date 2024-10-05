class Team {
    battle;
    name;
    battlers = [];
    constructor(battle, name) {
        this.battle = battle;
        this.name = name;
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
    hasLost() {
        return this.battlers.every(b => b.fainted);
    }
}
export default Team;
