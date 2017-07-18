// Service that returns the constructor for the ArtistBooth class, which represents an artist booth
// that gets drawn on the map.

angular.module('caf-map.client').factory('ArtistBooth',
[function() {

  var ArtistBooth = function (boothData) {
    _.extend(this, boothData);

    this.fullName = this.firstName + ' ' + this.lastName;
  };

  // Display name for the autocomplete artist search
  ArtistBooth.prototype.getDisplayName = function() {
    if (this.businessName && this.businessName != this.fullName) {
      return '{0} ({1})'.format(this.fullName, this.businessName)
    }
    return this.fullName
  };

  // Content for the info window shown when clicking on the booth marker.
  // Have to generate HTML dynamically and hackily because angular-google-maps
  // directive for info window is not working correctly. :(
  ArtistBooth.prototype.getInfoWindowContent = function() {
    var content = '<div class="artist-name">{0}</div>'.format(this.fullName);
    if (this.businessName) {
      content += '<div class="studio-name">{0}</div>'.format(this.businessName);
    }
    if (this.thumbnail) {
      content += '<div class="artist-image"><img src="{0}"></div>'.format(this.thumbnail);
    }
    if (this.boothNumber) {
      content += '<div class="booth-number">Booth: {0}</div>'.format(this.boothNumber);
    }
    if (this.website) {
      content += '<div class="artist-site"><a href="http://{0}" target="_blank">View Website</a></div>'.format(this.website);
    }
    return content;
  };

  // Returns the coordinates of the center of the booth.
  ArtistBooth.prototype.getLocation = function() {
    return this.location;
  };

  return ArtistBooth;

}]);
