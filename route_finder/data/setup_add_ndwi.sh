#!/bin/bash

TIF_FILE="satellite/2018-12-14_54SUE_NDWI_3320.tif"
REPROJECTED_TIF="satellite/2018-12-14_54SUE_NDWI_4326.tif"
SCALED_TIF="satellite/2018-12-14_54SUE_NDWI_4326_scaled.tif"
DB_NAME="tokyo_routing"
DB_USER="postgres"
RASTER_TABLE="public.ndwi_raster"
COLUMN_NAME="water_index"

echo "Reprojecting the raster to EPSG:4326..."
gdalwarp -t_srs EPSG:4326 "$TIF_FILE" "$REPROJECTED_TIF" || { echo "Reprojection failed"; exit 1; }

echo "Calculating NDWI min and max values..."
NDWI_STATS=$(gdalinfo -mm "$REPROJECTED_TIF" | grep "Computed Min/Max" | sed 's/[^0-9.,-]*//g')
MIN_NDWI=$(echo "$NDWI_STATS" | cut -d',' -f1)
MAX_NDWI=$(echo "$NDWI_STATS" | cut -d',' -f2)

echo "NDWI Min: $MIN_NDWI, NDWI Max: $MAX_NDWI"

echo "Scaling NDWI values to range [0, 1]..."
gdal_calc.py \
    -A "$REPROJECTED_TIF" \
    --outfile="$SCALED_TIF" \
    --calc="(A - $MIN_NDWI) / ($MAX_NDWI - $MIN_NDWI)" \
    --NoDataValue=-9999 \
    --type=Float32 --overwrite || { echo "Scaling failed"; exit 1; }

echo "Importing the scaled raster into the PostGIS database..."
raster2pgsql -s 4326 -I -C -M "$SCALED_TIF" "$RASTER_TABLE" | psql -U "$DB_USER" -d "$DB_NAME" || { echo "Raster import failed"; exit 1; }

echo "Adding the '$COLUMN_NAME' column to the 'ways' table and calculating its values..."
psql -U "$DB_USER" -d "$DB_NAME" -c "
ALTER TABLE ways ADD COLUMN IF NOT EXISTS $COLUMN_NAME DOUBLE PRECISION;

WITH ndwi_values AS (
  SELECT
    w.gid AS way_id,
    AVG((ST_SummaryStats(ST_Clip(r.rast, 1, ST_Transform(w.the_geom, ST_SRID(r.rast))), 1, true)).mean) AS mean_ndwi
  FROM ways w
  JOIN $RASTER_TABLE r
  ON ST_Intersects(ST_Transform(w.the_geom, ST_SRID(r.rast)), r.rast)
  GROUP BY w.gid
)
UPDATE ways
SET $COLUMN_NAME = ndwi_values.mean_ndwi
FROM ndwi_values
WHERE ways.gid = ndwi_values.way_id;
" || { echo "Update operation failed"; exit 1; }

echo "Normalized NDWI data has been successfully added to the database."