function initialize() {
	$('#showhide').click(function(e) {
		if (this.value === 'Show description') {
			$('#blurb').show();
			this.value = 'Hide description';
		} else {
			$('#blurb').hide();
			this.value = 'Show description';		
		}
	});
	
	d3.json("DATA/boston_region_mpo_towns_97.geo.json")
		.then(function(mpoFeatureCollection) {
			d3.csv("DATA/towns_poly_utilities.csv")
				.then(function(maTownsUtils) {
					generateViz(mpoFeatureCollection, maTownsUtils);
			});
		});
} // initialize()

function generateViz(mpoFeatureCollection, maTownUtils) {	
	// Bind event handler
	 $('input:radio[name=util_choice]').change(function() {
		switch(this.value) {
		case "Electric":
			symbolizeElectric();
			break;
		case "Gas":
			symbolizeGas();
			break;
		case "Cable":
			symbolizeCable();
			break;
		default:
			break;
		}
	});
	
	// Sort maTownUtils array on TOWN_ID field.
	// Remember: TOWN_IDs are 1-based; JS array indices are 0-based!
	maTownUtils.sort(function(a,b) { return a.town_id - b.town_id; });
	
	var width = 960,
		height = 500;

/*
	// Define Zoom Function Event Listener
	function zoomFunction() {
	  d3.selectAll("path")
		.attr("transform",
			"translate(" + d3.event.translate
			+ ") scale (" + d3.event.scale + ")");
	}

	// Define Zoom Behavior
	var zoom = d3.behavior.zoom()
		.scaleExtent([0.2, 10]) 
		.on("zoom", zoomFunction);
*/


	// SVG Viewport
	var svgContainer = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
		.style("border", "2px solid steelblue");
		
		// .call(zoom);
 
	var projection = d3.geoConicConformal()
		.parallels([41 + 43 / 60, 42 + 41 / 60])
	    .rotate([71 + 30 / 60, -41 ])
		.scale([30000]) // N.B. The scale and translation vector were determined empirically.
		.translate([300,1160]);
		
	var geoPath = d3.geoPath().projection(projection);
		
	// Create Boston Region MPO map with SVG paths for individual towns.
	var mpoSVG = svgContainer.selectAll("path")
		.data(mpoFeatureCollection.features)
		.enter()
		.append("path")
		.attr("id", function(d, i) { return d.properties.town_id; })
		.attr("d", function(d, i) { return geoPath(d); })
		.style("fill", "#ffffff")
		.append("title")   
			.text(function(d, i) { 
					var retval;
					retval = d.properties.town + '\n';
					retval += 'Electric: ' + maTownUtils[d.properties.town_id-1].elec + '\n';
					retval += 'Gas: ' + maTownUtils[d.properties.town_id-1].gas + '\n';
					retval += 'Cable: ' + maTownUtils[d.properties.town_id-1].cable;
					return retval; 
				});
			
	symbolizeElectric();
	
	function symbolizeElectric() {
		var foo = svgContainer.selectAll("path")
			.attr("d", function(d, i) { return geoPath(d); })
			.transition()
			.delay(250)
			.duration(4000)		
			.style("fill", function(d, i) {
				var retval;
				// Note: This another place where the logical 'join' is performed.
				switch(maTownUtils[d.properties.town_id-1].elec) {
				case "Municipal":
					retval = "#66c2a5"; // "#fc8d59"
					break;
				case "National Grid":
					retval = "#fc8d62"; // "#ffffbf"
					break;
				case "NSTAR":
					retval = "#8da0cb"; // "#91bfdb"
					break;
				default:
					retval = "#ffffff";
					break;
				}
				return retval;
			});
	} // symbolizeElectric()
	
	function symbolizeGas() {
		var foo = svgContainer.selectAll("path")
			.attr("d", function(d, i) { return geoPath(d); })
			.transition()
			.delay(250)
			.duration(4000)
			.style("fill", function(d, i) {
				// Note: This is another place were the logical 'join' is performed.
				switch(maTownUtils[d.properties.town_id-1].gas) {	
				case "Bay State":
					retval = "#7fc97f";
					break;
				case "Bay State; Blackstone Gas Co.":
					retval = "#beaed4";
					break;
				case "Bay State; NSTAR":
					retval = "#fdc086";
					break;
				case "Municipal":
					retval = "#ffff99";
					break;
				case "National Grid":
					retval = "#386cb0";
					break;
				case "National Grid; NSTAR":
					retval = "#f0027f";
					break;
				case "NSTAR":
					retval = "#bf5b17";
					break;
				default:
					retval = "#ffffff";
					break;
				}
				return retval;
			});
	}; // symbolizeGas()
	
	function symbolizeCable() {
		var foo = svgContainer.selectAll("path")
			.attr("d", function(d, i) { return geoPath(d); })
			.transition()
			.delay(250)
			.duration(4000)
			.style("fill", function(d, i) {
				// Note: This is another place were the logical 'join' is performed.
				switch(maTownUtils[d.properties.town_id-1].cable) {	
				case "Charter; Verizon":
					retval = "#8dd3c7";
					break;
				case "Comcast":
					retval = "#ffffb3";
					break;
				case "Comcast; RCN":
					retval = "#bebada";
					break;
				case "Comcast; RCN; Braintree":
					retval = "#fb8072";
					break;
				case "Comcast; RCN; Norwood":
					retval = "#80b1d3";
					break;
				case "Comcast; RCN; Verizon":
					retval = "#fdb462";
					break;
				case "Comcast; Verizon":
					retval = "#b3de69";
					break;
				default:
					retval = "#ffffff";
					break;
				}
				return retval;
			});	
	} // symbolizeCable()
} // generateViz()