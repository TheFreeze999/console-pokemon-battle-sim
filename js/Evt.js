class Evt {
    name;
    data;
    target;
    source;
    cause;
    listenerBlacklists = [];
    handledCallbacks = [];
    constructor(name, data, target, source = null, cause = null) {
        this.name = name;
        this.data = data;
        this.target = target;
        this.source = source;
        this.cause = cause;
    }
    hasName(name) {
        return this.name === name;
    }
}
(function (Evt) {
    var Listener;
    (function (Listener) {
        function getCallbackName(listener) {
            if (listener.origin === 'global') {
                return `on${listener.evt.name}`;
            }
            else if ('cause' in listener.origin) {
                return `onCause${listener.evt.name}`;
            }
            else {
                let str = 'on';
                if ('target' in listener.origin)
                    str += 'Target';
                else
                    str += 'Source';
                if (listener.origin.relation === 'ally')
                    str += 'Ally';
                if (listener.origin.relation === 'foe')
                    str += 'Foe';
                str += listener.evt.name;
                return str;
            }
        }
        Listener.getCallbackName = getCallbackName;
    })(Listener = Evt.Listener || (Evt.Listener = {}));
})(Evt || (Evt = {}));
export default Evt;
