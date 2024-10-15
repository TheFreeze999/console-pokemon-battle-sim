import Battle from "./Battle.js";
import Battler from "./Battler.js";
import Evt from "./Evt.js";
import Team from "./Team.js";

type Effect = {
	id: Effect.ID;
	displayName: string;
	handlers: Evt.Handler[];
}

namespace Effect {
	export type ID = string & { _brand: 'Effect.ID' };
	export type Affectable = Battler | Team | Battle;
}



export default Effect;