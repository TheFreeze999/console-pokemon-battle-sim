import event from "./Event.js";

type Effect = {
	name: string;
	displayName: string;
}

namespace Effect {
	export type EventHandlingEffect = Effect & {
		handler: event.Handler;
	}
}



export default Effect;