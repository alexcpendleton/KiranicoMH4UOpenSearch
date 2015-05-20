var express = require('express');
var app = express();
var KiranicoMh4uSearcher = require('./KiranicoMh4uSearch.js');
var LanguageSearcherManager = require('./LanguageSearchManager.js');
var TemplatedFileGenerator = require('./TemplatedFileGenerator.js')
var PluginTemplater = require("./PluginTemplater.js");
var path = require('path');
var searcherMap;

app.set('port', (process.env.PORT || 5000));
//app.use(express.static(__dirname + '/public'));
app.use("/kiranicomh4u/public/", express.static(process.env.PWD + '/public'));

app.get('/', function(request, response) {
  response.send('Hello World!');
});
var publicFileOptions = {
  root: __dirname + '/public/',
  dotfiles: 'deny',
  headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
  }
};
app.get('/kiranicomh4u/plugins', function(request, response) {
  var info = prepSearch(request);
  var filename = "search.plugin." + info.language + ".xml";
  response.sendFile(filename, publicFileOptions);
});
app.get('/kiranicomh4u/discover', function(request, response) {
  var info = prepSearch(request);
  var filename = "search.discover." +info.language + ".html";
  response.sendFile(filename, publicFileOptions);
});
var prepSearch = function(request) {
  if(searcherMap == null) {
    searcherMap = new LanguageSearcherManager();
  }
  var language = request.query.l;
  var searcher = searcherMap.getSearcherByLanguage(language);
  if(!language) {
    language = searcherMap.defaultLanguageKey;
  }
  var results = {
    language: language,
    term: request.query.s || "",
    searcher: searcher.searcher
  };
  return results;
};
app.get('/kiranicomh4u/suggest', function(request, response) {
  var info = prepSearch(request);
  var term = info.term;
  info.searcher.all(term, function(results) {
    response.send(results);
  });
});

app.get('/kiranicomh4u/first', function(request, response) {
  var info = prepSearch(request);
  var term = info.term;
  info.searcher.first(term, function(results) {
    var firstItem = results[3][0];
    if(firstItem) {
      response.redirect(firstItem);
    } else {
      response.send(info.searcher.getSorryMessage(term));
    }
  });
});

app.get('/kiranicomh4u/generateplugins', function(request, response) {
  response.send(":(");
  return false; // Don't have accessible in prod!
  var templater = new PluginTemplater();
  templater.configurator = templater.pluginConfigurator;
  var generator = new TemplatedFileGenerator(templater);
  if(request.query.dev == "true") {
    console.log("request.query.dev == true");
    templater.baseUri = "http://localhost:5000/kiranicomh4u/"
  }
  var templatePath = path.join(publicFileOptions.root,
    "search.plugin.template.xml");
  var outputPath = path.join(publicFileOptions.root,
    "search.plugin.%s.xml");
  generator.generate(templater, templatePath, outputPath);

  templatePath = path.join(publicFileOptions.root,
    "search.discover.template.html");
  outputPath = path.join(publicFileOptions.root,
    "search.discover.%s.html");
  templater.configurator = templater.discoverConfigurator;
  generator.generate(templater, templatePath, outputPath);
  response.send("done!");
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
