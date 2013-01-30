// ***  Model ***

s5b.model = {};

s5b.model.uniqueIdentifier = 0;
s5b.model.tabs = [];
s5b.model.data = [];

s5b.utility = {};
s5b.utility.findById = function (sourceArray, value) {
    var index;
    for (index = 0; index < sourceArray.length; index += 1) {
        if (sourceArray[index].id === value) {
            return sourceArray[index];
        }
    }
    return null;
};
s5b.utility.nextId = function () {
    s5b.model.uniqueIdentifier += 1;
    return s5b.model.uniqueIdentifier;
};
s5b.utility.createEntity = function (theType, theLabel, theContent) {
    var id = s5b.utility.nextId();
    var type = theType;
    var label = initialLabel;
    var children = {};
    return {
        getId: function () {
            return id;
        },
        getType: function () {
            return type;
        },
        getLabel: function () {
            return label;
        },
        getContent: function () {
            return content;
        },
        setLabel: function (newLabel) {
            label = newLabel;
        },
        getChildrenIterator: function () {
            var childId, position = -1, childrenList = [];
            // Make the iterator immune to changes during iteration by taking a copy of the children collection.
            for (childId in children) {
                if (children.hasOwnProperty(childId)) {
                    childrenList.push(children[childId]);
                }
            }
            return {
                hasNext: function () {
                    return position >= childrenList.length;
                },
                getNext: function () {
                    position += 1
                    return (position >= childrenList.length) ? null : childrenList[position];
                }
            }
        },
        addChild: function (newChild) {
            children[newChild.getId()] = {
                getId: function () {
                    return newChild.getId();
                },
                getType: function () {
                    return newChild.getType()
                }
            }
        },
        removeChild: function (deleteChild) {
            delete children[deleteChild.getId()];
        }
    }
};

s5b.associationKey = function (idTab, idCategory) {
    return idTab + '|' + idCategory;
};


/* Controllers */

