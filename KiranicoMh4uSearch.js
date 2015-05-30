var _ = require('underscore');

var KiranicoMh4uSearcher = function(dataRepository, expressionBuilder) {
  this.repo = dataRepository;
  this.expressionBuilder = expressionBuilder || this.comprehensiveExpressionBuilder;
};
KiranicoMh4uSearcher.prototype.regexQuote = function(str) {
  return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
};
KiranicoMh4uSearcher.prototype.typeaheadExpressionBuilder = function(searchFor) {
  var escapedQuery = this.regexQuote(searchFor);
  // Directly from Kiranico's typeahead.js, will only search
  // for items that start with the query
  return new RegExp("^(?:" + escapedQuery + ")(.+$)", "i");
};
KiranicoMh4uSearcher.prototype.comprehensiveExpressionBuilder = function(searchFor) {
  // Really greedy, will search anywhere within a string
  // "ala" will match "alatreon", "congalala"
  // Thus, we need to try to escape every character.
  // + is a common MH token that needs escaping.
  var parts = _.map(searchFor.split(''), function(i) {
    return this.regexQuote(i);
  }, this);
  var escapedQuery = parts.join('\\w*').replace(/\W/, "");
  return new RegExp(escapedQuery, 'i');
};
KiranicoMh4uSearcher.prototype.first = function(query, callback) {
  return this.search(query, callback, _.find);
};
KiranicoMh4uSearcher.prototype.all = function(query, callback) {
  return this.search(query, callback, _.each);
};
KiranicoMh4uSearcher.prototype.search = function(query, callback, filter) {
  var hint = query, suggestions = [], counts = [], uris = [];
  var results = [hint, suggestions, counts, uris];
  if(!query) {
    callback(results);
    return;
  };
  var toMatch = this.expressionBuilder(query);
  this.repo.get(function(dataset) {
    //console.log("query, toMatch:", query, toMatch);
    filter(dataset, function(item) {
      var match = toMatch.exec(item.content);
      //console.log("match?", match);
      if(match) {
        suggestions.push(item.content);
        //counts.push(item.description);
        uris.push(item.url);
      }
    });
    callback(results);
  });
};
KiranicoMh4uSearcher.prototype.getSorryMessage = function(term) {
  return this.repo.getSorryMessage(term);
}
module.exports = KiranicoMh4uSearcher;
