import Ability from "./Ability.js";
const DexAbilities = {
    no_ability: new Ability('no_ability', 'No Ability'),
    magic_guard: new Ability('magic_guard', 'Magic Guard', {
        handler: {
            onTargetDamagePriority: 200,
            async onTargetDamage({ data }) {
                console.log("== magic guard proc");
                if (data.isDirect !== true)
                    return null;
            }
        }
    }),
};
export default DexAbilities;