s5b.uberController = function ($scope) {

    // *** Edit / Preview ***

    $scope.editMode = true;
    var setModeLabel = function (mode) {
        return mode ? 'Preview' : 'Edit';
    };
    $scope.modeLabel = setModeLabel($scope.editMode);
    $scope.toggleEditMode = function () {
        $scope.editMode = !$scope.editMode;
        $scope.modeLabel = setModeLabel($scope.editMode);
    };

    // *** Selection ***

    $scope.selectedItem = {};
    $scope.select = function (selectionType, index) {
        $scope.selectedItem[selectionType] = index;
    };
    $scope.isSelected = function (selectionType, index) {
        return $scope.selectedItem[selectionType] === index ? 'selected' : null;
    };

    // *** Tabs ***

    $scope.tabTypes = [
        { type: 'f', content: 'Find Us'},
        { type: 'c', content: 'Contacts'}
    ];
    $scope.newTabDefinition = $scope.tabTypes[1];

    var createNewTab = function (tabs) {
        var newTab = { id: s5b.utility.nextId(), type: $scope.newTabDefinition.type, content: $scope.newTabDefinition.content };
        if (newTab.type === 'c') {
            newTab.categories = [];
        }
        if (newTab.type === 'f') {
            newTab.locations = [];
        }
        return newTab;
    };
    $scope.tabs = s5b.model.tabs;
    $scope.addTab = function () {
        $scope.tabs.push(createNewTab($scope.tabs));
        $scope.selectedItem.tab = $scope.tabs.length - 1;
    };

    // *** Categories ***

    var createNewCategory = function(categories) {
        var newId = s5b.utility.nextId();
        return { id: newId, content: 'unnamed_category', data: [] };
    };
    $scope.categorySelectionKey = function (index) {
        return 'category_' + index;
    };
    $scope.addCategory = function (index, categories) {
        categories.push(createNewCategory(categories));
        $scope.selectedItem[$scope.categorySelectionKey(index)] = categories.length - 1;
    };

    // *** Locations ***

    var createNewLocation = function(locations) {
        var newId = s5b.utility.nextId();
        return { id: newId, title: 'Location_' + newId, selected: false };
    };
    $scope.locationSelectionKey = function (index) {
        return 'location_' + index;
    };
    $scope.addLocation = function (index, locations) {
        locations.push(createNewLocation(locations));
        $scope.selectedItem[$scope.locationSelectionKey(index)] = locations.length - 1;
    };

    // *** Data ***

    $scope.data = s5b.model.data;
    var createNewDatum = function(data) {
        var newId = s5b.utility.nextId();
        return {
            id: newId,
            content: 'unnamed_presence',
            texts: [],
            telecoms: [],
            digitalPresences: [],
            addresses: []
        };
    };
    $scope.datumSelectionKey = function () {
        return 'datum_selected';
    };
    $scope.addDatum = function (data) {
        data.push(createNewDatum(data));
        $scope.selectedItem[$scope.datumSelectionKey()] = data.length - 1;
    };

    // *** Data - attribute - creation ***

    $scope.createText = function (texts) {
        return { type: 'text', id: s5b.utility.nextId(), content: '' };
    };

    $scope.createTelecom = function (telecoms) {
        return { type: 'telecom', id: s5b.utility.nextId(), content: { type: 'phone', number: '' } };
    };

    $scope.createAddress = function (addresses) {
        return { type: 'address', id: s5b.utility.nextId(), content: { street: '', suburb: '', state: '', postcode: '' } };
    };

    $scope.createDigitalPresence = function (digitalPresences) {
        return { type: 'digitalPresence', id: s5b.utility.nextId(), content: { label: '', url: '' } };
    };

    // *** Data - attribute - collection mutation.

    $scope.addAttribute = function (attributeCollection, createAttribute) {
        attributeCollection.push(createAttribute(attributeCollection));
    };
    $scope.deleteAttribute = function (attributeCollection, index) {
        attributeCollection.splice(index, 1);
    };


    // *** Associations ***

    $scope.associatedTab = null;
    $scope.associatedCategory = null;
    $scope.associations = s5b.model.associations;
    $scope.resetAssociatedCategory = function () {
        $scope.associatedCategory = null;
    };

    $scope.getAssociatedAttributes = function () {
        var result = [];
        var associatedDatum, index;
        if ($scope.associatedCategory !== null) {
            associatedDatum = s5b.utility.findById($scope.associatedCategory.data, $scope.data[$scope.selectedItem[$scope.datumSelectionKey()]].id);
            if (associatedDatum !== null) {
                for (index = 0; index < associatedDatum.attributes.length; index += 1) {
                    result.push(s5b.utility.findById($scope.data[$scope.selectedItem[$scope.datumSelectionKey()]][associatedDatum.attributes[index].collectionName],
                        associatedDatum.attributes[index].id));
                }
            }
        }
        return result;
    };

    $scope.getDisplayAttributes = function (displayDatum) {
        var result = [];
        var index, datum;
        if (displayDatum) {
            datum = s5b.utility.findById($scope.data, displayDatum.id);
            if (datum) {
                for (index = 0; index < displayDatum.attributes.length; index += 1) {
                    result.push(s5b.utility.findById(datum[displayDatum.attributes[index].collectionName], displayDatum.attributes[index].id));
                }
            }
        }
        return result;
    };

    $scope.getAssociation = function (attribute) {
        var result = [];
        var associatedDatum;
        if ($scope.associatedCategory !== null) {
            associatedDatum = s5b.utility.findById($scope.associatedCategory.data, $scope.data[$scope.selectedItem[$scope.datumSelectionKey()]].id);
            if (associatedDatum !== null) {
                return s5b.utility.findById(associatedDatum.attributes, attribute.id);
            }
        }
        return result;
    }

    $scope.getDisplayAssociation = function (associatedDatum, attribute) {
        var result = [];
        if (associatedDatum !== null) {
            return s5b.utility.findById(associatedDatum.attributes, attribute.id);
        }
        return result;
    }

};