import Battle from "./Battle.js";
import Battler from "./Battler.js";
import event from "./Event.js";
import Team from "./Team.js";

type Effect = {
	id: Effect.ID;
	displayName: string;
	handler: event.Handler;
}

namespace Effect {
	export type ID = string & { _brand: 'Effect.ID' };
	export type Affectable = Battler | Team | Battle;
}



export default Effect;