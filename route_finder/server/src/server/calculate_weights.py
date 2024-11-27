import logging
from typing import Any

from constants import WEIGHT_LANDMARKS
from server.model import get_model


_logger = logging.getLogger(__name__)


def calc_weights(query: str) -> dict[str, float]:
    _logger.error(f'[{__name__}] started.')

    avg_weight: float = (1 - WEIGHT_LANDMARKS) / 7
    weights_calculated: dict[str, float] = {
        "weight_length": avg_weight,
        "weight_green_index": avg_weight,
        "weight_water_index": avg_weight,
        "weight_shade_index": avg_weight,
        "weight_slope_index": avg_weight,
        "weight_road_safety": avg_weight,
        "weight_isolation": avg_weight,
    }

    prompt: str = (
        "# 目的\n"
        "あなたの気分や希望するルートの特徴を教えてください。それに応じて以下の7つの要素をどの程度重視するかを計算します。\n"
        "**weight_length, weight_green_index, weight_water_index, weight_shade_index, weight_slope_index, weight_road_safety, weight_isolation のみ出力する**\n\n"
        "# 情報\n"
        "weight_length (DOUBLE PRECISION): 目的地に最短距離または最短時間で到着することを優先します。\n"
        "weight_green_index (DOUBLE PRECISION): 公園や並木道などの緑地が多いルートを優先します。\n"
        "weight_water_index (DOUBLE PRECISION): 川や湖など水辺の近くを通るルートを優先します。\n"
        "weight_shade_index (DOUBLE PRECISION): 木陰などの涼しいエリアを通るルートを優先します。\n"
        "weight_slope_index (DOUBLE PRECISION): 傾斜の少ない、歩きやすいルートを優先します。\n"
        "weight_road_safety (DOUBLE PRECISION): 交通量が少なく人通が多いなどの安全な道路を優先します。\n"
        "weight_isolation (DOUBLE PRECISION): 人里離れた、静かで落ち着いた場所を優先します。\n\n"
        "必要な情報\n"
        "「最短距離だけを考えたい」「景色も楽しみたい」など、今の気分に合った希望を教えてください。\n"
        "# ルール、制約事項\n"
        f"- 7 つの要素の重みはそれぞれ 0 - {1 - WEIGHT_LANDMARKS} の範囲 で計算され、合計は {1 - WEIGHT_LANDMARKS} になります。\n"
        "- 値が 0 の場合、その要素は考慮されません。\n"
        f"- 値が {1 - WEIGHT_LANDMARKS} の場合、その要素のみを完全に重視します。\n"
        "# 出力例\n"
        f"1. weight_length={avg_weight}, weight_green_index={avg_weight}, weight_water_index={avg_weight}, weight_shade_index={avg_weight}, weight_slope_index={avg_weight}, weight_road_safety={avg_weight}, weight_isolation={avg_weight}\n"
        f"2. weight_length={avg_weight * 2}, weight_green_index={avg_weight * 2}, weight_water_index=0.0, weight_shade_index=0.0, weight_slope_index=0.0, weight_road_safety={avg_weight * 3}, weight_isolation=0.0\n"
        "# 入力値\n"
        f"{query}"
    )

    try:
        response: Any = get_model().generate_content(prompt)
        text: str = response.text

        # Parse weights from response
        weights: dict[str, float] = {}
        for part in text.split(','):
            key, value = part.strip().split('=')
            weights[key.strip()] = float(value)

        # error if sum of weights is not 1 - WEIGHT_LANDMARKS
        if sum(weights.values()) != 1 - WEIGHT_LANDMARKS:
            raise Exception(f"Sum of weights is not {1 - WEIGHT_LANDMARKS}")

        # error if any key in weights is not in weights_calculated
        for key in weights:
            if key in weights_calculated:
                weights_calculated[key] = weights[key]
            else:
                raise Exception(f"Invalid weight key: {key}")
    except Exception as e:
        _logger.error(f"[{__name__}] failed to calculate weights. {e=}")

    _logger.error(f'[{__name__}] completed.')
    return weights_calculated
