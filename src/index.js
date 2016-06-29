const Papa = require('papaparse');
const filename = process.argv[2];
const fs = require('fs');
console.log("Parsing file: ", filename);

const file = fs.readFileSync(filename, 'utf8');

Papa.parse(file, {
  complete: (results) => {
    pushDataToFirebase(results.data);
  }
});

function getMetadata(data) {
  console.log("Reading data: ", data);
  const years = readYearLine(data[0][0]);
  console.log("The years of this data is: ", years);
  const party = data[1][0];
  console.log("The party you're reading is: ", party);
  return {
    years,
    party
  };
}

function processData(data) {
  console.log("processData called for data", data);
}

function pushDataToFirebase(results) {
  const metadata = getMetadata(results.slice(0, 2));
  const data = results.slice(3);
  data.map((donation) => {
    pushDonationToFirebase(donation, metadata);
  });
}

// donor, address, suburb, state, postcode, amount, type
//   0  ,    1   ,    2  ,   3  ,     4   ,    5  ,  6
function pushDonationToFirebase(donation, metadata) {
  const processedDonation = {
    ...metadata,
    donor: donation[0],
    location: {
      address: donation[1],
      suburb: donation[2],
      state: donation[3],
      postcode: donation[4]
    },
    amount: donation[5],
    type: donation[6]
  };
  console.log("created parsed donation: ", processedDonation);
}

function readYearLine(lineZero) {
  console.log("Parsing linezero: ", lineZero);
  const years = lineZero.split(" - ")[1].split("-");
  const startYear = years[0];
  // The AEC has started returning data with end years of the last
  // two digits of the year. We can fix this by appending appropriately.
  const endYear = years[1].length===2 ?
          "20" + years[1] : years[1];
  return {
    start: startYear,
    end: endYear
  };
}
