// Button that appears as a map control and centers the map at the user's current location.

angular.module('caf-map.client').controller('LocationButtonCtrl', [
'$scope', '$log', 'currentLocation', 'uniqueId',
function ($scope, $log, currentLocation, uniqueId) {

  $scope.goToCurrentLocation = function() {
    // Do nothing if refresh already in progress
    if (currentLocation.refreshInProgress()) return;

    ga('send', 'event', 'click_current_location', uniqueId.get());
    $log.debug('Click on current location button');
    // Center on previous location immediately, if it is defined
    var previousLocation = currentLocation.getPreviousLocation();
    if (previousLocation) {
      $scope.$emit('center-map', previousLocation);
    }
    currentLocation.refresh();
  }
}]);
