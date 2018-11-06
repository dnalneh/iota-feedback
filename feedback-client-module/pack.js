// run by: "node pack.js"
// packs the important files together into one file for testing (inject into some website)
// -> copy the content and paste into browser-console, hit ENTER

var fs = require('fs')

var css = fs.readFileSync('./src/dist/css/fm__styles.css');
var js = fs.readFileSync('./src/dist/js/feedback_client_module.js');

var logger = fs.createWriteStream('pack.txt', {
    flags: 'w'
})

logger.write("var linkNode = document.createElement('style');\nlinkNode.innerHTML = ` \n")
logger.write(css.toString());

logger.write("` \n\ndocument.getElementsByTagName('head')[0].appendChild(linkNode); \n\n");
logger.write(js.toString());

logger.write("\n\Feedback_Client_Module.activate({ projectCode: '0dc81406-2e6d-aee0-65d1-845833a9c16b', modus: 'UsePredefined' });");

logger.end() 