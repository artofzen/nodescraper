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
        },
        deleteMetadata: function () {
            return ['type', 'custom', 'selector', 'attribute'];
        }
    },
    template: function () {
        return {
            'title': {
                'type': 'text',
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
                            'attribute': 'src',
                            'selector': '#jewelry-vid-1 video source:first-child'
                        },
                        'webm': {
                            'type': 'attribute',
                            'attribute': 'src',
                            'selector': '#jewelry-vid-1 video source:last-child'
                        }
                    },
                    'html_5_2': {
                        'm4v': {
                            'type': 'attribute',
                            'attribute': 'src',
                            'selector': '#jewelry-vid-2 video source:first-child'
                        },
                        'webm': {
                            'type': 'attribute',
                            'attribute': 'src',
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
                    'type': 'custom',
                    'custom': function ($, currentResource, downloads) {
                        try {
                            sku = $('.itemNum').clone().children().remove().end().text().split(':')[1].trim();
                            currentResource['value'] = sku;
                        } catch (err) {
                        }
                    }
                },
                'availability': {
                    'type': 'custom',
                    'custom': function ($, currentResource, downloads) {
                        try {
                            availability = $('.itemNum .orderAvail').clone().find('b').remove().end().text();
                            currentResource['value'] = availability;
                        } catch (err) {
                        }
                    }
                },
                'carat': {
                    'type': 'select-options',
                    'selector': 'select[name="Carat"]'
                },
                'clarity': {
                    'type': 'select-options',
                    'selector': 'select[name="Clarity"]'
                },
                'color': {
                    'type': 'select-options',
                    'selector': 'select[name="Color"]'
                },
                'cut': {
                    'type': 'select-options',
                    'selector': 'select[name="Cut"]'
                },
                'shape': {
                    'type': 'text',
                    'selector': '#firstList .listLabel:contains("Shape") + span.listValue'
                },
                'certification': {
                    'type': 'text',
                    'selector': '#firstList .listLabel:contains("Certification") + span.listValue'
                },
                'side-diamond-carat-total-weight': {
                    'type': 'text',
                    'selector': '.listSection .listHead:contains("Side Diamonds Information") ~ div .listLabel:contains("Carat total weight") + .listValue'
                },
                'side-diamond-shape': {
                    'type': 'text',
                    'selector': '.listSection .listHead:contains("Side Diamonds Information") ~ div .listLabel:contains("Shape") + .listValue'
                },
                'side-diamond-number-diamonds': {
                    'type': 'text',
                    'selector': '.listSection .listHead:contains("Side Diamonds Information") ~ div .listLabel:contains("Number of diamonds") + .listValue'
                },
                'precious-metal': {
                    'type': 'select-options',
                    'selector': 'select[name="Precious metal"]'
                },
                'ring-size': {
                    'type': 'select-options',
                    'selector': 'select[name="Ring size"]'
                },
                'width': {
                    'type': 'text',
                    'selector': '.listSection .listHead:contains("Ring Customization") ~ div .listLabel:contains("Width") + .listValue'
                },
                'description': {
                    'type': 'text',
                    'selector': '.captiondiv'
                }
            }
        }
    }
};