var KP = (function() {
    var docs = {};
    var currentType;
    var changelog;
    var uberTrailerPlayer;
    var itemForLibrary = { items: 'items', type: null, from: null, id: '', title: '', filters: {}, options2: 0 }
    var itemForActors = { items: 'items', id: 'actor', filters: {}, options2: 0 }
    var optionsLibrary = [
        { items: 'types', title: 'Тип', selected: '', filters: { type: '' } },
        { items: 'references\/video-quality', title: 'Качество', selected: '', filters: { quality: '' } },
        { items: 'genres', title: 'Жанр', selected: '', filters: { genre: '' } },
        { items: 'countries', title: 'Страны', selected: '', filters: { country: '' } },
        { items: '', title: 'Год', selected: '', filters: { year: '' } }
    ]
    var optionsLibrary2 = [
        { title: 'Последние добавленные', sort: '-created' },
        { title: 'Последние обновленные', sort: '--updated' },
        { title: 'По кол-ву просмотров', sort: '-views' },
        { title: 'По названию', sort: 'title' },
        { title: 'По году', sort: '-year' },
        { title: 'По рейтингу Кинопаба', sort: '-rating' },
        { title: 'По рейтингу Кинопоиска', sort: '-kinopoisk_rating' },
        { title: 'По рейтингу IMDB', sort: '-imdb_rating' }
    ]

    function makeDocument(title) {
        var template = Templates.loading(title);
        var doc = Presenter.makeDocument(template, true);
        MenuItemDoc = doc;
        docs[currentType] = doc;
        var domImplementation = doc.implementation;
        var lsParser = domImplementation.createLSParser(1, null);
        var lsInput = domImplementation.createLSInput();
        return { 'doc': doc, 'lsParser': lsParser, 'lsInput': lsInput };
    }

    function replaceElement(string, elementTag, elementID, action, doc) {
        doc = Presenter.activeParser(doc).doc
        var lsInput = Presenter.activeParser().lsInput
        var lsParser = Presenter.activeParser().lsParser
        var element = (elementTag) ? doc.getElementsByTagName(elementTag).item(0) : doc.getElementById(elementID);
        lsInput.stringData = string.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
        lsParser.parseWithContext(lsInput, element, action);
    }

    function getItemsTemplate(result, itemToLoad, labrary) {
        if (itemToLoad.id == 'collections') {
            var movies = result.items.map(item => Templates.fragments.itemCollection(item));
        } else if (itemToLoad.id == 'history') {
            var movies = result.history.map(history => Templates.fragments.itemPoster(history.item, null, null, null, history));
        } else {
            var movies = result.items.map(item => Templates.fragments.itemPoster(item));
        }
        if (result.pagination && result.pagination.total != result.pagination.current && result.pagination.total != 0) {
            var nextPage = result.pagination.current + 1;
            var nextOptions = {...itemToLoad };
            nextOptions['page'] = nextPage
            nextOptions['totalPages'] = result.pagination.total
            if (itemToLoad.id == 'unwatched') {
                return movies;
            } else {
                var next = Templates.fragments.itemNext(nextOptions);
            }
            movies.push(next);
        } else {
            // Костыль для grig при замене через parseWithContext
            if (labrary) {
                var crutch = '<lockup><img src ="" width="250" height="376" /><overlay><description class="nextButton">Конец</description></overlay></lockup>';
                movies.push(crutch);
            }
        }
        return movies;
    }

    function appendShelf(doc, result, item, tagID) {
        var movies = getItemsTemplate(result, item);
        var options = { movies: movies.join(''), item: item };
        var shelf = Templates.fragments.itemsShelf(options);
        var tag, id;
        if (tagID) {
            id = tagID;
            var action = 5;
            if (doc.getElementById(tagID) == undefined) {
                tag = "collectionList"
                action = 1;
            }
        } else {
            tag = "collectionList"
            var action = 1;
        }
        if (tag != undefined || id != undefined) {
            console.log(tag);
            console.log(action + ' ' + tagID);
            replaceElement(shelf, tag, id, action, doc);
        }
    }

    function removeShelf(doc, tagID) {
        var activeParser = Presenter.activeParser(doc)
        activeParser.lsInput.stringData = ' ';
        var context = doc.getElementById(tagID);
        var action = 5;
        console.log('remove ' + tagID + ' from:')
        console.log(context)
        if (context != undefined) {
            activeParser.lsParser.parseWithContext(activeParser.lsInput, context, action);
        }
    }

    function saveTopShelf(items, options, title) {
        var settings = AppSettings.getAll();
        console.log(settings.userTopShelfOption.id + '==' + options.id);
        if (settings.cartoonMode.id) { writeTopShelf(null); return;}
        if (settings.userTopShelfOption.id == options.id) {
            var name = title || options.name;
            var topshelfArrayCount = 0;
            var topshelfArray = items.map(item => {
                if (topshelfArrayCount < 10) {
                    if (options == topShelfOptions.premier && item.kinopoisk_rating < 4) { return }
                    topshelfArrayCount++;
                    var topshelfMovie = {};
                    topshelfMovie["slug"] = item.type + ";items/" + item.id.toString();
                    topshelfMovie["image"] = item.posters.big;
                    topshelfMovie["title"] = item.title.split(' / ')[0];
                    return topshelfMovie;
                }
            }).filter(item => item != undefined);
            var finalTopshelfArray = {}
            var dict = { "title": name, "contentIdentifier": "movies", "items": topshelfArray };

            var savedTopShelf = AppStorage.getData(KEYS.topshelf);
            if (savedTopShelf) {
                var parsed = JSON.parse(savedTopShelf)
                if (parsed) {
                    if (options == topShelfOptions.unwatched && parsed.sections[0].title.includes("Недосмотренные")) {
                        var index = parsed.sections.findIndex(section => section.title == dict.title);
                        if (index != -1) { parsed.sections[index] = dict } else { parsed.sections.push(dict) }
                        finalTopshelfArray = parsed
                        writeTopShelf(finalTopshelfArray)
                        return
                    }
                }
            }
            finalTopshelfArray["sections"] = [dict]
            writeTopShelf(finalTopshelfArray)
        }
    }

    function writeTopShelf(finalTopshelfArray) {
        console.log(finalTopshelfArray);
        var topshelfMoviesUrl = JSON.stringify(finalTopshelfArray);
        AppStorage.setData(KEYS.topshelf, topshelfMoviesUrl);
    }

    function movieOrSerialPage(itemsToLoad) {
        var doc = docs[currentType]
        var settings = AppSettings.getAll();
        doc.addEventListener("load", function() {
            Network.loadItemsFrom(itemsToLoad[0], function(result, options) {
                if (result == undefined) { return }
                console.log(result)
                if (settings.animeIsHidden.id) {
                    Utils.hideAnime(result, options);
                }
                if (itemsToLoad[0].type == 'movie') {
                    saveTopShelf(result.items, topShelfOptions.premier);
                    saveTopShelf(result.items, topShelfOptions.hotMovies);
                }
                var bannersCount = 0;
                var banners = result.items.map(item => {
                    if (item.kinopoisk_rating > 3 && bannersCount < 5) {
                        bannersCount++;
                        return Templates.fragments.itemBanner(item);
                    }
                });
                var movies = getItemsTemplate(result, itemsToLoad[0]);

                var tmpOptions = { banners: banners.join(''), movies: movies.join(''), item: itemsToLoad[0] }
                var template = Templates.moviesPage(tmpOptions, itemsToLoad);

                replaceElement(template, "document", null, 5, doc);

                for (var index in itemsToLoad) {
                    if (index == 0) { continue }
                    Network.loadItemsFrom(itemsToLoad[index], function(result, options) {
                        if (options.id == "unwatched") {
                            saveTopShelf(result.items, topShelfOptions.unwatched, options.title);
                        }
                        if (options.from == 'popular' && options.type == 'movie') {
                            saveTopShelf(result.items, topShelfOptions.popularMovies);
                        }
                        if (result.items.length > 0) {
                            if (settings.animeIsHidden.id) {
                                Utils.hideAnime(result, options);
                            }
                            appendShelf(doc, result, options, options.id);
                        } else {
                            removeShelf(doc, options.id);
                        }
                    });
                }
            });
        });
        //setTimeout (function () {
        doc.addEventListener("appear", function() {
                Network.loadItemsFrom(itemsToLoad[5], function(result, options) {
                    console.log(result);
                    if (currentType != options.type) { return }
                    saveTopShelf(result.items, topShelfOptions.unwatched, itemsToLoad[5].title);
                    if (result.items.length > 0) {
                        appendShelf(doc, result, itemsToLoad[5], itemsToLoad[5].id);
                    } else {
                        removeShelf(doc, itemsToLoad[5].id);
                    }
                }, true);
            })
            //}, 5000);
    }

    function getBookmarks(doc, id) {
        var itemToLoad = { items: 'bookmarks', type: null, from: id, id: 'bookmarks' + id, title: 'Закладки' }
        Network.loadItemsFrom(itemToLoad, function(result, options) {
            var bookmarks = getItemsTemplate(result, options);
            replaceElement(bookmarks.join(''), null, options.from, 2, doc);
        }, true);
    }

    function showBookmarkCreationFrom() {
        var itemToLoad = { items: 'bookmarks', type: null, from: 'create', method: 'POST', id: 'bookmarkscreate', title: 'Создание закладки', filters: { title: '' } }
        var options = { title: 'Создание закладки', placeholder: 'Название закладки', button: 'Создать' }
        var template = Templates.textFieldForm(options);
        var doc = Presenter.makeDocument(template);
        doc.addEventListener("select", function(event) {
            var textField = doc.getElementsByTagName("textField").item(0);
            var keyboard = textField.getFeature("Keyboard");
            var text = keyboard.text;
            if (text.length > 3) {
                itemToLoad['filters']['title'] = text
                Network.loadItemsFrom(itemToLoad, createBookmark, true);
            } else {
                var domImplementation = doc.implementation;
                var lsParser = domImplementation.createLSParser(1, null);
                var lsInput = domImplementation.createLSInput();
                lsInput.stringData = '<description style="color:red">Введите больше 3 символов</description>';
                lsParser.parseWithContext(lsInput, doc.getElementsByTagName('description').item(0), 5);
            }
        });
        Presenter.modalDocument(doc);
    }

    function deleteApproval(id) {
        var itemToLoad = { items: 'bookmarks', type: null, from: 'remove-folder', method: 'POST', id: 'bookmarksremove', title: 'Удаление закладки', filters: { folder: '' } }
        var values = {
            1: { id: 1, name: 'Да' },
            0: { id: 0, name: 'Нет' }
        }
        var template = Templates.alertWithButtons('Вы уверены, что хотите удалить закладку?', values);
        var doc = Presenter.makeDocument(template, true);
        doc.addEventListener("select", function(event) {
            var selectedElement = event.target;
            var targetElement = selectedElement.getAttribute('id');
            if (selectedElement.tagName == "button" && targetElement == 1) {
                id = id.split("bookmark")[1]
                itemToLoad['filters']['folder'] = id
                Network.loadItemsFrom(itemToLoad, deleteBookmark, true);
            } else if (selectedElement.tagName == "button" && targetElement == 0) {
                Presenter.dismissModal();
            }
        });
        Presenter.modalDocument(doc);
    }

    function createBookmark(result, options) {
        Presenter.dismissModal();
        if (result.status == 200) {
            options['title2'] = result.folder.title
            options['id'] = result.folder.id
            var newItem = Templates.fragments.itemsLookup(null, options, 0);
            replaceElement(newItem, null, "create", 3);
        }
    }

    function deleteBookmark(result, options) {
        Presenter.dismissModal();
        if (result.status == 200) {
            replaceElement(' ', null, 'bookmark' + options.filters.folder, 5);
        }
    }

    function deleteHistory(result, options, xhr) {
        Presenter.dismissModal();
        console.log(result);
        if (xhr) { return; }
        if (result.status == 200) {
            var itemToLoad = { items: 'history', type: null, from: null, id: 'history', title: 'История' }
            Network.loadItemsFrom(itemToLoad, function(result, options) {
                var movies = getItemsTemplate(result, options);
                replaceElement(`${movies.join('')}`, null, "history", 2);
            }, true);
        }
    }

    function loadFiltered(itemToLoad, options, options2, callback) {
        var settings = AppSettings.getAll();
        for (index in options) {
            var key = Object.keys(options[index].filters)[0]
            if (options[index].title == "Качество" && options[index].selected == '') {
                delete itemToLoad.filters[key];
                continue;
            }
            itemToLoad.filters[key] = options[index].filters[key]
        }
        itemToLoad.filters['sort'] = options2[itemToLoad.options2].sort
        Network.loadItemsFrom(itemToLoad, function(result, options) {
            if (settings.animeIsHidden.id) {
                Utils.hideAnime(result, options);
            }
            var movies = getItemsTemplate(result, options, true);
            console.log(result);
            if (callback) { callback(movies) } else {
                replaceElement(`${movies.join('')}`, null, "items", 2);
            }
        }, true);
    }

    function showDropDown(values, options) {
        var activeParser = Presenter.activeParser(docs['library'])
        var template = Templates.alertWithButtons(options.title, values);
        var doc1 = Presenter.makeDocument(template, true);
        doc1.addEventListener("select", function(event) {
            var selectedElement = event.target;
            if (selectedElement.tagName == "button") {
                for (index in optionsLibrary) {
                    if (optionsLibrary[index].title == options.title) {
                        var key = Object.keys(options.filters)[0]
                        var id = selectedElement.getAttribute('id');
                        var text = selectedElement.getAttribute('textTitle');
                        optionsLibrary[index].filters[key] = (id != 0) ? id : '';
                        optionsLibrary[index].selected = (text != 'Отменить выбор') ? text : '';
                        var title = (optionsLibrary[index].selected == '') ? optionsLibrary[index].title : optionsLibrary[index].selected;
                        activeParser.lsInput.stringData = '<description class ="text">' + title + ' <badge class="label" height="23" width="40" src="resource://button-dropdown" /></description>';
                        activeParser.lsParser.parseWithContext(activeParser.lsInput, activeParser.doc.getElementsByTagName("description").item(index), 5);
                        Presenter.dismissModal();
                        loadFiltered(itemForLibrary, optionsLibrary, optionsLibrary2);
                    }
                }
            }
        });
        Presenter.modalDocument(doc1);
    }

    function saveDeviceSettings(result) {
        var activeParser = Presenter.activeParser(docs['settings'])
        if (result.device) { AppStorage.setItem(KEYS.deviceInfoID, result.device.id); }
        var settings = result.settings || result.device.settings;
        if (currentType == 'settings') {
            var videoSettings = {
                'mixedPlaylist': yesNo[settings.mixedPlaylist.value].name,
                'support4k': yesNo[settings.support4k.value].name,
                'supportHevc': yesNo[settings.supportHevc.value].name
            }
            var userDeviceSettings = '\n<b>Поддержка 4K: ' + videoSettings.support4k + '</b>\n4K или Ultra HD — фильм в сверхвысокой четкости 2160p. Данный формат поддерживается ТОЛЬКО Apple TV 4K. Apple TV 4 данный формат не поддерживает.\n\n<b>Поддержка HEVC/HDR: ' + videoSettings.supportHevc + '</b>\nHEVC или H.265 — формат видеосжатия с применением более эффективных алгоритмов по сравнению с H.264/AVC. Данный формат поддерживается ТОЛЬКО Apple TV 4K. Apple TV 4 данный формат не поддерживает.\n\n<b>Смешанный плейлист: ' + videoSettings.mixedPlaylist + '</b>\nДанная настройка необходима только для владельцев Apple TV4K для возможности воспроизведения HEVC/HDR в SDR режиме. Крайне не советуется ставить опцию в "Нет".';
            activeParser.lsInput.stringData = userDeviceSettings.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
            activeParser.lsParser.parseWithContext(activeParser.lsInput, activeParser.doc.getElementById("userDeviceSettings"), 2);
        }
        settings.serverLocation.value.forEach(server => {
            if (server.selected == 1) {
                var values = AppSettings.getAllValues(settingKeys.userServer);
                AppSettings.set(settingKeys.userServer, values[server.id]);
            }
        });
        settings.streamingType.value.forEach(stream => {
            if (stream.selected == 1) {
                if (stream.id == 1) { AppSettings.set(settingKeys.userStream, AppSettings.getAllValues(settingKeys.userStream)[4]); return; }
                var values = AppSettings.getAllValues(settingKeys.userStream);
                AppSettings.set(settingKeys.userStream, values[stream.id]);
            }
        });
    }

    function loadChangelog(callback) {
        API.getLocalFile('CHANGELOG', function(xhr) {
            changelog = xhr.responseText;
            if (callback) { callback() }
        });
    }

    function addDaysToMenuBar(result) {
        if (result == undefined) { return }
        var days = Math.round(result.user.subscription.days);
        if (days < 7) {
            var template = '<title>&#9881; [' + days + ']</title>';
            var doc = navigationDocument.documents[0];
            var activeParser = Presenter.activeParser(doc);
            activeParser.lsInput.stringData = template;
            activeParser.lsParser.parseWithContext(activeParser.lsInput, doc.getElementById("Settings"), 2);
        }
    }

    function showUpdateAlert(newVersion) {
        loadChangelog();
        var template = Templates.newVersion(newVersion);
        var doc = Presenter.makeDocument(template);
        Presenter.modalDocument(doc);
    }

    function spinnerIn(element, show = true) {
        element.setAttribute("showSpinner", show);
    }

    function setUberTrailerPlayer(url, poster) {
        var doc = getActiveDocument();
        var mediaContentElement = doc.getElementsByTagName('mediaContent').item(0);
        uberTrailerPlayer = mediaContentElement.getFeature('Player');
        var playlist = new Playlist();
        var mediaItem = new MediaItem("video", url);
        uberTrailerPlayer.playlist = playlist;
        uberTrailerPlayer.playlist.push(mediaItem);
        uberTrailerPlayer.play();
        uberTrailerPlayer.addEventListener("mediaItemWillChange", function(event) {
            if (event.reason == "1") {
                var domImplementation = doc.implementation;
                var lsParser = domImplementation.createLSParser(1, null);
                var lsInput = domImplementation.createLSInput();
                var stringData = '<img src="' + poster + '"/>'
                lsInput.stringData = stringData.replace(/&/g, "&amp;").replace(/'/g, "&apos;");;
                lsParser.parseWithContext(lsInput, doc.getElementsByTagName("background").item(0), 2);
                uberTrailerPlayer.stop();
            }
        });

    }

    function playUberTrailer(url, poster) {
        if (isPlaying) { return; }
        if (uberTrailerPlayer) {
            uberTrailerPlayer.play();
        } else if (url) { setUberTrailerPlayer(url, poster); }
    }

    return {
        loadReferences() {
            var itemsToLoad = [
                { items: 'references', from: referencesType.server },
                { items: 'references', from: referencesType.streaming }
            ]
            for (var index in itemsToLoad) {
                Network.loadItemsFrom(itemsToLoad[index], function(result, options) {
                    console.log(result);
                    var key = options.from == referencesType.server ? settingKeys.userServer : settingKeys.userStream
                    var values = {};
                    result.items.forEach(item => values[item.id] = item);
                    AppSettings.setAllValues(key, values);
                    API.getDeviceInfo(saveDeviceSettings);
                });
            }
        },

        loadUserInfo() {
            var itemToLoad = { items: 'user', id: 'userInfo' }
            Network.loadItemsFrom(itemToLoad, addDaysToMenuBar);
        },

        checkNewVersion() {
            API.getLocalFile('VERSION', function(xhr) {
                if (xhr.status == 200) {
                    var version = xhr.responseText.trim();
                    console.log(version + "=" + APP_VERSION);
                    if (version != APP_VERSION) {
                        showUpdateAlert(version);
                    }
                }
            });
        },

        // MOVIES AND SHOWS PAGES
        showsPage() {
            var itemsToLoad = [
                { items: 'items', type: 'serial', from: 'popular', id: 'popular', title: 'Популярные сериалы', async: false },
                { items: 'items', type: 'serial', from: null, id: 'subs', title: 'Больше всего подписчиков', filters: { sort: '-watchers' } },
                { items: 'items', type: 'serial', from: null, id: '4k', title: '4K сериалы', filters: { quality: '4k', sort: '-updated' } },
                { items: 'items', type: 'serial', from: 'hot', id: 'hot', title: 'Горячие сериалы' },
                { items: 'items', type: 'serial', from: 'fresh', id: 'fresh', title: 'Новые сериалы' },
                { items: 'watching', type: 'serial', from: 'serials', id: 'unwatched', title: 'Недосмотренные сериалы', filters: { subscribed: 1 } }
            ];
            currentType = itemsToLoad[0].type
            makeDocument('Загрузка сериалов');
            movieOrSerialPage(itemsToLoad);
        },

        moviesPage() {
            var itemsToLoad = [
                { items: 'items', type: 'movie', from: 'hot', id: 'hot', title: 'Горячие фильмы', async: false },
                { items: 'items', type: 'movie', from: 'popular', id: 'populart', title: 'Популярные фильмы' },
                { items: 'items', type: 'movie', from: 'fresh', id: 'fresh', title: 'Новые фильмы' },
                { items: 'items', type: 'movie', from: null, id: '4k', title: '4K фильмы', filters: { quality: '4k', sort: '-updated' } },
                { items: 'collections', type: 'movie', from: null, id: 'collections', title: 'Подборки' },
                { items: 'watching', type: 'movie', from: 'movies', id: 'unwatched', title: 'Недосмотренные фильмы' }
            ];
            currentType = itemsToLoad[0].type
            makeDocument('Загрузка фильмов');
            movieOrSerialPage(itemsToLoad);
        },

        childMoviesPage() {
            var time = ((Date.now() / 1000) - (3600 * 24 * 91));
            var itemsToLoad = [
                { items: 'items', type: 'movie', from: null, id: 'childHotMovies', title: 'Горячие мультфильмы', filters: { genre: '23', sort: '-views', conditions: ['created>' + time ] } },
                { items: 'items', type: 'movie', from: null, id: 'childPopMovies', title: 'Популярные мультфильмы', filters: { genre: '23', sort: '-views' } },
                { items: 'items', type: 'movie', from: null, id: 'childNewMovies', title: 'Новые мультфильмы', filters: { genre: '23', sort: '-created' } },
                { items: 'items', type: 'serial', from: null, id: 'childHotSerial', title: 'Горячие мультсериалы', filters: { genre: '23', sort: '-views', conditions: ['created>' + time ] } },
                { items: 'items', type: 'serial', from: null, id: 'childPopSerial', title: 'Популярные мультсериалы', filters: { genre: '23', sort: '-views' } },
                { items: 'items', type: 'serial', from: null, id: 'childNewSerial', title: 'Новые мультсериалы', filters: { genre: '23', sort: '-created' } }
            ];
            currentType = "childMovie"
            makeDocument('Загрузка мультфильмов');
            movieOrSerialPage(itemsToLoad);
        },

        nextPage(options) {
            var settings = AppSettings.getAll();
            options = JSON.parse(decodeURIComponent(options))
            currentType = 'nextPage';
            Presenter.showLoading('Загрузка результатов');
            Network.loadItemsFrom(options, function(result, options) {
                if (settings.animeIsHidden.id) {
                    Utils.hideAnime(result, options);
                }
                var movies = getItemsTemplate(result, options);
                var template = Templates.nextPage(movies, options);
                var doc = Presenter.makeDocument(template, true);
                Presenter.pushDocument(doc);
            }, true);
        },

        // DETAIL PAGE
        loadItemDetail(id, type, title, callback) {
            title = decodeURIComponent(title || "Загрузка")
            if (!callback) { Presenter.showLoading(title, callback && Utils.isNative()) } //fix dismiss loader for native player
            var itemToLoad = { items: 'items', type: type, from: id, id: id, title: title }
            if (callback) { Network.loadItemsFrom(itemToLoad, callback); } else {
                Network.loadItemsFrom(itemToLoad, this.showDetailPage);
            }
        },

        showDetailPage(result, options) {
            var settings = AppSettings.getAll();
            var isNew = ((settings.uberStroke || false).id || false);
            cachedResult = result
            if (result == undefined) { Presenter.removeLoadingTemplate(); return; }
            if (!result.item.posters.wide) { isNew = false; }
            var itemToLoad = { items: 'items', type: result.item.type, from: result.item.id, id: result.item.id, title: result.item.title }
                console.log(result);

            var template = MovieTemplates.pageVideo(result, isNew);
            //console.log(template);
            var doc = Presenter.makeDocument(template, true);
            doc.load = true;
            skipCache = false;
            Presenter.pushDocument(doc);
            var domImplementation = doc.implementation;
            var lsParser = domImplementation.createLSParser(1, null);
            var lsInput = domImplementation.createLSInput();

            var isSerial = (result.item.type == 'serial' || result.item.type == 'docuserial' || result.item.type == 'tvshow');

            var type = isSerial ? 'serial' : 'movie';
            AfterLoad.set({ id: result.item.id, type: type, action: 'show' });

            doc.addEventListener("appear", function() {
                if (doc.load) { doc.load = false; return; }
                isPlaying = false;
                var type = isSerial ? 'serial' : 'movie';
                AfterLoad.set({ id: result.item.id, type: type, action: 'show' });
                Network.loadItemsFrom(itemToLoad, function(result, options) {
                    cachedResult = result;
                    skipCache = false;
                    if (isSerial) {
                        MovieTemplates.fragments.seriesButtonAndSeasons(result, isNew, null, function(updateString, sIndex) {
                            if (sIndex != undefined) {
                                var item = doc.getElementsByTagName('overlay').item(sIndex);
                            } else {
                                var item = doc.getElementById('lastEpisodeButton');
                            }
                            lsInput.stringData = updateString.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
                            lsParser.parseWithContext(lsInput, item, 5);
                        });
                    }
                }, skipCache);
                // setTimeout(function () {
                //     if (result.item.trailer) {
                //         if (result.item.trailer.url) {
                //             if (settings.uberStrokeAutoTrailer.id && isNew) { playUberTrailer(result.item.trailer.url, result.item.posters.wide); }
                //         }
                //     }
                // }, 3000)
            });

            doc.addEventListener("disappear", function() {
                if (uberTrailerPlayer) {
                    uberTrailerPlayer.pause();
                }
            });

            doc.addEventListener('unload', function() {
                if (uberTrailerPlayer) {
                    uberTrailerPlayer = undefined;
                }
                AfterLoad.clear();
            });

            API.getExtItem(result.item.id, function(xhr) {
                var json = JSON.parse(xhr.responseText);
                if (json.item.age_rating >= 0) {
                    cachedResult.item.age_rating = json.item.age_rating
                    var ageBadge = MovieTemplates.fragments.badge(json.item.age_rating + '+');
                    lsInput.stringData = ageBadge.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
                    lsParser.parseWithContext(lsInput, doc.getElementById('badges'), 1);

                    lsInput.stringData = "<text id=\"age\">" + json.item.age_rating + "+</text>";
                    lsParser.parseWithContext(lsInput, doc.getElementById('age'), 5);
                }
            });

            API.getCollectionForItem(result.item.id, function(xhr) {
                var json = JSON.parse(xhr.responseText);
                console.log(json);
                if (json.items && json.items.length > 0) {
                    var collections = json.items.map(item => MovieTemplates.fragments.collectionsCard(item));
                    var item = { title: "В подборках", id: "collections" }
                    var options = { movies: collections.join(''), item: item };
                    var shelf = Templates.fragments.itemsShelf(options);
                    lsInput.stringData = shelf.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
                    lsParser.parseWithContext(lsInput, doc.getElementById('ratings'), 4);
                }
            });

            setTimeout(function() {
                API.getSimilar(result.item.id, function(xhr) {
                    var similarResult = JSON.parse(xhr.responseText);
                    var similarMovies = MovieTemplates.fragments.similar(similarResult);
                    if (similarMovies != "") {
                        lsInput.stringData = similarMovies.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
                        lsParser.parseWithContext(lsInput, doc.getElementById('ratings'), 3);
                    } else {
                        API.getSimilarInGenre(result.item.genres[0].id, result.item.type, function(xhr) {
                            var moreResult = JSON.parse(xhr.responseText);
                            var moreMovies = MovieTemplates.fragments.similar(moreResult, 'Больше из жанра ' + moreResult.items[0].genres[0].title);
                            if (moreMovies != "") {
                                lsInput.stringData = moreMovies.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
                                lsParser.parseWithContext(lsInput, doc.getElementById('ratings'), 3);
                            }
                        });
                    }
                });

                if (result.item.comments > 0) {
                    API.getComments(result.item.id, function(xhr) {
                        var commentResult = JSON.parse(xhr.responseText);
                        var bestComment = MovieTemplates.fragments.bestComment(commentResult);
                        lsInput.stringData = bestComment.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
                        lsParser.parseWithContext(lsInput, doc.getElementById('ratingSection'), 1);
                    });
                }
                if (result.item.imdb && Trakt.checkTrakToken()) {
                    var imdb = Utils.fixIMDB(result.item.imdb);
                    var type = (isSerial) ? 'shows' : 'movies';
                    API.getTraktItemByIMDB(imdb, type, function(xhr) {
                        if (xhr.status == 200) {
                            var traktResult = JSON.parse(xhr.responseText);
                            var traktRaiting = MovieTemplates.fragments.ratingCard('TraktTV', (Math.round(traktResult.rating * 100) / 100).toFixed(1), Math.round(traktResult.rating) / 10, traktResult.votes, imdb);
                            lsInput.stringData = traktRaiting.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
                            var elements = doc.getElementsByTagName('ratingCard')
                            lsParser.parseWithContext(lsInput, elements.item(elements.length - 1), 4);
                        }
                    });
                }
            }, 500);

            if (result.item.kinopoisk) {
                Kinopoisk2.loadFromKinopoisk(kinopoisk2.methods.getStaffList, result.item.kinopoisk, kinopoiskResult => {
                    if (typeof kinopoiskResult !== 'undefined' && kinopoiskResult.length > 0) {
                        var template = Kinopoisk2.castTemplate(kinopoiskResult);
                        lsInput.stringData = template.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
                        lsParser.parseWithContext(lsInput, doc.getElementById('actors'), 5);
                    }
                });

                Kinopoisk2.loadFromKinopoisk(kinopoisk2.methods.getFacts, result.item.kinopoisk, kinopoiskResult => {
                    if (typeof kinopoiskResult.items !== 'undefined' && kinopoiskResult.items.length > 0) {
                        var template = Kinopoisk2.triviaTemplate(kinopoiskResult);
                        lsInput.stringData = template.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
                        lsParser.parseWithContext(lsInput, doc.getElementById('ratings'), 4);
                    }
                });

                KP.showScreenshots(result.item.kinopoisk, null, true);
                // if (isNew) {
                //     KP.showScreenshots(result.item.kinopoisk, null, true);
                // } else {
                //     var screenshotButton = MovieTemplates.fragments.screenshotButton(result, false);
                //     lsInput.stringData = screenshotButton.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
                //     //doc.getElementById('shufflePlayButton')
                //     lsParser.parseWithContext(lsInput, doc.getElementsByTagName('buttonLockup').item(0), 4);
                // }
            }


            // if (result.item.kinopoisk) {
            //     Kinopoisk.loadFromKinopoisk(kinopoisk.methods.getKPFilmDetailView, result.item.kinopoisk + '&still_limit=50&sr=1', kinopoiskResult => {
            //         if (kinopoiskResult.data.gallery) {
            //             if (isNew) {
            //                 KP.showScreenshots(result.item.kinopoisk, null, true);
            //             } else {
            //                 var screenshotButton = MovieTemplates.fragments.screenshotButton(result, false);
            //                 lsInput.stringData = screenshotButton.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
            //                 //doc.getElementById('shufflePlayButton')
            //                 lsParser.parseWithContext(lsInput, doc.getElementsByTagName('buttonLockup').item(0), 4);
            //             }
            //         }
            //         if (kinopoiskResult.data.triviaData) {
            //             var template = Kinopoisk.triviaTemplate(kinopoiskResult);
            //             lsInput.stringData = template.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
            //             lsParser.parseWithContext(lsInput, doc.getElementById('ratings'), 4);
            //         }
            //     });
            // }

            if (isSerial && result.item.imdb) {
                var imdb = Utils.fixIMDB(result.item.imdb);
                TMDB.loadFrom(theMovieDB.methods.find, imdb, null, themovieDBResult => {
                    if (themovieDBResult.tv_results[0]) {
                        TMDB.loadFrom(theMovieDB.methods.tv, null, themovieDBResult.tv_results[0].id, themovieDBTvShowResult => {
                            var tmdbSeasons = themovieDBTvShowResult.seasons.filter(season => season.name.includes("Сезон"));
                            tmdbSeasons.forEach((season, index) => {
                                if (result.item.seasons[index] && season.poster_path) {
                                    var string = '<img id="img' + result.item.seasons[index].number + '" src ="' + theMovieDB.imageUrl + season.poster_path + '" width="182" height="274" />';
                                    lsInput.stringData = string.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
                                    lsParser.parseWithContext(lsInput, doc.getElementById('img' + result.item.seasons[index].number), 5);
                                }
                                if (!result.item.seasons[index] && index > result.item.seasons.length - 1) {
                                    lsInput.stringData = MovieTemplates.fragments.tmdbSeason(season).replace(/&/g, "&amp;").replace(/'/g, "&apos;");
                                    lsParser.parseWithContext(lsInput, doc.getElementsByTagName('section').item(0), 1);
                                }
                            });
                        });
                    }
                });
            }
        },

        // EPISODES
        episodesPage(seasonNumber) {
            currentType = 'episodePage';
            var result = cachedResult;
            var itemToLoad = { items: 'items', type: null, from: result.item.id, id: 'items' }
            KP.stopUberTrailer();
            var template = MovieTemplates.episodesPage(result.item, seasonNumber);
            var doc = Presenter.makeDocument(template, true);
            Presenter.pushDocument(doc);

            update = function() {
                var activeParser = Presenter.activeParser(doc);
                Network.loadItemsFrom(itemToLoad, function(result2, options) {
                    cachedResult = result2;
                    console.log(result2);
                    result2.item.seasons[seasonNumber].episodes.forEach((episode, index) => {
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
                        var string = '<decorationLabel id ="' + labelId + '">' + formatDuration(episode.duration) + labelWatch + '</decorationLabel>';
                        activeParser.lsInput.stringData = string;
                        activeParser.lsParser.parseWithContext(activeParser.lsInput, doc.getElementsByTagName("decorationLabel").item(index), 5);
                        console.log(episode.watched);
                        console.log(string);
                    });
                }, true);
            }

            doc.addEventListener("select", function(event) {
                var selectedElement = event.target;
                var targetEpisode = selectedElement.getAttribute('episode');
                if (selectedElement.tagName == "listItemLockup") {
                    play(targetEpisode, seasonNumber)
                }
            });
            setTimeout(function() {
                doc.addEventListener("appear", update);
            }, 300);
        },

        selectNumOfEp(episode, season) {
            Presenter.showLoading("Загрузка");
            var title = 'Количество серий';
            var desc = 'Выберите количество серий для воспроизведения';
            var buttons = [];
            for (var i = 1; i <= 5; i++) {
                buttons.push('<button onselect="playFewEp(' + episode + ', ' + season + ', ' + i + ')"><text>' + i + '</text></button>');
            }
            var template = Templates.alert(title, desc, buttons.join(""));
            var doc = Presenter.makeDocument(template, true);
            Presenter.removeLoadingTemplate();
            Presenter.modalDocument(doc);
        },

        // ACTOR PAGE
        actorPage(personName, enPersonName, type, id) {
            currentType = 'actorPage';
            delete itemForActors.filters["director"]
            delete itemForActors.filters["actor"]
            personName = decodeURIComponent(personName);
            enPersonName = decodeURIComponent(enPersonName);
            Presenter.showLoading(personName);
            itemForActors.filters[type] = personName;
            itemForActors['title'] = personName;
            itemForActors['id'] = type + personName;
            var options = { name: personName }
            var sort = optionsLibrary2[itemForActors.options2];
            var template = Templates.actorPage(options, sort);
            var doc1 = Presenter.makeDocument(template, true);
            Presenter.pushDocument(doc1);
            showActorBanner = function(options) {
                let actorBanner = Templates.fragments.actorBanner(options)
                replaceElement(actorBanner, null, "biography", ParserActions.REPLACE);
            }
            
            //id = null
            if (id != undefined, id != null) {
                Kinopoisk2.loadFromKinopoisk(kinopoisk2.methods.getStaffInfo, id, kinopoiskResult => {
                    if (typeof kinopoiskResult !== 'undefined' && kinopoiskResult.personId) {
                        options['profile_path'] = kinopoisk2.actorImageUrl + kinopoiskResult.personId + '.jpg'
                        var biography = kinopoiskResult.profession + '. '
                        biography += 'Возраст: ' + kinopoiskResult.age + '. '
                        biography += 'Место рождения: ' + kinopoiskResult.birthplace + '. '
                        biography += kinopoiskResult.facts.join(' ')
                        options['biography'] = biography;
                        showActorBanner(options)
                    }
                }, true);
            } else if (enPersonName && enPersonName != null) {
                TMDB.loadFrom(theMovieDB.methods.searchPerson, null, enPersonName, themovieDBResult => {
                    if (typeof themovieDBResult !== 'undefined' && themovieDBResult.results && themovieDBResult.results[0]) {
                        TMDB.loadFrom(theMovieDB.methods.person, null, themovieDBResult.results[0].id, personResult => {
                            options['biography'] = personResult.biography;
                            options['profile_path'] = theMovieDB.imageUrl + personResult.profile_path;
                            showActorBanner(options)
                        }, true);
                    } 
                }, false);
            }
            loadFiltered(itemForActors, null, optionsLibrary2, function(movies) {
                replaceElement(movies.join(''), null, "items", 2);
            })
        },

        // MYSUBSCRIBES
        mySubscribesPage() {
            currentType = 'subscribes';
            var itemsToLoad = [
                { items: 'watching', type: 'serial', from: 'serials', id: 'unwatched', title: 'Недосмотренные сериалы', title2: 'Сериалы', filters: { subscribed: 1 }, async: false },
                { items: 'watching', type: 'movie', from: 'movies', id: 'unwatched', title: 'Недосмотренные фильмы', title2: 'Фильмы' },
                { items: 'bookmarks', type: null, from: null, id: 'bookmarks', title: 'Закладки' },
                { items: 'history', type: null, from: null, id: 'history', title: 'История' }
            ];
            makeDocument('Загрузка моих подписок');
            var doc = docs[currentType]

            doc.addEventListener("select", function(event) {
                var selectedElement = event.target;
                var targetElement = selectedElement.getAttribute('id');
                if (targetElement == "create") {
                    showBookmarkCreationFrom();
                }
            });
            doc.addEventListener("holdselect", function(event) {
                var selectedElement = event.target;
                var targetElement = selectedElement.getAttribute('id');
                console.log(targetElement);
                if (selectedElement.tagName == "listItemLockup" && targetElement != "deleted" && targetElement != "create" && targetElement != "") {
                    deleteApproval(targetElement);
                }
            });
            doc.addEventListener("load", function() {
                //doc.load = true;
                Network.loadItemsFrom(itemsToLoad[0], function(result, options) {
                    saveTopShelf(result.items, topShelfOptions.unwatched, options.title);
                    if (result.items.length > 0) {
                        var serials = getItemsTemplate(result, options);
                        var showTemplate = Templates.fragments.itemsLookup(serials, options, serials.length);
                    }
                    var template = Templates.mySubscribesPage(showTemplate || '');
                    replaceElement(template, "document", null, 5, doc);
                }, true);
                Network.loadItemsFrom(itemsToLoad[1], function(result, options) {
                    saveTopShelf(result.items, topShelfOptions.unwatched, options.title);
                    if (result.items.length > 0) {
                        var movies = getItemsTemplate(result, options);
                        var movieString = Templates.fragments.itemsLookup(movies, options, movies.length);
                    }
                    if (movieString) {
                        replaceElement(movieString, "section", null, 1, doc);
                    }
                }, true);
                Network.loadItemsFrom(itemsToLoad[2], function(result, options) {
                    var bookmarks = result.items.map(item => {
                        getBookmarks(doc, item.id);
                        options['title2'] = item.title
                        options['id'] = item.id
                        return Templates.fragments.itemsLookup(null, options, item.count);
                    })
                    replaceElement(`${bookmarks.join('')}`, null, "create", 3, doc);
                }, true);
                Network.loadItemsFrom(itemsToLoad[3], function(result, options) {
                    var movies = getItemsTemplate(result, options);
                    replaceElement(`${movies.join('')}`, null, "history", 1, doc);
                }, true);
            });
            doc.addEventListener("appear", function() {
                console.log("appear");
                //if (doc.load) { console.log("appear"); doc.load = false; return; }
                Network.loadItemsFrom(itemsToLoad[0], function(result, options) {
                    saveTopShelf(result.items, topShelfOptions.unwatched, options.title);
                    if (result.items.length > 0) {
                        var serials = getItemsTemplate(result, options);
                        replaceElement(`${serials.join('')}`, null, options.type, 2, doc);
                        replaceElement(`${result.items.length}`, null, 'count' + options.type, 2, doc);
                    }
                }, true);
                Network.loadItemsFrom(itemsToLoad[1], function(result, options) {
                    saveTopShelf(result.items, topShelfOptions.unwatched, options.title);
                    if (result.items.length > 0) {
                        var movies = getItemsTemplate(result, options);
                        replaceElement(`${movies.join('')}`, null, options.type, 2, doc);
                        replaceElement(`${result.items.length}`, null, 'count' + options.type, 2, doc);
                    }
                }, true);
                Network.loadItemsFrom(itemsToLoad[2], function(result, options) {
                    result.items.forEach(item => {
                        getBookmarks(doc, item.id);
                        replaceElement(`${item.count}`, null, 'count' + item.id, 2, doc);
                    })
                }, true);
                Network.loadItemsFrom(itemsToLoad[3], function(result, options) {
                    var movies = getItemsTemplate(result, options);
                    replaceElement(`${movies.join('')}`, null, "history", 2, doc);
                }, true);
            });
        },

        showBookmarks(itemID) {
            Presenter.showLoading("Загрузка закладок");
            var itemsToLoad = [
                { items: 'bookmarks', type: null, from: "get-item-folders", id: 'bookmarks' + itemID, title: 'Закладки', filters: { item: itemID } },
                { items: 'bookmarks', type: null, from: null, id: 'bookmarks', title: 'Закладки' }
            ];
            Network.loadItemsFrom(itemsToLoad[0], function(result, options) {
                console.log(result);
                Network.loadItemsFrom(itemsToLoad[1], function(result2, options2) {
                    var buttons = result2.items.map(item => {
                        var checked = result.folders.find(folder => folder.id === item.id)
                        return Templates.fragments.bookmarksButton(itemID, item, checked)
                    })
                    var desc = !buttons ? "Закладки отсутствуют" : " "
                    buttons.push('<button onselect="KP.createBookmarkFolder()"><text>+ Создать закладку</text></button>');
                    var template = Templates.alert(options.title, desc, buttons.join(""));
                    var doc = Presenter.makeDocument(template, true);
                    Presenter.removeLoadingTemplate();
                    Presenter.modalDocument(doc);
                }, true);
            }, true);
        },

        createBookmarkFolder() {
            showBookmarkCreationFrom();
        },

        addToBookmark(itemID, folderID) {
            var itemToLoad = { items: 'bookmarks', type: null, from: "toggle-item", method: "POST", id: 'bookmarks' + itemID + folderID, title: 'Закладки', filters: { item: itemID, folder: folderID } }
            Network.loadItemsFrom(itemToLoad, function(result, options) {
                Presenter.dismissModal();
            }, true);
        },

        // LIBRARY
        libraryPage() {
            currentType = 'library';
            makeDocument('Загрузка библиотеки');
            var doc = docs[currentType]
            doc.addEventListener("load", function() {
                var filters = optionsLibrary.map((option, index) => Templates.fragments.lockup(option, index));
                var sort = optionsLibrary2[itemForLibrary.options2]
                var template = Templates.libraryPage(filters, sort);
                replaceElement(template, "document", null, 5);
                loadFiltered(itemForLibrary, optionsLibrary, optionsLibrary2)
            });
        },

        getDropDown(optionsIndex) {
            var settings = AppSettings.getAll();
            var values = {
                0: { id: 0, name: 'Отменить выбор' }
            }
            if (optionsLibrary[optionsIndex].items == "genres") {
                optionsLibrary[optionsIndex].filters['type'] = optionsLibrary[0].filters['type']
            }
            if (optionsLibrary[optionsIndex].title == "Год") {
                var thisYear = new Date().getFullYear();
                var years = Utils.range(1912, thisYear).reverse();
                years.forEach((year, index) => values[index + 1] = { id: year, name: year });
                showDropDown(values, optionsLibrary[optionsIndex])
            } else {
                Network.loadItemsFrom(optionsLibrary[optionsIndex], function(result, options) {
                    console.log(result)
                    result.items.forEach(item => {
                        if (optionsLibrary[optionsIndex].items == "types" && item.id == "4k") { return; } //fixed removed 4k type
                        if (settings.animeIsHidden.id && optionsLibrary[optionsIndex].items == "genres" && item.id == 25) { return; } //fixed removed Anime
                        values[item.id] = { id: item.id, name: item.title }
                    });
                    console.log(values);
                    showDropDown(values, options)
                }, true);
            }
        },

        getSort(type) {
            var values = {}
            optionsLibrary2.forEach((option, index) => values[index] = { id: index, name: option.title });
            var template = Templates.alertWithButtons('Сортировка', values);
            var doc1 = Presenter.makeDocument(template, true);
            doc1.addEventListener("select", function(event) {
                var selectedElement = event.target;
                if (selectedElement.tagName == "button") {
                    var id = selectedElement.getAttribute('id');
                    var text = selectedElement.getAttribute('textTitle');
                    if (type == 'actor') {
                        itemForActors.options2 = id
                    } else {
                        itemForLibrary.options2 = id
                    }
                    Presenter.dismissModal();
                    replaceElement('<text>' + text + ' <badge class="label" src="resource://button-dropdown" /></text>', "text", null, 5)
                    if (type == 'actor') {
                        loadFiltered(itemForActors, null, optionsLibrary2);
                    } else {
                        loadFiltered(itemForLibrary, optionsLibrary, optionsLibrary2);
                    }
                }
            });
            Presenter.modalDocument(doc1);
        },

        // SETTINGS
        settingsPage() {
            currentType = 'settings';
            makeDocument('Настройки');
            var doc = docs[currentType]
            doc.addEventListener("load", function() {
                var deviceName = 'KinopubApp'
                var savedName = AppStorage.getItem(KEYS.deviceName)
                deviceName += savedName ? ' (' + savedName + ')' : '';
                var template = Templates.settingsPage(deviceName);
                replaceElement(template, "document", null, 5, doc);
                loadChangelog(function() {
                    replaceElement(changelog, null, "changelog", 2);
                });
                API.getUserInfo(function(result) {
                    var regRusDate = Utils.rusDate(result.user.reg_date * 1000);
                    var endRusDate = Utils.rusDate(result.user.subscription.end_time * 1000);
                    var userInfo = '\nПользователь: ' + result.user.username + '\nДата регистрации: ' + regRusDate + '\n\n\nПодписка закончится: ' + endRusDate + '\nОсталось: ' + Math.round(result.user.subscription.days) + ' ' + Utils.declOfNum(Math.round(result.user.subscription.days), ['день', 'дня', 'дней']) + '\n\nDevice ID: ' + Device.vendorIdentifier;
                    replaceElement(userInfo, null, "userInfo", 2);
                });
                API.getDeviceInfo(saveDeviceSettings);
            });
        },

        getSettingsDropdown(key, id) {
            var values = AppSettings.getAllValues(key);
            var template = Templates.alertWithButtons(settingKeysLocal[key].title, values, key);
            var doc1 = Presenter.makeDocument(template, true);
            var activeParser = Presenter.activeParser(docs['settings']);
            doc1.addEventListener("select", function(event) {
                var selectedElement = event.target;
                var valueId = selectedElement.getAttribute('id');
                var value = values[valueId];
                AppSettings.set(key, value);
                if (key == settingKeys.userStream || key == settingKeys.userServer) {
                    var itemToLoad = { items: 'device', from: AppStorage.getItem(KEYS.deviceInfoID) + '/settings', method: 'POST', id: 'devicesettings', filters: {} }
                    itemToLoad.filters[(key == settingKeys.userStream) ? 'streamingType' : 'serverLocation'] = valueId
                    console.log(itemToLoad);
                    Network.loadItemsFrom(itemToLoad, saveDeviceSettings, true);
                }

                Presenter.dismissModal();
                activeParser.lsInput.stringData = '<decorationLabel>' + value.name + '</decorationLabel>';
                activeParser.lsParser.parseWithContext(activeParser.lsInput, activeParser.doc.getElementsByTagName("decorationLabel").item(id), 5);
                if (key == settingKeys.cartoonMode) { initApp(); }
            });
            Presenter.modalDocument(doc1);
        },

        videoWizard(step) {
            var title = (step == 1) ? '4K' : 'HDR';
            var desc = (step == 1) ? 'Поддерживает ли ваш телевизор 4К и у вас AppleTV 4K?' : 'Поддерживает ли ваш телевизор формат HDR?';
            var buttonYES = (step == 1) ? 'onselect="KP.videoWizard(2);"' : 'onselect="KP.setVideoSettings({support4k: true, supportHevc: true});"';
            var buttonNO = (step == 1) ? 'onselect="KP.setVideoSettings({support4k: false, supportHevc: false});"' : 'onselect="KP.setVideoSettings({support4k: true, supportHevc: false});"';
            var template = Templates.descriptiveAlert(desc, title, { buttonYES: buttonYES, buttonNO: buttonNO });
            var doc = Presenter.makeDocument(template, true);
            Presenter.modalDocument(doc);
        },

        setVideoSettings(params) {
            var itemToLoad = { items: 'device', from: AppStorage.getItem(KEYS.deviceInfoID) + '/settings', method: 'POST', id: 'devicesettings', filters: { support4k: params.support4k, supportHevc: params.supportHevc, mixedPlaylist: params.supportHevc } }
            Network.loadItemsFrom(itemToLoad, saveDeviceSettings, true);
            Presenter.dismissModal();
        },

        showHistory() {
            var template = Templates.descriptiveAlert(changelog, 'История изменений');
            var doc = Presenter.makeDocument(template, true);
            Presenter.modalDocument(doc);
        },

        showCreationDeviceName() {
            var options = { title: 'Введите имя устройства', placeholder: 'Название устройства', button: 'Применить' }
            var template = Templates.textFieldForm(options);
            var doc = docs['settings'];
            var doc1 = Presenter.makeDocument(template, true);
            doc1.addEventListener("select", function(event) {
                var textField = doc1.getElementsByTagName("textField").item(0);
                var keyboard = textField.getFeature("Keyboard");
                var text = keyboard.text;
                if (text.length > 3) {
                    AppStorage.setItem(KEYS.deviceName, text);
                    API.deviceNotify();
                    Presenter.dismissModal();
                    replaceElement('KinopubApp (' + text + ')', null, "device", 2, doc)
                } else {
                    replaceElement('<description style="color:red">Введите больше 3 символов</description>', 'description', null, 5, doc1)
                }
            });
            Presenter.modalDocument(doc1);
        },

        unlink() {
            var itemToLoad = { items: 'device', from: 'unlink', method: 'POST', id: 'deviceunlink' }
            Network.loadItemsFrom(itemToLoad, showActivationPage, true);
        },

        showAddKinopoiskKey() {
            var kinopoiskKey = AppStorage.getItem(KEYS.kinopoiskKey) ? AppStorage.getItem(KEYS.kinopoiskKey) : "";
            var options = { title: 'Введите API-KEY', placeholder: 'API-KEY', button: 'Применить' }
            var template = Templates.textFieldForm(options);
            var doc = docs['settings'];
            var doc1 = Presenter.makeDocument(template, true);
            doc1.addEventListener("select", function(event) {
                var textField = doc1.getElementsByTagName("textField").item(0);
                var keyboard = textField.getFeature("Keyboard");
                var text = keyboard.text;
                if (text.length > 3) {
                    AppStorage.setItem(KEYS.kinopoiskKey, text);
                    Presenter.dismissModal();
                    replaceElement('Да', null, "kinopoiskKey", 2, doc)
                } else {
                    replaceElement('<description style="color:red">Введите больше 3 символов</description>', 'description', null, 5, doc1)
                }
            });
            Presenter.modalDocument(doc1);
        },

        toggleDefaultBootUrl() {
            var doc = docs['settings'];
            var url = AppSettings.getDefaultUrl();
            console.log('Toggle URL', url);
            if (url) {
                AppSettings.removeDefaultUrl();
                replaceElement('Нет', null, "defaultBootUrl", 2, doc)
            } else {
                AppSettings.setDefaultUrl();
                replaceElement('Да', null, "defaultBootUrl", 2, doc)
            }
        },

        // SEARCH
        searchPage() {
            currentType = 'search';
            var settings = AppSettings.getAll();
            makeDocument('Поиск');
            var doc = docs[currentType]
            var activeParser = Presenter.activeParser(doc);
            doc.addEventListener("load", function() {
                var template = Templates.searchPage();
                replaceElement(template, "document", null, 5);
                var searchField = doc.getElementsByTagName("searchField").item(0);
                var keyboard = searchField.getFeature("Keyboard");
                keyboard.onTextChange = function() {
                    spinnerIn(searchField);
                    var searchText = keyboard.text;
                    if (searchText.length > 0) {
                        API.getSearchItems(searchText, function(xhr) {
                            if (xhr.status == 200) {
                                var searchResult = JSON.parse(xhr.responseText);
                                var searchResultMovies = '';
                                var searchResultSerials = '';
                                if (searchResult.items.length > 0) {
                                    // if (settings.cartoonMode.id) {
                                    //     Utils.onlyCartoon(searchResult);
                                    // }
                                    searchResult.items.forEach(item => {
                                        var itemPoster = Templates.fragments.itemPoster(item, '182', '274', 'true');
                                        if (item.type == 'serial' || item.type == 'docuserial' || item.type == 'tvshow') {
                                            searchResultSerials += itemPoster;
                                        } else {
                                            searchResultMovies += itemPoster;
                                        }
                                    });
                                    var shelf = '';
                                    var options = [{ movies: searchResultMovies, item: { id: 'Results', title: 'Фильмы' } },
                                        { movies: searchResultSerials, item: { id: 'Results', title: 'Сериалы' } }
                                    ];
                                    for (var index in options) {
                                        shelf += Templates.fragments.itemsShelf(options[index]);
                                    }
                                    activeParser.lsInput.stringData = shelf.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
                                    spinnerIn(searchField, false);
                                } else {
                                    activeParser.lsInput.stringData = Templates.fragments.list('Результаты отсутствуют');
                                    spinnerIn(searchField, false);
                                }
                            }
                        });
                    } else {
                        activeParser.lsInput.stringData = Templates.fragments.list('Поиск происходит по мере ввода текста от 1 символа.');
                        spinnerIn(searchField, false);
                    }
                    activeParser.lsParser.parseWithContext(activeParser.lsInput, doc.getElementsByTagName("collectionList").item(0), 2);
                }
            });
        },

        // TV PAGE
        TVPage() {
            currentType = 'tv';
            var itemsToLoad = [
                { items: 'playlists', id: 'playlists', title: 'Плейлисты', async: false },
                { items: 'tv', id: 'tv', title: 'Каналы Kinopub', async: false }
            ];
            makeDocument('Загрузка каналов');
            var doc = docs[currentType]

            doc.addEventListener("load", function() {
                Network.loadItemsFrom(itemsToLoad[1], function(result, options) {
                    console.log(result);
                    var channels = result.channels.map(channel => Templates.fragments.kpChannels(channel));
                    var template = Templates.TVPage(channels.join(""));
                    replaceElement(template, "document", null, 5, doc);
                }, true);
                Network.loadItemsFrom(itemsToLoad[0], function(result, options) {
                    var playlists = result.items.map(item => Templates.fragments.playlists(item));
                    replaceElement(`${playlists.join('')}`, null, "playlists", 2, doc);
                }, true);
            });
        },

        //
        showComments(id) {
            Presenter.showLoading('Загрузка комментариев');
            var itemToLoad = { items: 'items', from: 'comments', id: 'comments' + id, title: 'Комментарии', async: false, filters: { id: id } };
            Network.loadItemsFrom(itemToLoad, function(result, options) {
                var template = Templates.comments(result);
                var doc = Presenter.makeDocument(template, true);
                Presenter.pushDocument(doc);
            });
        },

        //
        changeButton(id, buttonStyle, oldButtonStyle, buttonPlaceholder, oldButtonPlaceholder) {
            var string = '<buttonLockup  class="smallButton" id ="changeButton" onselect="KP.addToWatchList(' + id + '); changeButton(\'' + id + '\',\'' + oldButtonStyle + '\',\'' + buttonStyle + '\',\'' + oldButtonPlaceholder + '\',\'' + buttonPlaceholder + '\');"><badge src="resource://' + buttonStyle + '" /><title>' + buttonPlaceholder + '</title></buttonLockup>';
            replaceElement(string, null, "changeButton", 5);
        },
        changeButtonUber(id, buttonStyle, oldButtonStyle) {
            var string = '<button style="padding: 0; width: 80; margin-top: 10" class="button playbutton banner-left" id ="changeButtonUber" onselect="KP.addToWatchList(' + id + '); changeButtonUber(\'' + id + '\',\'' + oldButtonStyle + '\',\'' + buttonStyle + '\');"><badge src="resource://' + buttonStyle + '" /></button>';
            replaceElement(string, null, "changeButtonUber", 5);
        },
        changeWatchingButton() {
            var string = ' ';
            replaceElement(string, null, "watchingButton", 5);
        },
        changeSeasonButton(number) {
            var activeParser = Presenter.activeParser();
            var selectedButton = activeParser.doc.getElementsByTagName("overlay").item(number);
            var state = selectedButton.getAttribute("id");
            var id = (state == '1') ? 0 : 1;
            var badge = (state == '1') ? '' : '<badge style="tv-align: right; tv-position: bottom-right; margin: 0;" src="resource://overlay-checkmark" />';
            activeParser.lsInput.stringData = '<overlay id="' + id + '" style="padding: 0">' + badge + '</overlay>';
            activeParser.lsParser.parseWithContext(activeParser.lsInput, selectedButton, 5);
        },
        showScreenshots(kinopoiskId, listNumber, uber) {
            // Kinopoisk.loadFromKinopoisk(kinopoisk.methods.getGallery, kinopoiskId, kinopoiskResult => {
            //     var template = (uber) ? Kinopoisk.uberScreenshotsTemplate(kinopoiskResult, kinopoiskId) : Kinopoisk.screenshotsTemplate(kinopoiskResult, listNumber);
            //     if (uber) {
            //         replaceElement(template, null, 'actors', 3);
            //     } else {
            //         var doc = Presenter.makeDocument(template, true);
            //         Presenter.pushDocument(doc);
            //     }
            // });
            Kinopoisk2.loadFromKinopoisk(kinopoisk2.methods.getStill, kinopoiskId, kinopoiskResult => {
                var template = (uber) ? Kinopoisk2.uberScreenshotsTemplate(kinopoiskResult, kinopoiskId) : Kinopoisk2.screenshotsTemplate(kinopoiskResult, listNumber);
                if (uber) {
                    replaceElement(template, null, 'actors', 3);
                } else {
                    var doc = Presenter.makeDocument(template, true);
                    Presenter.pushDocument(doc);
                }
            });
        },
        changeEpisodeButton(number, duration) {
            var domNumber = parseInt(number);
            var activeParser = Presenter.activeParser();
            var selectedButton = activeParser.doc.getElementsByTagName("decorationLabel").item(domNumber);
            var state = selectedButton.getAttribute("id");
            var id = (state == '1') ? 0 : 1;
            var labelWatch = (state == '1') ? '  ●' : '';
            activeParser.lsInput.stringData = '<decorationLabel id ="' + id + '">' + duration + labelWatch + '</decorationLabel>';
            activeParser.lsParser.parseWithContext(activeParser.lsInput, selectedButton, 5);
            skipCache = true;
        },
        sendMarktime(id, time, video, season) {
            var itemToLoad = {
                items: 'watching',
                type: null,
                from: 'marktime',
                id: 'watchingmarktime',
                filters: { id: id, time: time, video: video, season: season }
            }
            Network.loadItemsFrom(itemToLoad, null, true);
        },
        stopUberTrailer(poster) {
            if (uberTrailerPlayer) {
                uberTrailerPlayer.pause();
            }
        },
        toggleWatching(id, video, season) {
            API.getItem(id, function(xhr) {
                var result = JSON.parse(xhr.responseText)
                Trakt.watchedSeason(result.item.imdb, season, video);
                API.toggleWatching(id, video, season);
            });
        },
        addToWatchList(id) {
            API.getItem(id, function(xhr) {
                var result = JSON.parse(xhr.responseText)
                Trakt.syncWatchlist(result);
                API.toggleWatchlist(id);
            });
        },
        setRating(id) {
            var itemToLoad = { items: 'items', type: null, from: 'vote', id: id, title: 'Рейтинг Кинопаба', filters: { id: id, like: '' } }
            var values = {
                1: { id: 1, name: '👍' },
                0: { id: 0, name: '👎' }
            }
            var template = Templates.alertWithButtons(itemToLoad.title, values);
            var doc = Presenter.makeDocument(template, true);
            doc.addEventListener("select", function(event) {
                var selectedElement = event.target;
                var targetElement = selectedElement.getAttribute('id');
                if (selectedElement.tagName == "button" && targetElement) {
                    itemToLoad['filters']['like'] = targetElement
                    Network.loadItemsFrom(itemToLoad, function(result, options) {
                        console.log(result);
                        if (!result.voted) {
                            showText("Вы уже ставили оценку, изменить невозможно.", "Внимание!")
                        }
                    }, true);
                    Presenter.dismissModal();
                }
            });
            Presenter.modalDocument(doc);
        },
        showDeleteHistory(id, mid, isSerial) {
            var itemsToLoad = [
                { items: 'history', type: null, from: 'clear-for-media', method: 'POST', id: 'clear-for-media', title: '', filters: { id: mid } },
                { items: 'history', type: null, from: 'clear-for-item', method: 'POST', id: 'clear-for-item', title: '', filters: { id: id } },
                //{items: 'history', type: null, from: 'clear-for-season', method: 'POST', id: 'clear-for-season', title: '', filters: {id: ''}}
            ]
            if (isSerial) {
                var values = {
                    0: { id: 0, name: 'Удалить серию' },
                    1: { id: 1, name: 'Удалить сериал' },
                    //2: {id:2, name:'Удалить сезон'},
                    3: { id: 3, name: 'Отмена' }
                }
            } else {
                var values = {
                    1: { id: 1, name: 'Да' },
                    0: { id: 0, name: 'Нет' }
                }
            }
            var template = Templates.alertWithButtons('Удалить из истории', values);
            var doc = Presenter.makeDocument(template, true);
            doc.addEventListener("select", function(event) {
                var selectedElement = event.target;
                var targetElement = selectedElement.getAttribute('id');
                if (isSerial) {
                    if (selectedElement.tagName == "button" && targetElement == 3) {
                        Presenter.dismissModal();
                    } else if (selectedElement.tagName == "button" && targetElement) {
                        Network.loadItemsFrom(itemsToLoad[targetElement], deleteHistory, true);
                        Presenter.dismissModal();
                    }
                } else {
                    if (selectedElement.tagName == "button" && targetElement == 1) {
                        Network.loadItemsFrom(itemsToLoad[1], deleteHistory, true);
                        Presenter.dismissModal();
                    } else if (selectedElement.tagName == "button" && targetElement == 0) {
                        Presenter.dismissModal();
                    }
                }
            });
            Presenter.modalDocument(doc);
        },
        saveTopShelf(items, options, title) {
            saveTopShelf(items, options, title)
        }
    }
}());