var TV = (function() {
    var chosenChannel = "";

    function getItem(url, show, channel, isOTT, isEDEM, fav) {
        var rusDate = show ? Utils.rusDate(show.time * 1000, { hour: 'numeric', minute: 'numeric' }) : '';
        var name = show ? show.name.replace(/"/g, "").replace(/>/g, "&lt;").replace(/</g, "&gt;").replace(/'/g, "").replace(/[\r\n]+/gm, " ") : channel.title;
        var desc = show ? show.descr.replace(/"/g, "").replace(/>/g, "&lt;").replace(/</g, "&gt;").replace(/'/g, "").replace(/[\r\n]+/gm, " ") : null;
        var autoHighlight = (chosenChannel == channel.id) ? 'autoHighlight="true"' : '';
        var decoration = show ? (show.rec == 1) ? '<decorationLabel class="label">●</decorationLabel>' : '' : '';
        var img = show ? 'http://spacetv.in/images/' + show.img : null;
        var onplay = fav ? 'TV.addToFavorite(' + channel.id + ', \'' + (isOTT) ? 'ott' : 'edem' + '\')' : 'TV.removeFromFavorite(' + channel.id + ', \'' + (isOTT) ? 'ott' : 'edem' + '\')';
        if (isOTT) {
            var onholdselect = show ? (show.rec == 1) ? 'onholdselect = "TV.setChosenChannel(' + channel.id + '); TV.showTVProgram(' + channel.id + ', \'' + channel.title + '\', \'' + show.time + '\', \'' + channel.url + '\', \'ott\')"' : '' : '';
        }
        if (isEDEM) {
            var onholdselect = show ? (show.rec == 1) ? 'onholdselect = "TV.setChosenChannel(' + channel.id + '); TV.showTVProgram(' + show.ch_id + ', \'' + channel.title + '\', \'' + show.time + '\', \'' + channel.url + '\', \'edem\')"' : '' : '';
        }
        return '<listItemLockup ' + autoHighlight + ' style="height: 90;" onplay="' + onplay + '" ' + onholdselect + ' onselect="TV.setChosenChannel(' + channel.id + '); playTV(\'' + channel.url + '\', \'' + channel.title + '\', \'' + name + '\', \'' + desc + '\', \'' + img + '\', \'' + url + '\')"><img style="tv-placeholder:tv; tv-position:left; margin: 0 20;" src ="' + img + '" width="90" height="90" /><title style="tv-align:left; margin: 0 20;">' + channel.title + '</title><subtitle class="text">' + rusDate + ' ' + name + '</subtitle>' + decoration + '</listItemLockup>';
    }

    function loadProgram(options, callback) {
        var groups = (options.isOTT || options.isEDEM) ? Utils.unique(options.results) : null;
        var favID = (options.isOTT) ? 'favoriteChannels' : 'edemFavoriteChannels';
        if (AppStorage.getItem(favID)) {
            var favoriteChannels = AppStorage.getItem(favID).split(',');
        }
        var allChannels = '';
        API.getProgramNow(function(resultNow) {
            if (groups) {
                if (favoriteChannels) {
                    allChannels += '<grid rowCount="3" style="tv-line-spacing: 30; tv-interim-spacing: 30; margin: 0 0 80 0"><header><title>ИЗБРАННЫЕ</title></header><section>';
                    for (j = 0; j < favoriteChannels.length; j++) {
                        for (i = 0; i < options.results.length; i++) {
                            var channel = options.results[i];
                            if (favoriteChannels[j] == channel.id) {
                                if (options.isOTT) {
                                    var show = resultNow[channel.id]
                                } else if (options.isEDEM) {
                                    var show = Object.values(resultNow).find(show => show.channel_name.indexOf(channel.title) > -1);
                                }
                                allChannels += getItem(options.url, show, channel, options.isOTT, options.isEDEM, true);
                            }
                        }
                    }
                    allChannels += '</section></grid>'
                }
                for (h = 0; h < groups.length; h++) {
                    allChannels += '<grid rowCount="3" style="tv-line-spacing: 30; tv-interim-spacing: 30; margin: 0 0 80 0"><header><title>' + groups[h].toUpperCase() + '</title></header><section>';
                    for (i = 0; i < options.results.length; i++) {
                        var channel = options.results[i];
                        if (channel.group == groups[h]) {
                            if (options.isOTT) {
                                var show = resultNow[channel.id]
                            } else if (options.isEDEM) {
                                var show = Object.values(resultNow).find(show => show.channel_name.indexOf(channel.title) > -1);
                            }
                            allChannels += getItem(options.url, show, channel, options.isOTT, options.isEDEM);
                        }
                    }
                    allChannels += '</section></grid>'
                }
            } else {
                var channels = options.results.map(channel => {
                    return '<lockup onselect="playTV(\'' + channel.url + '\', \'' + channel.title + '\', null , null, null)"><img style="tv-placeholder:tv;" src ="' + baseURL + 'picons/' + encodeURIComponent(channel.title) + '.png" width="160" height="160" /><title>' + channel.title + '</title></lockup>';
                });
                allChannels = '<grid><header><title>Каналы</title></header><section>' + channels.join("") + '</section></grid>';
            }
            callback(allChannels);
        });
    }

    return {
        showTVProgram(id, channelName, time, stream, type) {
            Presenter.showLoading('Загрузка программы');
            API.getProgram(id, function(result) {
                var arhiv = [],
                    program = [];
                result.epg_data.forEach(show => {
                    var currentDate = new Date;
                    var date = new Date(show.time * 1000);
                    var item = TVTemplates.fragments.item(show, stream, channelName, type, time);
                    (date > currentDate) ? program.push(item): arhiv.push(item);
                });
                var template = TVTemplates.tvProgramPage(arhiv, program);
                var doc = Presenter.makeDocument(template, true);
                Presenter.pushDocument(doc);
            });
        },

        parseM3U(url, title) {
            var template = Templates.loading('Загрузка плейлиста');
            var doc = Presenter.makeDocument(template, true);
            Presenter.pushDocument(doc);
            var domImplementation = doc.implementation;
            var lsParser = domImplementation.createLSParser(1, null);
            var lsInput = domImplementation.createLSInput();
            var isOTT = (title.toLowerCase().indexOf("ott") == 0);
            var isEDEM = (title.toLowerCase().indexOf("edem") >= 0);
            var results = [];
            var options = { title: title, url: url, isOTT: isOTT, isEDEM: isEDEM }

            doc.addEventListener("load", function() {
                API.getPlaylist(url, function(result) {
                    var lines = result.split('\n');
                    var cannel = {};
                    lines.forEach(line => {
                        line = line.replace(/\n/g, "").replace(/\r/g, "");
                        if (line.indexOf("#EXTINF") == 0) {
                            cannel.title = line.split(',')[1].replace(/"/g, "&apos;");
                            cannel.group = line.split('\"')[1]
                        } else if (line.indexOf("#EXTGRP") == 0) {
                            cannel.group = line.split(':')[1];
                        } else if (line.indexOf("http") == 0) {
                            cannel.url = line;
                            cannel.id = 0;
                            if (isOTT) {
                                cannel.id = line.replace(/.+\/(.+?)\.m3u8/, '$1');
                            }
                            if (isEDEM) {
                                cannel.id = line.replace(/.+\/(.+?)\/index\.m3u8/, '$1');
                            }
                            results.push(cannel);
                            cannel = {};
                        }
                    });
                    options['results'] = results
                    loadProgram(options, function(allChannels) {
                        var template = TVTemplates.playlistPage(title, allChannels);
                        lsInput.stringData = template.replace(/&/g, "&amp;").replace(/'/g, "&apos;");
                        lsParser.parseWithContext(lsInput, doc.getElementsByTagName("document").item(0), 5);
                    })
                });
            });

            //setTimeout(function () {
            doc.addEventListener("appear", function() {
                loadProgram(options, function(allChannels) {
                    lsInput.stringData = allChannels.replace(/&/g, "&amp;").replace(/'/g, "&apos;");;
                    lsParser.parseWithContext(lsInput, doc.getElementsByTagName("collectionList").item(0), 2);
                });
            });
            //}, 5000);
        },

        setChosenChannel(id) {
            chosenChannel = id;
        },

        addToFavorite(id, type) {
            var favID = (type == 'ott') ? 'favoriteChannels' : 'edemFavoriteChannels';
            if (AppStorage.getItem(favID)) {
                var newFavorite = AppStorage.getItem(favID).split(',');
                if (newFavorite.indexOf(id.toString()) > -1) {
                    return;
                } else {
                    newFavorite.push(id);
                }
            } else {
                var newFavorite = [];
                newFavorite.push(id);
            }
            AppStorage.setItem(favID, newFavorite.join());
            //var doc = getActiveDocument();
            //var domImplementation = doc.implementation;
            //var lsParser = domImplementation.createLSParser(1, null);
            //var lsInput = domImplementation.createLSInput();  
            //lsInput.stringData = newFavorite;
            //lsParser.parseWithContext(lsInput, doc.getElementById('favorite'), 1);
        },

        removeFromFavorite(id, type) {
            var favID = (type == 'ott') ? 'favoriteChannels' : 'edemFavoriteChannels';
            if (AppStorage.getItem(favID)) {
                var oldFavorite = AppStorage.getItem(favID).split(',');
                for (i = 0; i < oldFavorite.length; i++) {
                    if (oldFavorite[i] == id.toString()) {
                        oldFavorite.splice(i, 1);
                    }
                }
            }
            if (oldFavorite.length > 0) {
                Apptorage.setItem(favID, oldFavorite.join());
            } else {
                AppStorage.removeItem(favID);
            }
        }
    }
}());