import Effect from "./Effect.js";
import event from "./Event.js";

class Ability implements Effect.EventHandlingEffect {
	handler: event.Handler = [];
	constructor(public name: string, public displayName: string, data: Partial<Ability.Data> = {}) {
		Object.assign(this, data);
	}
}

namespace Ability {
	export type Data = Pick<Ability, "handler">;
}


export default Ability;