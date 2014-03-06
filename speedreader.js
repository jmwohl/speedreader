(function () {
		var self = {},
			text = $('p').text(),
			words,
			wpm = 300,
			delay = 60000/wpm,
			$screen 	= $('#Screen'),
			timer,
			wordPos = 0,
			totalNumWords,
			isPaused = true,
			sentences;

		console.log(text);

		function cleanText() {
			// replace newlines with spaces
			text = text.replace(/\n/g, ' ');

			words = text.split(' ');
		}

		function setParagraphSelector(sel) {
			_paragraphSelector = sel;
		}

		
		function loadParagraphs() {
			_$paragraphs = $(_paragraphSelector);
		}

		// mark positions, sentence positions? paragraphs? metadata?
		function setup() {
			cleanText();

			var len = words.length,
				word,
				hasPeriod,
				hasComma,
				ticks;

			totalNumWords = len;

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
				if (hasPeriod !== -1) ticks = 2;

				// calc pos
				var pos = Math.floor(wlen/3);

				for (var j = 0; j < pos; j++) {
					word = '&nbsp;' + word;
				}
				// console.log(pos, word);

				words[i] = {
					word: word,
					length: wlen,
					ticks: ticks,
					pos: pos,
					ticksRemaining: ticks
				};
			}
		}
		
		function play() {
			timer = setInterval(showWord, delay);
		}

		function pause() {
			clearInterval(timer);
		}

		function showWord() {
			var word = words[wordPos],
				tr = word.ticksRemaining;
			// console.log(word, tr);
			$screen.html(word.word);
			if (tr > 0) {
				// console.log(tr);
				word.ticksRemaining -= 1;
			} else {
				wordPos += 1;
				// console.log(word)
			}

			if (wordPos >= totalNumWords) {
				pause();
			}
		}

		setup();
		// play();

		$(document).on('keydown', function(e) {
			console.log(e.keyCode);
			var keyCode = e.keyCode;

			if (keyCode === 32) {
				if (!isPaused) {
					pause();
				} else {
					play();
				}
				isPaused = !isPaused;
			}

			if (keyCode === 37) {
				// go back one sentence
			}
		});



		return self;

	})();