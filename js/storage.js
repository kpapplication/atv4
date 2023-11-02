var AppStorage = {
	getItem: function(key) {
		return localStorage.getItem(key);
	},

	setItem: function(key, value) {
		return localStorage.setItem(key, value);
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