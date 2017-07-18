angular.module('caf-map.client').config([
'$mdIconProvider',
function($mdIconProvider) {
  $mdIconProvider
    .icon('Beverage', 'assets/svgs/beverage_marker.svg', 32)
    .icon('Food', 'assets/svgs/food_marker.svg', 32)
    .icon('Restroom', 'assets/svgs/restroom_marker.svg', 32)
    .icon('Stage', 'assets/svgs/stage_marker.svg', 36)
    .icon('Merch', 'assets/svgs/merch_marker.svg', 36)
    .icon('FirstAid', 'assets/svgs/first-aid_marker.svg', 32);
}])

.controller('BottomSheetCtrl', [
'$scope', '$mdBottomSheet', 'uniqueId',
function($scope, $mdBottomSheet, uniqueId) {
  $scope.showBottomSheet = function() {
    $mdBottomSheet.show({
      templateUrl: 'templates/bottom-sheet.html',
      controller: 'LegendBottomSheetCtrl',
      clickOutsideToClose: true
    })
    ga('send', 'event', 'click_legend', uniqueId.get());
  };
}])

.controller('LegendBottomSheetCtrl', [
'$scope', '$mdBottomSheet',
function($scope, $mdBottomSheet) {
  $scope.items = [
    { name: 'Beverages', icon: 'Beverage'},
    { name: 'Food', icon: 'Food'},
    { name: 'Restrooms', icon: 'Restroom'},
    { name: 'Events and Activities', icon: 'Stage'},
    { name: 'Merchandise, Information, ATM', icon: 'Merch'},
    { name: 'First Aid', icon: 'FirstAid'}
  ];
}]);
