import logging
import textwrap

from landmarks import LAMDMARKS_LIST
from server.model import get_model


_logger = logging.getLogger(__name__)


def extract_landmarks(preference: str) -> list[str]:
    prompt: str = textwrap.dedent(
        f"""
        入力文の内容に関連するワードをワードリストから抽出してください。
        # ルール
        - ワードはワードリストから選ぶこと。
        - 抽出するワードの数は最大 10 とすること。
        - 出力は次の出力例のようにカンマ区切りで出力すること。
        # 出力例
        例 1. museum, library, hospital
        例 2. outdoor, photo, bench
        例 3. restaurant, bar, cafe
        # ワードリスト
        {LAMDMARKS_LIST}
        # 入力文
        {preference}
        """
    )

    landmarks: list[str] = []
    try:
        response = get_model().generate_content(prompt)
        landmarks = response.text.split(",")

        # return only landmarks in the landmarks list
        return [landmark for landmark in landmarks if landmark in LAMDMARKS_LIST]
    except Exception as e:
        _logger.error(f"Failed to extract landmarks. {e=}")
        return landmarks
