from flask import Blueprint

from jpflash import _get, _random
from jpflash.data import radicals

bp = Blueprint('radicals', __name__, url_prefix='/radicals')

@bp.route('/<int:idx>')
def get_radical(idx):
    return _get(radicals, idx)

@bp.route('/random')
def random_radical():
    return _random(radicals)

