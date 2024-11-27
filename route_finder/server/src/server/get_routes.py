from sqlalchemy import text


def get_routes(
    db,
    start_lat: float,
    start_lon: float,
    end_lat: float,
    end_lon: float,
    weight_length: float,
    weight_green_index: float,
    weight_water_index: float,
    weight_shade_index: float,
    weight_slope_index: float,
    weight_road_safety: float,
    weight_isolation: float,
    weight_landmarks: float,
    landmarks: list[str],
) -> tuple[str, str | None]:
    sql = text(
        """
        SELECT * FROM generate_route(
            :weight_length,
            :weight_green_index,
            :weight_water_index,
            :weight_shade_index,
            :weight_slope_index,
            :weight_road_safety,
            :weight_isolation,
            :weight_landmarks,
            :landmarks,
            :start_lat,
            :start_lon,
            :end_lat,
            :end_lon
        )
        """
    )

    response = db.session.execute(
        sql,
        {
            "weight_length": weight_length,
            "weight_green_index": weight_green_index,
            "weight_water_index": weight_water_index,
            "weight_shade_index": weight_shade_index,
            "weight_slope_index": weight_slope_index,
            "weight_road_safety": weight_road_safety,
            "weight_isolation": weight_isolation,
            "weight_landmarks": weight_landmarks,
            "landmarks": landmarks,
            "start_lat": start_lat,
            "start_lon": start_lon,
            "end_lat": end_lat,
            "end_lon": end_lon,
        },
    )

    row = response.fetchone()
    route_info: str = row[0]
    landmarks_info: str | None = row[1] if len(row) > 1 else None

    return route_info, landmarks_info
