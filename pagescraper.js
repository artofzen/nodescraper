var fs = require("fs"),
    http = require("http"),
    request = require("request");

if (process.argv.length < 4) {
    console.log('Invalid Arguments - Exiting scraper...');
    process.exit(1);
}

var addonLocation = './addons/' + process.argv[2] + '/';
var dataScraper = require(addonLocation + 'process.js');

var helpers = {
    getText: function ( $, currentResource ) {
        currentResource['value'] = $(currentResource['selector']).text();
    },
    getSource: function( $, currentResource, downloads ) {
        currentResource['url'] = $(currentResource['selector']).attr('src');
        currentResource['value'] = currentResource['url'];

        if ( typeof currentResource['url'] !== 'undefined' && typeof downloads !== 'undefined' ) {
            currentResource['value'] = currentResource['url'].substring(currentResource['url'].lastIndexOf('/') + 1);
            downloads.push({
                'url': currentResource['url'],
                'filename': currentResource['value']
            });
        }
    },
    saveJSON: function (filename, data, dir) {
        if (typeof dir !== 'undefined') {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, 0766, function (err) {
                    if (err) {
                        console.log('Error creating dir: ' + dir);
                        process.exit(3);
                    }
                });
            }
        }

        var jsonData = JSON.stringify(data);

        fs.writeFile(dir + '/' + filename, jsonData, function (err) {
            if (err) {
                console.log('Could not save JSON: ' + filename);
                process.exit(4);
            }
        });
    },
    downloadFiles: function (files, dir, callback) {

        if (files.length === 0) {
            return;
        }

        var file = files.shift();

        if (typeof dir !== 'undefined') {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, 0766, function (err) {
                    if (err) {
                        console.log('Error creating dir: ' + dir);
                        process.exit(3);
                    }
                });
            }
        }

        var filename = dir + '/' + file['filename'];

        try {
            if (!fs.existsSync(filename)) {
                request.get({url: file['url'], encoding: 'binary'}, function (err, response, body) {
                    if (err) {
                        callback(err, file['url']);
                    } else {
                        fs.writeFile(filename, body, 'binary', function (err) {
                            if (err) {
                                callback(err, file['url']);
                            }
                        });
                    }
                });
            } else {
                console.log('File already exists.');
            }
        } catch (err) {
            callback(err, file['url']);
        } finally {
            if (files.length > 0) {
                helpers.downloadFiles(files, dir, callback);
            }
        }

    }
}

fs.readFile(addonLocation + process.argv[3], 'utf8', function (err, data) {
    if (err) {
        console.log(err);
        process.exit(2);
    }

    var urlList = data.split("\n");

    urlList.forEach(function (url, index, array) {
        downloadUrl(url, dataScraper.process_page);
    });
});

// Utility function that downloads a URL and invokes
// callback with the data.
function downloadUrl(url, callback) {
    http.get(url, function (res) {
        var data = "";
        res.on("data", function (chunk) {
            data += chunk;
        });
        res.on("end", function () {
            callback(url, data, helpers);
        });
    }).on("error", function () {
        console.log("Error on url: " + url);
    });
}