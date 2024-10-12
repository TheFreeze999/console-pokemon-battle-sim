import Effect from "./Effect.js";
import event from "./Event.js";

class Condition implements Effect {
	handler: event.Handler = [];
	isStatus = false;
	id: Effect.ID;
	constructor(id: string, public displayName: string, data: Partial<Condition.Data> = {}) {
		this.id = id as Effect.ID;
		Object.assign(this, data);
	}
}

namespace Condition {
	export type Data = Pick<Condition, "handler" | "isStatus">;
}


export default Condition;