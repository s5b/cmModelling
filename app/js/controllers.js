// ***  Model ***

s5b.model = {};

s5b.model.uniqueIdentifier = 0;

s5b.model.tabs = [];
s5b.model.data = [];
s5b.model.associations = {};
s5b.associationKey = function (idTab, idCategory) {
    return idTab + '|' + idCategory;
};


/* Controllers */

s5b.uberController = function ($scope) {

    // *** Utility ***

    var nextId = function () {
        s5b.model.uniqueIdentifier += 1;
        return s5b.model.uniqueIdentifier;
    };

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
        var newTab = { id: nextId(tabs), type: $scope.newTabDefinition.type, content: $scope.newTabDefinition.content };
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
        var newId = nextId(categories);
        return { id: newId, content: 'unnamed_category' };
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
        var newId = nextId(locations);
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
        var newId = nextId(data);
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
        return { type: 'text', id: nextId(texts), content: '' };
    };

    $scope.createTelecom = function (telecoms) {
        return { type: 'telecom', id: nextId(telecoms), content: { type: 'phone', number: '' } };
    };

    $scope.createAddress = function (addresses) {
        return { type: 'address', id: nextId(addresses), content: { street: '', suburb: '', state: '', postcode: '' } };
    };

    $scope.createDigitalPresence = function (digitalPresences) {
        return { type: 'digitalPresence', id: nextId(digitalPresences), content: { label: '', url: '' } };
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
    var scopedAssociationKey = function (tab, category) {
        var key = 'no-association';
        if (tab !== null && category !== null) {
            key = s5b.associationKey(tab.id, category.id);
        }
        return key;
    };
    $scope.associationKey = function (context) {
        console.log('-- associationKey: ' + context);
        console.log($scope);
        return scopedAssociationKey($scope.associatedTab, $scope.associatedCategory);
    };
    $scope.associationContentKey = function (tab, category) {
        console.log('-- associationContentKey');
        console.log(tab);
        console.log(category);
        return scopedAssociationKey(tab, category);
    };

    $scope.attributeByAssociation = function (association) {
        var index, datum, collection;
        var found = false;
        for (index = 0; index < $scope.data.length; index += 1) {
            if ($scope.data[index].id === association.idDatum) {
                found = true;
                datum = $scope.data[index];
                break;
            }
        }
        if (!found) {
            return {};
        }
        collection = datum[association.collectionName];
        for (index = 0; index < collection.length; index += 1) {
            if (collection[index].id == association.idAttribute) {
                return collection[index];
            }
        }
        return {};
    }


};