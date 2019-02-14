function readFile(element) {
/**
 * Read the input data into a string
 *
**/
	var file = element.files[0];
	var reader = new FileReader();
	reader.onloadend = function() {
		data = reader.result;
		analyze(data);
	}
	reader.readAsText(file);
}

var json;
function analyze(data) {
/**
 * Analyze the data to determine the dimension of the tree
 * 
 * ALGORITHM
 * ---------
 * 1. Cluster the the points into 2 main group using DBSCAN, 1 cluster is the tree, the other is the ground
 * 2. Find the maximum/minimum x,y,z for the largest cluster
 * 3. Calculate the max - min in each dimension
 * 4. zMax - zMin will be the height of the tree
 * 5. The maximum between (yMax-yMin) and (xMax-xMin) is the max branch diameter
 * 6. The minimum between (yMax-yMin) and (xMax-xMin) is the max trunk diameter
 *
 * NOTE
 * ----
 * The data was sampled, due to the algorithm being too slow
 * The parameters, eps and minPts for DBSCAN needs to be tuned base on the context of the data
 * Due to sampling, errors are introduced
 *
**/

	// Parse the data into JSON
	json = Papa.parse(data);

	// Keep only x,y,z 
	var data = json.data.map(function(val){
    return val.slice(0, 3);
	});
	
	// Base line
	
	// Algorithm too slow, so I'm sampling the data
	var sampledData = [];
	var maxVal = 1000;
	var delta = Math.floor( data.length / maxVal );
	for (i = 0; i < data.length; i=i+delta) {
		sampledData.push(data[i]);
	}

	// Clustering, eps and minPts are tuned so that only there are only 2 large clusters
	// 1 cluster will be the ground, the other cluster is the tree
	eps = 3;
	minPts = 20;
	var clusters = DBSCAN(sampledData,eps,minPts);
	console.log(clusters);
	
	// The largest cluster will be the tree
	var largestCluster = 0;
	var largestClusterId;
	for (key in clusters) {
		if (clusters[key].length > largestCluster) {
			largestCluster = clusters[key].length;
			largestClusterId = key;
		}
	}
	var secondLargestCluster = 0;
	var secondLargestClusterId;
	for (key in clusters) {
		if (clusters[key].length > secondLargestCluster && key !== largestClusterId) {
			secondLargestCluster = clusters[key].length;
			secondLargestClusterId = key;
		}
	}
	
	
	// Geometry of the cluster representing the tree
	var xMax, xMin, yMax, yMin, zMax, zMin
	function geometry(clusterId) {
		xMax = Math.max.apply(null, clusters[clusterId].map(function(elt) { return elt[0]; }));
		xMin = Math.min.apply(null, clusters[clusterId].map(function(elt) { return elt[0]; }));
		yMax = Math.max.apply(null, clusters[clusterId].map(function(elt) { return elt[1]; }));
		yMin = Math.min.apply(null, clusters[clusterId].map(function(elt) { return elt[1]; }));
		zMax = Math.max.apply(null, clusters[clusterId].map(function(elt) { return elt[2]; }));
		zMin = Math.min.apply(null, clusters[clusterId].map(function(elt) { return elt[2]; }));
		
	}
		geometry(largestClusterId);
		var h = zMax - zMin;
		var branch = Math.max(xMax - xMin, yMax - yMin);
		var trunk = Math.min(xMax - xMin, yMax - yMin);
		
		if (h < branch || h < trunk) {
			geometry(secondLargestClusterId);
			h = zMax - zMin;
			branch = Math.max(xMax - xMin, yMax - yMin);
			trunk = Math.min(xMax - xMin, yMax - yMin);
		}
		
		
	var result = document.createElement("div");
	var resultText = "\nHeight: " +String(h)+" \nMax Branch Diameter: "+String(branch)+" \nTrunk Diameter: "+String(trunk);
	result.innerText = resultText;
	
	document.body.appendChild(result);
	
	console.log(resultText); 
}