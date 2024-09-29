import Item from "./Item.js";

const DexItems = {
	leftovers: new Item('leftovers', 'Leftovers', {
		handler: [{
			onResidualPriority: 100,
			async onResidual(data, target) {
				await this.runEvent('Heal', { amount: target.stats.hp / 16 }, target, target, DexItems.leftovers);
			},
			onHealPriority: 101,
			async onHeal(data, target, wielder, sourceBattler, sourceEffect) {
				if (sourceEffect !== DexItems.leftovers) return;
				await this.showText(`${target.name} recovered some HP using its leftovers.`)
			}
		}]
	})
} as const;

export default DexItems;