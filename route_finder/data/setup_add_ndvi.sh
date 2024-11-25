#!/bin/bash

TIF_FILE="satellite/2018-12-14_54SUE_NDVI_3320.tif"
REPROJECTED_TIF="satellite/2018-12-14_54SUE_NDVI_4326.tif"
DB_NAME="tokyo_routing"
DB_USER="postgres"
RASTER_TABLE="public.ndvi_raster"
COLUMN_NAME="green_index"

echo "Reprojecting the raster to EPSG:4326..."
gdalwarp -t_srs EPSG:4326 "$TIF_FILE" "$REPROJECTED_TIF" || { echo "Reprojection failed"; exit 1; }

echo "Importing the reprojected raster into the PostGIS database..."
raster2pgsql -s 4326 -I -C -M "$REPROJECTED_TIF" "$RASTER_TABLE" | psql -U "$DB_USER" -d "$DB_NAME" || { echo "Raster import failed"; exit 1; }

echo "Adding the '$COLUMN_NAME' column to the 'ways' table and calculating its values..."
psql -U "$DB_USER" -d "$DB_NAME" -c "
ALTER TABLE ways ADD COLUMN IF NOT EXISTS $COLUMN_NAME DOUBLE PRECISION;

WITH ndvi_values AS (
  SELECT
    w.gid AS way_id,
    AVG((ST_SummaryStats(ST_Clip(r.rast, 1, ST_Transform(w.the_geom, ST_SRID(r.rast))), 1, true)).mean) AS mean_ndvi
  FROM ways w
  JOIN $RASTER_TABLE r
  ON ST_Intersects(ST_Transform(w.the_geom, ST_SRID(r.rast)), r.rast)
  GROUP BY w.gid
)
UPDATE ways
SET $COLUMN_NAME = ndvi_values.mean_ndvi
FROM ndvi_values
WHERE ways.gid = ndvi_values.way_id;
" || { echo "Update operation failed"; exit 1; }

echo "NDVI data has been successfully added to the database."