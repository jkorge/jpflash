import { createRoot } from 'react-dom/client';

import { KanjiPage } from './kanji.jsx';
import { render, navigate } from './util.jsx';

// Navigate to the home page
navigate(<KanjiPage/>);