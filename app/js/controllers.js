
s5b.model = {};

s5b.model.tabs = [];
s5b.model.data = [];
s5b.model.associations = {};


/* Controllers */

s5b.uberController = function ($scope) {

    // *** Utility ***

    var nextId = function (collection) {
        if (collection === null) {
            return 0;
        }
        var index, nextId = 0;
        for (index = 0; index < collection.length; index += 1) {
            nextId = Math.max(nextId, collection[index].id);
        }
        return nextId + 1;
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
        return $scope.selectedItem[selectionType] === index ? 'selected' : '';
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
        return { id: newId, content: 'Category_' + newId };
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
            content: 'presence_' + newId,
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


    // DRAGONS!!!!

    $scope.appearanceSelectedTab = null;
    $scope.appearanceSelectedSubTab = null;
    $scope.associationForTabSubTab = function (appearanceSelectedTab, appearanceSelectedSubTab) {
        var result = [];
        result.push({type: 'xxx'});
        result.push({type: 'yyy'});
        return result;
    }


    $scope.disableAssociationInput = function () {
//        console.log('Disable?');
//        console.log($scope.appearanceSelectedTab);
//        console.log($scope.appearanceSelectedSubTab);
        return $scope.appearanceSelectedTab === null || $scope.appearanceSelectedSubTab === null;
    };
    $scope.changedAppearanceSelectedTab = function () {
//        console.log($scope.appearanceSelectedTab);
        $scope.appearanceSelectedSubTab = null;
    };
    $scope.getSubTabs = function (tab) {
        return tab === null ? [] : tab.type === 'c' ? tab.categories : tab.locations;
    };
    var createAssociationKey = function (tab, subtab) {
        if (tab === null || subtab === null) {
            return '';
        }
        return tab.id + ':' + subtab.id;
    };
    $scope.associate = function (attribute) {
//        console.log(attribute);
        var index;
        var key = createAssociationKey($scope.appearanceSelectedTab, $scope.appearanceSelectedSubTab);
        index = attribute.appearance.indexOf(key);
        if (index === -1 && attribute.check) {
            attribute.appearance.push(key);
        } else if (index !== -1 && !attribute.check) {
            attribute.appearance.splice(index, 1);
        }
    };

    var hasAssociation = function (attribute) {
        console.log("Checking appearance");
        console.log(attribute);
        console.log($scope.selectedItem);
        var selectedTab = $scope.tabs[$scope.selectedItem.tab]
        var key = createAssociationKey(selectedTab,
                                       selectedTab.categories[$scope.selectedItem[$scope.categorySelectionKey($scope.selectedItem.tab)]]);
        console.log("current selectedItem key: '" + key + "'.");
        var result = attribute.appearance.indexOf(key) !== -1;
        console.log(result);
        return result;
    };
    $scope.hasAssociations = function (datum) {
        return hasAssociation(datum.content) ||
            hasAssociation(datum.description) ||
            hasAssociation(datum.phone) ||
            hasAssociation(datum.address1) ||
            hasAssociation(datum.address2);
    }

};