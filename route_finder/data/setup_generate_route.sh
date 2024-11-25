#!/bin/bash

DB_NAME="tokyo_routing"
DB_USER="postgres"

SQL="
CREATE OR REPLACE FUNCTION generate_route(
    weight_length DOUBLE PRECISION,
    weight_green_index DOUBLE PRECISION,
    weight_water_index DOUBLE PRECISION,
    weight_shade_index DOUBLE PRECISION,
    weight_slope_index DOUBLE PRECISION,
    source_node INTEGER,
    target_node INTEGER,
    output_file TEXT
) RETURNS VOID AS \$$
BEGIN
  -- Create the dynamic view
  EXECUTE '
  CREATE OR REPLACE VIEW dynamic_route AS
  WITH adjusted_values AS (
    SELECT
      gid,
      the_geom,
      source,
      target,
      length,
      green_index,
      water_index,
      shade_index,
      slope_index,
      -- Adjust green_index and water_index
      (green_index + 0.01) AS adjusted_green_index,
      (water_index + 0.01) AS adjusted_water_index
    FROM ways
  ),
  raw_inverse_values AS (
    SELECT
      gid,
      the_geom,
      source,
      target,
      length,
      adjusted_green_index,
      adjusted_water_index,
      shade_index,
      slope_index,
      -- Compute raw inverse values
      MAX(adjusted_green_index) OVER() - adjusted_green_index AS raw_inverse_green_index,
      MAX(adjusted_water_index) OVER() - adjusted_water_index AS raw_inverse_water_index
    FROM adjusted_values
  ),
  norm_tables AS (
    SELECT
      gid,
      the_geom,
      source,
      target,
      length,
      raw_inverse_green_index,
      raw_inverse_water_index,
      shade_index,
      slope_index,
      -- Normalize length
      (length - MIN(length) OVER()) / NULLIF((MAX(length) OVER() - MIN(length) OVER()), 0) AS norm_length,
      -- Normalize green_index
      (raw_inverse_green_index - MIN(raw_inverse_green_index) OVER()) /
      NULLIF((MAX(raw_inverse_green_index) OVER() - MIN(raw_inverse_green_index) OVER()), 0) AS inverse_green_index,
      -- Normalize water_index
      (raw_inverse_water_index - MIN(raw_inverse_water_index) OVER()) /
      NULLIF((MAX(raw_inverse_water_index) OVER() - MIN(raw_inverse_water_index) OVER()), 0) AS inverse_water_index,
      -- Normalize shade_index
      (shade_index - MIN(shade_index) OVER()) / NULLIF((MAX(shade_index) OVER() - MIN(shade_index) OVER()), 0) AS norm_shade_index,
      -- Normalize slope_index
      (slope_index - MIN(slope_index) OVER()) / NULLIF((MAX(slope_index) OVER() - MIN(slope_index) OVER()), 0) AS norm_slope_index
    FROM raw_inverse_values
  ),
  composite_cost_table AS (
    SELECT
      gid,
      the_geom,
      source,
      target,
      norm_length,
      inverse_green_index,
      inverse_water_index,
      norm_shade_index,
      norm_slope_index,
      (' || weight_length || ' * norm_length) +
      (' || weight_green_index || ' * inverse_green_index) +
      (' || weight_water_index || ' * inverse_water_index) +
      (' || weight_shade_index || ' * norm_shade_index) +
      (' || weight_slope_index || ' * norm_slope_index)
    AS composite_cost
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
      ' || source_node || ',
      ' || target_node || ',
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