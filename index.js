// Constants
const HIGHLIGHT_MS = 400;  // ms tiles are highlighted for
const BETWEEN_TILE_MS = 250;  // ms before next tile highlighted
const TILES = $(".tile").toArray();  // All tiles

// Utility Functions
function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialisation
let sequence = [];

let clickIndex = 0;  // Used to track progress through sequence
let tileIndex = 0;  // Index of the tile clicked

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let inGame = false;
let muted = false;

const tile0Audio = new Audio("./audio/a6.mp3");
const tile1Audio = new Audio("./audio/c6.mp3");
const tile2Audio = new Audio("./audio/e6.mp3");
const tile3Audio = new Audio("./audio/g6.mp3");

$("#high-score").text(`High Score: ${highScore}`);

// Event Listeners
$(".tile").on("click", function() {
    tileIndex = TILES.indexOf(this);
    registerClick(tileIndex);
});

$("#start").on("click", () => start(true));
$("#retry").on("click", () => start(false));
$("#mute").on("click", function() {
    $("#mute").toggleClass("fa-solid fa-volume-high");
    $("#mute").toggleClass("fa-solid fa-volume-xmark");
    muted = !muted;
});


// Functions

// Checks user's tile against the sequence
function isCorrect(tileIndex) {
    if (tileIndex === sequence[clickIndex]) return true;
    return false;
}

// Disables / enables tiles
function toggleTiles() {
    $(".tile").toggleClass("disabled");
}

// Starts the sequence
function start(isFirst) {
    resetSequence();

    $("#retry").addClass("hidden");

    if (isFirst) {
        $("#start").addClass("hidden");
        $("#start").addClass("no-display");
        $("#retry").removeClass("no-display");
    } else {
        $("#score").addClass("hidden");

        score = 0;
        $("#level").text(`Level ${score+1}`);
    }

    inGame = true;
    playSequence(sequence);
}

// Extends the sequence by one tile
function extendSequence(sequence) {
    const tileIndex = Math.floor(Math.random() * 4);
    sequence.push(tileIndex);
}

// Resets the sequence
function resetSequence() {
    sequence = [];
    extendSequence(sequence);
    extendSequence(sequence);
    extendSequence(sequence);
    clickIndex = 0;
}

// Plays the sequence to the user
async function playSequence(sequence) {
    toggleTiles();

    await pause(450);  // Delay before the sequence plays

    for (let i = 0; i < sequence.length; i++) {
        await highlightTile(sequence[i], i);
    }

    $("#score").text("Repeat the sequence.").removeClass("hidden");

    toggleTiles();
}

// Highlights the tile with the given index
function highlightTile(tileIndex, sequenceIndex) {
    const tile = $(`.tile-${tileIndex}`);
    const nextTileMultiplier = (sequenceIndex + 1) === sequence.length ? 0 : 1;  // No delay if last tile in sequence
    return new Promise(resolve => {
        tile.toggleClass("active");
        if (!muted) playSound(tileIndex);
        setTimeout(() => {
            tile.toggleClass("active");

            // Add highlight ms so that the next tile only activates a between ms after the current tile deactivates
            setTimeout(resolve, (BETWEEN_TILE_MS + HIGHLIGHT_MS) * nextTileMultiplier);

        }, HIGHLIGHT_MS);
    })
}

// Handles updates and the lose condition
async function registerClick(tileIndex) {
    if (!muted) playSound(tileIndex);

    if (inGame) {
        if (isCorrect(tileIndex)) {
            clickIndex++;

            if (clickIndex === sequence.length) {
                $("#score").addClass("hidden");

                score++;

                // Update high score even if game isn't finished
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem("highScore", highScore);
                }
                $("#level").text(`Level ${score+1}`);

                clickIndex = 0;
                extendSequence(sequence);

                playSequence(sequence);
            }
        } else {
            inGame = false;
            $("#score").text(`Incorrect. You scored ${score}!`).removeClass("hidden");
            $("#retry").removeClass("hidden");

            // Update high score
            if (score >= highScore) {
                highScore = score;
                $("#high-score").text(`High Score: ${highScore}`);
                localStorage.setItem("highScore", highScore);
            }
        }
    }
}

// Handles the audio
function playSound(tileIndex) {
    switch (tileIndex) {
        case 0:
            tile0Audio.play();
            tile0Audio.currentTime = 0;
            break;
        case 1:
            tile1Audio.play();
            tile1Audio.currentTime = 0;
            break;
        case 2:
            tile2Audio.play();
            tile2Audio.currentTime = 0;
            break;
        case 3:
            tile3Audio.play();
            tile3Audio.currentTime = 0;
            break;
    }
}
