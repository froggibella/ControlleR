(function () {
    'use strict';

    angular.module('ControlR')
        .directive('paginationSlider', [goSlider]);

    function goSlider() {
        var directive = {
            restrict: 'A',
            scope: {
                setURL: '&callbackFn',
                model: '=',
                sort: '=',
                oder: '=',
                oderBy: '='
            },
            link: link
        };

        return directive;

        function link(scope, ele, attrs) {

            ele.slider({
                min: +attrs.min,
                max: +attrs.max,
                step: +attrs.step,
                value: +scope.model
            });

            ele.slider.formatter = function (value) {
                if (ele.slider != undefined) {
                    return ele.slider('getValue');
                }
            };

            scope.$watch('max', function() {
                ele.slider('setValue', +scope.model);
            });

            ele.on("slideStop", function(slideEvt) {
                scope.model = slideEvt.value;
                scope.$apply();
                scope.setURL();
            });
        }
    }
})();
