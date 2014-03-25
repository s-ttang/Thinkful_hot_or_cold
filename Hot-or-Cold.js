/* 
This number guessing game will automatically reduce and eliminate the wrong answers based on your current and last guess. 
The goal of the design is to rely on visual feedback rather than text-based feedback.
The game disables and visually discolors the wrong answers. Only the remaining choices are valid guesses. 
*/

$(document).ready(function(){
/*--Globals--*/
	var currGuess 	= null;
	var lastGuess;
	var answer 		= '';
	var guessRecord = [];
	var state 	  	= [];
	var max		  	= 200;
	var min 	  	= 1;
	
/*--Helper Functions--*/

	function addNum(selector, start, end){
		for (var i=start; i <= end; i++){
			$(selector).append("<li><input class=\"choiceButton\" type=\"submit\" name=\"choice\" value=\"" + i + "\"></li>");
		};
	}

	function isInArray(value, array) {
  		return array.indexOf(value) > -1;
  	}
	
	function appendWrongAnswersTo ( array, start, end){
		for (var n = start; n <= end; n++){
			array.push(n.toString());
		}
	}

	function disableWrongChoices( startIndex, endIndex ){
		for (var i = (startIndex); i <= endIndex; i++){
			$( 'ul li:nth-child('+i+') input:not(.highlight-wrong)').addClass('highlight-wrong') 
		}
	}
	
	function updateBackground(){
		// Update Background color based on warm state or cold state.
		// turn warmer  for the right direction
		// turn colder	for the wrong direction
		// turn into winning colors for correct answer
		var bgPosition = '';
		
		if 		  (state.slice(-6) == 'warm,warm,warm,warm,warm,warm'){		
			bgPosition = '0 90%';  	  
		} else if (state.slice(-5) == 'warm,warm,warm,warm,warm'){						
			bgPosition = '0 75%';   
		} else if (state.slice(-4) == 'warm,warm,warm,warm'){						
			bgPosition = '0 60%'; 	  
		} else if (state.slice(-3) == 'warm,warm,warm'){					
			bgPosition = '0 45%';  
		} else if (state.slice(-2) == 'warm,warm'){							
			bgPosition = '0 30%';  
		} else if (state.slice(-1) == 'warm'){				
			bgPosition = '0 20%';  
		} else if (state.slice(-1) == 'cold'){				
			bgPosition = '0 0';  
		} 
		$('.container').addClass('proximity-bg').css('background-position', bgPosition);  
		if (state.slice(-1) == 'win'){							
			$('.container').removeClass('proximity-bg').addClass('win-bg');
		}
		//console.log("Updated Background");
	}
		
	function determineWrongChoices( lastGuess, currGuess ){
				var currDelta = Math.abs(currGuess - answer);
				var lastDelta = Math.abs(lastGuess - answer);
				
				if  	 ( currDelta < lastDelta && answer < currGuess && answer < lastGuess){  /* ..A..C--L-------- */
					start = currGuess;
					end	  = max;
					state.push('warm'); console.log('[1]');
				}else if ( lastDelta < currDelta && answer < currGuess && answer < lastGuess){  /* ..A.....L-----C-- */
					start = lastGuess;
					end	  = max;
					state.push('cold'); console.log('[2]');
				}else if ( currDelta < lastDelta && currGuess < answer && lastGuess < answer){  /* --------L--C..A.. */
					start = min;
					end	  = currGuess;
					state.push('warm');  console.log('[3]');
				}else if ( lastDelta < currDelta && currGuess < answer && lastGuess < answer){  /* -----C--L.....A.. */
					start = min;
					end	  = lastGuess; 
					state.push('cold'); console.log('[4]');
				}else if (currDelta <= lastDelta && answer < currGuess && lastGuess < answer){  /* ----L...A.C...... */
					start = min;
					end	  = lastGuess;
					state.push('warm'); console.log('[5]');
				}else if (lastDelta <= currDelta && answer < currGuess && lastGuess < answer){  /* ....L...A.....C-- */
					start = currGuess;
					end	  = max;
					state.push('cold'); console.log('[6]');
				}else if (currDelta <= lastDelta && currGuess < answer && answer < lastGuess){  /* ....C...A....L--- */
					start = lastGuess;
					end	  = max;
					state.push('warm'); console.log('[7]');
				}else if (lastDelta <= currDelta && currGuess < answer && answer < lastGuess){  /* ----C...A.L...... */
					start = min;
					end	  = currGuess;
					state.push('cold'); console.log('[8]');	
				}
	}
	
/*--Main Game Functions--*/
	function startGame(){
		addNum('.100-1', min, max);
		answer	  = Math.round(Math.random(min, max) * 100); 
		lastGuess = null;
		state 	  = []
		$('.container').removeClass('win-bg').css('background-position', '0 10%');  
		$('.msg').text('Guess my number');
		$('ul').show();
		$('.ans').text(answer).hide();
		$('.playButton').hide();
	}
	function endGame(){
		state.push('win');
		guessRecord = [];
		$('.msg').text('You guessed it!');
		$('ul').hide().empty();
		$('.ans').text(answer).show();
		$('.playButton').show();
	}
	
/*--Function Calls--*/
	startGame()
	$('ul').delegate('.choiceButton', 'click', function(){ 	//--When a number is clicked 
		currGuess = $(this).val(); 							// Set currGuess to be number value of button
		
		if(!(isInArray(currGuess, guessRecord))){ 			// Run if this guess has never been clicked before			
			$(this).addClass('highlight-selected');				// Darken the choice 			
			$('.msg').text(currGuess);			// Update Message Box Text
			guessRecord.push(currGuess); 						// Record each guess 
			
			if(currGuess == answer){							// If guess is correct
				$(this).addClass('highlight-correct'); 				// highlight it as correct
				endGame();											// end game
			} else if (guessRecord.length > 1){ 				// else if user has guess at least two different numbers then start check guess			
				determineWrongChoices( lastGuess, currGuess );		// Bisection search: identify wrong answers
				disableWrongChoices(start, end);					// Disable wrong answers
				appendWrongAnswersTo( guessRecord, start, end);		// Record  wrong answers
			} 
			lastGuess = currGuess;  							// Update lastGuess with the current guess		
			updateBackground();									// Update background color to give feedback
		} else {											// Run if User clicks on previously clicked number.	
			console.log("Your guess has already been selected or eliminated!");
		}
	});
	$('.playButton').on('click', function(){				
		startGame();
	});
});