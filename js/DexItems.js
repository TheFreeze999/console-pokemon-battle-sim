import Item from "./Item.js";
const DexItems = {
    leftovers: new Item('leftovers', 'Leftovers', {
        handler: [{
                onResidualPriority: 100,
                async onResidual(data, target) {
                    await this.runEvent('Heal', { amount: target.stats.hp / 16 }, target, target, DexItems.leftovers);
                },
                onSourceEffectHealPriority: 101,
                async onSourceEffectHeal(data, target, wielder, sourceBattler, sourceEffect) {
                    await this.showText(`${target.name} recovered some HP using its leftovers.`);
                }
            }]
    })
};
export default DexItems;
