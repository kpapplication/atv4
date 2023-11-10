var AfterLoad = (function() {
    const KEY = "runAfterLoad";
    var _options;

    return {
        get() {
            var runOptions = localStorage.getItem(KEY);
            if (runOptions) {
                runAfterLoad = JSON.parse(runOptions);
                AfterLoad.remove();
            }
        },
        set(options) {
            _options = options
        },
        save() {
            if (_options) {
                localStorage.setItem(KEY, JSON.stringify(_options));
            }
        },
        clear() {
            _options = undefined;
        },
        remove() {
            localStorage.removeItem(KEY);
        }
    }
}());