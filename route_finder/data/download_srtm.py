import ee
import geemap

ee.Initialize()

bbox = ee.Geometry.Rectangle([139.64131, 35.7517, 139.7316, 35.8247])

dem_dataset = ee.Image('USGS/SRTMGL1_003')

clipped_dem = dem_dataset.clip(bbox)
slope = ee.Terrain.slope(clipped_dem)

output_slope_file = 'slope.tif'
geemap.ee_export_image(
    slope,
    filename=output_slope_file,
    scale=30,
    region=bbox,
    crs='EPSG:4326'
)

print(f"Slope data calculated and saved to {output_slope_file}.")