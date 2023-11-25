var AppStorage = {
	getItem: function(key) {
		var localStorageValue = localStorage.getItem(key);
		var userDefaultsValue = userDefaults.getData("localStorage_" + key);

		try {
			if (!userDefaultsValue && localStorageValue) {
				userDefaults.setData("localStorage_" + key, localStorageValue);
			}

			if (!localStorageValue && userDefaultsValue) {
				localStorage.setItem(key, userDefaultsValue);
			}
		} catch (e) {
			console.log('Could not redefine storage data for key', key, value, e);
		}

		return userDefaultsValue || localStorageValue;
	},

	setItem: function(key, value) {
		try {
			localStorage.addItem(key, value);
			return userDefaults.setData("localStorage_" + key, value);
		} catch (e) {
			console.log('Could not redefine set data for key', key, value, e);
		}
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
