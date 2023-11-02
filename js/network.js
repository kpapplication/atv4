var Network = (function() {
    var retryRequests = []
    //var retryRequest

    function showError(xhr) {
        var buttons = '<button onselect="Network.retry()"><text>Повторить</text></button>';
        var desc = '';
        console.log(xhr)
        if (xhr.status == 502) { desc = 'Сервис временно не доступен.\n' }
        desc += 'status: ' + xhr.status// + ' ' + xhr.responseText;
        console.log(desc)
        var template = Templates.alert("Ошибка", desc, buttons);
        var doc = Presenter.makeDocument(template, true);
        if (getActiveDocument().error) { Presenter.replaceDocument(doc); } else { Presenter.pushDocument(doc); }
        doc.error = true;
    }

    return {
        loadItemsFrom(options, callback, skipCache = false) {
            var page = options.page || 0
            var key = options.items + options.from + options.id + options.type + 'page' + page
            var result = Cache.get(key);
            if (result != undefined && !skipCache) {
                console.log('Loading "' + key + '" from cache');
                if (callback) { callback(result, options) };
                return;
            }

            _callback = function(xhr) {
                var json = { status: 0 }
                var status = xhr.status;
                if (xhr.status == 0 && JSON.parse(xhr.responseText)) {
                    json = JSON.parse(xhr.responseText);
                } 
                if (status == 401 || json.status == 401) {
                    authErrors.push('Token n status: ' + xhr.status + ' ' + xhr.responseText);
                    Log.sendLog('Token n status: ' + xhr.status + ' ' + xhr.responseText)
                    if (!Auth.check()) { showActivationPage(); }
                } else if (status == 200) {
                    var result = xhr.responseText ? JSON.parse(xhr.responseText) : xhr;
                    Cache.set(key, result, 60);
                    if (callback) { callback(result, options) }
                } else {
                    retryRequests.push({'options' : options, 'callback' : callback})
                    Ajax.abortAll();
                    //retryRequest = {'options' : options, 'callback' : callback}
                    showError(xhr)
                    if (callback) { callback(null, null, xhr) }
                }
            }
            API.loadItemsFrom(options, _callback)
        },

        retry() {
            var requests = retryRequests;
            retryRequests = [];
            while(requests.length){
                var request = requests.shift();
                Network.loadItemsFrom(request.options, request.callback);
                Presenter.dismissModal();
            }
            
        },

        log() {
            console.log(retryRequests)
        }
    }
}());