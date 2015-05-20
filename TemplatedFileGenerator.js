var util = require("util");
var fs = require('fs');
var PluginTemplater = require("./PluginTemplater.js");
var TemplatedFileGenerator = function() {
};
TemplatedFileGenerator.prototype.generate = function(templater, templatePath, outFilenameFormat) { 
  templater.template = templater.compileFromPath(templatePath);
  var configurations = templater.getDefaultConfigurations();
  var applied = templater.applyTemplates(configurations);
  for(var item in applied) {
    var outpath = util.format(outFilenameFormat, item);
    var contents = applied[item];
    fs.writeFileSync(outpath, contents, {
      encoding:'utf8'
    });
  }
};
module.exports = TemplatedFileGenerator;
