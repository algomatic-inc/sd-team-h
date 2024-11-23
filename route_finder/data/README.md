# Data

```bash
psql -U postgres -d tokyo_routing -c "
SELECT generate_route(0, 1, 3770, 2820, '/Users/iosefa/repos/sd-team-some-ideas/route_finder/data/short_route.geojson');
"
```