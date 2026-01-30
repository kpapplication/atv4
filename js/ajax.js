var Ajax = (function() {
    var requests = []

    function serialize (obj) {
        var str = [];
        for(var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + obj[p]);
            }
        return str.join("&");
    }

    function _query(method, url, headers, qParams, bParams, callback, async = true) {
        console.log(`Ajax._query [${method}] - ${url}`, headers, qParams, bParams, async);
        headers = headers || {};
        qParams = qParams || {};
        bParams = bParams || {};
        method = (method == "POST") ? "POST" : "GET";

        var xhr = new XMLHttpRequest();
        xhr.timeout = 10000;
        requests.push(xhr);
        var sep = (url.indexOf("?") == -1) ? "?" : "&";
        var postBody = (method == "POST") ? JSON.stringify(bParams) : null;

        url = url + sep + serialize(qParams);
        xhr.open(method, encodeURI(url), async);
        for(var name in headers) {
            if (headers.hasOwnProperty(name)) {
                xhr.setRequestHeader(name, headers[name]);
            }
        }
        // xhr.onreadystatechange = function() {
        //     try {
        //         if (xhr.readyState == 4) {
        //             if (callback) {
        //                 callback(xhr);
        //             }
        //             Utils.remove(requests, xhr);
        //         }
        //     } catch (err) {
        //         console.error('Aborting request ' + url + '. Error: ' + err);
        //         xhr.abort();
        //         Utils.remove(requests, xhr);
        //         callback(xhr);
        //         //callback(new Error("Error making request to: " + url + " error: " + err));
        //     }
        // };
        xhr.onload = function() {
            console.log(xhr.readyState)
            if (callback) {
                callback(xhr);
            }
            Utils.remove(requests, xhr);

            try {
                var json = JSON.parse(xhr.responseText);
                if (json && json.error) {
                    Log.sendSentry(`[${method}] ${url} ${xhr.status}: ${xhr.responseText}`, xhr);
                }
            } catch (e) {
                // ignore
            }
        };
        xhr.onerror = function() {
            console.log('error status: ' + xhr.status + ' ' + xhr.responseText);
            if (callback) {
                callback(xhr);
            }
            Utils.remove(requests, xhr);

            Log.sendSentry(`[${method}] ${url} ${xhr.status}: ${xhr.responseText}`, xhr);
        };
        if (postBody) { xhr.send(postBody); } else { xhr.send(); }
        return xhr;
    }

    function appendToken(url, token) {
        var sep = (url.indexOf("?") == -1) ? "?" : "&";
        return url + sep + "access_token=" + token;
    }

    function appendUsername(url, username) {
        var sep = (url.indexOf("?") == -1) ? "?" : "&";
        return url + sep + "meta_username=" + username;
    }

    return {
        get: function(url, headers, params, callback, async) {
            return _query("GET", url, headers, params, null, callback, async);
        },

        post: function(url, headers, params, callback, async) {
            return _query("POST", url, headers, null, params, callback, async);
        },

        aget: function(url, headers, params, callback, token, async) {
            url = appendToken(url, token);
            if (typeof UserInfo !== "undefined" && UserInfo.username) {
                url = appendUsername(url, UserInfo.username);
            }
            return Ajax.get(url, headers, params, callback, async);
        },

        apost: function(url, headers, params, callback, token, async) {
            url = appendToken(url, token);
            if (typeof UserInfo !== "undefined" && UserInfo.username) {
                url = appendUsername(url, UserInfo.username);
            }
            return Ajax.post(url, headers, params, callback, async);
        },
        apostInUrl: function(url, headers, params, callback, token, async) {
            url = appendToken(url, token);
            if (typeof UserInfo !== "undefined" && UserInfo.username) {
                url = appendUsername(url, UserInfo.username);
            }
            return _query("POST", url, headers, params, params, callback, async, true);
        },
        abortAll: function() {
            requests.forEach(function(request) {
                request.abort()
            })
        }
    }
}());