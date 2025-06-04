import json
from collections.abc import Callable
from math import isnan
from random import randint

import pandas as pd
import numpy as np

from flask import Flask

__all__ = ['app']

app = Flask(__name__)

def _take_care_of_nan(x: list[dict]):
    for y in x:
        for k,v in y.items():
            if isinstance(v, float) and isnan(v):
                y[k] = None

def _get(df, col, val):
    try:
        res = df.loc[df[col] == val].iloc[0].to_dict()
    except:
        res = dict()
    finally:
        for k,v in res.items():
            if isinstance(v, float) and isnan(v):
                res[k] = None
        return res

from .kanji import bp as kbp

app.register_blueprint(kbp)
