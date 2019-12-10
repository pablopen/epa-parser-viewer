
var DEFAULT_METHOD = 'OTHER'; // I'm going to define some globals 
var DEFAULT_CODE = 'OTHER'; // so I dont' have to be moving them back and forward

jQuery(document).ready(function() {
  var epaDataRecords = window.epadata;
  // I'm using the Callback call from google charts
  // The entry point is drawChart(), the last function on this file
});

function getElementSize(element) {
  if (!element.document_size) {
    return;
  }

  var size = parseInt(element.document_size, 10);
  if (isNaN(size)) {
    return;
  }

  return size;
}

function drawResponseCodeChart(distribution) {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Response code');
  data.addColumn('number', 'Number of responses');
  var keyCodes = Object.keys(distribution);
  for (var i = 0; i < keyCodes.length; i++) {
    var key = keyCodes[i];
    var numberOfCalls = distribution[key];
    data.addRow([key, numberOfCalls]);
  }

  var chart = new google.visualization.PieChart(document.getElementById('responseCodeChart'));
  chart.draw(data, null);
}

function drawRequestPerMinuteChart(distribution, firstDate) {
  var data = new google.visualization.DataTable();
  data.addColumn('date', 'time');
  data.addColumn('number', 'Calls');

  for(var i = 0; i < distribution.length; i++) {
    var element = distribution[i];
    var dateOfElement = new Date (firstDate)
    dateOfElement.setMinutes(firstDate.getMinutes() + element[0]);
    data.addRow([ dateOfElement, element[1] ]);
  }

  var chart = new google.visualization.LineChart(document.getElementById('requestsPerMinuteChart'));
  chart.draw(data, null);
}

function drawMethodChart(distribution) {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Method');
  data.addColumn('number', 'Number of Calls');
  var keyCodes = Object.keys(distribution);
  for (var i = 0; i < keyCodes.length; i++) {
    var key = keyCodes[i];
    var numberOfCalls = distribution[key];
    data.addRow([key, numberOfCalls]);
  }

  var chart = new google.visualization.PieChart(document.getElementById('methodChart'));
  chart.draw(data, null);
}

function drawnSizeChart(distribution) {
  // We are going to classify the data in buckets, from 0 to maxNumber in steps defined by bucketNumber
  var maxNumber = 1000;
  var bucketNumber = 10;
  var step = maxNumber / bucketNumber;

  // Initialization of bucketArray
  var bucketArray = new Array(bucketNumber); 
  for (var i = 0; i < bucketArray.length; i++) {
    bucketArray[i] = 0;
  }

  //Classifify of data in buckets
  for (var i = 0; i < distribution.length; i++) {
    var element = distribution[i];
    for (var bucketIndex = 0; bucketIndex < bucketNumber; bucketIndex++) {
      if (element <= ((step * bucketIndex) + step)) {
        bucketArray[bucketIndex]++; // We found the bucket, so we can leave the inner for
        break;
      } 
    }
  }

  // And then we finally set the data to be drawn
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Size');
  data.addColumn('number', 'Calls');
  for (var i = 0; i < bucketArray.length; i++) {
    var bucket = bucketArray[i];
    var from = (step * i)
    var to = from + step;
    data.addRow([from + ' - ' + to, bucket]);
  }
  
  var chart = new google.visualization.ColumnChart(document.getElementById('documentSizeChart'));
  chart.draw(data, null);
}

// We don't have years or months, so they are not important.
function getDateFromDatetime(datetime) {
  return new Date('1970', 0, datetime.day, datetime.hour, datetime.minute);
}

//This is how many minutes between to dates
function getHowManyGaps(currentDate, candidateDate) {
  var diffInMs = Math.abs(currentDate - candidateDate);
  var minutes = Math.floor((diffInMs/1000)/60);
  return minutes;
}

function setNumberOfGaps(array, numberOfGaps) {
  var lastElementOfCurrentArray = array[array.length - 1];
  var lastMinute = lastElementOfCurrentArray[0];
  for (var i = 0; i < numberOfGaps; i++) {
    var minute = lastMinute + (i + 1)
    var gap = [minute, 0];
    array.push(gap);
  }
}

function setDistrOfMethods(distribution, element) {
  var method = DEFAULT_METHOD;
  if (element.request && element.request.method) {
    method = element.request.method;
  }

  if (distribution[method]) {
    distribution[method] += 1;
  } else {
    distribution[method] = 1;
  }
}

function setDistrOfCodes(distribution, element) {
  var code = DEFAULT_CODE;
  if (element.response_code) {
    code = element.response_code;
  }

  if (distribution[code]) {
    distribution[code] += 1;
  } else {
    distribution[code] = 1;
  }
}

function setSizeDistribution(distribution, element) {
  if (element.response_code !== '200') {
    return;
  }

  var size = getElementSize(element);
  if (size < 1000) {
    distribution.push(size);
  }  
}

function setReqPerMinute(distribution, element, params) {
  var datetime = element.datetime;
  var elementDate = getDateFromDatetime(datetime);
  if (params.firstIteration) { //Some initialization in the first iteration
    params.currentDate = elementDate;
    params.firstDate = params.currentDate;
    distribution.push(params.currentTimeElement);
    params.firstIteration = false;
  }

  var numberOfGaps = getHowManyGaps(params.currentDate, elementDate); // We need to know if we are in the same minute
  if (numberOfGaps) { // If we are not, we need to find how many minutes between the dates
    setNumberOfGaps(distribution, numberOfGaps); // And fill them so we can draw the chart
    params.currentTimeElement = distribution[distribution.length -1]; // We work always in the last element, this is just a reference
    params.currentDate = elementDate;
  }

  params.currentTimeElement[1] += 1; // When we are in the correct minute, we update the element by reference in the array
}

function drawChart() {
  var epaDataRecords = window.epadata;

  var distrOfMethods = {};
  var reqPerMinute = [];
  var distrOfCodes = {};
  var distrOfSizes = [];


  var timeParams = { };
  timeParams.firstIteration = true;
  timeParams.currentDate;
  timeParams.currentTimeElement = [0, 0];
  timeParams.firstDate;
  for (var i = 0; i < epaDataRecords.length; i++) {
    var element = epaDataRecords[i];
    //TIME DISTRIBUTION
    setReqPerMinute(reqPerMinute, element, timeParams);

    //METHOD DISTRIBUTION
    setDistrOfMethods(distrOfMethods, element);

    //ANSWER CODE DISTRIBUTION
    setDistrOfCodes(distrOfCodes, element);

    //SIZE DISTRIBUTION
    setSizeDistribution(distrOfSizes, element);
  }

  // DRAW CHARTS
  drawMethodChart(distrOfMethods);
  drawRequestPerMinuteChart(reqPerMinute, timeParams.firstDate);
  drawResponseCodeChart(distrOfCodes);
  drawnSizeChart(distrOfSizes);
}