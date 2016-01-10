/////////////////////////
////////// MINE /////////
/////////////////////////

updateMineSlot = function(owner, slotID) {
    console.log('updateMineSlot:', owner, slotID);
    var cursorMineBase = mineBase.findOne({
        user: owner,
        slotID: slotID
    });
    //cursorMineBase.remaining: DOUBLE-CHECK FINISH
    //cursorMineBase.input != "0000": the update works but if the update and reset takes longer than the update time (1000ms) the matter value in the db results into a null (NaN) value because it will start the update methode again before the reset is done; tried db.collection.findAndModify but only accesses one document
    if (cursorMineBase.remaining <= 0 && cursorMineBase.input != "0000") {
        disableMineBase(owner, slotID);
        var arrayMineSupport = mineSupport.find({
            user: owner,
            refID: slotID,
            supporter: {
                $nin: [null, ""]
            }
        }).fetch();
        //GET LOOT
        var colorCode = cursorMineBase.input.substring(0, 2);
        //owner
        var splitShare = split("mine", "base", owner, owner, slotID);
        resources.update({
            user: owner,
            colorCode: colorCode
        }, {
            $inc: {
                matter: splitShare
            }
        });
        //supporter
        for (var i = 0; i < arrayMineSupport.length; i++) {
            var sup = arrayMineSupport[i].supporter
            var splitShare = split("mine", "base", owner, sup, slotID);
            resources.update({
                user: sup,
                colorCode: colorCode
            }, {
                $inc: {
                    matter: splitShare
                }
            });
        };
        //RESET SLOTS
        //mineScrounge of supporter
        for (var i = 0; i < arrayMineSupport.length; i++) {
            var sup = arrayMineSupport[i].supporter
            resetMineScrounge(sup, owner, slotID);
        };
        //mineSupport of owner
        resetMineSupport(owner, slotID);
        //mineBase of owner
        resetMineBase(owner, slotID);
    }
}

// OLD OLD 2015/12/19 OLD OLD
// updateMineSlot = function(user, slotNumber) {
//     //what is left of an unfinished slot
//     var remaining = 0;

//     var slot = 'owns' + slotNumber;

//     var pDM = playerData.findOne({
//         user: user
//     }, {
//         fields: {
//             'level': 0,
//             'XP': 0,
//             'requiredXP': 0,
//             'backgroundId': 0,
//             'battlefield': 0,
//             'laboratory': 0,
//             'thievery': 0,
//             'workshop': 0,
//             'smelter': 0,
//             'mine.amountScrSlots': 0,
//             'mine.science': 0,
//             'mine.minControl': 0,
//             'mine.maxControl': 0,
//             'mine.ownItem': 0,
//             'mine.scrItem': 0,
//             'mine.scrSlots': 0,
//             'mine.ownSlots.owns0.control': 0,
//             'mine.ownSlots.owns1.control': 0,
//             'mine.ownSlots.owns2.control': 0,
//             'mine.ownSlots.owns3.control': 0,
//             'mine.ownSlots.owns4.control': 0,
//             'mine.ownSlots.owns5.control': 0,
//         }
//     }).mine;
//     var mineOwnSlots = pDM.amountOwnSlots;
//     var mineSupSlots = pDM.amountSupSlots;
//     var serverTime = new Date().getTime();

