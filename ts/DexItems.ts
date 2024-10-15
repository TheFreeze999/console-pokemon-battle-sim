import DexConditions from "./DexConditions.js";
import Item from "./Item.js";

const DexItems = {
	flame_orb: new Item('flame_orb', 'Flame Orb', {
		handler: {
			onTargetResidualPriority: 0,
			async onTargetResidual({ target }) {
				await this.runEvt('ApplyCondition', { condition: DexConditions.brn }, target, target, DexItems.flame_orb)
			},

			onCauseApplyConditionPriority: 101,
			async onCauseApplyCondition({ target }) {
				await this.showText(`{${target.name}'s Flame Orb}`)
			}
		}
	}),
	toxic_orb: new Item('toxic_orb', 'Toxic Orb', {
		handler: {
			onTargetResidualPriority: 0,
			async onTargetResidual({ target }) {
				await this.runEvt('ApplyCondition', { condition: DexConditions.tox }, target, target, DexItems.toxic_orb)
			},

			onCauseApplyConditionPriority: 101,
			async onCauseApplyCondition({ target }) {
				await this.showText(`{${target.name}'s Toxic Orb}`)
			}
		}
	}),
} as const;

export default DexItems;