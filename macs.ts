(function(w, d) {
  'use strict';

  var _commands = {};
  var _commandId = 0;
  var _version = 2;
  var BROWSER_UNSUPPORTED = 0;
  var BROWSER_WEBKIT = 1;
  var BROWSER_WINDOWS = 2;

  function getBrowser() {
    var browser = BROWSER_WEBKIT;
    if ((navigator.appVersion.indexOf('MSAppHost/3.0') !== -1) ||
      (navigator.appVersion.indexOf('Windows Phone 8.1') !== -1) ||
      (navigator.appVersion.indexOf('MSAppHost/2.0') !== -1) ||
      (navigator.appVersion.indexOf('WebView/1.0') !== -1) ||
      (navigator.appVersion.indexOf('WebView/2.0') !== -1)) {
      browser = BROWSER_WINDOWS;
    } else if (navigator.appVersion.indexOf('MSAppHost/1.0') !== -1) {
      browser = BROWSER_UNSUPPORTED;
    }

    return browser;
  }

  function notify(key) {
    var browser = getBrowser();
    if (browser === BROWSER_WEBKIT) {
      var iframe = d.createElement('IFRAME');
      iframe.setAttribute('src', 'macs://' + key);
      d.documentElement.appendChild(iframe);
      iframe.parentNode.removeChild(iframe);
    } else if (browser === BROWSER_WINDOWS) {
      window.external.notify('macs://' + key);
    }
  }

  function mapFieldsIosToWindows(fields) {
    var windowsFields = [];
    var iosToWindowsMap = {
      'activeStatus': 'active',
      'checksumBannerImage': 'bannerImageChecksum',
      'checksumIconImage': 'iconImageChecksum',
      'checksumLargeImage': 'largeImageChecksum',
      'checksumSmallImage': 'smallImageChecksum',
      'isWebOnlyAsset': 'webOnly',
      'itemDescription': 'description',
      'itemTypeId': 'itemType',
      'itemUniqueId': 'itemUniqueIdentifier',
      'keyBenefits': 'keyBenefit',
      'shareStatus': 'shareable',
      'showBlackArea': 'showBlackBar'
    };

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var mappedField = iosToWindowsMap[field];

      if (mappedField === undefined) {
        mappedField = field;
      }

      windowsFields.push(mappedField);
    }

    return windowsFields;
  }

  function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  }

  function dispatch(command, args, successCallback, faliureCallback) {
    var browser = getBrowser();
    if (browser === BROWSER_WINDOWS) {
      var fields = args.assetDetails;
      if (fields !== undefined) {
        var mappedFields = mapFieldsIosToWindows(fields);
        args.assetDetails = mappedFields;
      }
    }

    var key = 'n' + (++_commandId);
    var commandObject = {cmd: command,
      args: args,
      success: successCallback,
      failure: faliureCallback};
    _commands[key] = commandObject;
    notify(key);
  }

  function mapFieldsWindowsToIos(callbackResult) {
    var windowsToIosMap = {
      'active': 'activeStatus',
      'bannerImageChecksum': 'checksumBannerImage',
      'iconImageChecksum': 'checksumIconImage',
      'largeImageChecksum': 'checksumLargeImage',
      'smallImageChecksum': 'checksumSmallImage',
      'webOnly': 'isWebOnlyAsset',
      'description': 'itemDescription',
      'itemType': 'itemTypeId',
      'itemUniqueIdentifier': 'itemUniqueId',
      'keyBenefit': 'keyBenefits',
      'shareable': 'shareStatus',
      'showBlackBar': 'showBlackArea'
    };

    for (var field in callbackResult) {
      var newField = windowsToIosMap[field];
      if (newField !== undefined) {
        callbackResult[newField] = callbackResult[field];
        delete callbackResult[field];
      }
    }
  }

  var api = {
    initApi: function(success, failure) {
      dispatch('initApi', {version: _version}, success, failure);
    },
    printAsset: function(id, success, failure) {
      dispatch('printAsset', {assetId: id}, success, failure);
    },
    emailAsset: function(id, success, failure) {
      dispatch('emailAsset', {assetId: id}, success, failure);
    },
    viewAsset: function(id, success, failure) {
      dispatch('viewAsset', {assetId: id}, success, failure);
    },
    getAsset: function(id, success, failure) {
      dispatch('getAssetDetails', {assetId: id}, success, failure);
    },
    getRequiredAssetDetails: function(id, details, success, failure) {
      dispatch('getRequiredAssetDetails',
        {assetId: id, assetDetails: details},
        success,
        failure);
    },
    getFolderAssets: function(id, success, failure) {
      dispatch('getFolderAssets', {assetId: id}, success, failure);
    },
    getAssetPath: function(id, success, failure) {
      dispatch('getAssetPath', {assetId: id}, success, failure);
    },
    trackSection: function(sectionName, success, failure) {
      var args = {'eVar17': sectionName, 'events': 'event14'};
      this.trackEvent(args, success, failure);
    },
    emailMessage: function(emailJSON, success, failure) {
      if (getBrowser() === BROWSER_WEBKIT) {
        dispatch('emailMesssage', emailJSON, success, failure);
      } else {
        dispatch('emailMessage', emailJSON, success, failure);
      }
    },
    sendEmailViaCMS : function(emailJSON, success, failure) {
      dispatch('sendEmailViaCMS', emailJSON, success, failure);
    },
    getLocation: function(success, failure) {
      dispatch('getLocation', {}, success, failure);
    },
    getStatesForLocationData: function(locationObj, success, failure) {
      dispatch('getStatesForLocationData', locationObj, success, failure);
    },
    readFileAtPath: function(assetFilePath, success, failure) {
      dispatch('readFileAtPath', assetFilePath, success, failure);
    },
    convertHTMLToPDF: function(htmlString, success, failure) {
      dispatch('convertHTMLToPDF', htmlString, success, failure);
    },
    getPathForConvertedPDFFileFromHTML: function(htmlString,
        success,
        failure) {
      dispatch('getPathForConvertedPDFFileFromHTML',
        htmlString,
        success,
        failure);
    },
    getOfflineLinksForAssets: function(assetslist, success, failure) {
      dispatch('getOfflineLinksForAssets',
        {assets: assetslist},
        success,
        failure);
    },
    saveFile: function(fileObject, success, failure) {
      dispatch('saveFile', fileObject, success, failure);
    },
    emailWithMultipleAssets: function(emailObject, success, failure) {
      dispatch('emailWithMultipleAssets', emailObject, success, failure);
    },
    getUserFullName: function(success, failure) {
      dispatch('getUserFullName', {}, success, failure);
    },
    getUserId : function(success, failure) {
      dispatch('getUserId', {}, success, failure);
    },
    getSegments: function(success, failure) {
      var args = {};
      dispatch('getSegments', args, success, failure);
    },
    getGoodDataSSOSessionId: function(userEmail, isAppUserEmail, success, failure) {
      var args = {userEmail: userEmail, isAppUserEmail: isAppUserEmail};
      dispatch('getGoodDataSSOSessionId', args, success, failure);
    },
    saveItemUserData: function(appCode, appKey, value, privacy, success, failure) {
      var args = {appCode: appCode, appKey: appKey, value: value, privacy: privacy};
      dispatch('saveItemUserData', args, success, failure);
    },
    getItemUserData: function(name, appCode, userId, privacy, success, failure) {
      var args = {name: name, appCode: appCode, userId: userId, privacy: privacy};
      dispatch('getItemUserData', args, success, failure);
    },
    getSearchResults: function(args, success, failure) {
      dispatch('getSearchResults', args, success, failure);
    },
    trackEvent: function(args, success, failure) {
      dispatch('trackEvent', args, success, failure);
    },
    getSelfDetails: function(details, success, failure) {
      dispatch('getSelfDetails', {assetDetails: details}, success, failure);
    },
    createGroup: function(groupName, groupDescription, success, failure) {
      var args = {groupName: groupName, groupDescription: groupDescription};
      dispatch('createGroup', args, success, failure);
    },
    addItemsToGroup: function(itemList, groupUniqueId, success, failure) {
      var args = {assets: itemList, groupUniqueId: groupUniqueId};
      dispatch('addItemsToGroup', args, success, failure);
    },
    updateGroupName: function(groupName, groupUniqueId, success, failure) {
      var group = {name: groupName};
      var args = {groupObject: group, groupUniqueId: groupUniqueId};
      this.groupUpdate(args, success, failure);
    },
    deleteGroup: function(groupUniqueId, success, failure) {
      var args = {groupUniqueId: groupUniqueId};
      dispatch('deleteGroup', args, success, failure);
    },
    getAllGroups: function(groupTypes, success, failure) {
      var args = {groupTypes: groupTypes};
      dispatch('getAllGroups', args, success, failure);
    },
    openInSafari: function(url, success, failure) {
      var args = {url: url};
      dispatch('openInSafari', args, success, failure);
    },
    getItemThumbnails: function(id, success, failure) {
      var requiredFields = ['iconImageName', 'smallImageName', 'largeImageName',
              'bannerImageName', 'squareLargeImageName', 'oneThirdImageName',
              'twoThirdImageName', 'skinnyImageName', 'featuredLargeImageName'];
      this.getRequiredAssetDetails(id,
        requiredFields,
        function(data) {
          if (data) {
            var documentPath = api.getDocumentPath();
            for (var key in data) {
              if (data[key] !== null) {
                if (getBrowser() === BROWSER_WINDOWS) {
                  data[key] = documentPath.concat(data[key] + '.jpg');
                } else {
                  data[key] = documentPath.concat(data[key] + '.png');
                }
              }
            }
            success(data);
          }
        },
        function(error) { failure(error); }
      );
    },
    createNewLeadWithParameters : function(args, success, failure) {
      dispatch('createNewLeadWithParameters', args, success, failure);
    },
    getSalesforceAuthenticationStatus : function(success, failure) {
      dispatch('getSalesforceAuthenticationStatus', {}, success, failure);
    },

    initiateSalesforceAuthentication : function(success, failure) {
      dispatch('initiateSalesforceAuthentication', {}, success, failure);
    },
    getNetworkAvailabilityStatus : function(success, failure) {
      dispatch('getNetworkAvailabilityStatus', {}, success, failure);
    },
    closeModule: function() {
      dispatch('closeModule', {});
    },
    triggerEvent: function(eventName, args) {
      var event = new CustomEvent(eventName,
        {'detail': {args: args},
        bubbles: true,
        cancelable: true});
      d.dispatchEvent(event);
    },
    groupUpdate: function(args, success, failure) {
      dispatch('updateGroup', args, success, failure);
    },
    getDocumentPath: function() {
      var fullPath = w.location.pathname;
      var pathComponents = fullPath.split('/');
      var removedString = pathComponents[pathComponents.length - 2] +
        '/' +
        pathComponents[pathComponents.length - 1];
      var documentPath = fullPath.replace(removedString, '');
      return documentPath;
    },
    getAllItemsForGroup: function(groupUniqueId, success, failure) {
      var args = {groupUniqueId: groupUniqueId};
      dispatch('getAllItemsForGroup', args, success, failure);
    },
    getBundleResourcePath: function(resourceNames, success, failure) {
      var args = {resourceNames: resourceNames};
      dispatch('getBundleResourcePath', args, success, failure);
    },
    getCommand: function(key) {
      var cmd = _commands[key];
      return JSON.stringify(cmd);
    },
    getDataFileList : function(args, success, failure) {
      dispatch('getDataFileList', args, success, failure);
    },
    executeSOQLQuery: function(data, success, failure) {
      dispatch('executeSOQLQuery', data, success, failure);
    },
    createSObject: function(data, success, failure) {
      dispatch('createSObject', data, success, failure);
    },
    getNextRecordsWithKey: function(recordKey, success, failure) {
		  var args = ""
		  if(isJson(recordKey))
		  {
        args = JSON.parse(recordKey);
		  }
		  else
		  {
			  args = {recordKey: recordKey};
		  }
      dispatch('getNextRecordsWithKey', args, success, failure);
    },

  getSalesforceBaseURL: function(success, failure) {
    dispatch('getSalesforceBaseURL', {}, success, failure);
  },

  executeSalesforceSOQLQuery: function(data, success, failure) {
    dispatch('executeSalesforceSOQLQuery', data, success, failure);
  },

  getNextRecordsFromAPIWithKey: function(recordKey, success, failure) {
    dispatch('getNextRecordsFromAPIWithKey', recordKey, success, failure);
  },

  setHtml5AppConfig: function(data, success, failure) {
    dispatch('setHtml5AppConfig', data, success, failure);
  },

  getHtml5AppConfig: function(data, success, failure) {
    dispatch('getHtml5AppConfig', data, success, failure);
  },

  executeSqliteQuery: function(args, success, failure) {
    dispatch('executeSqliteQuery', args, success, failure);
  },

  getResultsForSqliteSelectQuery: function(args, success, failure) {
    dispatch('getResultsForSqliteSelectQuery', args, success, failure);
  },

  scanBarcode: function(success, failure) {
    dispatch('scanBarcode', {}, success, failure);
  },

    callback: function(key, success, result) {
      if (getBrowser() === BROWSER_WINDOWS) {
        mapFieldsWindowsToIos(result);
      }

      var cmd = _commands[key];
      if (success) {
        cmd.success(result);
      } else {
        cmd.failure(result);
      }
      delete _commands[key];
    }
  };

  w.addEventListener('closeModule', function() { macs.closeModule(); }, false);

  var state = {
    getKeyPath: function(path) {
      var pathComponentsArray = path.split('/');
      return pathComponentsArray[pathComponentsArray.length - 2];
    },

    createCookie: function(key, value) {
      var date = new Date();
      date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
      var expires = '; expires=' + date.toGMTString();
      document.cookie = key + '=' + value + expires + '; path=/';
    },

    readCookie: function(key) {
      var nameEQ = key + '=';
      var ca = document.cookie.split(';');

      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
          c = c.substring(1, c.length);
        }

        if (c.indexOf(nameEQ) === 0) {
          return c.substring(nameEQ.length, c.length);
        }
      }

      return '';
    },

    eraseCookie: function(key) {
      state.createCookie(key, '');
    }
  };

  w.macs = api;
  w.macs.cookieManager = state;

})(window, document);
