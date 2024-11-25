#!/bin/bash

TIF_FILE="satellite/WSF2019_v1_138_34_clipped.tif"
REPROJECTED_TIF="satellite/WSF2019_v1_138_34_clipped_4326.tif"
HEATMAP_TIF="satellite/WSF2019_v1_138_34_heatmap.tif"
DB_NAME="tokyo_routing"
DB_USER="postgres"
RASTER_TABLE="public.isolation_raster"
COLUMN_NAME="isolation_index"

echo "Reprojecting the raster to EPSG:4326..."
gdalwarp -t_srs EPSG:4326 "$TIF_FILE" "$REPROJECTED_TIF" || { echo "Reprojection failed"; exit 1; }

echo "Generating heatmap using averaging filter (resampling)..."
gdal_translate -outsize 25% 25% -r average "$REPROJECTED_TIF" "$HEATMAP_TIF" || { echo "Heatmap generation failed"; exit 1; }

echo "Importing the heatmap raster into the PostGIS database..."
raster2pgsql -s 4326 -I -C -M "$HEATMAP_TIF" "$RASTER_TABLE" | psql -U "$DB_USER" -d "$DB_NAME" || { echo "Raster import failed"; exit 1; }

echo "Adding the '$COLUMN_NAME' column to the 'ways' table and calculating its values..."
psql -U "$DB_USER" -d $DB_NAME -c "
ALTER TABLE ways ADD COLUMN IF NOT EXISTS $COLUMN_NAME DOUBLE PRECISION;

WITH isolation_values AS (
  SELECT
    w.gid AS way_id,
    AVG((ST_SummaryStats(ST_Clip(r.rast, 1, ST_Transform(w.the_geom, ST_SRID(r.rast))), 1, true)).mean) AS mean_isolation
  FROM ways w
  JOIN $RASTER_TABLE r
  ON ST_Intersects(ST_Transform(w.the_geom, ST_SRID(r.rast)), r.rast)
  GROUP BY w.gid
)
UPDATE ways
SET $COLUMN_NAME = isolation_values.mean_isolation
FROM isolation_values
WHERE ways.gid = isolation_values.way_id;
" || { echo "Update operation failed"; exit 1; }

echo "Isolation index data has been successfully added to the database."