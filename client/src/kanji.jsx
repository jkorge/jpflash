import { useState, useEffect } from 'react';
import { api_url } from './util.jsx';
import '../styles/kanji.css';

const kroot = `${api_url}/kanji`;

async function get(path) {
    console.log(`${kroot}/${path}`);
    const res = await fetch(`${kroot}/${path}`);
    const data = await res.json();
    return data;
}

async function get_kanji(k) {
    return get(k);
}

async function get_random_kanji() {
    return get('random');
}

function anim_path(k) { return `${kroot}/anim/${k}`; }

function VideoContainer({k}) {

    // Two-second delay before looping the video
    function handleEnded(event) {
        setTimeout(() => { event.target.closest('video').play(); }, 2000);
    }

    return (
        <div className='videoContainer'>
            <video onEnded={handleEnded} muted src={anim_path(k)}></video>
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
    })

    let list;

    if (name == 'Radical') {
        list = <ul className='radical'>{listItems}</ul>;
    } else {
        list = <ul>{listItems}</ul>;
    }

    return (
        <>
            <div className='rowHeader'>
                <h3>{name}</h3>
            </div>
            {list}
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
    })

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

function CardBack({data}) {

    return (
        <div className='cardBack'>

            <h2 lang='jp'>{data.kanji}</h2>
            <VideoContainer k={data.kanji} />
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

function CardContainer({data}) {
    return (
            <div className='cardContainer'>
                <CardFront data={data}/>
                <CardBack data={data}/>
            </div>
    );
}

function KanjiPage() {
    const [data, setData] = useState({});
    const [showFront, setShowFront] = useState(true);
    const [next, setNext] = useState(true);

    function flipCard() {
        const card = document.querySelector('.cardContainer');
        card.style.transform = card.style.transform ? '' : 'rotateY(180deg)';

        const video = document.querySelector('video');
        if (showFront) { video.play(); }
        else { video.pause(); }
        setShowFront(!showFront)
    }

    function handleFlipButtonClick(event) { flipCard(); }

    function handleNextButtonClick(event) {
        if (!showFront) { flipCard(); }
        setTimeout(() => setNext(!next), 1000);
    }

    function handleSearchSubmit(event) {
        event.preventDefault();
        const searchInput = document.querySelector('.searchInput')
        const userInput = searchInput.value;
        if (userInput.length > 1) {
            searchInput.style.border = '2px red solid';
            searchInput.value = '';
            searchInput.placeholder = 'Only one Kanji at a time';
        } else {
            searchInput.style.border = '';
            searchInput.placeholder = 'Kanji Lookup';
        }
        async function startFetch() {
            setData({});
            const res = await get_kanji(userInput);
            setData(res);
        }
        if (!showFront) { flipCard(); }
        startFetch();
    }

    useEffect(() => {
        async function startFetch() {
            setData({})
            const res = await get_random_kanji();
            setData(res);
        }
        startFetch();
    }, [next]);

    return (
        data && (
            <>
                <form className='searchBar' onSubmit={handleSearchSubmit}>
                    <input lang='jp' type='text' placeholder='Kanji Lookup' className='searchInput'></input>
                    <button className='searchButton' type='submit'><i className='fa fa-search'></i></button>
                </form>
                <CardContainer data={data} />
                <button className='flipButton' onClick={handleFlipButtonClick}>Flip</button>
                <button className='nextButton' onClick={handleNextButtonClick}>Random</button>
            </>
        )
    );
}

export { KanjiPage };