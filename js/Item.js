class Item {
    displayName;
    id;
    handlers = [];
    isBerry = false;
    constructor(id, displayName, data = {}) {
        this.displayName = displayName;
        this.id = id;
        Object.assign(this, data);
    }
}
export default Item;
