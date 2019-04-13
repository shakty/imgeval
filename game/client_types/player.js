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
            

            var root, imgPair, img, img2, currentSimScore, currentThreshold;
            
            // define testSample
            imgPair = this.testSample[j-1];

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
            var that;
            that = this;
            // Call the server and tell him 'sample', and then reply is the output of the function. 
            node.get('sample', function(reply) {
                that.sample = reply;
            });
        };

        this.getRandomSample =  function(){
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
            var that;
            that = this;
            // Call the server and tell him 'similarityScore', and then reply is the output of the function. 
            node.get('similarityScore', function(reply) {
                that.simScore = reply;
            });
        };

        this.getThreshold = function(){
            var that;
            that = this;
            // Call the server and tell him 'threshold', and then reply is the output of the function. 
            node.get('threshold', function(reply) {
                that.threshold = reply;
            });
        }

        node.on('SOCKET_DISCONNECT', function() {
            return;
            W.clearPage();
            document.title = 'disconnected';
            W.writeln('Disconnection detected. Please reconnect to ' +
                      'resume the task from where you have left.');
        });
    });

    // STAGES and STEPS.

    //Samira

    function imgIdentify() {

        this.displayPair(node.game.getRound());

        // W.getElementById("similarityScore").innerHTML = "hello";
        W.getElementById('samePerson').onclick = function(){

            node.done({
                decision: 'same',
                image: node.game.sample[node.game.getRound().a]
            });

        }

        W.getElementById('notSamePerson').onclick = function(){
            node.done({
                decision: 'notsame',
                image: node.game.sample[node.game.getRound().a]
            });
        }
        return;
    }

    function transitionFun(){
        var next = W.getElementById('nextButton');
        next.onclick = function(){
            node.done('starting test');
        }
        
    }

    function imgIdentifyTest(){

        this.displayRandomPair(node.game.getRound());

        W.getElementById('samePersonTest').onclick = function(){

            node.done({
                decision: 'same',
                image: node.game.testSample[node.game.getRound()-1].a
            });
        }

        W.getElementById('notSamePersonTest').onclick = function(){

            node.done({
                decision: 'notsame',
                image: node.game.testSample[node.game.getRound()-1].a
            });
        }
        return;
    }


    function thankyou() {
        var b, i, errStr, counter;

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

    stager.extendStep('consent', {
        frame: 'consent.htm',
        donebutton: false,

        //cb: consentCB
        cb: function(){
            var accept, notAccept;
            accept = W.gid('agree');
            notAccept = W.gid('notAgree');
            accept.onclick = function() { node.done('accepted the consent'); };
            notAccept.onclick = function(){
            
                node.say('notAgreed');
                accept.disabled = true;
                notAccept.disabled = true;
                accept.onclick = null;
                notAccept.onclick = null;
                node.socket.disconnect();
                W.hide('consent');
                W.show('notAgreed');
            }

        }
    });

    // Instructions.
    stager.extendStage('instructions1', {
        frame: 'instructions1.htm'
    });

    // samira: do we have to put node.done() at the end of all steps or only
    // when we wanna save information?
    stager.extendStep('employmentIdentification1', {
        cb: function () {
            var next;
            // samira: why do we need to set node.game.nextBtn
            node.game.nextBtn = next = W.getElementById("continueButton");
            next.onclick = function() {
                 // samira: why do we need this?
                this.disabled = "disabled";
                node.done();
              
            };

            // Require sample images. Calling them here already so that we load the images
            // beforehand
            if (!node.game.wentBack) {
                this.getSample();
                this.getSimilarityScore();
                this.getThreshold();
                this.getRandomSample();
            }
        }
    });


    stager.extendStep('employmentIdentification2', {
        cb: function () {
            var next;
            var previous;        
            W.hide("employmentIdentificationPage1");
            W.show("employmentIdentificationPage2");
            next = W.getElementById("nextButton");
            next.onclick = function(){
                node.done('taking the quiz');
            };
            
            previous = W.getElementById("prevButton");
            previous.onclick = function(){
                W.hide("employmentIdentificationPage2");
                W.show("employmentIdentificationPage1");
                var continueButton = W.getElementById('continueButton');
                continueButton.disabled = false;
                continueButton.onclick = function(){
                    W.hide("employmentIdentificationPage1");
                    W.show("employmentIdentificationPage2");
                }
            };

            //node.done('starting the quiz');
        }
            
    });


    stager.extendStep('quiz', {
        frame: 'quiz.htm',
        /*widget: {
            name: 'ChoiceManager', 
            root: 'quiz',
            title: 'Before continuing the HIT, please answer the following questions:',
            options: {
                id: 'quizzes',
                title: false,
                forms: [
                    {
                        name: 'ChoiceTable',
                        id: 'threshold',
                        mainText: 'The FRS threshold value is a number',
                        shuffleChoices: true,
                        //requiredChoice: true,
                        title: false,
                        choices: ['in the range 0%-100%', 'in the range 0-1',
                         'bigger than 50%', 'smaller than 50%'],
                        correctChoice: 1, 
                        // choices are numbers starting at 0
                    },
                    {
                        name: 'ChoiceTable',
                        id: 'role',
                        shuffleChoices: true,
                        //requiredChoice: true,
                        title: false,
                        //orientation: 'v',
                        choices: ['employee', 'receptionist', 'none'],
                        correctChoice: 1,
                        mainText: 'In this study, which role are you playing' +
                        ' in the employment identification scenario?',
                    },
                    {
                        name: 'ChoiceTable',
                        id: 'probe',
                        shuffleChoices: true,
                        title: false,
                        //orientation: 'v',
                        choices: ['Image of the employee in the gallery',
                         'photo taken by the security camera',
                         'photo on the employee ID card' , 'none'],
                        //correctChoice: t === 'pp' ? 1 : 3,
                        correctChoice: 1,
                        mainText: 'What is a probe image?',
                    },
                    {
                        name: 'ChoiceTable',
                        id: 'match',
                        shuffleChoices: true,
                        title: false,
                        //orientation: 'v',
                        choices: ['A photo in the gallery which has similarity score higher than 50% with the probe',
                        'A photo in the gallery which has similarity score higher than the FRS threshold value with the probe',
                        'The photo on the employee ID card',
                         'none'],
                        //correctChoice: t === 'pp' ? 1 : 3,
                        correctChoice: 1,
                        mainText: 'What is a match?',
                    }
                    
                ]
            }
        },*/
 
        cb: function() {
           // node.widgets.append('DoneButton', W.gid('root'), {
           //     title: false,
           //     text: 'Done'
            //});


            //node.widgets.append('BackButton', W.gid('root'), {
            //   title: false,
            //   text: 'back to instructions'
            //});
            console.log('ta inja umad')
            var w = node.widgets;
            console.log('gir kard')
            this.quiz = w.append('ChoiceManager', W.gid('quiz'),{
                id: 'quizzes',
                title: false,
                forms:[
                    w.get('ChoiceTable', {
                        id: 'threshold',
                        mainText: 'The FRS threshold value is a number',
                        shuffleChoices: true,
                        //requiredChoice: true,
                        title: false,
                        choices: ['in the range 0%-100%', 'in the range 0-1',
                         'bigger than 50%', 'smaller than 50%'],
                        correctChoice: 1, 
                    }),

                    w.get('ChoiceTable', {
                        id: 'role',
                        shuffleChoices: true,
                        //requiredChoice: true,
                        title: false,
                        //orientation: 'v',
                        choices: ['employee', 'receptionist', 'none'],
                        correctChoice: 1,
                        mainText: 'In this study, which role are you playing' +
                        ' in the employment identification scenario?',
                    }),
                    w.get('ChoiceTable', {
                        id: 'probe',
                        shuffleChoices: true,
                        title: false,
                        //orientation: 'v',
                        choices: ['Image of the employee in the gallery',
                         'photo taken by the security camera',
                         'photo on the employee ID card' , 'none'],
                        correctChoice: 1,
                        mainText: 'What is a probe image?',
                    }),
                    w.get('ChoiceTable', {
                        id: 'match',
                        shuffleChoices: true,
                        title: false,
                        //orientation: 'v',
                        choices: ['A photo in the gallery which has similarity score higher than 50% with the probe',
                        'A photo in the gallery which has similarity score higher than the FRS threshold value with the probe',
                        'The photo on the employee ID card',
                         'none'],
                        correctChoice: 1,
                        mainText: 'What is a match?',
                    }),
                ],
                formsOptions: {
                    requiredChoice: true
                }
            });


            var that = this;
            var done = W.gid("quizDone");
            done.onclick = function(){
                var answers = that.quiz.getValues({
                    markAttempt: true,
                    highlight: true
                });
                console.log('inside done')
                if (answers.isCorrect){
                    console.log('inside if')
                    W.hide('root');
                    node.game.gotoStep(node.game.getNextStep(1));
                    console.log('why does it show blank then?')
                    node.done('quiz is done correctly');
                }
               
            }

            var prev = W.gid('backToInstructions');
            prev.onclick = function() {
                node.game.wentBack = true;
                node.game.gotoStep(node.game.getPreviousStep(2));
                // W.hide("quiz");
                // W.show("employmentIdentificationPage2");
            }


        }
    });
                    

   
    stager.extendStep('instructions2', {
        frame: 'instructions2.htm',
        cb: function() {
            
            var next = W.getElementById('continueButton');
            // next.disabled = false;
            next.onclick = function(){
                node.done();
             }
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
