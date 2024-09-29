var Stats;
(function (Stats) {
    let Create;
    (function (Create) {
        function withoutHP() {
            return {
                atk: 0,
                def: 0,
                spA: 0,
                spD: 0,
                spe: 0
            };
        }
        Create.withoutHP = withoutHP;
        function base() {
            return {
                hp: 0,
                atk: 0,
                def: 0,
                spA: 0,
                spD: 0,
                spe: 0
            };
        }
        Create.base = base;
        function boostable() {
            return {
                atk: 0,
                def: 0,
                spA: 0,
                spD: 0,
                spe: 0,
                acc: 0,
                eva: 0
            };
        }
        Create.boostable = boostable;
    })(Create = Stats.Create || (Stats.Create = {}));
})(Stats || (Stats = {}));
export default Stats;
