/**
 * # Image scoring - Client
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * Receives links to images and goes through them displaying rating sliders.
 * ---
 */

var ngc = require('nodegame-client');
var Stager = ngc.Stager;
var stepRules = ngc.stepRules;
var constants = ngc.constants;


// Export the game-creating function. It needs the name of the treatment and
// its options.
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    // Default Step Rule.
    stager.setDefaultStepRule(stepRules.SOLO);

    // INIT and GAMEOVER. 

    stager.setOnInit(function() {
        var frame;
        console.log('** INIT PLAYER! **');

        frame = W.generateFrame();

        // How many images scored in this set.
        // Samira: change this?
        this.counter = -1;

        // Contains data about the images to display, and sets completed.
        this.images = {};

        // If TRUE, the loop at imgscore is broken.
        this.enoughSets = false;

        this.displayPair = function(j) {
            
            console.log("inside displayPair")

            var root, imgPair, img, img2, currentSimScore, currentThreshold;
            
            imgPair = this.sample[j-1];
            currentSimScore = this.simScore[j-1];
            currentThreshold = this.threshold[j-1];

            img = document.createElement('img');
            img.src = node.game.settings.IMG_DIR + imgPair.a;
            img.className = 'imgSample';
            // img.width = "300"
            // img.height = "400"

            img2 = document.createElement('img');
            img2.src = node.game.settings.IMG_DIR + imgPair.b;
            img2.className = 'imgSample';
            //img2.width = "300"
            //img2.height = "400"

            root = W.getElementById('td_image_a');
            root.appendChild(img);
            
            root = W.getElementById('td_image_b');
            root.appendChild(img2);

            W.setInnerHTML('similarityScore', "Similarity score: " + currentSimScore);
            W.setInnerHTML('thresholdTraining', "FRS threshold value to accept as a match: " + currentThreshold);
            
            
            W.adjustFrameHeight();


            
        };

        this.displayRandomPair = function(j) {
            
            console.log("inside displayRandomPair")

            var root, imgPair, img, img2, currentSimScore, currentThreshold;
            
            // define testSample
            imgPair = this.testSample[j-1];
            console.log("imgPair: ", imgPair);

            currentSimScore = this.simScore[j-1];
            currentThreshold = node.game.settings.THRESHOLD_TEST;

            img = document.createElement('img');
            img.src = node.game.settings.IMG_DIR + imgPair.a;
            img.className = 'imgSample';
            // img.width = "300"
            // img.height = "400"

            img2 = document.createElement('img');
            img2.src = node.game.settings.IMG_DIR + imgPair.b;
            img2.className = 'imgSample';
            //img2.width = "300"
            //img2.height = "400"

            root = W.getElementById('td_image_a');
            root.appendChild(img);
            
            root = W.getElementById('td_image_b');
            root.appendChild(img2);

            W.setInnerHTML('similarityScoreTest', "Similarity score: " + currentSimScore);
            W.setInnerHTML('thresholdTest', "FRS threshold value to accept as a match: " + currentThreshold);
            
            
            W.adjustFrameHeight();


            
        };

        // Samira: Can I pass variable like this?
        this.getSample = function() {
            console.log('inside getSample')
            var that;
            that = this;
            // Call the server and tell him 'sample', and then reply is the output of the function. 
            node.get('sample', function(reply) {
                that.sample = reply;
            });
        };

        this.getRandomSample =  function(){
            console.log('inside getRandomSample')
            var that;
            that = this;
            node.get('randomSample', function(reply) {
                [that.testSample, that.simScore] = reply;
            });

           //  "SERVER",

            // if you wanna pass a parameter

            //{
            //    data: "test"
            //});
        };

        this.getSimilarityScore = function() {
            console.log('inside getSimilarityScore')
            var that;
            that = this;
            // Call the server and tell him 'similarityScore', and then reply is the output of the function. 
            node.get('similarityScore', function(reply) {
                that.simScore = reply;
            });
        };

        this.getThreshold = function(){
            console.log('inside getThreshold')
            var that;
            that = this;
            // Call the server and tell him 'threshold', and then reply is the output of the function. 
            node.get('threshold', function(reply) {
                that.threshold = reply;
            });
        }

        node.on('SOCKET_DISCONNECT', function() {
            W.clearPage();
            document.title = 'disconnected';
            W.writeln('Disconnection detected. Please reconnect to ' +
                      'resume the task from where you have left.');
        });
    });

    // STAGES and STEPS.

    //Samira

    function imgIdentify() {
        console.log('inside imgIdentify');

        this.displayPair(node.game.getRound());

        // W.getElementById("similarityScore").innerHTML = "hello";
        W.getElementById('samePerson').onclick = function(){

            console.log('clicked same person')
            node.done({
                decision: 'same',
                image: node.game.sample[node.game.getRound().a]
            });

        }

        W.getElementById('notSamePerson').onclick = function(){
            console.log('inja');

            console.log('clicked not the same person')
            node.done({
                decision: 'notsame',
                image: node.game.sample[node.game.getRound().a]
            });
            console.log("unja")
        }
        return;
    }

    function transitionFun(){
        console.log('inside transitionFun');
        var next = W.getElementById('nextButton');
        next.onclick = function(){
            console.log('Hier')
            node.done('starting test');
        }
        
    }

    function imgIdentifyTest(){
        console.log('inside imgIdentifyTest');

        this.displayRandomPair(node.game.getRound());

        W.getElementById('samePersonTest').onclick = function(){

            console.log("clicked same person")
            node.done({
                decision: 'same',
                image: node.game.testSample[node.game.getRound()-1].a
            });
        }

        W.getElementById('notSamePersonTest').onclick = function(){

            console.log('clicked not the same person')
            node.done({
                decision: 'notsame',
                image: node.game.testSample[node.game.getRound()-1].a
            });
        }
        return;
    }

    function consentCB(){
        console.log("inside consentCB");

        W.getElementById('agree').onclick = function(){
            console.log("agreed to the consent form")
            node.done('agreed')
        }

        W.getElementById('notAgree').onclick = function(){
            console.log('not agreed to consent form')
            alert('Please exit the HIT')
        }
        return;
    }



    function thankyou() {
        console.log('inside thank you')
        var b, i, errStr, counter;
        console.log('thank you.');

        node.on.data('WIN', function(msg) {
            var win, exitcode, codeErr;
            var exitCodeInput, winInput;
            // var winUsd;

            // Exit Code. 
            codeErr = 'ERROR (code not found)';
            exitcode = msg.data && msg.data.exitcode || codeErr;
            exitCodeInput = W.getElementById('exitCode');
            exitCodeInput.value = exitcode;

            // Total win.
            win = msg.data && msg.data.win || 0;
            winInput = W.getElementById('win');
            // winUsd = win / node.game.settings.EXCHANGE_RATE;
            // winInput.value = win +
            //    ' Points = ' + Number(winUsd).toFixed(2) + ' USD';
            winInput.value = win + ' USD';
        });

        // Email box.
        counter = 0;
        b = W.getElementById('submit-email');
        i = W.getElementById('email');
        errStr = 'Check your email and click here again';
        b.onclick = function() {
            var email, indexAt, indexDot;
            email = i.value;
            if (email.trim().length > 5) {
                indexAt = email.indexOf('@');
                if (indexAt !== -1 &&
                    indexAt !== 0 &&
                    indexAt !== (email.length-1)) {
                    indexDot = email.lastIndexOf('.');
                    if (indexDot !== -1 &&
                        indexDot !== (email.length-1) &&
                        indexDot > (indexAt+1)) {

                        b.disabled = true;
                        i.disabled = true;
                        node.say('email', 'SERVER', email);
                        b.onclick = null;
                        b.innerHTML = 'Sent!';
                        return;
                    }
                }
            }
            b.innerHTML = errStr;
            if (counter) b.innerHTML += '(' + counter + ')';
            counter++;
        };

        // Remove block from leaving page.
        W.restoreOnleave();
        W.restoreEscape();
        W.disableBackButton(false);

        // Was a reconnection.
        if (!node.game.enoughSets) node.say('enoughSets');
            
    }

    // Creating stages and steps.
    //consent

    stager.extendStep('consent', {
        frame: 'consent.htm',
        cb: consentCB
    });

    // Instructions.
    stager.extendStage('instructions', {
        frame: 'instructions.htm'
    });

    stager.extendStep('quiz', {
        // widget: {},
        done: function(values) {
            if (!values.isCorrect) {
                node.say('quizResults', 'SERVER', false);
                return;
            }
        }
    })
                       
    stager.extendStep('employmentIdentification', {
        cb: function () {
            
            var next

            node.game.nextBtn = next = W.getElementById("doneButton");
            next.onclick = function() {
                this.disabled = "disabled";
                node.done();
            };

            // Require sample images. Calling them here already so that we load the images
            // beforehand

            this.getSample();
            this.getSimilarityScore();
            this.getThreshold();
            this.getRandomSample();
        }
    });

    stager.extendStep('FRS', {
       cb: function() {

            W.hide("employmentIdentificationPage");
            W.show("FRSPage");
            W.getElementById("doneButton").disabled = false;


            W.adjustFrameHeight();
        }
    });

    stager.extendStep('faceComparison', {
        cb: function() {

        W.hide("FRSPage");
        W.show("faceComparisonPage");
            
        var next = W.getElementById("doneButton");
        next.disabled = false;

        }
    });


    //training

    stager.extendStep('training', {
        frame: 'training.htm',
        cb: imgIdentify
    });

    stager.extendStep('transition',{
        frame: 'transition.htm',
        cb: transitionFun
    });

    stager.extendStep('test',{
        frame: 'test.htm',
        cb: imgIdentifyTest
    });

    // Thank you.
    stager.extendStep('thankyou', {
        widget: {
            name: 'EndScreen',
            options: {
                className: 'centered',
                panel: false,
                title: false,
                email: {
                    text: 'If you would like to participate in' +
                          'future studies, please put your ' +
                          'email (optional):'
                }
            }
        },
        cb: function() {
            // Not needed in nodeGame v5.
            node.say('WIN');
        },
        //frame: 'thankyou.htm',
    });

};
