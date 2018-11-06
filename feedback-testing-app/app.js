const express = require("express");
const fs = require('fs');
const app = express();
var reload = require("reload");
const port = 8081;
const baseDir = "./public/feedback-client-module-copy";

// create folders if not exist
if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
}
if (!fs.existsSync(baseDir + "/css")) {
    fs.mkdirSync(baseDir + "/css");
}
if (!fs.existsSync(baseDir + "/js")) {
    fs.mkdirSync(baseDir + "/js");
}

// copy current feedback-client-module
fs.copyFile('../feedback-client-module/src/dist/css/fm__styles.css', './public/feedback-client-module-copy/css/fm__styles.css', (err) => {
    if (err) throw err;
    console.log('fm__styles.css was copied.');
});
fs.copyFile('../feedback-client-module/src/dist/js/feedback_client_module.js', './public/feedback-client-module-copy/js/feedback_client_module.js', (err) => {
    if (err) throw err;
    console.log('feedback_client_module.js was copied.');
});
fs.copyFile('../feedback-client-module/src/dist/js/feedback_client_module.js.map', './public/feedback-client-module-copy/js/feedback_client_module.js.map', (err) => {
    if (err) throw err;
    console.log('feedback_client_module.js.map was copied.');
});

app.use(express.static('public'));

reload(app);

app.listen(port, function () {
    console.log('Testing app served on port ' + port);
});