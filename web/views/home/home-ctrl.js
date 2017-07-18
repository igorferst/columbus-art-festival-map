angular.module('caf-map.client').controller('HomeCtrl', [
'$scope', '$q', '$log', '$timeout', 'uiGmapIsReady', 'uiGmapGoogleMapApi', 'artistData', 'poiData', 'uniqueId',
function($scope, $q, $log, $timeout, uiGmapIsReady, uiGmapGoogleMapApi, artistData, poiData, uniqueId) {

  var INFOWINDOW_LAT_OFFSET = .003;

  var ctrl = this;

  $scope.currentPosition = {};

  $scope.selectedBooths = [];
  $scope.selectedBoothMarkerModels = [];
  $scope.selectedBoothMarkersControl = {};

  $scope.beverageMarkerModels = [];
  $scope.foodMarkerModels = [];
  $scope.firstAidMarkerModels = [];
  $scope.merchMarkerModels = [];
  $scope.restroomMarkerModels = [];
  $scope.stageMarkerModels = [];
  $scope.stageMarkersControl = {};

  // Autocomplete models
  ctrl.selectedBooth = null;
  ctrl.boothSearchText = null;

  // Configuration for the Google Map
  ctrl.map = {
    center: {
      latitude: 39.95875075798646,
      longitude: -83.00520658493042
    },
    zoom: 16,
    options: {
      streetViewControl: false,
      mapTypeControl: false,
      zoomControl: false,
      disableDoubleClickZoom: false,
      minZoom: 15,
      maxZoom: 19,
      // Add SnazzyMaps below
      styles: [{"featureType":"landscape","stylers":[{"hue":"#FFBB00"},{"saturation":43.400000000000006},{"lightness":37.599999999999994},{"gamma":1}]},{"featureType":"road.highway","stylers":[{"hue":"#FFC200"},{"saturation":-61.8},{"lightness":45.599999999999994},{"gamma":1}]},{"featureType":"road.arterial","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":51.19999999999999},{"gamma":1}]},{"featureType":"road.local","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":52},{"gamma":1}]},{"featureType":"water","stylers":[{"hue":"#0078FF"},{"saturation":-13.200000000000003},{"lightness":2.4000000000000057},{"gamma":1}]},{"featureType":"poi","stylers":[{"hue":"#00FF6A"},{"saturation":-1.0989010989011234},{"lightness":11.200000000000017},{"gamma":1}]}]
    },
    mapEvents: {
      // Show coordinates in console when clicking map
      click: function(map, eventName, originalEventArgs) {
        var coord_source = originalEventArgs[0].latLng;
        $log.log(coord_source.lat(), coord_source.lng());
      },
    },
    boothEvents: {
      // Show info window when clicking on booth marker.
      click: function(gMarker, eventName, model) {
        openInfoWindow(gMarker);
        ga('send', 'event', 'clicked_marker', uniqueId.get(), gMarker.model.booth.boothNumber);
      }
    },
    markerIcons: {
      booth: 'assets/svgs/booth_marker.svg',
      beverage: 'assets/svgs/beverage_marker.svg',
      food: 'assets/svgs/food_marker.svg',
      restroom: 'assets/svgs/restroom_marker.svg',
      stage: 'assets/svgs/stage_marker.svg'
    },
    control: {}
  };

  var openInfoWindow = function(gMarker) {
    ctrl.boothInfoWindow.setContent(gMarker.model.booth.getInfoWindowContent());
    var gMap = ctrl.map.control.getGMap();
    ctrl.boothInfoWindow.open(gMap, gMarker);
  };

  var mapPointsOfInterest = function(poiData) {
    return _.map(poiData, function(poi) {
      return {
        position: poi.getLocation(),
        id: poi.boothNumber,
        booth: poi
      }
    });
  }

  // A promise that resolves with our Google Map instance
  var mapInstancePromise = uiGmapIsReady.promise().then(function(instances) {
    return instances[0].map;
  });

  // uiGmapGoogleMapApi is a promise that resolves with the google.maps object
  uiGmapGoogleMapApi.then(function(maps) {
    // Get new info window via raw Google Maps API because the angular-google-maps
    // directive for info window is busted...
    ctrl.boothInfoWindow = new maps.InfoWindow();
  });

  var artistDataPromise = artistData.get().then(function(artistBooths){
    $scope.booths = artistBooths;

    // Read the categories from the artist data
    $scope.categories = _.chain($scope.booths)
      .pluck('category')
      .uniq()
      .map(function(category) {
        return {name: category, selected: false}
      })
      .value()
  });

  var poiDataPromise = poiData.get().then(function(poiData){
    $scope.poiData = poiData;

    $scope.beverageMarkerModels = mapPointsOfInterest($scope.poiData.beverages);
    $scope.foodMarkerModels = mapPointsOfInterest($scope.poiData.food);
    $scope.firstAidMarkerModels = mapPointsOfInterest($scope.poiData.firstAid);
    $scope.restroomMarkerModels = mapPointsOfInterest($scope.poiData.restrooms);
    $scope.merchMarkerModels = mapPointsOfInterest($scope.poiData.merch);
    $scope.stageMarkerModels = mapPointsOfInterest($scope.poiData.stage);
  });

  // Flip a bit when all promises that are required for full functionality
  // are resolved.
  ctrl.allDataReceived = false;
  ctrl.hidePreloader = false;
  $q.all([artistDataPromise, poiDataPromise, mapInstancePromise]).then(function() {
    ga('set', 'userId', uniqueId.get());
    $log.debug('All map components loaded');
    ctrl.allDataReceived = true;
    $timeout(function(){
      ctrl.hidePreloader = true;
    }, 200);
  });

  // Show selected booth when user finds it via artist name search
  $scope.showSelectedBooth = function() {
    if (ctrl.selectedBooth) {
      $scope.selectedBooths = [ctrl.selectedBooth];
      // Clear categories
      _.each($scope.categories, function(cat){cat.selected = false})
      // Center map on selected Booth
      var center = ctrl.selectedBooth.getLocation();
      $scope.$emit(
        'center-map',
        new google.maps.LatLng(center.latitude + INFOWINDOW_LAT_OFFSET, center.longitude)
      );
      // Close drawer
      ctrl.toggleOpen($scope.artistSearchControls.name);
      hideAutocompleteSuggestions();
      // Send GA event
      ga('send', 'event', 'search_artist_by_name', uniqueId.get(), ctrl.selectedBooth.fullName);
    }
  };

  // Show booths that user selects via category search
  $scope.showSelectedBooths = function() {
    var selectedCategories = _.chain($scope.categories)
      .where({selected: true})
      .pluck('name')
      .value();
    $scope.selectedBooths = _.filter($scope.booths, function(booth) {
      return _.contains(selectedCategories, booth.category)
    })
    // Clear name search
    ctrl.selectedBooth = null;
    ctrl.boothSearchText = null;
    ga('send', 'event', 'search_artist_by_category', uniqueId.get(), selectedCategories.sort().join(","));
  };

  function stripSpaceLowercase(str) {
    return str.replace(' ', '').toLowerCase()
  };

  // Used by autocomplete to search artists by name
  $scope.findBoothsByString = function(searchString) {
    return _.chain($scope.booths)
      .filter(function(booth) {
        var compString = stripSpaceLowercase(
          booth.firstName + booth.lastName + booth.businessName + booth.boothNumber
        );
        return compString.indexOf(stripSpaceLowercase(searchString)) > -1
      })
      .first(10)
      .value()
  };

  ctrl.selectBigLocal = function() {
    var bigLocalBooth = $scope.stageMarkersControl.getPlurals().get('BigLocal');
    // Clear selected booths
    $scope.selectedBooths = [];
    // Open info window
    openInfoWindow(bigLocalBooth.gObject)
    // Center map
    var center = bigLocalBooth.model.position;
    $scope.$emit(
      'center-map',
      new google.maps.LatLng(center.latitude + INFOWINDOW_LAT_OFFSET, center.longitude)
    );
    // Clear name search
    ctrl.selectedBooth = null;
    ctrl.boothSearchText = null;
    // Close drawer
    ctrl.toggleOpen($scope.artistSearchControls.name);
    hideAutocompleteSuggestions();
    // Send GA event
    ga('send', 'event', 'clicked_big_local_booth', uniqueId.get());
  };

  // cf. http://stackoverflow.com/questions/31858787/angular-material-md-autocomplete-how-to-hide-md-autocomplete-suggestions-on-e
  function hideAutocompleteSuggestions() {
    angular.element(document.getElementById('autocomplete-artist-name').firstElementChild)
      .scope()
      .$mdAutocompleteCtrl
      .hidden = true;
  };

  // Models for artist search widgets
  $scope.artistSearchControls = {
    name: {
      id: 'name',
      title: 'Find Artist by Name/Booth',
      isOpen: false
    },
    category: {
      id: 'category',
      title: 'Find Artists by Category',
      isOpen: false
    }
  };

  // These two functions are called by the expando directive controller
  ctrl.isOpen = function(searchControl) {
    return searchControl.isOpen;
  }
  ctrl.toggleOpen = function(searchControl) {
    searchControl.isOpen = !searchControl.isOpen;
    // Close all others if this control is being opened
    if (searchControl.isOpen) {
      _.each($scope.artistSearchControls, function(otherSearchControl) {
        if (otherSearchControl.id != searchControl.id) {
          otherSearchControl.isOpen = false;
        }
      })
    }
  };

  /** EVENTS **/

  $scope.$on('update-current-position', function(event, position) {
    $scope.currentPosition = {
      latitude: position.lat,
      longitude: position.lng
    };
    $scope.$apply();
  });

  $scope.$on('center-map', function(event, position) {
    mapInstancePromise.then(function(map) {
      map.setCenter(position);
    });
  });

  /** WATCHERS **/

  // Update markers representing selected booths when selected booths change
  $scope.$watch('selectedBooths', function(booths) {
    $scope.selectedBoothMarkerModels = _.map(booths, function(booth) {
      return {
        position: booth.getLocation(),
        id: booth.boothNumber,
        booth: booth
      }
    });
  });

  $scope.$watch('selectedBoothMarkersControl.getPlurals().keys()', function(markerKeys) {
    if (!markerKeys || markerKeys.length == 0) {
      return
    } else if (markerKeys.length == 1) {
      // If only a single booth marker is displayed, open the info window
      var marker = $scope.selectedBoothMarkersControl.getPlurals().get(markerKeys[0]);
      openInfoWindow(marker.gObject);
    } else {
      // Otherwise modify the map bounds so all markers fit
      var bounds = new google.maps.LatLngBounds();
      var boothMarkers = $scope.selectedBoothMarkersControl.getPlurals().values();
      _.chain(boothMarkers)
        .pluck('gObject')
        .each(function(elt) {bounds.extend(elt.position)})
      mapInstancePromise.then(function(map) {
        map.fitBounds(bounds);
      });
    }
  });

}]);
