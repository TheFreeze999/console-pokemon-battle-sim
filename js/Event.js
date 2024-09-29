import GLOBAL_EVENT_HANDLER from "./GlobalEventHandler.js";
var event;
(function (event) {
    event.globalHandler = GLOBAL_EVENT_HANDLER;
})(event || (event = {}));
export default event;
