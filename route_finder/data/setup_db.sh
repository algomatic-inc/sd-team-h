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

#wget -O "${CITY}.osm.pbf" "https://download.geofabrik.de/asia/japan/kanto-latest.osm.pbf"
# todo: add crop function with osmium and convert to .osm

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
CREATE TABLE landmarks (
    id SERIAL PRIMARY KEY,
    name TEXT,
    type TEXT,
    geom GEOMETRY(Point, 4326)
);

INSERT INTO landmarks (name, type, geom)
SELECT
    name,
    COALESCE(tourism, amenity, historic, shop, 'unknown') AS type,
    ST_Transform(way, 4326)
FROM planet_osm_point
WHERE tourism IS NOT NULL OR amenity IS NOT NULL OR historic IS NOT NULL OR shop IS NOT NULL;
EOF

echo "Database setup complete!"