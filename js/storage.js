var AppStorage = {
	getItem: function(key) {
		var localStorageValue = localStorage.getItem(key);
		var userDefaultsValue = userDefaults.getData("localStorage_" + key);

		if (!userDefaultsValue && localStorageValue) {
			// migrate to userDefaults (temporary)
			userDefaults.setData("localStorage_" + key, localStorageValue);
		}

		return userDefaultsValue || localStorageValue;
		// return localStorage.getItem(key);
	},

	setItem: function(key, value) {
		return userDefaults.setData("localStorage_" + key, value);
		// return localStorage.setItem(key, value);
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
		return localStorage.removeItem(key);
	}
}