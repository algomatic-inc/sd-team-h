#!/bin/bash

DB_NAME="tokyo_routing"
DB_USER="postgres"
DB_PASSWORD="postgres"
CITY="tokyo"
BBOX="35.7517,139.64131,35.8247,139.7316"

createdb $DB_NAME

psql -U $DB_USER -d $DB_NAME << EOF
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_raster;
CREATE EXTENSION hstore;
CREATE EXTENSION pgrouting;
EOF

# todo: from overpass is not good. There seems to be something wrong with the data. Downlaod from geofabrik and convert to .osm
#wget --progress=dot:mega -O "${CITY}.osm" "http://overpass-api.de/api/interpreter?data=[out:xml];(node(${BBOX});way(${BBOX});relation(${BBOX}););out meta;"

osm2pgrouting \
    -f "${CITY}.osm" \
    -c "mapconfig_for_pedestrian.xml" \
    -d $DB_NAME \
    -U $DB_USER \
    -W $DB_PASSWORD \
    --clean

echo "Database setup complete!"
