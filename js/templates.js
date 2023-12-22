var Templates = {
    loading(text) {
        text = text || "Загрузка"
        var template = `
            <document>
                <loadingTemplate>
                    <activityIndicator><text>${text}</text></activityIndicator>
                </loadingTemplate>
            </document>
        `;
        return template;
    },

    menuBar() {
        return template = `
            <document>
                <menuBarTemplate>
                    <img src="${baseURL}img/kino-pub.png" width="606" height="168" />
                    <menuBar>
                        <menuItem id = "Search"><title>Поиск</title></menuItem>
                        <menuItem id = "MoviesPage" autoHighlight="true"><title>Фильмы</title></menuItem>
                        <menuItem id = "ShowsPage"><title>Сериалы</title></menuItem>
                        <menuItem id = "MySubscribes"><title>Мои</title></menuItem>
                        <menuItem id = "AllMovies"><title>Библиотека</title></menuItem>
                        <menuItem id = "TV"><title>ТВ</title></menuItem>
                        <menuItem id = "Settings"><title>&#9881;</title></menuItem>
                    </menuBar>
                </menuBarTemplate>
            </document>
        `;
    },

    menuBarChild() {
        return template = `
            <document>
                <menuBarTemplate>
                    <img src="${baseURL}img/kino-pub.png" width="606" height="168" />
                    <menuBar>
                        <menuItem id = "ChildMoviesPage" autoHighlight="true"><title>Мультфильмы</title></menuItem>
                        <menuItem id = "Settings"><title>&#9881;</title></menuItem>
                    </menuBar>
                </menuBarTemplate>
            </document>
        `;
    },

    showCode(code, title, errors) {
        title = title || "Введите отображаемый ниже код для регистрации устройства."
        errors = (errors) ? '<text style="color: red; margin-top: 100px;">' + errors + '</text>' : '';
        return `
            <document>
                <head>
                    <style>
                        .bigtitle{font-size: 40;} 
                        .bigdesc{font-size: 80; color: white; margin-bottom: 20px;}
                    </style>
                </head>
                <alertTemplate>
                    <title class="bigtitle">${title}</title>
                    <description class="bigdesc">${code}</description>
                    ${errors}
                </alertTemplate>
            </document>
        `;
    },

    descriptiveAlert(text, title, yesNoButtons) {
        title = title || ""
        var buttons = '';
        if (yesNoButtons) {
            buttons = '<button ' + yesNoButtons.buttonYES + '><text>Да</text></button><button ' + yesNoButtons.buttonNO + '><text>Нет</text></button>';
        }
        return `
            <document>
                <descriptiveAlertTemplate>
                    <title>${title}</title>
                    <description>${Utils.decodeCharacters(text)}</description>
                    ${buttons}
                </descriptiveAlertTemplate>
            </document>
        `;
    },

    alert(title, desc, buttons) {
        title = title || 'Ошибка';
        desc = desc || 'Произошла ошибка. Попробуйте обновить страницу'
        buttons = buttons || '';
        return `
                <document>
                    <alertTemplate>
                        <title>${title}</title>
                        <description>${desc}</description>
                        ${buttons}
                    </alertTemplate>
                </document>
        `;
    },

    newVersion(newVersion) {
        var buttons = `<button onselect="navigationDocument.dismissModal();"><text>Ок</text></button>
                        <button onselect="KP.showHistory();"><text>Список изменений</text></button>`;
        return this.alert(`Доступна новая версия ${newVersion}.`, 'Для обновления перезапустите приложение.\nДвойное нажатие по кнопке 🖥 и смахнуть вверх', buttons);
    },

    comments(result) {
        return `
            <document>
                <listTemplate>
                    <banner><title>Комментарии</title></banner>
                    <list>
                        <section>
                            ${this.fragments.commentItems(result)}
                        </section>
                    </list>
                </listTemplate>
            </document>
        `;
    },

    ratingPage(rating) {
        return `
            <document>
                <ratingTemplate>
                    <title>Рейтинг</title>
                    <ratingBadge>${rating}</ratingBadge>
                </ratingTemplate>
            </document>
        `;
    },

    moviesPage(options, itemsToLoad) {
        var shelfs = '';
        for (var index in itemsToLoad) {
            if (index == 0) { continue }
            shelfs += this.fragments.itemLoading(itemsToLoad[index]);
        }
        return `<document>
                    <head>
                        <style>
                            .stack{margin: 0 0 75 0;} 
                            @media tv-template and (tv-theme:dark) {.nextButton{font-size: 40; text-align: center; color: white; background-color: rgb (255,255,255);}} 
                            @media tv-template and (tv-theme:light) {.nextButton{font-size: 40; text-align: center; color: black; background-color: rgb (0,0,0);}}
                        </style>
                    </head>
                    <stackTemplate>
                        <collectionList>
                            <carousel>
                                <section>
                                    ${options.banners}
                                </section>
                            </carousel>
                            ${this.fragments.itemsShelf(options)}
                            ${shelfs}
                        </collectionList>
                    </stackTemplate>
                </document>`;
    },

    searchPage() {
        return `<document>
                    <head>
                        <style>
                            @media tv-template and (tv-theme:dark) {.nextButton{font-size: 24; text-align: center; color: white; background-color: rgb (255,255,255);}} 
                            @media tv-template and (tv-theme:light) {.nextButton{font-size: 24; text-align: center; color: black; background-color: rgb (0,0,0);}}
                        </style>
                    </head>
                    <searchTemplate>
                        <searchField />
                        <collectionList><list><section><header><title>Поиск происходит по мере ввода текста от 1 символа.</title></header></section></list></collectionList> 
                    </searchTemplate>
                </document>`;
    },

    mySubscribesPage(serials) {
        var traktReco = Trakt.checkTrakToken() ? `
                            <section>
                                <header><title></title></header>
                                <listItemLockup>
                                    <title>TraktTV</title>
                                    <img style="tv-position: right" src="${baseURL}img/trakt.png" width="75" height="75" />
                                    <relatedContent>
                                        <grid>
                                            <section>
                                                <lockup onselect="Trakt.showTraktReco(\'movie\')">
                                                    <img style="tv-placeholder:movie" src="" width="250" height="250" />
                                                    <title>Рекомендации: фильмы</title>
                                                </lockup>
                                                <lockup onselect="Trakt.showTraktReco(\'tv\')">
                                                    <img style="tv-placeholder:tv" src="" width="250" height="250" />
                                                    <title>Рекомендации: сериалы</title>
                                                </lockup>
                                            </section>
                                        </grid>
                                    </relatedContent>
                                </listItemLockup>
                            </section>` : ``
        var history = `
        <section>
            <header><title></title></header>
            <listItemLockup>
                <title>История</title>
                <decorationLabel>
                    <badge style="tv-tint-color: white;" src="" />
                </decorationLabel>
                <relatedContent>
                    <grid>
                        <section id="history"></section>
                    </grid>
                </relatedContent>
            </listItemLockup>
        </section>`;
        return `<document>
                    <head>
                        <style>
                            @media tv-template and (tv-theme:dark) {.nextButton{font-size: 40; text-align: center; color: white; background-color: rgb (255,255,255);}} 
                            @media tv-template and (tv-theme:light) {.nextButton{font-size: 40; text-align: center; color: black; background-color: rgb (0,0,0);}}
                        </style>
                    </head>
                    <catalogTemplate>
                        <banner>
                            <title>Мои</title>
                        </banner>
                        <list>
                            <section>
                                <header><title>Недосмотренные</title></header>
                                ${serials}
                            </section>
                            <section>
                                <header><title>Закладки</title></header>
                                <listItemLockup id="create">
                                    <title>Создать закладку</title>
                                    <decorationLabel>
                                        <badge style="tv-tint-color: white;" src="resource://button-add" />
                                    </decorationLabel>
                                </listItemLockup>
                            </section>
                            ${history}
                            ${traktReco}
                        </list>
                    </catalogTemplate>
                </document>`;
    },

    libraryPage(filters, sort) {
        return `<document>
                    <head>
                        <style>
                            @media tv-template and (tv-theme:dark) {.text {font-size: 40; text-align: center; color: white;} .label{tv-tint-color: rgb(255,255,255); tv-highlight-color: rgb(255,255,255);}} 
                            @media tv-template and (tv-theme:light) {.text {font-size: 40; text-align: center; color: black;} .label{tv-tint-color: rgb(0,0,0); tv-highlight-color: rgb(0,0,0);}} 
                            @media tv-template and (tv-theme:dark) {.nextButton{font-size: 40; text-align: center; color: white; background-color: rgb (255,255,255);}} 
                            @media tv-template and (tv-theme:light) {.nextButton{font-size: 40; text-align: center; color: black; background-color: rgb (0,0,0);}}
                        </style>
                    </head>
                    <stackTemplate>
                        <banner>
                            <title>Библиотека</title>
                        </banner>
                        <collectionList>
                            <shelf>
                                <section>
                                    ${filters}
                                </section>
                            </shelf>
                            <separator>
                                <button onselect="KP.getSort();">
                                    <text>${sort.title} <badge class="label" src="resource://button-dropdown" /></text>
                                </button>
                            </separator>
                            <grid>
                                <section id="items">
                                    <activityIndicator></activityIndicator>
                                </section>
                            </grid>
                        </collectionList>
                    </stackTemplate>
                </document>`
    },

    actorPage(options, sort) {
        return `<document>
                    <head>
                        <style>
                            @media tv-template and (tv-theme:dark) {.nextButton{font-size: 40; text-align: center; color: white; background-color: rgb (255,255,255);}} 
                            @media tv-template and (tv-theme:light) {.nextButton{font-size: 40; text-align: center; color: black; background-color: rgb (0,0,0);}}
                        </style>
                    </head>
                    <stackTemplate>
                        ${this.fragments.actorBanner(options)}
                        <collectionList>
                            <separator>
                                <button onselect="KP.getSort('actor');">
                                    <text>${sort.title} <badge style="tv-tint-color: rgb(255,255,255);" src="resource://button-dropdown" /></text>
                                </button>
                            </separator>
                            <grid>
                                <section id="items">
                                    <activityIndicator></activityIndicator>
                                </section>
                            </grid>
                        </collectionList>
                    </stackTemplate>
                </document>`
    },

    settingsPage(deviceName) {
        var settingsList = Object.keys(settingKeys).map((key, index) => {
            var option = AppSettings.get(key);
            var relatedContetnt = (settingKeysLocal[key].desc != '') ? '<relatedContent><lockup><title class="title">' + settingKeysLocal[key].title + '</title><description style="tv-text-max-lines: 15;">' + settingKeysLocal[key].desc + '</description></lockup></relatedContent>' : '';
            return '<listItemLockup onselect="KP.getSettingsDropdown (\'' + key + '\', \'' + (index + 1) + '\')"><title>' + settingKeysLocal[key].title + '</title><decorationLabel>' + (option ? option.name : 'not loaded') + '</decorationLabel>' + relatedContetnt + '</listItemLockup>';
        });
        var kinopoiskKey = AppStorage.getItem(KEYS.kinopoiskKey) ? 'Да' : 'Нет';

        var bootUrl = baseURL + "application.js";
        var selectedBootUrl = AppSettings.getDefaultUrl();

        var selectedBoot = selectedBootUrl == bootUrl ? 'Да' : 'Нет';

        var isQinoa = Device.appIdentifier.includes('qinoa');

        return `<document>
                    <head>
                        <style>
                            .title {padding-top: 180;}
                        </style>
                    </head>
                    <compilationTemplate>
                        <list style="padding-top: 0">
                            <relatedContent></relatedContent>
                            <header><title>Настройки</title></header>
                            <section>
                                <listItemLockup>
                                    <title>Информация о пользователе</title>
                                    <relatedContent>
                                        <lockup>
                                            <title class="title">Информация о пользователе</title>
                                            <description id="userInfo" style="tv-text-max-lines: 15;">\nПользователь: -\nДата регистрации: -\n\n\nПодписка закончится: -\nОсталось: -</description>
                                        </lockup>
                                    </relatedContent>
                                </listItemLockup>
                                <listItemLockup onselect="KP.showCreationDeviceName()">
                                    <title>Имя устройства</title>
                                    <decorationLabel id="device">${deviceName}</decorationLabel>
                                </listItemLockup>
                                <listItemLockup onselect="KPSpeed.initUI()">
                                    <title>KP Speed</title>
                                    <img style="tv-position: right" src="${baseURL}img/speedtestOrange.png" width="75" height="75" />
                                    <relatedContent>
                                        <lockup>
                                            <title class="title">KP Speed</title>
                                            <description style="tv-text-max-lines: 15;">\nЗамер скорости до серверов KP.</description>
                                        </lockup>
                                    </relatedContent>
                                </listItemLockup>
                                <listItemLockup id ="video" onselect="KP.videoWizard(1)">
                                    <title>Настройка видео</title>
                                    <relatedContent>
                                        <lockup>
                                            <title class="title">Видео настройки</title>
                                            <description  id="userDeviceSettings" style="tv-text-max-lines: 22; padding-right: 10">-</description>
                                        </lockup>
                                    </relatedContent>
                                </listItemLockup>
                                ${settingsList}
                                <listItemLockup onselect="KP.unlink()">
                                    <title>Отвязать устройство</title>
                                    <relatedContent>
                                        <lockup>
                                            <title class="title">Отвязать устройство</title>
                                            <description style="tv-text-max-lines: 15;">\nУдалить привязку данного устройства из текущего аккаунта.</description>
                                        </lockup>
                                    </relatedContent>
                                </listItemLockup>
                                <listItemLockup onselect="KP.showAddKinopoiskKey()">
                                    <title>Ключ кинопоиска</title>
                                    <decorationLabel id="kinopoiskKey">${kinopoiskKey}</decorationLabel>
                                    <relatedContent>
                                        <lockup>
                                            <title class="title">Ключ кинопоиска</title>
                                            <description style="tv-text-max-lines: 15;">\nДля получения ключа зарегистрируйтесь на https://kinopoiskapiunofficial.tech/ \nПосле регистрации на данном сайте в профиле этого сайта вы получите API-KEY, его необходимо ввести здесь.\n\n Данный ключ даст вам возможность видеть фото актеров, кадры из фильмов и интересные факты.</description>
                                        </lockup>
                                    </relatedContent>
                                </listItemLockup>
                                <listItemLockup onselect="Trakt.traktOauth()">
                                    <title>Подключение Trakt.tv</title>
                                    <img style="tv-position: right" src="${baseURL}img/trakt.png" width="75" height="75" />
                                    <relatedContent>
                                        <lockup>
                                            <title class="title">Сервис TraktTV</title>
                                            <description style="tv-text-max-lines: 15;">\nНа текущий момент при подключении сервиса появляется возможность:\n— синхронизировать просмотр и watchlist с сервисом TraktTV\n— получать рекомендации на основе просмотров\n\n!!!Сервис TraktTV сильно отделен от сервиса KinoPub, что сказывается на общем интерфейсе взаимодействия с сервисом. Просьба учитывать этот факт при использовании!!!</description>
                                        </lockup>
                                    </relatedContent>
                                </listItemLockup>
                                ${!isQinoa ? `<listItemLockup onselect="KP.toggleDefaultBootUrl()">
                                    <title>Открывать приложение автоматически</title>
                                    <decorationLabel id="defaultBootUrl">${selectedBoot}</decorationLabel>
                                    <relatedContent>
                                        <lockup>
                                            <title class="title">Открывать приложение автоматически</title>
                                            <description style="tv-text-max-lines: 15;">\nВключите, если вы хотите открывать плейлист автоматически при запуске приложения. Данная настройка ничего не делает в старых приложениях</description>
                                        </lockup>
                                    </relatedContent>
                                </listItemLockup>` : ''}
                                <listItemLockup>
                                    <title>Версия ${APP_VERSION}</title>
                                    <relatedContent>
                                        <lockup>
                                            <title class="title">История изменений</title>
                                            <description id="changelog" allowsZooming = "true" onselect="KP.showHistory()" style="tv-text-max-lines: 22; padding-right: 10">Список изменений загружается</description>
                                        </lockup>
                                    </relatedContent>
                                </listItemLockup>
                            </section>
                        </list>
                    </compilationTemplate>
                </document>`;
    },

    nextPage(items, options) {
        var title = options.title || 'Результаты'
        if (options.page && options.totalPages) {
            title += ` (${options.page} / ${options.totalPages})`;
        }
        return `<document>
                    <head>
                        <style>
                            @media tv-template and (tv-theme:dark) {.nextButton{font-size: 40; text-align: center; color: white; background-color: rgb (255,255,255);}} 
                            @media tv-template and (tv-theme:light) {.nextButton{font-size: 40; text-align: center; color: black; background-color: rgb (0,0,0);}}
                        </style>
                    </head>
                    <stackTemplate>
                        <banner>
                            <title>${title}</title>
                        </banner>
                        <collectionList>
                            <grid>
                                <section>${items}</section>
                            </grid>
                        </collectionList>
                    </stackTemplate>
                </document>`;
    },

    TVPage(channels) {
        return `<document>
                    <head>
                        <style>
                            @media tv-template and (tv-theme:dark) {.text {tv-position: center; tv-align: center; color: white;}} 
                            @media tv-template and (tv-theme:light) {.text {tv-position: center; tv-align: center; color: black;} }
                        </style>
                    </head>
                    <stackTemplate>
                        <banner>
                            <title>ТВ</title>
                        </banner>
                        <collectionList>
                            <grid>
                                <header><title>Плейлисты (только ОТТ и edem)</title></header>
                                <section id="playlists">
                                </section>
                            </grid>
                            <grid>
                                <header><title>Каналы Kinopub</title></header>
                                <section id="channels">
                                ${channels}
                                </section>
                            </grid>
                        </collectionList>
                    </stackTemplate>
                </document>`;
    },

    textFieldForm(options) {
        return `<document>
                    <formTemplate>
                        <banner>
                            <title>${options.title}</title>
                            <description> </description>
                        </banner>
                        <textField>${options.placeholder}</textField>
                        <footer>
                            <button><text>${options.button}</text></button>
                        </footer>
                    </formTemplate>
                </document>`
    },

    alertWithButtons(title, values, key) {
        var buttons = '';
        Object.values(values).map(value => {
            if (key) { var autoHighlight = value.id == AppSettings.get(key).id ? 'autoHighlight="true"' : ''; }
            buttons += '<button id="' + value.id + '" ' + (autoHighlight || '') + ' textTitle="' + value.name + '"><text>' + value.name + '</text></button>'
        });
        return `<document>
                    <alertTemplate>
                        <title>${title}</title>
                        ${buttons}
                    </alertTemplate>
                </document>`;
    },

    fragments: {
        itemsShelf(options) {
            if (options.movies.length < 1) { return ''; }
            return `<shelf class="stack" id="${options.item.id}">
                        <header><title>${options.item.title}</title></header>
                        <section>
                            ${options.movies}
                        </section>
                    </shelf>`;
        },
        itemLoading(option) {
            return `<shelf class="stack" id="${option.id}">
                        <header><title>${option.title}</title></header>
                        <section>
                            <lockup>
                                <img src ="" width="250" height="376" />
                                    <overlay>
                                        <description class="nextButton">Загрузка</description>
                                    </overlay>
                            </lockup>
                        </section>
                    </shelf>`;
        },
        itemBanner(item) {
            var settings = AppSettings.getAll();
            var titles = Utils.splitTitle(item.title);
            var xml = `<lockup style="padding-bottom: 40" onplay="play(null, null, ${item.id});" onselect="KP.loadItemDetail(${item.id}, '${item.type}', '${encodeURIComponent(titles.title)}')">
                    <img style="border-radius:10; padding-bottom:65; tv-tint-color: rgba(0, 0, 0, 0.3));" src="${Utils.replaceCdn(item.posters.wide)}" width="1300" height="750" />
                    <overlay>
                        <img style="tv-position: bottom-left; margin: 0 20 0 0;" src="${Utils.replaceCdn(item.posters.medium)}" width="250" height="376" />
                        <title style="font-size: 50; margin: 0 0 0 0; text-shadow: 2px 1px 0px black;">${titles.title}</title>`;
            if (settings.showRatingStroke.id) {
                var imdbRating, kinopoiskRating, kinopubRating;
                if (item.imdb_rating && parseInt(item.imdb_rating) > 0) {
                    imdbRating = Math.round(item.imdb_rating * 10) / 10
                }
                if (item.kinopoisk_rating && parseInt(item.kinopoisk_rating) > 0) {
                    kinopoiskRating = Math.round(item.kinopoisk_rating * 10) / 10
                }
                if (item.rating_percentage && parseInt(item.rating_percentage) > 0) {
                    kinopubRating = Math.round(item.rating_percentage) / 10
                }
                var imdb = '<img src="' + baseURL + 'img/imdb.png" width="30" height="30" /><text> ' + (imdbRating || 0).toFixed(1) + '   </text>';
                var kinopoisk = '<img src="' + baseURL + 'img/kinopoisk.png" width="30" height="30" /><text> ' + (kinopoiskRating || 0).toFixed(1) + '   </text>';
                var kinopub = '<img src="' + baseURL + 'img/kinopub.png" width="30" height="30" /><text> ' + (kinopubRating || 0).toFixed(1) + ' </text>';
                xml += `<row style="tv-position: bottom-right; margin: 0 0 3 0; text-shadow: 2px 1px 0px black;">${imdb}${kinopoisk}${kinopub}</row>`;
            }
            if (titles.subtitle) {
                xml += `<subtitle style="font-size: 30; margin: 0 0 20 0; text-shadow: 2px 1px 0px black;">${titles.subtitle}</subtitle>`;
            }
            xml += `</overlay></lockup>`;
            return xml;
        },
        itemPoster(item, width, height, shelf, historyItem) {
            var settings = AppSettings.getAll();
            var titles = Utils.splitTitle(item.title);
            width = width || '250';
            height = height || '376';
            var subscribedText = '';
            var subscribedStyle = 'tv-tint-color: linear-gradient(top, 0.33, transparent, 0.66, rgba(255,255,255,0.7), rgba(255,255,255,1.0));';
            var newEp = '';
            var onHold = '';
            if (item.new) {
                //newEp = '<title style="font-size: 30; tv-position: top-right; text-align: center; margin: -36 -30 0 70; color: white; background-color: rgba(219, 15, 9, 0.7);">' + item.new + '</title>'
                newEp = '<textBadge style="font-size: 30; tv-position: top-right; text-align: center; margin: -30 -30 0 70; color: rgba(255, 244, 228, 1); tv-tint-color: rgba(219, 15, 9, 0.7); background-color: rgba(219, 15, 9, 0.7); border-radius: 0;">' + item.new + '</textBadge>';
            } else if (historyItem && Utils.isSerial(item)) {
                newEp = '<textBadge style="font-size: 30; tv-position: top-right; text-align: center; margin: -30 -30 0 70; color: rgba(255, 244, 228, 1); tv-tint-color: rgba(219, 15, 9, 0.7); background-color: rgba(219, 15, 9, 0.7); border-radius: 0;">s' + historyItem.media.snumber + 'e' + historyItem.media.number + '</textBadge>';
            } else if (item.subscribed) {
                subscribedStyle = 'tv-tint-color: linear-gradient(top, transparent, transparent 50%, rgba(0, 0, 0, 0.9));';
                subscribedText = '<text style="font-size: 30; tv-align: center; tv-position: bottom; color: white; margin: 0 0 15 0; text-shadow: 2px 1px 0px black;">СМОТРЮ</text>';
            }

            if (historyItem) {
                onHold = 'onholdselect="KP.showDeleteHistory(' + historyItem.item.id + ', ' + historyItem.media.id + ', ' + Utils.isSerial(item) + ');"'
            }

            var xml = `<lockup onplay="play(null, null, ${item.id});" onselect="KP.loadItemDetail(${item.id}, '${item.type}', '${encodeURIComponent(titles.title)}')" ${onHold}>
                            <img style="tv-placeholder:movie; ${subscribedStyle} " src="${Utils.replaceCdn(item.posters.medium)}" width="${width}" height="${height}" /><overlay>${subscribedText}${newEp}`; //tv-tint-color: linear-gradient(top, 0.33, transparent, 0.66, rgba(255,255,255,0.7), rgba(255,255,255,1.0));
            if (settings.showRatingStroke.id && item.new == undefined && historyItem == undefined) {
                var imdbRating, kinopoiskRating, kinopubRating;
                if (item.imdb_rating && parseInt(item.imdb_rating) > 0) {
                    imdbRating = Math.round(item.imdb_rating * 10) / 10
                }
                if (item.kinopoisk_rating && parseInt(item.kinopoisk_rating) > 0) {
                    kinopoiskRating = Math.round(item.kinopoisk_rating * 10) / 10
                }
                if (item.rating_percentage && parseInt(item.rating_percentage) > 0) {
                    kinopubRating = Math.round(item.rating_percentage) / 10
                }
                var imdb = '<img src="' + baseURL + 'img/imdb.png" width="25" height="25" /><text> ' + (imdbRating || 0).toFixed(1) + '   </text>';
                var kinopoisk = '<img src="' + baseURL + 'img/kinopoisk.png" width="25" height="25" /><text> ' + (kinopoiskRating || 0).toFixed(1) + '   </text>';
                var kinopub = '<img src="' + baseURL + 'img/kinopub.png" width="25" height="25" /><text> ' + (kinopubRating || 0).toFixed(1) + ' </text>';
                var rowStyle = "font-size: 22;";
                if (shelf) {
                    rowStyle = "font-size: 14;"
                }
                xml += '<row style="tv-align: center; tv-position: bottom; color: white; text-shadow: 2px 1px 0px black; margin: 0 0 -20 0;' + rowStyle + '">' + imdb + kinopoisk + kinopub + '</row>';
            }
            if (historyItem) {
                var rusDate = Utils.rusDate(historyItem.last_seen * 1000, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
                var subtitle = '<subtitle>' + rusDate + '</subtitle>'
            }
            xml += `</overlay><title>${titles.title}</title>${subtitle || ''}</lockup>`;
            return xml;
        },
        itemCollection(item) {
            var options = { items: 'collections', from: 'view', title: item.title, filters: { id: item.id } }
            return `<lockup onselect="KP.nextPage('${encodeURIComponent(JSON.stringify(options))}')">
                        <img src="${Utils.replaceCdn(item.posters.big)}" width="250" height="376" />
                        <title>${item.title}</title>
                    </lockup>`;
        },
        itemNext(options) {
            return `<lockup onselect="KP.nextPage('${encodeURIComponent(JSON.stringify(options))}')">
                        <img src ="" width="250" height="376" />
                            <overlay>
                                <description class="nextButton">Далее</description>
                            </overlay>
                    </lockup>`;
        },
        commentItems(result) {
            var comments = '';
            result.comments.forEach(comment => {
                if (!comment.deleted) {
                    var rusDate = Utils.rusDate(comment.created * 1000);
                    var margin = comment.depth > 7 ? 7 * 50 : comment.depth * 50;
                    var message = Utils.spoiler(comment.message).replace(/"/g, "").replace(/>/g, "&lt;").replace(/</g, "&gt;").replace(/'/g, "").replace(/[\r\n]+/gm, " ");
                    var spoilerMessage = Utils.spoiler(comment.message, true).replace(/"/g, "").replace(/>/g, "&lt;").replace(/</g, "&gt;").replace(/'/g, "").replace(/[\r\n]+/gm, " ");
                    comments += '<listItemLockup onselect="showText(\'' + spoilerMessage + '\', \'' + comment.user.name + '\')"><img style="margin: 0 0 0 ' + margin + '" src="' + comment.user.avatar + '?s=200&d=identicon" width="100" height="100"/><title>' + comment.user.name + '</title><subtitle>' + rusDate + '</subtitle><relatedContent><lockup><description style="tv-text-max-lines: 20;">' + message + '</description></lockup></relatedContent></listItemLockup>';
                }
            });
            return comments;
        },
        list(title) {
            return `<list>
                        <section>
                            <header>
                                <title>${title}</title>
                            </header>
                        </section>
                    </list>`;
        },
        itemsLookup(items, options, count) {
            var id = options.type || options.id
            var idBookmark = (options.id) ? 'bookmark' + options.id : '';
            return `<listItemLockup id="${idBookmark}">
                        <title>${options.title2}</title>
                        <decorationLabel id="count${id}">${count}</decorationLabel>
                        <relatedContent>
                            <grid>
                                <section id="${id}">${items}</section>
                            </grid>
                        </relatedContent>
                    </listItemLockup>`
        },
        lockup(option, index) {
            var title = (option.selected == '') ? option.title : option.selected;
            return `<lockup onselect="KP.getDropDown('${index}');">
                        <overlay>
                            <description class="text">${title}  <badge class="label" height="23" width="40" src="resource://button-dropdown" /></description>
                        </overlay>
                        <img src ="" width="300" height="100" style="border-radius: large;"/>
                    </lockup>`
        },
        actorBanner(options) {
            if (options.profile_path || options.biography) {
                var biography = options.biography.replace(/"/g, "").replace(/>/g, "&lt;").replace(/</g, "&gt;").replace(/'/g, "").replace(/[\r\n]+/gm, " ");
                var template = `<background></background>
                                <identityBanner>
                                    <heroImg style="width: 200; height:300; border-radius: large;" src="${options.profile_path}"/>
                                    <title>${options.name}</title>
                                    <description onselect="showText('${biography}', '${options.name}')" allowsZooming="true" style="font-size: 30; tv-text-max-lines: 5;">${biography}</description>
                                </identityBanner>`
            } else {
                var template = `<banner id="biography">
                                    <title>${options.name}</title>
                                </banner>`
            }
            return template;
        },
        bookmarksButton(itemID, folder, checked) {
            checked = checked ? '<badge src="resource://button-checkmark" /> ' : '';
            return `<button onselect="KP.addToBookmark('${itemID}', '${folder.id}')"><text>${checked}${folder.title}</text></button>`
        },
        kpChannels(channel) {
            return `<lockup onselect="KPlayer.playTV('${channel.stream}', ' ${channel.title}', '${channel.logos.s}')">
                        <img src ="${Utils.replaceCdn(channel.logos.s)}" width="160" height="120" />
                        <title>${channel.title}</title>
                    </lockup>`;
        },
        playlists(item) {
            var title = item.title.replace(/"/g, "").replace(/>/g, "&lt;").replace(/</g, "&gt;").replace(/'/g, "").replace(/[\r\n]+/gm, " ");
            return `<lockup onselect="TV.parseM3U('${item.url}', '${title}')">
                        <overlay>
                            <title class="text">${title}</title>
                        </overlay>
                        <img src ="" width="160" height="160" />
                    </lockup>`;
        }
    }
};

var MovieTemplates = {
    quality: {
        "480": "SD",
        "720": "HD",
        "1080": "FULL HD",
        "2160": "4K"
    },

    fragments: {
        badge(text) { return '<textBadge class="metadata-tint-color" >' + text + '</textBadge>'; },
        // OLD '<textBadge>4K</textBadge>'
        ratingCard(title, rating, rating2, votes, imdb) {
            if (imdb != undefined) { var onselect = 'onselect="showRating( \'' + imdb + '\',' + rating2 + ', \'movie\')"'; }
            if (title == 'Kinopub') { var onselect = 'onselect="KP.setRating(' + imdb + ')"'; }
            return '<ratingCard ' + (onselect || '') + '><title style="font-size: 40">' + rating + ' / 10</title><text>' + title + '</text><ratingBadge value="' + rating2 + '"></ratingBadge><description style="font-size: 20">Основано на ' + votes.toLocaleString() + ' голосов</description></ratingCard>';
        },
        bestComment(result) {
            var maxRating = Utils.getMax(result.comments, "rating");
            var rusDate = Utils.rusDate(maxRating.created * 1000);
            var message = Utils.replaceText(maxRating.message);
            return '<reviewCard onselect="showText(\'' + message + '\', \'' + maxRating.user.name + '\')"><title>Лучший комментарий</title><text>' + rusDate + '</text><description allowsZooming="true" style="tv-text-max-lines: 3;">' + message + '</description><text>' + maxRating.user.name + '</text></reviewCard>';
        },
        similar(result, title) {
            title = title || 'Рекомендуемое';
            var similarMovies = "";
            result.items.forEach(item => {
                similarMovies += Templates.fragments.itemPoster(item, '182', '274', 'true');
            });
            return (similarMovies != '') ? '<shelf style="padding-top: 60"><header><title>' + title + '</title></header><section>' + similarMovies + '</section></shelf>' : '';
        },
        collectionsCard(item) {
            var rusDate = Utils.rusDate(item.updated * 1000);
            var options = { items: 'collections', from: 'view', title: item.title, filters: { id: item.id } }
            return '<reviewCard onselect="KP.nextPage(\'' + encodeURIComponent(JSON.stringify(options)) + '\')"><title>' + item.title + '</title><text>Обновлено ' + rusDate + '</text><text>Подписчиков ' + item.watchers + '</text><text>Просмотров ' + item.views + '</text></reviewCard>';
        },
        screenshotButton(result, isNew) {
            return (!isNew) ? '<buttonLockup class="smallButton" id="screenshotButton" onselect="KP.showScreenshots(\'' + result.item.kinopoisk + '\');"><text>КАДРЫ</text><title>Кадры из сериала</title></buttonLockup>' : null;
        },
        seriesButtonAndSeasons(result, isNew, callback, updateCallback) {
            var _lastEpisodeButton;
            var allSeasons;
            result.item.seasons.forEach((season, sIndex) => {
                var countWatchedSeries = 0;
                season.episodes.forEach((episode, eIndex) => {
                    if (episode.watched > 0) { countWatchedSeries++; }
                    if (season.watching.status < 1 && episode.watching.status < 1 && _lastEpisodeButton == undefined) {
                        console.log(episode.number);
                        if (isNew) {
                            _lastEpisodeButton = '<button style="width: 256; padding: 0" id="lastEpisodeButton" onselect="KP.stopUberTrailer(); play(' + eIndex + ', ' + sIndex + ');" class="button playbutton banner-left"><text><badge src="resource://button-play" style="margin: 0 0 -6"/> Смотреть s' + season.number + 'e' + episode.number + '</text></button>';
                        } else {
                            _lastEpisodeButton = '<buttonLockup  id="lastEpisodeButton" onselect="play(' + eIndex + ', ' + sIndex + ');"><badge src="resource://button-play" /><title>Смотреть\ns' + season.number + 'e' + episode.number + '</title></buttonLockup>';
                        }
                    }
                });
                var autoHighlight = (countWatchedSeries == season.episodes.length) ? '' : 'autoHighlight="true"';
                var overlay = (countWatchedSeries == season.episodes.length) ? '<overlay id="1" style="padding: 0"><badge style="tv-align: right; tv-position: bottom-right; margin: 0;" src="resource://overlay-checkmark" /></overlay>' : '<overlay id="0" style="padding: 0"><title style="font-size: 20; tv-position: top-right; text-align: center; margin: 0 0 0 35; color: white; background-color: rgba(219, 15, 9, 0.7);">' + (season.episodes.length - countWatchedSeries) + '</title></overlay>';
                if (updateCallback) { updateCallback(overlay, sIndex); }
                allSeasons += '<lockup id = "season' + season.number + '" ' + autoHighlight + ' onholdselect="KP.toggleWatching(' + result.item.id + ', null, ' + season.number + '); KP.changeSeasonButton (' + sIndex + ');" onselect="KP.stopUberTrailer(); KP.episodesPage(' + sIndex + ')" ><img id = "img' + season.number + '" src ="' + Utils.replaceCdn(result.item.posters.big) + '" width="182" height="274" /><title>' + season.title + ' Сезон №' + season.number + '</title>' + overlay + '</lockup>';
            });
            if (_lastEpisodeButton == undefined) {
                if (isNew) {
                    _lastEpisodeButton = '<button style="width: 256; padding: 0" id="lastEpisodeButton" onselect="KP.stopUberTrailer(); play();" class="button playbutton banner-left"><text><badge src="resource://button-play" style="margin: 0 0 -6"/> Смотреть s' + result.item.seasons[0].number + 'e' + result.item.seasons[0].episodes[0].number + '</text></button>';
                } else {
                    _lastEpisodeButton = '<buttonLockup  id="lastEpisodeButton" onselect="play();"><badge src="resource://button-play" /><title>Смотреть\ns' + result.item.seasons[0].number + 'e' + result.item.seasons[0].episodes[0].number + '</title></buttonLockup>';
                }
            }
            if (updateCallback) { updateCallback(_lastEpisodeButton, null); }
            if (callback) {
                var lastEpisodeButton = (isNew) ? '<row style="margin: 10 0 0 0;" class="banner-left">' + _lastEpisodeButton + '</row>' : _lastEpisodeButton;
                callback(lastEpisodeButton, allSeasons, result.item.seasons[0].number, result.item.seasons[0].episodes[0].number);
            }
        },
        episodesShelf(episodes, isSerial) {
            var title = isSerial ? "Сезоны" : "Серии фильма";
            return '<shelf style="padding-top: 60"><header><title>' + title + '</title></header><section>' + episodes + '</section></shelf>';
        },
        tmdbSeason(season) {
            if (season.air_date) {
                var currentDate = new Date()
                var rusDate = Utils.rusDate(season.air_date, { year: 'numeric', month: 'numeric', day: 'numeric' });
                //var dateDesc = '<description style="color: white; tv-position:top; tv-align: center; font-size: 15; margin: 10; text-shadow: 2px 1px 0px black;">' + rusDate + '</description>'
                var dateDesc = '<subtitle>' + rusDate + '</subtitle>';
                var title = (currentDate > rusDate) ? 'Вышел' : 'Скоро';
            } else {
                var title = "Скоро";
            }
            var _text = 'Дата выхода: ' + (rusDate || 'неизвестна') + '.\nИнформация о дате выхода сезона предоставлена сервисом TMDB.\nЕсли по данной информации сезон уже вышел, а его нет на кинопабе, значит есть определенные обстоятельства.\nЗа подробностями обращайтесь в Telegram чаты.';
            var _title = 'Сезон №' + season.season_number;
            return '<lockup onselect="showText(\'' + _text + '\',\'' + _title + '\')"><overlay><title style="color: white; tv-position:top; tv-align: center; font-size: 30; margin: 10; text-shadow: 2px 1px 0px black;">' + title + '</title></overlay><img style="tv-tint-color: linear-gradient(top, rgba(0,0,0,0.8), 0.10, rgba(0,0,0,0.6), 0.30, rgba(0,0,0,0.3), 0.50, rgba(0,0,0,0.1), transparent);" src ="' + theMovieDB.imageUrl + season.poster_path + '" width="182" height="274" /><title>Сезон №' + season.season_number + '</title>' + (dateDesc || '') + '</lockup>';
        },
        episode(id, season, episode, index) {
            var episodeNumber = episode.number;
            if (episode.audios) {
                var audioTracks = episode.audios.map((audio, index) => {
                    var audioTrackString = index + 1 + ". ";
                    if (audio.lang) { audioTrackString += (LanguagesLocal[audio.lang] || audio.lang); }
                    if (audio.codec && audio.codec == "ac3") { audioTrackString += ' (' + audio.codec.toUpperCase() + ')'; }
                    if (audio.type || audio.author) {
                        audioTrackString += " — "
                        if (audio.type && audio.type.title) { audioTrackString += audio.type.title + " "; }
                        if (audio.author && audio.author.title) { audioTrackString += "(" + audio.author.title + ")"; }
                    }
                    return audioTrackString;
                });
                audioTracks = audioTracks.join("\n")
                var audioTrackInfo = '<title class="still" style="font-size: 30;">Дорожки</title><description class="still" style="tv-text-max-lines: 10; font-size: 25;" handlesOverflow="true" onselect="showText(\'' + audioTracks + '\', \'Дорожки\')">' + audioTracks + '</description>';
            }
            var titles = Utils.splitTitle(episode.title);
            var episondeNameRus = (titles.title) ? titles.title : 'Серия №' + episode.number;
            var episodeNameEng = (titles.subtitle) ? '<subtitle>' + titles.subtitle + '</subtitle>' : '';
            var autoHighlight = (episode.watched > 0) ? '' : 'autoHighlight="true"';
            var labelId = (episode.watched > 0) ? '1' : '0';
            var labelWatch = '';
            switch (episode.watched) {
                case -1:
                    labelWatch = '  ●';
                    break;
                case 0:
                    labelWatch = '  ◑';
                    break;
                default:
                    break;
            }
            var quality = episode.files.length != 0 ? '<overlay><textBadge>' + MovieTemplates.quality[episode.files[0].quality.replace('p', '')] + '</textBadge></overlay>' : '<overlay><textBadge>Серия в обработке</textBadge></overlay>';
            return `<listItemLockup episode="${index}" ${autoHighlight} onholdselect="KP.toggleWatching(${id},${episode.number}, ${season.number}); KP.changeEpisodeButton(${index}, '${formatDuration(episode.duration)}');">
                        <ordinal>${episodeNumber}</ordinal>
                        <title>${episondeNameRus}</title>
                        ${episodeNameEng}
                        <decorationLabel id ="${labelId}">${formatDuration(episode.duration)}${labelWatch}</decorationLabel>
                        <relatedContent>
                            <itemBanner id="episode${index}">
                                <heroImg style="margin-top:300; height: 400;" src="${episode.thumbnail}"/>${quality}
                                ${audioTrackInfo}
                            </itemBanner>
                        </relatedContent>
                    </listItemLockup>`
        }
    },

    pageVideo(result, isNew) {
        var settings = AppSettings.getAll()
        var isSerial = (result.item.type == 'serial' || result.item.type == 'docuserial' || result.item.type == 'tvshow');
        console.log('isSerial: ' + isSerial);

        if (isNew) {
            var bookmarkStyle = (isSerial) ? 'style="margin-top: 10; padding: 0; width: 157"' : 'style="margin-top: 15"';
            var bookmarksButton = '<button onselect="KP.showBookmarks(' + result.item.id + ');" class="button addtolibrary banner-left" ' + bookmarkStyle + '><text>В закладки</text></button>';
        } else {
            var bookmarksButton = '<buttonLockup class="smallButton" onselect="KP.showBookmarks(' + result.item.id + ');"><badge src="resource://button-add" /><title>В закладки</title></buttonLockup>';
        }

        if (!isSerial) {
            // ----- MOVIES
            // var videoNumber = result.item.videos.findIndex(video => video.watching.status < 1);
            // if (videoNumber == -1) { videoNumber = 0 }
            if (isNew) {
                var playVideoButton = '<button onselect="KP.stopUberTrailer(); play();" class="button playbutton banner-left"><text><badge src="resource://button-play" style="margin:0 0 -6"/> Смотреть</text> </button>';
            } else {
                var playVideoButton = '<buttonLockup onselect="play();"><badge src="resource://button-play" /><title>Смотреть</title></buttonLockup>';
            }
            var moreVideos = "";
            var watchedButton = "";
            result.item.videos.forEach((video, index) => {
                if (video.watching.status <= 0) {
                    if (isNew) {
                        playVideoButton = '<row style="margin: 10 0 0 0;" class="banner-left"><button style="margin-top: 10; padding: 0; width: 157" onselect="KP.stopUberTrailer(); play();" class="button playbutton banner-left"><text><badge src="resource://button-play" style="margin:0 0 -6"/> Смотреть</text> </button><button style="padding: 0; width: 80; margin-top: 10" class="button playbutton banner-left" id ="watchingButton" onselect="KP.toggleWatching(' + result.item.id + '); KP.changeWatchingButton();" ><text><badge src="resource://button-checkmark" /></text></button></row>';
                    } else {
                        watchedButton = '<buttonLockup class="smallButton" id ="watchingButton" onselect="KP.toggleWatching(' + result.item.id + '); KP.changeWatchingButton();"><badge src="resource://button-checkmark" /><title>Отметить просмотр</title></buttonLockup>';
                    }
                }
                if (video.watching.status == 1) { var style = 'style="tv-tint-color: rgba(0,0,0,0.5);"'; }
                var watched = (video.watching.status < 1) ? '<overlay id="0"></overlay>' : '<overlay id="1"><badge style="tv-align: center; tv-position: center; tv-tint-color: rgb(255,255,255); tv-highlight-color: rgb(255,255,255);" src="resource://button-checkmark" /></overlay>';
                moreVideos += '<lockup onholdselect="KP.toggleWatching (' + result.item.id + ', ' + video.number + '); KP.changeSeasonButton(' + index + ');" onselect="KP.stopUberTrailer(); play(' + index + ');"><img ' + (style || '') + ' src="' + video.thumbnail + '" width="400" height="250" />' + watched + '<title>' + video.title + '</title></lockup>'
            });
            // -----
        } else {
            // ----- SERIES
            var lastEpisodeButton;
            var allSeasons;
            var lastSeason;
            var lastEpisode;
            this.fragments.seriesButtonAndSeasons(result, isNew, function(button, seasons, lastSeason, lastEpisode) {
                lastEpisodeButton = button;
                allSeasons = seasons;
                lastSeason = lastSeason;
                lastEpisode = lastEpisode;
            });

            if (isNew) {
                var currentWBadge = (result.item.subscribed) ? 'button-rated' : 'button-rate';
                var newWBadge = (result.item.subscribed) ? 'button-rate' : 'button-rated';
                var watchListButton = '<button style="padding: 0; width: 80; margin-top: 10" class="button playbutton banner-left" id ="changeButtonUber" onselect="KP.addToWatchList(' + result.item.id + '); KP.changeButtonUber(' + result.item.id + ', \'' + newWBadge + '\', \'' + currentWBadge + '\');"><badge src="resource://' + currentWBadge + '" /></button>';
            } else {
                var currentWBadge = (result.item.subscribed) ? 'button-rated' : 'button-rate';
                var newWBadge = (result.item.subscribed) ? 'button-rate' : 'button-rated';
                var currentTitle = (result.item.subscribed) ? 'Не буду смотреть' : 'Буду смотреть';
                var newTitle = (result.item.subscribed) ? 'Буду смотреть' : 'Не буду смотреть';
                var watchListButton = '<buttonLockup class="smallButton" id ="changeButton" onselect="KP.addToWatchList(' + result.item.id + '); KP.changeButton(' + result.item.id + ', \'' + newWBadge + '\', \'' + currentWBadge + '\', \'' + newTitle + '\', \'' + currentTitle + '\');"><badge src="resource://' + currentWBadge + '" /><title>' + currentTitle + '</title></buttonLockup>';
            }

            if (isNew) {
                var shufflePlayButton = '<button style="margin-top: 10" id="shufflePlayButton" onselect="KP.stopUberTrailer(); playShuffle();"><text><badge src="resource://button-shuffle" style="margin: 0 0 -10"/> Случайно</text></button>';
            } else {
                var shufflePlayButton = '<buttonLockup class="smallButton" id="shufflePlayButton" onselect="playShuffle();"><badge src="resource://button-shuffle" /><title>Случайно</title></buttonLockup>';
            }
            if (isNew) {
                var fewEpButton = '<button style="margin-top: 10" id="fewEpButton" onselect="KP.stopUberTrailer(); KP.selectNumOfEp(' + lastEpisode + ', ' + lastSeason + ');"><text><badge src="resource://button-play" style="margin: 0 0 -10"/> Несколько</text></button>';
            } else {
                var fewEpButton = '<buttonLockup class="smallButton" id="fewEpButton" onselect="KP.selectNumOfEp(' + lastEpisode + ', ' + lastSeason + ');"><badge src="resource://button-play" /><title>Несколько эпизодов</title></buttonLockup>';
            }
            var playVideoButton = lastEpisodeButton + shufflePlayButton + fewEpButton
            if (isNew) {
                bookmarksButton = '<row style="margin: 10 0 0 0;" class="banner-left">' + bookmarksButton + watchListButton + '</row>';
            } else {
                var watchedButton = watchListButton
            }
            // -----
        }

        var titles = Utils.splitTitle(result.item.title);
        titles.title = Utils.replaceText(titles.title);
        if (titles.subtitle) {
            var style = (isNew) ? 'style="color: rgb(255,255,255);margin-left: 52; margin-bottom: 10; text-shadow: 2px 2px 2px 2px #000000;"' : 'style="color: rgb(255,255,255);"';
            var subtitle = '<subtitle ' + style + '>' + titles.subtitle + '</subtitle>';
        }

        var countries = result.item.countries.map(country => country = country.title);
        var genres = result.item.genres.map(genre => genre = genre.title);

        var trailer = '';
        if (result.item.trailer) {
            if (isNew) {
                //if (!settings.uberStrokeAutoTrailer.id) {
                trailer = '<button id="trailer" class="button playbutton banner-left" style="margin-top: 10" onselect="KP.stopUberTrailer(); playTrailer(\'' + result.item.trailer.url + '\');"><text><badge src="resource://button-preview" style="margin:0 0 -6"/> Трейлер</text></button>';
                //}
            } else {
                trailer = '<buttonLockup id="trailer" class="smallButton" onselect="playTrailer(\'' + result.item.trailer.url + '\');"><badge src="resource://button-preview" /><title>Трейлер</title></buttonLockup>';
            }
        }

        var commentBadge = "";
        if (result.item.comments > 0) {
            if (isNew) {
                //commentBadge = '<button onselect="KP.stopUberTrailer(); KP.showComments(' + result.item.id + ')" class="button addtolibrary banner-left" style="margin-top: 10"><text>Отзывы (' + result.item.comments + ')</text></button>';
            } else {
                commentBadge = '<buttonLockup class="smallButton" onselect="KP.showComments(' + result.item.id + ')"><badge src="resource://button-more" /><title>Отзывы (' + result.item.comments + ')</title></buttonLockup>';
            }
        }

        var hd = this.fragments.badge(this.quality[result.item.quality]);
        var ac3 = (result.item.ac3 != "0") ? this.fragments.badge('AC3') : "";
        var ad = (result.item.advert) ? this.fragments.badge('AD') : "";
        var quality = (result.item.poor_quality) ? this.fragments.badge('POOR QUALITY') : "";
        var finished = (result.item.finished) ? this.fragments.badge('FINISHED') : "";

        var cast = { director: result.item.director, actor: result.item.cast };
        var castListAllTemplate = '';
        var castListTemplate = '';
        for (index in cast) {
            if (!cast[index]) { continue; }
            var list = cast[index].split(', ');
            var styleTitle = (isNew) ? index == 'actor' ? 'class="info-title" style="margin-left: -32"' : 'class="info-title"' : '';
            var title = index == 'director' ? "Режиссер" : "Актеры";
            castListTemplate += '<info><header><title ' + styleTitle + '>' + title + '</title></header>';
            for (i = 0; i < list.length; i++) {
                castListAllTemplate += '<lockup onselect="KP.actorPage(\'' + encodeURIComponent(list[i]) + '\', null, \'' + index + '\');"><img style="border-radius: large; tv-placeholder: movie;" src="' + KINOPUB.actorImgUrl + md5(list[i]) + '.jpg" width="200" height="300"/><title>' + list[i] + '</title><subtitle>' + title + '</subtitle></lockup>';
                if (i > 2) { break; }
                var styleText = (isNew) ? 'class="info-text"' : '';
                castListTemplate += '<text ' + styleText + '>' + list[i] + '</text>';
            }
            castListTemplate += '</info>';
        }

        var moreVideosOrSeasonsShelf = "";
        if (!isSerial) {
            moreVideosOrSeasonsShelf = (result.item.videos.length > 1) ? this.fragments.episodesShelf(moreVideos, isSerial) : "";
        } else {
            moreVideosOrSeasonsShelf = this.fragments.episodesShelf(allSeasons, isSerial)
        }

        var styleRatings = (isNew) ? 'style="padding-top: 60"' : '';
        var ratings = '<shelf ' + styleRatings + ' id="ratings"><header><title>Рейтинги</title></header><section id="ratingSection">';
        if (result.item.rating_percentage || result.item.rating_votes || result.item.imdb_rating || result.item.imdb_votes || result.item.kinopoisk_rating || result.item.kinopoisk_votes) {
            if (result.item.rating_percentage && result.item.rating_votes) { ratings += this.fragments.ratingCard('Kinopub', Math.round(result.item.rating_percentage) / 10, Math.round(result.item.rating_percentage) / 100, result.item.rating_votes, result.item.id); }
            if (result.item.imdb_rating && result.item.imdb_votes) { ratings += this.fragments.ratingCard('IMDB', result.item.imdb_rating, Math.round(result.item.imdb_rating) / 10, result.item.imdb_votes); }
            if (result.item.kinopoisk_rating && result.item.kinopoisk_votes) { ratings += this.fragments.ratingCard('Кинопоиск', result.item.kinopoisk_rating.toFixed(1), Math.round(result.item.kinopoisk_rating) / 10, result.item.kinopoisk_votes); }
        }
        if (isNew) {
            ratings += '<reviewCard onselect="KP.stopUberTrailer(); KP.showComments(' + result.item.id + ')"><title>Отзывы</title><description allowsZooming="true" style="tv-text-max-lines: 3;">Всего комментариев: ' + result.item.comments + '</description></reviewCard>';
        }
        ratings += '</section></shelf>';

        var castTemplate = (castListAllTemplate != '') ? '<shelf id="actors"><header><title>Актеры и съемочная группа</title></header><section>' + castListAllTemplate + '</section></shelf>' : '';

        var video = (!isSerial) ? result.item.videos[0] : result.item.seasons[0].episodes[0];
        var subtitlesInfo = "";
        var cc = (video.subtitles.length > 0) ? this.fragments.badge('CC') : "";
        if (video.subtitles.length > 0) {
            var subtitles = video.subtitles.map(sub => (LanguagesLocal[sub.lang] || sub.lang));
            let uniqueSubtitles = [...new Set(subtitles)];
            subtitlesInfo = '<info><header><title>Субтитры</title></header><text handlesOverflow="true" onselect="showText(\'' + uniqueSubtitles.join(", ") + '\', \'Субтитры\')">' + uniqueSubtitles.join(", ") + '</text></info>';
        }

        var audioTrackInfo = "";
        if (video.audios.length > 0) {
            var audioTracks = video.audios.map((audio, index) => {
                var audioTrackString = index + 1 + ". ";
                if (audio.lang) { audioTrackString += (LanguagesLocal[audio.lang] || audio.lang); }
                if (audio.codec && audio.codec == "ac3") { audioTrackString += ' (' + audio.codec.toUpperCase() + ')'; }
                if (audio.type || audio.author) {
                    audioTrackString += " — "
                    if (audio.type && audio.type.title) { audioTrackString += audio.type.title; }
                    if (audio.author && audio.author.title) { audioTrackString += " (" + audio.author.title + ")"; }
                }
                return audioTrackString;
            });
            audioTracks = audioTracks.join("\n");
            audioTrackInfo = '<info><header><title>Дорожки</title></header><text handlesOverflow="true" onselect="showText(\'' + audioTracks + '\', \'Дорожки\')">' + audioTracks + '</text></info>';
        }

        var voice = (result.item.voice) ? '<info><header><title>Озвучка</title></header><text>' + result.item.voice + '</text></info>' : "";
        var translationBlock = (voice != '' || subtitlesInfo != '') ? '<infoTable><header><title>Перевод</title></header>' + voice + subtitlesInfo + '</infoTable>' : "";
        var audioTrackInfoBlock = (audioTrackInfo) ? '<infoTable><header><title>Аудио</title></header>' + audioTrackInfo + '</infoTable>' : "";

        var duration = (isSerial || result.item.subtype == 'multi') ? `${formatDuration(result.item.duration.average)} (${formatDuration(result.item.duration.total)})` : formatDuration(result.item.duration.total);

        var plot = result.item.plot.replace(/"/g, "").replace(/>/g, "&lt;").replace(/</g, "&gt;").replace(/'/g, "").replace(/[\r\n]+/gm, " ")
        var template = `<document>
                            <head>
                                <style> 
                                    .white{tv-tint-color: rgb(255,255,255); tv-highlight-color: rgb(255,255,255);} 
                                    .smallButton{width: 100; height: 60; font-size: 15;}
                                    .banner-left { tv-position: top-left; } 
                                    .banner-right { tv-position: top-right; } 
                                    .banner-center { tv-position: top-center; margin: 0 50; } 
                                    .title-text { text-align: left; text-shadow: 2px 1px 0px black; color: rgba(255, 255, 255, 1.0); } 
                                    .metadata-text { tv-text-max-lines: 1; tv-text-style: caption1; color: rgba(255, 255, 255, 0.8); } 
                                    .metadata-tint-color { tv-tint-color: rgba(255, 255, 255, 0.8); } 
                                    .grid_3 { padding: 0 80; tv-interitem-spacing: 40; } 
                                    .info-title { tv-text-style: caption2; text-shadow: 2px 1px 0px black; } 
                                    .info-text { tv-text-style: caption2; color: rgba(255, 255, 255, 1.0); margin-left: -45; text-shadow: 2px 1px 0px black; } 
                                    .align-right { itml-align: right; } 
                                    .tint-color { tv-tint-color: rgb(0, 0, 0); color: rgb(0, 0, 0); } 
                                    @media (tv-appearance: dark) { .tint-color { tv-tint-color: rgb(255, 255, 255); color: rgb(255, 255, 255); } } 
                                </style>
                            </head>`;
        template += (isNew) ?
            `<productUberTemplate theme="dark">` : `<productTemplate>`;
        template +=
            `<background> `
        template += (isNew) ?
            `<mediaContent playbackMode="onFocus"> 
                                        <img src="${Utils.replaceCdn(result.item.posters.wide)}" style="tv-tint-color: rgba(0, 0, 0, 0.3));" /> 
                                    </mediaContent> ` : '';
        template +=
            `</background> `;
        template += (isNew) ?
            `<!-- NEW -->
                                    <banner autoHighlight="true">
                                        <!-- left -->
                                            ${playVideoButton}${bookmarksButton}${trailer}${commentBadge}
                                        <!-- middle --> 
                                            <title class="title-text" style="margin-left: 50;">${titles.title}</title>
                                            ${subtitle}
                                            <description handlesOverflow="true" onselect="showText('${plot}', '${titles.title}')" class="banner-center" style="tv-text-max-lines: 3; text-align: left; text-shadow: 2px 2px 2px 2px #000000; width: 900">${plot}</description>
                                            <row id="badges" class="banner-center" style="margin-top: 10; tv-interitem-spacing: 20">
                                                <text class="metadata-text">${result.item.year}</text>
                                                <text class="metadata-text">${result.item.countries[0] ? result.item.countries[0].title : '-'}</text>
                                                <text class="metadata-text">${result.item.genres[0] ? result.item.genres[0].title : '-'}</text>
                                                <text class="metadata-text">${duration}</text>
                                                ${hd}${cc}${ac3}${ad}${quality}${finished}
                                            </row>
                                        <!-- right --> 
                                            <infoList class="banner-right" style="width: 300">
                                                ${castListTemplate}
                                            </infoList> ` :
            `<!-- OLD -->
                                    <banner>
                                    <infoList>${castListTemplate}</infoList>
                                    <stack>
                                        <title>${titles.title}</title>
                                        ${subtitle}
                                        <row id="badges">
                                            <text>${result.item.year}</text>
                                            <text>${result.item.countries[0] ? result.item.countries[0].title : '-'}</text>
                                            <text>${result.item.genres[0] ? result.item.genres[0].title : '-'}</text>
                                            <text>${duration}</text>
                                            ${hd}${cc}${ac3}${ad}${quality}${finished}
                                        </row>
                                        <description handlesOverflow="true" onselect="showText('${plot}', '${titles.title}')">${plot}</description>
                                        <row>
                                            ${playVideoButton}${trailer}${watchedButton}${bookmarksButton}${commentBadge}
                                        </row>
                                    </stack>
                                    <heroImg src="${Utils.replaceCdn(result.item.posters.big)}"/>`;
        template +=
            `</banner>`;
        template += (isNew) ?
            `<collectionList>` : '';
        template +=
            `${moreVideosOrSeasonsShelf}${ratings}${castTemplate}
                                    <separator/>
                                    <productInfo>
                                        <infoTable>
                                            <header><title>Общая информация</title></header>
                                            <info>
                                                <header><title>Жанры</title></header>
                                                <text>${genres.join(", ")}</text>
                                            </info>
                                            <info>
                                                <header><title>Страны</title></header>
                                                <text>${countries.join(", ")}</text>
                                            </info>
                                            <info>
                                                <header><title>Релиз</title></header>
                                                <text>${result.item.year}</text>
                                            </info>
                                            <info>
                                                <header><title>Длительность</title></header>
                                                <text>${duration}</text>
                                            </info>
                                            <info>
                                                <header><title>Качество</title></header>
                                                <text>${this.quality[result.item.quality]}</text>
                                            </info>
                                            <info>
                                                <header><title>Возраст</title></header>
                                                <text id="age">-</text>
                                            </info>
                                            <info>
                                                <header><title>Добален</title></header>
                                                <text>${Utils.rusDate(result.item.created_at * 1000, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</text>
                                            </info>
                                            <info>
                                                <header><title>Обновлен</title></header>
                                                <text>${Utils.rusDate(result.item.updated_at* 1000,  { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</text>
                                            </info>
                                        </infoTable>
                                        ${translationBlock}${audioTrackInfoBlock}
                                    </productInfo>`;
        template += (isNew) ?
            `   </collectionList>
                            </productUberTemplate> ` : `</productTemplate>`;
        template +=
            `</document>`;
        return template;

    },

    episodesPage(item, seasonNumber) {
        var titles = Utils.splitTitle(item.title);
        var subtitle = (titles.subtitle) ? '<subtitle>' + titles.subtitle + '</subtitle>' : '';
        var episodes = item.seasons[seasonNumber].episodes.map((episode, index) => {
            return this.fragments.episode(item.id, item.seasons[seasonNumber], episode, index);
        });
        return `<document>
                    <head>
                        <style>
                            .white{tv-tint-color: rgb(255,255,255);} 
                            .poster{margin: 10 0 0 105; color: rgb(255,255,255);} 
                            .still{margin: 10; color: rgb(255,255,255);}
                        </style>
                    </head>
                    <compilationTemplate>
                        <list>
                            <relatedContent>
                                <itemBanner>
                                    <heroImg src="${Utils.replaceCdn(item.posters.big)}"/>
                                </itemBanner>
                            </relatedContent>
                            <header>
                                <title>${titles.title}</title>
                                ${subtitle}
                                <row>
                                    <text>Сезон №${item.seasons[seasonNumber].number} ${item.seasons[seasonNumber].title}</text>
                                </row>
                            </header>
                            <section>
                            ${episodes.join("")}
                            </section>
                        </list>
                    </compilationTemplate>
                </document>`
    }
};

var TVTemplates = {
    tvProgramPage(arhiv, program) {
        return `<document>
                    <compilationTemplate>
                        <background></background>
                        <list>
                            <header><title>Архив передач</title></header>
                            <section id = "arhiv">
                                <header><title>Архив передач</title></header>
                                ${arhiv}
                            </section>
                            <section id = "program">
                                <header><title>Программа передач</title></header>
                                ${program}
                            </section>
                        </list>
                    </compilationTemplate>
                </document>`;
    },

    playlistPage(title, channels) {
        var rusDate = Utils.rusDate(null, { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        return `<document>
                    <head>
                        <style>
                            @media tv-template and (tv-theme:dark) {.simpleText{tv-align:left; margin: 0 20; color: white;} 
                            .text {tv-align:left; margin: 0 20; tv-highlight-color: rgb(0,0,0); color: rgb(255,255,255);} 
                            .label{tv-position: right; margin: 0 20; color: rgb(255,255,255);}} 
                            @media tv-template and (tv-theme:light) {.simpleText{tv-align:left; margin: 0 20; color: black;} 
                            .text {tv-align:left; margin: 0 20; color: rgb(0,0,0);} 
                            .label{tv-position: right; margin: 0 20; color: rgb(0,0,0);}}
                        </style>
                    </head>
                    <stackTemplate>
                        <banner style="height:90">
                            <title>ТВ каналы — ${title}</title>
                        </banner>
                        <collectionList>
                            ${channels}
                        </collectionList>
                    </stackTemplate>
                </document>`;
    },

    fragments: {
        item(show, stream, channelName, type, time) {
            var currentDate = new Date;
            var date = new Date(show.time * 1000);
            stream += (type == "edem") ? '?utc=' + show.time + '&lutc=' + Math.round(currentDate.getTime() / 1000) : '';
            var autoHighlight = (time == show.time) ? 'autoHighlight="true"' : '';
            var rusDate = Utils.rusDate(show.time * 1000, { month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' });
            var name = show.name.replace(/"/g, "").replace(/>/g, "&lt;").replace(/</g, "&gt;").replace(/'/g, "").replace(/[\r\n]+/gm, " ");
            var desc = (show.descr || 'Описание отсутствует').replace(/"/g, "").replace(/>/g, "&lt;").replace(/</g, "&gt;").replace(/'/g, "").replace(/[\r\n]+/gm, " ");
            var showTime = (type == "edem") ? null : `'${show.time}'`;

            var onselect = (date > currentDate) ? '' : `onselect = "KPlayer.playTV('${stream}', '${channelName}', 'http://spacetv.in/images/${show.img}', '${name}', '${desc}', ${showTime})"`;
            var titleStyle = (date > currentDate) ? 'style="color: rgba(255,255,255,0.5)"' : '';
            return `<listItemLockup ${autoHighlight} ${onselect}>
                        <title ${titleStyle}>${name}</title>
                        <subtitle>Длительность: ${formatDuration(parseInt(show.duration))}</subtitle>
                        <decorationLabel>${rusDate}</decorationLabel>
                        <relatedContent>
                            <lockup>
                                <title style="font-size: 30;">${name}</title>
                                <description onselect="showText('${desc}', '${name}')" style="tv-text-max-lines: 15; font-size: 25;" allowsZooming="true">${desc}</description>
                            </lockup>
                        </relatedContent>
                    </listItemLockup>`;
        }
    }
};
