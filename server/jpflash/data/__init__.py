import ast
from importlib.resources import open_text, path

import pandas as pd

__all__ = ['kanji', 'radicals']

kanji = pd.read_csv(open_text(__name__, 'ka_data.csv'), converters={'examples': ast.literal_eval})
radicals = pd.read_csv(open_text(__name__, 'japanese-radicals.csv'))
anim_dir = path(__name__, 'kanji_webm')