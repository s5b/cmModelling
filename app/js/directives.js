/* Directives */


angular.module('myApp.directives', []).
    directive('s5bContentEditable', function () {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                // view -> model
                elm.attr('contenteditable', true);
                var theValue = function () {
                    var content = elm.text();
                    return content.match(/^\s*$/) ? attrs['s5bContentEditable'] : content;
                };
                elm.bind('keydown', function (e) {
                    if (e.keyCode === 13) { // Filter out the ENTER key.
                        e.preventDefault();
                    }
                });
                elm.bind('blur', function () {
                    scope.$apply(function () {
                        var currentValue = theValue();
                        ctrl.$setViewValue(currentValue);
                        ctrl.$viewValue = currentValue;
                        ctrl.$render();
                    });
                });

                // model -> view
                ctrl.$render = function() {
                    elm.html(ctrl.$modelValue);
                };

                // load init value from DOM
                //ctrl.$setViewValue(theValue());
            }
        };
    }).
    directive('s5bDataDialog', function () {
        return {
            link: function (scope, elm, attrs, ctrl) {
                elm.dialog({
                    title: "Data Management",
                    autoOpen: false,
                    height: 600,
                    width: 1200,
                    modal: true
                });
                $('#' + attrs['s5bDataDialog']).click(function () {
                    elm.dialog("open");
                })
            }
        }
    }).
    directive('s5bDraggable', function () {
        return {
            link: function (scope, element) {
                element.draggable({
//                    revert: true,
                    helper: 'clone'
                });
            }
        };
    }).
    directive('s5bDroppable', function () {
        return {
            link: function (scope, element) {
                element.droppable({
                    drop: function (event, ui) {
                        var tabId = scope.$parent.$eval(angular.element(element).data('id-tab'));
                        var subTabId = scope.$eval(angular.element(element).data('id-sub-tab'));
                        var collectionName = angular.element(ui.draggable).data('collection');
                        var indexAttribute = angular.element(ui.draggable).data('index-attribute');
                        var indexDatum = angular.element(ui.draggable).data('index-datum');

                        console.log('You have dropped a ' + collectionName + ' with index ' + indexAttribute + ' from datum index ' + indexDatum);
                        console.log('-- Working in tab id ' + tabId + ', sub tab id ' + subTabId);
                        console.log(scope);

                        s5b.model.associations[tabId + '.' + subTabId] = s5b.model.associations[tabId + '.' + subTabId] || [];
                        s5b.model.associations[tabId + '.' + subTabId].push({ indexDatum: indexDatum, collectionName: collectionName, indexAttribute: indexAttribute});
                    }
                });
            }
        };
    });
