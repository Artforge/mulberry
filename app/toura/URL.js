dojo.provide('toura.URL');

toura.URL = {
  home : function() {
    return '#/home';
  },

  about : function() {
    return '#/about';
  },

  maps : function() {
    return '#/maps';
  },

  favorites : function() {
    return '#/favorites';
  },

  node : function(nodeId) {
    return '#/node/' + nodeId;
  },

  search : function() {
    return '#/search';
  },

  searchTerm : function(term) {
    return toura.URL.search() + '/' + term;
  },

  searchResult : function(context) {
    var url = [ 'node', context.node ];

    if (context.type !== 'node') {
      url.push('__pageState', context.type, context.id);
    }

    return '#/' + url.join('/');
  },

  update : function() {
    return '#/update';
  },

  storedAsset : function(type, filename) {
    var dirs = {
          'image' : 'images',
          'video' : 'videos',
          'audio' : 'audios',
          'html'  : 'html',
          'videoPoster' : 'videos/poster'
        };

    return [ 'media', dirs[type], filename ].join('/');
  },

  feedItem : function(feedId, itemIndex) {
    return '/feed/' + feedId + '/item/' + itemIndex;
  }
};
