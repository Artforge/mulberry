dojo.provide('toura.Sharing');

dojo.require('toura.user.Facebook.base');
dojo.require('toura.user.Twitter');
dojo.require('dojo.string');

dojo.requireLocalization('mulberry', 'mulberry');

//Note that mobile web sharing is not enabled, and will not be used.
toura.Sharing = {
  lastPost : {},

  getMessage : function(svc, obj) {
    console.log('toura.Sharing::getMessage', arguments);
    
    var app = mulberry.app.Config.get('app');

    // allow for case where no object is passed
    obj = obj || { "name" : app.name };
    var defaultTmpl = obj.sharingText || app.sharingText || "${sharingURL}",
        consumed = 0,
        ret;

    // use default sharing url if one isn't present on the object
    obj.sharingURL = obj.sharingURL || app.sharingUrl || mulberry.sharingURL;
    
    if (!obj.sharingURL) {
      console.error('No sharing URL defined for object or app. This will end badly.');
    }

    if (!defaultTmpl) {
      console.error('No sharing text template defined. This will end badly.');
    }

    if (svc === 'twitter') {
      // account for the sharing url
      consumed += obj.sharingURL.length;

      // truncate the part that comes before the sharing URL
      ret = dojo.string.substitute(defaultTmpl, obj).split(obj.sharingURL);

      // acount for anything after the sharing URL
      if (ret[1]) { consumed += ret[1].length; }

      // reassemble the message
      ret = [
        dojo.trim(ret[0].substr(0, 140 - consumed)),
        obj.sharingURL,
        ret[1] || ''
      ].join(' ');
    } else {
      // yay services that don't require short messages
      // console.log(obj);
      ret = dojo.string.substitute(defaultTmpl, obj).split(obj.sharingURL) + ' ' + obj.sharingURL;
      // ret = dojo.string.substitute(defaultTmpl, obj) + ' ' + obj.sharingURL;
      console.log("ret: " + ret);
      
    }

    return ret;
  },

  share : function(service, params, node) {
    console.log('toura.Sharing::share()');

    var dfd = new dojo.Deferred(),
        svc = service.name,
        doit = true,
        before = service.beforePost ? !!service.beforePost(params) : true;

    if (before !== true) {
      dfd.reject(service.beforePostError);
      doit = false;
    }

    if (this.lastPost[svc] && (this.lastPost[svc] === params.msg)) {
      dfd.reject('The message is a duplicate.');
      doit = false;
    }

    if (doit) {
      service.api.postMessage(params.msg)
        .then(dojo.hitch(this, function() {
          this.lastPost[svc] = params.msg;
          dojo.publish('/share', [
            svc, node.url.substring(1), params.msg.toString()
          ]);
          dfd.resolve();
        }));
    }

    return dfd.promise;
  },

  getServices : function() {
    var i18n = dojo.i18n.getLocalization('mulberry', 'mulberry', mulberry.app.Config.get('locale')),
        services = [];

    if (!toura.user.Twitter.disabled) {
      services.push({
        name : 'twitter',
        api : toura.user.Twitter,
        requireAuth : !toura.user.Twitter.isAuthenticated(),
        maxLength : 140,
        beforePost : function(params) {
          return !!toura.user.Twitter.setUserInfo(params);
        },
        beforePostError : i18n.TWITTER_AUTHENTICATION_ERROR
      });
    }

    if (!toura.user.Facebook.disabled) {
      services.push({
        name : 'facebook',
        api : toura.user.Facebook
      });
    }

    return services;
  }
};

dojo.subscribe('/app/ready', function() {
  toura.user.Facebook = new toura.user.Facebook.base();
  toura.user.Twitter = new toura.user.Twitter();
});
