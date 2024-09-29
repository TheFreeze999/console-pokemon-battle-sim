class Item {
    name;
    displayName;
    handler = [];
    constructor(name, displayName, data = {}) {
        this.name = name;
        this.displayName = displayName;
        Object.assign(this, data);
    }
}
export default Item;
