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
        },

        sendSentry(text, json) {
            // var sentry_key = '5e467c6ae664f701f456334463aabc1f';
            // var project_id = '4506184643510272';

            // var event_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            // var timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

            // var params = {
            //     "event_id": event_id,
            //     "culprit": "",
            //     "timestamp": timestamp,
            //     "message": text,
            //     "tags": {
            //         "shell": "$SHELL",
            //         "server_name": "hostname",
            //         "path": "pwd"
            //     },
            //     "exception": [{
            //         "type": "ScriptError",
            //         "value": text,
            //         "module": "builtins"
            //     }],
            //     "extra": {
            //         "json": JSON.stringify(json)
            //     }
            // };

            // try {
            //     var xhr = new XMLHttpRequest();
            //     xhr.open("POST", `https://sentry.io/api/${project_id}/store/`, true);
            //     xhr.setRequestHeader("Content-Type", "application/json");
            //     xhr.setRequestHeader("Accept", "application/json");
            //     xhr.setRequestHeader("X-Sentry-Auth", `Sentry sentry_version=7, sentry_key=${sentry_key}, sentry_client=raven-bash/0.1`);
            //     xhr.send(JSON.stringify(params));
            // } catch (e) {
            //     // ignore
            // }
        }
    }
}());
