var cheerio = require("cheerio");

module.exports = {
    process_page: function (url, data, helpers) {
        var $ = cheerio.load(data);
        getData(url, $, helpers);
    }
};

function getData(url, $, helpers) {

    var currentResource;
    var downloads = [];

    currentResource = pageData;
    currentResource['url'] = url;

    currentResource = pageData['title'];
    helpers.getText( $, currentResource );

    currentResource = pageData['resources']['images']['image_slider_1'];
    helpers.getSource( $, currentResource, downloads );

    currentResource = pageData['resources']['images']['image_slider_2'];
    helpers.getSource( $, currentResource, downloads );

    currentResource = pageData['resources']['images']['image_slider_3'];
    helpers.getSource( $, currentResource, downloads );

    currentResource = pageData['resources']['images']['image_slider_4'];
    helpers.getSource( $, currentResource, downloads );

    currentResource = pageData['resources']['images']['image_slider_video_thumbnail_1'];
    helpers.getSource( $, currentResource, downloads );

    currentResource = pageData['resources']['images']['image_slider_video_thumbnail_2'];
    helpers.getSource( $, currentResource, downloads );

    currentResource = pageData['resources']['videos']['swf_1'];
    helpers.getSource( $, currentResource, downloads );

    currentResource = pageData['resources']['videos']['swf_2'];
    helpers.getSource( $, currentResource, downloads );

    currentResource = pageData['resources']['videos']['html_5_1']['m4v'];
    helpers.getSource( $, currentResource );

    currentResource = pageData['resources']['videos']['html_5_1']['webm'];
    helpers.getSource( $, currentResource );

    currentResource = pageData['resources']['videos']['html_5_2']['m4v'];
    helpers.getSource( $, currentResource );

    currentResource = pageData['resources']['videos']['html_5_2']['webm'];
    helpers.getSource( $, currentResource );

    Object.keys(pageData).forEach(function (key) {
        if ( pageData.hasOwnProperty(key) ) {
            var value = pageData[key];
            console.log('property' + key);
        } else {
            console.log('object' + key);
        }
    });

    helpers.downloadFiles(downloads, 'downloads', function (error, filename) {
        if (error) {
            console.log('Error downloading file to: ' + filename);
        }
    });

    var saveFilename = pageData['title']['value'].toLowerCase().replace(/[|&;$%@"<>()+,]/g, "").replace(/\s+/g, '-') + '.json';

    helpers.saveJSON(saveFilename, pageData, 'jsonData');
}

var pageData = {
    'url': '',
    'title': {
        'selector': '.itemName h1',
        'value': ''
    },
    'resources': {
        'images': {
            'image_slider_1': {
                'selector': '.insets-hidden img:first-child',
                'url': '',
                'value': ''
            },
            'image_slider_2': {
                'selector': '.insets-hidden img:nth-child(2)',
                'url': '',
                'value': ''
            },
            'image_slider_3': {
                'selector': '.insets-hidden img:nth-child(3)',
                'url': '',
                'value': ''
            },
            'image_slider_4': {
                'selector': '.insets-hidden img:nth-child(4)',
                'url': '',
                'value': ''
            },
            'image_slider_video_thumbnail_1': {
                'selector': '.inset-container .each-inset:nth-child(5) a img',
                'url': '',
                'value': ''
            },
            'image_slider_video_thumbnail_2': {
                'selector': '.inset-container .each-inset:nth-child(6) a img',
                'url': '',
                'value': ''
            }
        },
        'videos': {
            'swf_1': {
                'selector': '#jewelry-vid-1 object embed',
                'url': '',
                'value': ''
            },
            'swf_2': {
                'selector': '#jewelry-vid-2 object embed',
                'url': '',
                'value': ''
            },
            'html_5_1': {
                'm4v': {
                    'selector': '#jewelry-vid-1 video source:first-child',
                    'url': '',
                    'value': ''
                },
                'webm': {
                    'selector': '#jewelry-vid-1 video source:last-child',
                    'url': '',
                    'value': ''
                }
            },
            'html_5_2': {
                'm4v': {
                    'selector': '#jewelry-vid-2 video source:first-child',
                    'url': '',
                    'value': ''
                },
                'webm': {
                    'selector': '#jewelry-vid-2 video source:last-child',
                    'url': '',
                    'value': ''
                }
            }
        }
    },
    'data': {
        'slider-overlay': {
            'selector': '.image-overlay-text',
            'value': ''
        },
        'sku': {
            'selector': '',
            'value': ''
        }
    }
}