////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// SERVER /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isServer) {
    //Array, das Fertigstellung der slots trackt
    // var timers = [];
    Meteor.startup(function() {
        // code to run on server at startup
        /*  WebApp.rawConnectHandlers.use(function (req, res, next) {
            res.setHeader('cache-control', 'max-age=31536000');
            next();
        });*/
    });

    // OLD OLD 2015/12/19 OLD OLD
    // updateTimers = function() {
    //     //timers0 = menu, timers1 = user, timers2 = slot, timers3 = time
    //     //falls timers bereits gesetzt ist
    //     if (timers) {
    //         //für jeden Eintrag im Array
    //         for (i = 0; i < timers.length; i++) {
    //             //falls noch verbleibende Zeit vorhanden
    //             // console.log(timers[i][3] > 0);
    //             if (timers[i][3] > 0) {
    //                 //decrement time
    //                 // console.log('OneTimer',timers[i][3]);
    //                 timers[i][3] = timers[i][3] - 1000;
    //                 //für einen slot timer ist die Zeit abgelaufen >> trigger update
    //             } else if (timers[i][0] === 'mine') {
    //                 // console.log('mine');
    //                 // console.log('update slot', timers[i][2], 'of user', timers[i][1], 'in mine');
    //                 updateMineSlot(timers[i][1], timers[i][2]);
    //                 //remove timer
    //                 timers.splice(i, 1);
    //             } else if (timers[i][0] === 'battlefield') {
    //                 // console.log('battlefield');
    //                 // console.log('update slot', timers[i][2], 'of user', timers[i][1], 'in battlefield');
    //                 updateBattlefieldSlot(timers[i][1], timers[i][2]);
    //                 //remove timer
    //                 timers.splice(i, 1);
    //             }
    //         }
    //     }
    // }
    // OLD OLD 2015/12/19 OLD OLD
    
    checkIfDuplicate = function(user, slot) {
        // console.log('checkIfDuplicate');
        //falls der Timer einen Eintrag hat
        if (timers.length > 0) {
            //prüfe, ob der gescroungte slot bereits vorhanden ist und beschleunigt werden muss (wegen neuem sup)
            for (var i = 0; i < timers.length; i++) {
                // console.log('i', i);
                // console.log('timer', i, 'user', timers[i][1], user, 'slot', timers[i][2], slot);
                var userFromTimer = timers[i][1];
                var slotFromTimer = timers[i][2];
                //falls Name und Slot in derselben Kombination bereits im timer eingetragen sind, gebe slot zurück, der
                //ausgetauscht werden muss
                if (userFromTimer == user && slotFromTimer == slot) {
                    // console.log('checkIfDuplicate true > updateTimer');
                    return i;
                } else {
                    //kein Duplikat
                    // console.log('timers not empty but slot not duplicate either');
                    return "push";
                }
            }
            //falls der Timer noch keinen Eintrag hat
        } else {
            //falls der Timer noch keinen Eintrag hat, kann der gescroungte slot auch nicht bereits darin enthalten sein
            // console.log('timers empty > push timer');
            return "push";
        }
    }

    dateInMs = function() {
        return (new Date()).getTime();
    }

    msToTime = function(ms) {
        var helper = Math.round(ms / 1000);
        var secs = helper % 60;
        helper = (helper - secs) / 60;
        var mins = helper % 60;
        var hrs = (helper - mins) / 60;
        return hrs + ':' + mins + ':' + secs;
    }
}
