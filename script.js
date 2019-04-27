const INVALID_CHAR_MSG = `Invalid character! Only <span class="mono">1</span>, <span class="mono">+</span>, <span class="mono">*</span>, <span class="mono">(</span> and <span class="mono">)</span> characters are allowed.`
const PARSE_ERROR_MSG = `Input doesn't make sense! Did you make sure to balance your parentheses and add <span class="mono">*</span> when multiplying?`
var optimal = new Array(201);
function evalEqu(equ) {
    // Check equation
    for (var i = 0; i < equ.length; i++) {
        switch(equ[i]) {
            case '*':
                if (i > 0 && equ[i] == equ[i-1]) {
                    return "ERROR";
                }
            case '(':
            case ')':
            case '+':
            case '1':
            case ' ': // I'll allow spaces
                break;
            default:
                return "INVALID";
        }
    }
    try {
        // Yeah i'm not writing a parser for this grammar in js, just use eval
        return eval(equ);
    } catch (err) {
        return "ERROR";
    }
}

function countChars(equ) {
    var count = 0;
    for (var i = 0; i < equ.length; i++) {
        switch(equ[i]) {
            case ' ': // I'll allow spaces
                break;
            default:
                count++;
        }
    }
    return count;
}

function checkEqu() {
    var val = evalEqu(equation.value);
    if (val == "INVALID") {
        message.innerHTML = INVALID_CHAR_MSG;
    } else if (val == "ERROR") {
        message.innerHTML = PARSE_ERROR_MSG;
    } else if (val == requiredNumber.textContent) {
        let charCount = countChars(equation.value);
        let opt = optimal[parseInt(val)][1];
        answer.textContent = equation.value;
        message.textContent = "Correct! Your equation used a total of " + charCount + " characters.";
        if (charCount == opt) {
            message.textContent += " This is an optimal solution!";
        } else {
            message.textContent += " There is a better solution that uses " + opt + " characters.";
        }
        nextRound.classList.remove("hide");
    } else {
        message.textContent = "Hmm... That doesn't seem to evaluate to the number " + requiredNumber.textContent + ".";
    }
}

function newGame() {
    var num = -1
    switch (difficulty.value) {
        case "easy":
            num = Math.floor(Math.random() * 10) + 5
            break;
        case "medium":
            num = Math.floor(Math.random() * 35) + 15;
            break;
        case "hard":
            num = Math.floor(Math.random() * 150) + 50;
            break;
    }
    requiredNumber.textContent = num;
    par.textContent = Math.round(optimal[num][1] * 1.4);
    equation.value = "";
    message.textContent = "";
    answer.textContent = "?";
    nextRound.classList.add("hide");
}

function equationInput() {
    message.textContent = "Length: " + countChars(equation.value);
    answer.textContent = "?";
	
}

function startGame() {
    newGame();
    menu.classList.add("hide");
    howto.classList.add("hide");
    game.classList.remove("hide");
}

function backToMenu() {
    game.classList.add("hide");
    howto.classList.add("hide");
    menu.classList.remove("hide");
}

function viewHowTo() {
    game.classList.add("hide");
    howto.classList.remove("hide");
    menu.classList.add("hide");
}

function handleKeyPress(ev) {
	if (ev.key == "Enter") {
		checkEqu();
	}
}

// Dynamic programming to find the length of the optimal string for every integer from 1 to 200
// Also accidental spoiler for problem Building Integers from Australian Informatics Competition 1998
// http://orac.amt.edu.au/cgi-bin/train/problem.pl?problemid=19
//
// Optimal[n][1] stores the minimum number of characters needed to build the number.
function init() {
    var startTime = new Date();
    for (var i = 0; i <= 200; i++) optimal[i] = [0, 0].slice();
    optimal[1][0] = 1;
    optimal[1][1] = 1;
    optimal[11][0] = 2;
    optimal[11][1] = 2;
    optimal[111][0] = 3;
    optimal[111][1] = 3;
    for (var n = 1; n <= 200; n++) {
        if (optimal[n][0] == 0) {
            optimal[n][0] = 1000000;
            optimal[n][1] = 1000000;
            for (var i = 1; i < n; i++) {
                // Case 1: Addition
                {
                    let comp = n - i;
                    let tla = optimal[i][1] + optimal[comp][1] + 1;
                    optimal[n][1] = Math.min(optimal[n][1], tla);
                }
                // Case 2: Multiplication
                if (n % i === 0) {
                    let comp = n / i;
                    let besti = optimal[i][0] > optimal[i][1] + 2;
                    let bestc = optimal[comp][0] > optimal[comp][1] + 2;
                    if (besti && bestc) {
                        optimal[n][0] = Math.min(optimal[n][0], optimal[i][1] + optimal[comp][1] + 5);
                    } else if (besti) {
                        optimal[n][0] = Math.min(optimal[n][0], optimal[i][1] + optimal[comp][0] + 3);
                    } else if (bestc) {
                        optimal[n][0] = Math.min(optimal[n][0], optimal[i][0] + optimal[comp][1] + 3);
                    } else {
                        optimal[n][0] = Math.min(optimal[n][0], optimal[i][0] + optimal[comp][0] + 1);
                    }
                }
            }
            optimal[n][1] = Math.min(optimal[n][1], optimal[n][0]);
        }
    }
    var endTime = new Date();
    console.log("Finished init in " + (endTime - startTime) + "ms");
}

start.onclick = startGame;
check.onclick = checkEqu;
nextRound.onclick = newGame;
returnToMenu.onclick = backToMenu;
returnToMenu2.onclick = backToMenu;
howToPlay.onclick = viewHowTo;
equation.oninput = equationInput;
equation.onkeypress = handleKeyPress;
init();
