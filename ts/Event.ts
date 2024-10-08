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
			typeEffectivenessText?: string;
			recoil?: { isRecoil: boolean, showText: boolean }
		}
		Heal: {
			amount: number;
		}
		Move: {
			move: Move;
			failed?: boolean;
			skipDamage?: boolean;
			skipSecondaryEffects?: boolean;
			flags?: Record<string, boolean>;
		}
		Faint: null;
		Residual: null;
		RemoveItem: { reasonText?: string };
		ApplyMoveSecondary: { hitBattlers: Battler[] };
		GetDamageMultiplier: number;
	}
	export type Name = keyof DataTypes;

	export type TargetTypes = {
		Damage: Battler;
		Heal: Battler;
		Move: Battler[] | Battle;
		Faint: Battler;
		Residual: Battler;
		RemoveItem: Battler;
		ApplyMoveSecondary: TargetTypes["Move"];
		GetDamageMultiplier: Battler;
	}

	export type TargetType<N extends Name> = N extends keyof TargetTypes ? TargetTypes[N] : (Battler[] | Battler | Battle);


	export type ListenerFunction<K extends Name = Name> = (this: Battle, data: event.DataTypes[K], target: TargetType<K>, wielder: Battler, sourceBattler: Battler | null, sourceEffect: Effect | null) => Promise<event.DataTypes[K] | null | void>;


	type TargetRelation = (`${'' | 'Source'}${'' | 'Ally' | 'Foe'}` | 'Any') | 'SourceEffect'
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
