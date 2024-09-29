import Battle from "./Battle.js";
import Battler from "./Battler.js";
import Effect from "./Effect.js";
import GLOBAL_EVENT_HANDLER from "./GlobalEventHandler.js";
import Move from "./Move.js";
import Util from "./util.js";

namespace event {
	export type DataTypes = {
		Damage: {
			amount: number;
			isDirect?: boolean;
			flags?: Record<string, boolean>;
		}
		Heal: {
			amount: number;
		}
		Move: {
			move: Move;
		}
		Faint: null;
		Residual: null;
		RemoveItem: { reasonText?: string };
	}
	export type Name = keyof DataTypes;

	export type TargetTypes = {
		Damage: Battler;
		Heal: Battler;
		Move: Battler[] | Battle;
		Faint: Battler;
		Residual: Battler;
		RemoveItem: Battler;
	}

	export type TargetType<N extends Name> = N extends keyof TargetTypes ? TargetTypes[N] : (Battler[] | Battler | Battle);


	export type ListenerFunction<K extends Name = Name> = (this: Battle, data: event.DataTypes[K], target: TargetType<K>, wielder: Battler, sourceBattler: Battler | null, sourceEffect: Effect | null) => Promise<event.DataTypes[K] | null | void>;


	type TargetRelation = `${'' | 'Source'}${'' | 'Ally' | 'Foe'}` | 'Any'
	export type HandlerMethods = ({
		[K in Name as `on${K}`]?: ListenerFunction<K>;
	} & {
		[K in Name as `on${TargetRelation}${K}`]?: ListenerFunction<K>;
	})

	export type Handler = (HandlerMethods & {
		[K in keyof HandlerMethods as `${K}Priority`]?: number;
	})[];

	export type MethodName = keyof HandlerMethods;

	export const globalHandler = GLOBAL_EVENT_HANDLER;
}



export default event;
