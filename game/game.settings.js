/**
 * # Game settings for Images Scoring game.
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

var ratingScale = [ 1, 2, 3, 4, 5, 6, 7 ];

module.exports = {

    // Number of sets of pictures to rate per player.
    SETS_MIN: 1,

    // Number of sets of pictures to rate per player.
    SETS_MAX: 5,

    // Number of images per set.
    NIMAGES: 8,

    // Number of images per set.
    SKIPSETS: true,

    // Number of training subjects
    TRAINING_IMAGES: [
        '1', '2', '3', '4', '5'	
    ],

    // Number of test subjects
    TEST_IMAGES: [
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
    ],

    // SIMILARITY_SCORE: 

    // Options to pass to the ChoiceTableGroup widget
    // for creating the scoring interface.
    SCORE_OPTIONS: {

        notMatch: '<h4> The FRS system could not identify the following two images as a match.</h4>',

        match: '<h4> The FRS system identified the following two images as a match.</h4>' 

    },

    // Serve sets of images sequentally from set X (it is zero-indexed).
    SET_COUNTER: -1,

    // The name of the folder in public/ containing the images.
    // Keep the trailing slash.
    IMG_DIR: 'imgscore/',

    // Payment settings.

    // Fixed amount of money.
    FEE: 0.4,

    // Bonus for every completed set.
    BONUS: 0.4,

    // Divider ECU / DOLLARS *
    EXCHANGE_RATE: 1
};
