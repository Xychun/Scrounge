////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// SERVER /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isServer) {

    /////////////////////////
    //////// METHODS ////////
    /////////////////////////

    Meteor.methods({
        //BuyFight new
        buyFight: function(fightId, slider_range) {
            var cursorUser = Meteor.users.findOne({
                _id: this.userId
            }, {
                fields: {
                    username: 1,
                }
            });
            var self = cursorUser.username;
            var colorCode = fightId.substring(0, 2);
            var matter = resources.findOne({
                user: self,
                colorCode: colorCode
            }, {
                fields: {
                    matter: 1,
                }
            }).matter;
            var cursorFight = FightArenas.findOne({
                fight: fightId
            }, {
                fields: {
                    cost: 1,
                    value: 1,
                    time: 1
                }
            });
            var cost = cursorFight.cost;
            var value = cursorFight.value;
            var time = cursorFight.time;
            //check costs
            if (!(matter >= cost)) {
                Meteor.call("infoLog", 'You cannot buy this fight: You do not have enough matter!', self);
                return '0You cannot buy this fight: You do not have enough matter!';
            }
            var amountSupSlots = playerData.findOne({
                user: self
            }, {
                fields: {
                    'battlefield.amountSupSlots': 1
                }
            }).battlefield.amountSupSlots;
            var cursor = battlefieldBase.find({
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
                    var objbattlefieldBase = {};
                    objbattlefieldBase['input'] = fightId;
                    objbattlefieldBase['timeStart'] = dateInMs();
                    objbattlefieldBase['controlMin'] = slider_range[0];
                    objbattlefieldBase['controlMax'] = slider_range[1];
                    objbattlefieldBase['value'] = value;
                    objbattlefieldBase['splitValue'] = value;
                    objbattlefieldBase['progress2'] = time;
                    objbattlefieldBase['slots2'] = amountSupSlots;
                    objbattlefieldBase['remaining'] = cursorFight.time;

                    // // just done while reset
                    // battlefieldBase['slots1'] = 0;
                    // battlefieldBase['benefitTotal'] = 0;

                    //TO-DO: implement split attributes
                    // //--The Split--\\
                    // objBattlefieldBase['item'] = null,
                    // objBattlefieldBase['science'] = null,
                    // objBattlefieldBase['level'] = null,
                    // objBattlefieldBase['rankMine'] = null,
                    // objBattlefieldBase['rankLaboratory'] = null,
                    // objBattlefieldBase['rankBattlefield'] = null,
                    // objBattlefieldBase['rankWorkshop'] = null,
                    // objBattlefieldBase['rankThievery'] = null,
                    // objBattlefieldBase['rankSmelter'] = null

                    battlefieldBase.update({
                        user: self,
                        slotID: cursor[i].slotID
                    }, {
                        $set: objbattlefieldBase
                    });
                    Meteor.call("infoLog", 'Fight purchase successful!', self);
                    return '1Fight purchase successful!';
                }
            };
        },

        goScroungingBattlefield: function(slotID) {
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
            var cursorBattlefieldBase = battlefieldBase.findOne({
                user: currentUser,
                slotID: slotID
            });
            var arrayBattlefieldSupport = battlefieldSupport.find({
                user: currentUser,
                refID: slotID
            }).fetch();
            var arrayBattlefieldScrounge = battlefieldScrounge.find({
                user: self
            }).fetch();
            var scrItemBenefit = playerData.findOne({
                user: self
            }, {
                fields: {
                    'battlefield.scrItem.benefit': 1
                }
            }).battlefield.scrItem.benefit;
            //check if scroungeable
            var scroungeable = isScroungeable('battlefield', self, currentUser, slotID);
            if (scroungeable.result == false) {
                Meteor.call("infoLog", scroungeable.message, self);
                return '0' + scroungeable.message;
            }

            //update BATTLEFIELDBASE of victim/cu          
            battlefieldBase.update({
                user: currentUser,
                slotID: slotID
            }, {
                $set: {
                    splitValue: cursorBattlefieldBase.value * 1.5
                }, //TO-DO: 'benefit' - get value by item
                $inc: {
                    slots1: 1,
                    benefitTotal: 50 //TO-DO: 'benefit' - get value by item
                }
            });

            //update BATTLEFIELDSCROUNGE of self
            var objBattlefieldScrounge = {};
            //get battlefieldBase fields (8)
            objBattlefieldScrounge['input'] = cursorBattlefieldBase.input;
            objBattlefieldScrounge['remaining'] = cursorBattlefieldBase.remaining;
            objBattlefieldScrounge['value'] = cursorBattlefieldBase.value;
            objBattlefieldScrounge['splitValue'] = cursorBattlefieldBase.value * 1.5;
            objBattlefieldScrounge['progress2'] = cursorBattlefieldBase.progress2;
            objBattlefieldScrounge['slots1'] = cursorBattlefieldBase.slots1 + 1;
            objBattlefieldScrounge['slots2'] = cursorBattlefieldBase.slots2;

            //set uniques (4)
            objBattlefieldScrounge['refID'] = slotID;
            objBattlefieldScrounge['victim'] = currentUser;
            objBattlefieldScrounge['timeStart'] = dateInMs();
            objBattlefieldScrounge['benefit'] = scrItemBenefit;
            //TO-DO: implement split attributes
            // //--The Split--\\
            // objBattlefieldScrounge['item'] = null;
            // objBattlefieldScrounge['science'] = null;
            // objBattlefieldScrounge['level'] = null;
            // objBattlefieldScrounge['rankMine'] = null,
            // objBattlefieldScrounge['rankLaboratory'] = null,
            // objBattlefieldScrounge['rankBattlefield'] = null,
            // objBattlefieldScrounge['rankWorkshop'] = null,
            // objBattlefieldScrounge['rankThievery'] = null,
            // objBattlefieldScrounge['rankSmelter'] = null
            battlefieldScrounge.update({
                user: self,
                slotID: scroungeable.scrSlotID
            }, {
                $set: objBattlefieldScrounge
            });

            //update MINESUPPORT of victim/cu
            var objBattlefieldSupport = {};
            objBattlefieldSupport['supporter'] = self;
            objBattlefieldSupport['refID'] = slotID;
            objBattlefieldSupport['benefit'] = 50; //TO-DO: 'benefit' - get value by item
            objBattlefieldSupport['timeStart'] = dateInMs();
            //TO-DO: implement split attributes
            // //--The Split--\\
            // objBattlefieldSupport['item'] = null;
            // objBattlefieldSupport['science'] = null;
            // objBattlefieldSupport['level'] = null;
            // objBattlefieldSupport['rankMine'] = null,
            // objBattlefieldSupport['rankLaboratory'] = null,
            // objBattlefieldSupport['rankBattlefield'] = null,
            // objBattlefieldSupport['rankWorkshop'] = null,
            // objBattlefieldSupport['rankThievery'] = null,
            // objBattlefieldSupport['rankSmelter'] = null
            battlefieldSupport.update({
                user: currentUser,
                slotID: scroungeable.supSlotID
            }, {
                $set: objBattlefieldSupport
            });

            Meteor.call("infoLog", 'Scrounging successful!', self);
            return "1Scrounging successful!";
        }

        // OLD OLD 2016/01/03 OLD OLD
        // //BuyFight new
        // buyFight: function(fightId, slider_range) {
        //     var self = Meteor.users.findOne({
        //         _id: this.userId
        //     }, {
        //         fields: {
        //             username: 1,
        //         }
        //     }).username;
        //     var colorCode = fightId.substring(0, 2);
        //     var matter = resources.findOne({
        //         user: self,
        //         colorCode: colorCode
        //     }, {
        //         fields: {
        //             matter: 1,
        //         }
        //     }).matter;
        //     var cursorFight = FightArenas.findOne({
        //         fight: fightId
        //     }, {
        //         fields: {
        //             cost: 1,
        //             time: 1,
        //         }
        //     });
        //     var cost = cursorFight.cost;
        //     var time = cursorFight.time;

        //     //check costs
        //     if (!(matter >= cost)) {
        //         Meteor.call("infoLog", 'You cannot buy this fight: You do not have enough matter!', self);
        //         return '0You cannot buy this fight: You do not have enough matter!';
        //     }

        //     var cursor = playerData.findOne({
        //         user: self
        //     }, {
        //         fields: {
        //             'battlefield.amountOwnSlots': 1,
        //             'battlefield.ownSlots': 1,
        //             'user': 1
        //         }
        //     }).battlefield;

        //     var amountSlots = cursor.amountOwnSlots;

        //     //Iterate all own slots and fill fight into free one
        //     for (i = 0; i < amountSlots; i++) {
        //         if (cursor.ownSlots['owns' + i].input == "0000") {
        //             //pay fight
        //             resources.update({
        //                 user: self
        //             }, {
        //                 $inc: {
        //                     matter: -cost
        //                 }
        //             });

        //             //add purchased item in playerData
        //             var obj2 = {};
        //             obj2['battlefield.ownSlots.owns' + i + '.stamp'] = new Date().getTime();
        //             obj2['battlefield.ownSlots.owns' + i + '.input'] = fightId;
        //             obj2['battlefield.ownSlots.owns' + i + '.control.min'] = slider_range[0];
        //             obj2['battlefield.ownSlots.owns' + i + '.control.max'] = slider_range[1];
        //             playerData.update({
        //                 user: self
        //             }, {
        //                 $set: obj2
        //             });
        //             // console.log(timers);
        //             //seltsam aber wahr: Wenn das nicht hier über diesen Umweg gesetzt wird, dann
        //             //wird manchmal der Wert einer anderen "i" Variable verwendet, was dann wiederum einen
        //             //slot repräsentiert, der nicht existiert
        //             var q = i;
        //             // console.log('saved', q, 'into battlefield timer, buyFight');
        //             //timers.push(menu, user, slot, remainingTime)
        //             // timers.push(['battlefield', self, i, time]);
        //             // console.log(timers);
        //             break;
        //         }
        //     }
        //     Meteor.call("infoLog", '1Fight purchase successful!', self);
        //     return '1Fight purchase successful!';
        // },

        // //new version
        // goScroungingBattlefield: function(slotId) {
        //     var currentUser = Meteor.users.findOne({
        //         _id: this.userId
        //     }, {
        //         fields: {
        //             cu: 1
        //         }
        //     }).cu;
        //     var myName = Meteor.users.findOne({
        //         _id: this.userId
        //     }, {
        //         fields: {
        //             username: 1
        //         }
        //     }).username;
        //     //CHECK IF YOU ARE TRYING TO SCROUNGE YOURSELF OR TARGET IS ALLRDY SCROUNGED
        //     if (currentUser == myName) {
        //         Meteor.call("infoLog", 'You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O', myName);
        //         return '0You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O';
        //     }
        //     var cursorMyPlayerData = playerData.findOne({
        //         user: myName
        //     }, {
        //         fields: {
        //             battlefield: 1
        //         }
        //     }).battlefield;

        //     var amountScrSlots = cursorMyPlayerData.amountScrSlots;

        //     for (i = 0; i < amountScrSlots; i++) {
        //         if (cursorMyPlayerData.scrSlots['scrs' + i].victim.name == currentUser) {
        //             Meteor.call("infoLog", 'You cannot scrounge here: You already scrounge this user!', myName);
        //             return '0You cannot scrounge here: You already scrounge this user!';
        //         }
        //     }
        //     //CHECK FREE SCRSLOTS OF SCROUNGER DATA
        //     var resultScrounger = -1;
        //     for (i = 0; i < amountScrSlots; i++) {
        //         if (cursorMyPlayerData.scrSlots['scrs' + i].victim.name == "") {
        //             resultScrounger = i;
        //             break;
        //         }
        //     }
        //     if (resultScrounger == -1) {
        //         Meteor.call("infoLog", 'You cannot scrounge here: Your Scrounge slots are all in use!', myName);
        //         return '0You cannot scrounge here: Your Scrounge slots are all in use!';
        //     }
        //     //CHECK FREE SUPSLOTS OF CURRENT USER DATA                
        //     var obj0 = {};
        //     obj0['owns' + slotId] = 1;
        //     var cursorCurrentUser = playerData.findOne({
        //         user: currentUser
        //     }, {
        //         fields: {
        //             battlefield: 1
        //         }
        //     }).battlefield;

        //     //Get free SupSlots index
        //     var amountSupSlots = cursorCurrentUser.amountSupSlots;

        //     var resultOwner = -1;
        //     for (i = 0; i < amountSupSlots; i++) {
        //         if (cursorCurrentUser.ownSlots['owns' + slotId]['sup' + i].name == "") {
        //             resultOwner = i;
        //             break;
        //         }
        //     }
        //     //LAST CHECK: RANGE SLIDER
        //     if (!(cursorCurrentUser.ownSlots['owns' + slotId].control.min <= cursorMyPlayerData.scrItem.benefit && cursorMyPlayerData.scrItem.benefit <= cursorCurrentUser.ownSlots['owns' + slotId].control.max)) {
        //         Meteor.call("infoLog", 'You cannot scrounge here: You do not have the right epicness!', myName);
        //         return '0You cannot scrounge here: You do not have the right epicness!';
        //     }

        //     //SupSlot with id result is free and correct: update it ?
        //     if (resultOwner == -1) {
        //         Meteor.call("infoLog", 'You cannot scrounge here: The owners support slots are all in use!', myName);
        //         return '0You cannot scrounge here: The owners support slots are all in use!';
        //     }
        //     //get my benefit
        //     var myBenefit = cursorMyPlayerData.scrItem.benefit;
        //     // console.log('myBenefit', myBenefit);

        //     //get my level
        //     var myLevel = cursorMyPlayerData.level;
        //     // console.log('myLevel', myLevel);

        //     //set time for the scrounging
        //     var timeStamp = new Date();
        //     // console.log('timeStamp', timeStamp);

        //     //set playerData of owner
        //     var obj0 = {};
        //     obj0['battlefield.ownSlots.owns' + slotId + '.sup' + resultOwner + '.name'] = myName;
        //     obj0['battlefield.ownSlots.owns' + slotId + '.sup' + resultOwner + '.benefit'] = myBenefit;
        //     obj0['battlefield.ownSlots.owns' + slotId + '.sup' + resultOwner + '.level'] = myLevel;
        //     obj0['battlefield.ownSlots.owns' + slotId + '.sup' + resultOwner + '.stamp'] = timeStamp.getTime();
        //     playerData.update({
        //         user: currentUser
        //     }, {
        //         $set: obj0
        //     });
        //     var cursorCurrentUserUpdated = playerData.findOne({
        //         user: currentUser
        //     }, {
        //         fields: {
        //             battlefield: 1
        //         }
        //     }).battlefield;

        //     //set my playerData
        //     var amountSupSlotsVictim = cursorCurrentUserUpdated.amountSupSlots;
        //     var amountScrSlotsVictim = cursorCurrentUserUpdated.amountScrSlots;
        //     var timeStampVictim = cursorCurrentUserUpdated.ownSlots['owns' + slotId].stamp;
        //     var inputVictim = cursorCurrentUserUpdated.ownSlots['owns' + slotId].input;

        //     var obj0 = {};
        //     //eigener Zeitstempel des Scroungens und eigene Rate
        //     obj0['battlefield.scrSlots.scrs' + resultScrounger + '.stamp'] = timeStamp.getTime();
        //     obj0['battlefield.scrSlots.scrs' + resultScrounger + '.benefit'] = myBenefit;
        //     //Anzahl sup slots des Opfers, Zeitstempel und input des gescroungten own slots des Opfers, 
        //     obj0['battlefield.scrSlots.scrs' + resultScrounger + '.victim.supSlotsVictim'] = amountSupSlotsVictim;
        //     obj0['battlefield.scrSlots.scrs' + resultScrounger + '.victim.stamp'] = timeStampVictim;
        //     obj0['battlefield.scrSlots.scrs' + resultScrounger + '.victim.input'] = inputVictim;
        //     obj0['battlefield.scrSlots.scrs' + resultScrounger + '.victim.name'] = currentUser;

        //     //Name und rate von Scroungern des slots und Zeitstempel des Scroungens
        //     //Für jeden sup slot des Opfers
        //     for (i = 0; i < amountSupSlotsVictim; i++) {
        //         var supporter = cursorCurrentUserUpdated.ownSlots['owns' + slotId]['sup' + i];
        //         //falls sup slot i des gescroungten own slots des Opfers einen Eintrag hat
        //         if (supporter.name != "") {
        //             //hole seinen Namen
        //             var supVictimName = supporter.name;
        //             //hole seine Rate
        //             var supVictimBenefit = supporter.benefit;
        //             //hole den Zeitstempel seines Scroungens
        //             var supVictimTimeStamp = supporter.stamp;
        //             obj0['battlefield.scrSlots.scrs' + resultScrounger + '.victim.sup' + i + '.name'] = supVictimName;
        //             obj0['battlefield.scrSlots.scrs' + resultScrounger + '.victim.sup' + i + '.benefit'] = supVictimBenefit;
        //             obj0['battlefield.scrSlots.scrs' + resultScrounger + '.victim.sup' + i + '.stamp'] = supVictimTimeStamp;
        //         }
        //     }
        //     playerData.update({
        //         user: myName
        //     }, {
        //         $set: obj0
        //     });

        //     Meteor.call("infoLog", '1Scrounging successful!', myName);
        //     return '1Scrounging successful!';
        // },

        // // //updates the battlefield
        // //    updateBattlefield: function(cUser, cPData) {
        // //        var cBattlefield = battlefield.findOne({
        // //            user: cUser
        // //        });
        // //        var serverTime = new Date().getTime();
        // //        //update current users BATTLEFIELD || all ownSlots
        // //        for (var j = 0; j < cPData.battlefield.ownSlots; j++) {
        // //            var cSlot = 'owns' + j;
        // //            //Fight exists?
        // //            var cFightID = cBattlefield[cSlot].input;
        // //            if (cFightID > 0) {
        // //                var cFight = FightArenas.findOne({
        // //                    fight: cFightID
        // //                });
        // //                var overallTime = cFight.time;
        // //                var startTime = cBattlefield[cSlot].stamp.getTime();
        // //                //Fight DONE?
        // //                if ((serverTime - startTime) > overallTime) {
        // //                    var sEpics = 0;
        // //                    var allSups = new Array();
        // //                    //Iterate Supporter
        // //                    for (var k = 0; k < cPData.battlefield.supSlots; k++) {
        // //                        var cSup = cBattlefield[cSlot]['sup' + k];
        // //                        //SupSlot used?
        // //                        if (cSup != undefined && cSup.length != 0) {
        // //                            var sBattlefield = battlefield.findOne({
        // //                                user: cSup
        // //                            });
        // //                            var currentSupScrSlots = playerData.findOne({
        // //                                user: cSup
        // //                            }, {
        // //                                fields: {
        // //                                    battlefield: 1
        // //                                }
        // //                            }).battlefield.scrSlots;
        // //                            //get index of scr slot
        // //                            var indexScr = -1;
        // //                            for (var m = 0; m < currentSupScrSlots; m++) {
        // //                                if (sBattlefield['scrs' + m].victim == cUser) indexScr = m;
        // //                            }
        // //                            // console.log('cUser: ' + cUser + ' currentSupScrSlots: ' + currentSupScrSlots + ' indexScr: ' + indexScr);
        // //                            if (indexScr == -1) {
        // //                                console.log('Server battlefield slot calculation problem 1! - index scr Slot');
        // //                                break;
        // //                            }
        // //                            var result = indexScr;

        // //                            allSups[k] = cSup;
        // //                            //calculate epicness of cSup
        // //                            var sEpic = sBattlefield['scrs' + result].benefit;
        // //                            sEpics = sEpics + sEpic;
        // //                            /*console.log(cUser + ' Progress: ' + progress);*/
        // //                        }
        // //                    }
        // //                    //split XP
        // //                    var overallXP = (cFight.value * (100 + sEpics)) / 100;
        // //                    var ownProfit = 0;
        // //                    if (allSups.length == 0) {
        // //                        ownProfit = overallXP;
        // //                    } else {
        // //                        ownProfit = 0.5 * overallXP;
        // //                        var supProfit = (0.5 * overallXP) / (allSups.length);
        // //                    }
        // //                    //owner
        // //                    var cUserXP = cPData.XP;
        // //                    var cUserRequXP = cPData.requiredXP;
        // //                    //LvlUP?
        // //                    if ((cUserXP + ownProfit) >= cUserRequXP) {
        // //                        var lvl = cPData.level;
        // //                        var obj0 = {};
        // //                        obj0['requiredXP'] = cUserRequXP + (225 * ((lvl + 10) / 2))
        // //                        obj0['XP'] = (cUserXP + ownProfit) - cUserRequXP;
        // //                        obj0['level'] = lvl + 1;
        // //                        playerData.update({
        // //                            user: cUser
        // //                        }, {
        // //                            $set: obj0
        // //                        });
        // //                    } else {
        // //                        var ownerNewXPValue = (cUserXP + ownProfit);
        // //                        playerData.update({
        // //                            user: cUser
        // //                        }, {
        // //                            $set: {
        // //                                XP: ownerNewXPValue
        // //                            },
        // //                        });
        // //                    }

        // //                    //sups
        // //                    for (var l = 0; l < allSups.length; l++) {
        // //                        var cSupPData = playerData.findOne({
        // //                            user: allSups[l]
        // //                        }, {
        // //                            fields: {
        // //                                requiredXP: 1,
        // //                                XP: 1,
        // //                                level: 1
        // //                            }
        // //                        });
        // //                        var cSupXP = cSupPData.XP;
        // //                        var cSupRequXP = cSupPData.requiredXP;
        // //                        //LvlUP?
        // //                        if ((cSupXP + supProfit) >= cSupRequXP) {
        // //                            var lvl = cSupPData.level;
        // //                            var obj0 = {};
        // //                            obj0['requiredXP'] = cSupRequXP + (225 * ((lvl + 10) / 2))
        // //                            obj0['XP'] = (cSupXP + supProfit) - cSupRequXP;
        // //                            obj0['level'] = lvl + 1;
        // //                            playerData.update({
        // //                                user: allSups[l]
        // //                            }, {
        // //                                $set: obj0
        // //                            });
        // //                        } else {
        // //                            var supNewXPValue = (cSupXP + supProfit);
        // //                            playerData.update({
        // //                                user: allSups[l]
        // //                            }, {
        // //                                $set: {
        // //                                    XP: supNewXPValue
        // //                                },
        // //                            });
        // //                        }
        // //                        //reset scr slot of sup
        // //                        //get index of scr slot
        // //                        var sBattlefield = battlefield.findOne({
        // //                            user: allSups[l]
        // //                        });
        // //                        var currentSupScrSlots = playerData.findOne({
        // //                            user: allSups[l]
        // //                        }, {
        // //                            fields: {
        // //                                battlefield: 1
        // //                            }
        // //                        }).battlefield.scrSlots;
        // //                        //get index of scr slot
        // //                        var indexScr = -1;
        // //                        for (var m = 0; m < currentSupScrSlots; m++) {
        // //                            if (sBattlefield['scrs' + m].victim == cUser) indexScr = m;
        // //                        }
        // //                        // console.log('cUser: ' + cUser + ' currentSupScrSlots: ' + currentSupScrSlots + ' indexScr: ' + indexScr);
        // //                        if (indexScr == -1) {
        // //                            console.log('Server battlefield slot calculation problem 2! - index scr Slot');
        // //                            break;
        // //                        }
        // //                        var result = indexScr;
        // //                        var obj0 = {};
        // //                        obj0['scrs' + result + '.victim'] = "";
        // //                        battlefield.update({
        // //                            user: allSups[l]
        // //                        }, {
        // //                            $set: obj0
        // //                        });
        // //                    }
        // //                    //reset owner slots
        // //                    var obj0 = {};
        // //                    obj0[cSlot + '.input'] = '0000';
        // //                    for (var m = 0; m < cPData.battlefield.supSlots; m++) {
        // //                        obj0[cSlot + '.sup' + m] = "";
        // //                    }
        // //                    battlefield.update({
        // //                        user: cUser
        // //                    }, {
        // //                        $set: obj0
        // //                    });
        // //                }
        // //            }
        // //        }
        // //    },
        // OLD OLD 2016/01/03 OLD OLD
    });
}
