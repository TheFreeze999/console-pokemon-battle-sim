class Condition {
    name;
    displayName;
    handler = [];
    isStatus = false;
    constructor(name, displayName, data = {}) {
        this.name = name;
        this.displayName = displayName;
        Object.assign(this, data);
    }
}
export default Condition;
