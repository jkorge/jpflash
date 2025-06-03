import { useState, useEffect, useRef } from 'react';
import { api_url } from './util.jsx';
import '../styles/kanji.css';

const kroot = `${api_url}/kanji`;
const default_kanji = '先生安飲雨';

async function fetchKanji(k) {
    const res = await fetch(`${kroot}/${k}`);
    const data = await res.json();
    return data;
}

function VideoContainer({k, play}) {

    const ref = useRef(null);

    useEffect(() => {
        if (play) {
            ref.current.play();
        } else {
            ref.current.pause();
        }
    }, [play])

    // Two-second delay before looping the video
    function handleEnded(event) {
        setTimeout(() => { event.target.closest('video').play(); }, 2000);
    }

    return (
        <div className='videoContainer'>
            <video onEnded={handleEnded} muted src={`${kroot}/anim/${k}`} ref={ref}></video>
        </div>
    );
}

function DataItem({name, info}) {

    let split_on, lang;

    if (name == 'Meaning') {
        split_on = ', ';
        lang = null;
    } else {
        split_on = '、';
        lang = 'jp';
    }

    let idx = -1;
    const listItems = (info.split(split_on)).map((x) => {
        idx += 1;
        if (lang == null){
            return <li key={idx}>{x}</li>;
        } else {
            return <li key={idx} lang={lang}>{x}</li>;
        }
    });

    return (
        <>
            <div className='rowHeader'>
                <h3>{name}</h3>
            </div>
            <ul>
                {listItems}
            </ul>
        </>

    );
}

function DataContainer({data}) {

    return (
        <div className='dataContainer'>
            <div className='dataGrid'>
                <DataItem name='Meaning' info={data.kmeaning ?? ''} />
                <DataItem name='Kunyomi' info={data.kunyomi_ja ?? ''} />
                <DataItem name='Onyomi' info={data.onyomi_ja ?? ''} />
                <DataItem name='Radical' info={data.radical ?? ''} />
            </div>
        </div>
    );
}

function Example({ex}) {
    const [ja, eng] = ex;
    const [kanji_text, kana_text] = ja.split('（');
    return (
        <tr>
            <td lang='jp'>{kanji_text}</td>
            <td lang='jp'>{kana_text.slice(0, -1)}</td>
            <td>{eng}</td>
        </tr>
    )

}

function ExamplesContainer({examples}) {

    let idx = -1;
    const rows = examples.map((ex) => {
        idx += 1;
        return <Example key={idx} ex={ex ?? ['（', '']} />;
    });

    return (
        <div className='examplesContainer'>
            <details>
                <summary>Examples</summary>
                <table className='examples'>
                    <thead>
                        <tr>
                            <th scope="col">Kanji</th>
                            <th scope="col">Kana</th>
                            <th scope="col">English</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </details>
        </div>
    )
}

function CardBack({data, playVideo}) {

    return (
        <div className='cardBack'>

            <h2 lang='jp'>{data.kanji}</h2>
            <VideoContainer k={data.kanji} play={playVideo} />
            <DataContainer data={data} />
            <ExamplesContainer examples={data.examples ?? []} />

        </div>
    );
}

function CardFront({data}) {
    return (
        <div className='cardFront'>
            <h2 lang='jp'>{data.kanji}</h2>
        </div>
    );
}

function CardContainer({data, showFront, visible}) {

    const [style, setStyle] = useState({});

    useEffect(() => {
        setStyle({
            transform: showFront ? '' : 'rotateY(180deg)',
            visibility: visible ? 'visible' : 'hidden'
        });
    }, [showFront, visible])

    return (
            <div className='cardContainer' style={style}>
                <CardFront data={data}/>
                <CardBack data={data} playVideo={!showFront} />
            </div>
    );
}

function CardStack({kanji}) {

    const [data, setData] = useState([]);
    const [showFront, setShowFront] = useState(true);
    const [showCardNum, setShowCardNum] = useState(0);

    // Get the data for each kanji in the input string
    useEffect(() => {

        async function runFetchKanji() {
            const res = await fetchKanji(kanji);
            setData(Object.values(res));
        }

        runFetchKanji();
        setShowCardNum(0);
        setShowFront(true);

    }, [kanji])

    // Indexing helpers
    function getPrevIdx() {
        return (showCardNum == 0) ? (data.length - 1) : ((showCardNum - 1) % data.length);
    }

    function getNextIdx() {
        return (showCardNum + 1) % data.length;
    }

    // Button Handlers
    function handleFlipButtonClick(event) { setShowFront(!showFront); }

    function handleNextButtonClick(event) {
        const next = getNextIdx();
        if (!showFront) {
            setShowFront(true);
            setTimeout(() => setShowCardNum(next), 1000);
        } else {
            setShowCardNum(next);
        }
    }

    function handlePrevButtonClick(event) {
        const next = getPrevIdx();
        if (!showFront) {
            setShowFront(true);
            setTimeout(() => setShowCardNum(next), 1000);
        } else {
            setShowCardNum(next);
        }
    }

    // Construct cards
    let idx = -1;
    const cards = data.map((x) => {
        idx += 1
        return <CardContainer key={idx} data={x} showFront={showFront} visible={showCardNum == idx} />;
    });

    return (
        <div className='cardStack'>
            {cards}
            <div className='buttonArray'>
                <button className='prevButton' onClick={handlePrevButtonClick}>&larr; {(data.length == 1)? '' : kanji[getPrevIdx()]}</button>
                <button className='flipButton' onClick={handleFlipButtonClick}>Flip</button>
                <button className='nextButton' onClick={handleNextButtonClick}>{(data.length == 1) ? '' : kanji[getNextIdx()]} &rarr;</button>
            </div>
        </div>
    );
}

function SearchBar({inputDefault, onSubmit}) {
    return (
        <form className='searchBar' onSubmit={onSubmit}>
            <input lang='jp' type='text' defaultValue={inputDefault} name='kanjiInput' className='searchInput'></input>
            <button className='searchButton' type='submit'><i className='fa fa-search'></i></button>
        </form>
    )
}

function KanjiPage() {

    const [kanji, setKanji] = useState(default_kanji);

    function handleSearchSubmit(event){
        event.preventDefault();
        const formData = new FormData(event.target);
        setKanji(formData.get('kanjiInput') ?? '');
    }

    return (
        <>
            <SearchBar inputDefault={default_kanji} onSubmit={handleSearchSubmit} />
            <CardStack kanji={kanji} />
        </>
    )

}

export { KanjiPage };