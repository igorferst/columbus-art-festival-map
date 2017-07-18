// Service that returns the constructor for the PointOfInterest class, which represents
// a point of interest that is represented on the map.

angular.module('caf-map.client').factory('PointOfInterest',
[function() {

  var PointOfInterest = function (poiData) {
    _.extend(this, poiData);
    this.name = getDisplayName(poiData);
  };

  // Content for the info window shown when clicking on the booth marker.
  // Have to generate HTML dynamically and hackily because angular-google-maps
  // directive for info window is not working correctly. :(
  PointOfInterest.prototype.getInfoWindowContent = function() {
    var content = '<div class="artist-name">{0}</div>'.format(this.name);
    if (this.website) {
      content += '<div class="artist-site"><a href="{0}" target="_blank">View Schedule</a></div>'.format(this.website);
    }
    return content;
  };

  PointOfInterest.prototype.getLocation = function() {
    return this.location;
  };

  function getDisplayName(poiData) {
    switch (poiData.type) {
      case 'beverages':
        return 'Beverages'
      case 'beverages_non_alcoholic':
        return 'Beverages (non-alcoholic)'
      case 'beverages_frozen_drinks':
        return 'Frozen Drinks'
      case 'merchandise':
        return 'Merchandise, Information, ATM'
      case 'first_aid':
        return 'First Aid'
      case 'food':
        return 'Food Vendors'
      case 'restrooms':
        return 'Restrooms'
      case 'restrooms_non_ada':
        return 'Restrooms (non-ADA)'
      case 'stage':
        return poiData.name
      default:
        console.error('Uknown PoI type: ' + type)
    }
  };

  return PointOfInterest;

}]);
