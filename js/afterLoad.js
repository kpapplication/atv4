var AfterLoad = (function() {
    const KEY = "runAfterLoad";
    var _options;

    return {
        get() {
            var runOptions = AppStorage.getItem(KEY);
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
                AppStorage.setItem(KEY, JSON.stringify(_options));
            }
        },
        clear() {
            _options = undefined;
        },
        remove() {
            AppStorage.removeItem(KEY);
        }
    }
}());