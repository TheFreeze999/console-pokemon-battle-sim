import Effect from "./Effect.js";
import Evt from "./Evt.js";

class Ability implements Effect {
	id: Effect.ID;
	handler: Evt.Handler = {};
	constructor(id: string, public displayName: string, data: Partial<Ability.Data> = {}) {
		this.id = id as Effect.ID;
		Object.assign(this, data);
	}
}

namespace Ability {
	export type Data = Pick<Ability, "handler">;
}


export default Ability;