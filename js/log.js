var Log = (function() {
    //var logs = []

    function time() {
        var date = new Date();
        return date.toString();
    }

    function tokensJson() {
        var _accessToken = AppStorage.getItem(KEYS.accessToken),
			_refreshToken = AppStorage.getItem(KEYS.refreshToken),
            expires = AppStorage.getItem(KEYS.tokenExpires)
        return {'access_token': _accessToken, 'refresh_token': _refreshToken, 'expires_in': expires, 'version': Device.appIdentifier + Device.appVersion}
    }

    return {
        // add(text) {
        //     var log = {'time': time(), 'text': text, 'json': tokensJson()}
        //     logs.push(log)
        // },

        sendLog(text, json) {
            json = json || tokensJson();
            var params = {'device_id': Device.vendorIdentifier, 'message': time() + ' ' + text, 'json': JSON.stringify(json)}
            API.sendLogs(params)
        }
    }
}());