//     //update mine of user || ownSlots
//     var matterID = pDM.ownSlots[slot].input;
//     //slot used?
//     if (matterID > 0) {
//         var matter = MatterBlocks.findOne({
//             matter: matterID
//         }, {
//             fields: {
//                 name: 0,
//                 cost: 0,
//             }
//         });
//         var value = matter.value;
//         var startTime = pDM.ownSlots[slot].stamp;
//         var progress = (serverTime - startTime) * (7.5 / 3600000);
//         var sups = [];
//         //noch ist das 7.5, muss irgendwann mit dem benefit des ownItems getauscht werden(7.5 ist die standardabbaurate und bleibt das ganze spiel lang konstant ;))
//         var totalRate = 7.5;
//         //iterate supporter
//         for (var k = 0; k < mineSupSlots; k++) {
//             var sup = pDM.ownSlots[slot]['sup' + k];
//             //slot used?
//             if (sup.name != "") {
//                 // console.log('sups');
//                 supTime = sup.stamp;
//                 supRate = sup.benefit;
//                 totalRate = totalRate + supRate;
//                 progress = progress + (serverTime - supTime) * (supRate / 3600000);
//                 // console.log('progress', progress, k);
//                 sups.push(sup.name);
//                 // console.log('supName',sup.name);
//             }
//         }
//         //matter finished?
//         if (progress > value) {
//             // console.log('matter is finished');
//             //split matter
//             var matterColor = matter.color;
//             var ownProfit = 0;
//             //falls keine supporter, user bekommt ganzen Gewinn
//             if (sups.length == 0) {
//                 // console.log('no sup present');
//                 ownProfit = value;
//                 //falls supporter, user bekommt Teil des Gewinns
//             } else {
//                 // console.log('sup(s) present');
//                 ownProfit = 0.5 * value;
//                 //jeder supporter bekommt einen Teil der Hälfte
//                 var supProfit = (0.5 * value) / sups.length;
//                 // console.log('supProfit', supProfit);
//             }
//             var cursorResources = resources.findOne({
//                 user: user
//             }, {
//                 fields: {
//                     values: 1
//                 }
//             });
//             var ownedMatter = cursorResources.values[matterColor].matter;
//             //pay user
//             var obj0 = {};
//             obj0['values.' + matterColor + '.matter'] = (ownedMatter + ownProfit);
//             // console.log('ownProfit',ownProfit);
//             // console.log('ownedMatter',ownedMatter);
//             // console.log('obj0',obj0);
//             resources.update({
//                 user: user
//             }, {
//                 $set: obj0
//             });
//             //supporter
//             for (var m = 0; m < sups.length; m++) {
//                 // console.log('supporter',sups[m]);
//                 var obj0 = {};
//                 var cursorResourcesSup = resources.findOne({
//                     user: sups[m]
//                 }, {
//                     fields: {
//                         values: 1,
//                     }
//                 });
//                 var supsOwnedMatter = cursorResourcesSup.values[matterColor].matter;
//                 // console.log(sups[m]);
//                 // console.log('supsOwnedMatter',supsOwnedMatter);
//                 //pay sup
//                 var obj0 = {};
//                 obj0['values.' + matterColor + '.matter'] = (supsOwnedMatter + supProfit);
//                 // console.log('obj0',obj0);
//                 resources.update({
//                     user: sups[m]
//                 }, {
//                     $set: obj0
//                 });
//                 //reset sup scr slot
//                 // console.log('reset sup',sups[m]);
//                 var pDMsup = playerData.findOne({
//                     user: sups[m]
//                 }, {
//                     fields: {
//                         'mine.amountScrSlots': 1,
//                         'mine.scrSlots.scrs0.victim.name': 1,
//                         'mine.scrSlots.scrs1.victim.name': 1,
//                         'mine.scrSlots.scrs2.victim.name': 1,
//                         'mine.scrSlots.scrs3.victim.name': 1,
//                         'mine.scrSlots.scrs4.victim.name': 1,
//                         'mine.scrSlots.scrs5.victim.name': 1,
//                     }
//                 }).mine;
//                 var supScrSlots = pDMsup.amountScrSlots;
//                 for (var w = 0; w < supScrSlots; w++) {
//                     if (pDMsup.scrSlots['scrs' + w].victim.name == user) indexScr = w;
//                 }
//                 var obj0 = {};
//                 obj0['mine.scrSlots.scrs' + indexScr + '.benefit'] = 5;
//                 obj0['mine.scrSlots.scrs' + indexScr + '.stamp'] = "";
//                 obj0['mine.scrSlots.scrs' + indexScr + '.victim.supSlotsVictim'] = "";
//                 obj0['mine.scrSlots.scrs' + indexScr + '.victim.name'] = "";
//                 obj0['mine.scrSlots.scrs' + indexScr + '.victim.stamp'] = "";
//                 obj0['mine.scrSlots.scrs' + indexScr + '.victim.input'] = "";
//                 for (var t = 0; t < sups.length; t++) {
//                     obj0['mine.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.name'] = "";
//                     obj0['mine.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.benefit'] = 5;
//                     obj0['mine.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.stamp'] = "";
//                 }
//                 playerData.update({
//                     user: sups[m]
//                 }, {
//                     $set: obj0
//                 });
//             }
//             //reset user slots
//             // console.log('reset user');
//             var obj0 = {};
//             obj0['mine.ownSlots.' + slot + '.input'] = "0000";
//             obj0['mine.ownSlots.' + slot + '.stamp'] = "";
//             obj0['mine.ownSlots.' + slot + '.control.min'] = 0.1;
//             obj0['mine.ownSlots.' + slot + '.control.max'] = 10;
//             for (var s = 0; s < mineSupSlots; s++) {
//                 obj0['mine.ownSlots.' + slot + '.sup' + s + '.name'] = "";
//                 obj0['mine.ownSlots.' + slot + '.sup' + s + '.benefit'] = 5;
//                 obj0['mine.ownSlots.' + slot + '.sup' + s + '.stamp'] = "";
//             }
//             playerData.update({
//                 user: user
//             }, {
//                 $set: obj0
//             });
//             //if slot isn't finished, remember remaining
//         } else {
//             // push timer with remaining time of this user's slot
//             progressTime = progress / (totalRate / 3600000);
//             // console.log(totalRate);
//             neededTime = value / (totalRate / 3600000);
//             leftTime = neededTime - progressTime;
//             remaining = leftTime;
//         }
//     }
//     // console.log('ENDM',user,slot);
//     //console.timeEnd('UPDATEMS');

//     return remaining;
// }
// OLD OLD 2015/12/19 OLD OLD
