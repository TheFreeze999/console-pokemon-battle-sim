class Condition {
    displayName;
    isStatus = false;
    id;
    handlers = [];
    constructor(id, displayName, data = {}) {
        this.displayName = displayName;
        this.id = id;
        Object.assign(this, data);
    }
}
export default Condition;
