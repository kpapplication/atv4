var Kinopoisk2 = {
    loadFromKinopoisk(kpMethod, kpID, callback, async = true) {
        var kinopoiskKey = AppStorage.getItem(KEYS.kinopoiskKey)
        if (kinopoiskKey === undefined) { return }
        var kpMethod = kpMethod.replace('{id}', kpID)
        var kinopoiskAuth_url = kinopoisk2.API + kpMethod
        var kinopoiskTemplateXHR = new XMLHttpRequest();
        kinopoiskTemplateXHR.open("GET", kinopoiskAuth_url, async);
        kinopoiskTemplateXHR.setRequestHeader('Accept', 'application/json');
        kinopoiskTemplateXHR.setRequestHeader('X-API-KEY', kinopoiskKey);
        //kinopoiskTemplateXHR.timeout = 2000;
        kinopoiskTemplateXHR.onload = function() {
            var kinopoiskResult = JSON.parse(kinopoiskTemplateXHR.responseText);
            console.log(kinopoiskResult);
            callback(kinopoiskResult);
        }
        kinopoiskTemplateXHR.onerror = function() {
            console.log(kinopoiskTemplateXHR.responseText);
        }
        kinopoiskTemplateXHR.send();
    },

    castTemplate(kinopoiskResult) {
        var kinopoiskString = '';
        kinopoiskString += '<shelf id="actors"><header><title>Актеры и съемочная группа</title></header><section>'
        kinopoiskResult.forEach(cast => kinopoiskString += '<lockup onselect="KP.actorPage(\'' + encodeURIComponent(cast.nameRu) + '\', \'' + encodeURIComponent(cast.nameEn) + '\', \'' + cast.professionKey.toLowerCase() + '\', ' + cast.staffId + ');"><img style="border-radius: large; tv-placeholder: movie;" src="' + kinopoisk2.actorImageUrl + cast.staffId + '.jpg" width="200" height="300"/><title>' + cast.nameRu.replace(/&/g, "&amp;") + '</title><subtitle>(' + (cast.description || cast.professionText) + ')</subtitle></lockup>');
        kinopoiskString += '</section></shelf>'
        return kinopoiskString;
    },

    triviaTemplate(kinopoiskResult) {
        var triviaData = '<shelf><header><title>Интересные факты</title></header><section>';
        kinopoiskResult.items.forEach(trivia => triviaData += '<reviewCard onselect="showText(\'' + trivia.text.replace(/"/g, "&apos;").replace(/>/g, "&lt;").replace(/</g, "&gt;").replace(/'/g, "").replace(/[\r\n]+/gm, " ") + '\')"><description allowsZooming="true" style="tv-text-max-lines: 8">' + (trivia.spoiler ? 'СПОЙЛЕР' : Utils.decodeCharacters(trivia.text)) + '</description></reviewCard>');
        triviaData += '</section></shelf>';
        return triviaData;
    },

    screenshotsTemplate(kinopoiskResult, listNumber) {
        var screenshot = '';
        var number = 0;
        if (typeof kinopoiskResult.items !== 'undefined' && kinopoiskResult.items.length > 0) {
            kinopoiskResult.items.forEach((kadr, index) => {
                number++
                var autoHighlight = listNumber == number ? 'autoHighlight="true"' : ""
                screenshot += '<lockup ' + autoHighlight + '><img src="' + kadr.imageUrl + '" /><title>Кадры</title><subtitle>Кадр ' + (index + 1) + ' из ' + kinopoiskResult.items.length + '</subtitle></lockup>';
            });
        }
        var template = '<document><head><style>* {tv-transition: push;}</style></head><oneupTemplate mode="oneup caption"><section>' + screenshot + '</section></oneupTemplate></document>';
        return template;
    },

    uberScreenshotsTemplate(kinopoiskResult, kinopoiskId) {
        var screenshot = '';
        var number = 0;
        if (typeof kinopoiskResult.items !== 'undefined' && kinopoiskResult.items.length > 0) {
            screenshot += '<section><header><title>Кадры</title></header>'
            kinopoiskResult.items.forEach(kadr => {
                number++;
                screenshot += '<lockup id="' + number + '" onselect="KP.showScreenshots(\'' + kinopoiskId + '\', \'' + number + '\')" ><img src="' + kadr.previewUrl + '" width="400" height="300"/></lockup>';
            });
            screenshot += '</section>'
        }
        var template = '<shelf>' + screenshot + '</shelf>';
        return template;
    }
};