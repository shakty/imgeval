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
        .next('instructions')
        .loop('training', function(){
            return !this.enoughSets
        })
        .loop('test', function() {
            return !this.enoughSets;
        })
        .next('thankyou')
        .gameover();

    stager.extendStage('instructions', {
        steps: [ 'employmentIdentification', 'FRS', 'faceComparison' ]
    });

    stager.extendStage('training', {
        steps: [ 'identify', 'continue' ]
    });

    stager.extendStage('test', {
        steps: [ 'identify2', 'continue2' ]
    });


    // stager.skip('instructions');

    // return stager.getState();
};
