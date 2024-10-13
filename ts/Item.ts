import Effect from "./Effect.js";
import Evt from "./Evt.js";

class Item implements Effect {
	id: Effect.ID;
	handler: Evt.Handler = {};
	constructor(id: string, public displayName: string, data: Partial<Item.Data> = {}) {
		this.id = id as Effect.ID;
		Object.assign(this, data);
	}
}

namespace Item {
	export type Data = Pick<Item, "handler">;
}


export default Item;