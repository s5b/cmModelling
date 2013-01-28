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
//                    appendTo: 'body',
                    helper: 'clone'
                });
            }
        };
    }).
    directive('s5bDroppable', function () {
        return {
//            scope: {},
            link: function (scope, element, attrs) {
                element.droppable({
                    drop: function (event, ui) {
//                        console.log('-- Droppable');
//                        console.log(scope);
                        if (angular.element(ui.draggable).data('type') === 'arrangable') {

                        }
                        var idTab = scope.associatedTab.id;
                        var idCategory = scope.associatedCategory.id;
                        var collectionName = angular.element(ui.draggable).data('collection');
                        var indexAttribute = angular.element(ui.draggable).data('index-attribute');
                        var indexDatum = angular.element(ui.draggable).data('index-datum');
                        var associationKey = s5b.associationKey(idTab, idCategory);

//                        console.log(attrs);
//                        console.log('You have dropped a ' + collectionName + ' with index ' + indexAttribute + ' from datum index ' + indexDatum);
//                        console.log('-- Working in tab id ' + idTab + ', category id ' + idCategory);
//                        console.log(scope);

                        var datum = s5b.model.data[indexDatum];

                        s5b.model.associations[associationKey] = s5b.model.associations[associationKey] || [];
                        s5b.model.associations[associationKey].push({ idDatum: datum.id, collectionName: collectionName, idAttribute: datum[collectionName][indexAttribute].id });

//                        console.log('APPLYING');
                        scope.$apply();
                    }
                }).sortable({
                        item: 'li.sortable'
                    });
            }
        };
    }).
    directive('s5bSortable', function () {
        return {
            link: function (scope, element) {
                element.sortable();
                element.disableSelection();
            }
        }
    });
