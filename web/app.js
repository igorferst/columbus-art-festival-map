angular.module('caf-map.client', [
  'ngMaterial',
  'ngRoute',
  'uiGmapgoogle-maps',
  'caf.templates'
])
.config(['$routeProvider', '$locationProvider', '$mdGestureProvider', 'uiGmapGoogleMapApiProvider',
  function($routeProvider, $locationProvider, $mdGestureProvider, uiGmapGoogleMapApiProvider) {

  // Magic to keep Angular Material from disabling interactions on mobile devices
  $mdGestureProvider.skipClickHijack();

  // See string-format npm module
  format.extend(String.prototype);

  // Enable HTML5 mode
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });

  // Configure routes
  $routeProvider.when('/', {
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl',
    controllerAs: 'ctrl'
  }).otherwise('/')

  // Configure Google Maps API
  uiGmapGoogleMapApiProvider.configure({
    transport: 'https',
    key: '@@googleMapsApiKey'
  });

}])

.config(
  ['$mdIconProvider', '$$mdSvgRegistry', function($mdIconProvider, $$mdSvgRegistry) {
    // Add default icons from angular material
    // https://github.com/angular/material/issues/9336
    $mdIconProvider.icon('md-toggle-arrow', $$mdSvgRegistry.mdToggleArrow);
  }
]);
