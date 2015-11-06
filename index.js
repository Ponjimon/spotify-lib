var request = require("request");
var util = require("util");
var events = require("events");


var SpotifyClient = function () {
    events.EventEmitter.call(this);
    var self = this;
    self.base = "https://kdghnzhmwr.spotilocal.com:4370";
    self.headers = { Origin: "https://open.spotify.com" };

    request({url : "https://open.spotify.com/token"}, function (error, response, body) {
        self.oauth = JSON.parse(body).t;
        var options = {
            url: self.base + "/simplecsrf/token.json",
            rejectUnauthorized : false,
            headers: self.headers
        };
        request(options, function (error, response, body) {
            self.token = JSON.parse(body).token;
            self.init();
        });
    });
};
util.inherits(SpotifyClient, events.EventEmitter);


SpotifyClient.prototype.init = function () {
    this.emit("ready");
}
SpotifyClient.prototype.status = function () {
    var self = this;
    request({
        url: self.base + "/remote/status.json?csrf=" + self.token + "&oauth=" + self.oauth,
        rejectUnauthorized: false,
        headers: self.headers
    }, function (error, response, body) {
        self.emit("status", body);
    });
}

SpotifyClient.prototype.play = function (spotifyUri) {
    var self = this;
    request({
        url: self.base + "/remote/play.json?csrf=" + self.token + "&oauth=" + self.oauth + "&context=" + spotifyUri + "&uri=" + spotifyUri,
        rejectUnauthorized: false,
        headers: self.headers
    }, function (error, response, body) {
        body = JSON.parse(body);
        self.emit("play", body.track.track_resource.name, body);
    });
}

SpotifyClient.prototype.pause = function () {
    var self = this;
    request({
        url: self.base + "/remote/pause.json?csrf=" + self.token + "&oauth=" + self.oauth + "&pause=true",
        rejectUnauthorized: false,
        headers: self.headers
    }, function (error, response, body) {
        body = JSON.parse(body);
        self.emit("pause", body.track.track_resource.name, body);
    });
}


module.exports = SpotifyClient;
