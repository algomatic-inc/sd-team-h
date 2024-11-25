#!/bin/bash

DB_NAME="tokyo_routing"
DB_USER="postgres"
DB_PASSWORD="postgres"
CITY="tokyo"
BBOX="35.7517,139.64131,35.8247,139.7316"

createdb $DB_NAME

psql -U $DB_USER -d $DB_NAME << EOF
CREATE EXTENSION postgis;
CREATE EXTENSION hstore;
CREATE EXTENSION pgrouting;
CREATE EXTENSION postgis_raster;
EOF

osm2pgrouting \
    -f "${CITY}.osm" \
    -c "mapconfig_for_pedestrian.xml" \
    -d $DB_NAME \
    -U $DB_USER \
    -W $DB_PASSWORD \
    --clean

STYLE_FILE="default.style"

osm2pgsql -d $DB_NAME \
          --create \
          --slim \
          -S "$STYLE_FILE" \
          "${CITY}.osm"

psql -U $DB_USER -d $DB_NAME << EOF
-- Create landmarks table
CREATE TABLE landmarks (
    id SERIAL PRIMARY KEY,
    name TEXT,
    type TEXT,
    geom GEOMETRY(Point, 4326)
);

-- Populate landmarks table
INSERT INTO landmarks (name, type, geom)
SELECT
    name,
    COALESCE(tourism, amenity, historic, shop, 'unknown') AS type,
    ST_Transform(way, 4326)
FROM planet_osm_point
WHERE tourism IS NOT NULL OR amenity IS NOT NULL OR historic IS NOT NULL OR shop IS NOT NULL;

-- Add the safety_index column to the ways table
ALTER TABLE ways ADD COLUMN IF NOT EXISTS safety_index DOUBLE PRECISION;

-- Calculate safety_index based on tag_id and number of crossings
WITH crossings AS (
    SELECT
        a.gid AS way_gid,
        COUNT(b.gid) AS crossing_count
    FROM ways a
    JOIN ways b
    ON ST_Intersects(a.the_geom, b.the_geom) -- Find intersections
    AND NOT ST_Touches(a.the_geom, b.the_geom) -- Avoid shared boundaries
    WHERE a.gid <> b.gid -- Exclude self-intersections
    GROUP BY a.gid
)
UPDATE ways
SET safety_index = (
    COALESCE(tag_id, 0) * 10 -- Scale tag_id to prioritize higher values
    / NULLIF(crossings.crossing_count, 1) -- Penalize based on crossings, avoid division by zero
)
FROM crossings
WHERE ways.gid = crossings.way_gid;

-- Assign a default safety_index for ways with no crossings
UPDATE ways
SET safety_index = COALESCE(tag_id, 0) * 10
WHERE safety_index IS NULL;
EOF

echo "Database setup complete!"