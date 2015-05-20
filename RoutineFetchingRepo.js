var _ = require('underscore');
var http = require('http');

var RoutineFetchingRepo = function() {
  this.frequencyInMilliseconds = 43200000; // 3600000 * 12 (12 hours)
  this.data = null;
  this.lastUpdated = new Date(1, 1, 2014);
  // todo: Should probably make it easier to support other languages
  this.uri = "http://kiranico.com/assets/prefetch_en_MH4U.json";
  this.uriPrefix = "http://kiranico.com";
};
RoutineFetchingRepo.prototype.massage = function(rawDataFromKiranico) {
  //console.log("RoutineFetchingRepo.massage");
  var results = [];
  var fetchScope = this;
  // Just translates Kiranico's format into something
  // more easily digestable by an open search plugin
  _.each(rawDataFromKiranico, function(item) {
    results.push({
      content:item.n,
      description: [item.n, " (", item.l.replace("/en/mh4u/", ""), ")"].join(""),
      url:fetchScope.uriPrefix + item.l
    });
  });
  return results;
};
RoutineFetchingRepo.prototype.fetch = function(callback) {
  console.log("RoutineFetchingRepo.fetch");
  var badScenarioHandler = function() {
    console.log("RoutineFetchingRepo.Something bad happened", arguments);
    var results = [{
      content:"Something bad happened, sorry",
      somethingBadHappened: true
    }];
    callback(results);
  };
  var request = http.get(this.uri, function(response) {
    var responseChunks = [];
    response.on('data', function(chunk){
      //console.log("RoutineFetchingRepo.fetch.data");
      responseChunks.push(chunk);
    });
    response.on('end', function() {
      var allJson = responseChunks.join("");
      //console.log("RoutineFetchingRepo.fetch.end", allJson);
      callback(JSON.parse(allJson));
    });
  }).on('error', function(e){
    // todo: what should happen on an error?
    badScenarioHandler();
  });
};
RoutineFetchingRepo.prototype.get = function(callback) {
  //console.log("RoutineFetchingRepo.get");
  // See if data is null/empty or if the current time
  // is 'frequencyInMilliseconds' more than the 'lastUpdated' time
  // if so, go fetch the data and load it in
  var dateDifference = new Date() - this.lastUpdated,
      isDataStale = dateDifference > this.frequencyInMilliseconds;
  var shouldFetch = !this.data || isDataStale;
  if(shouldFetch) {
    var self = this;
    this.fetch(function(fetched) {
      self.data = self.massage(fetched);
      self.lastUpdated = new Date();
      callback(self.data);
    });
  } else {
    callback(this.data);
  }
};
RoutineFetchingRepo.prototype.getSorryMessage = function(term) {
  // This sort of smells, consider refactoring this, particularly for language support
  // It will need translation for that, though.
  return "Sorry, we couldn't find '" + term + "'. <a href='http://kiranico.com/mh4u'>http://kiranico.com/mh4u</a>";
}
module.exports = RoutineFetchingRepo;
