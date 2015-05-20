var _ = require('underscore');
var http = require('http');
var RoutineFetchingRepo = require('./RoutineFetchingRepo.js');
var KiranicoMh4uSearch = require('./KiranicoMh4uSearch.js');

var LanguageSearchManager = function(mappings) {
  this.mappings = mappings || this.getDefaultMappings();
  this.defaultLanguageKey = "en";
};
LanguageSearchManager.prototype.buildSearcher = function(languagePart) {
  var results = new RoutineFetchingRepo();
  var part = languagePart.indexOf("_") > -1 ?
    languagePart : "_" + languagePart + "_";
  results.uri = results.uri.replace("_en_", part);
  var searcher = new KiranicoMh4uSearch(results);
  return searcher;
};
LanguageSearchManager.prototype.getDefaultMappings = function() {
  var results = {};

  results["en"] = {
    name:"English",
    searcher:this.buildSearcher("en")
  };
  results["de"] = {
    name:"Deutsch",
    searcher:this.buildSearcher("de")
  };
  results["fr"] = {
    name:"Français",
    searcher:this.buildSearcher("fr")
  };
  results["es"] = {
    name:"Español",
    searcher:this.buildSearcher("es")
  };
  results["it"] = {
    name:"Italiano",
    searcher:this.buildSearcher("it")
  };
  results["ja"] = {
    name:"日本語",
    searcher:this.buildSearcher("ja")
  };
  return results;
};
LanguageSearchManager.prototype.getSearcherByLanguage = function(languageKey) {
  var results = this.mappings[languageKey];
  if(!results) {
    results = this.mappings[this.defaultLanguageKey];
  }
  return results;
};
module.exports = LanguageSearchManager;
