import os

import numpy as np
from flask import Blueprint, send_file

from jpflash import _get, _random, _take_care_of_nan
from jpflash.data import kanji, anim_dir

bp = Blueprint('kanji', __name__, url_prefix='/kanji')
N = len(kanji)

@bp.route('/<string:k>')
def get_kanji(k):
    records = (
        kanji.loc[
            kanji['kanji'].apply(lambda x: x in k)
        ]
        .to_dict(orient='records')
    )
    records = {x['kanji']: x for x in records}
    res = [records[i] for i in k if i in records]
    _take_care_of_nan(res)
    return res

@bp.route('/anim/<string:k>')
def anim(k):
    if (info := _get(kanji, 'kanji', k)):
        filepath = os.path.join(anim_dir, f'{info["kname"]}_00.webm')
        return send_file(filepath, mimetype='video/webm')
    else:
        return {}
