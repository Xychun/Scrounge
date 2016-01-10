////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// SERVER /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isServer) {

    /////////////////////////
    //////// METHODS ////////
    /////////////////////////

    Meteor.methods({
        buyMatter: function(matterId, slider_range) {
            var cursorUser = Meteor.users.findOne({
                _id: this.userId
            }, {
                fields: {
                    username: 1,
                }
            });
            var self = cursorUser.username;
            var colorCode = matterId.substring(0, 2);
            var matter = resources.findOne({
                user: self,
                colorCode: colorCode
            }, {
                fields: {
                    matter: 1,
                }
            }).matter;
            var cursorMatter = MatterBlocks.findOne({
                matter: matterId
            }, {
                fields: {
                    cost: 1,
                    value: 1,
                }
            });
            var cost = cursorMatter.cost;
            var value = cursorMatter.value;
            //check costs
            if (!(matter >= cost)) {
                Meteor.call("infoLog", 'You cannot buy this matter: You do not have enough matter!', self);
                return '0You cannot buy this matter: You do not have enough matter!';
            }
            var amountSupSlots = playerData.findOne({
                user: self
            }, {
                fields: {
                    'mine.amountSupSlots': 1
                }
            }).mine.amountSupSlots;
            var cursor = mineBase.find({
                user: self
            }, {
                fields: {
                    'input': 1,
                    'slotID': 1
                }
            }).fetch();

            //NEW obj[]
            //Iterate all own slots and fill matter into free one
            for (var i = 0; i < cursor.length; i++) {
                if (cursor[i].input == "0000") {
                    //Pay matter costs
                    resources.update({
                        user: self,
                        colorCode: colorCode
                    }, {
                        $inc: {
                            matter: -cost
                        }
                    });

                    //initialize database entry
                    var objMineBase = {};
                    objMineBase['input'] = matterId;
                    objMineBase['timeStart'] = dateInMs();
                    objMineBase['controlMin'] = slider_range[0];
                    objMineBase['controlMax'] = slider_range[1];
                    objMineBase['splitValue'] = value;
                    objMineBase['progress2'] = value;
                    objMineBase['slots2'] = amountSupSlots;
                    objMineBase['remaining'] = (value / (7.5 / 3600000));

                    // // just done while reset
                    // objMineBase['slots1'] = 0;
                    // objMineBase['benefitTotal'] = 7.5;

                    //TO-DO: implement split attributes
                    // //--The Split--\\
                    // objMineBase['item'] = null,
                    // objMineBase['science'] = null,
                    // objMineBase['level'] = null,
                    // objMineBase['rankMine'] = null,
                    // objMineBase['rankLaboratory'] = null,
                    // objMineBase['rankBattlefield'] = null,
                    // objMineBase['rankWorkshop'] = null,
                    // objMineBase['rankThievery'] = null,
                    // objMineBase['rankSmelter'] = null

                    mineBase.update({
                        user: self,
                        slotID: cursor[i].slotID
                    }, {
                        $set: objMineBase
                    });
                    Meteor.call("infoLog", 'Matter purchase successful!', self);
                    return '1Matter purchase successful!';
                }
            };

            //OLD obj[]
            // for (i = 0; i < amountSlots; i++) {
            //     if (cursorMine.ownSlots['owns' + i].input == "0000") {
            //         //pay matter
            //         var obj1 = {};
            //         obj1['values.' + matterColor + '.matter'] = matter - cost;
            //         resources.update({
            //             user: name
            //         }, {
            //             $set: obj1
            //         });
            //         //add item in playerData
            //         var obj2 = {};
            //         obj2['mine.ownSlots.owns' + i + '.stamp'] = new Date().getTime();
            //         obj2['mine.ownSlots.owns' + i + '.input'] = matterId;
            //         obj2['mine.ownSlots.owns' + i + '.control.min'] = slider_range[0];
            //         obj2['mine.ownSlots.owns' + i + '.control.max'] = slider_range[1];
            //         playerData.update({
            //             user: name
            //         }, {
            //             $set: obj2
            //         });
            //         var remainingMine = (value / (7.5 / 3600000));
            //         // console.log('before', timers);
            //         //seltsam aber wahr: Wenn das nicht hier über diesen Umweg gesetzt wird, dann
            //         //wird manchmal der Wert einer anderen "i" Variable verwendet, was dann wiederum einen
            //         //slot repräsentiert, der nicht existiert
            //         var p = i;
            //         //Parameter: (menu, user, slot, remainingTime)
            //         timers.push(['mine', name, p, remainingMine]);
            //         // console.log('after', timers);
            //         break;
            //     }
            // }
        },

        goScroungingMine: function(slotID) {
            var currentUser = Meteor.users.findOne({
                _id: this.userId
            }, {
                fields: {
                    cu: 1
                }
            }).cu;
            var self = Meteor.users.findOne({
                _id: this.userId
            }, {
                fields: {
                    username: 1
                }
            }).username;
            var cursorMineBase = mineBase.findOne({
                user: currentUser,
                slotID: slotID
            });
            var arrayMineSupport = mineSupport.find({
                user: currentUser,
                refID: this.slotID,
                supporter: {
                    $nin: [null, ""]
                }
            }).fetch();
            var arrayMineScrounge = mineScrounge.find({
                user: self
            }).fetch();
            var scrItemBenefit = playerData.findOne({
                user: self
            }, {
                fields: {
                    'mine.scrItem.benefit': 1
                }
            }).mine.scrItem.benefit;
            //check if scroungeable
            var scroungeable = isScroungeable('mine', self, currentUser, slotID);
            if (scroungeable.result == false) {
                Meteor.call("infoLog", scroungeable.message, self);
                return '0' + scroungeable.message;
            }

            // OLD OLD 2015/12/05 OLD OLD
            // //CHECK IF YOU ARE TRYING TO SCROUNGE YOURSELF
            // if (currentUser == self) {
            //     Meteor.call("infoLog", 'You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O', self);
            //     return '0You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O';
            // }
            // //CHECK IF TARGET IS ALLRDY SCROUNGED
            // cursorMineScrounge.forEach(function checkDuplicate(element) {
            //     if (element.victim == currentUser) {
            //         Meteor.call("infoLog", 'You cannot scrounge here: You already scrounge this user!', self);
            //         return '0You cannot scrounge here: You already scrounge this user!';
            //     }
            // });
            // //CHECK IF THERE IS A FREE SCRSLOT
            // var resultFreeScrSlot = -1;
            // for (i = 0; i < cursorMineScrounge.length; i++) {
            //     if (cursorMineScrounge[i].victim == null || cursorMineScrounge[i].victim == "") {
            //         resultFreeScrSlot = element.slotID;
            //         break;
            //     }
            // }
            // if (resultFreeScrSlot == -1) {
            //     Meteor.call("infoLog", 'You cannot scrounge here: Your Scrounge slots are all in use!', self);
            //     return '0You cannot scrounge here: Your Scrounge slots are all in use!';
            // }
            // //CHECK IF THERE IS A FREE SUPSLOT
            // var resultFreeSupSlot = -1;
            // for (i = 0; i < cursorMineSupport.length; i++) {
            //     if (cursorMineSupport[i].supporter == null || cursorMineScrounge[i].supporter == "") {
            //         resultFreeSupSlot = element.slotID;
            //         break;
            //     }
            // }
            // if (resultFreeSupSlot == -1) {
            //     Meteor.call("infoLog", 'You cannot scrounge here: There is not free support slot!', self);
            //     return '0You cannot scrounge here: There is not free support slot!';
            // }
            // //CHECK IF THE RANGE IS CORRECT
            // if (!(cursorMineBase.control.min <= scrItemBenefit && scrItemBenefit <= cursorMineBase.control.max)) {
            //     Meteor.call("infoLog", 'You cannot scrounge here: You do not have the right miningrate!', self);
            //     return '0You cannot scrounge here: You do not have the right miningrate!';
            // }
            // OLD OLD 2015/12/05 OLD OLD            

            //update MINEBASE of victim/cu
            var ownerProgress = (Date.now() - cursorMineBase.timeStart) * (7.5 / 3600000);
            var suppsProgress = 0;
            for (i = 0; i < arrayMineSupport.length; i++) {
                suppsProgress = suppsProgress + (Date.now() - arrayMineSupport[i].timeStart) * (arrayMineSupport[i].benefit / 3600000);
            }
            var progress1 = ownerProgress + suppsProgress;       
            mineBase.update({
                user: currentUser,
                slotID: slotID
            }, {
                $set: {
                    remaining: ((cursorMineBase.progress2 - progress1) / ((cursorMineBase.benefitTotal + 5) / 3600000))
                }, //TO-DO: 'benefit' - get value by item
                $inc: {
                    slots1: 1,
                    benefitTotal: 5 //TO-DO: 'benefit' - get value by item
                }
            });

            //update MINESCROUNGE of self
            var objMineScrounge = {};
            //get mineBase fields (7)
            objMineScrounge['input'] = cursorMineBase.input;
            objMineScrounge['progress2'] = cursorMineBase.progress2;
            objMineScrounge['slots1'] = cursorMineBase.slots1 + 1;
            objMineScrounge['slots2'] = cursorMineBase.slots2;
            objMineScrounge['splitValue'] = cursorMineBase.splitValue;
            objMineScrounge['remaining'] = ((cursorMineBase.progress2 - progress1) / ((cursorMineBase.benefitTotal + 5) / 3600000));
            //set uniques (4)
            objMineScrounge['refID'] = slotID;
            objMineScrounge['victim'] = currentUser;
            objMineScrounge['timeStart'] = dateInMs();
            objMineScrounge['benefit'] = scrItemBenefit;
            //TO-DO: implement split attributes
            // //--The Split--\\
            // objMineScrounge['item'] = null;
            // objMineScrounge['science'] = null;
            // objMineScrounge['level'] = null;
            // objMineScrounge['rankMine'] = null,
            // objMineScrounge['rankLaboratory'] = null,
            // objMineScrounge['rankBattlefield'] = null,
            // objMineScrounge['rankWorkshop'] = null,
            // objMineScrounge['rankThievery'] = null,
            // objMineScrounge['rankSmelter'] = null
            mineScrounge.update({
                user: self,
                slotID: scroungeable.scrSlotID
            }, {
                $set: objMineScrounge
            });

            //update MINESUPPORT of victim/cu
            var objMineSupport = {};
            objMineSupport['supporter'] = self;
            objMineSupport['refID'] = slotID;
            objMineSupport['benefit'] = 5; //TO-DO: 'benefit' - get value by item
            objMineSupport['timeStart'] = dateInMs();
            //TO-DO: implement split attributes
            // //--The Split--\\
            // objMineSupport['item'] = null;
            // objMineSupport['science'] = null;
            // objMineSupport['level'] = null;
            // objMineSupport['rankMine'] = null,
            // objMineSupport['rankLaboratory'] = null,
            // objMineSupport['rankBattlefield'] = null,
            // objMineSupport['rankWorkshop'] = null,
            // objMineSupport['rankThievery'] = null,
            // objMineSupport['rankSmelter'] = null
            mineSupport.update({
                user: currentUser,
                slotID: scroungeable.supSlotID
            }, {
                $set: objMineSupport
            });


            Meteor.call("infoLog", 'Scrounging successful!', self);
            return "1Scrounging successful!";

            // OLD OLD 2015/11/26 OLD OLD
            // //console.time("SCROUNGING");
            // var currentUser = Meteor.users.findOne({
            //     _id: this.userId
            // }, {
            //     fields: {
            //         cu: 1
            //     }
            // }).cu;
            // var self = Meteor.users.findOne({
            //     _id: this.userId
            // }, {
            //     fields: {
            //         username: 1
            //     }
            // }).username;
            // //CHECK IF YOU ARE TRYING TO SCROUNGE YOURSELF OR TARGET IS ALLRDY SCROUNGED
            // if (currentUser == self) {
            //     Meteor.call("infoLog", 'You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O', self);
            //     return '0You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O';
            // }
            // var cursorMyPlayerData = playerData.findOne({
            //     user: self
            // }, {
            //     fields: {
            //         mine: 1
            //     }
            // }).mine;
            // var amountScrSlots = cursorMyPlayerData.amountScrSlots;
            // for (i = 0; i < amountScrSlots; i++) {
            //     if (cursorMyPlayerData.scrSlots['scrs' + i].victim.name == currentUser) {
            //         Meteor.call("infoLog", 'You cannot scrounge here: You already scrounge this user!', self);
            //         return '0You cannot scrounge here: You already scrounge this user!';
            //     }
            // }
            // //CHECK FREE SCRSLOTS OF SCROUNGER DATA
            // var resultScrounger = -1;
            // for (i = 0; i < amountScrSlots; i++) {
            //     if (cursorMyPlayerData.scrSlots['scrs' + i].victim.name == "") {
            //         resultScrounger = i;
            //         break;
            //     }
            // }
            // if (resultScrounger == -1) {
            //     Meteor.call("infoLog", 'You cannot scrounge here: Your Scrounge slots are all in use!', self);
            //     return '0You cannot scrounge here: Your Scrounge slots are all in use!';
            // }
            // //CHECK FREE SUPSLOTS OF CURRENT USER DATA                
            // var obj0 = {};
            // obj0['owns' + slotId] = 1;
            // var cursorCurrentUser = playerData.findOne({
            //     user: currentUser
            // }, {
            //     fields: {
            //         mine: 1
            //     }
            // }).mine;
            // //Get free SupSlots index
            // var amountSupSlots = cursorCurrentUser.amountSupSlots;
            // var resultOwner = -1;
            // for (i = 0; i < amountSupSlots; i++) {
            //     if (cursorCurrentUser.ownSlots['owns' + slotId]['sup' + i].name == "") {
            //         resultOwner = i;
            //         break;
            //     }
            // }
            // //LAST CHECK: RANGE SLIDER
            // if (!(cursorCurrentUser.ownSlots['owns' + slotId].control.min <= cursorMyPlayerData.scrItem.benefit && cursorMyPlayerData.scrItem.benefit <= cursorCurrentUser.ownSlots['owns' + slotId].control.max)) {
            //     Meteor.call("infoLog", 'You cannot scrounge here: You do not have the right miningrate!', self);
            //     return '0You cannot scrounge here: You do not have the right miningrate!';
            // }

            // //SupSlot with id result is free and correct: update it ?
            // if (resultOwner == -1) {
            //     Meteor.call("infoLog", 'You cannot scrounge here: The owners support slots are all used!', self);
            //     return '0You cannot scrounge here: The owners support slots are all used!';
            // }
            // //get benefit of scrounger
            // var scrItemBenefit = cursorMyPlayerData.scrItem.benefit;

            // //set time for the scrounging
            // var timeStamp = new Date();

            // //set playerData of owner
            // var obj0 = {};
            // obj0['mine.ownSlots.owns' + slotId + '.sup' + resultOwner + '.name'] = self;
            // obj0['mine.ownSlots.owns' + slotId + '.sup' + resultOwner + '.benefit'] = scrItemBenefit;
            // obj0['mine.ownSlots.owns' + slotId + '.sup' + resultOwner + '.stamp'] = timeStamp.getTime();
            // playerData.update({
            //     user: currentUser
            // }, {
            //     $set: obj0
            // });
            // var cursorCurrentUserUpdated = playerData.findOne({
            //     user: currentUser
            // }, {
            //     fields: {
            //         mine: 1
            //     }
            // });

            // //set my playerData
            // var amountSupSlotsVictim = cursorCurrentUserUpdated.mine.amountSupSlots;
            // var amountScrSlotsVictim = cursorCurrentUserUpdated.mine.amountScrSlots;
            // var timeStampVictim = cursorCurrentUserUpdated.mine.ownSlots['owns' + slotId].stamp;
            // var inputVictim = cursorCurrentUserUpdated.mine.ownSlots['owns' + slotId].input;

            // //data for timer
            // var progressSups = 0;
            // var supRatesAdded = 0;

            // var obj0 = {};
            // //eigener Zeitstempel des Scroungens und eigene Rate
            // obj0['mine.scrSlots.scrs' + resultScrounger + '.stamp'] = timeStamp.getTime();
            // obj0['mine.scrSlots.scrs' + resultScrounger + '.benefit'] = scrItemBenefit;
            // //Anzahl sup slots des Opfers, Zeitstempel und input des gescroungten own slots des Opfers, 
            // obj0['mine.scrSlots.scrs' + resultScrounger + '.victim.supSlotsVictim'] = amountSupSlotsVictim;
            // obj0['mine.scrSlots.scrs' + resultScrounger + '.victim.stamp'] = timeStampVictim;
            // obj0['mine.scrSlots.scrs' + resultScrounger + '.victim.input'] = inputVictim;
            // obj0['mine.scrSlots.scrs' + resultScrounger + '.victim.name'] = currentUser;

            // //Name und rate von Scroungern des slots und Zeitstempel des Scroungens
            // //Für jeden sup slot des Opfers
            // for (i = 0; i < amountSupSlotsVictim; i++) {
            //     var supporter = cursorCurrentUserUpdated.mine.ownSlots['owns' + slotId]['sup' + i];
            //     //falls sup slot i des gescroungten own slots des Opfers einen Eintrag hat
            //     if (supporter.name != "") {
            //         //hole seinen Namen
            //         var supVictimName = supporter.name;
            //         //hole seine Rate
            //         var supVictimBenefit = supporter.benefit;
            //         //hole den Zeitstempel seines Scroungens
            //         var supVictimTimeStamp = supporter.stamp;
            //         obj0['mine.scrSlots.scrs' + resultScrounger + '.victim.sup' + i + '.name'] = supVictimName;
            //         obj0['mine.scrSlots.scrs' + resultScrounger + '.victim.sup' + i + '.benefit'] = supVictimBenefit;
            //         obj0['mine.scrSlots.scrs' + resultScrounger + '.victim.sup' + i + '.stamp'] = supVictimTimeStamp;

            //         //for timer
            //         //der bisherige Fortschritt wird hier gesucht, deshalb wird der scroungende Spieler "self" ausgeschlossen, da er
            //         //erst ab nun an mit macht.
            //         if (supVictimName != self) progressSups = progressSups + (timeStamp.getTime() - supVictimTimeStamp) * (supVictimBenefit / 3600000);
            //         //hier wiederum wird der scroungende Spieler bereits mit einbezogen
            //         supRatesAdded = supRatesAdded + supVictimBenefit;
            //     }
            // }
            // playerData.update({
            //     user: self
            // }, {
            //     $set: obj0
            // });

            // //push timer (hat ein bisschen lag zum "wirklichen" Start, aber das ist vertretbar)
            // //timeStamp des own slots, der hier gescroungt wird
            // var startTime = timeStampVictim;
            // var progressOwner = (timeStamp.getTime() - startTime) * (7.5 / 3600000);
            // // console.log('startTime', startTime);
            // // console.log('scroungeTime', timeStamp.getTime());
            // // console.log('progressOwner', progressOwner);
            // // console.log('progressSups', progressSups);
            // // console.log('supRatesAdded', supRatesAdded);
            // //bei progressSups werden nur die berücksichtigt, die bereits vorhanden waren bis 
            // //zum Zeitpunkt des Scroungens
            // var progressTotal = progressOwner + progressSups;
            // // console.log('progressTotal', progressTotal);
            // var matterId = cursorCurrentUserUpdated.mine.ownSlots['owns' + slotId].input;
            // // console.log('matterId', matterId);
            // var value = MatterBlocks.findOne({
            //     matter: matterId
            // }, {
            //     fields: {
            //         value: 1,
            //     }
            // }).value;
            // var remainingMatter = value - progressTotal;
            // // console.log('remainingMatter', remainingMatter);
            // //bei der Kalkulation der verbleibenden Zeit wird der neue User miteinbezogen (supRatesAdded)
            // var remainingTime = (remainingMatter / ((7.5 + supRatesAdded) / 3600000));
            // // console.log((7.5 + supRatesAdded));
            // // console.log('remainingTime', remainingTime);
            // //prüfen, ob dieser slot schon in der timer Liste steht oder nicht
            // var check = checkIfDuplicate('mine', currentUser, slotId, remainingTime);
            // if (check === 'push') {
            //     //der slot steht nicht in der Liste und wird hinzugefügt
            //     // console.log('slot not yet in list, push timer');
            //     timers.push(['mine', currentUser, slotId, remainingTime]);
            // } else {
            //     // console.log('result of check', check);
            //     //der slot steht bereits in der Liste und wird beschleunigt
            //     // console.log('slot is already in list, accelerate');
            //     // //entferne den timer
            //     // timers.splice(i,1);
            //     // //ersetze ihn mit der neuen Restzeit (kürzer, weil jetzt supporter vorhanden)
            //     // timers.push(menu, user, slot, time);
            // }

            // Meteor.call("infoLog", '1Scrounging successful!', self);
            // //console.timeEnd("SCROUNGING");
            // return "1Scrounging successful!";
            // OLD OLD 2015/11/26 OLD OLD
        }

        // OLD OLD 2015/11/26 OLD OLD
        // //updates the mine
        // updateMine: function(cUser, cPData) {
        //     var cMine = mine.findOne({
        //         user: cUser
        //     });

        //     var serverTime = new Date().getTime();

        //     //update current users MINE || all ownSlots
        //     for (var j = 0; j < cPData.mine.ownSlots; j++) {
        //         var cSlot = 'owns' + j;
        //         //Matter exists?
        //         var cMatterID = cMine[cSlot].input;
        //         if (cMatterID > 0) {
        //             var cMatter = MatterBlocks.findOne({
        //                 matter: cMatterID
        //             });
        //             var cValue = cMatter.value;

        //             var startTime = cMine[cSlot].stamp.getTime();
        //             var progress = (serverTime - startTime) * (7.5 / 3600000);
        //             // console.log(cUser + ': ' + progress);

        //             var allSups = new Array();
        //             //Iterate Supporter
        //             for (var k = 0; k < cPData.mine.supSlots; k++) {
        //                 var cSup = cMine[cSlot]['sup' + k];
        //                 //SupSlot used?
        //                 if (cSup != undefined && cSup.length != 0) {
        //                     var sMine = mine.findOne({
        //                         user: cSup
        //                     });
        //                     var currentSupScrSlots = playerData.findOne({
        //                         user: cSup
        //                     }, {
        //                         fields: {
        //                             mine: 1
        //                         }
        //                     }).mine.scrSlots;
        //                     //get index of scr slot
        //                     var indexScr = -1;
        //                     for (var m = 0; m < currentSupScrSlots; m++) {
        //                         if (sMine['scrs' + m].victim == cUser) indexScr = m;
        //                     }
        //                     if (indexScr == -1) {
        //                         console.log('Template.rmineBase slot calculation problem - index scr Slot');
        //                         break;
        //                     }
        //                     var result = indexScr;

        //                     allSups[k] = cSup;
        //                     //calculate mined by cSup
        //                     var sTime = sMine['scrs' + result].stamp.getTime();
        //                     var sRate = sMine['scrs' + result].benefit;
        //                     progress = progress + (serverTime - sTime) * (sRate / 3600000);

        //                     /*console.log(cUser + ' Progress: ' + progress);*/
        //                 }
        //             }
        //             //Matter CLEAR?
        //             if (progress > cValue) {
        //                 //split matter
        //                 var matterColor = cMatter.color;
        //                 var ownProfit = 0;
        //                 if (allSups.length == 0) {
        //                     ownProfit = cValue;
        //                 } else {
        //                     ownProfit = 0.5 * cValue;
        //                     var supProfit = (0.5 * cValue) / (allSups.length);
        //                 }
        //                 var cUserResources = resources.findOne({
        //                     user: cUser
        //                 });
        //                 var cUserMatter = cUserResources.values[matterColor].matter;
        //                 //owner
        //                 var obj0 = {};
        //                 obj0['values.' + matterColor + '.matter'] = cUserMatter + ownProfit;
        //                 resources.update({
        //                     user: cUser
        //                 }, {
        //                     $set: obj0
        //                 });
        //                 //sups
        //                 for (var l = 0; l < allSups.length; l++) {
        //                     var obj0 = {};
        //                     var cSupResources = resources.findOne({
        //                         user: allSups[l]
        //                     });
        //                     var cSupMatter = cSupResources.values[matterColor].matter;
        //                     obj0['values.' + matterColor + '.matter'] = cSupMatter + supProfit;
        //                     resources.update({
        //                         user: allSups[l]
        //                     }, {
        //                         $set: obj0
        //                     });
        //                     //reset scr slot of sup
        //                     //get index of scr slot
        //                     var sMine = mine.findOne({
        //                         user: allSups[l]
        //                     });
        //                     var currentSupScrSlots = playerData.findOne({
        //                         user: allSups[l]
        //                     }, {
        //                         fields: {
        //                             mine: 1
        //                         }
        //                     }).mine.scrSlots;
        //                     //get index of scr slot
        //                     var indexScr = -1;
        //                     for (var m = 0; m < currentSupScrSlots; m++) {
        //                         if (sMine['scrs' + m].victim == cUser) indexScr = m;
        //                     }
        //                     if (indexScr == -1) {
        //                         console.log('Template.rmineBase slot calculation problem - index scr Slot');
        //                         break;
        //                     }
        //                     var result = indexScr;

        //                     var obj0 = {};
        //                     obj0['scrs' + result + '.victim'] = "";

        //                     mine.update({
        //                         user: allSups[l]
        //                     }, {
        //                         $set: obj0
        //                     });
        //                 }

        //                 //reset owner slots
        //                 var obj0 = {};
        //                 obj0[cSlot + '.input'] = '0000';
        //                 for (var m = 0; m < cPData.mine.supSlots; m++) {
        //                     obj0[cSlot + '.sup' + m] = "";
        //                 }
        //                 mine.update({
        //                     user: cUser
        //                 }, {
        //                     $set: obj0
        //                 });
        //             }
        //         }
        //     }
        // }
        // OLD OLD 2015/11/26 OLD OLD
    });
}

function imagePosition(color) {
    switch (color) {
        case "green":
            return "-550px 0px";
        case "red":
            return "-550px -100px";
        default:
            console.log("no matterBlock color defined");
            break;
    }
}
