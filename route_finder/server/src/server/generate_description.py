import logging
import textwrap
from typing import Any

from models import get_model


_logger = logging.getLogger(__name__)


def generate_description(query: str, weights: dict[str, float]) -> str:
    _logger.error(f'[{__name__}] started.')

    description: str = ''

    prompt: str = textwrap.dedent(
        f"""
        あなたはユーザが入力した希望に応じたルートを提示します。
        「ユーザの入力」と「考え方」をもとに、ルートを選ぶあたって何を重要視したことのか説明してください。
        **説明は100文字以上、150文字以内**
        # ユーザの入力: {query}
        # 考え方: {weights}
        """
    )

    try:
        response: Any = get_model().generate_content(prompt)
        description = response.text
    except Exception as e:
        _logger.error(f'[{__name__}] failed to generate description. {e=}')

    _logger.error(f'[{__name__}] completed.')
    return description
