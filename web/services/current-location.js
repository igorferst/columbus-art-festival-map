// Service that attempts to get the current location using the geolocation API

angular.module('caf-map.client').service('currentLocation', [
'$rootScope', '$log', 'uniqueId',
function($rootScope, $log, uniqueId) {

  var FEST_BOUNDS = {
    lat: [39.95373409987702, 39.96125072561336],
    lng: [-83.00032496452332, -83.01043152809143]
  };
  function withinBounds(location) {
    return location.lat > FEST_BOUNDS.lat[0] &&
           location.lat < FEST_BOUNDS.lat[1] &&
           location.lng < FEST_BOUNDS.lng[0] &&
           location.lng > FEST_BOUNDS.lng[1]
  };

  var POSITION_OPTIONS = {
    timeout: 5000
  };
  var POSITION_CHANGE_THRESHOLD = 0.0001;

  var refreshInProgress = false;
  this.refreshInProgress = function() {
    return refreshInProgress;
  };

  var previousLocation = null;
  this.getPreviousLocation = function() {
    return previousLocation;
  };

  // Refresh current location when device position changes
  var watchPositionId = null
  if (navigator && navigator.geolocation) {
    watchPositionId = navigator.geolocation.watchPosition(
      function(position) {
        var newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        if (_.isNull(previousLocation)) {
          updateCurrentLocation(newLocation, false);
          return
        };

        // Only update location if distance between previous and new location
        // exceeds threshold.
        var distance = Math.sqrt(
          Math.pow(previousLocation.lat - newLocation.lat, 2) +
          Math.pow(previousLocation.lng - newLocation.lng, 2)
        );
        if (distance > POSITION_CHANGE_THRESHOLD) {
          updateCurrentLocation(newLocation, false)
        }
      },
      function(error) {
        ga('send', 'event', 'geolocation_error', uniqueId.get(), error.code);
        $log.debug('Geolocation error code: ' + error.code);
      },
      POSITION_OPTIONS
    );
  } else {
    ga('send', 'event', 'geolocation_not_supported', uniqueId.get());
    $log.debug('Geolocation is not supported');
  };

  // Called by client code to force a refresh of the current location
  // AND center the map on the new location
  this.refresh = function(onlyCenterIfWithinBounds) {
    if (!navigator || !navigator.geolocation) {
      // Browser does not support geolocation
      ga('send', 'event', 'geolocation_not_supported', uniqueId.get());
      $log.debug('Geolocation is not supported');
      return
    }

    refreshInProgress = true;
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        updateCurrentLocation(newLocation, !onlyCenterIfWithinBounds || withinBounds(newLocation));
        refreshInProgress = false;
      },
      function (error) {
        ga('send', 'event', 'geolocation_error', uniqueId.get(), error.code);
        $log.debug('Geolocation error code: ' + error.code);
        refreshInProgress = false;
        var msg = 'Unable to find your location: ';
        if (error.code === 1) {
          alert(msg + 'permission denied.')
        // } else if (error.code === 2 || error.code === 3) {
        //   alert(msg + 'network failure, please try again later.')
        }
      },
      POSITION_OPTIONS
    );
  };
  // Go ahead and get position on load, but only center if within bounds
  this.refresh(true);

  function updateCurrentLocation(location, centerMapOnPosition) {
    ga('send', 'event', 'position', uniqueId.get(), "" + location.lat + "," + location.lng);
    $log.debug('Updating current location: {0}, {1}'.format(location.lat, location.lng));
    previousLocation = location;
    $rootScope.$broadcast('update-current-position', location);
    if (centerMapOnPosition) {
      $rootScope.$broadcast('center-map', location);
    }
  };

}]);
