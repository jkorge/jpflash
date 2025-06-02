import { createRoot } from 'react-dom/client';

import { HomePage } from './home.jsx';
import { KanjiPage } from './kanji.jsx';
import { NavBar } from './nav.jsx';
import { render, navigate } from './util.jsx';

// Render the navigation menu
render('banner', <NavBar/>);

// Navigate to the home page
navigate(<KanjiPage/>);