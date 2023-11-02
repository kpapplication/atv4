var Trakt = (function() {
    var refreshTimer;
    const traktType = {
      movie: "movies",
      tv: "shows"
    }
    const searchType = {
      movie: "movies",
      tv: "serial"
    }
    const traktState = {
      playing: 'start',
      paused: 'pause',
      end: 'stop',
      unknown: ''
    }
    aHeaders = function() {
      return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + AppStorage.getItem(KEYS.traktAccessToken),
        'trakt-api-version': '2',
        'trakt-api-key': trakt.clientID
      }
    }
    templates = {
      fragments: {
        item(result, index, type, searchType) {
          var itemToLoad = { items: 'items', from: null, id: 'search' + encodeURIComponent(result.title), title: result.title, async: false, filters: { title: encodeURIComponent(result.title), type: searchType } };
          return `<listItemLockup>
                    <ordinal>${(index+1)}</ordinal>
                    <title id="title${index}">${result.title}</title>
                    <decorationLabel>${result.year} год</decorationLabel>
                    <relatedContent>
                      <itemBanner>
                        <heroImg style="tv-placeholder:${type}" id="${index}"/>
                        <row style="tv-align:center">
                          <buttonLockup id="checkmark${result.ids.trakt}" onselect="Trakt.traktSync(${result.ids.trakt},'${type}', null, 'reco')">
                            <badge src="resource://button-checkmark"/>
                            <title>Отметить</title>
                          </buttonLockup>
                          <buttonLockup id="remove${result.ids.trakt}" onselect="Trakt.hideReco(${result.ids.trakt}, '${type}')">
                            <badge src="resource://button-remove"/>
                            <title>Убрать</title>
                          </buttonLockup>
                          <buttonLockup onselect="KP.nextPage('${encodeURIComponent(JSON.stringify(itemToLoad))}')">
                            <badge src="resource://button-more"/>
                            <title>Найти</title>
                          </buttonLockup>
                        </row>
                        <row style="tv-align:center;">
                          <buttonLockup onselect="Trakt.loadReco('${type}', true)" style="width: 400; height: 60;">
                            <text>Обновить список</text>
                          </buttonLockup>
                        </row>
                      </itemBanner>
                    </relatedContent>
                  </listItemLockup>`;
        }
      },

      traktReco(items) {
        return `<document>
                  <compilationTemplate>
                    <list>
                      <header><title>Рекомендации Trakt.TV</title></header>
                      <section>
                        ${items}
                      </section>
                    </list>
                  </compilationTemplate>
                </document>`;
      }
    }

    function saveTokens(xhr) {
      var result = JSON.parse(xhr.responseText);
      var expiries = (Date.now() + (3600 * 24 * 90));
      AppStorage.setItem(KEYS.traktAccessToken, result.access_token);
      AppStorage.setItem(KEYS.traktRefreshToken, result.refresh_token);
      AppStorage.setItem(KEYS.traktExpiresToken, expiries);
    }

    return {
        checkTrakToken() {
          var token = AppStorage.getItem(KEYS.traktAccessToken);
          var expires = AppStorage.getItem(KEYS.traktExpiresToken) || Date.now();
          if (expires - Date.now() < (3600 * 24 * 30)) { return false; }
          return (token && token != "undefined")
        },

        traktOauth() {
            API.traktDeviceCode(function(xhr) {
              if (xhr.status == 200) {
                var result = JSON.parse(xhr.responseText);
                var template = Templates.showCode(result.user_code, 'Откройте ' + result.verification_url + ' и введите отображаемый ниже код для регистрации устройства.');
                var doc = Presenter.makeDocument(template);
                Presenter.modalDocument(doc);
                refreshTimer = setInterval(function () { Trakt.traktGetToken(result.device_code)}, result.interval*1000)       
              }
            });
        },  
          
        traktGetToken(deviceCode) {
            API.traktToken(deviceCode, function(xhr) {
              if (xhr.status == 200) {
                saveTokens(xhr)
                clearInterval(refreshTimer)
                Presenter.dismissModal();
              }
            });
        },
          
        traktGetTokenByRefreshToken() {
            var refreshToken = AppStorage.getItem(KEYS.traktRefreshToken)
            API.traktRefreshToken(refreshToken, function(xhr) {
              console.log(xhr);
              if (xhr.status == 200) {
                saveTokens(xhr)
              } else if (xhr.status == 400) {
                Trakt.traktOauth()
              }
            });
        },

        traktScrobble(type, state, imdb, time, duration, trakt) {
            if (traktState[state] == "" || traktState[state] == undefined) { return; }
            if (imdb && Trakt.checkTrakToken()) {
                imdb = Utils.fixIMDB(imdb);
                var progress = Math.round(time / duration * 100)
                var traktBody = {"movie": {"ids": {"imdb": "tt" + imdb}},"progress": progress}
                if (type == "serial") { traktBody = {"episode": {"ids": {"trakt": trakt}},"progress": progress} }
                API.traktScrobble(traktState[state], traktBody, aHeaders());
            }
        },

        traktSeasonInfo(imdb, number, callback) {
            if (imdb && Trakt.checkTrakToken()) {
                imdb = Utils.fixIMDB(imdb);
                API.traktSeasonInfo(imdb, number, aHeaders(), function(xhr) {
                    var json = JSON.parse(xhr.responseText);
                    callback(json);
                });
            }
        },

        traktSync(id, type, imdb, page) {
          var traktBody = {}
            if (imdb) {
              traktBody[traktType[type]] = [{"ids": {"imdb": "tt" + id}}];
            } else {
              traktBody[traktType[type]] = [{"ids": {"trakt": + id}}];
            }
            API.traktSyncHistory(traktBody, aHeaders(), function(xhr) {
                if (page) { Trakt.makeDisabled(id, 'checkmark'); }
            });
        },

        watchedSeason(imdb, season, video) {
          if (imdb && Trakt.checkTrakToken()) {
            imdb = Utils.fixIMDB(imdb);
            var traktBody = {"movies": [{"ids": {"imdb": "tt" + imdb}}]}
            if (season) {
              var traktBody = {"shows": [{"ids": {"imdb": "tt" + imdb},"seasons":[{"number": season}]}]}
              if (video) { traktBody['shows'][0]['seasons'][0]['episodes'] = [{"number": video}] }
            } else {
              var traktBody = {"movies": [{"ids": {"imdb": "tt" + imdb}}]}
            }
            API.traktSyncHistory(traktBody, aHeaders());
          }
        },

        syncWatchlist(result) {
          if (result.item.imdb && Trakt.checkTrakToken()) {
            var imdb = Utils.fixIMDB(result.item.imdb);
            var traktBody = {"shows": [{"ids": {"imdb": "tt" + imdb}}]}
            if (result.item.subscribed) {
              var remove = "/remove"
            }
            API.traktSyncWatchlist(traktBody, aHeaders(), remove)
          }
        },

        makeDisabled(id, type) {
            var button = '<buttonLockup disabled="true"><badge src="resource://button-' + type + '"/><title>' + (type == "checkmark" ? "Отметить" : "Убрать") + '</title></buttonLockup>'
            Utils.replaceElement(button, null, type + id, ParserActions.REPLACE)
        },

        showTraktReco(type) {
          if (Trakt.checkTrakToken()) {
            Presenter.showLoading('Загрузка рекомендаций');
            Trakt.loadReco(type);
          } else { Trakt.traktOauth() }
        },

        loadReco(type, update) {
          API.traktRecomendations(traktType[type], null, aHeaders(), function(xhr) {
            console.log(xhr);
            var results = JSON.parse(xhr.responseText);
            var recomendations = "";
            var ids = results.map((result, index) => {
              recomendations += templates.fragments.item(result, index, type, searchType[type]);
              var ids = {tmdb: result.ids.tmdb};
              if (result.ids.tvdb) {ids.tvdb = result.ids.tvdb}
              return ids;
            });
            var template = templates.traktReco(recomendations);
            var doc = Presenter.makeDocument(template, true);
            update ? Presenter.replaceDocument(doc) : Presenter.pushDocument(doc);
            var updateUI = function(index, result) {
              var heroImg = '<heroImg  style="tv-placeholder:' + result.type + '" src ="' + result.url + '" width="720" height="1080" />';
              Utils.replaceElement(heroImg, null, index, ParserActions.REPLACE, doc)
              if (result.title) {
                var title = "<title>" + (themovieDBResult.title || themovieDBResult.name) + "</title>"
                Utils.replaceElement(title, null, "title" + index, ParserActions.REPLACE, doc)
              }
            }
            ids.forEach((id, index) => {
              TMDB.loadFrom('/' + type + '/', null, id.tmdb, themovieDBResult => {
                if (themovieDBResult && themovieDBResult.poster_path) {
                  updateUI(index, {url: theMovieDB.imageUrl + themovieDBResult.poster_path, type: type, title: themovieDBResult.title || themovieDBResult.name})
                } else {
                  var _id = type == 'tv' ? id.tvdb : id.tmdb
                  FanArt.loadFrom(fanart.methods[type], _id, fanartResult => {
                    if (fanartResult.movieposter || fanartResult.tvposter) {
                      var posters = fanartResult[type+'poster']
                      var posterRu = Utils.findFirst(posters, e => e.lang === "ru")
                      var poster = posterRu || posters[0]
                      updateUI(index, {url: poster.url, type: type, title: null})
                    } 
                  }, true);
                }
              }, true);
            });
          });
        },

        hideReco(id, type) {
          API.traktRecomendations(traktType[type], id, aHeaders(), function(xhr) {
            makeDisabled(id, 'remove');
          });
        },
  }
}());