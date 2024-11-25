# Data

```sql
CREATE OR REPLACE FUNCTION generate_route(
    weight_length DOUBLE PRECISION,
    weight_green_index DOUBLE PRECISION,
    weight_water_index DOUBLE PRECISION,
    source_node INTEGER,
    target_node INTEGER,
    output_file TEXT
) RETURNS VOID
```
- `weight_length` (DOUBLE PRECISION): The weight assigned to the route length.
- `weight_green_index` (DOUBLE PRECISION): The weight assigned to the green index (NDVI).
- `weight_water_index` (DOUBLE PRECISION): The weight assigned to the water index (NDWI).
- `source_node` (INTEGER): The ID of the source node.
- `target_node` (INTEGER): The ID of the target node.
- `output_file` (TEXT): The path to the output GeoJSON file where the route will be saved.

Note:
- **Range**: Weights should be between `0` and `1` inclusive.
- **Sum**: The sum of `weight_length`, `weight_green_index`, and `weight_water_index` should be `1`.
- **Effect**:
    - A weight of `0` means that the corresponding cost is not included in the calculation.
    - A weight of `1` means that the corresponding cost is the only cost to consider.
    - Weights closer to `1` mean the corresponding variable is more heavily considered in the route calculation.

Example: If `weight_length` is `0.75`, `weight_green_index` is `0.25`, and `weight_water_index` is `0`, then the route will primarily consider the length to be the most costly factor. Minimizing this cost function will result in routes that are both short and green but with a greater emphasis on minimizing the route length. Since the water index is not considered (weight is `0`), it is ignored in this calculation.

Example:
```sql
SELECT generate_route(
  0.333,    -- weight for length
  0.333,    -- weight for green index
  0.333,    -- weight for water index
  3770,     -- source node ID
  2820,     -- target node ID
  '/Users/iosefa/repos/sd-team-some-ideas/route_finder/data/short_route.geojson'
);
```

A note on the weights:
- 0 will remove that variable from the cost matrix. i.e. it will not consider that cost in the routing.
- 

```bash
psql -U postgres -d tokyo_routing -c "
SELECT generate_route(
  0.75, 
  0.25,
  0,
  3770, 
  2820, 
  '/Users/iosefa/repos/sd-team-some-ideas/route_finder/data/short_route.geojson'
);
"
```