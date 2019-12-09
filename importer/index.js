'use strict';

const fs = require('fs');
//const path = require('path');
const readline = require('readline');

const { 
  getDateTimeObject,
  getRequestObject,
  getResponseCodeObject,
  getDocumentSizeObject
} = require('./utils');

const POSITION_INFO = {
  HOST: 0,
  DATETIME: 1,
  REQUEST: 2,
  RESPONSE_CODE: 3,
  DOCUMENT_SIZE: 4  
};

const SPLIT_REGEXP = /(?:[^\s"]+|"[^"]*")+/g; // This will split by spaces, but ignore spaces surronded by quotes ""

let firstWriteFlag = true;

async function writeLineToFile(outputStream, objectToWrite) {
  let stringToWrite = JSON.stringify(objectToWrite);
  if (firstWriteFlag) {
    firstWriteFlag = false;
  } else {
    stringToWrite = `,\n${stringToWrite}`; // \n can be deleted to revert the break line
  }

  await outputStream.write(stringToWrite);
}

async function initializeOutputStreamArray() {
  const outputStream = fs.createWriteStream('../data-parsed/epa-http.json');
  let initialCharacters = '[';
  initialCharacters += '\n'; // Add a line break, this can be deleted too
  await outputStream.write(initialCharacters);
  return outputStream;
}

async function closeOuputStreamArray(outputStream) {
  let endCharacters = ']';
  endCharacters = `\n${endCharacters}`; // Again, added a line break, can be deleted
  await outputStream.write(endCharacters);
  await outputStream.close();
}

async function processLineByLine() {
  const rl = readline.createInterface({
    input: fs.createReadStream('../data-raw/epa-http.txt')
  });

  let linesRead = 0;

  const outputStream = await initializeOutputStreamArray();
  for await (const line of rl) {
    linesRead++;
    const splittedLine = line.match(SPLIT_REGEXP);
    const objectParsed = {
      host: splittedLine[POSITION_INFO.HOST],
      datetime: getDateTimeObject(splittedLine[POSITION_INFO.DATETIME]),
      request: getRequestObject(splittedLine[POSITION_INFO.REQUEST]),
      response_code: getResponseCodeObject(splittedLine[POSITION_INFO.RESPONSE_CODE]), // We do some checking, but may just return the string
      document_size: getDocumentSizeObject(splittedLine[POSITION_INFO.DOCUMENT_SIZE]), // Same here, we just avoid "-" character or no characers at all
    };

    await writeLineToFile(outputStream, objectParsed);
  }

  closeOuputStreamArray(outputStream);
  console.log('Total lines read:', linesRead);
}

processLineByLine();
