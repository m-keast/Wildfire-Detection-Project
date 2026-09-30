// Import the CSV file as a table asset
var table = table2;
var tableLimited = table.limit(100).filter(ee.Filter.notNull(['DATE']));;
print(table2);

// Get columns from the table
var getImageMetadata = function(feature) {
  var lon = feature.getNumber('X');
  var lat = feature.getNumber('Y');
  var year = feature.getString('YEAR');
  var month = feature.getString('MONTH');
  var day = feature.getString('DAY');
  //var date = ee.Date(feature.getString('DATE'));
  var date = ee.Date('2020-05-05')
  var point = ee.Geometry.Point([lon, lat]);
  var sideLength = 5082;
  // Create a rectangular region centered on the point with specified side lengths
  var region = point.buffer(sideLength / 2).bounds();

  // Filter Sentinel-2 image collection by date and location
  var image = ee.ImageCollection('COPERNICUS/S2_SR')
                .filterBounds(region)
                .filterDate(date, date.advance(2,'month'))
                .sort('CLOUDY_PIXEL_PERCENTAGE')
                .first();
  
  var clippedImage = image.clip(region).toUint16();

  // Get image ID and generate a thumbnail URL
  var imageId = clippedImage.get('system:id');
  
  
  // Add image metadata as properties to the feature
  return feature.set({
    'image_id': imageId
  });
};

// Map the function over the table
var processedTable = tableLimited.map(getImageMetadata);

// Print to check the output
print(processedTable);

// Export metadata to Google Drive as a CSV
Export.table.toDrive({
  collection: processedTable,
  description: 'Image_Metadata_Export',
  fileFormat: 'CSV',
  selectors: ['X', 'Y', 'DISCOVERYDATETIME', 'image_id']
});
