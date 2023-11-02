var TMDB = (function() {
  var _headers = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}

    return {
        loadFrom(method, imdbID, tmdbID, callback, async = true) {
            if (imdbID) { imdbID = 'tt' + imdbID; }

            var themovieDBAuthUrl = theMovieDB.API + method + (imdbID || tmdbID)
            var result = Cache.get(themovieDBAuthUrl);
            if (result != undefined) {
                console.log('Loading "' + themovieDBAuthUrl + '" from cache');
                callback(result);
                return;
            }
            console.log(themovieDBAuthUrl)
            var _callback = function(themovieDBTemplateXHR) {
              if (themovieDBTemplateXHR && themovieDBTemplateXHR.status == 0) { callback(null); return; }
              var themovieDBResult = JSON.parse(themovieDBTemplateXHR.responseText);
              console.log(themovieDBResult);
              Cache.set(themovieDBAuthUrl, themovieDBResult, 60);
              callback(themovieDBResult);
            }

            var params = {
              'api_key': theMovieDB.key,
              'language': "ru-RU",
            };
            if (imdbID) { params['external_source'] = "imdb_id" }
            Ajax.get(themovieDBAuthUrl, _headers, params, _callback, async);
          }
    }
}());