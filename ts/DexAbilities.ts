import Ability from "./Ability.js";
import DexConditions from "./DexConditions.js";
import Move from "./Move.js";
import Types from "./Types.js";

const DexAbilities = {
	no_ability: new Ability('no_ability', 'No Ability'),
} as const;

export default DexAbilities;