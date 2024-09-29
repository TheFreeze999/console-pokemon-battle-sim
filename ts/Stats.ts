namespace Stats {
	export type WithoutHP = {
		atk: number,
		def: number,
		spA: number,
		spD: number,
		spe: number
	}

	export type Base = Stats.WithoutHP & {
		hp: number
	}

	export type Boostable = Stats.WithoutHP & {
		acc: number,
		eva: number
	}

	export type Any = Stats.Base | Stats.Boostable | Stats.WithoutHP;

	export namespace Create {
		export function withoutHP(): Stats.WithoutHP {
			return {
				atk: 0,
				def: 0,
				spA: 0,
				spD: 0,
				spe: 0
			}
		}

		export function base(): Stats.Base {
			return {
				hp: 0,
				atk: 0,
				def: 0,
				spA: 0,
				spD: 0,
				spe: 0
			}
		}

		export function boostable(): Stats.Boostable {
			return {
				atk: 0,
				def: 0,
				spA: 0,
				spD: 0,
				spe: 0,
				acc: 0,
				eva: 0
			}
		}
	}
}

export default Stats;
