import Move from "./Move.js";
const DexMoves = {
    tackle: new Move('tackle', 'Tackle', {
        handler: {
            onCauseDamagePriority: 205,
            async onCauseDamage(evt) {
                evt.listenerBlacklists.push({
                    key: 'tackle',
                    checker(listener) {
                        if (typeof listener.origin === 'string')
                            return false;
                        if ('wieldedEffect' in listener.origin) {
                            return listener.origin.wieldedEffect === evt.target.getAbility() && listener.origin.relation === 'self' && ('target' in listener.origin);
                        }
                        return false;
                    },
                });
            }
        }
    }),
};
export default DexMoves;
