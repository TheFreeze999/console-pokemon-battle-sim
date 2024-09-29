namespace Util {
	export namespace Random {
		export function float(min: number, max: number): number {
			return Math.random() * (max - min) + min;
		}

		export function int(min: number, max: number): number {
			return Math.floor(Math.random() * (max - min + 1) + min);
		}

		export function arrayEl<T>(array: T[]): T {
			return array[int(0, array.length - 1)]!
		}
	}

	export function stringify<T extends Record<keyof any, any>>(obj: T): string {
		const keys = Object.keys(obj) as (keyof T)[];
		return `{ ${keys.map(key => `${String(key)}: ${obj[key]}`).join(", ")} }`;
	}

	export async function delay(ms: number): Promise<void> {
		return new Promise((resolve, reject) => {
			setTimeout(() => resolve(), ms)
		})
	}

	export function clone<T>(original: T) {
		const cloned = { ...original } as T;
		Object.setPrototypeOf(cloned, Object.getPrototypeOf(original));
		return cloned;
	}

	export type Prettify<T> = {
		[K in keyof T]: T[K] extends object ? Prettify<T[K]> : T[K];
	} & unknown;
}

export default Util;
