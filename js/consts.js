const KEYS = {
    accessToken: "accessToken",
    refreshToken: "refreshToken",
    tokenExpires: "tokenExpires",
    topshelf: "topshelf_url",
    settings: "kpSettings",
    deviceInfoID: "deviceInfoID",
    deviceName: "deviceName",
    kinopoiskKey: "kinopoiskKey",
    traktAccessToken: "trakt_accessToken",
    traktRefreshToken: "trakt_refreshToken",
    traktExpiresToken: "trakt_expiresToken",
    tvBootUrl: "tvBootUrl",
    defaultBootUrlDenied: "defaultBootUrlDenied",
}

const KINOPUB = {
    apiBase: "https://kpserver.link/api/v1/",
    apiAuth: "https://kpserver.link/api/oauth2/",
    apiBaseExt: "https://kinopub.link/v1.1/",
    apiBaseExt2: "https://kpserver.link/api2/v1.1/",
    actorImgUrl: "https://kpserver.link/cdn/actors/",
    oldCdnUrl: 'https://cdn.service-kp.com/',
    cdnUrl: "https://kpserver.link/cdn/",
    proxyUrl: "https://kpserver.link",
    replaceApiCdn: false,
    clientID: "appletv2",
    clientSecret: "3z5124kj5liqy9gahnjr07qpj65ferl2"
}

const kinopoisk = {
    API: "https://ma.kinopoisk.ru/ios/5.0.0/",
    salt: "IDATevHDS7",
    clientID: "55decdcf6d4cd1bcaa1b3856",
    key: "3fe26b2303f07d1ad19bf0e9df6f6eee",
    imagesUrl: "https://st.kp.yandex.net/images/",
    actorImageUrl: "https://st.kp.yandex.net/images/actor_iphone/iphone360_",
    methods: {
        getGallery: "getGallery?filmID=",
        getKPFilmDetailView: "getKPFilmDetailView?filmID=",
        getStaffList: "getStaffList?type=all&filmID=",
    }
}

const kinopoisk2 = {
    API: "https://kinopoiskapiunofficial.tech/api/",
    key: "",
    imagesUrl: "https://st.kp.yandex.net/images/",
    actorImageUrl: "https://st.kp.yandex.net/images/actor_iphone/iphone360_",
    methods: {
        getGallery: "getGallery?filmID=",
        getKPFilmDetailView: "getKPFilmDetailView?filmID=",
        getStaffList: "v1/staff?filmId={id}",
        getFacts: "v2.2/films/{id}/facts",
        getStill: "v2.2/films/{id}/images?type=STILL&page=1",
        getStaffInfo: "v1/staff/{id}"
    }
}

const theMovieDB = {
    API: "https://api.themoviedb.org/3",
    key: "3979e44d2f0ca240214611f284eca713",
    imageUrl: "https://image.tmdb.org/t/p/h632",
    horizontalPosterUrl: "https://image.tmdb.org/t/p/w500",
    methods: {
        find: "/find/",
        tv: "/tv/",
        searchPerson: "/search/person?query=",
        person: "/person/"
    }
}

const trakt = {
    API: "https://api.trakt.tv",
    clientID: "874f09f2a47b4e11e81b1683fd4d3879e421eb196021f9f6b5e000cd32009f1d",
    clientSecret: "5f7a0b5eda427a67b7385b0ef7dbda47a91743549c1832ce11d502072869742a",
    redirectUri: "urn:ietf:wg:oauth:2.0:oob"
}

const fanart = {
    API: "http://webservice.fanart.tv/v3",
    key: "7a93c84fe1c9999e6f0fec206a66b0f5",
    methods: {
        movie: "/movies/",
        tv: "/tv/"
    }
}

const quality = {
    bestResolution: { id: 'bestResolution', name: 'Лучшее' },
    '1080p': { id: '1080p', name: '1080' },
    '720p': { id: '720p', name: '720' },
    '480p': { id: '480p', name: '480' }
}

const yesNo = {
    1: { id: 1, name: 'Да' },
    0: { id: 0, name: 'Нет' }
}

const topShelfOptions = {
    unwatched: { id: 'unwatched', name: 'Недосмотренные фильмы/сериалы' },
    premier: { 'id': 'premier', 'name': 'Премьеры' },
    hotMovies: { 'id': 'hotMovies', 'name': 'Горячие фильмы' },
    popularMovies: { 'id': 'popularMovies', 'name': 'Популярные фильмы' }
}

