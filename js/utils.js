var Utils = {
    _entityMap: {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '`': '&#x60;',
        '"': '',
        "'": '',
        "\\": '&#92;'
    },
    escapeHtml: function(string) {
        var self = this;
        return String(string).replace(/[&<>`]/g, function(s) {
            return self._entityMap[s];
        });
    },
    decodeCharacters(text) {
        return text.replace(/&apos;/g, '"').replace(/&lt;/g, ">").replace(/&gt;/g, "<").replace(/&laquo;/g, "«").replace(/&raquo;/g, "»").replace(/&#171;/g, "«").replace(/&#187;/g, "»").replace(/&#8211;/g, "–");
    },
    splitTitle(title) {
        var titles = title.split(" / ");
        var title = titles[0] ? Utils.replaceText(Utils.escapeHtml(titles[0].trim())) : "";
        var subtitle = titles[1] ? Utils.replaceText(Utils.escapeHtml(titles[1].trim())) : "";
        return { title: title, subtitle: subtitle };
    },
    declOfNum(number, titles) {
        cases = [2, 0, 1, 1, 1, 2];
        return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
    },
    rusDate(dateString, options) {
        var date = dateString ? new Date(dateString) : new Date();
        options = options || { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleString("ru", options);
    },
    replaceText(text) {
        return text.replace(/"/g, "").replace(/>/g, "&lt;").replace(/</g, "&gt;").replace(/'/g, "").replace(/[\r\n]+/gm, " ");
    },
    fixIMDB(id) {
        for (i = id.toString().length; i < 7; i++) {
            id = "0" + id;
        }
        return id;
    },
    getMax(arr, prop) {
        var max;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].depth == 0) {
                if (!max || parseInt(arr[i][prop]) > parseInt(max[prop]))
                    max = arr[i];
            }
        }
        return max;
    },
    shuffleFunction(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },
    shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    },
    unique(arr) {
        var obj = {};
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].group) {
                var str = arr[i].group;
                obj[str] = true; // запомнить строку в виде свойства объекта     
            }
        }
        return Object.keys(obj);
    },
    range(start, end) {
        if (start === end) return [start];
        return [start, ...Utils.range(start + 1, end)];
    },
    isSerial(item) {
        return (item.type == 'serial' || item.type == 'docuserial' || item.type == 'tvshow');
    },
    isNative() {
        if (Device.appIdentifier.includes('popov') && Device.appVersion < 13) { return true; }
        if (~Device.appIdentifier.toLowerCase().indexOf('qello')) { return true; }
        //return !!~Device.appIdentifier.toLowerCase().indexOf('qello');
        return !AppSettings.getAll().customPlayer.id;
    },
    spoiler(message, show = false) {
        var regex = /(<spoiler>)(.*?)(<\/spoiler*>)/g;
        let result = regex.exec(message);
        if (result) {
            let replace = show ? result[2] : "[SPOILER]";
            message = message.replace(result[0], replace);
        }
        return message;
    },
    remove(array, element) {
        var index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
        }
    },
    appName() {
        var name = 'unknown';
        if (Device.appIdentifier.includes('popov')) { name = Device.appIdentifier.replace('popov.', ''); }
        if (Device.appIdentifier.includes('kozlov')) { name = 'EasyTV' }
        if (Device.appIdentifier.includes('morozov')) { name = 'Tiny IPTV' }
        if (Device.appIdentifier.includes('octavian')) { name = 'Micro IPTV' }
        if (Device.appIdentifier.includes('qello')) { rname = 'Qello' }
        name += ' ' + Device.appVersion;
        return name;
    },
    hideAnime(result, options) {
        if (options.id != "history" && options.id != "collections" && options.id != "unwatched") {
            result.items = result.items.filter(item => !item.genres.map(a=>a.id).includes(25));
        }
    },
    onlyCartoon(result) {
        result.items = result.items.filter(item => item.genres.map(a=>a.id).includes(23));
    },
    findFirst(arr, predicate) {
        foundIndex = arr.findIndex(predicate);
        return foundIndex !== -1 ? arr[foundIndex] : null;
    },
    replaceElement(string, elementTag, elementID, action, doc) {
        var doc = Presenter.activeParser(doc).doc
        var lsInput = Presenter.activeParser().lsInput
        var lsParser = Presenter.activeParser().lsParser
        var element = (elementTag) ? doc.getElementsByTagName(elementTag).item(0) : doc.getElementById(elementID);
        lsInput.stringData = string.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
        lsParser.parseWithContext(lsInput, element, action);
    },
    replaceCdn(url) {
        if (!KINOPUB.oldCdnUrl) {
            return url;
        }
        if (url && typeof url === 'string') {
            if (KINOPUB.replaceApiCdn) {
                const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
                const urlPath = urlWithoutProtocol.split('/').slice(1).join('/');
                return KINOPUB.cdnUrl + '/' + urlPath;
            }

            return url.replace(KINOPUB.oldCdnUrl, KINOPUB.cdnUrl);
        }

        return url;
    },
};
