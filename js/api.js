var API = (function () {
    let _url = KINOPUB.apiBase
    let _authUrl = KINOPUB.apiAuth
    let _extUrl = KINOPUB.apiBaseExt2
    const _clientID = KINOPUB.clientID
    const _clientSecret = KINOPUB.clientSecret
    const _traktUrl = trakt.API
    const _traktClientID = trakt.clientID
    const _traktClientSecret = trakt.clientSecret
    const _headers = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}

    return {
        setToken(token) { _token = token; },

        // MARK: - TOKEN
        getDeviceCode(callback) {
            var params = {
                'client_id': _clientID,
                'client_secret': _clientSecret,
                'grant_type': 'device_code',
                'rand': Utils.getRandom(),
            };
            return Ajax.post(_authUrl + "device", _headers, params, callback);
        },

        getDeviceToken(code, callback) {
            var params = {
                'client_id': _clientID,
                'client_secret': _clientSecret,
                'code': code,
                'grant_type': 'device_token',
                'rand': Utils.getRandom(),
            };
            return Ajax.post(_authUrl + "device", _headers, params, callback);
        },

        getRefreshToken(refreshToken) {
            var params = {
                'client_id': _clientID,
                'client_secret': _clientSecret,
                'grant_type': 'refresh_token',
                'refresh_token': refreshToken,
                'rand': Utils.getRandom(),
            };
            return Ajax.post(_authUrl + "device", _headers, params, null, false);
        },

        checkAuth() {
            var params = {
                'rand': Utils.getRandom(),
            };
            return Ajax.aget(_url + 'types', _headers, params, null, _token, false);
        },

        // MARK: - DEVICE
        deviceNotify() {
            var deviceName = (AppStorage.getItem(KEYS.deviceName)) ? 'KinopubApp (' + AppStorage.getItem(KEYS.deviceName) + ')' : 'KinopubApp';
            var deviceInfo = {
                title: deviceName,
                software: `AppleTV (${Utils.appName()})`, //${Device.model} 
                hardware: `${Device.productType} (${Device.systemVersion})`,
                'rand': Utils.getRandom(),
            };
            Ajax.apost(_url + "device/notify", _headers, deviceInfo, null, _token);
        },

        getLocalFile(file, callback) {
            Ajax.get(baseURL + file, null, null, callback);
        },

        getUserInfo(callback) {
            _callback = function(xhr) {
                var result = JSON.parse(xhr.responseText);
                callback(result)
            }
            Ajax.aget(_url + 'user', _headers, null, _callback, _token);
        },

        getDeviceInfo(callback) {
            _callback = function(xhr) {
                var result = JSON.parse(xhr.responseText);
                callback(result)
            }
            Ajax.aget(_url + 'device/info', _headers, null, _callback, _token);
        },

        // MARK: - ITEMS
        loadItemsFrom(options, callback) {
            var page = options.page || 0
            var params = {
                'page': page,
                'perpage': '47'
            }
            if (options.type) { params['type'] = options.type }
            if (options.filters) {
                for (var name in options.filters) {
                    if (options.filters.hasOwnProperty(name)) {
                        params[name] = options.filters[name];
                    }
                }
            }
            var url = _url + options.items
            var postInUrl = ""
            if (options.from) { url += '/' + options.from;  postInUrl += options.from; }
            async = options.async
            if (postInUrl.includes("clear-for-")) {
                Ajax.apostInUrl(url, _headers, params, callback, _token, async);
            } else if (options.method == "POST") {
                Ajax.apost(url, _headers, params, callback, _token, async);
            } else {
                Ajax.aget(url, _headers, params, callback, _token, async);
            }
        },

        getWatching(type, callback) {
            var url = _url + 'watching'
            if (type) { url += '/' + type }
            Ajax.aget(url, _headers, null, callback, _token);
        },

        getItem(id, callback) {
            return Ajax.aget(_url + "items/" + id, _headers, null, callback, _token);
        },

        getSimilar(id, callback) {
            var params = { 'id': id }
            Ajax.aget(_url + "items/similar", _headers, params, callback, _token);
        },

        getSimilarInGenre(genreId, type, callback) {
            var params = { 
                'type': type,
                'genre': genreId,
                'sort': '-created'
            }
            Ajax.aget(_url + "items", _headers, params, callback, _token);
        },

        getComments(id, callback) {
            var params = { 'id': id }
            Ajax.aget(_url + "items/comments", _headers, params, callback, _token);
        },

        toggleWatching(id, video, season) {
            var params = { 'id': id }
            if (video) { params['video'] = video }
            if (season) { params['season'] = season }
            Ajax.aget(_url + 'watching/toggle', _headers, params, null, _token);
        },

        toggleWatchlist(id) {
            var params = { 'id': id }
            Ajax.aget(_url + 'watching/togglewatchlist', _headers, params, null, _token);
        },

        // MARK: - Ext API
        getExtItem(id, callback) {
            Ajax.get(_extUrl + 'items/' + id, _headers, null, callback);
        },
        getSearchItems(text, callback) {
            var params = {'q': text }
            Ajax.get(_extUrl + 'items/search', _headers, params, callback, false);
        },
        getCollectionForItem(id, callback) {
            Ajax.get(_extUrl + 'items/collections/' + id, _headers, null, callback);
        },
        sendLogs(params) {
            var xhr = Ajax.get("https://api.support-kp.com/" + "debug/log", _headers, params, null, true);
        },

        // MARK: - TV API
        getProgram(id, callback) {
            var key = 'programChannel' + id;
            var result = Cache.get(key);
            if (result != undefined) {
                console.log('Loading "' + key + '" from cache');
                if (callback) { callback(result) };
                return;
            }
            _callback = function(xhr) {
                var result = JSON.parse(xhr.responseText);
                Cache.set(key, result, 60);
                if (callback) { callback(result) }
            }
            Ajax.get('http://spacetv.in/api/channel/' + id, _headers, null, _callback, false);
        },

        getProgramNow(callback) {
            _callback = function(xhr) {
                var result = JSON.parse(xhr.responseText);
                if (callback) { callback(result) }
            }
            Ajax.get('http://spacetv.in/api/channel_now', _headers, null, _callback, false);
        },

        getPlaylist(url, callback) {
            var key = url;
            var result = Cache.get(key);
            if (result != undefined) {
                console.log('Loading "' + key + '" from cache');
                if (callback) { callback(result) };
                return;
            }
            _callback = function(xhr) {
                var result = xhr.responseText;
                Cache.set(key, result, 60);
                if (callback) { callback(result) }
            }
            Ajax.get(url, _headers, null, _callback, false);
        },

        // MARK: - TRAKT API
        traktDeviceCode(callback) {
            var params = {"client_id":_traktClientID}
            Ajax.post(_traktUrl + '/oauth/device/code', _headers, params, callback);
        },
        traktToken(deviceCode, callback) {
            var params = {"code":deviceCode,"client_id":_traktClientID,"client_secret":_traktClientSecret}
            Ajax.post(_traktUrl + '/oauth/device/token', _headers, params, callback);
        },
        traktRefreshToken(refreshToken, callback) {
            var params = {"refresh_token":refreshToken,"client_id":_traktClientID,"client_secret":_traktClientSecret,"grant_type":"refresh_token"}
            Ajax.post(_traktUrl + '/oauth/token', _headers, params, callback);
        },
        getTraktItemByIMDB(imdb, type, callback) {
            var headers = {
                'Content-Type': 'application/json',
                'trakt-api-version': '2',
                'trakt-api-key': _traktClientID
            }
            var params = {'extended' : 'full'}
            Ajax.get(_traktUrl + '/' + type + '/tt' + imdb, headers, params, callback);
        },
        setTraktRating(type, event, id, callback) {
            var headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + AppStorage.getItem(KEYS.traktAccessToken),
                'trakt-api-version': '2',
                'trakt-api-key': _traktClientID
            }
            var params = {}
            params[type] = [{"rating": event.value*10, "ids": {"imdb": "tt" + id}}]
            Ajax.post(_traktUrl + '/sync/ratings', headers, params, callback);
        },
        traktScrobble(traktState, body, headers) {
            body["app_version"] = "1.0";
            body["app_date"] = "2019-09-22";
            Ajax.post(_traktUrl + '/scrobble/' + traktState, headers, body);
        },
        traktSeasonInfo(imdb, number, headers, callback) {
            Ajax.get(_traktUrl + '/shows/tt' + imdb + '/seasons/' + number, headers, null, callback);
        },
        traktSyncHistory(body, headers, callback) {
            Ajax.post(_traktUrl + '/sync/history', headers, body, callback);
        },
        traktSyncWatchlist(body, headers, remove) {
            var url = _traktUrl + '/sync/watchlist';
            if (remove) { url += remove }
            Ajax.post(url, headers, body);
        },
        traktRecomendations(type, id, headers, callback) {
            var url = _traktUrl + '/recommendations/' + type;
            if (id) { url += '/' + id }
            Ajax.get(url, headers, null, callback);
        },
        update() {
            _url = KINOPUB.apiBase
            _authUrl = KINOPUB.apiAuth
            _extUrl = KINOPUB.apiBaseExt2
        },
    };
}());