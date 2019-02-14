/**
 * Author: Barry Li
 * Javascript DBSCAN
 * Density-Based Spatial Clustering of Applications with Noise
 *
 * Groups array of points into clusters based on density
 *
 */


function DBSCAN(arr, eps, minPts) {      
/*
 * INFO:
 * -----
 * Javascript Implementation of DBSCAN
 * Group points into cluster based on density
 *
 * PARAM:
 * -----------
 * arr: 				Array: [[x1, y1, z1], [x2, y2, z2], ...]
 *							The input array to DBSCAN, where x and y correspond to the coordinates of a point.
 *
 * eps: 				int
 *      				Maximum distance between two points to be considered neighbours
 *
 * minPts: 			int
 *		   				Minimum number of points required to form a cluster
 *
 * RETURNS:
 * --------
 * clusters: 		obj
 *		   				clusters = {key = clusterID : value = [[x1,y1],[x2,y2],...], ...}
 */

	var cluster_id = {};
	
	//Cluster counter
	var C = 0 
	for (var i = 0; i < arr.length; i++) {
		
		//Check if already processed
		if (cluster_id[arr[i]] != undefined) { continue; } 
		//Find neighbours
		N = RangeQuery(arr, arr[i], eps); 
		
		if (N.length < minPts) {
			//Noise points
			cluster_id[arr[i]] = 'noise';
			continue;
		}
		
		//Next cluster
		C = C + 1; 
		
		//Expand Cluster --------------------------------------------------------------
		
		//Label initial point
		cluster_id[arr[i]] = C;
		
		//Seed set
		//Seed set should be the Neighbours set / current point, but it doesn't make any difference and it's slower than not excluding the current point
		var S = N;
		
		for (var j = 0; j < S.length; j++) {
			//Change noise to border point
			if (cluster_id[S[j]] == 'noise') { 
				cluster_id[S[j]] = C; 					
			} 							
			//Check if already processed
			if (cluster_id[S[j]] != undefined) { continue; } 
			
			//Label neighbour
			cluster_id[S[j]] = C
			
			//Find neighbours
			N = RangeQuery(arr, S[j], eps);
			
			//Density check
			if (N.length >= minPts) {
				//Add new neighbours to seed set
				S.push.apply(S,N); //Theorectically incorrect, but practically the same result as a union and much faster
			}
		}		
	}
	 
	var clusters = {};
	//This for loop converts cluster_id {key = [x,y,z]: value = cluster_id,...} to clusters{cluster_id : value = [[x1,y1,z1],[x2,y2,z2],...],...}
	for (var key in cluster_id) {	
		if (!(cluster_id[key] in clusters)) {							
			//Create a new key in the dicitonary
			clusters[cluster_id[key]] = [];	
		}
		//Append coordinates to a given key
		clusters[cluster_id[key]].push(key.split(","));
	}
	return clusters;

}
function RangeQuery(arr, Pt, eps) {
/*
 * INFO:
 * -----
 * Perform RangeQuery by calculating the euclidean distance
 * Returns k-nearest neighbours within a radius of a point
 *
 * PARAM:
 * -----------
 * arr: 			Array: [[x1, y1,z1], [x2,y2,z2], ...]
 *						The input array to DBSCAN, where x and y correspond to the coordinates of a point.
 *
 * Pt:	 			Array: [x, y,z]
 *						Point array containing co-ordinates
 *
 * eps: 			int
 *      			Maximum distance between two points to be considered neighbours
 *
 * RETURN:
 * --------
 * Neighbours: 		Array: [[x1, y1,z1], [x2,y2,z2], ...]
 *		   					Array containing neighbouring points
 */
 
	Neighbours = [];
	for (var i = 0; i < arr.length; i++) {
		if (distFunc(Pt, arr[i]) <= eps) {
			//Add to Neighbours
			Neighbours = [...Neighbours,...[arr[i]]]
		}
	}
	return Neighbours;
}

function distFunc(Q, P) {
/*
 * INFO:
 * -----
 * Calculates the Euclidean Distance between 2 points
 *
 * Parameters:
 * -----------
 * Q:	 			Array: [x, y]
 *					Point array containing co-ordinates
 *
 * P:	 			Array: [x, y]
 *					Point array containing co-ordinates
 *
 * Returns:
 * --------
 * D: 				float
 *		   			Distance float
 */
 
	D = Math.sqrt(Math.pow((P[0]-Q[0]),2)+Math.pow((P[1]-Q[1]),2)+Math.pow((P[2]-Q[2]),2)); 	
	return D;
}
