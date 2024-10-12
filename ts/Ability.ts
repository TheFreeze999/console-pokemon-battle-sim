import Effect from "./Effect.js";
import event from "./Event.js";

class Ability implements Effect {
	handler: event.Handler = [];
	id: Effect.ID;
	constructor(id: string, public displayName: string, data: Partial<Ability.Data> = {}) {
		this.id = id as Effect.ID;
		Object.assign(this, data);
	}
}

namespace Ability {
	export type Data = Pick<Ability, "handler">;
}


export default Ability;