﻿ var request = require("request");
var util = require("util");
var events = require("events");


var SpotifyClient = function () {
    events.EventEmitter.call(this);
    var self = this;
    self.base = "https://kdghnzhmwr.spotilocal.com:4370";
    self.headers = { Origin: "https://open.spotify.com" };
    self.isPlaying = false;
    request({ url : "https://open.spotify.com/token" }, function (error, response, body) {
        if (error) throw error;
        self.oauth = JSON.parse(body).t;
        var options = {
            url: self.base + "/simplecsrf/token.json",
            rejectUnauthorized : false,
            headers: self.headers
        };
        request(options, function (error, response, body) {
            if (error) {
                console.log(error);
                var error2 = {};
                error2.type = "4110";
                self.emit("error", error2);
                throw error;
            }
            var obj = JSON.parse(body);
            if ('error' in obj && obj.error.type == 4110) { self.emit("error", { type: "4110" }); return; }
            self.token = obj.token;
            self.init();
        });
    });
};
util.inherits(SpotifyClient, events.EventEmitter);


SpotifyClient.prototype.init = function () {
    this.emit("ready");
}

SpotifyClient.prototype.status = function (ret) {
    var self = this;
    ret = ret || '';
    if (ret === true) ret = '&returnon=login,logout,play,pause,error,ap&returnafter=60';
    request({
        url: self.base + "/remote/status.json?csrf=" + self.token + "&oauth=" + self.oauth + ret,
        rejectUnauthorized: false,
        headers: self.headers
    }, function (error, response, body) {
        if (error) throw error;
        body = JSON.parse(body);
        if (body.error) {
            self.emit("error", body.error);
        } else {
            self.emit("status", body.playing, body.playing_position, body.track, body.volume, body);
        }
    });
}

SpotifyClient.prototype.play = function (spotifyUri) {
    var self = this;
    request({
        url: self.base + "/remote/play.json?csrf=" + self.token + "&oauth=" + self.oauth + "&context=" + spotifyUri + "&uri=" + spotifyUri,
        rejectUnauthorized: false,
        headers: self.headers
    }, function (error, response, body) {
        if (error) throw error;
        body = JSON.parse(body);
        if (body.error) {
            self.emit("error", body.error);
        } else {
            self.emit("play", body.track.track_resource.name, body);
        }
    });
}

SpotifyClient.prototype.pause = function (pause) {
    var self = this;
    request({
        url: self.base + "/remote/pause.json?csrf=" + self.token + "&oauth=" + self.oauth + "&pause=" + pause,
        rejectUnauthorized: false,
        headers: self.headers
    }, function (error, response, body) {
        if (error) throw error;
        body = JSON.parse(body);
        if (body.error) {
            self.emit("error", body.error);
        } else {
            self.emit("pause", body.track.track_resource.name, body);
        }
    });
}

SpotifyClient.prototype.browse = function (spotifyUri, cb) {
    var self = this;
    request({
        url: self.base + "/remote/browse.json?csrf=" + self.token + "&oauth=" + self.oauth + "&context=" + spotifyUri + "&uri=" + spotifyUri,
        rejectUnauthorized: false,
        headers: self.headers
    }, function (error, response, body) {
        if (error) throw error;
        body = JSON.parse(body);
        if (body.error) {
            self.emit("error", body.error);
            cb(body);
        } else {
            self.emit("browse", body);
            cb(body);
        }
    });
}

SpotifyClient.prototype.auth = function (username, password, cb) {
    var self = this;
    var headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.101 Safari/537.11'
    };
    request({
        url: 'https://play.spotify.com/redirect/facebook/notification.php?album=http://open.spotify.com/album/2mCuMNdJkoyiXFhsQCLLqw&song=http://open.spotify.com/track/6JEK0CvvjDjjMUBFoXShNZ',
        headers: headers
    }, function (error, response, body) {
        if (error) throw error;
        var token = body.match(/csrftoken":"([a-zA-Z0-9]{32})/)[1];
        request.post({
            url: 'https://play.spotify.com/xhr/json/auth.php', headers: headers,
            form: {
                type: 'sp',
                username: username,
                password: password,
                secret: token
            }
        }, function (error, response, body) {
            if (error) throw error;
            body = JSON.parse(body);
            cb(body);
        });
    });
}




module.exports = SpotifyClient;
