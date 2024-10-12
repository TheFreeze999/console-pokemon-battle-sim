import Battle from "./Battle.js";
import Battler from "./Battler.js";
import Condition from "./Condition.js";
import Effect from "./Effect.js";
import GLOBAL_EVENT_HANDLER from "./GlobalEventHandler.js";
import Move from "./Move.js";
import Stats from "./Stats.js";
import Team from "./Team.js";
import Types from "./Types.js";
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
		Faint: {};
		Residual: {};
		RemoveItem: { reasonText?: string };
		ApplyMoveSecondary: { allFailed: boolean };
		DamagingHit: DataTypes["Damage"];
		GetDamageMultiplier: { multiplier: number };
		GetTypeEffectiveness: { effectiveness: number, matchupTable: Types.MatchupTable };
		CheckImmunity: { immune: boolean };
		MoveSuccess: DataTypes["Move"];
		StatBoost: { boosts: Partial<Stats.Boostable> };
		ApplyCondition: { condition: Condition, message?: string };
		RemoveCondition: { condition: Condition, message?: string };
	}
	export type Name = keyof DataTypes;
	export type Data = DataTypes[Name]

	export type TargetTypes = {
		Damage: Battler;
		Heal: Battler;
		Move: Battler[] | Battle;
		Faint: Battler;
		Residual: Battler;
		RemoveItem: Battler;
		ApplyMoveSecondary: Battler;
		DamagingHit: Battler;
		GetDamageMultiplier: Battler;
		GetTypeEffectiveness: Battler;
		CheckImmunity: Battler;
		StatBoost: Battler;
		ApplyCondition: Battler;
		RemoveCondition: Battler;
	}

	export type TargetType<N extends Name> = N extends keyof TargetTypes ? TargetTypes[N] : (Battler[] | Battler | Battle);


	export type ListenerFunction<K extends Name = Name> = (this: Battle, data: event.DataTypes[K], target: TargetType<K>, wielder: Battler | null, source: Battler | null, cause: Effect | null) => Promise<event.DataTypes[K] | null | void>;


	type TargetRelation = (`${'Target' | 'Source'}${'' | 'Ally' | 'Foe'}`) | 'Cause'
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
