var AppSettings = (function() {
    const values = {
        [settingKeys.userServer]: null,
        [settingKeys.userStream]: null,
        [settingKeys.userQuality]: quality,
        [settingKeys.usePlaylistProxy]: yesNo,
        [settingKeys.customPlayer]: yesNo,
        [settingKeys.showDebugInfo]: yesNo,
        [settingKeys.userAudioOption]: yesNo,
        [settingKeys.userAutoPlayOption]: yesNo,
        [settingKeys.showTimeContinueAlert]: yesNo,
        [settingKeys.playNextSeason]: yesNo,
        [settingKeys.saveSubtitleSource]: yesNo,
        [settingKeys.saveAudioSource]: yesNo,
        [settingKeys.showRatingStroke]: yesNo,
        [settingKeys.userTopShelfOption]: topShelfOptions,
        [settingKeys.backgroundUpdateTopShelf]: yesNo,
        [settingKeys.animeIsHidden]: yesNo,
        [settingKeys.cartoonMode]: yesNo,
        [settingKeys.playerSelectQuality]: yesNo,
        [settingKeys.uberStroke]: yesNo,
        [settingKeys.uberStrokeAutoTrailer]: yesNo,
    }

    const defaults12 = {
        [settingKeys.userServer]: null,
        [settingKeys.userStream]: null,
        [settingKeys.userQuality]: quality.bestResolution,
        [settingKeys.usePlaylistProxy]: yesNo[0],
        [settingKeys.customPlayer]: yesNo[1],
        [settingKeys.showDebugInfo]: yesNo[0],
        [settingKeys.userAudioOption]: yesNo[1],
        [settingKeys.userAutoPlayOption]: yesNo[1],
        [settingKeys.showTimeContinueAlert]: yesNo[1],
        [settingKeys.playNextSeason]: yesNo[0],
        [settingKeys.showRatingStroke]: yesNo[1],
        [settingKeys.userTopShelfOption]: topShelfOptions.unwatched,
        [settingKeys.backgroundUpdateTopShelf]: yesNo[0],
        [settingKeys.animeIsHidden]: yesNo[0],
        [settingKeys.cartoonMode]: yesNo[0],
        [settingKeys.playerSelectQuality]: yesNo[0],
    }

    const defaults13 = {
        [settingKeys.uberStroke]: yesNo[0],
        //[settingKeys.uberStrokeAutoTrailer]: yesNo[0]
    }

    const defaultsMicro6 = {
        [settingKeys.saveSubtitleSource]: yesNo[1],
        [settingKeys.saveAudioSource]: yesNo[1],
    }

    const defaults = (function() {
        const val = (parseInt(Device.systemVersion) >= 13) ? Object.assign({}, defaults12, defaults13) : defaults12;
        return (Device.appIdentifier.includes('octavian') && Device.appVersion >= 6) || (Device.appIdentifier.includes('qinoa') && Device.appVersion >= 25) ? Object.assign(val, defaultsMicro6) : val;
    }());

    function checkKeyValidity(key) {
        return Object.keys(settingKeys).some(param => settingKeys[param] === key);
    }

    function checkKeyValueValidity(key, value) {
        if (!checkKeyValidity(key)) return false;

        return Object.keys(values[key]).some(param => values[key][param] === value);
    }

    function getSettingsFromStorage(defaultSettings = {}) {
        const settings = JSON.parse(AppStorage.getItem(KEYS.settings) || '{}');
        console.log(settings);
        const validatedSettings = Object
            .keys(settings)
            .filter(checkKeyValidity)
            .map(key => ({ key, value: settings[key] }))
            .reduce((result, { key, value }) => {
                result[key] = value;
                return result;
            }, {});

        return {
            ...defaultSettings,
            ...validatedSettings,
        };
    }

    function saveToDefaults(key, value) {
        if (key == settingKeys.showTimeContinueAlert) { AppStorage.setData(key, value.id); }
        if (key == settingKeys.showDebugInfo) { AppStorage.setData(key, value.id); }
    }

    // function fromDefaults(settings, key) {
    //     if (key == settingKeys.showTimeContinueAlert) { settings[settingKeys.showTimeContinueAlert] = yesNo[Number(AppStorage.getData(key))]; }
    //     if (key == settingKeys.showDebugInfo) { settings[settingKeys.showDebugInfo] = yesNo[Number(AppStorage.getData(key))]; }
    // }

    var settings = getSettingsFromStorage(defaults);

    return {
        set(key, value) {
            const hasParam = checkKeyValidity(key);
            const hasValue = checkKeyValueValidity(key, value);

            if (!hasParam) throw new Error(`Unsupported settings param "${key}"`);
            if (!hasValue) {
                throw new Error(`Unsupported value "${value}" for settings param "${key}"`);
            }

            settings[key] = value;
            AppStorage.setItem(KEYS.settings, JSON.stringify(settings));
            saveToDefaults(key, value);
        },

        get(key) {
            return settings[key];
        },

        getAll() {
            return {...settings };
        },

        setAllValues(key, _values) {
            values[key] = _values;
            settings = getSettingsFromStorage(defaults);
        },

        getAllValues(key) {
            return values[key];
        },

        getDefaultUrl() {
            return AppStorage.getData(KEYS.tvBootUrl);
        },

        setDefaultUrl() {
            if (hashConfig.u) {
                AppStorage.setData(KEYS.tvBootUrl, `${baseURL}application.js#u=${hashConfig.u}&s=application.js`);
                return;
            }
            if (hashConfig.a) {
                AppStorage.setData(KEYS.tvBootUrl, `${baseURL}application.js#a=${hashConfig.a}&s=application.js`);
                return;
            }
            AppStorage.setData(KEYS.tvBootUrl, `${baseURL}application.js`);
        },

        removeDefaultUrl() {
            AppStorage.removeData(KEYS.tvBootUrl);
            AppStorage.removeData(KEYS.defaultBootUrlDenied)
        },

        populate(object) {
            if (object.u) {
                const u = Utils.getByKey(object.u, KINOPUB.clientSecret);
                KINOPUB.apiBase = KINOPUB.apiBase.replace(KINOPUB.proxyUrl, u);
                KINOPUB.apiAuth = KINOPUB.apiAuth.replace(KINOPUB.proxyUrl, u);
                KINOPUB.apiBaseExt2 = KINOPUB.apiBaseExt2.replace(KINOPUB.proxyUrl, u);
                KINOPUB.actorImgUrl = KINOPUB.actorImgUrl.replace(KINOPUB.proxyUrl, u);
                KINOPUB.cdnUrl = KINOPUB.cdnUrl.replace(KINOPUB.proxyUrl, u);
                KINOPUB.proxyUrl = u;
            }

            if (object.a) {
                const a = Utils.getByKey(object.a, KINOPUB.clientSecret);
                KINOPUB.apiBase = a + "/v1/";
                KINOPUB.apiAuth = a + "/oauth2/";
                KINOPUB.apiBaseExt2 = a + "/api2/v1.1/";
                KINOPUB.cdnUrl = a.replace('api.', 'm.') + "/";
                KINOPUB.proxyUrl = a;
            }

            console.log(KINOPUB);
        },
    };
}());