const settingKeys12 = {
    userServer: 'userServer',
    userStream: 'userStream',
    userQuality: 'userQuality',
    usePlaylistProxy: 'usePlaylistProxy',
    customPlayer: 'customPlayer',
    showDebugInfo: 'showDebugInfo',
    userAudioOption: 'userAudioOption',
    userAutoPlayOption: 'userAutoPlayOption',
    showTimeContinueAlert: 'showTimeContinueAlert',
    playNextSeason: 'playNextSeason',
    showRatingStroke: 'showRatingStroke',
    userTopShelfOption: 'userTopShelfOption',
    backgroundUpdateTopShelf: 'backgroundUpdateTopShelf',
    animeIsHidden: 'animeIsHidden',
    cartoonMode: 'cartoonMode',
    playerSelectQuality: 'playerSelectQuality',
}

const settingKeys13 = {
    uberStroke: 'uberStroke',
    //uberStrokeAutoTrailer: 'uberStrokeAutoTrailer'
}

const settingKeysMicro6 = {
    saveSubtitleSource: 'saveSubtitleSource',
    saveAudioSource: 'saveAudioSource',
}

const settingKeys = (function() {
    const val = (parseInt(Device.systemVersion) >= 13) ? Object.assign({}, settingKeys12, settingKeys13) : settingKeys12;
    return (Device.appIdentifier.includes('octavian') && Device.appVersion >= 6) || (Device.appIdentifier.includes('qinoa') && Device.appVersion >= 25) ? Object.assign(val, settingKeysMicro6) : val;
}());

const referencesType = {
    server: "server-location",
    streaming: "streaming-type"
}

const settingKeysLocal = {
    userStream: { title: 'Выбор потока', desc: 'HLS4 - адаптивный поток, подстраивается под скорость канала, имеются все аудио дорожки и субтитры.\nHLS2 - адаптивный поток, подстраивается под скорость канала, одна аудиодорожка, субтитры отсутствуют.\nHLS - неадаптивный поток, влияет настройка Выбор качества, одна аудиодорожка, субтитры отсутствуют.\nHTTP - неадаптивный поток, влияет настройка Выбор качества, имеются все аудио дорожки, субтитры отсутствуют.\n\nНА ДАННЫЙ МОМЕНТ ПОТОК HTTP НЕВОЗМОЖНО ИСПОЛЬЗОВАТЬ!' },
    userQuality: { title: 'Выбор качества', desc: 'Данная настройка влияет только на потоки HLS и HTTP.' },
    userServer: { title: 'Сервер', desc: 'Выбор стримингово сервера. Оптимальный сервер можно определить замером скорости через приложение KP Speed.' },
    usePlaylistProxy: { title: 'Обход блокировок', desc: 'Включать тем, у кого не работает просмотр. \nДанная настройка включает использование прокси. Включите если воспроизведение не работает, и остальные методы исправления не помогают.' },
    cartoonMode: { title: 'Режим мультфильмов (тест)', desc: 'Данная функция включает режим мультфильмов. Заменяет стандартное меню на меню мультфильмов.' },
    userTopShelfOption: { title: 'TopShelf', desc: 'Для обновления настроек TopShelf необходимо зайти на соответствующую страницу приложения и дождаться её загрузки. \n\nПосле чего настройки по отображению вступят в силу.' },
    backgroundUpdateTopShelf: { title: 'Обновление TopShelf в фоне (test)', desc: 'Данная опция является тестовой. При возникновении проблем, рекомендуем отключить ее и отписаться о проблемах в поддержку.' },
    userAudioOption: { title: 'AC3', desc: 'По-умолчанию воспроизводится дорожка AC3, если такова имеется.' },
    userAutoPlayOption: { title: 'Автоматическое воспроизведение следующих серий', desc: '' },
    showTimeContinueAlert: { title: 'Спрашивать о продолжении воспроизведения', desc: 'Данная настройка позволять включить или отключить диалог Продолжить показ или Воспроизвести с начала.' },
    playNextSeason: { title: 'Автовоспроизведение следующего сезона', desc: 'Данная настройка включает автоматическое воспроизведение следующего сезона при просмотре сериала.' },
    saveSubtitleSource: { title: 'Сохранять источник субтитров', desc: 'Данная настройка включает сохранение источника субтитров после повторного включения сериала. Если значение Нет - сохраненные субтитры сбрасываются после выхода из плеера.' },
    saveAudioSource: { title: 'Сохранять источник аудио', desc: 'Данная настройка включает сохранение источника аудио после повторного включения сериала. Если значение Нет - сохраненное аудио сбрасывается после выхода из плеера.' },
    showRatingStroke: { title: 'Отображение рейтингов', desc: 'Отображение рейтингов на обложках в списках фильмов/сериалов.' },
    animeIsHidden: { title: 'Скрыть Аниме', desc: 'При включении данной настройки в списках фильмов/сериалов не отображается Аниме.' },
    customPlayer: { title: 'Кастомный плеер', desc: 'Кастомный плеер основан на плеере от Apple.\nПри тройном нажатии по трекпаду можно включить/выключить отображение статистики на экране. Сохраняет выбранную дорожку при переключении серий, а так же автоматически включает форсированные субтитры.\n\nРекомендуем использовать кастомный плеер.' },
    showDebugInfo: { title: 'Показывать инфо о потоке в описании', desc: 'Данная настройка включает отображение информации о текущем потоке в шторку с описанием воспроизводимого контента. Настройка применинама для кастомного плеера. Информация о потоке в шторке не обновляется в реальном времени, только при открытие/закрытие шторки.' },
    uberStroke: { title: 'Альтернативный внешний вид', desc: 'Новый вид для tvOs 13' },
    uberStrokeAutoTrailer: { title: 'Автовоспроизведение трейлера', desc: 'Для нового вида начиная с tvOs 13' },
    playerSelectQuality: { title: 'Выбор качества в плеере (НЕСТАБИЛЬНО)', desc: 'Данная настройка включает возможность выбора качества в плеере. \nДля установки разрешения по умолчанию надо установить желаемое качество в пункте «Выбор качества». \nПри включении данного режима происходит автоматическое переключение на поток HLS: \n- отсутствуют субтитры. \n- если не работает проcмотр в HDR, в пункте: «Настройка видео» установить HDR - Нет. \n\nМОЖЕТ РАБОТАТЬ НЕСТАБИЛЬНО. \nНедоступно на старых версиях приложения. Если при попытке запуска приложение вылетает - отключите эту функцию' },
}

