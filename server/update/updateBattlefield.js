/////////////////////////
////// BATTLEFIELD //////
/////////////////////////

updateBattlefieldSlot = function(owner, slotID) {
    console.log('updateBattlefieldSlot:', owner, 'slotID:', slotID);
    var cursorBattlefieldBase = battlefieldBase.findOne({
        user: owner,
        slotID: slotID
    });
    //cursorBattlefieldBase.remaining: DOUBLE-CHECK FINISH
    //cursorBattlefieldBase.input != "0000": the update works but if the update and reset takes longer than the update time (1000ms) the matter value in the db results into a null (NaN) value because it will start the update methode again before the reset is done; tried db.collection.findAndModify but only accesses one document
    if (cursorBattlefieldBase.remaining <= 0 && cursorBattlefieldBase.input != "0000") {
        disableBattlefieldBase(owner, slotID);
        var arrayBattlefieldSupport = battlefieldSupport.find({
            user: owner,
            refID: slotID,
            supporter: {
                $nin: [null, ""]
            }
        }).fetch();
        //GET LOOT
        //owner
        var splitShare = split("battlefield", "base", owner, owner, slotID);
        console.log('splitShareOwner:', splitShare);
        playerData.update({
            user: owner
        }, {
            $inc: {
                XP: splitShare
            }
        });
        //supporter
        for (var i = 0; i < arrayBattlefieldSupport.length; i++) {
            var sup = arrayBattlefieldSupport[i].supporter
            var splitShare = split("battlefield", "base", owner, sup, slotID);
            console.log('splitShareSupporter:', splitShare);
            playerData.update({
                user: sup
            }, {
                $inc: {
                    XP: splitShare
                }
            });
        };
        //RESET SLOTS
        //battlefieldScrounge of supporter
        for (var i = 0; i < arrayBattlefieldSupport.length; i++) {
            var sup = arrayBattlefieldSupport[i].supporter
            resetBattlefieldScrounge(sup, owner, slotID);
        };
        //battlefieldSupport of owner
        resetBattlefieldSupport(owner, slotID);
        //battlefieldBase of owner
        resetBattlefieldBase(owner, slotID);
    }
}

// OLD OLD 2016/01/05 OLD OLD
// updateBattlefieldSlot = function(user, slotNumber) {
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
//     // console.log('fightID', fightID);
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
//             // console.log('fight finished', (serverTime - startTime) > overallTime);
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
//             // console.log('userXP', userXP);
//             // console.log('userReqXP', userReqXP);
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
//                 // console.log('userNewXPValue', userNewXPValue);
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
//     // console.log('ENDB', user, slot);
//     //console.timeEnd('UPDATEBS');

//     return remaining;
// }
// OLD OLD 2016/01/05 OLD OLD
