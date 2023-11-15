var AppStorage = {
	getItem: function(key) {
		var localStorageValue = localStorage.getItem(key);
		var userDefaultsValue = userDefaults.getData("localStorage_" + key);

		if (!userDefaultsValue && localStorageValue) {
			// migrate to userDefaults (temporary)
			userDefaults.setData("localStorage_" + key, localStorageValue);
			localStorage.removeItem(key);
		}

		return userDefaultsValue || localStorageValue;
	},

	setItem: function(key, value) {
		// migrate to userDefaults (temporary)
		localStorage.removeItem(key);
		return userDefaults.setData("localStorage_" + key, value);
    },
    
    getData: function(key) {
		return userDefaults.getData(key);
	},

	setData: function(key, value) {
		return userDefaults.setData(key, value);
	},

	removeData: function(key) {
		return userDefaults.removeData(key);
	},
	
	removeItem: function(key) {
		// migrate to userDefaults (temporary)
		localStorage.removeItem(key)
		return userDefaults.removeData(key);
	}
}