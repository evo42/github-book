// Generated by CoffeeScript 1.3.3
(function() {

  define(['underscore', 'backbone', 'bookish/media-types', 'bookish/controller', 'bookish/models', 'epub/models', 'bookish/auth', 'gh-book/views', 'css!bookish'], function(_, Backbone, MEDIA_TYPES, Controller, AtcModels, EpubModels, Auth, Views) {
    var $signin, AtcModels_Folder_accepts, DEBUG, STORED_KEYS, XhtmlModel, b, props, readBinaryFile, readDir, readFile, resetDesktop, uuid, writeFile,
      _this = this;
    DEBUG = true;
    uuid = b = function(a) {
      if (a) {
        return (a ^ Math.random() * 16 >> a / 4).toString(16);
      } else {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b);
      }
    };
    writeFile = function(path, text, commitText) {
      return Auth.getRepo().write(Auth.get('branch'), "" + (Auth.get('rootPath')) + path, text, commitText);
    };
    readFile = function(path) {
      return Auth.getRepo().read(Auth.get('branch'), "" + (Auth.get('rootPath')) + path);
    };
    readBinaryFile = function(path) {
      return Auth.getRepo().readBinary(Auth.get('branch'), "" + (Auth.get('rootPath')) + path);
    };
    readDir = function(path) {
      return Auth.getRepo().contents(Auth.get('branch'), path);
    };
    Backbone.sync = function(method, model, options) {
      var id, path, ret,
        _this = this;
      path = model.id || (typeof model.url === "function" ? model.url() : void 0) || model.url;
      if (DEBUG) {
        console.log(method, path);
      }
      ret = null;
      switch (method) {
        case 'read':
          ret = readFile(path);
          break;
        case 'update':
          ret = writeFile(path, model.serialize(), 'Editor Save');
          break;
        case 'create':
          id = _uuid();
          model.set('id', id);
          ret = writeFile(path, model.serialize());
          break;
        default:
          throw "Model sync method not supported: " + method;
      }
      ret.done(function(value) {
        return options != null ? typeof options.success === "function" ? options.success(value) : void 0 : void 0;
      });
      ret.fail(function(error) {
        return options != null ? typeof options.error === "function" ? options.error(ret, error) : void 0 : void 0;
      });
      return ret;
    };
    EpubModels.EPUB_CONTAINER.on('error', function(model) {
      var url;
      url = "https://github.com/" + (Auth.get('repoUser')) + "/" + (Auth.get('repoName')) + "/tree/" + (Auth.get('branch')) + "/" + (Auth.get('rootPath')) + (model.url());
      return alert("There was a problem getting " + url + "\nPlease check your settings and try again.");
    });
    resetDesktop = function() {
      AtcModels.ALL_CONTENT.reset();
      EpubModels.EPUB_CONTAINER.reset();
      EpubModels.EPUB_CONTAINER._promise = null;
      if (!Backbone.History.started) {
        Controller.start();
      }
      Backbone.history.navigate('workspace');
      return EpubModels.EPUB_CONTAINER.loaded().then(function() {
        return EpubModels.EPUB_CONTAINER.each(function(book) {
          return book.loaded();
        });
      });
    };
    XhtmlModel = AtcModels.BaseContent.extend({
      mediaType: 'application/xhtml+xml',
      parse: function(html) {
        var $body, $head, $html, $images, counter, _ref, _ref1,
          _this = this;
        if ('string' !== typeof html) {
          return {};
        }
        if (!/<body/.test(html)) {
          html = "<body>" + html + "</body>";
        }
        if (!/<html/.test(html)) {
          html = "<html>" + html + "</html>";
        }
        html = html.replace(/html>/g, "prefix-html>");
        html = html.replace(/<\/head>/g, "</prefix-head>");
        html = html.replace(/body>/g, "prefix-body>");
        html = html.replace(/<html/g, "<prefix-html");
        html = html.replace(/<head>/g, "<prefix-head>");
        html = html.replace(/<body/g, "<prefix-body");
        $html = jQuery(html);
        $head = $html.find('prefix-head');
        $body = $html.find('prefix-body');
        $html.find('img').each(function(i, img) {
          var $img, src;
          $img = jQuery(img);
          src = $img.attr('src');
          if (/^https?:/.test(src)) {
            return;
          }
          if (/^data:/.test(src)) {
            return;
          }
          $img.removeAttr('src');
          return $img.attr('data-src', src);
        });
        $images = $html.find('img[data-src]');
        counter = $images.length;
        $images.each(function(i, img) {
          var $img, doneLoading, src;
          $img = jQuery(img);
          src = $img.attr('data-src');
          return doneLoading = readBinaryFile(src).done(function(bytes, statusMessage, xhr) {
            var encode, encoded, mediaType, _ref;
            mediaType = AtcModels.ALL_CONTENT.get(src).mediaType;
            encode = btoa || ((_ref = _this.Base64) != null ? _ref.encode : void 0);
            encoded = encode(bytes);
            $img.attr('src', "data:" + mediaType + ";base64," + encoded);
            counter--;
            if (counter === 0) {
              return _this.set('body', $body[0].innerHTML);
            }
          }).fail(function() {
            counter--;
            return $img.attr('src', 'path/to/failure.png');
          });
        });
        return {
          head: (_ref = $head[0]) != null ? _ref.innerHTML : void 0,
          body: (_ref1 = $body[0]) != null ? _ref1.innerHTML : void 0
        };
      },
      serialize: function() {
        var $body, $head, body, head;
        head = this.get('head');
        body = this.get('body');
        $head = jQuery("<div class='unwrap-me'>" + head + "</div>");
        $body = jQuery("<div class='unwrap-me'>" + body + "</div>");
        $body.find('img[data-src]').each(function(i, img) {
          var $img, src;
          $img = jQuery(img);
          src = $img.attr('data-src');
          $img.removeAttr('data-src');
          return $img.attr('src', src);
        });
        return "<html>\n  <head>\n    " + $head[0].innerHTML + "\n  </head>\n  <body>\n    " + $body[0].innerHTML + "\n  </body>\n</html>";
      }
    });
    MEDIA_TYPES.add(XhtmlModel);
    AtcModels_Folder_accepts = AtcModels.Folder.prototype.accepts();
    AtcModels_Folder_accepts.push(XhtmlModel.prototype.mediaType);
    AtcModels.Folder.prototype.accepts = function() {
      return AtcModels_Folder_accepts;
    };
    STORED_KEYS = ['repoUser', 'repoName', 'branch', 'rootPath', 'id', 'password'];
    Auth.on('change', function() {
      var key, value, _ref, _ref1, _results;
      if (!_.isEmpty(_.pick(Auth.changed, STORED_KEYS))) {
        if (Auth.get('rateRemaining') && Auth.get('password') && !Auth.previousAttributes()['password']) {
          return;
        }
        resetDesktop();
        _ref = Auth.toJSON();
        _results = [];
        for (key in _ref) {
          value = _ref[key];
          _results.push((_ref1 = _this.sessionStorage) != null ? _ref1.setItem(key, value) : void 0);
        }
        return _results;
      }
    });
    if (!Backbone.History.started) {
      Controller.start();
    }
    Backbone.history.navigate('workspace');
    props = {};
    _.each(STORED_KEYS, function(key) {
      var value, _ref;
      value = (_ref = this.sessionStorage) != null ? _ref.getItem(key) : void 0;
      if (value) {
        return props[key] = value;
      }
    });
    Auth.set(props);
    $signin = jQuery('#sign-in-modal');
    $signin.modal('show');
    return $signin.on('hide', function() {
      return setTimeout(resetDesktop, 100);
    });
  });

}).call(this);
