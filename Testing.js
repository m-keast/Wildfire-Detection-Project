//Define the point of interest (longitude, latitude).
var point = ee.Geometry.Point([-77.09284607, 34.81653997]);

// Define the date range.
var startDate = '2023-05-21';
var endDate = '2023-09-20';

// Define the side length for a 10-square-mile area (approximately 5,084 meters).
var sideLength = 5084; // Side length in meters for 10 square miles

// Create a rectangular region centered on the point, with the exact 10-square-mile area.
var region = point.buffer(sideLength / 2).bounds(); // 10-square-mile area box

// Choose a satellite image collection, e.g., Sentinel-2 or Landsat 8.
var collection = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')  // Sentinel-2
 // Sentinel-2
    .filterDate(startDate, endDate)                   // Filter by date range
    .filterBounds(region)                             // Filter by location (bounding box)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) // Optional: Filter by cloud coverage
    .sort('CLOUDY_PIXEL_PERCENTAGE')                  // Sort by least cloudy image
    .first();                                         // Get the first image in the sorted collection

// Clip the image to the 10-square-mile region.
var clippedImage = collection.clip(region);

// Get and print the date taken of the selected image.
var dateTaken = ee.Date(clippedImage.get('system:time_start')).format('YYYY-MM-dd');
print('Date Taken:', dateTaken);



// Center the map on the region and add the clipped image to the map.
Map.centerObject(region, 13); // Adjusted zoom level for a 10-square-mile area
Map.addLayer(clippedImage, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, 'Sentinel-2 Clipped Image');

// Print image and region information.
print('Clipped Image:', clippedImage);
print('Region:', region);
