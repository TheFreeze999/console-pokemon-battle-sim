class Condition {
    displayName;
    handler = [];
    isStatus = false;
    id;
    constructor(id, displayName, data = {}) {
        this.displayName = displayName;
        this.id = id;
        Object.assign(this, data);
    }
}
export default Condition;
