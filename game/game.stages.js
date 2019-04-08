/**
 * # Game stages definition file
 * Copyright(c) 2017 Stefano Balietti <s.balietti@neu.edu>
 * MIT Licensed
 *
 * Stages are defined using the stager API
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = function(stager, settings) {

    // No stages.
    // Stages are defined inside the client types.

    stager
        .next('consent')
        .next('instructions')
        .next('quiz')
        .repeat('training', 5)
        .next('transition')
        .repeat('test', 10)
        .next('thankyou')
        .gameover();

    stager.extendStage('instructions', {
        steps: [ 'employmentIdentification', 'FRS', 'faceComparison' ]
    });

    // stager.skip('instructions');
    stager.skip('training');
    // stager.skip('test');
    stager.skip('transition');
};
