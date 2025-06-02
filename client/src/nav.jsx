import { navigate } from './util.jsx';
import { KanjiPage } from './kanji.jsx';
import '../styles/nav.css';

function NavBar() {

    function handleNavClick(event) {
        const navLink = event.target.closest('.navLink');
        if (navLink.textContent == 'Kanji'){
            navigate(<KanjiPage/>);
        }
    }

    return (
        <nav onClick={handleNavClick}>
            <ul>
                {/*<li className="navLink" id="radicals">Radicals</li>*/}
                {/*<li className="navLink" id="kanji">Kanji</li>*/}
            </ul>
        </nav>
    );
};

export { NavBar };