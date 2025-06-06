import { useState, useEffect, useRef, createPortal } from 'react';
import { api_url } from './util.jsx';
import '../styles/kanji.css';

const kroot = `${api_url}/kanji`;
const default_kanji = '漢字';

async function fetchKanji(k) {
    const res = await fetch(`${kroot}/${k}`, {cache: 'force-cache'});
    const data = await res.json();
    return data;
}

async function fetchSet(name) {
    const res = await fetch(`${kroot}/set/${name}`, {cache: 'force-cache'});
    const data = await res.text();
    return data;
}

function VideoContainer({k, play}) {

    const ref = useRef(null);

    if (ref.current) {
        if (play) {
            setTimeout(() => ref.current.play(), 1000);
        } else {
            ref.current.pause();
        }
    }

    // Two-second delay before looping the video
    function handleEnded(event) {
        setTimeout(() => event.target.closest('video').play(), 2000);
    }

    return (
        <div className='videoContainer'>
            <video onEnded={handleEnded} muted src={`${kroot}/anim/${k}`} preload='none' ref={ref}></video>
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
        idx++;
        if (lang == null || (name == 'Radical' && idx == 2)) {
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

    const rad_data = `${data.radical}、${data.rad_name_ja}、${data.rad_meaning}`;

    return (
        <div className='dataContainer'>
            <div className='dataGrid'>
                <DataItem name='Meaning' info={data.kmeaning ?? ''} />
                <DataItem name='Kunyomi' info={data.kunyomi_ja ?? ''} />
                <DataItem name='Onyomi' info={data.onyomi_ja ?? ''} />
                <DataItem name='Radical' info={rad_data ?? ''} />
            </div>
        </div>
    );
}

function Example({k, idx, ex}) {
    const [ja, eng] = ex;
    const [kanji_text, kana_text] = ja.split('（');

    function handleAudioIconClick(event) { event.target.firstElementChild.play(); }

    return (
        <tr>
            <td>
                <i className='fa fa-volume-up' onClick={handleAudioIconClick}>
                    <audio preload='none' src={`${kroot}/audio/${k}/${idx}`}></audio>
                </i>
            </td>
            <td lang='jp'>{kanji_text}</td>
            <td lang='jp'>{kana_text.slice(0, -1)}</td>
            <td>{eng}</td>
        </tr>
    );

}

function ExamplesContainer({k, examples}) {

    let idx = -1;
    const rows = examples.map((ex) => {
        idx++;
        return <Example key={idx} k={k} idx={idx} ex={ex ?? ['（', '']} />;
    });

    return (
        <div className='examplesContainer'>
            <details>
                <summary>Examples</summary>
                <table className='examples'>
                    <thead>
                        <tr>
                            <th scope="col"></th>
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
    );
}

function CardBack({data, playVideo}) {

    return (
        <div className='cardBack'>

            <h2 lang='jp'>{data.kanji}</h2>
            <VideoContainer k={data.kanji} play={playVideo} />
            <DataContainer data={data} />
            <ExamplesContainer k={data.kanji} examples={data.examples ?? []} />

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

function CardContainer({k, showFront}) {

    const [data, setData] = useState({});
    const t = (!showFront) ? 'rotateY(180deg)' : '';

    useEffect(() => {
        async function runFetchKanji() {
            const res = await fetchKanji(k);
            setData(Object.values(res)[0]);
        }
        runFetchKanji();
    }, [k]);

    return (
            <div className='cardContainer' style={{transform: t}}>
                <CardFront data={data}/>
                <CardBack data={data} playVideo={!showFront} />
            </div>
    );
}


function CardStack({kanji}) {

    const [kanjiArr, setKanjiArr] = useState([]);
    const [showFront, setShowFront] = useState(true);
    const [showCardNum, setShowCardNum] = useState(0);

    useEffect(() => {
        setKanjiArr(kanji.split(''));
        setShowCardNum(0);
        setShowFront(true);
    }, [kanji]);

    // Indexing helpers
    function getPrevIdx() {
        return (showCardNum == 0) ? (kanjiArr.length - 1) : ((showCardNum - 1) % kanjiArr.length);
    }

    function getNextIdx() {
        return (showCardNum + 1) % kanjiArr.length;
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

    const hideNextPrev = kanjiArr.length < 2;

    return (kanjiArr.length > 0) && (

        <div className='cardStack'>

            <CardContainer k={kanjiArr[showCardNum]} showFront={showFront} visible={true} />

            <div className='buttonArray'>

                {/* Previous */}
                <button
                    className='prevButton'
                    onClick={handlePrevButtonClick}
                    style={{visibility: hideNextPrev ? 'hidden': 'visible'}}
                >
                    &larr; {kanji[getPrevIdx()]}
                </button>

                {/* Flip */}
                <button
                    className='flipButton'
                    onClick={handleFlipButtonClick}
                >
                    Flip
                </button>

                {/* Next */}
                <button
                    className='nextButton'
                    onClick={handleNextButtonClick}
                    style={{visibility: hideNextPrev ? 'hidden': 'visible'}}
                >
                    {kanji[getNextIdx()]} &rarr;
                </button>

            </div>

        </div>
    );
}

function SearchModal({onSubmit, ref}) {
    return (
        <dialog className='searchModal' closedby='any' ref={ref}>
            <form method='dialog' className='searchBar' onSubmit={onSubmit}>
                <input lang='jp' type='text' placeholder={default_kanji} name='kanjiInput' className='searchInput'></input>
                <button className='searchButton' type='submit'><i className='fa fa-search'></i></button>
            </form>
        </dialog>
    )
}

function SetSelectionModal({onChange, ref}){

    let idx = -1;
    const gradeList = [1,2,3,4,5,6].map((x) => {
        idx++;
        return <option key={idx} value={`grade-${x}`}>{`Grade ${x}`}</option>
    });
    const genkiChapters = [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23].map((x) => {
        idx++;
        return <option key={idx} value={`genki-${x}`}>{`Ch. ${x}`}</option>
    });

    return (
        <dialog className='setSelectionModal' closedby='any' ref={ref}>
            <form method='dialog'>
                <select className='setList' name='selectedSet' size='10' onChange={onChange}>
                    <option value=''></option>
                    <option value='n2'>All N2</option>
                    <optgroup label='Genki'>
                        <option key={idx} value='genki-all'>All Genki</option>
                        {genkiChapters}
                    </optgroup>
                    <optgroup label='Grade'>
                        {gradeList}
                    </optgroup>
                </select>
            </form>
        </dialog>
    );
}

function KanjiPage() {

    const [kanji, setKanji] = useState(default_kanji);
    const searchModalRef = useRef(null);
    const setSelectionModalRef = useRef(null);

    // Modals
    function handleSearchSubmit(event) {
        const formData = new FormData(event.target);
        setKanji(formData.get('kanjiInput') ?? '');
    }

    function handleSetSelection(event) {
        const form = event.target.parentElement;
        form.submit();
        const formData = new FormData(form);
        async function runFetchSet() {
            const res = await fetchSet(formData.get('selectedSet'));
            setKanji(res);
        }
        if (formData.get('selectedSet') != '') { runFetchSet(); }

        // Clear selection
        event.target.value = null;
    }

    const setSelectionModal = <SetSelectionModal onChange={handleSetSelection} ref={setSelectionModalRef} />
    const searchModal = <SearchModal onSubmit={handleSearchSubmit} ref={searchModalRef} />

    // Button handlers
    function handleChooseSetButtonClick(event) { setSelectionModalRef.current.showModal() }
    function handleSearchButtonClick(event) { searchModalRef.current.showModal(); }
    function handleShuffleButtonClick(event) {
        let arr = kanji.split('');
        let idx = arr.length;

        while (idx != 0) {
            let random = Math.floor(Math.random() * idx);
            idx--;
            [arr[idx], arr[random]] = [arr[random], arr[idx]];
        }

        setKanji(arr.join(''));
    }

    return (
        <>
            <div className='buttonArray mainButtonArray'>
                {
                    (kanji.length > 0) &&
                    <button className='shuffleButton' onClick={handleShuffleButtonClick}>Shuffle</button>
                }
                <button className='chooseSetButton' onClick={handleChooseSetButtonClick}>Choose Set</button>
                <button className='searchButton' onClick={handleSearchButtonClick}>Search</button>
            </div>
            {setSelectionModal}
            {searchModal}
            <CardStack kanji={kanji} />
        </>
    );

}

export default KanjiPage;