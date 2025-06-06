import os
import re
from glob import glob

import pandas as pd
import numpy as np
from flask import Blueprint, send_file

from jpflash import _get, _take_care_of_nan
from jpflash.data import kanji, anim_dir, audio_dir

bp = Blueprint('kanji', __name__, url_prefix='/kanji')
N = len(kanji)
empty_series = pd.Series([''])
allowed_grades = set(range(1, 7))
grade_pattern = re.compile('grade-[1-6]')
genki_pattern = re.compile('genki-[0-9]{1,2}$')

@bp.route('/<string:k>')
def get_kanji(k):
    records = (
        kanji.loc[
            kanji['kanji'].isin(pd.Series(list(k)))
        ]
        .to_dict(orient='records')
    )
    records = {x['kanji']: x for x in records}

    # !!!!!!!!!!!!!!!!!!!!Ensure records are ordered according to input string!!!!!!!!!!!!!
    res = [records[i] for i in k if i in records]
    _take_care_of_nan(res)
    # !!!!!!!!!!!!!!!!!!!!Ensure records are ordered according to input string!!!!!!!!!!!!!

    return res

@bp.route('/set/<string:set_name>')
def get_kanji_set(set_name):

    if grade_pattern.match(set_name):
        if (grade := float(set_name[-1])) > 6 or grade < 1:
            res = empty_series
        else:
            res = kanji.loc[kanji['kgrade'] == grade, 'kanji']

    elif genki_pattern.match(set_name):
        if (chapter := float(set_name.split('-')[-1])) > 23 or chapter < 3:
            res = empty_series
        else:
            res = kanji.loc[kanji['genki'] == chapter, 'kanji']

    elif set_name.lower() == 'genki-all':
        res = kanji.loc[~kanji['genki'].isna(), 'kanji']

    elif set_name.upper() == 'N2':
        res = kanji['kanji']

    else:
        res = empty_series

    return ''.join(res.sample(frac=1))

@bp.route('/anim/<string:k>')
def anim(k):
    if (info := _get(kanji, 'kanji', k)):
        filepath = os.path.join(anim_dir, f'{info["kname"]}_00.webm')
        return send_file(filepath, mimetype='video/webm')
    else:
        return {}

@bp.route('/audio/<string:k>/<int:idx>')
def audio(k, idx):
    if (info := _get(kanji, 'kanji', k)):
        filepaths = sorted(glob(f'{audio_dir}/{info["kname"]}*.aac'))
        if idx in range(len(filepaths)):
            return send_file(filepaths[idx], mimetype='audio/aac')
        else:
            return {}
    else:
        return {}

@bp.after_request
def after_request(response):
    header = response.headers
    header['Access-Control-Allow-Origin'] = '*'
    return response