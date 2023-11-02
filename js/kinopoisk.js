var Kinopoisk = {
    loadFromKinopoisk(kpMethod, kpID, callback) {
        var kinopoiskAuth_url = kinopoisk.API + kpMethod + kpID + '&uuid=' + kinopoisk.key
        var kinopoiskTemplateXHR = new XMLHttpRequest();
        kinopoiskTemplateXHR.open("GET", kinopoiskAuth_url, true);
        kinopoiskTemplateXHR.setRequestHeader('Image-Scale', 3);
        kinopoiskTemplateXHR.setRequestHeader('countryID', 2);
        kinopoiskTemplateXHR.setRequestHeader('cityID', 1);
        kinopoiskTemplateXHR.setRequestHeader('Content-Lang', 'ru');
        kinopoiskTemplateXHR.setRequestHeader('Accept', 'application/json');
        kinopoiskTemplateXHR.setRequestHeader('User-Agent', 'Android client (6.0.1 / api23), ru.kinopoisk/4.6.5 (86)');
        kinopoiskTemplateXHR.setRequestHeader('device', 'android');
        kinopoiskTemplateXHR.setRequestHeader('Android-Api-Version', 23);
        kinopoiskTemplateXHR.setRequestHeader('ClientId', kinopoisk.clientID);
        var options = { year: 'numeric', month: 'long', day: 'numeric' };
        kinopoiskTemplateXHR.setRequestHeader('clientDate', Date.toLocaleString("ru", options));
        var xDate = Date.now();
        var xSignature = md5(kpMethod + kpID + xDate + kinopoisk.salt)
        kinopoiskTemplateXHR.setRequestHeader('X-SIGNATURE', xSignature);
        kinopoiskTemplateXHR.setRequestHeader('X-TIMESTAMP', xDate);
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
        if (kinopoiskResult.data.creators[0] || kinopoiskResult.data.creators[1]) {
            kinopoiskString += '<shelf id="actors"><header><title>Актеры и съемочная группа</title></header><section>'
            if (kinopoiskResult.data.creators[0]) {
                kinopoiskResult.data.creators[0].forEach(director => kinopoiskString += '<lockup onselect="KP.actorPage(\'' + encodeURIComponent(director.nameRU) + '\', \'' + encodeURIComponent(director.nameEN) + '\',\'director\');"><img style="border-radius: large; tv-placeholder: movie;" src="' + kinopoisk.actorImageUrl + director.id + '.jpg" width="200" height="300"/><title>' + director.nameRU.replace(/&/g, "&amp;") + '</title><subtitle>Режиссер</subtitle></lockup>');
            } else {
                if (result.item.director != '') {
                    directorList.forEach(director => kinopoiskString += '<lockup onselect="KP.actorPage(\'' + encodeURIComponent(director) + '\', null, \'director\');"><img style="border-radius: large; tv-placeholder: movie;" width="200" height="300"/><title>' + director + '</title><subtitle>Режиссер</subtitle></lockup>');
                }
            }
            if (kinopoiskResult.data.creators[1]) {
                kinopoiskResult.data.creators[1].forEach(cast => kinopoiskString += '<lockup onselect="KP.actorPage(\'' + encodeURIComponent(cast.nameRU) + '\', \'' + encodeURIComponent(cast.nameEN) + '\', \'actor\');"><img style="border-radius: large; tv-placeholder: movie;" src="' + kinopoisk.actorImageUrl + cast.id + '.jpg" width="200" height="300"/><title>' + cast.nameRU.replace(/&/g, "&amp;") + '</title><subtitle>(' + (cast.description || 'Актер') + ')</subtitle></lockup>');
            } else {
                if (result.item.cast != '') {
                    castList.forEach(cast => kinopoiskString += '<lockup onselect="KP.actorPage(\'' + encodeURIComponent(cast) + '\', null, \'actor\');"><img style="border-radius: large; tv-placeholder: movie;" width="200" height="300"/><title>' + cast + '</title><subtitle>Актёр</subtitle></lockup>');
                }
            }
            kinopoiskString += '</section></shelf>'
        }
        return kinopoiskString;
    },

    triviaTemplate(kinopoiskResult) {
        var triviaData = '<shelf><header><title>Интересные факты</title></header><section>';
        kinopoiskResult.data.triviaData.forEach(trivia => triviaData += '<reviewCard onselect="showText(\'' + trivia.replace(/"/g, "").replace(/>/g, "&lt;").replace(/</g, "&gt;").replace(/'/g, "").replace(/[\r\n]+/gm, " ") + '\')"><description allowsZooming="true" style="tv-text-max-lines: 8">' + trivia + '</description></reviewCard>');
        triviaData += '</section></shelf>';
        return triviaData;
    },

    screenshotsTemplate(kinopoiskResult, listNumber) {
        var screenshot = '';
        var number = 0;
        if (kinopoiskResult.data.gallery.kadr) {
            kinopoiskResult.data.gallery.kadr.forEach((kadr, index) => {
                number++
                var autoHighlight = listNumber == number ? 'autoHighlight="true"' : ""
                screenshot += '<lockup ' + autoHighlight + '><img src="' + kadr.image + '" /><title>Кадры</title><subtitle>Кадр ' + (index + 1) + ' из ' + kinopoiskResult.data.gallery.kadr.length + '</subtitle></lockup>';
            });
        }
        if (kinopoiskResult.data.gallery.poster) {
            kinopoiskResult.data.gallery.poster.forEach((poster, index) => {
                number++
                var autoHighlight = listNumber == number ? 'autoHighlight="true"' : ""
                screenshot += '<lockup ' + autoHighlight + '><img src="' + poster.image + '" /><title>Постеры</title><subtitle>Постер ' + (index + 1) + ' из ' + kinopoiskResult.data.gallery.poster.length + '</subtitle></lockup>';
            });
        }
        var template = '<document><head><style>* {tv-transition: push;}</style></head><oneupTemplate mode="oneup caption"><section>' + screenshot + '</section></oneupTemplate></document>';
        return template;
    },

    uberScreenshotsTemplate(kinopoiskResult, kinopoiskId) {
        var screenshot = '';
        var number = 0;
        if (kinopoiskResult.data.gallery.kadr) {
            screenshot += '<section><header><title>Кадры</title></header>'
            kinopoiskResult.data.gallery.kadr.forEach(kadr => {
                number++;
                screenshot += '<lockup id="' + number + '" onselect="KP.showScreenshots(\'' + kinopoiskId + '\', \'' + number + '\')" ><img src="' + kadr.image + '" width="400" height="300"/></lockup>';
            });
            screenshot += '</section>'
        }
        if (kinopoiskResult.data.gallery.poster) {
            screenshot += '<section style="margin-left:50"><header><title>Постеры</title></header>'
            kinopoiskResult.data.gallery.poster.forEach(poster => {
                number++
                screenshot += '<lockup id ="' + number + '" onselect="KP.showScreenshots(\'' + kinopoiskId + '\', \'' + number + '\')"><img src="' + poster.image + '" width="200" height="300"/></lockup>'
            });
            screenshot += '</section>'
        }
        var template = '<shelf>' + screenshot + '</shelf>';
        return template;
    }
};