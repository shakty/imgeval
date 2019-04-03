/**
 * # Game settings for Images Scoring game.
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */


module.exports = {

    // Number of training subjects
    TRAINING_IMAGES: [
        '1', '2', '3', '4', '5'	
    ],


    // Number of test subjects
    TEST_IMAGES: [
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
    ],

    SIMILARITY_SCORE_TRAIN: ['91', '87', '90', '67', '78'
    ],

    SIMILARITY_SCORE_TEST:['93', '80', '70', '60', '40', '67', '71', '69', '86', '45'
    ],

    THRESHOLD_TRAIN: ['40', '50', '60', '70', '80'
    ],

    THRESHOLD_TEST: '90',

    // Serve sets of images sequentally from set X (it is zero-indexed).
    SET_COUNTER: -1,

    // The name of the folder in public/ containing the images.
    // Keep the trailing slash.
    IMG_DIR: 'imgscore/',

    // Payment settings.

    // Fixed amount of money.
    FEE: 1,

    // Bonus for every completed set.
    BONUS: 0.4,

    // Divider ECU / DOLLARS *
    EXCHANGE_RATE: 1
};
