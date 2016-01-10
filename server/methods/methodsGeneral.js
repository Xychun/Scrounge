////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// SERVER /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isServer) {
    var turfUpdateArray = new Array();
    var loop = false;

    Meteor.startup(function() {
        // code to run on server at startup
        // Meteor.setInterval(function() {
        //     updateTimers();
        // }, 1 * 1000);
    });

    //Methods
    Meteor.methods({
        rootUrl: function() {
            return process.env.ROOT_URL;
        },

        asyncJob: function() {
            this.unblock();
        },

        getServerTime: function() {
            return new Date();
        },

        // singleUpdate: function() {
        //     Meteor.call('update');
        // },

        // updateLoop: function(tick) {
        //     if (loop == false) {
        //         loop = true;
        //         console.log('update LOOP starts!');
        //         Meteor.call('update');
        //         updateInterval = Meteor.setInterval(function() {
        //             Meteor.call('update');
        //         }, tick * 1000);
        //     } else {
        //         console.log('update LOOP stopps!');
        //         Meteor.clearInterval(updateInterval);
        //     }
        // },

        // update: function() {
        //     var START = new Date().getTime();
        //     console.log('update START', new Date());

        //     var allUsers = Meteor.users.find({}).fetch();
        //     //Iterate all users
        //     for (var i = 0; i < allUsers.length; i++) {
        //         var cUser = allUsers[i].username;
        //         var cPData = playerData.findOne({
        //             user: cUser
        //         });
        //         Meteor.call('updateMine', cUser, cPData);
        //         Meteor.call('updateBattlefield', cUser, cPData);
        //     };

        //     var END = new Date().getTime();
        //     var DURATION = END - START;
        //     console.log('update END:', new Date(), 'Duration:', DURATION);
        // },

        //ERROR logging
        infoLog: function(text, username) {
            console.log(new Date(), username + ':', text);
        },

        initialUpdate: function(user) {
            // console.log('initalUpdate');

            //pD of active player
            //console.time('InitialUpdate');
            var pD = playerData.findOne({
                user: user
            });

            //update own slots
            var username = pD.user;
            var ownSlotsMine = pD.mine.amountOwnSlots;
            var ownSlotsBattlefield = pD.battlefield.amountOwnSlots;

            for (var i = 0; i < ownSlotsMine; i++) {
                // console.log('own mine', i);
                // console.log('slot', i, 'of user', username, 'might need update');
                remainingMine = updateMineSlot(username, i);
                //falls slot benutzt und noch Zeit verbleibend
                if (remainingMine > 0) {
                    // console.log('saved', i, 'into mine timer, initialUpdate');
                    timers.push(['mine', username, i, remainingMine]);
                }
            }
            for (var b = 0; b < ownSlotsBattlefield; b++) {
                // console.log('own battlefield', b);
                // console.log('slot', b, 'of user', username, 'might need update');
                remainingBattlefield = updateBattlefieldSlot(username, b);
                //falls slot benutzt und noch Zeit verbleibend
                if (remainingBattlefield > 0) {
                    // console.log('saved', b, 'into battlefield timer, initialUpdate');
                    timers.push(['battlefield', username, b, remainingBattlefield]);
                }
            }

            //check which scrounge slots might need an update
            var scrSlotsMine = pD.mine.amountScrSlots;
            var scroungedSlotsUsersMine = {};
            var scrSlotsBattlefield = pD.battlefield.amountScrSlots;
            var scroungedSlotsUsersBattlefield = {};

            //mine
            for (var m = 0; m < scrSlotsMine; m++) {
                // console.log('mine', m);
                var scroungedUser = pD.mine.scrSlots['scrs' + m].victim.name;
                //falls scr slot benutzt
                if (scroungedUser != "") {
                    var pDscroungedUser = playerData.findOne({
                        user: scroungedUser
                    }).mine;
                    var ownSlots = pDscroungedUser.amountOwnSlots;
                    var supSlots = pDscroungedUser.amountSupSlots;
                    var indexScr = -1;
                    for (k = 0; k < ownSlots; k++) {
                        for (m = 0; m < supSlots; m++) {
                            if (pDscroungedUser.ownSlots['owns' + k]['sup' + m].name == pD.user) indexScr = k;
                        }
                    }
                    //falls ein slot gefunden wurde, der evtl. update benötigt
                    if (indexScr != -1) {
                        //update this slot if need be
                        // console.log('slot', indexScr, 'of user', scroungedUser, 'might need update');
                        remainingMine = updateMineSlot(scroungedUser, indexScr);
                        //falls slot benutzt und noch Zeit verbleibend
                        if (remainingMine > 0) timers.push(['mine', scroungedUser, indexScr, remainingMine]);
                    } else {
                        // console.log('serious PROBLEM, slot calculation initialUpdate Mine');
                    }
                }
            }
            //battlefield
            for (var z = 0; z < scrSlotsBattlefield; z++) {
                // console.log('battlefield', z);
                var scroungedUser = pD.battlefield.scrSlots['scrs' + z].victim.name;
                if (scroungedUser != "") {
                    var pDscroungedUser = playerData.findOne({
                        user: scroungedUser
                    }).battlefield;
                    var ownSlots = pDscroungedUser.amountOwnSlots;
                    var supSlots = pDscroungedUser.amountSupSlots;
                    var indexScr = -1;
                    for (r = 0; r < ownSlots; r++) {
                        for (m = 0; m < supSlots; m++) {
                            if (pDscroungedUser.ownSlots['owns' + r]['sup' + m].name == pD.user) indexScr = r;
                        }
                    }
                    //falls ein slot gefunden wurde, der evtl. update benötigt
                    if (indexScr != -1) {
                        //update this slot if need be
                        // console.log('slot', indexScr, 'of user', scroungedUser, 'might need update');
                        remainingBattlefield = updateBattlefieldSlot(scroungedUser, indexScr);
                        //falls slot benutzt und noch Zeit verbleibend
                        if (remainingBattlefield > 0) timers.push(['battlefield', scroungedUser, indexScr, remainingBattlefield]);
                    } else {
                        // console.log('serious PROBLEM, slot calculation initialUpdate Battlefield');
                    }
                }
            }
            //console.timeEnd('InitialUpdate');
            //dieser return hat noch keine Bewandnis, vllt in Zukunft für etwas nützlich
            return 'update done'
        },

        // initBots: function(i) {
        //     function asyncInitBots(callsCount, callback) {
        //         callback(null);
        //     }
        //     var syncInitBots = Meteor.wrapAsync(asyncInitBots);
        //     try {
        //         var res = syncInitBots(i);
        //         var name = "bot" + i;
        //         var pw = i.toString();
        //         Accounts.createUser({
        //             username: name,
        //             password: pw
        //         });
        //         Meteor.call('init', name);
        //         return res;
        //     } catch (exception) {
        //         console.log('exc:', exception);
        //         throw exception;
        //     }
        // }
    });
}
    // function updateBattlefieldSlot(user, slotNumber) {

    //     //console.time('UPDATEBS');

    //     //what is left of an unfinished slot
    //     var remaining = 0;

    //     var slot = 'owns' + slotNumber;

    //     var pD = playerData.findOne({
    //         user: user
    //     }, {
    //         fields: {
    //             'backgroundId': 0,
    //             'mine': 0,
    //             'laboratory': 0,
    //             'thievery': 0,
    //             'workshop': 0,
    //             'smelter': 0,
    //             'battlefield.amountScrSlots': 0,
    //             'battlefield.science': 0,
    //             'battlefield.minControl': 0,
    //             'battlefield.maxControl': 0,
    //             'battlefield.ownItem': 0,
    //             'battlefield.scrItem': 0,
    //             'battlefield.scrSlots': 0,
    //             'battlefield.ownSlots.owns0.control': 0,
    //             'battlefield.ownSlots.owns1.control': 0,
    //             'battlefield.ownSlots.owns2.control': 0,
    //             'battlefield.ownSlots.owns3.control': 0,
    //             'battlefield.ownSlots.owns4.control': 0,
    //             'battlefield.ownSlots.owns5.control': 0,
    //         }
    //     });
    //     var pDB = pD.battlefield;
    //     var battlefieldOwnSlots = pDB.amountOwnSlots;
    //     var battlefieldSupSlots = pDB.amountSupSlots;
    //     var serverTime = new Date().getTime();

    //     //update battlefield of user || ownSlots
    //     var fightID = pDB.ownSlots[slot].input;
    //     //slot used?
    //     if (fightID > 0) {
    //         var fight = FightArenas.findOne({
    //             fight: fightID
    //         }, {
    //             fields: {
    //                 name: 0,
    //                 cost: 0,
    //             }
    //         });
    //         var startTime = pDB.ownSlots[slot].stamp;
    //         var overallTime = fight.time;
    //         //fight finished?
    //         if ((serverTime - startTime) > overallTime) {
    //             // console.log('fight finished',(serverTime - startTime) > overallTime);
    //             var sups = [];
    //             var supEpics = 0;
    //             //iterate supporter
    //             for (var k = 0; k < battlefieldSupSlots; k++) {
    //                 var sup = pDB.ownSlots[slot]['sup' + k];
    //                 //slot used?
    //                 if (sup.name != "") {
    //                     supTime = sup.stamp;
    //                     supEpic = sup.benefit;
    //                     supEpics = supEpics + supEpic;
    //                     sups.push(sup.name);
    //                 }
    //             }
    //             //split XP
    //             overallXP = parseInt(((fight.value * (100 + supEpics)) / 100));
    //             var ownProfit = 0;
    //             // console.log('overallXP', overallXP);
    //             //falls keine supporter, user bekommt ganzen Gewinn
    //             if (sups.length == 0) {
    //                 // console.log('no sups present');
    //                 ownProfit = overallXP;
    //                 //falls supporter, user bekommt Teil des Gewinns
    //             } else {
    //                 // console.log('sups present');
    //                 ownProfit = 0.5 * overallXP;
    //                 //jeder supporter bekommt einen Teil der Hälfte
    //                 var supProfit = (0.5 * overallXP) / sups.length;
    //                 // console.log('supProfit', supProfit);
    //             }
    //             //lvl up user
    //             var userXP = parseInt(pD.XP);
    //             var userReqXP = parseInt(pD.requiredXP);
    //             // console.log('userXP',userXP);
    //             // console.log('userReqXP',userReqXP);
    //             if ((userXP + ownProfit) >= userReqXP) {
    //                 var lvl = pD.level;
    //                 var obj0 = {};
    //                 obj0['requiredXP'] = userReqXP + (225 * ((lvl + 10) / 2))
    //                 obj0['XP'] = (userXP + ownProfit) - userReqXP;
    //                 obj0['level'] = lvl + 1;
    //                 // console.log('obj0', obj0);
    //                 playerData.update({
    //                     user: user
    //                 }, {
    //                     $set: obj0
    //                 });
    //             } else {
    //                 var userNewXPValue = (userXP + ownProfit);
    //                 // console.log('userNewXPValue',userNewXPValue);
    //                 playerData.update({
    //                     user: user
    //                 }, {
    //                     $set: {
    //                         XP: userNewXPValue
    //                     },
    //                 });
    //             }
    //             //lvl up sups
    //             for (var m = 0; m < sups.length; m++) {
    //                 var pDsup = playerData.findOne({
    //                     user: sups[m]
    //                 }, {
    //                     fields: {
    //                         requiredXP: 1,
    //                         XP: 1,
    //                         level: 1,
    //                     }
    //                 });
    //                 var supXP = pDsup.XP;
    //                 var supReqXP = pDsup.requiredXP;
    //                 if ((supXP + ownProfit) >= supReqXP) {
    //                     var lvl = pDsup.level;
    //                     var obj0 = {};
    //                     obj0['requiredXP'] = (supReqXP + (225 * ((lvl + 10) / 2)));
    //                     obj0['XP'] = ((supXP + ownProfit) - supReqXP);
    //                     obj0['level'] = (lvl + 1);
    //                     // console.log('obj0', obj0);
    //                     playerData.update({
    //                         user: sups[m]
    //                     }, {
    //                         $set: obj0
    //                     });
    //                 } else {
    //                     var supNewXPValue = (supXP + ownProfit);
    //                     playerData.update({
    //                         user: sups[m]
    //                     }, {
    //                         $set: {
    //                             XP: supNewXPValue
    //                         },
    //                     });
    //                 }
    //                 //reset sup scr slot
    //                 var pDBsup = playerData.findOne({
    //                     user: sups[m]
    //                 }, {
    //                     fields: {
    //                         'battlefield.amountScrSlots': 1,
    //                         'battlefield.scrSlots.scrs0.victim.name': 1,
    //                         'battlefield.scrSlots.scrs1.victim.name': 1,
    //                         'battlefield.scrSlots.scrs2.victim.name': 1,
    //                         'battlefield.scrSlots.scrs3.victim.name': 1,
    //                         'battlefield.scrSlots.scrs4.victim.name': 1,
    //                         'battlefield.scrSlots.scrs5.victim.name': 1,
    //                     }
    //                 }).battlefield;
    //                 var supScrSlots = pDBsup.amountScrSlots;
    //                 for (var w = 0; w < supScrSlots; w++) {
    //                     if (pDBsup.scrSlots['scrs' + w].victim.name == user) indexScr = w;
    //                 }
    //                 var obj0 = {};
    //                 obj0['battlefield.scrSlots.scrs' + indexScr + '.benefit'] = 50;
    //                 obj0['battlefield.scrSlots.scrs' + indexScr + '.stamp'] = "";
    //                 obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.supSlotsVictim'] = "";
    //                 obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.name'] = "";
    //                 obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.stamp'] = "";
    //                 obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.input'] = "";
    //                 for (var t = 0; t < sups.length; t++) {
    //                     obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.name'] = "";
    //                     obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.benefit'] = 50;
    //                     obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.stamp'] = "";
    //                 }
    //                 playerData.update({
    //                     user: sups[m]
    //                 }, {
    //                     $set: obj0
    //                 });
    //             }
    //             //reset user slots
    //             var obj0 = {};
    //             obj0['battlefield.ownSlots.' + slot + '.input'] = "0000";
    //             obj0['battlefield.ownSlots.' + slot + '.stamp'] = "";
    //             obj0['battlefield.ownSlots.' + slot + '.control.min'] = 0.1;
    //             obj0['battlefield.ownSlots.' + slot + '.control.max'] = 10;
    //             for (var s = 0; s < battlefieldSupSlots; s++) {
    //                 obj0['battlefield.ownSlots.' + slot + '.sup' + s + '.name'] = "";
    //                 obj0['battlefield.ownSlots.' + slot + '.sup' + s + '.benefit'] = 5;
    //                 obj0['battlefield.ownSlots.' + slot + '.sup' + s + '.stamp'] = "";
    //                 obj0['battlefield.ownSlots.' + slot + '.sup' + s + '.level'] = "";
    //             }
    //             playerData.update({
    //                 user: user
    //             }, {
    //                 $set: obj0
    //             });
    //             //if slot isn't finished, remember remaining
    //         } else {
    //             remaining = overallTime - (serverTime - startTime);
    //         }
    //     }
    //     // console.log('ENDB',user,slot);
    //     //console.timeEnd('UPDATEBS');

    //     return remaining;
    // }