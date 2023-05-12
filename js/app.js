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
	
	d3.json("../DATA/ctps_brmpo_towns.geo.json")
		.then(function(mpoFeatureCollection) {
			d3.csv("../DATA/towns_poly_utilities.csv")
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

	// SVG Viewport
	var svgContainer = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)
		.style("border", "2px solid steelblue");

	var projection = d3.geoConicConformal()
		.parallels([41 + 43 / 60, 42 + 41 / 60])
	    .rotate([71 + 30 / 60, -41 ]);
		
		// .scale([30000]) // N.B. The scale and translation vector were determined empirically.
		// .translate([300,2160]);
		
	var geoPath = d3.geoPath().projection(projection);
	
	
	// Define what to do when panning or zooming - event listener
	// As of D3V6, event handlers are passed the _event_ and _datum_ as 
	// parameters, and _this_ is being the target node.
	var zooming = function(e, d) {
		// Log e.transform, so you can see all the goodies inside
		// console.log(e.transform);
		
		//New offset array
		var offset = [e.transform.x, e.transform.y];
		//Calculate new scale
		var newScale = e.transform.k * 2000;
		//Update projection with new offset and scale
		projection.translate(offset)
				  .scale(newScale);
		//Update all paths
		svgContainer.selectAll("path")
			.attr("d", geoPath);
	}
	
	// Then define the zoom behavior
	// Constrain zoom range to be from 1/6x to 10x (N.B. application of scale factor)
	var zoom = d3.zoom()
				 .scaleExtent([1.0, 60.0])
				 .on("zoom", zooming);
				 
	// The center of the MPO region (approximate)
	var center = projection([-71.2, 42.3]);
	
	// Create a container in which all zoomable objects will live
	var map = svgContainer.append("g")
			.attr("id", "map")
			.call(zoom)  //Bind the zoom behavior
			.call(zoom.transform, d3.zoomIdentity  	//Then apply the initial transform.
				.translate(350,975)				// N.B. The translation vector and 
				.scale(12));							//      scale factor were determined
													//      empirically.
													// N.B. The scale factor is multiplied
													//      by 2,000 in the zoom handler.

	//Create a new, invisible background rect to catch zoom events	
	map.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", width)
		.attr("height", height)
		.attr("opacity", 0);
	

	// Create Boston Region MPO map with SVG paths for individual towns.
	var mpoSVG = map.selectAll("path")
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
			// .delay(250)
			.duration(1000)		
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
			// .delay(250)
			.duration(1000)
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
			// .delay(250)
			.duration(1000)
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