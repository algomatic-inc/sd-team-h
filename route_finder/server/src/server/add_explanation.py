import json
import logging
import textwrap
from typing import Any

from .model import get_model


_logger = logging.getLogger(__name__)

MAX_RETRY_COUNT = 5


def add_explanation(
    preference: str, routes_info: str, landmarks_info: str | None
) -> dict[str, Any]:
    _logger.error(f'[{__name__}] started.')

    prompt: str = textwrap.dedent(
        f"""
        入力値のデータを読み込んで、そのデータが示すルートの特徴を説明する文章を生成してください。
        # 入力値のデータに関する情報
        - 入力値 1: ルートの情報を示す MultiLineString 型の GeoJSON データ
        - 入力値 2: 見どころの情報を示す Point 型の GeoJSON データ
        # 出力する項目
        - title
        - description
        - details
        # 出力する項目に関する情報
        - title: ルート全体の特徴を表現するルートのタイトル
        - description: ルート全体の特徴の説明文
        - details: ルート中に存在する '{preference}' の観点に適した見どころの場所の名前 (name), その場所の特徴の説明文 (description), 緯度 (latitude), 経度 (longitude)
        # ルール
        - title, description は入力値 1 のルートデータを元に生成すること。
        - details は入力値 2 の見どころデータを元に生成すること。ただし、入力値 2 の見どころデータが存在しない場合は入力値 1 のルートデータを元に生成すること。
        - details に含める場所の数は最大 3 とすること。
        - 出力は次の出力例のように JSON 形式で出力すること。
        # 出力例
        例 1. {{
            "title": "緑を感じる散歩ルート",
            "description": "緑が多く、自然との触れ合いを感じるルートです。人通や交通量が少なく、静かな時間を過ごすことができます。リフレッシュには最適です。",
            "details": [
                {{"name": "昭和記念公園", "description": "緑が多く、自然との触れ合いを感じる公園です。", "latitude": 35.681236, "longitude": 139.767125}},
                {{"name": "皇居外苑", "description": "緑が多く、自然との触れ合いを感じる小道です。", "latitude": 35.681236, "longitude": 139.767125}},
                {{"name": "六義園", "description": "緑が多く、自然との触れ合いを感じる広場です。", "latitude": 35.681236, "longitude": 139.767125}},
            ]
        }}
        例 2. {{
            "title": "浅草寺までの最短ルート",
            "description": "浅草寺までの最短ルートです。道中、狭く暗い道もありますので、利用する場合は注意してください。",
            "details": [
                {{"name": "浅草寺", "description": "歴史的な寺院です。常に多くの観光客で賑わっています。", "latitude": 35.681236, "longitude": 139.767125}},
            ]
        }}
        例 3. {{
            "title": "川口駅までの最も楽しいルート",
            "description": "川口駅までの最も楽しいルートです。道中には多くの飲食店やカフェがあり、おすすめです。",
            "details": [
                {{"name": "川口駅", "description": "駅前には多くの飲食店やカフェがあり、おすすめです。", "latitude": 35.681236, "longitude": 139.767125}},
                {{"name": "川口駅前商店街", "description": "様々な種類のお店が並び、飽きることなく楽しめます。", "latitude": 35.681236, "longitude": 139.767125}},
            ]
        }}
        # 入力値 1: ルートデータ
        {routes_info}
        # 入力値 2: 見どころデータ
        {landmarks_info}
        """
    )

    for retry_count in range(MAX_RETRY_COUNT):
        try:
            response: Any = get_model().generate_content(prompt)
            explained_info: dict[str, Any] = json.loads(response.text)

            if (
                "title" not in explained_info or
                "description" not in explained_info or
                "details" not in explained_info
            ):
                raise Exception("Invalid explanation format.")
        except Exception as e:
            _logger.error(f"[{__name__}] failed to add explanation. {e=}")

            if retry_count < MAX_RETRY_COUNT:
                _logger.error(f"[{__name__}] retry: {retry_count + 1}.")
                continue
            else:
                raise e

    _logger.error(f'[{__name__}] completed.')
    return explained_info
