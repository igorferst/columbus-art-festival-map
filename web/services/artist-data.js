// Service that fetches artist data

angular.module('caf-map.client').service('artistData', [
'$q', '$http', '$window', 'ArtistBooth',
function($q, $http, $window, ArtistBooth) {

  var ls = $window.localStorage;

  /*** The current version of artist data ***/
  /*** INCREMENT ME WHEN YOU UPDATE DATA!!! ***/
  var ARTIST_DATA_VERSION = 13;

  // Keys for localStorage
  var ARTIST_DATA_VERSION_KEY = 'caf-map-artist-data-version';
  var ARTIST_DATA_KEY = 'caf-map-artist-data';

  // Return promise that is resolved with the artist data (or rejected with an error)
  this.get = function() {

    var def = $q.defer();

    var lastVersion = null
    try {
      lastVersion = ls.getItem(ARTIST_DATA_VERSION_KEY);
    } catch(e) {}

    if (lastVersion == ARTIST_DATA_VERSION) {
      // If latest version already stored in local storage, resolve with stored data
      console.log('Fetching artist data from local storage...')
      var data = JSON.parse(ls.getItem(ARTIST_DATA_KEY))
      resolveDefWithData(def, data);

    } else {
      // Otherwise fetch data and write it to local storage
      console.log('Fetching artist data from server...')
      $http.get('assets/data/artist_data.json?nocache=' + ARTIST_DATA_VERSION).then(function(resp) {
        resolveDefWithData(def, resp.data);
        try {
          ls.setItem(ARTIST_DATA_KEY, JSON.stringify(resp.data));
          ls.setItem(ARTIST_DATA_VERSION_KEY, ARTIST_DATA_VERSION);
        } catch(e) {}
      });

    }

    return def.promise
  }

  function resolveDefWithData(def, data) {
    // Transform raw json booth data into ArtistBooth objects
    var booths = _.map(data, function(boothData) {
      return new ArtistBooth(boothData)
    });
    def.resolve(booths);
  };

}]);
