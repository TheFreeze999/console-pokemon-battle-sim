import Effect from "./Effect.js";
import event from "./Event.js";

class Item implements Effect {
	handler: event.Handler = [];
	id: Effect.ID;
	constructor(id: string, public displayName: string, data: Partial<Item.Data> = {}) {
		this.id = id as Effect.ID;
		Object.assign(this, data);
	}
}

namespace Item {
	export type Data = Pick<Item, "handler">;
}


export default Item;