var FanArt = (function() {
    var _headers = {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
  
      return {
          loadFrom(method, imdbID, callback, async = true) {
              var fanartAuthUrl = fanart.API + method + imdbID
              var result = Cache.get(fanartAuthUrl);
              if (result != undefined) {
                  console.log('Loading "' + fanartAuthUrl + '" from cache');
                  callback(result);
                  return;
              }
              console.log(fanartAuthUrl)
              var _callback = function(fanartTemplateXHR) {
                if (fanartTemplateXHR && fanartTemplateXHR.status == 0) { return }
                var fanartResult = JSON.parse(fanartTemplateXHR.responseText);
                console.log(fanartResult);
                Cache.set(fanartAuthUrl, fanartResult, 60);
                callback(fanartResult);
              }
  
              var params = {
                'api_key': fanart.key,
                'language': "ru-RU",
              };
              Ajax.get(fanartAuthUrl, _headers, params, _callback, async);
            }
      }
  }());