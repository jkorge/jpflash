import os

from flask import Blueprint, send_file

from jpflash import _get, _random
from jpflash.data import kanji, anim_dir

bp = Blueprint('kanji', __name__, url_prefix='/kanji')

@bp.route('/<string:k>')
def get_kanji(k):
    return _get(kanji, 'kanji', k)

@bp.route('/random')
def random_kanji():
    res = _random(kanji)
    return res

@bp.route('/anim/<string:k>')
def anim(k):
    if (info := _get(kanji, 'kanji', k)):
        filepath = os.path.join(anim_dir, f'{info["kname"]}_00.webm')
        return send_file(filepath, mimetype='video/webm')
    else:
        return {}

@bp.after_request
def after_request(response):
    header = response.headers
    header['Access-Control-Allow-Origin'] = '*'
    return response