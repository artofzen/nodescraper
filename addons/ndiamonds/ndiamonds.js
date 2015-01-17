module.exports = {
    options: {
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
            pageTemplate['page_url'] = url;
        }
    },
    template: function () {
        return {
            'title': {
                type: 'text',
                'selector': '.itemName h1'
            },
            'resources': {
                'images': {
                    'image_slider_1': {
                        'type': 'image-download',
                        'selector': '.insets-hidden img:first-child'
                    },
                    'image_slider_2': {
                        'type': 'image-download',
                        'selector': '.insets-hidden img:nth-child(2)'
                    },
                    'image_slider_3': {
                        'type': 'image-download',
                        'selector': '.insets-hidden img:nth-child(3)'
                    },
                    'image_slider_4': {
                        'type': 'image-download',
                        'selector': '.insets-hidden img:nth-child(4)'
                    },
                    'image_slider_video_thumbnail_1': {
                        'type': 'image-download',
                        'selector': '.inset-container .each-inset:nth-child(5) a img'
                    },
                    'image_slider_video_thumbnail_2': {
                        'type': 'image-download',
                        'selector': '.inset-container .each-inset:nth-child(6) a img'
                    }
                },
                'videos': {
                    'swf_1': {
                        'type': 'swf-download',
                        'selector': '#jewelry-vid-1 object embed'
                    },
                    'swf_2': {
                        'type': 'swf-download',
                        'selector': '#jewelry-vid-2 object embed'
                    },
                    'html_5_1': {
                        'm4v': {
                            'type': 'attribute',
                            'selector': '#jewelry-vid-1 video source:first-child'
                        },
                        'webm': {
                            'type': 'attribute',
                            'selector': '#jewelry-vid-1 video source:last-child'
                        }
                    },
                    'html_5_2': {
                        'm4v': {
                            'type': 'attribute',
                            'selector': '#jewelry-vid-2 video source:first-child'
                        },
                        'webm': {
                            'type': 'attribute',
                            'selector': '#jewelry-vid-2 video source:last-child'
                        }
                    }
                }
            },
            'data': {
                'slider-overlay': {
                    'type': 'text',
                    'selector': '.image-overlay-text'
                },
                'sku': {
                    'type': 'text',
                    'selector': ''
                }
            }
        }
    }
};