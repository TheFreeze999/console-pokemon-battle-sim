class Ability {
    displayName;
    id;
    ignorable = true;
    handlers = [];
    constructor(id, displayName, data = {}) {
        this.displayName = displayName;
        this.id = id;
        Object.assign(this, data);
    }
}
export default Ability;
