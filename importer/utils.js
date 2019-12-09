'use strict';

function checkNumber(stringNumber) {
  if (!stringNumber) {
    return "0";
  }

  const value = parseInt(stringNumber, 10);
  if(isNaN(value)) {
    return "0";
  }

  return value.toString(); // Looks like we have to return strings, but codes and sizes (could be and) are in fact integers
}

function getDateTimeObject(dateTimeRaw) {
  // eslint-disable-next-line no-useless-escape
  const dateTimeWithoutBrakets = dateTimeRaw.replace(/[\[\]]+/g,''); //Don't trust ES-LINT warning, scape character IS mandatory
  const timeSplitted = dateTimeWithoutBrakets.split(':');
  const dateTime = { 
    day: timeSplitted[0],
    hour: timeSplitted[1],
    minute: timeSplitted[2],
    second: timeSplitted[3]
  };

  return dateTime;
}

function getRequestObject(responseObjectRaw) {
  const requestWithoutQuotes = responseObjectRaw.replace(/[""]+/g,'');
  const requestSplitted = requestWithoutQuotes.split(' ');
  const arrayProtocol = requestSplitted[2] ? requestSplitted[2].split('/') : []; //Protocol looks not mandatory, so we set up a default empty array

  const request = {
    method: requestSplitted[0],
    url: requestSplitted[1],
    protocol: arrayProtocol[0] || "", //If not method provided, we'll set empty string as default value
    protocol_version: arrayProtocol[1] || ""
  };

  return request;
}

function getResponseCodeObject(responseCodeRaw) {
  return checkNumber(responseCodeRaw);
}

function getDocumentSizeObject(documentSizeRaw) {
  return checkNumber(documentSizeRaw);
}

module.exports = {
  getDateTimeObject,
  getRequestObject,
  getResponseCodeObject,
  getDocumentSizeObject
};