dojo.provide('toura.components.NodeGallery');

dojo.require('mulberry._Component');
dojo.require('toura.components._ImageScroller');

dojo.declare('toura.components.NodeGallery', [ mulberry._Component, toura.components._ImageScroller ], {
  'class' : 'node-gallery',

  prepareData : function() {
    this.node.populateChildren();
    this.children = this.node.children;

    this.images = dojo.map(this.children || [], function(child) {
      var img = child.images[0];

      return dojo.mixin(img, this.isPhone ? {
        url : img.gallery.url,
        height : img.gallery.height,
        width : img.gallery.width
      } : {
        url : img.original.url,
        height : img.original.height,
        width : img.original.width
      });
    }, this);
  },

  postCreate : function() {
    this.scrollerNode = this.clickNode = this.imageList;
    this.inherited(arguments);
  },

  setupConnections : function() {
    this.connect(this.clickNode, 'click', '_handle');
  },

  _handle : function(e) {
    var child = this.children[this.currentImageIndex],

        params = {
          x : e.offsetX,
          y : e.offsetY
        },

        img = this.images[this.currentImageIndex],
        multiplier,
        nodeHeight = this.domNode.clientHeight,
        nodeWidth = this.domNode.clientWidth,
        resizeRatio = nodeWidth / img.width;

    if ((img.height * resizeRatio) > nodeHeight) {
      params.y += ((img.height * resizeRatio) - nodeHeight) / 2;
    }

    multiplier = img.original.width / nodeWidth;

    params.x = Math.floor(params.x * multiplier);
    params.y = Math.floor(params.y * multiplier);

    mulberry.app.UI.click = params;
    mulberry.app.Router.go(child.url);
  },

  onScrollEnd : function(imageIndex) {
    // stub for connection
  }
});
