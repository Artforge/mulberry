dojo.provide('toura.components.PageNav');

dojo.require('mulberry._Component');
dojo.require('toura.components.MoreDrawer');
dojo.require('toura.components.buttons.MoreDrawerButton');
dojo.require('toura.components.buttons.HomeButton');
dojo.require('toura.components.buttons.BackButton');
dojo.require('toura.components.buttons.LayoutToggleButton');
dojo.require('toura.URL');

dojo.declare('toura.components.PageNav', mulberry._Component, {
  templateString : dojo.cache('toura.components', 'PageNav/PageNav.haml'),
  widgetsInTemplate : true,
  shareable : true,
  layoutToggle : false,
  restrictBack: false,

  prepareData : function() {
    this.searchUrl = toura.URL.search();
    this.homeUrl = toura.URL.home();

    this.title = this.node ? this.node.name : this.title;
    this.shareable = this.node && this.node.shareable;
	  if(navigator.standalone === false && this.device.os === "browser") {
      this.restrictBack = true;
	  }
  },

  setupConnections : function() {
    if (this.moreDrawerButton) {
      this.connect(this.moreDrawerButton, 'onClick', '_showMoreDrawer');
    }
  },

  setupSubscriptions : function() {
    this.subscribe('/button/menu', '_showMoreDrawer');
  },

  setupChildComponents : function() {
    if (this.shareable) {
      this.moreDrawer.set('node', this.node);
    }
  },

  initializeStrings : function() {
    this.i18n_more = this.getString('MORE');
  },

  _showMoreDrawer : function(e) {
    if (e) { e.preventDefault(); }
    this.moreDrawer.toggle();
  },

  attributeMap : {
    screenTitle : {
      node : 'titleElement',
      type : 'innerHTML'
    }
  }
});
