# AMD version of jQuery Lifestream Plug-in

![jQuery Lifestream Logo](http://christianv.github.com/jquery-lifestream/design/logo_v1_64.png)

Show a stream of your online activity.  


## Supported feeds

Currently supports the following feeds:

* [Bitbucket](https://bitbucket.org/)
* [Bitly](http://bitly.com)
* [Blogger](http://blogger.com)
* [Citeulike](http://www.citeulike.org)
* [Digg](http://digg.com)
* [Dailymotion](http://dailymotion.com)
* [Delicious](http://delicious.com)
* [DeviantART](http://deviantart.com)
* [Dribbble](http://dribbble.com)
* [Facebook Pages](http://www.facebook.com/pages)
* [Flickr](http://flickr.com)
* [Foomark](http://foomark.com)
* [Formspring](http://formspring.com)
* [Forrst](http://forrst.com)
* [Foursquare](http://foursquare.com)
* [Gimmebar](http://gimmebar.com)
* [Github](http://github.com)
* [Google+](http://plus.google.com)
* [Google Reader](http://google.com/reader)
* [Hypem](http://hypem.com/)
* [Instapaper](http://www.instapaper.com)
* [Iusethis](http://osx.iusethis.com/)
* [Last.fm](http://last.fm)
* [LibraryThing.com](http://librarything.com)
* [Mlkshk](http://mlkshk.com)
* [PicPlz](http://picplz.com)
* [Pinboard](http://pinboard.in)
* [Posterous](http://posterous.com)
* [Quora](http://quora.com)
* [Reddit](http://reddit.com)
* [RSS](http://en.wikipedia.org/wiki/RSS)
* [Slideshare](http://slideshare.com)
* [Snipplr](http://snipplr.com)
* [Stackoverflow](http://stackoverflow.com)
* [Tumblr](http://tumblr.com)
* [Twitter](http://twitter.com)
* [Vimeo](http://vimeo.com)
* [Wikipedia](http://wikipedia.com)
* [Wordpress](http://wordpress.com)
* [Youtube](http://youtube.com)
* [Zotero](http://zotero.com)

Feel free to fork the project and add your own feeds in.  
Just send a pull request to [christianv/jquery-lifestream][jquery-lifestream] when you're finished.



## Usage

```
jam install jquery-lifestream
```

Then add the followng code

``` html
  $("#lifestream").lifestream({
    list:[
      {
        service: "github",
        user: "christianv"
      },
      {
        service: "twitter",
        user: "denbuzze"
      }
    ]
  });
```

You also need to add a bit of HTML:

```html
<div id="lifestream">&nbsp;</div>
```


## Configuration

The plug-in accepts one configuration JSON object:

``` javascript
$("#lifestream").lifestream({
  classname: "lifestream",
  feedloaded: feedcallback,
  limit: 30,
  list:[
    {
      service: "github",
      user: "christianv"
    },
    {
      service: "twitter",
      user: "denbuzze"
    }
  ]
});
```

`classname`: The name of the main lifestream class. We use this for the main ul class e.g. lifestream and for the specific feeds e.g. lifestream-twitter

`feedloaded`: (_function_) A callback function which is triggered each time a feed was loaded.

`limit`: (_integer_) Specify how many elements you want in your lifestream (default = 10).

`list`: (_array_) Array containing other JSON objects with information about each item.  
Each item should have a _service_ and a _user_.  
For more information about each _service_, check out the [source code][examplesource] of the [example page][example].



## Version log

* 0.3.2 Quora support
* 0.3.1 Citeulike support
* 0.3.0 RSS support
* 0.2.9 Hypem support
* 0.2.8 Gimmebar support
* 0.2.7 Zotero support
* 0.2.6 Google+ support
* 0.2.5 Wikipedia support
* 0.2.4 LibraryThing support
* 0.2.3 Digg support
* 0.2.2 Facebook Pages support
* 0.2.1 Bitbucket support
* 0.2.0 Modular builds
* 0.1.6 Bitly support
* 0.1.5 Snipplr support
* 0.1.4 Instapaper support
* 0.1.3 Mlkshk support
* 0.1.2 Foomark support
* 0.1.1 Blogger, Formspring, Posterous & Wordpress support
* 0.1.0 jQuery Template support
* 0.0.17 Forrst & PicPlz support
* 0.0.16 Iusethis support
* 0.0.15 Dailymotion & Pinboard support
* 0.0.14 Slideshare support
* 0.0.13 Vimeo support
* 0.0.12 Reddit support
* 0.0.11 Tumblr support
* 0.0.10 DeviantART support
* 0.0.9 Foursquare support
* 0.0.8 Add support for Github tags
* 0.0.7 Dribbble support
* 0.0.6 Update links in twitter to be able to have hashes in them
* 0.0.5 Flickr support
* 0.0.4 Last.fm support
* 0.0.3 Delicious support + minor bug fix in the stackoverflow code
* 0.0.2 Youtube support
* 0.0.1 Initial version


