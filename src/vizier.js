(function() {

    // Check for jquery
    try {
	$;
    } catch (e) {
	if ( e instanceof ReferenceError )
	    throw new Error('Please load jquery before loading vizier.js');
    }

    if ( $.get === undefined )
	throw new Error('Please load jquery before loading vizier.js');
    
    let VizieR= {};

    /**
      * Process the README file to create the header and the splitter object
      * @param {string} cat - catalog descriptor (e.g., 'J/A+A/545/A32')
      * @param {string} datafile - name of the data file (e.g.. 'table4.dat')
      * @param {string} readme - the readme
      * @return {object} header object
      */
    process_readme= function (cat,datafile,readme) {
	header= {};
	header['splitter']= [];
	let line;
	let lines= readme.split('\n');
	let read_col_desc= false;
	let n_dashed_lines= 0;
	let col_desc;
	let col_splitter;
	// astropy's regular expression for matching the column descriptions
	const re= RegExp(/\s*(?<start>\d+\s*\-)?\s*(?<end>\d+)\s+(?<format>[\w.]+)\s+(?<units> \S+)\s+(?<name>\S+)(\s+(?<descr>\S.*))?/);
	for ( let ii=0; ii < lines.length; ii++ ) {
	    line= lines[ii];
	    if ( line.startsWith(cat) ) {
		header['title']= line.split('(')[0].split(cat)[1].trim();
		header['author']= line.split('(')[1].split(',')[0];
		header['year']= line.split('(')[1].split(',')[1].split(')')[0];
	    }
	    if ( line.startsWith('Byte-by-byte Description of file') &&
		 line.indexOf(datafile) !== -1 ) {
		read_col_desc= true;
	    }
	    if ( read_col_desc && ( line.startsWith('------------')
				    || line.startsWith('============') ) )
		n_dashed_lines+= 1;
	    if ( n_dashed_lines == 3 )
		read_col_desc= false;
	    if (n_dashed_lines == 2 && read_col_desc ) {
		// Split on any whitespace, remove empties
		col_desc= re.exec(line);
		if ( line.startsWith('------------')
                     || line.startsWith('============') )
		    continue;
		else if ( col_desc === null ) {
		    // Assume it's a line continuation
		    header['splitter'][header['splitter'].length-1]['Explanations']+= ' '+line.trim();
		    continue;
		}
		col_splitter= {}
		if ( col_desc.groups.start === undefined )
		    col_splitter['BytesStart']= parseInt(col_desc.groups.end);
		else
		    col_splitter['BytesStart']= parseInt(col_desc.groups.start
							 .slice(0,-1));
		col_splitter['BytesStart']-= 1; // Fortran -> C
		col_splitter['BytesEnd']= parseInt(col_desc.groups.end);
		col_splitter['Format']= col_desc.groups.format;
		col_splitter['Units']= col_desc.groups.units;
		col_splitter['Label']= col_desc.groups.name;
		col_splitter['Explanations']= col_desc.groups.descr;
		header['splitter'].push(col_splitter);
	    }
	}
	return header;
    }
    
    /**
      * Process the data to create the output data dictionary
      * @param {string} data - the data as one long string
      * @param {object} header object
      * @return {object} data dictionary
      */
    process_data= function (data,header) {
	let out= {};
	// Initialize output columns
	header['splitter'].forEach(function (col) {
	    out[col['Label']]= [];
	});
	// Process data file line by line
	let val;
	data.split('\n').forEach(function (line) {
	    header['splitter'].forEach(function (col) {
		val= line.slice(col['BytesStart'],col['BytesEnd'])
		if ( col['Format'][0] == 'A' )
		    out[col['Label']].push(val);
		else if ( col['Format'][0] == 'I' )
		    out[col['Label']].push(parseInt(val));
		else if ( col['Format'][0] == 'F' )
		    out[col['Label']].push(parseFloat(val));
		else
		    throw new Error(`Unknown column format ${col['Format']}`);
	    });
	});
	return out;
    }
    
    /**
      * Fetch a data table from VizieR and return it as a dictionary
      * @param {string} cat - catalog descriptor (e.g., 'J/A+A/545/A32')
      * @param {string} datafile - name of the data file (e.g.. 'table4.dat')
      * @param {string} ReadMe - name of the ReadMe (when separate)
      * @return {Array} [data dictionary,header object]
      */
    VizieR.fetch= function (cat,datafile,ReadMe) {
	// ReadMe given?
	ReadMe = ((typeof ReadMe !== 'undefined') ? 
                  ReadMe : null);
	
	let jqXHR;
	if ( ReadMe !== null )
	    jqXHR= $.when($.get('https://cdsarc.unistra.fr/ftp/'
				+`${cat}/${datafile}`),
			  $.get('https://cdsarc.unistra.fr/ftp/'
				+`${cat}/${ReadMe}`))
	    .then(function (data,readme) {
		return [data[0],readme[0]];
            });
	else
	    jqXHR= $.get(`https://cdsarc.unistra.fr/ftp/${cat}/${datafile}`)
	    .then(function (data) {
		// Extract readme from data file
		Promise.reject('Extracting the readme from the datafile itself is not implemented yet');
		return [data,undefined];
	    });

	return jqXHR.then(function (dataAndreadme) {
	    let [rawdata, readme]= dataAndreadme;
	    let header= process_readme(cat,datafile,readme);
	    let data= process_data(rawdata,header);
	    return [data,header];
	});
    }   

    // Export module for node.js and browser
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
        module.exports = VizieR;
    else 
        window.VizieR = VizieR;
})();
