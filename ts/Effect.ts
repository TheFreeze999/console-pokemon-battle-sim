import event from "./Event.js";

type Effect = {
	name: string;
	displayName: string;
	handler: event.Handler;
}



export default Effect;