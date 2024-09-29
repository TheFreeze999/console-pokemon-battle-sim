import Effect from "./Effect.js";
import event from "./Event.js";

class Item implements Effect {
	handler: event.Handler = [];
	constructor(public name: string, public displayName: string, data: Partial<Item.Data> = {}) {
		Object.assign(this, data);
	}
}

namespace Item {
	export type Data = Pick<Item, "handler">;
}


export default Item;