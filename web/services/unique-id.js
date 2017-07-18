angular.module('caf-map.client').factory('uniqueId', [
'$window',
function($window) {

  var id = null;
  var STORAGE_KEY = 'caf-map-unique-id';
  // Try to get id from local storage
  try {
    id = $window.localStorage.getItem(STORAGE_KEY);
  } catch(e) {}

  // cf. http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  function randomishHexChunk() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16);
  }

  function generateUniqueId() {
    return randomishHexChunk() + randomishHexChunk() + randomishHexChunk() + randomishHexChunk();
  };

  return {
    get: function() {
      if (!id) {
        id = generateUniqueId();
        try {
          $window.localStorage.setItem(STORAGE_KEY, id);
        } catch(e) {}
      }
      return id;
    }
  }

}])
