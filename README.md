# Epitelete-Perf-Html
Epitelete sub-class for HTML handling.

## Installation
```shell
npm install epitelete-perf-html
```

## Usage
```js
import EpiteletePerfHtml from 'epitelete-perf-html';
// Instantiate Proskomma and load some content into it
const epiPerfHtml= new EpiteletePerfHtml(proskommaInstance, "doc_set_id");
```

### Html handling
```js
const htmlContainer = await epiPerfHtml.readHTML(bookCode); // => object { docSetId, mainSequenceId, headers, sequenceHtml };
const { sequenceHtml } = htmlContainer; //Array of html sequences { [sequenceId] : '<sequence html>'}
//make changes to sequences html and merge them back to htmlContainer
...
//write back the changed htmlContainer
await epiPerfHtml.writeHTML(bookCode, sequenceId, changedHtmlContainer);
```

### Inherited functionality
```js
epiPerfHtml.localBookCodes()   // => Array of 3-character book codes cached in Epitelete
epiPerfHtml.bookHeaders()      // => Object containing titles and other headers for each bookCode in Proskomma
epiPerfHtml.readPerf(bookCode) // => PERF for this bookCode, fetching from Proskomma if necessary
epiPerfHtml.clearPerf()        // Deletes all local PERF data
```