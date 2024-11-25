#!/bin/bash

TIF_FILE="satellite/slope.tif"
ABSOLUTE_TIF="satellite/slope_absolute.tif"
DB_NAME="tokyo_routing"
DB_USER="postgres"
RASTER_TABLE="public.slope_raster"
COLUMN_NAME="slope_index"

echo "Creating an absolute value raster for slope..."
gdal_calc.py -A "$TIF_FILE" --outfile="$ABSOLUTE_TIF" --calc="abs(A)" --NoDataValue=-9999 || { echo "Absolute slope calculation failed"; exit 1; }

echo "Importing the absolute slope raster into the PostGIS database..."
raster2pgsql -s 4326 -I -C -M "$ABSOLUTE_TIF" "$RASTER_TABLE" | psql -U "$DB_USER" -d "$DB_NAME" || { echo "Raster import failed"; exit 1; }

echo "Adding the '$COLUMN_NAME' column to the 'ways' table and calculating its values..."
psql -U "$DB_USER" -d "$DB_NAME" -c "
ALTER TABLE ways ADD COLUMN IF NOT EXISTS $COLUMN_NAME DOUBLE PRECISION;

WITH slope_values AS (
  SELECT
    w.gid AS way_id,
    AVG((ST_SummaryStats(ST_Clip(r.rast, 1, ST_Transform(w.the_geom, ST_SRID(r.rast))), 1, true)).mean) AS mean_slope
  FROM ways w
  JOIN $RASTER_TABLE r
  ON ST_Intersects(ST_Transform(w.the_geom, ST_SRID(r.rast)), r.rast)
  GROUP BY w.gid
)
UPDATE ways
SET $COLUMN_NAME = slope_values.mean_slope
FROM slope_values
WHERE ways.gid = slope_values.way_id;
" || { echo "Update operation failed"; exit 1; }

echo "Slope data has been successfully added to the database."