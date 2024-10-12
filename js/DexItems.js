import DexConditions from "./DexConditions.js";
import Item from "./Item.js";
const DexItems = {
    leftovers: new Item('leftovers', 'Leftovers', {
        handler: []
    }),
    toxic_orb: new Item('toxic_orb', 'Toxic Orb', {
        handler: [{
                async onTargetResidual(data, target) {
                    if (target.hasStatusCondition())
                        return;
                    await this.runEvent('ApplyCondition', { condition: DexConditions.toxic, message: `${target.name} was badly poisoned by its Toxic Orb.` }, target, target, DexItems.toxic_orb);
                }
            }]
    }),
    flame_orb: new Item('flame_orb', 'Flame Orb', {
        handler: [{
                async onTargetResidual(data, target) {
                    if (target.hasStatusCondition())
                        return;
                    await this.runEvent('ApplyCondition', { condition: DexConditions.burn, message: `${target.name} was burned by its Flame Orb.` }, target, target, DexItems.flame_orb);
                }
            }]
    })
};
export default DexItems;
