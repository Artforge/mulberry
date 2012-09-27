describe("base _Adapter class", function() {
  var mockjax, ajaxMocks, adapter, config;

  beforeEach(function() {
    dojo.require('mulberry._Adapter');

    mockjax = function (args) {
      var dfd = new dojo.Deferred();

      if (ajaxMocks[args.url]) {
        if (args.load) {
          args.load(ajaxMocks[args.url]);
        }

        dfd.resolve(ajaxMocks[args.url]);
      } else {
        if (args.error) {
          args.error();
        }

        dfd.reject();
      }

      return dfd;
    };

    mulberry.app.PhoneGap = {
      network : {
        isReachable : function() {
          var dfd = new dojo.Deferred();
          dfd.resolve(true);
          return dfd.promise;
        }
      }
    };

    dojo.xhrGet = dojo.io.script.get = mockjax;

    dojo.provide('mulberry.app.PhoneGap.network');

  });

  it("should initialize properly with a config", function() {
    config = {
      'foo' : 'bar',
      'baz' : 'biz'
    };

    adapter = new mulberry._Adapter(config);

    expect(adapter.config).toEqual(config);
    expect(adapter.foo).toEqual(config.foo);
    expect(adapter.baz).toEqual(config.baz);
  });

  describe("data management", function() {
    var deferred, resolveTest;

    beforeEach(function() {
      resolveTest = false;

      dojo.require('mulberry.app.DeviceStorage');

      ajaxMocks = {
        'foo' : [
          { 'bar' : 'baz' }
        ]
      };
    });

    describe("getData", function() {
      beforeEach(function() {
        mulberry.app.DeviceStorage.drop();
        mulberry.app.DeviceStorage.init('foo');

        adapter = new mulberry._Adapter({
          remoteDataUrl : 'foo',
          source : 'bar'
        });

        mulberry.app.DeviceStorage.set('bar', null, adapter);

        spyOn(adapter, '_getRemoteData').andCallThrough();
      });

      it("should retrieve remote data when no data is present", function() {
        var startTime = new Date().getTime();

        deferred = adapter.getData();

        deferred.then(function() { resolveTest = true; });

        waitsFor(function() { return resolveTest; });

        runs(function() {
          expect(adapter._items).toEqual(ajaxMocks.foo);
          expect(adapter._getRemoteData).toHaveBeenCalled();
          expect(adapter._getLastUpdate()).toBeGreaterThan(startTime);
        });
      });

      it("should retrieve local data when it is present and not expired", function() {
        adapter._setLastUpdate('bar');

        deferred = adapter.getData();

        deferred.then(function() { resolveTest = true; });

        waitsFor(function() { return resolveTest; });

        runs(function() {
          expect(adapter._items).toEqual(ajaxMocks.foo);
          expect(adapter._getRemoteData).not.toHaveBeenCalled();
        });
      });

      it("should retrieve remote data when local data is expired", function() {

      });

      // it("should resolve false when xhr fails", function() {
      //   var result = null;

      //   adapter = new mulberry._Adapter({
      //     source : 'foo',
      //     remoteDataUrl : 'bar'
      //   });

      //   mockjax = function() {
      //     var dfd = new dojo.Deferred();
      //     dfd.reject();
      //     return dfd;
      //   };

      //   deferred = adapter.getData();

      //   deferred.then(function(d) {
      //     result = d;
      //     resolveTest = true;
      //   });

      //   waitsFor(function() { return resolveTest; });

      //   runs(function() {
      //     expect(result).toEqual(false);
      //   });
      // });
    });

    describe("_getRemoteData", function() {
      it("should resolve with remote data", function() {
        var result = null;

        adapter = new mulberry._Adapter({
          source : 'bar',
          remoteDataUrl : 'foo'
        });

        deferred = adapter._getRemoteData();

        deferred.then(function(d) {
          result = d;
          resolveTest = true;
        });

        waitsFor(function() { return resolveTest; });

        runs(function() {
          expect(result).toEqual(ajaxMocks.foo);
        });
      });

      it("should resolve false when no url is given", function() {
        var result = null;

        adapter = new mulberry._Adapter({
          source : 'foo'
        });

        deferred = adapter._getRemoteData();

        deferred.then(function(d) {
          result = d;
          resolveTest = true;
        });

        waitsFor(function() { return resolveTest; });

        runs(function() {
          expect(result).toEqual(false);
        });
      });
    });

    describe("_storeRemoteData", function() {
      it("should store data & resolve the main deferred to true", function() {
        var result = null;

        adapter = new mulberry._Adapter({
          deferred : new dojo.Deferred()
        });

        spyOn(adapter, '_processData').andCallThrough();
        spyOn(adapter, '_store').andCallThrough();

        adapter._storeRemoteData(ajaxMocks.foo);

        adapter.deferred.then(function(d) {
          result = d;
          resolveTest = true;
        });

        waitsFor(function() { return resolveTest; });

        runs(function() {
          expect(adapter._processData).toHaveBeenCalledWith(ajaxMocks.foo);
          expect(adapter._store).toHaveBeenCalledWith(true);
          expect(result).toEqual(true);
        });
      });
    });

  });
});