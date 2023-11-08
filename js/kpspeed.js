var KPSpeed = (function() {
    const ckSize = 5;
    const timeToCheck = 60;

    var stop = false
    var speeds = [];
    var globalInterval;
    var inProgress = false;
    var request;
    var rand = ('0' + getRandomInt(12, 15)).slice(-2);
    var rand2 = ('0' + getRandomInt(5, 6)).slice(-2);

    var SPEEDTEST_SERVERS = [{
            name: "ams",
            server: "https://speed.ams-static-" + rand + ".cdntogo.net/speedtest/",
            dlURL: "garbage.php",
            ulURL: "empty.php",
            pingURL: "empty.php",
            getIpURL: "getIP.php"
        },
        {
            name: "msk",
            server: "https://speed.msk-static-" + rand2 + ".cdntogo.net/speedtest/",
            dlURL: "garbage.php",
            ulURL: "empty.php",
            pingURL: "empty.php",
            getIpURL: "getIP.php"
        }
    ];

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function initUI() {
        SPEEDTEST_SERVERS.map(function(server) {
            getElement(server.name + "1").textContent = "НЕИЗВЕСТНО";
            getElement(server.name + "2").textContent = "¯\\_(ツ)_/¯";
        });

    }

    function getElement(id) { return Presenter.activeParser().doc.getElementById(id); }

    function startSpeed(server, callback) {
        var fileURL = server.server + server.dlURL
        request = new XMLHttpRequest();
        var avoidCache = "?r=" + (new Date()).getTime();;
        request.open('GET', fileURL + avoidCache + "&ckSize=" + ckSize, true);
        request.responseType = "application/octet-stream";
        var startTime = (new Date()).getTime();
        var endTime = startTime;
        request.onprogress = function(event) {
            console.log("progress")
            console.log(event)
        };
        request.onreadystatechange = function() {
            if (request.readyState == 2) {
                startTime = (new Date().getTime());
            }
            if (request.readyState == 4) {
                if (!inProgress) { return; }
                endTime = (new Date()).getTime();
                var downloadSize = ckSize * 1024 * 1024; //request.responseText.length;
                var time = (endTime - startTime) / 1000;
                var sizeInBits = downloadSize * 8;
                var speed = ((sizeInBits / time) / (1024 * 1024));
                console.log(downloadSize, time, speed.toFixed(2));
                speeds.push(speed);
                getElement(server.name + "1").textContent = speed.toFixed(2) + " Mbps";
                if (!stop) { startSpeed(server, callback); } else { callback(); }
            }
        }
        request.onerror = function() {
            console.log('error status: ' + request.status + ' ' + request.responseText);
        }

        request.send();
    }

    function stopSpeed() {
        request.abort();
        inProgress = false;
        speeds = []
        getElement("startStopBtn").textContent = " ИЗМЕРИТЬ ";
        initUI();
    }

    function startStop() {
        if (inProgress) {
            stopSpeed();
        } else {
            getElement("startStopBtn").textContent = " ОСТАНОВИТЬ ";
            inProgress = true;
            start(0);
        }
    }

    function start(index) {
        if (index == undefined) { index = 0 }
        var server = SPEEDTEST_SERVERS[index];
        getElement(server.name + "1").textContent = "НАЧИНАЕМ";
        getElement(server.name + "1").className = "text4";
        getElement(server.name + "2").className = "text3";
        startSpeed(server, function() {
            stop = false
            var avSpeed = speeds.reduce((a, b) => a + b) / speeds.length;
            var maxSpeed = Math.max(...speeds)
            console.log("Average speed: " + avSpeed.toFixed(2))
            getElement(server.name + "1").textContent = avSpeed.toFixed(2) + " Mbps";
            getElement(server.name + "2").textContent = maxSpeed.toFixed(2) + " Mbps";
            speeds = []
            getElement(server.name + "1").className = "text2";
            getElement(server.name + "2").className = "text1";
            if (index == 0) { start(1); } else {
                getElement("startStopBtn").textContent = " ИЗМЕРИТЬ ";
                inProgress = false;
            }
        })
        globalInterval = setInterval(function() {
            clearInterval(globalInterval);
            stop = true
        }, timeToCheck * 1000)
    }


    return {
        start() {
            initUI();
            startStop();
        },

        initUI() {
            var template = this.templates.page();
            var doc = Presenter.makeDocument(template);
            Presenter.pushDocument(doc);
        },

        templates: {
            page() {
                return `
                        <document>
                            <head>
                                <style>
                                @media tv-template and (tv-theme:dark) {.text1 {font-size: 40; text-align: center; color: white;} .text2 {font-size: 80; text-align: center; color: white;} .title {font-size: 100; text-align: center; color: white;}}
                                @media tv-template and (tv-theme:light) {.text1 {font-size: 40; text-align: center; color: black;} .text2 {font-size: 80; text-align: center; color: black;} .title {font-size: 100; text-align: center; color: black;}}
                                @media tv-template and (tv-theme:dark) {.text3 {font-size: 40; text-align: center; color: yellow;} .text4 {font-size: 80; text-align: center; color: yellow;}}
                                @media tv-template and (tv-theme:light) {.text3 {font-size: 40; text-align: center; color: yellow;} .text4 {font-size: 80; text-align: center; color: yellow;}}
                                    @media tv-template and (tv-theme:dark) {.text {font-size: 40; text-align: center; color: white;} .label{tv-tint-color: rgb(255,255,255); tv-highlight-color: rgb(255,255,255);}} 
                                    @media tv-template and (tv-theme:light) {.text {font-size: 40; text-align: center; color: black;} .label{tv-tint-color: rgb(0,0,0); tv-highlight-color: rgb(0,0,0);}} 
                                    @media tv-template and (tv-theme:dark) {.nextButton{font-size: 30; text-align: center; color: white; background-color: rgb (255,255,255);}} 
                                    @media tv-template and (tv-theme:light) {.nextButton{font-size: 30; text-align: center; color: black; background-color: rgb (0,0,0);}}
                                </style>
                            </head>
                            <divTemplate>
                                <img src="${baseURL}img/speedtestOrange.png" width="200" height="200" style="tv-align: center; tv-position: top; margin: 150 0 0 0;"/>
                                <title class="title" style="margin: 0 0 0 0; tv-align: center; tv-position: top;">KPSPEED</title>
                                <img style="tv-align: center; tv-position: left; margin: 0 0 0 0;" src="${baseURL}img/netherlads.png" width="40" height="40" />
                                <title class="text1" style="tv-align: center; tv-position: left;">НИДЕРЛАНДЫ</title>
                                <title class="text2" id="ams1" style="tv-align: center; tv-position: left;">НЕИЗВЕСТНО</title>
                                <title class="text1" id="ams2" style="tv-align: center; tv-position: left;">¯\\_(ツ)_/¯</title>
                                <img style="tv-align: center; tv-position: right; margin: 0 0 0 0;" src="${baseURL}img/russia.png" width="40" height="40" />
                                <title class="text1" style="tv-align: center; tv-position: right;">РОССИЯ</title>
                                <title class="text2" id="msk1" style="tv-align: center; tv-position: right;">НЕИЗВЕСТНО</title>
                                <title class="text1" id="msk2" style="tv-align: center; tv-position: right;">¯\\_(ツ)_/¯</title>
                                <button class="nextButton" style="font-size: 30; margin: 0 0 250 0; tv-align: center; tv-position: bottom;" onselect="KPSpeed.start();">
                                    <text id="startStopBtn"> ИЗМЕРИТЬ </text>
                                </button>
                            </divTemplate>
                        </document>
                `;
            }
        }
    }
}());