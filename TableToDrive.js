//Try to just get images for two of the entries in the table
//(or just the first entry in the table)
//Start with the code for the single ImageToDrive function
//Then redefine where inputs are coming from (from table instead of manual input)
var table = table1.limit(100);

var featureList = table.toList(table.size());

var index = 90;
var entry = ee.Feature(featureList.get(index));
//var entry = table.slice(1,index).first()


//Specify date to get image
var date = ee.Date(entry.getString('DATE'));


//Specify point to center image at
var x = entry.geometry().coordinates().get(0);
var y = entry.geometry().coordinates().get(1);
var point = ee.Geometry.Point([x, y]);
// Create a rectangular region centered on the point, with the exact 10-square-mile area.
var sideLength = 5084; // Side length in meters for 10 square miles
var region = point.buffer(sideLength / 2).bounds(); // 10-square-mile area box

print(region);
print(date)
print(entry);

// Choose a satellite image collection, e.g., Sentinel-2 or Landsat 8.
var collection = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')  // Sentinel-2
 // Sentinel-2
    .filterDate(date , date.advance(4,'month'))                   // Filter by date range
    .filterBounds(region)                             // Filter by location (bounding box)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) // Optional: Filter by cloud coverage
    .sort('CLOUDY_PIXEL_PERCENTAGE')                  // Sort by least cloudy image
    .first();                                         // Get the first image in the sorted collection

// Clip the image to the 10-square-mile region.
var clippedImage = collection.clip(region).toUint16();

// Get and print the date taken of the selected image.
var dateTaken = ee.Date(clippedImage.get('system:time_start')).format('YYYY-MM-dd');
print('Date Taken:', dateTaken);

var visParams = {
  bands: ['B4', 'B3', 'B2'],  // Red, Green, Blue bands
  min: 0,
  max: 3000,  // Adjust based on your data range
};

// Center the map on the region and add the clipped image to the map.
Map.centerObject(region, 13); // Adjusted zoom level for a 10-square-mile area
Map.addLayer(clippedImage, visParams, 'Sentinel-2 Clipped Image');

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

// Print image and region information.
print('Clipped Image:', clippedImage);
print('Region:', region);
