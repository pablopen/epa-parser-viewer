# Log importer
Just a quick script to parse logs into a json structure, and write then to a json File.


## Pre-requisites

>Node

No **npm** dependencies, so no npm install is required
## Launch
Place input file in the default in put folder:
> ../data-raw/epa-http.txt

Default ouput file will be:
> ../data-parsed/epa-http.json

### Node
>node index.js

### Executable

Make sure index.js has execution permissions:

**Linux/MacOS X**

>chmod +x index.js

**Launch:**
>./index.js

**_Please_** make sure you are ***inside this folder*** when launching so the defaults input/output path are correct

**Windows**
>node.cmd cli.js


## Options

You can override the default input/ouput filepath providing launching arguments:
> node index.js [inputFile] [ouputJsonFile]

Example:

>node index.js input.txt ouput.json

## Examples

Input:
```
141.243.1.172 [29:23:53:25] "GET /Software.html HTTP/1.0" 200 1497
```

Output:
```
[
{"host":"141.243.1.172","datetime":{"day":"29","hour":"23","minute":"53","second":"25"},"request":{"method":"GET","url":"/Software.html","protocol":"HTTP","protocol_version":"1.0"},"response_code":"200","document_size":"1497"}
]
```
