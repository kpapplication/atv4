var AppStorage = {
	getItem: function(key) {
		var localStorageValue = localStorage.getItem(key);
		var userDefaultsValue = userDefaults.getData("localStorage_" + key);

		if (!userDefaultsValue && localStorageValue) {
			userDefaults.setData("localStorage_" + key, localStorageValue);
		}

		if (!localStorageValue && userDefaultsValue) {
			localStorage.setItem(key, userDefaultsValue);
		}

		return userDefaultsValue || localStorageValue;
	},

	setItem: function(key, value) {
		// double storage
		localStorage.addItem(key, value);
		return userDefaults.setData("localStorage_" + key, value);
    },

	removeItem: function(key) {
		localStorage.removeItem(key)
		return userDefaults.removeData("localStorage_" + key);
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
}
