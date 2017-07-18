/*
 * Expando directive:
 * a little Angular Material drawer that hides and shows a thing
 *
 * Adapted from the left nav bar menu widget on the Angular Material page (material.angularjs.org):
 * https://github.com/angular/material/blob/v1.0.8/docs/app/js/app.js (see menuToggle directive)
 * https://github.com/angular/material/blob/v1.0.8/docs/app/partials/menu-toggle.tmpl.html
 */

angular.module('caf-map.client')
.directive('expandoToggle', [ '$timeout', '$mdUtil', function($timeout, $mdUtil) {
  return {
    transclude: true,
    scope: {
      contentData: '='
    },
    templateUrl: 'templates/expando.tmpl.html',
    link: function($scope, $element) {
      var controller = $element.parent().controller();

      $scope.isOpen = function() {
        return controller.isOpen($scope.contentData);
      };
      $scope.toggle = function() {
        controller.toggleOpen($scope.contentData);
      };

      $mdUtil.nextTick(function() {
        $scope.$watch(
          function () {
            return controller.isOpen($scope.contentData);
          },
          function (open) {
            var $contentDiv = angular.element(
              $element[0].getElementsByClassName('expando-content')[0]
            );

            var targetHeight = open ? getTargetHeight() : 0;
            $timeout(function () {
              $contentDiv.css({height: targetHeight + 'px'});
            }, 0, false);

            function getTargetHeight() {
              var targetHeight;
              $contentDiv.addClass('no-transition');
              $contentDiv.css('height', '');
              targetHeight = $contentDiv.prop('clientHeight');
              $contentDiv.css('height', 0);
              $contentDiv.removeClass('no-transition');
              return targetHeight;
            }
          }
        );
      });
    }
  };
}])
