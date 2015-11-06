'use strict';

requirejs.config({
    paths: {
        ramda: 'https://cdnjs.cloudflare.com/ajax/libs/ramda/0.13.0/ramda.min',
        jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min'
    }
});

/*
 1. Construct a url for our particular search term
 2. Make the flickr api call
 3. Transform the resulting json into html images
 4. Place them on the screen
 */

require(
    [
        'ramda',
        'jquery'
    ],
    function (_, $) {

        // Trace is for debugging
        var trace = _.curry(function(tag, x) {
            console.log(tag, x);
            return x;
        });

        /*
         * Here we've simply wrapped jQuery's methods to be curried
         * and we've swapped the arguments to a more favorable position.
         * I've namespaced them with Impure so
         * we know these are dangerous functions.
         */
        var Impure = {
            getJSON: _.curry(function(callback, url){
                $.getJSON(url, callback);
            }),

            setHtml: _.curry(function(sel, html) {
                $(sel).html(html);
            })
        };

        // Construct a url to pass to our Impure.getJSON function.
        var url = function (term) {
          return 'https://api.flickr.com/services/feeds/photos_public.gne?tags=' +
            term + '&format=json&jsoncallback=?';
        };

        // Convert url's to HTML image tags
        var img = function (myUrl) {
          return $('<img />', { src: myUrl });
        };

        // Get the items->media->m property from the html
        // Which is where Flickr stores its images
        var mediaUrl = _.compose(_.prop('m'), _.prop('media'));

        // jQuery's html() method will accept an array of tags.
        // We only have to transform our srcs into images
        // and send them along to setHtml.
        var mediaToImg = _.compose(img, mediaUrl);

        var images = _.compose(_.map(mediaToImg), _.prop('items'));
        var renderImages = _.compose(Impure.setHtml("body"), images);
        var app = _.compose(Impure.getJSON(renderImages), url);

        app("girls");
    }
);
