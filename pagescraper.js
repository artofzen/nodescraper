var fs = require("fs"),
    path = require("path"),
    request = require("request"),
    cheerio = require("cheerio");

var argv = require('optimist')
    .usage('Usage: $0 -j [js template] -u [url file]')
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
        return pageTemplate['title']['value'].toLowerCase().replace(/[|&;$%@"<>()+,]/g, "").replace(/\s+/g, '-') + '.json';
    },
    resourceFilename: function ($, url, currentResource) {
        return url.substring(url.lastIndexOf('/') + 1);
    }
};

var helpers = {
    processType: function ($, currentResource, downloads) {
        switch (currentResource['type']) {
            case 'options':
                this.getOptions(currentResource);
                break;
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
            default :
                console.log('Unrecognized type: ' + currentResource['type']);
                break;
        }
    },
    getOptions: function (currentResource) {
        options = currentResource['options'];
    },
    getText: function ($, currentResource) {
        currentResource['value'] = $(currentResource['selector']).text();
    },
    getSource: function ($, currentResource, downloads) {
        currentResource['attribute'] = 'src';
        this.getAttribute($, currentResource);

        currentResource['value'] = currentResource['src'];
        if (typeof currentResource['src'] !== 'undefined' && typeof downloads !== 'undefined') {
            currentResource['filename'] = options['resourceFilename']($, currentResource['src'], currentResource);
            downloads.push({
                'url': currentResource['src'],
                'filename': currentResource['filename']
            });
        }
    },
    getAttribute: function ($, currentResource) {
        currentResource['src'] = $(currentResource['selector']).attr('src');
    },
    saveJSON: function (filename, data) {
        var fileLocation = filename;

        var dir = options['dataDir'](filename, external.template());
        fileLocation = path.join(dir, filename);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, 0766, function (err) {
                if (err) {
                    console.log('Error creating dir: ' + dir);
                    process.exit(3);
                }
            });
        }

        var jsonData = JSON.stringify(data);

        fs.writeFile(fileLocation, jsonData, function (err) {
            if (err) {
                console.log('Could not save JSON to: ' + fileLocation);
                process.exit(4);
            }
        });
    },
    downloadFiles: function (files, callback) {

        if (files.length === 0) {
            return;
        }

        var file = files.shift();

        var filename = file['filename'];
        var fileLocation = filename;

        var dir = options['resourceDir'](filename, external.template());
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
    },
    mergeObjects: function (obj1, obj2) {
        for (var p in obj2) {
            try {
                // Property in destination object set; update its value.
                if (obj2[p].constructor == Object) {
                    obj1[p] = this.mergeObjects(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            } catch (e) {
                // Property in destination object not set; create it and set its value.
                obj1[p] = obj2[p];
            }
        }
        return obj1;
    }
}

function loadPage(url, data) {
    var $ = cheerio.load(data);
    var pageTemplate = external.template();
    var downloads = [];

    walkTemplate($, pageTemplate, downloads);

    helpers.downloadFiles(downloads, function (error, filename) {
        if (error) {
            console.log('Error downloading file to: ' + filename);
        }
    });

    var saveFilename = options.dataFilename($, url, pageTemplate);

    helpers.saveJSON(saveFilename, pageTemplate, 'jsonData');
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

if (typeof external['options'] !== 'undefined') {
    options = helpers.mergeObjects(options, external.options);
}

fs.readFile(argv.u, 'utf8', function (err, data) {
    if (err) {
        console.log(err);
        process.exit(2);
    }

    var urlList = data.split("\n");

    urlList.forEach(function (url) {
        request.get(url, function (err, response, body) {
            if (err) {
                console.log("Error on url: " + url);
            } else {
                loadPage(url, body);
            }
        });
    });
});