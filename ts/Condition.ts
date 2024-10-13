import Effect from "./Effect.js";
import Evt from "./Evt.js";

class Condition implements Effect {
	isStatus = false;
	id: Effect.ID;
	handler: Evt.Handler = {};
	constructor(id: string, public displayName: string, data: Partial<Condition.Data> = {}) {
		this.id = id as Effect.ID;
		Object.assign(this, data);
	}
}

namespace Condition {
	export type Data = Pick<Condition, "isStatus" | "handler">;
}


export default Condition;