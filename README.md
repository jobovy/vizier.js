# vizier.js
Fetch data tables from VizieR in the browser

## Overview

This small javascript package allows you to fetch a table from [VizieR](https://vizier.u-strasbg.fr/) asynchronously and process the data table into a dictionary according to the ReadMe.

## Author

Jo Bovy (University of Toronto): bovy - at - astro - dot - utoronto - dot - ca

## Usage

Only very basic usage is currently implemented. See [examples/basic.html](examples/basic.html) for a fully worked basic example.

Load the library, e.g., from jsDelivr using
```
<script src="https://cdn.jsdelivr.net/npm/@jobovy/vizier"></script>
```
for the latest version or specify the version with (update 1.0.0 to later versions as necessary)
```
<script src="https://cdn.jsdelivr.net/npm/@jobovy/vizier@1.0.0"></script>
```
This exposes a global variable ``VizieR`` that contains the functionality of this package.

Fetch a table by specifying the catalog's name (e.g., 'J/A+A/545/A32'), the specific table within the catalog's name (e.g., 'table4.dat'), and the name of the ReadMe (optional, e.g., 'ReadMe'). This returns a Promise that returns the data dictionary and the header, which you can then process with a ``then`` function. For example,
```
VizieR.fetch('J/A+A/545/A32','table4.dat','ReadMe')
   .then(function (dataAndHeader) {
     let [data,header]= dataAndHeader;
     // do stuff with the data and/or the header!
   });
```

## Publishing a new version of this package

Follow the following steps:

* Update the version in ``package.json``
* Create a new git tag for this version: ``git tag vX.X.X``
* Package up for npm: ``npm pack``, check that no extraneous files are included
* Publish to npm: ``npm publish``
* Done!
