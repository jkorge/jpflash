import json
from math import isnan
from random import randint

from flask import Flask

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

def _random(df):
    try:
        res = df.iloc[randint(0, len(df))].to_dict()
    except:
        res = dict()
    finally:
        for k,v in res.items():
            if isinstance(v, float) and isnan(v):
                res[k] = None
        return res

from .kanji import bp as kbp
from .radicals import bp as rbp

app.register_blueprint(kbp)
app.register_blueprint(rbp)
