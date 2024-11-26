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
    weight_road_safety DOUBLE PRECISION,
    weight_isolation DOUBLE PRECISION,
    weight_landmarks DOUBLE PRECISION,
    landmark_types TEXT[],
    start_lat DOUBLE PRECISION,
    start_lon DOUBLE PRECISION,
    end_lat DOUBLE PRECISION,
    end_lon DOUBLE PRECISION
) RETURNS TABLE(route_geojson TEXT, landmarks_geojson TEXT) AS \$\$
DECLARE
    source_node INTEGER;
    target_node INTEGER;
    route_geom GEOMETRY;
    route_buffer GEOMETRY;
BEGIN
  -- Find the closest source node
  SELECT id INTO source_node
  FROM ways_vertices_pgr
  ORDER BY ST_Distance(the_geom, ST_SetSRID(ST_MakePoint(start_lon, start_lat), 4326)) ASC
  LIMIT 1;

  -- Find the closest target node
  SELECT id INTO target_node
  FROM ways_vertices_pgr
  ORDER BY ST_Distance(the_geom, ST_SetSRID(ST_MakePoint(end_lon, end_lat), 4326)) ASC
  LIMIT 1;

  -- Create a temporary table for landmark-based costs
  DROP TABLE IF EXISTS temp_ways_cost;
  CREATE TEMP TABLE temp_ways_cost (
      way_id INTEGER PRIMARY KEY,
      cost DOUBLE PRECISION
  );

  INSERT INTO temp_ways_cost (way_id, cost)
  WITH landmark_counts AS (
      SELECT
          w.gid AS way_id,
          COUNT(l.id) AS landmark_count
      FROM
          ways w
      LEFT JOIN
          landmarks l
      ON
          l.type = ANY(landmark_types) AND
          ST_DWithin(ST_Transform(w.the_geom, 3857), ST_Transform(l.geom, 3857), 100)
      GROUP BY
          w.gid
  )
  SELECT
      way_id,
      CASE
          WHEN landmark_count > 0 THEN 1.0 / landmark_count
          ELSE 1e6
      END AS cost
  FROM
      landmark_counts;

  -- Create the dynamic view with weight parameters
  EXECUTE format('
  CREATE OR REPLACE VIEW dynamic_route AS
  WITH adjusted_values AS (
    SELECT
      w.gid,
      w.the_geom,
      w.source,
      w.target,
      w.length,
      w.green_index,
      w.water_index,
      w.shade_index,
      w.slope_index,
      w.safety_index,
      w.isolation_index,
      COALESCE(tc.cost, 1e6) AS landmark_cost,
      -- Adjust green_index and water_index
      (w.green_index + 0.01) AS adjusted_green_index,
      (w.water_index + 0.01) AS adjusted_water_index
    FROM ways w
    LEFT JOIN temp_ways_cost tc ON w.gid = tc.way_id
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
      safety_index,
      isolation_index,
      landmark_cost,
      -- Compute raw inverse values for green, water, and isolation
      MAX(adjusted_green_index) OVER() - adjusted_green_index AS raw_inverse_green_index,
      MAX(adjusted_water_index) OVER() - adjusted_water_index AS raw_inverse_water_index,
      MAX(isolation_index) OVER() - isolation_index AS raw_inverse_isolation
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
      safety_index,
      raw_inverse_isolation,
      landmark_cost,
      -- Normalize length
      COALESCE(
        (length - MIN(length) OVER()) / NULLIF((MAX(length) OVER() - MIN(length) OVER()), 0),
        0
      ) AS norm_length,
      -- Normalize green_index
      COALESCE(
        (raw_inverse_green_index - MIN(raw_inverse_green_index) OVER()) /
        NULLIF((MAX(raw_inverse_green_index) OVER() - MIN(raw_inverse_green_index) OVER()), 0),
        0
      ) AS inverse_green_index,
      -- Normalize water_index
      COALESCE(
        (raw_inverse_water_index - MIN(raw_inverse_water_index) OVER()) /
        NULLIF((MAX(raw_inverse_water_index) OVER() - MIN(raw_inverse_water_index) OVER()), 0),
        0
      ) AS inverse_water_index,
      -- Normalize shade_index
      COALESCE(
        (shade_index - MIN(shade_index) OVER()) /
        NULLIF((MAX(shade_index) OVER() - MIN(shade_index) OVER()), 0),
        0
      ) AS norm_shade_index,
      -- Normalize slope_index
      COALESCE(
        (slope_index - MIN(slope_index) OVER()) /
        NULLIF((MAX(slope_index) OVER() - MIN(slope_index) OVER()), 0),
        0
      ) AS norm_slope_index,
      -- Normalize safety_index
      COALESCE(
        (safety_index - MIN(safety_index) OVER()) /
        NULLIF((MAX(safety_index) OVER() - MIN(safety_index) OVER()), 0),
        0
      ) AS norm_safety_index,
      -- Normalize isolation_index
      COALESCE(
        (raw_inverse_isolation - MIN(raw_inverse_isolation) OVER()) /
        NULLIF((MAX(raw_inverse_isolation) OVER() - MIN(raw_inverse_isolation) OVER()), 0),
        0
      ) AS inverse_isolation_index,
      -- Normalize landmark cost
      COALESCE(
        (landmark_cost - MIN(landmark_cost) OVER()) /
        NULLIF((MAX(landmark_cost) OVER() - MIN(landmark_cost) OVER()), 0),
        0
      ) AS norm_landmark_cost
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
      norm_safety_index,
      inverse_isolation_index,
      norm_landmark_cost,
      (%s * norm_length) +
      (%s * inverse_green_index) +
      (%s * inverse_water_index) +
      (%s * norm_shade_index) +
      (%s * norm_slope_index) +
      (%s * norm_safety_index) +
      (%s * inverse_isolation_index) +
      (%s * norm_landmark_cost)
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
  WHERE composite_cost IS NOT NULL;',
  weight_length::TEXT, weight_green_index::TEXT, weight_water_index::TEXT, weight_shade_index::TEXT,
  weight_slope_index::TEXT, weight_road_safety::TEXT, weight_isolation::TEXT, weight_landmarks::TEXT);

  -- Generate the route and store in a temporary table
  EXECUTE format('
  CREATE TEMP TABLE temp_route AS
  WITH route AS (
    SELECT
      seq,
      path.node AS node,
      path.edge AS edge,
      path.cost,
      w.the_geom AS geom
    FROM pgr_dijkstra(
      %L,
      %s,
      %s,
      directed := false
    ) AS path
    JOIN dynamic_route w ON path.edge = w.gid
  )
  SELECT geom FROM route;',
  'SELECT gid AS id, source, target, composite_cost AS cost FROM dynamic_route',
  source_node::TEXT, target_node::TEXT);

  -- Check if temp_route has data
  IF EXISTS (SELECT 1 FROM temp_route) THEN
    -- Collect the route geometry
    SELECT ST_AsGeoJSON(ST_Collect(geom)) INTO route_geojson FROM temp_route;

    -- Create a buffer around the route (e.g., 100 meters)
    SELECT ST_Buffer(ST_Transform(ST_Collect(geom), 3857), 100) INTO route_buffer FROM temp_route;

    -- Select landmarks within the buffer
    CREATE TEMP TABLE temp_landmarks AS
    SELECT l.*
    FROM landmarks l
    WHERE l.type = ANY(landmark_types)
    AND ST_Intersects(
        ST_Transform(l.geom, 3857),
        route_buffer
    );

    -- Collect landmarks into GeoJSON
    SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(
            json_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(l.geom)::json,
                'properties', to_jsonb(l) - 'geom'
            )
        )
    ) INTO landmarks_geojson
    FROM temp_landmarks l;

  ELSE
    RAISE NOTICE 'No route found between the specified points.';
    route_geojson := NULL;
    landmarks_geojson := NULL;
  END IF;

  RETURN QUERY SELECT route_geojson, landmarks_geojson;

END;
\$\$ LANGUAGE plpgsql;
"

# Execute the SQL to create the function
psql -U $DB_USER -d $DB_NAME -c "$SQL"