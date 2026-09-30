
// Import the CSV file as a table asset
var table = table1

// Function to get an image for each point
var getImageForPoint = function(feature) {
  // Extract coordinates and time from the feature
  var lon = feature.getNumber('X');
  var lat = feature.getNumber('Y');
  var time = feature.getString('DISCOVERYDATETIME');

  // Convert time string to date format
  var date = ee.Date(time);

  // Define the point geometry
  var point = ee.Geometry.Point([lon, lat]);
  // Define the side length for a 10-square-mile area (approximately 5,084 meters).
  var sideLength = 5084; // Side length in meters for 10 square miles
  // Create a rectangular region centered on the point, with the exact 10-square-mile area.
  var region = point.buffer(sideLength / 2).bounds(); // 10-square-mile area box
  

  // Filter Sentinel-2 image collection by date and location
  var image = ee.ImageCollection('COPERNICUS/S2_SR')
                .filterBounds(region)
                .filterDate(date, date.advance(1, 'month'))
                .sort('CLOUDY_PIXEL_PERCENTAGE')
                .first();

  // Clip the image to the 10-square-mile region.
  var clippedImage = image.clip(region).toUint16();

  // Get and print the date taken of the selected image.
  var dateTaken = ee.Date(clippedImage.get('system:time_start')).format('YYYY-MM-dd');
  print('Date Taken:', dateTaken);

  var visParams = {
    bands: ['B4', 'B3', 'B2'],  // Red, Green, Blue bands
    min: 0,
    max: 3000,  // Adjust based on your data range
  };

  // Add the clipped image as a property to the feature
  return feature.set('image', clippedImage);
};

// Map the function over the table
var processedTable = table.map(getImageForPoint);

// Display results on the map (for visualization)
Map.centerObject(table, 10);
Map.addLayer(table, {}, 'CSV Points');
processedTable.evaluate(function(features) {
  features.forEach(function(feature) {
    var image = ee.Image(feature.properties.image);
    Map.addLayer(image, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, 'Image');
  });
});

// Example Export (Optional): Export a thumbnail for each point
processedTable.evaluate(function(features) {
  features.forEach(function(feature) {
    var lon = feature.properties.longitude;
    var lat = feature.properties.latitude;
    var image = ee.Image(feature.properties.image);
    var pointId = feature.id;

    Export.image.toDrive({
      image: image,
      description: 'Image_' + pointId,
      scale: 10,
      region: ee.Geometry.Point([lon, lat]).buffer(500),
      maxPixels: 1e6
    });
  });
});