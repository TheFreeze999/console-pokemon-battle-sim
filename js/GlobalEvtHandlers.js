const EXECUTION = {
    onDamagePriority: 100,
    async onDamage({ target, data }) {
        await this.showText(`${target.name} was hit with ${data.amount} damage.`);
    }
};
const GLOBAL_EVENT_HANDLERS = [EXECUTION];
export default GLOBAL_EVENT_HANDLERS;
