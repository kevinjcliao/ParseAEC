'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var Papa = require('papaparse');
var filename = process.argv[2];
var fs = require('fs');
console.log("Parsing file: ", filename);

var file = fs.readFileSync(filename, 'utf8');

Papa.parse(file, {
  complete: function complete(results) {
    pushDataToFirebase(results.data);
  }
});

function getMetadata(data) {
  console.log("Reading data: ", data);
  var years = readYearLine(data[0][0]);
  console.log("The years of this data is: ", years);
  var party = data[1][0];
  console.log("The party you're reading is: ", party);
  return {
    years: years,
    party: party
  };
}

function processData(data) {
  console.log("processData called for data", data);
}

function pushDataToFirebase(results) {
  var metadata = getMetadata(results.slice(0, 2));
  var data = results.slice(3);
  data.map(function (donation) {
    pushDonationToFirebase(donation, metadata);
  });
}

// donor, address, suburb, state, postcode, amount, type
//   0  ,    1   ,    2  ,   3  ,     4   ,    5  ,  6
function pushDonationToFirebase(donation, metadata) {
  var processedDonation = _extends({}, metadata, {
    donor: donation[0],
    location: {
      address: donation[1],
      suburb: donation[2],
      state: donation[3],
      postcode: donation[4]
    },
    amount: donation[5],
    type: donation[6]
  });
  console.log("created parsed donation: ", processedDonation);
}

function readYearLine(lineZero) {
  console.log("Parsing linezero: ", lineZero);
  var years = lineZero.split(" - ")[1].split("-");
  var startYear = years[0];
  // The AEC has started returning data with end years of the last
  // two digits of the year. We can fix this by appending appropriately.
  var endYear = years[1].length === 2 ? "20" + years[1] : years[1];
  return {
    start: startYear,
    end: endYear
  };
}