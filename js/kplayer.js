var KPlayer = (function() {
    var mediaItems = [];
    var lastTime = 0;

    function getItemForDtPlayer(item, episode, season, externalID) {
        var settings = AppSettings.getAll();
        var title = "";
        var videoNumber = 0;
        var seasonNumber = 0;
        var type = item.subtype || item.type

        if (Utils.isSerial(item)) {
            if (item.seasons[season].episodes[episode].seasonNumber) {
                title = item.title.split(' / ')[0] + ' (s' + item.seasons[season].episodes[episode].seasonNumber + 'e' + item.seasons[season].episodes[episode].number + ')';
                videoNumber = item.seasons[season].episodes[episode].number;
                seasonNumber = item.seasons[season].episodes[episode].seasonNumber;
            } else {
                title = item.title.split(' / ')[0] + ' (s' + item.seasons[season].number + 'e' + item.seasons[season].episodes[episode].number + ')';
                videoNumber = item.seasons[season].episodes[episode].number;
                seasonNumber = item.seasons[season].number;
            }
            var video = item.seasons[season].episodes[episode];
        } else if (item.subtype == "multi") {
            title = item.title.split(' / ')[0] + '(e' + item.videos[episode].number + ')';
            videoNumber = item.videos[episode].number;
            var video = item.videos[episode];
        } else {
            title = item.title.split(' / ')[0];
            videoNumber = item.videos[episode].number;
            var video = item.videos[episode];
        }

        var resolutionIndex = video.files.findIndex(file => file.quality == settings.userQuality.id);
        if (settings.userQuality.id == quality.bestResolution.id || resolutionIndex == -1) {
            resolutionIndex = 0;
        }
        if (settings.userStream.code) {
            var videoUrl = video.files[resolutionIndex].url[settings.userStream.code];
        } else {
            var videoUrl = video.files[resolutionIndex].url.hls4;
        }
        if (settings.userStream.code == "hls4" && video.ac3 && settings.userAudioOption.id) {
            videoUrl += '&ac3default=1';
        }

        var mItem = {
            "id": Number(item.id),
            "imdb": Number(item.imdb),
            "title": title,
            "desc": item.plot,
            "poster": item.posters.big,
            "url": videoUrl,
            "video": Number(videoNumber),
            "season": Number(seasonNumber),
            "externalID": Number(externalID || 0), // TODO: Remove zero after update app to 1.4
            "subTitle": "",
            "watchingTime": null,
            "rating": "",
            "trakt": 0,
            "playlist": null
        };
        if (Utils.isSerial(item)) {
            mItem["subTitle"] = item.seasons[season].episodes[episode].title.split(' / ')[0]
            if (item.seasons[season].episodes[episode].watching.status < 1 && item.seasons[season].episodes[episode].watching.time > 0) {
                mItem["watchingTime"] = item.seasons[season].episodes[episode].watching.time;
            }
        } else {
            if (item.videos[episode].watching.time > 0 && (item.videos[episode].duration - item.videos[episode].watching.time) > 30) {
                mItem["watchingTime"] = item.videos[episode].watching.time;
            }
            if (item.subtype == "multi") {
                mItem["subTitle"] = item.videos[episode].title.split(' / ')[0]
            }
        }

        if (settings.playerSelectQuality.id == 1 && Device.appVersion >= 5) {
            mItem.url = null

            mItem.playlist = {
                quality: video.files[resolutionIndex].quality || "Auto",
                items: {
                    "Auto": [{ name: "Auto", url: video.files[0].url.hls4, adaptive: true }],
                },
            }

            video.files.forEach(file => {
                var quality = `${file.quality}${file.codec == 'h265' ? ' (HDR)' : ''}`
                mItem.playlist.items[quality] = video.audios.map((audio) => {
                    const titleParts = []
                    if (audio.type) {
                        titleParts.push(`${audio.type.title}`)
                    }
                    if (audio.author) {
                        titleParts.push(`${audio.author.title}`)
                    }

                    const lang = audio.lang ? ` (${audio.lang.toUpperCase()})` : ''
                    const ac3 = audio.codec == 'ac3' ? ' (AC3)' : ''

                    return {
                        name: `${('0' + audio.index).slice(-2)}. ${titleParts.join('. ')}${lang}${ac3}`,
                        url: file.url.hls.replace('a1.m3u8', `a${audio.index}.m3u8`),
                        adaptive: false,
                    };
                })
            })

            mItem.playlist.qualities = ["Auto"]
            video.files.forEach(file => {
                mItem.playlist.qualities.push(`${file.quality}${file.codec == 'h265' ? ' (HDR)' : ''}`)
            })

            if (mItem.playlist.qualities.indexOf(`${mItem.playlist.quality} (HDR)`) > -1) {
                mItem.playlist.quality = `${mItem.playlist.quality} (HDR)`
            }
        }

        return mItem;
    }

    function generateMediaItems(item, episode, season, shuffle, numberItems) {
        var settings = AppSettings.getAll();

        if (Utils.isSerial(item)) {
            console.log('serial');
            if (!episode && !season) {
                for (const [sIndex, _season] of item.seasons.entries()) {
                    episode = _season.episodes.findIndex(episode => episode.watching.status < 1)
                    if (episode == -1) {
                        episode = 0;
                        season = 0;
                    } else {
                        season = sIndex
                        break;
                    }
                }
            }
            if (shuffle) {
                var shuffled = {...item }
                season = 0
                episode = 0
                    //season = Math.floor(Math.random() * (result.item.seasons.length + 1))
                for (j = season; j < shuffled.seasons.length; j++) {
                    for (i = episode; i < shuffled.seasons[j].episodes.length; i++) {
                        if (j == season) { continue }
                        shuffled.seasons[j].episodes[i].seasonNumber = shuffled.seasons[j].number
                        shuffled.seasons[season].episodes.push(shuffled.seasons[j].episodes[i])
                    }
                }
                Utils.shuffleFunction(shuffled.seasons[season].episodes);
            }
            var _item = (shuffle) ? shuffled : item
            console.log('sIndex' + season + 'eIndex' + episode);
            // FIXME: why externalID needed?
            // var externalID = 0;
            var externalID = _item.id;
            for (i = episode; i < _item.seasons[season].episodes.length; i++) {
                if (_item.seasons[season].episodes[i].files.length != 0) {
                    var mItem = getItemForDtPlayer(_item, i, season, externalID);
                    mediaItems.push(mItem);
                    // externalID++;
                    if (!settings.userAutoPlayOption.id) {
                        break;
                    }
                    if (numberItems) {
                        if (numberItems == mediaItems.length) { break };
                    }
                }
            }

            // if play next season, add next seasons to playlist too
            if (settings.playNextSeason && settings.playNextSeason.id) {
                for (j = season + 1; j < _item.seasons.length; j++) {
                    for (i = 0; i < _item.seasons[j].episodes.length; i++) {
                        if (_item.seasons[j].episodes[i].files.length != 0) {
                            var mItem = getItemForDtPlayer(_item, i, j, externalID);
                            mediaItems.push(mItem);
                            // externalID++;
                            if (numberItems) {
                                if (numberItems == mediaItems.length) { break };
                            }
                        }
                    }
                    if (numberItems) {
                        if (numberItems == mediaItems.length) { break };
                    }
                }
            }
        } else if (item.subtype == 'multi') {
            console.log('multi');
            console.log('requested episode: ' + episode)
            var episode = typeof episode === 'number' ? episode : item.videos.findIndex(video => video.watching.status < 1);
            if (episode == -1) { episode = 0; }
            if (!item.videos[episode]) {
                episode = item.videos.findIndex(video => video.watching.status < 1);
            }
            console.log('selected episode: ' + episode)
            var externalID = 0;
            for (i = episode; i < item.videos.length; i++) {
                if (item.videos[i].files) {
                    var mItem = getItemForDtPlayer(item, i, 0, externalID);
                    mediaItems.push(mItem);
                    externalID++;
                }
            }
        } else {
            console.log('movie');
            var episode = episode || item.videos.findIndex(video => video.watching.status < 1);
            if (episode == -1) { episode = 0; }
            var mItem = getItemForDtPlayer(item, episode)
            mediaItems.push(mItem);
        }

        if (Utils.isSerial(item)) {
            Trakt.traktSeasonInfo(item.imdb, item.seasons[season].number, function(traktSeasonResult) {
                if (!Utils.isNative()) { var trakts = []; }
                item.seasons[season].episodes.forEach((episode, index) => {
                    episode.trakt = traktSeasonResult[index].ids.trakt;
                    if (!Utils.isNative()) {
                        var traktTmp = {
                            "video": episode.number,
                            "traktID": episode.trakt
                        };
                        trakts.push(traktTmp);
                    }
                });
                if (!Utils.isNative()) { setTraktIDs(trakts); }
            });
        }
    }

    function listenerCalled(listener, item, event, externalID) {
        var seasonNumber = Utils.isSerial(item) ? mediaItems[externalID].season : 0;
        var episodeNumber = externalID ? mediaItems[externalID].video : mediaItems[0].video;
        var video = Utils.isSerial(item) ? item.seasons[seasonNumber - 1].episodes : item.videos;
        if (listener == "timeDidChange") {
            KPlayer.playerTimeDidChange(item.id, Math.round(event.time), episodeNumber, seasonNumber)
        } else if (listener == "stateDidChange") {
            var trakt = video[episodeNumber - 1].trakt
            KPlayer.playerStateDidChange(event.state, item, event.elapsedTime, event.duration, seasonNumber, trakt);
            // if (event.state == "paused" || event.state == "end") {
            //   console.log(event.state)
            //   KPlayer.playerTimeDidChange(item.id, Math.round(event.elapsedTime), episodeNumber, seasonNumber)
            // }
        }
    }

    return {
        play(episode, season, shuffle, numberItems) {
            var settings = AppSettings.getAll();

            try {
                if (settings.saveSubtitleSource && !settings.saveSubtitleSource.id) {
                    console.log('Remove subtitle sources')
                    AppStorage.setData('selectedSubtitleSource', '')
                    AppStorage.setData('selectedSubtitleSource', '{"subtitle": {}}')
                }

                if (settings.saveAudioSource && !settings.saveAudioSource.id) {
                    console.log('Remove audio sources')
                    AppStorage.setData('selectedAudioSource', '')
                    AppStorage.setData('selectedAudioSource', '{"audio": {}}')
                }
            } catch (e) {
                // ignore
            }

            isPlaying = true;
            KP.stopUberTrailer();
            var result = cachedResult;
            mediaItems = [];
            generateMediaItems(result.item, episode, season, shuffle, numberItems);
            if (Utils.isNative()) {
                var player = new Player();
                var playlist = new Playlist();
                player.playlist = playlist;
                mediaItems.forEach(item => {
                    var mediaItem = new MediaItem("video", item.url);
                    mediaItem.title = item.title;
                    if (Utils.isSerial(result.item) || result.item.subtype == 'multi') {
                        mediaItem.subtitle = item.subTitle;
                        mediaItem.externalID = item.externalID;
                    }
                    mediaItem.description = item.desc;
                    mediaItem.artworkImageURL = item.poster;
                    if (item.watchingTime > 0) {
                        mediaItem.resumeTime = item.watchingTime;
                    }
                    console.log(mediaItem);
                    player.playlist.push(mediaItem);
                });
                player.showsResumeMenu = settings.showTimeContinueAlert.id;
                player.present();
                player.play();
                lastTime = new Date().getTime();

                player.addEventListener("timeDidChange", function(event) {
                    var _lastTime = new Date().getTime();
                    if (_lastTime - lastTime >= 300) {
                        listenerCalled("timeDidChange", result.item, event, parseInt(player.currentMediaItem.externalID))
                        lastTime = _lastTime;
                    }
                }, { interval: 300 });
                player.addEventListener("stateDidChange", function(event) {
                    listenerCalled("stateDidChange", result.item, event, parseInt(player.currentMediaItem.externalID))
                });
                player.addEventListener("playbackError", function(event) {
                    console.log(event)
                });
                player.addEventListener("mediaItemWillChange", function(event) {
                    event.time = player.currentMediaItemDuration;
                    listenerCalled("timeDidChange", result.item, event, parseInt(player.currentMediaItem.externalID))
                });
            } else {
                if (typeof microPlay !== 'undefined') {
                    microPlay(JSON.stringify(mediaItems));
                } else {
                    tinyPlay(JSON.stringify(mediaItems));
                }
            }
            skipCache = true;
        },

        playTrailer(url) {
            var result = cachedResult;
            var player = new Player();
            var playlist = new Playlist();
            var mediaItem = new MediaItem("video", url);
            mediaItem.title = result.item.title.split(' / ')[0];
            mediaItem.subtitle = "Трейлер";
            mediaItem.description = result.item.plot;
            mediaItem.artworkImageURL = result.item.posters.small;
            player.playlist = playlist;
            player.playlist.push(mediaItem);
            player.present();
            player.play();
        },

        playTV(url, title, logo, subtitle, description, time) {
            mediaItems = [];
            if (time) { url += '?archive=' + time; }
            var mItem = {
                "id": null,
                "imdb": null,
                "title": title,
                "desc": description,
                "poster": logo,
                "url": url,
                "video": null,
                "season": null,
                "externalID": null,
                "subTitle": subtitle,
                "watchingTime": null,
                "rating": "",
                "trakt": 0
            };
            mediaItems.push(mItem);
            console.log(url);
            if (Utils.isNative()) {
                var player = new Player();
                var playlist = new Playlist();
                var mediaItem = new MediaItem("video", mItem.url);
                mediaItem.title = mItem.title;
                if (subtitle) { mediaItem.subtitle = mItem.subTitle };
                if (description) { mediaItem.description = mItem.desc };
                mediaItem.artworkImageURL = mItem.poster;
                player.playlist = playlist;
                player.playlist.push(mediaItem);
                player.present();
                player.play();
            } else {
                if (typeof microPlay !== 'undefined') {
                    microPlay(JSON.stringify(mediaItems));
                } else {
                    tinyPlay(JSON.stringify(mediaItems));
                }
            }
        },

        playerTimeDidChange(id, time, video, season) {
            console.log("playerTimeDidChange:" + time + " id:" + id + " video:" + video + " season:" + season);
            if (time < 30) { return; }
            KP.sendMarktime(id, time, video, season);
        },

        playerStateDidChange(state, item, time, duration, season, trakt) {
            console.log("playerStateDidChange:" + state);
            if (season == 0) {
                Trakt.traktScrobble("movie", state, item.imdb, time, duration);
            } else {
                Trakt.traktScrobble("serial", state, item.imdb, time, duration, trakt)
            }
        }
    }
}());
