#!/bin/bash

DB_NAME="tokyo_routing"
DB_USER="postgres"

SQL="
CREATE OR REPLACE FUNCTION generate_route(
    weight_length DOUBLE PRECISION,
    weight_green_index DOUBLE PRECISION,
    source_node INTEGER,
    target_node INTEGER,
    output_file TEXT
) RETURNS VOID AS \$$
BEGIN
  -- Create the dynamic view
  EXECUTE '
  CREATE OR REPLACE VIEW dynamic_route AS
  WITH norm_tables AS (
    SELECT
      gid,
      the_geom,
      source,
      target,
      length,
      green_index,
      -- Normalize length
      (length - MIN(length) OVER()) / (MAX(length) OVER() - MIN(length) OVER()) AS norm_length,
      -- Normalize green_index (reversed)
      1 - ((green_index - MIN(green_index) OVER()) / (MAX(green_index) OVER() - MIN(green_index) OVER())) AS inverse_green_index
    FROM ways
  ),
  composite_cost_table AS (
    SELECT
      gid,
      the_geom,
      source,
      target,
      norm_length,
      inverse_green_index,
      (' || weight_length || ' * norm_length) + (' || weight_green_index || ' * inverse_green_index) AS composite_cost
    FROM norm_tables
  )
  SELECT
    gid,
    the_geom,
    source,
    target,
    composite_cost
  FROM composite_cost_table
  WHERE composite_cost IS NOT NULL;
  ';

  -- Generate the route and store in a temporary table
  EXECUTE '
  CREATE TEMP TABLE temp_route AS
  WITH route AS (
    SELECT
      seq,
      path.node AS source,
      path.edge AS target,
      path.cost,
      w.the_geom AS geom
    FROM pgr_dijkstra(
      ''
        SELECT gid AS id,
               source,
               target,
               composite_cost AS cost
        FROM dynamic_route
      '',
      ' || source_node || ', -- Source node
      ' || target_node || ', -- Target node
      directed := false
    ) AS path
    JOIN dynamic_route w ON path.edge = w.gid
  )
  SELECT ST_AsGeoJSON(ST_Collect(geom)) AS route_geojson
  FROM route;
  ';

  -- Output to file
  EXECUTE 'COPY (SELECT route_geojson FROM temp_route) TO ''' || output_file || '''';
END;
\$$ LANGUAGE plpgsql;
"

psql -U "$DB_USER" -d "$DB_NAME" -c "$SQL"

echo "Function generate_route has been added to the database $DB_NAME."