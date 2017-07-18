// Service that fetches PoI data

angular.module('caf-map.client').service('poiData', [
'$q', '$http', '$window', 'PointOfInterest',
function($q, $http, $window, PointOfInterest) {

  var ls = $window.localStorage;

  /*** The current version of PoI data ***/
  /*** INCREMENT ME WHEN YOU UPDATE DATA!!! ***/
  var POI_DATA_VERSION = 15;

  // Keys for localStorage
  var POI_DATA_VERSION_KEY = 'caf-map-poi-data-version';
  var POI_DATA_KEY = 'caf-map-poi-data';

  // Return promise that is resolved with the PoI data (or rejected with an error)
  this.get = function() {

    var def = $q.defer();

    var lastVersion = null
    try {
      lastVersion = ls.getItem(POI_DATA_VERSION_KEY);
    } catch(e) {}

    if (lastVersion == POI_DATA_VERSION) {
      // If latest version already stored in local storage, resolve with stored data
      console.log('Fetching PoI data from local storage...')
      var data = JSON.parse(ls.getItem(POI_DATA_KEY))
      resolveDefWithData(def, data);

    } else {
      // Otherwise fetch data and write it to local storage
      console.log('Fetching PoI data from server...')
      $http.get('assets/data/poi_data.json?nocache=' + POI_DATA_VERSION).then(function(resp) {
        resolveDefWithData(def, resp.data);
        try {
          ls.setItem(POI_DATA_KEY, JSON.stringify(resp.data));
          ls.setItem(POI_DATA_VERSION_KEY, POI_DATA_VERSION);
        } catch(e) {}
      });

    }

    return def.promise
  }

  function resolveDefWithData(def, data) {
    // Transform raw json booth data into PointOfInterest objects (grouped by type)
    var pois = _.map(data, function(poiData) {
      return new PointOfInterest(poiData)
    });
    var out = {};

    out.beverages = _.filter(pois, function(poiData) {
      // There are several types of beverage booths, this captures all of them
      return poiData.type.indexOf('beverages') > -1
    })
    out.restrooms = _.filter(pois, function(poiData) {
      // There are two types of restroom booths, this captures both of them
      return poiData.type.indexOf('restrooms') > -1
    })
    out.food = _.filter(pois, {type: 'food'});
    out.merch = _.filter(pois, {type: 'merchandise'});
    out.firstAid = _.filter(pois, {type: 'first_aid'});
    out.stage = _.filter(pois, {type: 'stage'});

    def.resolve(out);
  };

}]);
