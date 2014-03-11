if (!($ = window.jQuery)) {
    script = document.createElement('script');
    script.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js';
    script.onload = kickIt;
    document.body.appendChild(script);
} else {
    kickIt();
}



function kickIt() {
    window.SR = (function() {
        var self = {},
            _paragraphSelector = 'p',
            _paragraphs = [],
            _paraPos = 0,
            _curParaPos = 0,
            _numParagraphs,
            _paragraphDelay = 500,
            _sentenceRegex = /[^\.!\?]+[\.!\?"']+\s/gm,
            _wpm = 500,
            _delay = 60000 / _wpm,
            $overlay,
            $screen,
            $miniText,
            $speed,
            timer,
            _wordPos = 0,
            _totalNumWords,
            _isPaused = true,
            _pauseOnParagraphs = false;

        function _parseHtml(sel) {

        }

        function _cleanText() {
            text = text.replace(/\n/g, ' ');

            words = text.split(' ');
        }

        function _setParagraphSelector(sel) {
            _paragraphSelector = sel;
        }

        function _setArticleSelector(sel) {
            _articleSelector = sel;
        }

        function _setWpm(wpm) {
            _wpm = wpm;
            _delay = 60000 / _wpm;
            _updateSpeedDisplay();
            if (!_isPaused) {
	            _pause();
	            _play();
            }
        }


        function _loadParagraphs() {
            console.log(_paragraphSelector);
            var paragraphs = $(_paragraphSelector);
            console.log(paragraphs);
            _numParagraphs = paragraphs.length;

            paragraphs.each(function(index) {
                console.log('PARAGRAPH: ', index);
                var text = $(this).text(),
                    words = text.split(/\s/),
                    paragraph;

                var match, matches = [];

                while ((match = _sentenceRegex.exec(text)) !== null) {
                    matches.push(match.index);
                }


                paragraph = _setupParagraph({
                    pos: index,
                    sentenceIndices: matches,
                    words: words,
                    text: text,
                    totalNumWords: words.length
                });

                console.log(words);

                _paragraphs.push(paragraph);
            });
        }


        function _setupParagraph(paragraph) {

            var words = paragraph.words,
                len = paragraph.totalNumWords,
                wordObjs = [],
                word,
                hasPeriod,
                hasComma,
                caps = /^[A-Z]/g,
                ticks;


            for (var i = 0; i < len; i++) {
                word = words[i];
                hasComma = word.indexOf(",");
                hasPeriod = word.indexOf(".");
                ticks = 0,
                wlen = word.length;

                if (hasComma !== -1) {
                    ticks = 1;
                    console.log(hasComma);
                }
                if (hasPeriod !== -1) {
                    if (!caps.test(word) && wlen > 4) {
                        ticks = 2;
                    }
                }

                var pos = Math.floor(wlen / 3);

                for (var j = 0; j < pos; j++) {
                    word = '&nbsp;' + word;
                    wlen += 1;
                }

                if (wlen % 2 !== 0) {
                    word = '&nbsp;' + word;
                    wlen += 1;
                }

                wordObjs[i] = {
                    word: word,
                    length: wlen,
                    ticks: ticks,
                    pos: pos,
                    ticksRemaining: ticks
                };
            }

            paragraph.words = wordObjs;

            return paragraph;
        }

        function _play() {
            timer = setInterval(_continue, _delay);
            _highlightParagraph();
            _isPaused = false;
        }

        function _pause() {
            clearInterval(timer);
            _isPaused = true;
        }

        function _continue() {
            _showWord();
            _advanceWord();
        }

        function _nextParagraph() {
            console.log('_nextParagraph');
            _wordPos = 0;
            _curParaPos = _paraPos = _paraPos < _numParagraphs - 1 ? _paraPos + 1 : _numParagraphs - 1;

            if (_paraPos >= _numParagraphs) {
                _theEnd();
                _curParaPos = null;
            }

            _highlightParagraph();
        }

        function _prevParagraph() {
            console.log('_prevParagraph');
            _wordPos = 0;
            _curParaPos = _paraPos = _paraPos > 0 ? _paraPos - 1 : 0;
            _highlightParagraph();
        }

        function _topOfParagraph() {
            console.log('_topOfParagraph');
            if (_wordPos === 0) {
                _prevParagraph();
            } else {
                _wordPos = 0;
            }
        }

        function _reduceSpeed(amt) {
            console.log('_reduceSpeed', amt);
            var wpm = _wpm - amt;
            _setWpm(wpm);
        }

        function _increaseSpeed(amt) {
            console.log('_increaseSpeed', amt);
            var wpm = _wpm + amt;
            _setWpm(wpm);
        }

        function _theEnd() {
            $screen.text("The End.");
            _pause();
        }

        function _showWord() {
            var para = _paragraphs[_paraPos],
                word = para.words[_wordPos];

            $screen.html(word.word);
        }

        function _advanceWord() {
            var para = _paragraphs[_paraPos],
                word = para.words[_wordPos],
                tr = word.ticksRemaining;

            if (tr > 0) {
                word.ticksRemaining -= 1;
                return;
            } else {
                _wordPos += 1;
            }

            
            if (_wordPos >= para.totalNumWords) {
                console.log('paragraph end');
                if (_paraPos >= _numParagraphs - 1) {
                    _theEnd();
                } else {
                    _nextParagraph();
                    _pause();
                    if (!_pauseOnParagraphs) {
                    	setTimeout(_play, _paragraphDelay);
                    } 
                }
            }
        }

        function _generateMiniText() {
            console.log('_generateMiniText');
            $miniText = $('<div id="MiniText"></div>').css({
                position: 'fixed',
                top: 0,
                left: 0,
                width: '200px',
                padding: '10px',
                textAlign: 'left',
                fontSize: '5px',
                fontFamily: '"Lucida Console", Monaco, monospace',
                color: "#666",
                zIndex: 10001
            });
            $.each(_paragraphs, function(i) {
                console.log(i, _paragraphs[i].text);
                var $p = $('<p>')
                    .text(_paragraphs[i].text)
                    .css({
                        margin: '5px 0px'
                    });
                $miniText.append($p);
            });
            $('body').append($miniText);
        }

        function _highlightParagraph() {
            console.log(_curParaPos);
            var $miniParas = $('#MiniText p');
            $miniParas.css({
                background: 'none'
            });
            if (_curParaPos !== null) {
                $miniParas.eq(_curParaPos).css({
                    background: '#333'
                });
            }
        }

        function _showSpeed() {
        	$speed = $('<div/>').css({
        		position: 'fixed',
                top: 0,
                right: 0,
                width: '100px',
                padding: '10px',
                textAlign: 'right',
                fontSize: '1em',
                fontFamily: '"Lucida Console", Monaco, monospace',
                color: "#666",
                zIndex: 10001
        	});
        	$('body').append($speed);
        	_updateSpeedDisplay();
        }

        function _updateSpeedDisplay() {
        	$speed.text('wpm: ' + _wpm);
        }

        function _prepareScreen() {
            $overlay = $('<div/>').css({
                width: '100%',
                height: '100%',
                position: 'fixed',
                top: 0,
                left: 0,
                backgroundColor: '#000',
                zIndex: 10000
            });

            $screen = $('<div id="Screen"></div>').css({
                position: 'fixed',
                top: '45%',
                left: 0,
                width: '100%',
                textAlign: 'center',
                fontSize: '2em',
                fontFamily: '"Lucida Console", Monaco, monospace',
                color: "#eee",
                zIndex: 10002
            }).html('<p>Press SPACE to play/pause.</p><p>&uarr; faster<br/>&darr; slower<br/> &larr; prev paragraph<br/> &rarr; next paragraph<br/>enter to restore page</p>');

            $('body').append($overlay);
            
            _generateMiniText();
            _showSpeed();

            $('body').append($screen);
        }

        function _restorePage() {
            $screen.remove();
            $overlay.remove();
            $miniText.remove();
            $speed.remove();
        }

        $(document).on('keydown', function(e) {
            var keyCode = e.keyCode;
            console.log(keyCode);

            switch (keyCode) {
                case 32:
                    if (!_isPaused) {
                        _pause();
                    } else {
                        _play();
                    }
                    break;
                case 37:
                    _topOfParagraph();
                    _showWord();
                    _pause();
                    break;
                case 38:
                    _increaseSpeed(50);
                    break;
                case 39:
                    _nextParagraph();
                    _showWord();
                    _pause();
                    break;
                case 40:
                    _reduceSpeed(50);
                    break;
                case 13:
                    _restorePage();
                    break;
                case 80:
                	_pauseOnParagraphs = !_pauseOnParagraphs;
                    break;
                default:
            }

        });

        self.parseHtml = _parseHtml;
        self.setParagraphSelector = _setParagraphSelector;
        self.setArticleSelector = _setArticleSelector;
        self.loadParagraphs = _loadParagraphs;
        self.setWpm = _setWpm;
        self.prepareScreen = _prepareScreen;

        return self;

    })();

    SR.loadParagraphs();
    SR.prepareScreen();
}
