class Condition {
    displayName;
    isStatus = false;
    id;
    handler = {};
    constructor(id, displayName, data = {}) {
        this.displayName = displayName;
        this.id = id;
        Object.assign(this, data);
    }
}
export default Condition;
