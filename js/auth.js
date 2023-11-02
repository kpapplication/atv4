var Auth = (function() {
	function refreshToken() {
		var refreshToken = AppStorage.getItem(KEYS.refreshToken);
		var xhr = API.getRefreshToken(refreshToken);
		if (xhr.status == 200) {
			console.log("RefreshToken:");
			console.log(xhr.responseText);
			var json = JSON.parse(xhr.responseText);
			updateStorage(json);
			API.setToken(json.access_token);
			Log.sendLog('RefreshToken done');
			return true;
		}
		authErrors.push('RefreshToken status: ' + xhr.status + ' ' + xhr.responseText || 'null' + ', state: ' + xhr.readyState);
		Log.sendLog('RefreshToken status: ' + xhr.status + ' ' + xhr.responseText || 'null' + ', state: ' + xhr.readyState)
		return false;
	}

	function updateStorage(json, userDefaults = true) {
		AppStorage.setItem(KEYS.accessToken, json.access_token);
		AppStorage.setItem(KEYS.refreshToken, json.refresh_token);
		AppStorage.setItem(KEYS.tokenExpires, parseInt(new Date().getTime()/1000) + parseInt(json.expires_in));
		if (userDefaults) {
			AppStorage.setData(KEYS.accessToken, json.access_token);
			AppStorage.setData(KEYS.refreshToken, json.refresh_token);
		}
	}

	return {
		check() {
			var _accessToken = AppStorage.getItem(KEYS.accessToken),
				_refreshToken = AppStorage.getItem(KEYS.refreshToken),
				expires = AppStorage.getItem(KEYS.tokenExpires)
	
			if (!_accessToken || !_refreshToken) { 
				_accessToken = AppStorage.getData(KEYS.accessToken),
				_refreshToken = AppStorage.getData(KEYS.refreshToken),
				expires = 0
				if (!_accessToken || !_refreshToken) {
					authErrors.push('Local credentials is null.');
					//Log.sendLog('Local credentials is null.')
					return false;
				} else {
					var json = {'access_token': _accessToken, 'refresh_token': _refreshToken, 'expires_in': 0}
					updateStorage(json, false)
				}
			}
			if (expires - 600 < new Date().getTime()/1000) {
				console.log("Try to refresh token");
				authErrors.push('Expires. Try to refresh token');
				Log.sendLog('Expires. Try to refresh token.')
				return refreshToken();
			}
			API.setToken(_accessToken)
			var xhr = API.checkAuth();
			console.log(xhr);
			// xhr.onerror = function() {
			// 	console.log(xhr.responseText);
			// 	authErrors.push('checkAuth status: ' + xhr.status + ' ' + xhr.responseText);
			// }
			var json = { status: 0 }
			if (xhr.status == 0 && JSON.parse(xhr.responseText)) {
				json = JSON.parse(xhr.responseText);
			} 
			if (xhr.status == 401 || json.status == 401) {
				authErrors.push('Token a status: ' + xhr.status + ' ' + xhr.responseText);
				Log.sendLog('Token a status: ' + xhr.status + ' ' + xhr.responseText)
			} else { return true; }
			
			return refreshToken();
		},
	
		accessToken(code, callback) {
			API.getDeviceToken(code, function(xhr) {
				if (xhr.status == 200) {
					var json = JSON.parse(xhr.responseText);
					  updateStorage(json);
					API.setToken(json.access_token);
					callback(true, false);
				} else if (xhr.status == 400) {
					if (xhr.responseText.indexOf("authorization_pending") >= 0) {
						console.log("Waiting for activation");
						callback(false, true);
					} else {
						console.log("ActivationResponse 400", xhr.responseText);
						callback(false, false);
					}
				} else {
					console.log("ActivationResponse else", xhr);
					//callback(false, false);
				}
			});
		}
	}
}());