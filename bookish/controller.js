// Generated by CoffeeScript 1.3.3
(function() {

  define(['jquery', 'backbone', 'marionette', 'bookish/media-types', 'bookish/auth', 'bookish/models', 'bookish/views', 'hbs!bookish/layouts/main', 'hbs!bookish/layouts/content', 'hbs!bookish/layouts/workspace', 'exports', 'i18n!bookish/nls/strings'], function(jQuery, Backbone, Marionette, MEDIA_TYPES, Auth, Models, Views, LAYOUT_MAIN, LAYOUT_CONTENT, LAYOUT_WORKSPACE, exports, __) {
    var ContentLayout, ContentRouter, HidingRegion, MainLayout, contentLayout, mainArea, mainController, mainLayout, mainRegion, mainSidebar, mainToolbar;
    mainRegion = new Marionette.Region({
      el: '#main'
    });
    HidingRegion = Marionette.Region.extend({
      onShow: function() {
        return this.$el.removeClass('hidden');
      },
      onClose: function() {
        this.ensureEl();
        return this.$el.addClass('hidden');
      }
    });
    MainLayout = Marionette.Layout.extend({
      template: LAYOUT_MAIN,
      regionType: HidingRegion,
      regions: {
        home: '#layout-main-home',
        toolbar: '#layout-main-toolbar',
        auth: '#layout-main-auth',
        sidebar: '#layout-main-sidebar',
        area: '#layout-main-area'
      }
    });
    mainLayout = new MainLayout();
    mainToolbar = mainLayout.toolbar;
    mainSidebar = mainLayout.sidebar;
    mainArea = mainLayout.area;
    ContentLayout = Marionette.Layout.extend({
      template: LAYOUT_CONTENT,
      regions: {
        title: '#layout-title',
        body: '#layout-body',
        metadata: '#layout-metadata',
        roles: '#layout-roles'
      }
    });
    contentLayout = new ContentLayout();
    mainController = {
      start: function() {
        var _this = this;
        mainRegion.show(mainLayout);
        mainLayout.auth.show(new Views.AuthView({
          model: Auth
        }));
        mainLayout.home.ensureEl();
        mainLayout.home.$el.on('click', function() {
          return _this.workspace();
        });
        mainSidebar.onClose();
        mainArea.onClose();
        if (!Backbone.History.started) {
          return Backbone.history.start();
        }
      },
      getRegion: function() {
        return mainRegion;
      },
      mainLayout: mainLayout,
      hideSidebar: function() {
        return mainSidebar.close();
      },
      workspace: function() {
        var view, workspace,
          _this = this;
        window.scrollTo(0, 0);
        mainSidebar.close();
        mainToolbar.close();
        workspace = new Models.FilteredCollection(null, {
          collection: Models.WORKSPACE
        });
        view = new Views.SearchBoxView({
          model: workspace
        });
        mainToolbar.show(view);
        view = new Views.SearchResultsView({
          collection: workspace
        });
        mainArea.show(view);
        return Models.WORKSPACE.loaded().done(function() {
          return Backbone.history.navigate('workspace');
        });
      },
      editModelId: function(id) {
        var model;
        model = Models.ALL_CONTENT.get(id);
        if (!model) {
          return this.workspace();
        }
        return this.editModel(model);
      },
      editModel: function(model) {
        var editAction;
        if (!model.mediaType) {
          throw 'BUG: model.mediaType does not exist';
        }
        editAction = MEDIA_TYPES.get(model.mediaType).editAction;
        if (!editAction) {
          throw 'BUG: no way to edit this model';
        }
        return editAction(model);
      },
      editBook: function(model) {
        var view;
        window.scrollTo(0, 0);
        mainToolbar.close();
        view = new Views.BookEditView({
          model: model
        });
        return mainSidebar.show(view);
      },
      editContent: function(content) {
        var configAccordionDialog, view,
          _this = this;
        window.scrollTo(0, 0);
        mainArea.show(contentLayout);
        configAccordionDialog = function(region, view) {
          var dialog,
            _this = this;
          dialog = new Views.DialogWrapper({
            view: view
          });
          region.show(dialog);
          dialog.on('saved', function() {
            return region.$el.parent().collapse('hide');
          });
          return dialog.on('cancelled', function() {
            return region.$el.parent().collapse('hide');
          });
        };
        configAccordionDialog(contentLayout.metadata, new Views.MetadataEditView({
          model: content
        }));
        configAccordionDialog(contentLayout.roles, new Views.RolesEditView({
          model: content
        }));
        view = new Views.ContentToolbarView({
          model: content
        });
        mainToolbar.show(view);
        view = new Views.TitleEditView({
          model: content
        });
        contentLayout.title.show(view);
        contentLayout.title.$el.popover({
          trigger: 'hover',
          placement: 'right',
          content: __('Click to change title')
        });
        view = new Views.ContentEditView({
          model: content
        });
        contentLayout.body.show(view);
        return content.loaded().then(function() {
          return Backbone.history.navigate("content/" + (content.get('id')));
        });
      }
    };
    ContentRouter = Marionette.AppRouter.extend({
      controller: mainController,
      appRoutes: {
        '': 'workspace',
        'workspace': 'workspace',
        'content/:id': 'editModelId'
      }
    });
    MEDIA_TYPES.add('application/vnd.org.cnx.module', {
      editAction: function(model) {
        return mainController.editContent(model);
      }
    });
    MEDIA_TYPES.add('application/vnd.org.cnx.collection', {
      editAction: function(model) {
        return mainController.editBook(model);
      }
    });
    new ContentRouter();
    return jQuery.extend(exports, mainController);
  });

}).call(this);
