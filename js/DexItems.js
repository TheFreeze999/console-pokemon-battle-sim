import DexConditions from "./DexConditions.js";
import Item from "./Item.js";
const DexItems = {
    flame_orb: new Item('flame_orb', 'Flame Orb', {
        handlers: [{
                onTargetResidualPriority: 0,
                async onTargetResidual({ target }) {
                    await this.runEvt('ApplyCondition', { condition: DexConditions.brn }, target, target, DexItems.flame_orb);
                },
                onCauseApplyConditionPriority: 101,
                async onCauseApplyCondition({ target }) {
                    await this.showText(`{${target.name}'s Flame Orb}`);
                }
            }]
    }),
    toxic_orb: new Item('toxic_orb', 'Toxic Orb', {
        handlers: [{
                onTargetResidualPriority: 0,
                async onTargetResidual({ target }) {
                    await this.runEvt('ApplyCondition', { condition: DexConditions.tox }, target, target, DexItems.toxic_orb);
                },
                onCauseApplyConditionPriority: 101,
                async onCauseApplyCondition({ target }) {
                    await this.showText(`{${target.name}'s Toxic Orb}`);
                }
            }]
    }),
    lum_berry: new Item('lum_berry', 'Lum Berry', {
        isBerry: true,
        handlers: [{
                onTargetApplyConditionPriority: 80,
                async onTargetApplyCondition({ data, target }) {
                    if (!data.condition.isStatus)
                        return;
                    await this.runEvt('RemoveItem', { method: 'consume' }, target, target);
                },
                onAnyRemoveItemPriority: 85,
                async onAnyRemoveItem({ data, target }) {
                    if (data.itemRemoved !== DexItems.lum_berry)
                        return;
                    if (data.method !== 'consume')
                        return;
                    const condition = [...target.conditions].find(c => c.isStatus);
                    if (!condition)
                        return;
                    await this.runEvt('RemoveCondition', { condition }, target, target, DexItems.lum_berry);
                }
            }]
    })
};
export default DexItems;
