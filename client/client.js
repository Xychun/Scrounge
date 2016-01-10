////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// CLIENT /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isClient) {

    ////////////////////////////
    ///// GLOBAL VARIABLES /////
    ////////////////////////////

    GV_timers = new Array();
    GV_mapRows = 6;
    GV_mapColumns = 8;
    GV_category_names = ["mine", "laboratory", "battlefield", "workshop", "thievery", "smelter"];
    GV_current_category = 1; //Start Kategorie

    //TimeSync.serverTime(Date.now())      used for serverTime in ms
    //GV_timeDifference                    is initialized in the router.js

    ////////////////////////////
    ////// FUNCTION CALLS //////
    ////////////////////////////

    Meteor.call('rootUrl', function(err, result) {
        if (err) {
            console.log('rootUrl Error: ' + err);
        }
        if (result) {
            console.log('Serving from:', result);
            console.log('Current server time:', (new Date(TimeSync.serverTime(Date.now()))).toString());
        }
    });

    TimeSync.loggingEnabled = false

    // OLD OLD 2015/12/19 OLD OLD
    // // setInterval(function() {
    // //     updateTimers();
    // // }, 1 * 1000);

    // //Client Live Render timers that increase or decrease value by 1 second
    // function updateTimers() {
    //     for (var i = 0; i < GV_timers.length; i++) {
    //         if ($('#' + GV_timers[i].id).length >= 0) {
    //             var value = GV_timers[i].miliseconds + (GV_timers[i].prefix * 1000);
    //             if (value < 0) value = 0;
    //             GV_timers[i].miliseconds = value;
    //             $('#' + GV_timers[i].id).text(msToTime(GV_timers[i].miliseconds));
    //         } else {
    //             //Element not found and deleted after 3rd time
    //             if (GV_timers[i].notFound > 2) {
    //                 GV_timers.splice(i, 1);
    //             } else {
    //                 GV_timers[i].notFound++;
    //             }
    //         }
    //     }
    // }
    // OLD OLD 2015/12/19 OLD OLD

    msToTime = function(ms) {
        var helper = Math.round(ms / 1000);
        var secs = helper % 60;
        helper = (helper - secs) / 60;
        var mins = helper % 60;
        var hrs = (helper - mins) / 60;
        return hrs + ':' + mins + ':' + secs;
    }

    showInfoTextAnimation = function(text) {

        var textForAnimation = text.substring(1);
        var textAnimation = document.createElement("p");
        var textAnimationWrapper = document.createElement("div");
        textAnimation.innerHTML = textForAnimation;
        textAnimation.style.color = checkColorCode(text);
        textAnimation.id = "textAnimation";
        textAnimation.className = "hammersmith";
        textAnimationWrapper.id = "textAnimationWrapper";
        textAnimationWrapper.className = "div_center_vertical";

        if (document.getElementById("oben")) document.getElementById("oben").appendChild(textAnimationWrapper);
        if (document.getElementById("textAnimationWrapper")) document.getElementById("textAnimationWrapper").appendChild(textAnimation);
        setTimeout(function() {
            if (document.getElementById("textAnimationWrapper")) document.getElementById("textAnimationWrapper").removeChild(document.getElementById("textAnimation"))
        }, 1000);
    }

    //argument text needs to have a number (0 || 1 || 2) as the first character for color coding
    infoLog = function(text) {
        var logInput = text.substring(1);
        var log = document.createElement("div");
        log.innerHTML = (new Date).toTimeString() + ': ' + logInput;
        log.className = "logs";
        log.style.color = checkColorCode(text);
        $("#infoLog").prepend(log);
    }

    checkColorCode = function(infoLogText) {
        var logInput = infoLogText.substring(1);
        var colorCode = infoLogText.substring(0, 1);
        var color;
        switch (colorCode) {
            //positive message
            case "0":
                color = "tomato";
                break;
                //negative message
            case "1":
                color = "greenyellow";
                break;
                //neutral message
            case "2":
                color = "white";
            default:
                console.log('default case: checkColorCode');
                color = "black";
        }
        return color;
    }

    ///////////////////
    /// SCALABILITY ///
    ///////////////////

    function createBots(k, l) {
        for (var i = k; i < l + 1; i++) {
            Meteor.call('initBots', i, function(error, result) {
                if (error) {
                    console.log('err bot creation:', error.reason);
                    return;
                }
            });
        }
    }

    ///////////////////
    //// DEBUGGING ////
    ///////////////////

    function logRenders() {
        _.each(Template, function(template, name) {
            var oldRender = template.rendered;
            var counter = 0;

            template.rendered = function() {
                // console.log(name, "render count: ", ++counter);
                oldRender && oldRender.apply(this, arguments);
            };
        });
    }
}
