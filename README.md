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
const epiPerfHtml= new EpiteletePerfHtml({proskomma: proskommaInstance, docSetId: "doc_set_id"});
```

### Html handling
```js
const htmlContainer = await epiPerfHtml.readHtml(bookCode); // => Object { docSetId, mainSequenceId, headers, sequencesHtml };
const { sequencesHtml } = htmlContainer; //Object containing html sequences { [sequenceId] : '<sequence html>'}
//Make changes to sequences html and merge them back to htmlContainer
...
//write back the changed htmlContainer
await epiPerfHtml.writeHtml(bookCode, sequenceId, changedHtmlContainer);
...
// undo
await epiPerfHtml.undoHtml(bookCode);
...
// redo
await epiPerfHtml.redoHtml(bookCode);
```

### Inherited functionality
```js
epiPerfHtml.localBookCodes()   // => Array of 3-character book codes cached in Epitelete
epiPerfHtml.bookHeaders()      // => Object containing titles and other headers for each bookCode in Proskomma
epiPerfHtml.readPerf(bookCode) // => PERF for this bookCode, fetching from Proskomma if necessary
epiPerfHtml.clearPerf()        // Deletes all local PERF data
```
