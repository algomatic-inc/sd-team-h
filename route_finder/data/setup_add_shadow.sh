#!/bin/bash

# Define variables
TIF_FILE="satellite/2018-04-10_SAR_3320_RGB.tif"
SHADE_TIF="satellite/2018-04-10_SAR_shade.tif"
REPROJECTED_TIF="satellite/2018-04-10_SAR_shade_4326.tif"
DB_NAME="tokyo_routing"
DB_USER="postgres"
RASTER_TABLE="public.sar_shade_raster"
COLUMN_NAME="shade_index"

echo "Creating shade index raster..."
gdal_calc.py -A "$TIF_FILE" --A_band=1 -B "$TIF_FILE" --B_band=2 --calc="1 - ((A + B) / (A.max() + B.max()))" \
             --outfile="$SHADE_TIF" --NoDataValue=0 --type=Float32 --overwrite || { echo "Shade index creation failed"; exit 1; }

echo "Reprojecting the shade index raster to EPSG:4326..."
gdalwarp -t_srs EPSG:4326 "$SHADE_TIF" "$REPROJECTED_TIF" || { echo "Reprojection failed"; exit 1; }

echo "Importing the shade index raster into the PostGIS database..."
raster2pgsql -s 4326 -I -C -M "$REPROJECTED_TIF" "$RASTER_TABLE" | psql -U "$DB_USER" -d "$DB_NAME" || { echo "Raster import failed"; exit 1; }

echo "Adding the '$COLUMN_NAME' column to the 'ways' table and calculating its values..."
psql -U "$DB_USER" -d "$DB_NAME" << EOF
-- Ensure the column exists
ALTER TABLE ways ADD COLUMN IF NOT EXISTS $COLUMN_NAME DOUBLE PRECISION;

-- Calculate shade index from the SAR raster
WITH shade_values AS (
  SELECT
    w.gid AS way_id,
    AVG((ST_SummaryStats(ST_Clip(r.rast, 1, ST_Transform(w.the_geom, ST_SRID(r.rast))), 1, true)).mean) AS mean_shade
  FROM ways w
  JOIN $RASTER_TABLE r
  ON ST_Intersects(ST_Transform(w.the_geom, ST_SRID(r.rast)), r.rast)
  GROUP BY w.gid
)
UPDATE ways
SET $COLUMN_NAME = shade_values.mean_shade
FROM shade_values
WHERE ways.gid = shade_values.way_id;
EOF

echo "Shade index successfully added to the database."
