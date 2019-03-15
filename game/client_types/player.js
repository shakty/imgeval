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
        this.counter = -1;

        // Contains data about the images to display, and sets completed.
        this.images = {};

        // Automatically stops from asking the next set of images to rate
        // (the server would not send them anyway).
        this.nSetsLimit = this.settings.SETS_MAX -1;

        // If TRUE, the loop at imgscore is broken.
        this.enoughSets = false;

        this.displayPair = function(j) {
            var sampleDiv, imgPair, img, img2;
            
            imgPair = this.sample[j];
            img = document.createElement('img');
            img.src = node.game.settings.IMG_DIR + imgPair.a;
            img.className = 'imgSample';

            img2 = document.createElement('img');
            img2.src = node.game.settings.IMG_DIR + imgPair.b;
            img2.className = 'imgSample';

            sampleDiv = W.getElementById('training');
            sampleDiv.appendChild(img);
            sampleDiv.appendChild(img2);

            W.adjustFrameHeight();
            // sampleDiv.appendChild(document.createElement('br'));
            // sampleDiv.appendChild(document.createElement('br'));
        };

        // Samira: Can I pass variable like this?
        this.getSample = function() {
            console.log('inside getSample')
            var that;
            //var next;
            //Samira: what's the point of this?
            that = this;
            // next = W.getElementById("doneButton");
            // Preloading the sample
            // Samira: This means that we call function get.sample from logic and put the output in sample?
            node.get('sample', function(sample) {
                that.sample = sample;
            });
        };

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
        console.log('imgIdentify');

        var next, mainImg;
        var ctgOptions, ctgRoot;
        var i, len, items;

        this.displayPair(node.game.getRound());

        if (!node.game.score) {

            ctgRoot = W.getElementById('td_score');
            ctgOptions = node.game.settings.SCORE_OPTIONS;
            if (!ctgOptions.id) ctgOptions.id = 'identify';
            if (!ctgOptions.title) ctgOptions.title = false;

           
            // Samira: what is node.game.score?
            // node.game.score = node.widgets.append('ChoiceTableGroup', ctgRoot,
            //                                     ctgOptions);
        }

        W.show('image_table');
        W.hide('continue');

        function displayImage() {
            var imgPath;
            imgPath = node.game.images.items[++node.game.counter];
            mainImg.src = node.game.settings.IMG_DIR + imgPath;
            next.disabled = false;
            node.timer.setTimestamp('newpic_displayed');
        }

        function onNextImages(images) {
            var len;
            if (images.noMore) {
                alert('Unfortunately, all remaning sets have been taken. ' +
                     'You will now be moved to the final stage.');
                node.game.enoughSets = true;                
                node.say('enoughSets');
                return;
            }
            node.game.counter = -1;
            node.game.images = images;
            len = images.items.length;
            // A reconnection.
            if (len !== node.game.settings.NIMAGES) {
                node.game.images.offset = node.game.settings.NIMAGES - len;
                updateNextButton();
            }
            displayImage();
        }

        function askForNext() {
            var images, obj, counter;
            var img, time2score;

            time2score = node.timer.getTimeSince('newpic_displayed');
            next.disabled = true;
            counter = node.game.counter;
            images = node.game.images;

            if (counter !== -1 && counter < images.items.length) {
                obj = node.game.score.getValues({ 
                    reset: { shuffleItems: true }
                });
                if (obj.missValues) {
                    next.disabled = false;
                    return;
                }
                updateNextButton(counter+1);

                // Path to the image, used as id.
                img = images.items[counter];
                obj.id = img;

                node.say('score', 'SERVER', obj);
            }

            // Ask the server for the next set of images.
            if (!images.items) {
                node.get('NEXT', onNextImages);
            }
            else if (counter >= (images.items.length -1)) {
                W.hide('image_table');
                node.done();                
            }
            else {
                displayImage();
            }
        }

        function updateNextButton(counter) {
            var offset;
            counter = counter || 0;
            offset = node.game.images.offset || 0;
            next.innerHTML = 'Next (' + (offset + counter) + '/' +
                node.game.settings.NIMAGES + ')';
        }

        // Elements of the page.

        // Next button.
        node.game.nextBtn = next = W.getElementById("doneButton");

        // Img.
        mainImg = W.getElementById('image');


        // Click!
        next.disabled = false;
        next.innerHTML = 'Next';
        next.onclick = askForNext;
        next.click();
    }

    function continueCb() {
        var remainingSets;
        W.hide('image_table');
        remainingSets = this.settings.SETS_MAX - (this.images.completedSets+1);
        W.setInnerHTML('remaining', remainingSets);
        // All sets scored.
        if (this.images.completedSets >= this.nSetsLimit) {
            W.show('end');
            W.getElementById('endButton').onclick = function() {
                // Triggers to go to next stage.
                node.get('NEXT', function() {});
            };
        }
        // Display option to continue.
        else {
            W.show('continue');
            // Hide old image.
            W.getElementById('image').src = '/images/loading.gif';
            // Set listeners.
            W.getElementById('yes').onclick = function() {
                // Need to update both.
                node.game.counter = -1;
                node.game.images = {};
                node.done();
            };
            W.getElementById('no').onclick = function() {
                node.game.enoughSets = true;                
                node.say('enoughSets');
            };
        }
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

    // Instructions.
    stager.extendStage('instructions', {
        frame: 'instructions.htm'
    });
                       
    stager.extendStep('employmentIdentification', {
        cb: function () {
            
            var next
            var s;
            // s = node.game.settings;
            // W.setInnerHTML('nimages', s.NIMAGES);
            // W.setInnerHTML('sets_lowbound', s.SETS_MIN);
            //if (s.SETS_MIN !== 1) W.setInnerHTML('set_plural', 'sets');
            //W.setInnerHTML('sets_highbound', s.SETS_MAX);

            node.game.nextBtn = next = W.getElementById("doneButton");
            next.onclick = function() {
                this.disabled = "disabled";
                node.done();
            };

            // Require sample images.
            this.getSample(0);
        }
    });

    stager.extendStep('FRS', {
       cb: function() {
        //    var s, ul, li;
        //    var i, len;

            W.hide("employmentIdentificationPage");
            W.show("FRSPage");

            // 
            //s = node.game.settings.SCORE_OPTIONS;
            //W.setInnerHTML('grade_lowest', s.choices[0]);
            //W.setInnerHTML('grade_highest', s.choices[(s.choices.length-1)]);

            //ul = W.getElementById('dimensions_list');
            //i = -1, len = s.items.length;
            //for ( ; ++i < len ; ) {
            //    li = document.createElement('li');
            //    li.innerHTML = s.items[i];
            //    ul.appendChild(li);
            //} -->

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

        // cb: function() {
        //     var next, doneTimerSpan;
            
        //     console.log('faceComparison');

        //     W.hide('FRS');
        //     W.show("faceComparison");
            
        //     next = W.getElementById("doneButton");
        //     doneTimerSpan = W.getElementById("doneTimer");

        //     node.game.doneTimer =
        //         node.widgets.append('VisualTimer', doneTimerSpan, {
        //             milliseconds: 30000,
        //             name: 'candonext',
        //             listeners: false,
        //             timeup: function() {
        //                 next.disabled = false;
        //             }
        //         });

        //     node.game.doneTimer.start();
        }
    });


    //training

    stager.extendStep('training', {
        frame: 'training.htm',
        cb: imgIdentify
    });


    // Thank you.
    stager.extendStep('thankyou', {
        cb: thankyou,
        frame: 'thankyou.htm'
    });

};
