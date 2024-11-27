import logging

from sqlalchemy import text


_logger = logging.getLogger(__name__)

MAX_RETRY_COUNT = 5


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

    for retry_count in range(MAX_RETRY_COUNT):
        try:
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

            if not row:
                raise Exception("No route found.")
        except Exception as e:
            _logger.error(f"Failed to get routes. {e=}")
            if retry_count >= MAX_RETRY_COUNT:
                raise e

    route_info: str = row[0]
    landmarks_info: str | None = row[1] if len(row) > 1 else None

    return route_info, landmarks_info