const LanguagesLocal = {
    rus: "Русский",
    eng: "Английский",
    ukr: "Украинский",
    fre: "Французкий",
    ger: "Немецкий",
    spa: "Испанский",
    ita: "Итальянский",
    por: "Португальский",
    fin: "Финский",
    jpn: "Японский",
    chi: "Китайский",
    pol: "Польский",
    swe: "Шведский",
    nor: "Норвежский",
    dut: "Голландский",
    nld: "Нидерландский",
    dan: "Датский",
    kor: "Корейский",
    hin: "Хинди",
    heb: "Иврит",
    gre: "Греческий",
    hun: "Венгерский",
    ice: "Исландский",
    rum: "Молдавский",
    slo: "Словацкий",
    tur: "Турецкий",
    cze: "Чешский",
    ron: "Румынский",
    baq: "Баскский",
    fil: "Филиппинский",
    glg: "Галицкий",
    hrv: "Хорватский",
    ind: "Индонезийский",
    may: "Малайский",
    nob: "Норвежский Бокмл",
    tha: "Тайский",
    vie: "Вьетнамский",
    ara: "Арабский",
    cat: "Каталонский",
    lit: "Литовский",
    lav: "Латышский",
    est: "Эстонский",
    slv: "Словенский",
    bul: "Болгарский",
    und: "Неопределенный",
    unk: "Неопределенный"
}

const ParserActions = {
    /** Append the result of the parse operation as children of the context node. */
    APPEND_AS_CHILDREN: 1,
    /** Insert the result of the parse operation as the immediately following sibling of the context node. */
    INSERT_AFTER: 4,
    /** Insert the result of the parse operation as the immediately preceding sibling of the context node. */
    INSERT_BEFORE: 3,
    /** Replace the context node with the result of the parse operation. */
    REPLACE: 5,
    /** Replace all the children of the context node with the result of the parse operation. */
    REPLACE_CHILDREN: 2
}

//*
