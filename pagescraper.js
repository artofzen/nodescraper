var fs = require("fs"),
    path = require("path"),
    request = require("request"),
    merge = require("merge"),
    cheerio = require("cheerio");

var argv = require('optimist')
    .usage('Usage: $0 -j [js template] -u [url file] -d [on|off]')
    .demand(['j', 'u'])
    .argv;

var external = require(argv.j);

var options = {
    resourceDir: function (filename, pageTemplate) {
        return './downloads';
    },
    dataDir: function (filename, pageTemplate) {
        return './filedata';
    },
    dataFilename: function ($, url, pageTemplate) {
        return encodeURIComponent(pageTemplate['title']['value'].toLowerCase().replace(/\s+/g, '-') + '.json');
    },
    resourceFilename: function ($, url, currentResource) {
        return url.substring(url.lastIndexOf('/') + 1);
    },
    beforeDataSave: function (url, pageTemplate) {
        pageTemplate['url'] = url;
    },
    deleteMetadata: function () {
        return ['type', 'custom', 'selector', 'attribute'];
    }
};

var helpers = {
    processType: function ($, currentResource, downloads) {
        switch (currentResource['type']) {
            case 'text':
                this.getText($, currentResource);
                break;
            case 'image-download':
            case 'video-download':
            case 'swf-download':
                this.getSource($, currentResource, downloads);
                break;
            case 'attribute':
                this.getAttribute($, currentResource);
                break;
            case 'custom':
                currentResource['custom']($, currentResource, downloads);
                break;
            case 'select-options':
                this.getSelectOptions($, currentResource);
                break;
            default :
                console.log('Unrecognized type: ' + currentResource['type']);
        }
    },
    getText: function ($, currentResource) {
        currentResource['value'] = $(currentResource['selector']).text();
    },
    getSource: function ($, currentResource, downloads) {
        currentResource['attribute'] = 'src';
        this.getAttribute($, currentResource);

        if (typeof currentResource['src'] !== 'undefined' && typeof downloads !== 'undefined') {
            currentResource['filename'] = options['resourceFilename']($, currentResource['src'], currentResource);
            downloads.push({
                'url': currentResource['src'],
                'filename': currentResource['filename']
            });
        }
    },
    getAttribute: function ($, currentResource) {
        currentResource['value'] = $(currentResource['selector']).attr(currentResource['attribute']);
    },
    getSelectOptions: function ($, currentResource) {
        var selectOptions = $(currentResource['selector'] + ' option');
        currentResource['options'] = [];
        selectOptions.each(function (i, elem) {
            var text = $(elem).text();
            var value = $(elem).attr('value');
            currentResource['options'].push({
                'text': text,
                'value': value
            });
        });
    },
    saveJSON: function (url, filename, pageTemplate) {
        var fileLocation = filename;

        var dir = options['dataDir'](filename, pageTemplate);
        fileLocation = path.join(dir, filename);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, 0766, function (err) {
                if (err) {
                    console.log('Error creating dir: ' + dir);
                    process.exit(3);
                }
            });
        }

        options.beforeDataSave(url, pageTemplate);

        var jsonData = JSON.stringify(pageTemplate);

        fs.writeFile(fileLocation, jsonData, function (err) {
            if (err) {
                console.log('Could not save JSON to: ' + fileLocation);
                process.exit(4);
            }
        });
    },
    downloadFiles: function (files, callback, pageTemplate) {

        if (files.length === 0) {
            return;
        }

        var file = files.shift();

        var filename = file['filename'];
        var fileLocation = filename;

        var dir = options['resourceDir'](filename, pageTemplate);
        fileLocation = path.join(dir, filename);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, 0766, function (err) {
                if (err) {
                    console.log('Error creating dir: ' + dir);
                    process.exit(3);
                }
            });
        }

        try {
            if (!fs.existsSync(fileLocation)) {
                request.get({url: file['url'], encoding: 'binary'}, function (err, response, body) {
                    if (err) {
                        callback(err, file['url']);
                    } else {
                        fs.writeFile(fileLocation, body, 'binary', function (err) {
                            if (err) {
                                callback(err, file['url']);
                            }
                        });
                    }
                });
            } else {
                console.log('File already exists: ' + fileLocation);
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

function loadPage(url, data) {
    var $ = cheerio.load(data);
    var pageTemplate = external.template($, url);
    var downloads = [];

    walkTemplate($, pageTemplate, downloads);

    if (typeof argv.d === 'undefined' || argv.d !== 'off') {
        helpers.downloadFiles(downloads, function (error, filename) {
            if (error) {
                console.log('Error downloading file to: ' + filename);
            }
        }, pageTemplate);
    }

    cleanTemplate($, pageTemplate);

    var saveFilename = options.dataFilename($, url, pageTemplate);

    helpers.saveJSON(url, saveFilename, pageTemplate);
}

function walkTemplate($, currentResource, downloads) {
    Object.keys(currentResource).forEach(function (key) {
        if (currentResource.hasOwnProperty(key)) {
            if (currentResource[key] !== null && typeof currentResource[key] === 'object') {
                walkTemplate($, currentResource[key], downloads);
            } else if (key === 'type') {
                helpers.processType($, currentResource, downloads);
            }
        }
    });
}

function cleanTemplate($, currentResource) {
    //delete metadata
    Object.keys(currentResource).forEach(function (key) {
        if (currentResource.hasOwnProperty(key)) {
            if (currentResource[key] !== null && typeof currentResource[key] === 'object') {
                cleanTemplate($, currentResource[key]);
            } else if (options.deleteMetadata().indexOf(key) !== -1) {
                delete currentResource[key];
            }
        }
    });
}

//Merge options
if (typeof external['options'] !== 'undefined') {
    options = merge(options, external.options);
}

fs.readFile(argv.u, 'utf8', function (err, data) {
    if (err) {
        console.log(err);
        process.exit(2);
    }

    var urlList = data.split("\n");

    urlList.forEach(function (url) {
        try {
            url = url.trim();
            request.get({url: url, encoding: 'utf-8'}, function (err, response, body) {
                if (err) {
                    console.log("Error on url: " + url);
                } else {
                    loadPage(url, body);
                }
            });
        } catch (err) {
            console.log('Error processing url: ' + url);
        }
    });
});