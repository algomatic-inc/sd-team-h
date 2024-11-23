import json
import os
from typing import Any

import google.generativeai as genai


# configure google api
# TODO: set the API key when executing the script.
genai.configure(api_key=os.getenv('GOOGLE_API_KEY', ''))
model = genai.GenerativeModel('gemini-pro')


def add_explanation(additional_info: str, data_geojson_str: str) -> str:
    # generate prompt
    prompt: str = (
        "次のJSONデータを読み込んで、そのデータが示すエリア毎の場所と特徴を説明する文章を生成してください。\n"
        "説明の内容は下記の内容を考慮してください。\n"
        f"・{additional_info}の観点を重視してください。"
        "・エリア毎に、そのエリアの特徴を元にタイトルを付けてください。\n"
        "・エリア毎に、そのエリアの見どころとその見どころの特徴を3つ挙げてください。\n"
        "説明の出力フォーマットは下記の通りです。\n"
        "・エリアのタイトル\n"
        "・そのエリア全体の特徴\n"
        "・そのエリアの見どころ\n"
    )

    response = model.generate_content(prompt + data_geojson_str)
    return response.text

if __name__ == "__main__":
    # read .geojson file
    with open('route.geojson', 'r') as f:
        data_geojson: Any = json.load(f)

    # parse data to string
    data_geojson_str: str = json.dumps(data_geojson)

    res = add_explanation("緑が多い", data_geojson_str)
    print(res)
