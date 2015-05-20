var handlebars = require('handlebars');
var LanguageSearchManager = require('./LanguageSearchManager.js')
var fs = require("fs");
var PluginTemplater = function(template, configurator) {
  this.template = template;
  this.configurator = configurator;
  this.baseUri = "http://k.mhquestboard.com/kiranicomh4u/";
};
PluginTemplater.prototype.buildPluginUri = function(language) {
  return this.baseUri + "plugins?l=" + language;
};
PluginTemplater.prototype.buildDiscoverUri = function(language) {
  return this.baseUri + "discover?l=" + language;
};
PluginTemplater.prototype.pluginConfigurator = function(language, allLanguages) {
  return {
    shortName:"kiranico.com/mh4u",
    description:"Search engine for Kiranico's MH4U database",
    firstUri:this.baseUri + "first?s={searchTerms}&l=" + language,
    suggestUri:this.baseUri + "suggest?s={searchTerms}&l=" + language,
    pluginUri:this.buildPluginUri(language)
  };
};
PluginTemplater.prototype.discoverConfigurator = function(language, allLanguages) {
  var results = {
    pluginUri:this.buildPluginUri(language)
  };
  var languageList = [];
  for (var item in allLanguages) {
    var current = allLanguages[item];
    var isActive = item == language;
    languageList.push({
      languageKey: item,
      uri:this.buildDiscoverUri(item),
      name:current.name,
      activeCssClass: isActive ? "active" : ""
    });
  }
  results.languages = languageList;
  return results;
};
PluginTemplater.prototype.applyTemplates = function(applyTo) {
  var results = {};
  for(var item in applyTo) {
    results[item] = this.template(applyTo[item]);
  }
  return results;
};
PluginTemplater.prototype.compileFromPath = function(path) {
  var contents = fs.readFileSync(path, { encoding:"utf8"});
  return handlebars.compile(contents);
};
PluginTemplater.prototype.getDefaultConfigurations = function() {
  var searchManager = new LanguageSearchManager();
  var results = {};
  for(var item in searchManager.mappings) {
    results[item] = this.configurator(item, searchManager.mappings);
  }
  return results;
};
module.exports = PluginTemplater;
