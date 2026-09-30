// Define your table with points (e.g., imported or pre-defined)
var table = table1.limit(100);

// Define the date range.
var startDate = '2023-07-22';
var endDate = '2023-10-20';

// Define the side length for a 10-square-mile area (approximately 5,084 meters).
var sideLength = 5084; // Side length in meters for 10-square-mile area

// Visualization parameters for Sentinel-2 images
var visParams = {
  bands: ['B4', 'B3', 'B2'], // Red, Green, Blue bands
  min: 0,
  max: 3000,  // Adjust based on your data range
};


// Function to process and export an image for each feature in the table
var processFeature = function(feature) {
  var lon = feature.getNumber('X');
  var lat = feature.getNumber('Y');
  var point = ee.Geometry.Point([lon, lat]);
  var date = ee.Date(feature.getString('DATE'));
  
  var region = point.buffer(sideLength / 2).bounds(); // 10-square-mile area box

// Choose a satellite image collection, e.g., Sentinel-2 or Landsat 8.
  var collection = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')  // Sentinel-2
 // Sentinel-2
    .filterDate(date, date.advance(2,'month'))                   // Filter by date range
    .filterBounds(region)                             // Filter by location (bounding box)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) // Optional: Filter by cloud coverage
    .sort('CLOUDY_PIXEL_PERCENTAGE')                  // Sort by least cloudy image
    .first();                                         // Get the first image in the sorted collection

// Clip the image to the 10-square-mile region.
  var clippedImage = collection.clip(region).toUint16();

// Get and print the date taken of the selected image.
  var dateTaken = ee.Date(clippedImage.get('system:time_start')).format('YYYY-MM-dd');
  
  return feature.set('image', clippedImage);

  
};

// Map the function over the table
var table2 = table.map(processFeature);

print("table: ");
print(table);
print(table2);

/*
Export.image.toDrive({
  image: clippedImage.visualize(visParams),
  description: 'Export_Clipped_Image',
  folder: 'WildFire_Sat_Images',
  fileNamePrefix: 'Sat_Image_Test',
  scale: 10,
  region: region,
  maxPixels: 1e13,
  //fileFormat: 'GEOTIFF'
});
*/

// Optional: Display the table on the map
Map.addLayer(table, {}, 'Input Table');
