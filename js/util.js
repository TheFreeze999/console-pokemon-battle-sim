var Util;
(function (Util) {
    let Random;
    (function (Random) {
        function float(min, max) {
            return Math.random() * (max - min) + min;
        }
        Random.float = float;
        function int(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
        Random.int = int;
        function arrayEl(array) {
            return array[int(0, array.length - 1)];
        }
        Random.arrayEl = arrayEl;
    })(Random = Util.Random || (Util.Random = {}));
    function stringify(obj) {
        const keys = Object.keys(obj);
        return `{ ${keys.map(key => `${String(key)}: ${obj[key]}`).join(", ")} }`;
    }
    Util.stringify = stringify;
    async function delay(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), ms);
        });
    }
    Util.delay = delay;
    function clone(original) {
        const cloned = { ...original };
        Object.setPrototypeOf(cloned, Object.getPrototypeOf(original));
        return cloned;
    }
    Util.clone = clone;
    function clamper(min = -Infinity, max = Infinity) {
        return function (x) {
            if (x < min)
                return min;
            if (x > max)
                return max;
            return x;
        };
    }
    Util.clamper = clamper;
    function objectEntries(obj) {
        return Object.keys(obj).map(key => [key, obj[key]]);
    }
    Util.objectEntries = objectEntries;
    function* createIDGen() {
        let i = 0;
        while (true)
            yield i++;
    }
    Util.createIDGen = createIDGen;
})(Util || (Util = {}));
export default Util;
