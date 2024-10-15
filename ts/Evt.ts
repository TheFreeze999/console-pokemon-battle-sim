import Battle from "./Battle.js";
import Battler from "./Battler.js";
import Condition from "./Condition.js";
import Effect from "./Effect.js";
import Move from "./Move.js";

class Evt<N extends Evt.Name> {
	listenerBlacklists: Evt.Listener.Blacklist<N>[] = [];
	handledCallbacks: Evt.Callback<N>[] = []

	constructor(public name: N, public data: Evt.DataType<N>, public target: Evt.TargetType<N>, public source: Battler | null = null, public cause: Effect | null = null) {

	}

	hasName<Name extends Evt.Name>(name: Name): this is Evt<Name> {
		return this.name === name as any;
	}
}

namespace Evt {
	type DataTypes = {
		SwitchIn: {};
		Start: {};
		Damage: { amount: number, isDirect?: boolean };
		Heal: { amount: number };
		Move: { move: Move, ignoreAbility?: boolean };
		ApplyMoveDamage: { moveEvt: Evt<"Move"> };
		Hit: { moveEvt: Evt<"Move"> };
		ApplyMoveSecondary: { moveEvt: Evt<"Move"> };
		Residual: {};
		ApplyCondition: { condition: Condition };
		GetImmunity: { isImmune: boolean };
	}
	export type Name = keyof DataTypes;

	export type DataType<N extends Name = Name> = DataTypes[N];

	type TargetTypes = {
		SwitchIn: Battler;
		Start: Battler;
		Damage: Battler;
		Heal: Battler;
		Move: Battler[];
		ApplyMoveDamage: Battler;
		Hit: Battler;
		ApplyMoveSecondary: Battler;
		Residual: Battler;
		ApplyCondition: Battler;
		GetImmunity: Battler;
	};
	type DefaultTargetType = Battler[] | Battler | Battle;
	export type TargetType<N extends Name = Name> = N extends keyof TargetTypes ? TargetTypes[N] : DefaultTargetType;

	export type ExtractName<E extends Evt<Name>> = E extends Evt<infer N> ? N : never;

	export type CallbackName<N extends Evt.Name> = `onAny${N}` | `onCause${N}` | `on${'Target' | 'Source'}${'' | 'Ally' | 'Foe'}${N}`
	export type Callback<N extends Evt.Name> = (this: Battle, evt: Evt<N>, listener: Listener<N>) => Promise<Evt.DataType<N> | null | void>

	export type Listener<N extends Evt.Name> = {
		evt: Evt<N>;
		priority: number;
		callback: Callback<N>;
		origin: ({ target: Battler } | { source: Battler }) & { relation: 'self' | 'ally' | 'foe', wieldedEffect: Effect }
		| { cause: Effect } | 'global';
	}


	export type Handler = {
		[K in Name as CallbackName<K>]?: Callback<K>;
	} & {
		[K in `${CallbackName<Name>}Priority`]?: number;
	}
}

namespace Evt.Listener {
	export function getCallbackName<N extends Evt.Name>(listener: Evt.Listener<N>): Evt.CallbackName<N> {
		if (listener.origin === 'global') {
			return `onAny${listener.evt.name}`
		} else if ('cause' in listener.origin) {
			return `onCause${listener.evt.name}`
		} else {
			let str = 'on'
			if ('target' in listener.origin) str += 'Target';
			else str += 'Source';

			if (listener.origin.relation === 'ally') str += 'Ally';
			if (listener.origin.relation === 'foe') str += 'Foe';

			str += listener.evt.name;
			return str as Evt.CallbackName<N>;
		}
	}

	export type Blacklist<N extends Evt.Name> = {
		key: keyof any,
		/** If checker returns true, the listener gets blacklisted */
		checker(listener: Evt.Listener<N>): boolean
	};
}



export default Evt;