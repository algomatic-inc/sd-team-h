import json
import logging
import textwrap
from typing import Any

from constants import MAX_RETRY_COUNT
from models import get_model


_logger = logging.getLogger(__name__)


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
        - 入力値 3: ルートと見どころの観点を示す文字列
        # 出力する項目
        - title
        - summary
        - details
        # 出力する項目に関する情報
        - title: ルート全体の特徴を表現するルートのタイトル
        - summary: ルート全体の特徴の説明文
        - details: 入力値 3 の観点に適した見どころの場所の名前 (name), その場所の特徴の説明文 (description), 緯度 (latitude), 経度 (longitude)
        # ルール
        - 生成する全ての情報は入力値 3 の観点に適したものであること。
        - title, summary は入力値 1 のルートデータを元に生成すること。
        - summary の文字数は 150 文字以上 200 文字以下とすること。
        - details は入力値 2 の見どころデータを元に生成すること。ただし、入力値 2 が不足している場合は新規に生成すること。
        - details に含める場所の数は最大 3 とすること。
        - details の各要素の description の文字数は 50 文字以上 100 文字以下とすること。
        - 出力は次の出力例のように JSON 形式で出力すること。
        # 出力例
        例 1. {{
            "title": "緑を感じる散歩ルート",
            "summary": "緑が多く、自然との触れ合いを感じるルートです。人通や交通量が少なく、静かな時間を過ごすことができます。喧騒から少し離れ、自然の中で深呼吸しながら歩くことで、心身のリフレッシュにぴったりのスポットが揃っています。",
            "details": [
                {{"name": "代々木公園", "description": "木々のトンネルをくぐり抜けながら静かな空気を楽しめます。", "latitude": 35.681236, "longitude": 139.767125}},
                {{"name": "皇居外苑", "description": "四季折々の景色が広がり、春には桜、秋には紅葉が見事です。", "latitude": 35.681236, "longitude": 139.767125}},
                {{"name": "井の頭恩賜公園", "description": "広々とした緑地と水辺の景色が特徴的で、リラックスした時間を提供してくれます。", "latitude": 35.681236, "longitude": 139.767125}}
            ]
        }}
        例 2. {{
            "title": "東京駅から浅草寺までの最短ルート",
            "summary": "最短ルートでは、東京駅から日本橋を経由し、昭和通りを北上します。この道は直線的でわかりやすく、途中で隅田川を渡る際には川沿いの景色を楽しむこともできます。さらに、浅草エリアに近づくと下町の風情ある街並みが広がり、歩くだけで歴史を感じられるのも魅力です。徒歩ならではのペースで、東京の多様な表情を感じながら浅草寺を目指すのは、観光や散策としても楽しめる充実した体験になるでしょう。",
            "details": [
                {{"name": "隅田川", "description": "東京を流れる主要な川で、桜並木や屋形船など四季折々の風景が楽しめる観光名所です。", "latitude": 35.681236, "longitude": 139.767125}},
                {{"name": "浅草", "description": "東京の下町情緒あふれる観光地で、浅草寺や雷門、仲見世通りなど歴史と文化を感じるスポットが魅力です。", "latitude": 35.681236, "longitude": 139.767125}},
                {{"name": "浅草寺", "description": "東京最古の寺院で、雷門や五重塔などが有名。年間を通じて多くの参拝者が訪れる人気の観光スポットです。", "latitude": 35.681236, "longitude": 139.767125}}
            ]
        }}
        # 入力値 1: ルートデータ
        {routes_info}
        # 入力値 2: 見どころデータ
        {landmarks_info}
        # 入力値 3: 観点
        {preference}
        """
    )

    for retry_count in range(MAX_RETRY_COUNT):
        try:
            response: Any = get_model().generate_content(prompt)
            explained_info: dict[str, Any] = json.loads(response.text)

            if (
                "title" not in explained_info or
                "summary" not in explained_info or
                "details" not in explained_info
            ):
                raise Exception("Invalid explanation format.")
        except Exception as e:
            _logger.error(f"[{__name__}] failed to add explanation. {response.text} {e=}")

            if retry_count > MAX_RETRY_COUNT:
                raise e

            _logger.error(f"[{__name__}] retry: {retry_count + 1}.")

    _logger.error(f'[{__name__}] completed.')
    return explained_info
