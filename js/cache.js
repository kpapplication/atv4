var Cache = {
    _items: {},
    get: function(key) {
        if (this._items[key] && this._items[key].expire > new Date()) {
            return this._items[key].value;
        }
        this.remove(key);
        return undefined;
    },
    set: function(key, value, expire) {
        this._items[key] = {
            value: value,
            expire: new Date(new Date().getTime() + (parseInt(expire) * 1000)),
        };
    },
    remove: function(key) {
        this._items[key] = undefined;
        delete this._items[key];
    },
    scan: function() {
        for (var i in this._items) {
            var item = this._items[i];
            if (new Date() > item.expire) {
                this.remove(i);
            }
        }
    }
};