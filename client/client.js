////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// HELP SECTION /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//[JQUERY: ATTR = Attribute Selector!]
// expl: $(this).attr('id') 

// var elm = document.createElement("div");
// var jelm = $(elm);//convert to jQuery Element
// var htmlElm = jelm[0];//convert to HTML Element

// Meteor - get object : $(e.target).css({"background-color":"orange"});
// Meteor - get object ID: alert($(event.currentTarget.ID));     alert(event.target.id);    e.currentTarget.id;

//target vs. currentTarget:
//bei target nimmt die Funktion Bezug auf das Element, auf das geklickt wurde. Und zwar das zuoberst liegende Element
//Beispiel bei Micha's Dropdown: Nachdem ich ein Bild über das DIV eingefügt hatte, reagierte die DropDown Funktion nicht mehr
//nimmt man stattdessen currentTarget, so werden alle oberhalb liegenden Elemente ignoriert und das spezifizierte Element 
//rafft, dass auf es geklickt wurde.

////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// CLIENT /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isClient) {
    /////////////////////////
    ///// SUBSCRIPTIONS /////
    /////////////////////////

    Meteor.subscribe("userData");
    Meteor.subscribe("playerData");
    Meteor.subscribe("MatterBlocks");
    Meteor.subscribe("resources");
    Meteor.subscribe("worldMapFields");

    ////////////////////////////
    ///// GLOBAL VARIABLES /////
    ////////////////////////////

    timers = new Array();
    mapRows = 6;
    mapColumns = 8;

    ////////////////////////////
    ////// FUNCTION CALLS //////
    ////////////////////////////

    setInterval(function() {
        updateTimers();
    }, 1 * 1000);

    //Client Live Render timers that increase or decrease value by 1 second

    function updateTimers() {
        for (var i = 0; i < timers.length; i++) {
            if ($('#' + timers[i].id).length > 0) {
                var value = timers[i].miliseconds + (timers[i].prefix * 1000);
                if (value < 0) value = 0;
                timers[i].miliseconds = value;
                $('#' + timers[i].id).text(msToTime(timers[i].miliseconds));
            } else {
                //Element not found and deleted after 3rd time
                if (timers[i].notFound > 2) {
                    timers.splice(i, 1);
                } else {
                    timers[i].notFound++;
                }
            }
        }
    }

    function msToTime(ms) {
        var helper = Math.round(ms / 1000);
        var secs = helper % 60;
        helper = (helper - secs) / 60;
        var mins = helper % 60;
        var hrs = (helper - mins) / 60;

        return hrs + ':' + mins + ':' + secs;
    }

    ////////////////////////////
    ///// TEMPLATE RETURNS /////
    ////////////////////////////
    Template.improvements.improvement = function() {
        var self = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                menu: 1,
                cu: 1,
                username: 1
            }
        });
        var cu = self.cu;
        var menu = self.menu;
        var color = "red";
        if (cu == self.username) {
            cu = 'YOU ARE HOME! :-)';
            color = "green";
        }
        var cursorPlayerData = playerData.findOne({
            user: self.username
        });
        obj0 = {};
        obj0['color'] = color;
        obj0['name'] = cu;
        obj0['xp'] = Math.floor(cursorPlayerData.XP) + '/' + cursorPlayerData.requiredXP;
        obj0['level'] = cursorPlayerData.level;
        obj0['science'] = cursorPlayerData[menu].science;
        obj0['item'] = cursorPlayerData[menu].scrItem.benefit;
        return obj0;
    }

    //////////////////
    ////// MINE //////
    //////////////////
    Template.mineBase.mineUnusedSlots = function() {
        //Mine
        var name = Meteor.users.findOne({
            _id: Meteor.userId()
        }).username;
        var cursorPlayerData = playerData.findOne({
            user: name
        });
        var amountOwnSlots = cursorPlayerData.mine.ownSlots;
        var cursorMine = mine.findOne({
            user: name
        });
        var objects = new Array();

        for (var i = 0; i < amountOwnSlots; i++) {
            if (cursorMine['owns' + i].input == "0000")
                objects[i] = {};
        }
        return objects;
    };

    Template.mineBase.mineUsedSlots = function() {
        //Mine
        var name = Meteor.users.findOne({
            _id: Meteor.userId()
        }).username;
        var cursorPlayerData = playerData.findOne({
            user: name
        });
        var amountOwnSlots = cursorPlayerData.mine.ownSlots;
        var cursorMine = mine.findOne({
            user: name
        });
        var objects = new Array();

        var calculatedServerTime = new Date().getTime() - timeDifference;
        //Iterate OwnSlots
        for (var i = 0; i < amountOwnSlots; i++) {
            var matterId = cursorMine['owns' + i].input;
            if (matterId > 0) {
                var cursorMatterBlock = MatterBlocks.findOne({
                    matter: matterId
                });
                var amountMaxSupSlots = cursorPlayerData.mine.supSlots;
                var amountUsedSupSlots = 0;
                for (var j = 0; j < amountMaxSupSlots; j++) {
                    if (cursorMine['owns' + i]['sup' + j].length != 0) amountUsedSupSlots++;
                }
                var obj0 = {};

                var progressOwn = (calculatedServerTime - cursorMine['owns' + i].stamp.getTime()) * (7.5 / 3600000);
                var progressSups = 0;
                var supRates = 0;

                var supSlotsMemory = new Array();
                //Iterate Supporter
                for (var k = 0; k < cursorPlayerData.mine.supSlots; k++) {
                    var currentSup = cursorMine['owns' + i]['sup' + k];
                    //SupSlot used?
                    if (currentSup != undefined && currentSup.length != 0) {
                        var obj00 = {};
                        var supMine = mine.findOne({
                            user: currentSup
                        });
                        var currentSupScrSlots = playerData.findOne({
                            user: currentSup
                        }, {
                            fields: {
                                mine: 1
                            }
                        }).mine.scrSlots;
                        //get index of scr slot
                        var indexScr = -1;
                        for (var m = 0; m < currentSupScrSlots; m++) {
                            if (supMine['scrs' + m].victim == name) indexScr = m;
                        }
                        if (indexScr == -1) {
                            console.log('Template.rmineBase slot calculation problem - index scr Slot');
                            break;
                        }
                        var result = indexScr;
                        //calculate mined by currentSup
                        var supTime = supMine['scrs' + result].stamp.getTime();

                        obj00['timeSpentId'] = 'timerInc_' + k + '_mine_sup';
                        var obj01 = {};
                        obj01['id'] = obj00['timeSpentId'];
                        obj01['miliseconds'] = (calculatedServerTime - supTime);
                        obj01['notFound'] = 0;
                        obj01['prefix'] = 1;
                        timers.push(obj01);
                        obj00['timeSpent'] = msToTime(obj01['miliseconds']);

                        var supRate = supMine['scrs' + result].benefit;
                        supRates = supRates + supRate;
                        progressSups = progressSups + (calculatedServerTime - supTime) * (supRate / 3600000);
                        obj00['mined'] = Math.floor((calculatedServerTime - supTime) * (supRate / 3600000));
                        obj00['miningrate'] = supRate + '/hr';
                        obj00['supName'] = currentSup;
                        supSlotsMemory[k] = obj00;
                    }
                }


                var progressTotal = progressOwn + progressSups;
                obj0['value'] = Math.floor(progressTotal) + '/' + cursorMatterBlock.value + '(' + Math.floor((Math.floor(progressTotal) / cursorMatterBlock.value) * 100) + '%)';
                obj0['color'] = cursorMatterBlock.color;
                obj0['slots'] = amountUsedSupSlots + '/' + amountMaxSupSlots;
                obj0['remainingId'] = 'timerDec_' + i + '_mine';
                obj0['timeSpentId'] = 'timerInc_' + i + '_mine';

                var obj1 = {};
                obj1['id'] = obj0['remainingId'];
                obj1['miliseconds'] = ((cursorMatterBlock.value - progressTotal) / ((7.5 + supRates) / 3600000));
                obj1['notFound'] = 0;
                obj1['prefix'] = -1;
                timers.push(obj1);
                obj0['remaining'] = msToTime((cursorMatterBlock.value - progressTotal) / ((7.5 + supRates) / 3600000));

                var obj2 = {};
                obj2['id'] = obj0['timeSpentId'];
                obj2['miliseconds'] = (calculatedServerTime - cursorMine['owns' + i].stamp);
                obj2['notFound'] = 0;
                obj2['prefix'] = 1;
                timers.push(obj2);
                obj0['timeSpent'] = msToTime((calculatedServerTime - cursorMine['owns' + i].stamp));

                if (amountUsedSupSlots == 0) {
                    obj0['profit'] = Math.floor(cursorMatterBlock.value) + '(100%)';
                } else {
                    obj0['profit'] = Math.floor(0.5 * cursorMatterBlock.value) + '(50%)';
                }
                obj0['miningrate'] = (7.5 + supRates) + '/hr';

                obj0['supporter'] = supSlotsMemory;

                //für den range slider
                obj0['slot'] = i;

                objects[i] = obj0;
            }
        }
        return objects;
    };

    Template.mineRightBaseUnusedSlots.mineUnusedScroungeSlots = function() {
        //Mine Scrounging
        var name = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                username: 1
            }
        }).username;
        var cursorPlayerData = playerData.findOne({
            user: name
        }, {
            fields: {
                mine: 1
            }
        }).mine;
        var amountScrSlots = cursorPlayerData.scrSlots;
        var cursorMine = mine.findOne({
            user: name
        });
        var objects = new Array();
        for (var i = 0; i < amountScrSlots; i++) {
            if (cursorMine['scrs' + i].victim == "")
                objects[i] = {};
        }
        return objects;
    };

    Template.mineRightBaseUsedSlots.mineUsedScroungeSlots = function() {
        //Mine Scrounging
        var name = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                username: 1
            }
        }).username;
        var cursorPlayerData = playerData.findOne({
            user: name
        }, {
            fields: {
                mine: 1
            }
        }).mine;
        var cursorMyMine = mine.findOne({
            user: name
        });
        var calculatedServerTime = new Date().getTime() - timeDifference;
        var amountScrSlots = cursorPlayerData.scrSlots;
        var objects = new Array();

        //Iterate all Scrounging Slots
        for (var i = 0; i < amountScrSlots; i++) {
            //Is used?
            if (cursorMyMine['scrs' + i].victim != "") {
                var victimName = cursorMyMine['scrs' + i].victim;
                var cursorVictimMine = mine.findOne({
                    user: victimName
                });
                var cursorPlayerDataVictim = playerData.findOne({
                    user: victimName
                }, {
                    fields: {
                        mine: 1
                    }
                });
                var amountVictimOwnSlots = cursorPlayerDataVictim.mine.ownSlots;
                var amountVictimSupSlots = cursorPlayerDataVictim.mine.supSlots;
                //get index of the right own slot
                var indexOwn = -1;
                for (var j = 0; j < amountVictimOwnSlots; j++) {
                    for (var k = 0; k < amountVictimSupSlots; k++) {
                        if (cursorVictimMine['owns' + j]['sup' + k] == name) indexOwn = j
                    }
                }
                if (indexOwn == -1) {
                    console.log('Template.rightBaseUsedSlots slot calculation problem - index own Slot');
                    break;
                }
                //Calculate input values
                var matterId = cursorVictimMine['owns' + indexOwn].input;
                var cursorMatterBlock = MatterBlocks.findOne({
                    matter: matterId
                });
                var progressOwn = (calculatedServerTime - cursorVictimMine['owns' + indexOwn].stamp.getTime()) * (7.5 / 3600000);
                var progressSups = 0;
                var supRates = 0;
                var amountUsedSupSlots = 0;
                //Iterate Supporter
                for (var l = 0; l < cursorPlayerDataVictim.mine.supSlots; l++) {
                    var currentSup = cursorVictimMine['owns' + indexOwn]['sup' + l];
                    //SupSlot used?
                    if (currentSup.length != "") {
                        amountUsedSupSlots++;
                        var currentSupScrSlots = playerData.findOne({
                            user: currentSup
                        }, {
                            fields: {
                                mine: 1
                            }
                        }).mine.scrSlots;
                        var cursorSupMine = mine.findOne({
                            user: currentSup
                        });
                        //get index of scr slot
                        var indexScr = -1;
                        for (var m = 0; m < currentSupScrSlots; m++) {
                            if (cursorSupMine['scrs' + m].victim == victimName) indexScr = m;
                        }
                        if (indexScr == -1) {
                            console.log('Template.rightBaseUsedSlots slot calculation problem - index scr Slot');
                            break;
                        }
                        //calculate mined by cSup
                        var supTime = cursorSupMine['scrs' + indexScr].stamp.getTime();
                        var supRate = cursorSupMine['scrs' + indexScr].benefit;
                        supRates = supRates + supRate;
                        progressSups = progressSups + (calculatedServerTime - supTime) * (supRate / 3600000);
                    }
                }
                var obj0 = {};
                var progressTotal = progressOwn + progressSups;
                obj0['color'] = cursorMatterBlock.color;
                obj0['victim'] = victimName;
                obj0['slots'] = amountUsedSupSlots + '/' + amountVictimSupSlots;
                obj0['remainingId'] = 'timerDec_' + i + '_mine_scr';
                obj0['timeSpentId'] = 'timerInc_' + i + '_mine_scr';

                var obj1 = {};
                obj1['id'] = obj0['remainingId'];
                obj1['miliseconds'] = ((cursorMatterBlock.value - progressTotal) / ((7.5 + supRates) / 3600000));
                obj1['notFound'] = 0;
                obj1['prefix'] = -1;
                timers.push(obj1);
                obj0['remaining'] = msToTime((cursorMatterBlock.value - progressTotal) / ((7.5 + supRates) / 3600000));

                var obj2 = {};
                obj2['id'] = obj0['timeSpentId'];
                obj2['miliseconds'] = (calculatedServerTime - cursorMyMine['scrs' + i].stamp);
                obj2['notFound'] = 0;
                obj2['prefix'] = 1;
                timers.push(obj2);
                obj0['timeSpent'] = msToTime((calculatedServerTime - cursorMyMine['scrs' + i].stamp));

                obj0['profit'] = Math.floor((0.5 / amountUsedSupSlots) * cursorMatterBlock.value) + '(' + (0.5 / amountUsedSupSlots) * 100 + '%)';
                obj0['miningrate'] = cursorMyMine['scrs' + i].benefit + '/hr';
                obj0['mined'] = Math.floor((calculatedServerTime - supTime) * (cursorMyMine['scrs' + i].benefit / 3600000));
                obj0['slider_id'] = i + 6;
                objects[i] = obj0;
            }
        }
        return objects;
    };

    Template.mineScrounge.mineSupporterSlots = function() {
        //Mine
        var self = Meteor.users.findOne({
            _id: Meteor.userId()
        });
        var name = self.cu;
        var cursorPlayerData = playerData.findOne({
            user: name
        });
        var amountOwnSlots = cursorPlayerData.mine.ownSlots;
        var cursorMine = mine.findOne({
            user: name
        });
        var objects = new Array();

        var calculatedServerTime = (new Date()).getTime() - timeDifference;
        //Iterate OwnSlots
        for (var i = 0; i < amountOwnSlots; i++) {
            var matterId = cursorMine['owns' + i].input;
            if (matterId > 0) {
                var cursorMatterBlock = MatterBlocks.findOne({
                    matter: matterId
                });
                var amountMaxSupSlots = cursorPlayerData.mine.supSlots;
                var amountUsedSupSlots = 0;
                for (var j = 0; j < amountMaxSupSlots; j++) {
                    if (cursorMine['owns' + i]['sup' + j].length != 0) amountUsedSupSlots++;
                }
                var obj0 = {};

                var progressOwn = (calculatedServerTime - cursorMine['owns' + i].stamp.getTime()) * (7.5 / 3600000);
                var progressSups = 0;
                var supRates = 0;

                var supSlotsMemory = new Array();
                //Iterate Supporter
                for (var k = 0; k < cursorPlayerData.mine.supSlots; k++) {
                    var currentSup = cursorMine['owns' + i]['sup' + k];
                    //SupSlot used?
                    if (currentSup != undefined && currentSup.length != 0) {
                        var obj00 = {};
                        var supMine = mine.findOne({
                            user: currentSup
                        });
                        var currentSupScrSlots = playerData.findOne({
                            user: currentSup
                        }, {
                            fields: {
                                mine: 1
                            }
                        }).mine.scrSlots;
                        //get index of scr slot
                        var indexScr = -1;
                        for (var m = 0; m < currentSupScrSlots; m++) {
                            if (supMine['scrs' + m].victim == name) indexScr = m;
                        }
                        if (indexScr == -1) {
                            console.log('Template.rmineBase slot calculation problem - index scr Slot');
                            break;
                        }
                        var result = indexScr;
                        //calculate mined by cSup
                        var supTime = supMine['scrs' + result].stamp.getTime();

                        obj00['timeSpentId'] = 'timerInc_' + k + '_mine_sup';
                        var obj01 = {};
                        obj01['id'] = obj00['timeSpentId'];
                        obj01['miliseconds'] = (calculatedServerTime - supTime);
                        obj01['notFound'] = 0;
                        obj01['prefix'] = 1;
                        timers.push(obj01);
                        obj00['timeSpent'] = msToTime(obj01['miliseconds']);

                        var supRate = supMine['scrs' + result].benefit;
                        supRates = supRates + supRate;
                        progressSups = progressSups + (calculatedServerTime - supTime) * (supRate / 3600000);

                        obj00['mined'] = Math.floor((calculatedServerTime - supTime) * (supRate / 3600000));
                        obj00['miningrate'] = supRate + '/hr';
                        obj00['supName'] = currentSup;
                        supSlotsMemory[k] = obj00;
                    }
                }


                var progressTotal = progressOwn + progressSups;
                obj0['value'] = Math.floor(progressTotal) + '/' + cursorMatterBlock.value + '(' + Math.floor((Math.floor(progressTotal) / cursorMatterBlock.value) * 100) + '%)';
                obj0['color'] = cursorMatterBlock.color;
                obj0['slots'] = amountUsedSupSlots + '/' + amountMaxSupSlots;
                obj0['slotsChange'] = (amountUsedSupSlots + 1) + '/' + amountMaxSupSlots;
                obj0['remainingId'] = 'timerDec_' + i + '_mine';
                obj0['remainingChangeId'] = 'timerDec_' + i + '_mineChange';
                obj0['timeSpentId'] = 'timerInc_' + i + '_mine';

                //Remaining calculation
                var obj1 = {};
                obj1['id'] = obj0['remainingId'];
                obj1['miliseconds'] = ((cursorMatterBlock.value - progressTotal) / ((7.5 + supRates) / 3600000));
                obj1['notFound'] = 0;
                obj1['prefix'] = -1;
                timers.push(obj1);
                obj0['remaining'] = msToTime((cursorMatterBlock.value - progressTotal) / ((7.5 + supRates) / 3600000));

                //RemainingChange calcuation
                var obj3 = {};
                obj3['id'] = obj0['remainingChangeId'];
                var myRate = playerData.findOne({
                    user: self.username
                }, {
                    fields: {
                        mine: 1
                    }
                }).mine.scrItem.benefit;
                obj3['miliseconds'] = ((cursorMatterBlock.value - progressTotal) / ((7.5 + supRates + myRate) / 3600000));
                obj3['notFound'] = 0;
                obj3['prefix'] = -1;
                timers.push(obj3);
                obj0['remainingChange'] = msToTime((cursorMatterBlock.value - progressTotal) / ((7.5 + supRates + myRate) / 3600000));

                var obj2 = {};
                obj2['id'] = obj0['timeSpentId'];
                obj2['miliseconds'] = (calculatedServerTime - cursorMine['owns' + i].stamp);
                obj2['notFound'] = 0;
                obj2['prefix'] = 1;
                timers.push(obj2);
                obj0['timeSpent'] = msToTime((calculatedServerTime - cursorMine['owns' + i].stamp));

                obj0['miningrate'] = (7.5 + supRates) + '/hr';
                obj0['miningrateChange'] = (7.5 + supRates + myRate) + '/hr';;

                //Make Slot scroungeable
                obj0['goScrounging'] = 'goScroungingMine_' + i;

                obj0['index'] = i;
                obj0['supporter'] = supSlotsMemory;
                var lockCheck = checkScroungeMine(i, self.username, self.cu);
                obj0['lockedMsg'] = lockCheck;
                if (lockCheck != false) lockCheck = true
                obj0['locked'] = lockCheck;
                objects[i] = obj0;
            }
        }
        return objects;
    };

    Template.mineBase.blockColors = function() {
        var cursorMatterColors = MatterBlocks.find({}, {
            fields: {
                'color': 1
            }
        }).fetch();
        var colorArray = new Array();
        for (var i = 0; i < cursorMatterColors.length; i++) {
            colorArray[i] = cursorMatterColors[i].color;
        }
        var result = distinct(colorArray);
        var objects = new Array();
        for (var j = 0; j < result.length; j++) {
            objects[j] = {
                'color': result[j]
            };
        }
        return objects;
    };

    Template.mineBase.matterBlocks = function() {
        return MatterBlocks.find({}, {
            sort: {
                matter: 1
            }
        });

    };

    /////////////////////////
    ////// BATTLEFIELD //////
    /////////////////////////
    Template.battlefieldBase.battlefieldUnusedSlots = function() {
        //Battlefield
        var name = Meteor.users.findOne({
            _id: Meteor.userId()
        }).username;
        var cursorPlayerData = playerData.findOne({
            user: name
        });
        var amountOwnSlots = cursorPlayerData.battlefield.ownSlots;
        var cursorBattlefield = battlefield.findOne({
            user: name
        });
        var objects = new Array();

        for (var i = 0; i < amountOwnSlots; i++) {
            if (cursorBattlefield['owns' + i].input == "0000")
                objects[i] = {};
        }
        return objects;
    };

    Template.battlefieldBase.battlefieldUsedSlots = function() {
        //Battlefield
        var name = Meteor.users.findOne({
            _id: Meteor.userId()
        }).username;
        var cursorPlayerData = playerData.findOne({
            user: name
        });
        var amountOwnSlots = cursorPlayerData.battlefield.ownSlots;
        var cursorBattlefield = battlefield.findOne({
            user: name
        });
        var objects = new Array();

        var calculatedServerTime = new Date().getTime() - timeDifference;
        //Iterate OwnSlots
        for (var i = 0; i < amountOwnSlots; i++) {
            var fightId = cursorBattlefield['owns' + i].input;
            if (fightId > 0) {
                var cursorFightArena = FightArenas.findOne({
                    fight: fightId
                });
                var amountMaxSupSlots = cursorPlayerData.battlefield.supSlots;
                var amountUsedSupSlots = 0;
                for (var j = 0; j < amountMaxSupSlots; j++) {
                    if (cursorBattlefield['owns' + i]['sup' + j].length != 0) amountUsedSupSlots++;
                }
                var obj0 = {};
                var supEpics = 0;

                var supSlotsMemory = new Array();
                //Iterate Supporter
                for (var k = 0; k < cursorPlayerData.battlefield.supSlots; k++) {
                    var currentSup = cursorBattlefield['owns' + i]['sup' + k];
                    //SupSlot used?
                    if (currentSup != undefined && currentSup.length != 0) {
                        var obj00 = {};
                        var supBattlefield = battlefield.findOne({
                            user: currentSup
                        });
                        var cursorCurrentSup = playerData.findOne({
                            user: currentSup
                        }, {
                            fields: {
                                battlefield: 1,
                                level: 1
                            }
                        });
                        var currentSupScrSlots = cursorCurrentSup.battlefield.scrSlots;
                        //get index of scr slot
                        var indexScr = -1;
                        for (var m = 0; m < currentSupScrSlots; m++) {
                            if (supBattlefield['scrs' + m].victim == name) indexScr = m;
                        }
                        if (indexScr == -1) {
                            console.log('Template.battlefieldBase slot calculation problem - index scr Slot');
                            break;
                        }
                        var result = indexScr;
                        //calculate timeSpent of currentSup
                        var supTime = supBattlefield['scrs' + result].stamp.getTime();

                        obj00['timeSpentId'] = 'timerInc_' + k + '_battlefield_sup';
                        var obj01 = {};
                        obj01['id'] = obj00['timeSpentId'];
                        obj01['miliseconds'] = (calculatedServerTime - supTime);
                        obj01['notFound'] = 0;
                        obj01['prefix'] = 1;
                        timers.push(obj01);
                        obj00['timeSpent'] = msToTime(obj01['miliseconds']);

                        var supEpic = supBattlefield['scrs' + result].benefit;
                        supEpics = supEpics + supEpic;
                        obj00['epicness'] = supEpic + '%';
                        obj00['level'] = cursorCurrentSup.level;
                        obj00['supName'] = currentSup;
                        supSlotsMemory[k] = obj00;
                    }
                }

                obj0['color'] = cursorFightArena.color;
                obj0['slots'] = amountUsedSupSlots + '/' + amountMaxSupSlots;
                obj0['xp'] = Math.floor((cursorFightArena.value * (100 + supEpics)) / 100) + '(' + Math.floor(100 + supEpics) + '%)';
                obj0['timeSpentId'] = 'timerInc_' + i + '_battlefield';

                var obj2 = {};
                obj2['id'] = obj0['timeSpentId'];
                obj2['miliseconds'] = (calculatedServerTime - cursorBattlefield['owns' + i].stamp);
                obj2['notFound'] = 0;
                obj2['prefix'] = 1;
                timers.push(obj2);
                obj0['timeSpent'] = msToTime((calculatedServerTime - cursorBattlefield['owns' + i].stamp));

                obj0['timeOverall'] = '/' + msToTime(cursorFightArena.time) + '(' + Math.floor((obj2['miliseconds'] / cursorFightArena.time) * 100) + '%)';

                if (amountUsedSupSlots == 0) {
                    obj0['profit'] = Math.floor(cursorFightArena.value) + '(100%)';
                } else {
                    obj0['profit'] = Math.floor(0.5 * (cursorFightArena.value + ((cursorFightArena.value * supEpics) / 100))) + '(50%)';
                }
                obj0['epicness'] = supEpics + '%';

                obj0['supporter'] = supSlotsMemory;

                //für den range slider
                obj0['slot'] = i;

                objects[i] = obj0;
            }
        }
        return objects;
    };

    Template.battlefieldRightBaseUnusedSlots.battlefieldUnusedScroungeSlots = function() {
        //Battlefield Scrounging
        var name = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                username: 1
            }
        }).username;
        var cursorPlayerData = playerData.findOne({
            user: name
        }, {
            fields: {
                battlefield: 1
            }
        }).battlefield;
        var amountScrSlots = cursorPlayerData.scrSlots;
        var cursorBattlefield = battlefield.findOne({
            user: name
        });
        var objects = new Array();
        for (var i = 0; i < amountScrSlots; i++) {
            if (cursorBattlefield['scrs' + i].victim == "")
                objects[i] = {};
        }
        return objects;
    };

    Template.battlefieldRightBaseUsedSlots.battlefieldUsedScroungeSlots = function() {
        //Battlefield Scrounging
        var name = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                username: 1
            }
        }).username;
        var cursorPlayerData = playerData.findOne({
            user: name
        }, {
            fields: {
                battlefield: 1
            }
        }).battlefield;
        var cursorMyBattlefield = battlefield.findOne({
            user: name
        });
        var calculatedServerTime = new Date().getTime() - timeDifference;
        var amountScrSlots = cursorPlayerData.scrSlots;
        var objects = new Array();

        //Iterate all Scrounging Slots
        console.log('amountScrSlots: ' + amountScrSlots);
        for (var i = 0; i < amountScrSlots; i++) {
            //Is used?
            if (cursorMyBattlefield['scrs' + i].victim != "") {
                var victimName = cursorMyBattlefield['scrs' + i].victim;
                var cursorVictimBattlefield = battlefield.findOne({
                    user: victimName
                });
                var cursorPlayerDataVictim = playerData.findOne({
                    user: victimName
                }, {
                    fields: {
                        battlefield: 1
                    }
                });
                var amountVictimOwnSlots = cursorPlayerDataVictim.battlefield.ownSlots;
                var amountVictimSupSlots = cursorPlayerDataVictim.battlefield.supSlots;
                //get index of the right own slot
                var indexOwn = -1;
                for (var j = 0; j < amountVictimOwnSlots; j++) {
                    for (var k = 0; k < amountVictimSupSlots; k++) {
                        if (cursorVictimBattlefield['owns' + j]['sup' + k] == name) indexOwn = j
                    }
                }
                if (indexOwn == -1) {
                    console.log('Template.rightBaseUsedSlots slot calculation problem - index own Slot');
                    break;
                }
                //Calculate input values
                var fightId = cursorVictimBattlefield['owns' + indexOwn].input;
                var cursorFightArena = FightArenas.findOne({
                    fight: fightId
                });
                var supEpics = 0;
                var amountUsedSupSlots = 0;
                //Iterate Supporter
                for (var l = 0; l < cursorPlayerDataVictim.battlefield.supSlots; l++) {
                    var currentSup = cursorVictimBattlefield['owns' + indexOwn]['sup' + l];
                    //SupSlot used?
                    if (currentSup.length != "") {
                        amountUsedSupSlots++;
                        var currentSupScrSlots = playerData.findOne({
                            user: currentSup
                        }, {
                            fields: {
                                battlefield: 1
                            }
                        }).battlefield.scrSlots;
                        var cursorSupBattlefield = battlefield.findOne({
                            user: currentSup
                        });
                        //get index of scr slot
                        var indexScr = -1;
                        for (var m = 0; m < currentSupScrSlots; m++) {
                            if (cursorSupBattlefield['scrs' + m].victim == victimName) indexScr = m;
                        }
                        if (indexScr == -1) {
                            console.log('Template.rightBaseUsedSlots slot calculation problem - index scr Slot');
                            break;
                        }
                        //calculate timeSpent and epicness of cSup
                        var supTime = cursorSupBattlefield['scrs' + indexScr].stamp.getTime();
                        var supEpic = cursorSupBattlefield['scrs' + indexScr].benefit;
                        supEpics = supEpics + supEpic;
                    }
                }
                var obj0 = {};
                obj0['color'] = cursorFightArena.color;
                obj0['victim'] = victimName;
                obj0['slots'] = amountUsedSupSlots + '/' + amountVictimSupSlots;
                obj0['timeSpentId'] = 'timerInc_' + i + '_battlefield_scr';
                obj0['remainingId'] = 'timerDec_' + i + '_battlefield_scr';

                var obj1 = {};
                obj1['id'] = obj0['remainingId'];
                obj1['miliseconds'] = (cursorFightArena.time) - (calculatedServerTime - cursorMyBattlefield['scrs' + i].stamp)
                obj1['notFound'] = 0;
                obj1['prefix'] = -1;
                timers.push(obj1);
                obj0['remaining'] = msToTime(obj1['miliseconds']);

                var obj2 = {};
                obj2['id'] = obj0['timeSpentId'];
                obj2['miliseconds'] = (calculatedServerTime - cursorMyBattlefield['scrs' + i].stamp);
                obj2['notFound'] = 0;
                obj2['prefix'] = 1;
                timers.push(obj2);
                obj0['timeSpent'] = msToTime((calculatedServerTime - cursorMyBattlefield['scrs' + i].stamp));

                obj0['timeOverall'] = '/' + msToTime(cursorFightArena.time) + '(' + Math.floor((obj2['miliseconds'] / cursorFightArena.time) * 100) + '%)';

                obj0['profit'] = Math.floor((0.5 / amountUsedSupSlots) * cursorFightArena.value + (cursorFightArena.value * supEpics) / 100) + '(' + (0.5 / amountUsedSupSlots) * 100 + '%)';
                obj0['epicness'] = supEpics + '%';
                objects[i] = obj0;
            }
        }
        return objects;
    };

    Template.battlefieldScrounge.battlefieldSupporterSlots = function() {
        //Battlefield
        var self = Meteor.users.findOne({
            _id: Meteor.userId()
        });
        var name = self.cu;
        var cursorPlayerData = playerData.findOne({
            user: name
        });
        var amountOwnSlots = cursorPlayerData.battlefield.ownSlots;
        var cursorBattlefield = battlefield.findOne({
            user: name
        });
        var objects = new Array();

        var calculatedServerTime = (new Date()).getTime() - timeDifference;
        //Iterate OwnSlots
        for (var i = 0; i < amountOwnSlots; i++) {
            var fightId = cursorBattlefield['owns' + i].input;
            if (fightId > 0) {
                var cursorFightArena = FightArenas.findOne({
                    fight: fightId
                });
                var amountMaxSupSlots = cursorPlayerData.battlefield.supSlots;
                var amountUsedSupSlots = 0;
                for (var j = 0; j < amountMaxSupSlots; j++) {
                    if (cursorBattlefield['owns' + i]['sup' + j].length != 0) amountUsedSupSlots++;
                }
                var obj0 = {};
                var supEpics = 0;

                var supSlotsMemory = new Array();
                //Iterate Supporter
                for (var k = 0; k < cursorPlayerData.battlefield.supSlots; k++) {
                    var currentSup = cursorBattlefield['owns' + i]['sup' + k];
                    //SupSlot used?
                    if (currentSup != undefined && currentSup.length != 0) {
                        var obj00 = {};
                        var cursorCurrentSup = playerData.findOne({
                            user: currentSup
                        }, {
                            fields: {
                                battlefield: 1,
                                level: 1
                            }
                        });
                        var currentSupScrSlots = cursorCurrentSup.battlefield.scrSlots;

                        var supBattlefield = battlefield.findOne({
                            user: currentSup
                        });
                        //get index of scr slot
                        var indexScr = -1;
                        for (var m = 0; m < currentSupScrSlots; m++) {
                            if (supBattlefield['scrs' + m].victim == name) indexScr = m;
                        }
                        if (indexScr == -1) {
                            console.log('Template.battlefieldBase slot calculation problem - index scr Slot');
                            break;
                        }
                        var result = indexScr;
                        //calculate timespent by cSup
                        var supTime = supBattlefield['scrs' + result].stamp.getTime();

                        obj00['timeSpentId'] = 'timerInc_' + k + '_battlefield_sup';
                        var obj01 = {};
                        obj01['id'] = obj00['timeSpentId'];
                        obj01['miliseconds'] = (calculatedServerTime - supTime);
                        obj01['notFound'] = 0;
                        obj01['prefix'] = 1;
                        timers.push(obj01);
                        obj00['timeSpent'] = msToTime(obj01['miliseconds']);

                        var supEpic = supBattlefield['scrs' + result].benefit;
                        supEpics = supEpics + supEpic;

                        obj00['epicness'] = supEpic + '%';
                        obj00['level'] = cursorCurrentSup.level;
                        obj00['supName'] = currentSup;
                        supSlotsMemory[k] = obj00;
                    }
                }


                obj0['color'] = cursorFightArena.color;
                obj0['slots'] = amountUsedSupSlots + '/' + amountMaxSupSlots;
                obj0['slotsChange'] = (amountUsedSupSlots + 1) + '/' + amountMaxSupSlots;
                obj0['xp'] = Math.floor((cursorFightArena.value * (100 + supEpics)) / 100) + '(' + Math.floor(100 + supEpics) + '%)';
                var myEpic = playerData.findOne({
                    user: self.username
                }, {
                    fields: {
                        battlefield: 1
                    }
                }).battlefield.scrItem.benefit;
                obj0['xpChange'] = Math.floor((cursorFightArena.value * (100 + supEpics + myEpic)) / 100) + '(' + Math.floor(100 + supEpics) + '%)';
                obj0['timeSpentId'] = 'timerInc_' + i + '_battlefield';

                var obj2 = {};
                obj2['id'] = obj0['timeSpentId'];
                obj2['miliseconds'] = (calculatedServerTime - cursorBattlefield['owns' + i].stamp);
                obj2['notFound'] = 0;
                obj2['prefix'] = 1;
                timers.push(obj2);
                obj0['timeSpent'] = msToTime((calculatedServerTime - cursorBattlefield['owns' + i].stamp));

                obj0['timeOverall'] = '/' + msToTime(cursorFightArena.time) + '(' + Math.floor((obj2['miliseconds'] / cursorFightArena.time) * 100) + '%)';

                if (amountUsedSupSlots == 0) {
                    obj0['profit'] = Math.floor(cursorFightArena.value) + '(100%)';
                } else {
                    obj0['profit'] = Math.floor(0.5 * (cursorFightArena.value + ((cursorFightArena.value * supEpics) / 100))) + '(50%)';
                }
                obj0['epicness'] = supEpics + '%';
                obj0['epicnessChange'] = (supEpics + myEpic) + '%';

                obj0['supporter'] = supSlotsMemory;

                //für den range slider
                obj0['slot'] = i;

                //Make Slot scroungeable
                obj0['goScrounging'] = 'goScroungingBattlefield_' + i;

                obj0['index'] = i;
                obj0['supporter'] = supSlotsMemory;
                var lockCheck = checkScroungeBattlefield(i, self.username, self.cu);
                obj0['lockedMsg'] = lockCheck;
                if (lockCheck != false) lockCheck = true
                obj0['locked'] = lockCheck;
                objects[i] = obj0;
            }
        }
        return objects;
    };

    Template.battlefieldBase.arenaColors = function() {
        var cursorArenaColors = FightArenas.find({}, {
            fields: {
                'color': 1
            }
        }).fetch();
        var colorArray = new Array();
        for (var i = 0; i < cursorArenaColors.length; i++) {
            colorArray[i] = cursorArenaColors[i].color;
        }
        var result = distinct(colorArray);
        var objects = new Array();
        for (var j = 0; j < result.length; j++) {
            objects[j] = {
                'color': result[j]
            };
        }
        return objects;
    };

    Template.battlefieldBase.fightArenas = function() {

        return FightArenas.find({}, {
            sort: {
                fight: 1
            }
        });

    };

    Template.worldMap.worldMapArray = function() {
        return Session.get("worldMapArray");
    };

    Template.scroungePreview.previewInfos = function() {
        return Session.get("worldMapPreview");
    }

    Template.buyMenu.playerData = function() {

        return playerData.find({});

    };

    Template.buyMenu.mineSlots = function() {

        return mineSlots.find({});

    };

    Template.mineBase.playerData = function() {

        return playerData.find({});

    };

    Template.standardBorder.resources = function() {
        var arrayHelper = resources.find({}).fetch();
        arrayHelper[0].values.green.matter = Math.floor(arrayHelper[0].values.green.matter);
        return arrayHelper;

    };

    Template.standardBorder.worldMapFields = function() {

        return worldMapFields.find({});

    }

    Template.masterLayout.rendered = function() {
        $("body").append("<div id='item_tooltip_window' title=''></div>");
    }

    //////////////////
    ///// EVENTS /////
    //////////////////
    Template.standardBorder.events({

        'click #testButton': function(e, t) {

        },

        'click #testButton2': function(e, t) {

            logRenders();

        },

        'click .category_1': function(e, t) {
            Meteor.users.update({
                _id: Meteor.userId()
            }, {
                $set: {
                    menu: 'mine'
                }
            });
            Meteor.call('asyncJob', function(err, data) {
                switch_category($(e.currentTarget), 200);
            });
        },

        'click .category_3': function(e, t) {
            Meteor.users.update({
                _id: Meteor.userId()
            }, {
                $set: {
                    menu: 'battlefield'
                }
            });
            Meteor.call('asyncJob', function(err, data) {
                switch_category($(e.currentTarget), 200);
            });
        },
        'click #switchToWorldMap': function(e, t) {
            if (!$("#worldViewPort").length) {
                switchToWorldMap();
            } else {
                renderActiveMiddle();
            }
        },

        'click #character': function(e, t) {
            if ($('.characterView').length == 0) {
                Router.current().render('characterView', {
                    to: 'middle'
                });
            } else {
                renderActiveMiddle();
            }
        },

        'click #scrounge': function(e, t) {
            var self = Meteor.users.findOne({
                _id: Meteor.userId()
            }, {
                fields: {
                    cu: 1,
                    username: 1
                }
            });
            if (self.cu != self.username) {
                Session.set("lastPlayer", self.cu);
                Meteor.users.update({
                    _id: Meteor.userId()
                }, {
                    $set: {
                        cu: self.username
                    }
                });
            } else {
                if (Session.get("lastPlayer") != undefined) {
                    Meteor.users.update({
                        _id: Meteor.userId()
                    }, {
                        $set: {
                            cu: Session.get("lastPlayer")
                        }
                    });
                }
            }
        }
    });

    // Template.characterView.rendered = function() {
    // }

    /*
        Events Frame-Buttons + Hover

        // 'mouseover #scrounge': function(e, t) {

        //     var pos = $('#scrounge').css("background-position");
        //     var size = $('#scrounge').css("padding");
        //     //console.log(pos);
        //     //console.log(size);

        //     /*Umsetzung der media queries in javascript, Abfrage über die Größe des Elements, muss noch für alle anderen Elemente übernommen werden*/
    //     switch (size) {

    //         case "76px":

    //             $('#scrounge').css({
    //                 "background-position": "0px -153px"
    //             });
    //             break;

    //         case "51px":

    //             $('#scrounge').css({
    //                 "background-position": "0px -103px"
    //             });
    //             break;

    //         case "40px":

    //             $('#scrounge').css({
    //                 "background-position": "0px -80px"
    //             });
    //             break;

    //         default:

    //             console.log("something's wrong...");
    //     }
    // },

    // 'mouseout #scrounge': function(e, t) {

    //     var pos = $('#scrounge').css("background-position");
    //     var size = $('#scrounge').css("padding");
    //     //console.log(pos);
    //     //console.log(size);

    //     /*Umsetzung der media queries in javascript, Abfrage über die Größe des Elements, muss noch für alle anderen Elemente übernommen werden*/
    //     switch (size) {

    //         case "76px":

    //             $('#scrounge').css({
    //                 "background-position": "0px 0px"
    //             });
    //             break;

    //         case "51px":

    //             $('#scrounge').css({
    //                 "background-position": "0px 0px"
    //             });
    //             break;

    //         case "40px":

    //             $('#scrounge').css({
    //                 "background-position": "0px 0px"
    //             });
    //             break;

    //         default:

    //             console.log("something's wrong...");
    //     }
    // }
    // });

    Template.masterLayout.events({
        'mousedown img': function(e, t) {
            return false;
        },
        'mouseover .item_tooltip': function(e, t) {
            //Session.set("changes", "onMouseOver");
            $("#item_tooltip_window").html($(e.target).attr("title"));
            $(e.target).attr("title", "");
            $("#item_tooltip_window").css({
                display: "table"
            });
            if ($("#item_tooltip_window").width() + e.clientX > $(window).width()) {
                var offset = -1 * $("#item_tooltip_window").width();
                $("#item_tooltip_window").css({
                    "margin-left": offset
                });
            } else {
                $("#item_tooltip_window").css({
                    "margin-left": "0px"
                });
            }

            $("#item_tooltip_window").stop().fadeTo("fast", 1);
        },
        'mousemove .item_tooltip': function(e, t) {
            $("#item_tooltip_window").css({
                left: e.clientX,
                top: e.clientY
            });
        },
        'mouseout .item_tooltip': function(e, t) {
            //Session.set("changes", "onMouseOut");
            $(e.target).attr("title", $("#item_tooltip_window").html());
            $("#item_tooltip_window").stop().fadeTo("fast", 0, function() {
                $("#item_tooltip_window").css({
                    display: "none"
                });
            });
        },
        'mouseover .slider': function(e, t) {
            slide($(e.target));
        },
        'mouseout .slider': function(e, t) {
            slide_stop();
        },
        'mouseenter .tooltip_hover': function(e, t) {
            fade_In_and_Out("tooltip", $(e.currentTarget).children().attr('id').substr(20), "in");
        },
        'mouseleave .tooltip_hover': function(e, t) {
            fade_In_and_Out("tooltip", $(e.currentTarget).children().attr('id').substr(20), "out");
        },

        //To-DO Media Queries in 3 CSS files aufteilen und je nach Query nutzen
        //      Evtl. SpriteSheets anlegen im 4er Block und abhängig von der Größe benutzen
        'mouseover .hover': function(e, t) {
            //console.log(e.target);
            var pos = $(e.target).css("background-position");
            var size = $(e.target).css("padding");
            var bImage = $(e.target).css("background-image");
            var bImageHover = bImage.replace(".png", "_hover.png");
            $(e.target).css({
                "background-image": bImageHover
            });
        },
        'mouseout .hover': function(e, t) {
            //console.log(e.target);
            var pos = $(e.target).css("background-position");
            var size = $(e.target).css("padding");
            var bImageHover = $(e.target).css("background-image");
            var bImage = bImageHover.replace("_hover.png", ".png");
            $(e.target).css({
                "background-image": bImage
            });
        },
        'click .scrounge_now': function(e, t) {
            switchToWorldMap();
        },
        'click .dropdown': function(e, t) {
            //console.log($(e.target).parent().attr("class").search("goScroungingIcon"));
            // if ($(e.target).src().length() == 1) {
            //     console.log('blub');
            // }

            if ($(e.target).parent().attr("class").search("goScroungingIcon") == -1) {

                if ($(e.currentTarget).children().eq(1).filter(':not(:animated)').length == 1) { //das 2te child element (der advanced div) wird auf laufende animationen geprüft

                    var height2 = $(e.currentTarget).height();

                    if ($(e.currentTarget).children().eq(1).filter(':not(:animated)').height() == 0) {
                        $(e.currentTarget).children().eq(1).css({
                            "height": "auto"
                        });
                        var height = $(e.currentTarget).children().eq(1).height();
                        $(e.currentTarget).children().eq(1).animate({
                            "height": "0px"
                        }, 0, function() {
                            $(e.currentTarget).children().eq(1).animate({
                                "height": "13px"
                            }, 50, function() {
                                $(e.currentTarget).children().eq(1).animate({
                                    "height": height
                                }, 1000);
                                $(e.currentTarget).animate({
                                    "height": parseInt(height2) + parseInt(height) - 13
                                }, 1000);
                            });

                        });


                    } else if ($(e.currentTarget).children().eq(1).filter(':not(:animated)').height() != 0) {

                        var height3 = $(e.currentTarget).children().eq(1).height();
                        $(e.currentTarget).animate({
                            "height": parseInt(height2) - parseInt(height3) + 13
                        }, 1000);
                        $(e.currentTarget).children().eq(1).animate({
                            "height": "13px"
                        }, 1000, function() {
                            $(e.currentTarget).children().eq(1).animate({
                                "height": "0px"
                            }, 50);
                        });
                    }
                }
            }

        }
    });

    Template.mineBase.events({
        'click .item': function(e, t) {
            //Variante B
            var currentUser = Meteor.users.findOne({
                _id: Meteor.userId()
            }, {
                fields: {
                    username: 1,
                }
            }).username;
            var cursorPlayerData = playerData.findOne({
                user: currentUser
            });
            $('#buyMenu').fadeIn();
            $('#background_fade').fadeIn();
            Session.set("clickedMatter", e.currentTarget.id);
            $("#buyMenuItem").attr("src", "/Aufloesung1920x1080/Mine/MatterBlock_" + this.color + ".png");
            $('#item').text("Matter: " + this.value);
            var amountSupSlots = cursorPlayerData.mine.supSlots;
            range_slider("Buy_Menu", cursorPlayerData.mine.minControl, cursorPlayerData.mine.maxControl, cursorPlayerData.mine.minControl, cursorPlayerData.mine.maxControl);
            $('#price').text("Price: " + this.cost);

            $("#range_slider_Buy_Menu").children('.ui-slider-handle').css("display", "block");

            if ($('#AmountScroungerSlots').children()) {
                $('#AmountScroungerSlots').children().remove();
            }

            for (var i = 0; i < 6; i++) {

                if (amountSupSlots > i) {

                    $('#AmountScroungerSlots').append("<div class='sslots_available'> </div>");

                } else {

                    $('#AmountScroungerSlots').append("<div class='sslots_unavailable'> </div>");

                }
            }

            //target: Element, auf das geklickt wird  currentTarget: Element, an das das Event geheftet wurde
            //Variante A
            /*        var cursor = MatterBlocks.findOne({matter: e.currentTarget.id});

          console.log(cursor);

          $('#buyMenu').fadeIn();
          $("#buyMenuMatterBlock").attr("src","/Aufloesung1920x1080/Mine/MatterBlock_"+cursor.color+".png");
          $('#price').text("Price: "+cursor.cost);
          $('#matter').text("Matter: "+cursor.value);*/
        }
    });

    Template.battlefieldBase.events({
        'click .item': function(e, t) {
            //Variante B
            var currentUser = Meteor.users.findOne({
                _id: Meteor.userId()
            }, {
                fields: {
                    username: 1,
                }
            }).username;
            var cursorPlayerData = playerData.findOne({
                user: currentUser
            });
            $('#buyMenu').fadeIn();
            $('#background_fade').fadeIn();
            Session.set("clickedFight", e.currentTarget.id);
            $("#buyMenuItem").attr("src", "/Aufloesung1920x1080/Battlefield/Battles_" + this.color + ".png");
            $('#item').text("XP: " + this.value);
            var amountSupSlots = cursorPlayerData.battlefield.supSlots;
            range_slider("Buy_Menu", cursorPlayerData.battlefield.minControl, cursorPlayerData.battlefield.maxControl, cursorPlayerData.battlefield.minControl, cursorPlayerData.battlefield.maxControl);
            $('#time').text("Time: " + msToTime(this.time));
            $('#price').text("Price: " + this.cost);

            $("#range_slider_Buy_Menu").children('.ui-slider-handle').css("display", "block");

            if ($('#AmountScroungerSlots').children()) {
                $('#AmountScroungerSlots').children().remove();
            }

            for (var i = 0; i < 6; i++) {

                if (amountSupSlots > i) {

                    $('#AmountScroungerSlots').append("<div class='sslots_available'> </div>");

                } else {

                    $('#AmountScroungerSlots').append("<div class='sslots_unavailable'> </div>");

                }
            }
        }
    });

    Template.mineScrounge.events({
        'click .scroungable': function(e, t) {

            /*AN GRAFIK ANGEPASSTE VERSION VON J.P.*/

            if ($(e.currentTarget).next(".scroungable_advanced").height() == 0) {
                $(e.currentTarget).next(".scroungable_advanced").animate({
                    "height": "100%"
                }, 0);
                var height = $(e.currentTarget).next(".scroungable_advanced").height() + 13 + "px";
                $(e.currentTarget).next(".scroungable_advanced").filter(':not(:animated)').animate({
                    "height": "0px"
                }, 0, function() {

                    $(e.currentTarget).next(".scroungable_advanced").filter(':not(:animated)').animate({
                        "margin-top": "-13px"
                    }, 150, function() {

                        $(e.currentTarget).next(".scroungable_advanced").filter(':not(:animated)').animate({
                            "height": height
                        }, 1000);

                    });
                });

            } else {
                $(e.currentTarget).next(".scroungable_advanced").animate({
                    "height": "0px",
                }, 1000);
                $(e.currentTarget).next(".scroungable_advanced").animate({
                    "margin-top": "0px"
                }, 150);
            }
        },

        'click .goScroungingMine': function(e, t) {
            var slotId = e.currentTarget.id.split("_").pop();
            Meteor.call('goScroungingMine', slotId, function(err, result) {
                if (err) {
                    console.log('goScroungingMine: ' + slotId + ' : ' + err);
                }
                if (result) {
                    infoLog(result, "red");
                    showInfoTextAnimation(result, "green");
                }
            });
        },
    });

    Template.battlefieldScrounge.events({
        'click .scroungable': function(e, t) {

            /*AN GRAFIK ANGEPASSTE VERSION VON J.P.*/

            if ($(e.currentTarget).next(".scroungable_advanced").height() == 0) {
                $(e.currentTarget).next(".scroungable_advanced").animate({
                    "height": "100%"
                }, 0);
                var height = $(e.currentTarget).next(".scroungable_advanced").height() + 13 + "px";
                $(e.currentTarget).next(".scroungable_advanced").filter(':not(:animated)').animate({
                    "height": "0px"
                }, 0, function() {

                    $(e.currentTarget).next(".scroungable_advanced").filter(':not(:animated)').animate({
                        "margin-top": "-13px"
                    }, 150, function() {

                        $(e.currentTarget).next(".scroungable_advanced").filter(':not(:animated)').animate({
                            "height": height
                        }, 1000);

                    });
                });

            } else {
                $(e.currentTarget).next(".scroungable_advanced").animate({
                    "height": "0px",
                }, 1000);
                $(e.currentTarget).next(".scroungable_advanced").animate({
                    "margin-top": "0px"
                }, 150);
            }
        },

        'click .goScroungingBattlefield': function(e, t) {
            var slotId = e.currentTarget.id.split("_").pop();
            Meteor.call('goScroungingBattlefield', slotId, function(err, result) {
                if (err) {
                    console.log('goScroungingBattlefield: ' + err);
                }
                if (result) {
                    infoLog(result, "red");
                    showInfoTextAnimation(result, "green");
                }
            });
        }
    });

    //TODO: noch nicht fertig !
    Template.buyMenu.events({
        'click #buyMenuYes': function(e, t) {

            var menu = Meteor.users.findOne({
                _id: Meteor.userId()
            }, {
                fields: {
                    menu: 1,
                }
            }).menu;

            // Werte des Range Sliders
            var slider_range = $('#range_slider_Buy_Menu').slider("option", "values");

            //updating the database
            if (menu == 'mine') {
                Meteor.call('buyMatter', Session.get("clickedMatter"), slider_range, function(err, result) {
                    if (err) {
                        console.log(err);
                    }
                    if (result) {
                        infoLog(result, "red");
                        showInfoTextAnimation(result, "green");
                    }
                });
            }
            if (menu == 'battlefield') {
                Meteor.call('buyFight', Session.get("clickedFight"), slider_range, function(err, result) {
                    if (err) {
                        console.log(err);
                    }
                    if (result) {
                        infoLog(result, "red");
                        showInfoTextAnimation(result, "green");
                    }
                });
            }
            $('#buyMenu').fadeOut();
            $('#background_fade').fadeOut();

        },

        'click #buyMenuNo': function(e, t) {
            $('#buyMenu').fadeOut();
            $('#background_fade').fadeOut();

        },
    });

    Template.worldMap.events({
        'mouseenter .worldMapPlayerPlace': function(e, t) {
            // var element = $(e.currentTarget).attr("id");
            // $('#preview' + element).css({"visibility" : "visible"});
            // get orientation
            var player = $(e.currentTarget).attr("id");
            if (!player) return
            var obj0 = {};
            obj0['id'] = 'preview' + player;
            obj0['left'] = $(e.currentTarget).css("left");
            obj0['bottom'] = $(e.currentTarget).css("bottom");
            // get db data
            var myName = Meteor.users.findOne({
                _id: Meteor.userId()
            }, {
                fields: {
                    username: 1
                }
            }).username;
            var cursorPlayerData = playerData.findOne({
                user: player
            });
            var cursorMine = mine.findOne({
                user: player
            });
            var cursorBattlefield = battlefield.findOne({
                user: player
            });
            //Check mine
            var amountOwnSlots = cursorPlayerData.mine.ownSlots;
            var trueCount = 0;
            var falseCount = 0;
            var maxCount = 0;
            //Iterate OwnSlots
            for (var i = 0; i < amountOwnSlots; i++) {
                var matterId = cursorMine['owns' + i].input;
                if (matterId > 0) {
                    maxCount++;
                    trueCount++;
                    //check all circumstances
                    var checkResult = checkScroungeMine(i, myName, player);
                    //cannot be "==true": has to be !=false
                    if (checkResult != false) falseCount++;
                }
            }
            obj0['mineImpossible'] = falseCount;
            obj0['mineMax'] = maxCount;
            if (trueCount - falseCount > 0 || maxCount == 0) {
                obj0['mineResult'] = false;
            } else {
                obj0['mineResult'] = true;
            }

            //Check battlefield
            var amountOwnSlots = cursorPlayerData.battlefield.ownSlots;
            var trueCount = 0;
            var falseCount = 0;
            var maxCount = 0;
            //Iterate OwnSlots
            for (var i = 0; i < amountOwnSlots; i++) {
                var fightId = cursorBattlefield['owns' + i].input;
                if (fightId > 0) {
                    maxCount++;
                    trueCount++;
                    //check all circumstances
                    var checkResult = checkScroungeBattlefield(i, myName, player);
                    //cannot be "==true": has to be !=false
                    if (checkResult != false) falseCount++;
                }
            }
            obj0['battlefieldImpossible'] = falseCount;
            obj0['battlefieldMax'] = maxCount;
            if (trueCount - falseCount > 0 || maxCount == 0) {
                obj0['battlefieldResult'] = false;
            } else {
                obj0['battlefieldResult'] = true;
            }
            // update session variab
            Session.set("worldMapPreview", obj0);
        },

        // 'mouseout .worldMapScroungePreview': function(e, t) {
        //     var element = $(e.currentTarget).attr("id");
        //     $('#' + element).css({"visibility" : "hidden"});
        // },

        'click .worldMapNavigators': function(e, t) {
            //get max map size
            var maxX = worldMapFields.find({}, {
                fields: {
                    x: 1
                },
                sort: {
                    x: -1
                }
            }).fetch()[0].x;
            var maxY = worldMapFields.find({}, {
                fields: {
                    y: 1
                },
                sort: {
                    y: -1
                }
            }).fetch()[0].y;
            switch (e.currentTarget.id) {
                case "worldMapGoUp":
                    var yValue = worldMapArray[0].columns[0].y + 1;
                    if (yValue > maxY) yValue = 0
                    initWorldMapArray(worldMapArray[0].columns[0].x, yValue, maxX, maxY);
                    break;
                case "worldMapGoDown":
                    var yValue = worldMapArray[0].columns[0].y - 1;
                    if (yValue < 0) yValue = maxY
                    initWorldMapArray(worldMapArray[0].columns[0].x, yValue, maxX, maxY);
                    break;
                case "worldMapGoRight":
                    var xValue = worldMapArray[0].columns[0].x + 1;
                    if (xValue > maxX) xValue = 0
                    initWorldMapArray(xValue, worldMapArray[0].columns[0].y, maxX, maxY);
                    break;
                case "worldMapGoLeft":
                    var xValue = worldMapArray[0].columns[0].x - 1;
                    if (xValue < 0) xValue = maxX
                    initWorldMapArray(xValue, worldMapArray[0].columns[0].y, maxX, maxY);
                    break;
                default:
                    console.log('default case: worldMapNavigators');
                    break;
            }
            Session.set("worldMapArray", worldMapArray);
        },

        'click .worldMapScroungePreview': function(e, t) {
            if (e.currentTarget.id != '') {
                var current = (e.currentTarget.id).substring(7);;
                Meteor.users.update({
                    _id: Meteor.userId()
                }, {
                    $set: {
                        cu: current
                    }
                });
                renderActiveMiddle();
            }
        }

    });


    var time = 1200; //Animationszeit in ms
    var current_category = 1; //Start Kategorie
    var max_cat = 6; //Anzahl Kategorien
    var interval;
    var ready_check;
    var size;
    var slots_count = 10;
    var handle_check = false;
    var hover_check = false;
    var range_slider_width;
    var stop_bool = false;

    if ($(window).width() <= 1024) {
        // console.log("1024");
        ready_check = 1;
    }
    if ($(window).width() <= 1280 && $(window).width() >= 1024) {
        // console.log("1280");
        ready_check = 2;
    }
    if ($(window).width() >= 1280) {
        // console.log("1920");
        ready_check = 3;
    }

    function slide(element) //abfrage welches ID gehovert wurde und umsetzung des richtigen slides
    {
        switch (element.attr("id")) {
            case 'category_left':
                // slide_category("left", 800, 4);
                break;
            case 'category_right':
                // slide_category("right", 800, 4);
                break;
            case 'base_up':
                slide_start("back", "vertical", 100, 400, "#base_area_content");
                break;
            case 'base_down':
                slide_start("forth", "vertical", 100, 400, "#base_area_content");
                break;
            case 'scrounge_up':
                slide_start("back", "vertical", 100, 400, "#scroungeAreaContent");
                break;
            case 'scrounge_down':
                slide_start("forth", "vertical", 100, 400, "#scroungeAreaContent");
                break;
            case 'slot_items_left':
                slide_start("back", "horizontal", 100, 400, element.next().children());
                break;
            case 'slot_items_right':
                slide_start("forth", "horizontal", 100, 400, element.prev().children());
                break;
            case 'slot_colors_left':
                break;
            case 'slot_colors_right':
                break;
            case 'matter_left':
                slide_start("back", "horizontal", 100, 400, "#matter_content");
                break;
            case 'matter_right':
                slide_start("forth", "horizontal", 100, 400, "#matter_content");
                break;
            case 'own_up':
                slide_start("back", "vertical", 100, 400, "#inventory_own");
                break;
            case 'own_down':
                slide_start("forth", "vertical", 100, 400, "#inventory_own");
                break;
            case 'stolen_up':
                slide_start("back", "vertical", 100, 400, "#inventory_stolen");
                break;
            case 'stolen_down':
                slide_start("forth", "vertical", 100, 400, "#inventory_stolen");
                break;
            default:
                console.log("Slide für diesen Hover nicht definiert !");
                break;
        }
    }

    function hidden_menu_icon_check(direction) {
        var width_child = parseFloat($("#categories_wrapper").children().eq(0).width()) + 10;
        var margin_left_middle = -1 * (parseFloat($("#categories_wrapper").width()) - width_child) / 2;
        var current_margin_left = parseFloat($("#categories_wrapper").css("margin-left"));

        eval("animation_obj_middle = { 'margin-left' : '" + margin_left_middle + "px'}");
        eval("animation_obj_back = { 'margin-left' : '" + (margin_left_middle - width_child) + "px'}");
        eval("animation_obj_forth = { 'margin-left' : '" + (margin_left_middle + width_child) + "px'}");

        if (current_margin_left < margin_left_middle && direction === "right") {
            $("#categories_wrapper").children().eq(0).remove();
            var buffer = $("#categories_wrapper").children().eq(1).clone();
            $("#categories_wrapper").append(buffer);
            $("#categories_wrapper").css(
                animation_obj_middle
            );
        }
        if (current_margin_left >= margin_left_middle && direction === "left") {
            $("#categories_wrapper").children().eq(-1).remove();
            var buffer = $("#categories_wrapper").children().eq(-2).clone();
            $("#categories_wrapper").prepend(buffer);
            $("#categories_wrapper").css(
                animation_obj_back
            );
        }

    }

    function switch_category(clicked_obj, speed) {
        var clicked_category = parseInt($(clicked_obj).attr("class").substr((9 + $(clicked_obj).attr("class").search("category_")), 1));
        var category_offset_left = (Math.abs(clicked_category - 6) + current_category) % 6;
        var category_offset_right = (clicked_category + Math.abs(current_category - 6)) % 6;
        var direction;
        var category_offset = 0;
        var animation_type = "linear";

        if (!(category_offset_left == 0 && category_offset_right == 0)) {

            if (category_offset_left > category_offset_right) {
                direction = "right";
                category_offset = category_offset_right;
            } else if (category_offset_left < category_offset_right) {
                direction = "left";
                category_offset = category_offset_left;
            } else if (category_offset_left == category_offset_right) {
                if ($(".category_" + clicked_category)[0] == $(clicked_obj)[0]) {
                    direction = "left";
                    category_offset = category_offset_left;
                } else if ($(".category_" + clicked_category)[1] == $(clicked_obj)[0]) {
                    direction = "left";
                    category_offset = category_offset_left;
                }
            }

            if ($("#categories_wrapper").filter(':not(:animated)').length == 1) {
                hidden_menu_icon_check(direction);

                var margin_left = parseFloat($("#categories_wrapper").css("margin-left"));
                var width_child = parseFloat($("#categories_wrapper").children().eq(0).width()) + 10;

                if (direction === "left") {
                    var animation_obj_start = ({
                        'margin-left': (margin_left + width_child)
                    });
                } else if (direction === "right") {
                    var animation_obj_start = ({
                        'margin-left': (margin_left - width_child)
                    });
                }
                var animation_obj_stop = ({
                    'margin-left': margin_left
                });

                update_current_category(direction, category_offset);

                for (var x = 0; x < category_offset; x++) {
                    if (x == category_offset - 1) {
                        animation_type = "easeOutCubic";
                        speed = speed * 4;
                    }
                    $("#categories_wrapper").animate(animation_obj_start, speed, animation_type, function() {
                        if (direction === "left") {
                            $("#categories_wrapper").children().eq(-1).remove();
                            $("#categories_wrapper").prepend($("#categories_wrapper").children().eq(-2).clone());
                            $("#categories_wrapper").css(
                                animation_obj_stop
                            );
                        } else if (direction === "right") {
                            $("#categories_wrapper").children().eq(0).remove();
                            $("#categories_wrapper").append($("#categories_wrapper").children().eq(1).clone());
                            $("#categories_wrapper").css(
                                animation_obj_stop
                            );
                        }
                    });
                }
            }
        }
    }

    function slide_category(direction, speed, delay_factor) {

        if ($("#categories_wrapper").filter(':not(:animated)').length == 1) {
            stop_bool = false;
            hidden_menu_icon_check(direction);

            var margin_left = parseFloat($("#categories_wrapper").css("margin-left"));
            var width_child = parseFloat($("#categories_wrapper").children().eq(0).width()) + 10;

            if (direction === "left") {
                var animation_obj_start = ({
                    'margin-left': (margin_left + width_child)
                });
            } else if (direction === "right") {
                var animation_obj_start = ({
                    'margin-left': (margin_left - width_child)
                });
            }
            var animation_obj_stop = ({
                'margin-left': margin_left
            });

            var action = function() {
                $("#categories_wrapper").animate(animation_obj_start, speed, "linear", function() {
                    if (direction === "left") {
                        $("#categories_wrapper").children().eq(-1).remove();
                        $("#categories_wrapper").prepend($("#categories_wrapper").children().eq(-2).clone());
                        $("#categories_wrapper").css(
                            animation_obj_stop
                        );
                    } else if (direction === "right") {
                        $("#categories_wrapper").children().eq(0).remove();
                        $("#categories_wrapper").append($("#categories_wrapper").children().eq(1).clone());
                        $("#categories_wrapper").css(
                            animation_obj_stop
                        );
                    }
                    if (stop_bool == true) {
                        $("#categories_wrapper").stop(true);
                        stop_bool = false;
                    }
                    update_current_category(direction, 1);
                });
            }
            //Start des Intervalls
            interval = setInterval(action, speed / delay_factor);
        }

    }

    function slide_start(direction, orientation, pixel, speed, element1, element2) {
        //console.log("direction: " + direction + " pixel: " + pixel + " speed: " + speed + " element1: " + element1 + " element2: " + element2);
        var px;
        var animation_obj = {};
        var css_direction;
        var current_position;
        var content_end;
        var pos_neg;
        var parent_end;

        if (direction === "back") {
            transition = "+=" + pixel + "px";
            pos_neg = +1;
        } else if (direction === "forth") {
            transition = "-=" + pixel + "px";
            pos_neg = -1;
        }

        if (orientation === "horizontal") {
            css_direction = "left";
            current_position = $(element1).position().left;
            content_end = $(element1).width();
            parent_end = $(element1).parent().width();
        } else if (orientation === "vertical") {
            css_direction = "top";
            current_position = $(element1).position().top;
            content_end = $(element1).height();
            parent_end = $(element1).parent().height();

        }



        eval("animation_obj = {" + css_direction + ": '" + transition + "'}");

        if ($(element1).filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
        {
            //Rekursiver Intervall (unendlich)
            var action = function() {
                //Animation im laufenden Intervall
                if (current_position < 0 && direction === "back" || current_position + content_end > parent_end && direction === "forth") {

                    if (parent_end - content_end > current_position + (pos_neg * pixel) && direction === "forth") {
                        eval("animation_obj = {" + css_direction + ": '" + (parent_end - content_end) + "px'}");
                        $(element1).animate(animation_obj, speed, "swing");
                    } else if (current_position + (pos_neg * pixel) > 0 && direction === "back") {
                        eval("animation_obj = {" + css_direction + ": '0px'}");
                        $(element1).animate(animation_obj, speed, "swing");
                    } else {
                        $(element1).animate(animation_obj, speed, "linear");
                    }
                    current_position = current_position + (pos_neg * pixel);
                }
            };
            //Start des Intervalls
            interval = setInterval(action, speed);
        }
    }

    function init_draggable() {
        $(".draggable").draggable({
            addClasses: false,
            helper: 'clone',
            revert: 'invalid',
            appendTo: 'body',
            containment: "window",
            start: function(event, ui) {
                $(this).hide();
                $("#scrounge_item_slot_" + $(this).attr("class").substr(49)).addClass("proper_droppable_slot");
            },
            stop: function() {
                $(this).show();
                $("#scrounge_item_slot_" + $(this).attr("class").substr(49)).removeClass("proper_droppable_slot");
            }
        });
    }

    function init_droppable() {
        $(".droppable").droppable({
            addClasses: false,
            hoverClass: "droppable_slot_hover",
            drop: function(event, ui) {
                if ($(this).html().trim().length == 0) {
                    $(ui.draggable).detach().appendTo($(this));
                } else if ($(this).html().trim().length > 0) {
                    var buffer_parent = $(ui.draggable).parent();
                    $(ui.draggable).detach();
                    $(this).children().detach().appendTo(buffer_parent);
                    $(ui.draggable).appendTo($(this));
                }
            },
        });
        Session.set("init_bool", false);
    }

    function character_view_droppable() {
        for (var x = 1; x <= 6; x++) {
            item_type = "#item_type_" + x;
            $("#scrounge_item_slot_" + x).droppable({
                accept: ".item_type_" + x,
                addClasses: false,
                hoverClass: "proper_droppable_slot_hover",
                drop: function(event, ui) {
                    if ($(this).html().trim().length == 0) {
                        $(ui.draggable).detach().appendTo($(this));
                    } else if ($(this).html().trim().length > 0) {
                        var buffer_parent = $(ui.draggable).parent();
                        $(ui.draggable).detach();
                        $(this).children().detach().appendTo(buffer_parent);
                        $(ui.draggable).appendTo($(this));
                    }
                }
            });
        }
    }
    // Funktion um die Tooltips der Range Slider anzuzeigen und auszublenden

    function fade_In_and_Out(element, slot, state) {

        //console.log('element: ' + element + ' slot: ' + slot + ' state: ' + state);

        // Solange der User den Handle vom Range Slider festhält soll der Tooltip anbleiben
        // zusätzlich soll er anbleiben solange man mit der Maus über dem Range Slider ist
        if (element === "handle" && state === "out") {
            //console.log("handle.out");
            handle_check = false;
        } else if (element === "handle" && state === "in") {
            //console.log("handle.in");
            handle_check = true;
        }
        if (element === "tooltip" && state === "out") {
            //console.log("hover.out");
            hover_check = false;
        } else if (element === "tooltip" && state === "in") {
            //console.log("hover.in");
            hover_check = true;
        }

        // Tooltip geht an wenn entweder der Handle verschoben wird oder man mit der Maus über den Range Slider hovert
        // Tooltip geht nur aus wenn Maus nicht mehr auf dem Range Slider und kein Handle gezogen wird
        if (handle_check === true || hover_check === true) {
            $("#tooltip_left_handle_" + slot).filter(':not(:animated)').fadeIn('fast');
            $("#tooltip_right_handle_" + slot).filter(':not(:animated)').fadeIn('fast');
        } else if (handle_check === false && hover_check === false) {
            $("#tooltip_left_handle_" + slot).fadeOut('fast');
            $("#tooltip_right_handle_" + slot).fadeOut('fast');
        }

    }

    function range_slider(slot, min_ctrl, max_ctrl, lower_ctrl, higher_ctrl) {
        //console.log('slot: ' + slot + ' min_ctrl: ' + min_ctrl + ' max_ctrl: ' + max_ctrl + ' lower_ctrl: ' + lower_ctrl + ' higher_ctrl: ' + higher_ctrl);
        if (!$("#range_slider_" + slot).data('uiSlider') || slot === "Buy_Menu") { // Wenn der Slider noch nicht Initialisiert ist oder das BuyMenu aufgerufen wird -> True
            var left_handle;
            var right_handle;
            var current_handle;
            var disable_boolean = true;

            /*            $("#range_slider_" + slot).width($("#range_slider_" + slot).parent().width());*/

            tooltip_adjustment(slot, min_ctrl, max_ctrl, lower_ctrl, higher_ctrl, "left");
            $('.tooltip').hide();

            if (slot === "Buy_Menu") {
                disable_boolean = false;
            }

            $("#range_slider_" + slot).slider({
                range: true,
                step: 0.01,
                min: min_ctrl,
                max: max_ctrl,
                values: [lower_ctrl, higher_ctrl],
                disabled: disable_boolean,

                start: function(event, ui) {
                    left_handle = ui.values[0];
                    right_handle = ui.values[1];
                    //Initialisierung der Tooltip Fenster an den stellen der Handle
                    tooltip_adjustment(slot, min_ctrl, max_ctrl, ui.values[0], ui.values[1], "last");
                    fade_In_and_Out("handle", slot, "in");
                },

                slide: function(event, ui) {
                    if (left_handle != ui.values[0])
                        current_handle = "left";
                    else if (right_handle != ui.values[1])
                        current_handle = "right";
                    if (left_handle === ui.values[0] && right_handle === ui.values[1])
                        current_handle = "last";
                    var slide_check = tooltip_adjustment(slot, min_ctrl, max_ctrl, ui.values[0], ui.values[1], current_handle);
                    return slide_check;
                },
                stop: function(event, ui) {
                    fade_In_and_Out("handle", slot, "out");
                }
            });
        }
    };

    function tooltip_adjustment(slot, min_ctrl, max_ctrl, lower_ctrl, higher_ctrl, handle) {
        var ctrl_range = max_ctrl - min_ctrl,
            slider_threshold = ctrl_range * 0.1,
            lower_pixel = ((lower_ctrl - min_ctrl) * 100 / ctrl_range) * $("#range_slider_" + slot).width() / 100,
            higher_pixel = ((higher_ctrl - min_ctrl) * 100 / ctrl_range) * $("#range_slider_" + slot).width() / 100,
            last,
            range_end_left,
            range_end_right;

        if (handle === "last")
            handle = last;

        if (higher_ctrl - lower_ctrl >= slider_threshold) {

            if (lower_pixel < 27)
                lower_pixel = 27;

            if (higher_pixel > $("#range_slider_" + slot).width() - 27)
                higher_pixel = $("#range_slider_" + slot).width() - 27;

            if (handle === "left") {
                last = handle;
                if (lower_pixel > higher_pixel - 54)
                    lower_pixel = higher_pixel - 54;
            }
            if (handle === "right") {
                last = handle;
                if (higher_pixel < lower_pixel + 54)
                    higher_pixel = lower_pixel + 54;
            }

            $("#tooltip_left_handle_" + slot).css('left', lower_pixel).text(lower_ctrl);
            $("#tooltip_right_handle_" + slot).css('left', higher_pixel).text(higher_ctrl);
            return true;
        } else if (higher_ctrl - lower_ctrl < slider_threshold) {
            return false;
        }
    }

    function slide_stop() {
        stop_bool = true;
        clearInterval(interval);
    }

    var category_names = ["mine", "laboratory", "battlefield", "workshop", "thievery", "smelter"]

        function update_current_category(direction, category_offset) {
            for (var x = 0; x < category_offset; x++) {
                if (direction == "left") {
                    current_category--;
                } else if (direction == "right") {
                    current_category++;
                }

                if (current_category == 0 && direction == "left") {
                    current_category = max_cat;
                } else if (current_category == (max_cat + 1) && direction == "right") {
                    current_category = 1;
                }
            }

            if (current_category == 1 || current_category == 3) {
                Meteor.users.update({
                    _id: Meteor.userId()
                }, {
                    $set: {
                        menu: category_names[current_category - 1]
                    }
                });
            }
            //console.log('updated: ' + current_category + "category: " + category_names[current_category - 1]);
        }

        function size_check() {
            switch (ready_check) {
                case 3:
                    var pos = 256;
                    var pos_plus = pos + 10;
                    break;
                case 2:
                    var pos = 170;
                    var pos_plus = pos + 7;
                    break;
                case 1:
                    var pos = 136;
                    var pos_plus = pos + 6;
                    break;
                default:
                    console.log("failed to check size !(default)");
                    break;
            }
            var pos_reset = pos_plus * max_cat;

            return {
                p: pos,
                pp: pos_plus,
                pr: pos_reset
            };
        }

        function repositioning(ready_check) //Bei Media Query Sprung neu Posi der Leiste [Parameter : Aktueller Media Querie]
        {
            // size = size_check();
            // var pos = size.p;
            // var pos_r = size.pr;
            // var pos_p = size.pp;

            // var cur_pos_right = (c * pos_p) - pos_p;
            // var cur_pos_left = cur_pos_right - (pos_r);
            // $("#k1").css({
            //     left: cur_pos_left
            // });
            // $("#k2").css({
            //     left: cur_pos_right
            // });
        }

    $(window).resize(function() {
        if ($(window).width() <= 1024 && ready_check !== 1) {
            //console.log("1024");
            ready_check = 1;
            repositioning(ready_check);
        }
        if ($(window).width() <= 1280 && $(window).width() >= 1024 && ready_check != 2) {
            //console.log("1280");
            ready_check = 2;
            repositioning(ready_check);
        }
        if ($(window).width() >= 1280 && ready_check != 3) {
            //console.log("1920");
            ready_check = 3;
            repositioning(ready_check);
        }
        if ($("#range_slider_0").length > 0) { // Damit der Tooltip des Range Sliders beim verändern der Größe mitgeht.
            for (var x = 0; x < 6; x++) {
                if ($("#range_slider_" + x).length > 0) {
                    // Syntax Parameter : tooltip_adjustment(slot, min_ctrl, max_ctrl, lower_ctrl, higher_ctrl, handle)
                    tooltip_adjustment(
                        x,
                        $("#range_slider_" + x).slider("option", "min"),
                        $("#range_slider_" + x).slider("option", "max"),
                        $("#range_slider_" + x).slider("option", "values")[0],
                        $("#range_slider_" + x).slider("option", "values")[1],
                        "left");
                }
            }
        }
    });

    //Changes array to unique array with distinct values

    function distinct(array) {
        var uniqueArray = array.filter(function(elem, pos) {
            return array.indexOf(elem) == pos;
        })
        return uniqueArray
    }

    function showInfoTextAnimation(text, color) {

        var textAnimation = document.createElement("div");
        textAnimation.innerHTML = text;
        textAnimation.id = "textAnimation";
        if (document.getElementById("mitte")) document.getElementById("mitte").appendChild(textAnimation);
        textAnimation.style.color = color;
        setTimeout(function() {
            if (document.getElementById("textAnimation")) document.getElementById("mitte").removeChild(document.getElementById("textAnimation"))
        }, 2000);

    }

    function infoLog(text, color) {

        var log = document.createElement("div");
        var previousLogID;
        log.innerHTML = text;
        log.className = "logs";
        log.style.color = color;
        $("#infoLog").prepend(log);

    }


    //returns true if locked

    function checkScroungeMine(slotId, myName, currentUser) {
        //CHECK IF YOU ARE TRYING TO SCROUNGE YOURSELF OR TARGET IS ALLRDY SCROUNGED
        if (currentUser == myName) {
            return 'You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O';
        }
        var cursorMyPlayerData = playerData.findOne({
            user: myName
        }, {
            fields: {
                mine: 1
            }
        });
        var amountScrSlots = cursorMyPlayerData.mine.scrSlots;
        var cursorMineScrounger = mine.findOne({
            user: myName
        });
        for (i = 0; i < amountScrSlots; i++) {
            if (cursorMineScrounger['scrs' + i].victim == currentUser) {
                return 'You cannot scrounge here: You already scrounge this user!';
            }
        }
        //CHECK FREE SCRSLOTS OF SCROUNGER DATA
        var resultScrounger = -1;
        for (i = 0; i < amountScrSlots; i++) {
            if (cursorMineScrounger['scrs' + i].victim == "") {
                resultScrounger = i;
                break;
            }
        }
        if (resultScrounger == -1) {
            return 'You cannot scrounge here: Your Scrounge slots are all in use!';
        }
        //CHECK FREE SUPSLOTS OF CURRENT USER DATA                
        var obj0 = {};
        obj0['owns' + slotId] = 1;
        var cursorMineOwner = mine.findOne({
            user: currentUser
        }, {
            fields: obj0
        });
        //Get free SupSlots index
        var amountSupSlots = playerData.findOne({
            user: currentUser
        }, {
            fields: {
                mine: 1
            }
        }).mine.supSlots;
        var resultOwner = -1;
        for (i = 0; i < amountSupSlots; i++) {
            if (cursorMineOwner['owns' + slotId]['sup' + i] == "") {
                resultOwner = i;
                break;
            }
        }
        //LAST CHECK: RANGE SLIDER
        if (!(cursorMineOwner['owns' + slotId].control.min <= cursorMyPlayerData.mine.scrItem.benefit && cursorMyPlayerData.mine.scrItem.benefit <= cursorMineOwner['owns' + slotId].control.max)) {
            return 'You cannot scrounge here: You do not have the right miningrate!';
        }
        //SupSlot with id result is free and correct: update it ?
        if (resultOwner == -1) {
            return 'You cannot scrounge here: The owners support slots are all full!';
        }
        return false;
    }

    function checkScroungeBattlefield(slotId, myName, currentUser) {
        //CHECK IF YOU ARE TRYING TO SCROUNGE YOURSELF OR TARGET IS ALLRDY SCROUNGED
        if (currentUser == myName) {
            return 'You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O';
        }
        var cursorMyPlayerData = playerData.findOne({
            user: myName
        }, {
            fields: {
                battlefield: 1
            }
        });
        var amountScrSlots = cursorMyPlayerData.battlefield.scrSlots;
        var cursorBattlefieldScrounger = battlefield.findOne({
            user: myName
        });
        for (i = 0; i < amountScrSlots; i++) {
            if (cursorBattlefieldScrounger['scrs' + i].victim == currentUser) {
                return 'You cannot scrounge here: You already scrounge this user!';
            }
        }
        //CHECK FREE SCRSLOTS OF SCROUNGER DATA
        var resultScrounger = -1;
        for (i = 0; i < amountScrSlots; i++) {
            if (cursorBattlefieldScrounger['scrs' + i].victim == "") {
                resultScrounger = i;
                break;
            }
        }
        if (resultScrounger == -1) {
            return 'You cannot scrounge here: Your Scrounge slots are all in use!';
        }
        //CHECK FREE SUPSLOTS OF CURRENT USER DATA                
        var obj0 = {};
        obj0['owns' + slotId] = 1;
        var cursorBattlefieldOwner = battlefield.findOne({
            user: currentUser
        }, {
            fields: obj0
        });
        //Get free SupSlots index
        var amountSupSlots = playerData.findOne({
            user: currentUser
        }, {
            fields: {
                battlefield: 1
            }
        }).battlefield.supSlots;
        var resultOwner = -1;
        for (i = 0; i < amountSupSlots; i++) {
            if (cursorBattlefieldOwner['owns' + slotId]['sup' + i] == "") {
                resultOwner = i;
                break;
            }
        }
        //LAST CHECK: RANGE SLIDER
        if (!(cursorBattlefieldOwner['owns' + slotId].control.min <= cursorMyPlayerData.battlefield.scrItem.benefit && cursorMyPlayerData.battlefield.scrItem.benefit <= cursorBattlefieldOwner['owns' + slotId].control.max)) {
            return 'You cannot scrounge here: You do not have the right epicness!';
        }
        return false;
    }

    function renderActiveMiddle() {
        var self = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                menu: 1,
                cu: 1,
                username: 1
            }
        });
        var cu = self.cu;
        var menu = self.menu;
        //in your own menu? base:scrounge
        if (cu == self.username) {
            Router.current().render(menu + 'Base', {
                to: 'middle'
            });
            $('#scrounge').css({
                backgroundPosition: "0px -306px"
            });
        } else {
            Router.current().render(menu + 'Scrounge', {
                to: 'middle'
            });
            $('#scrounge').css({
                backgroundPosition: "0px 0px"
            });
        }
    }

    function switchToWorldMap() {
        Router.current().render('worldMap', {
            to: 'middle'
        });
        //if worldMapArray not initilazed: do it - otherwise use last active orientation
        if (worldMapArray.length == 0) {
            var currentUser = Meteor.users.findOne({
                _id: Meteor.userId()
            }, {
                fields: {
                    cu: 1
                }
            }).cu;
            var cursorUser = Meteor.users.findOne({
                username: currentUser
            }, {
                fields: {
                    x: 1,
                    y: 1
                }
            });
            //get max map size
            var maxX = worldMapFields.find({}, {
                fields: {
                    x: 1
                },
                sort: {
                    x: -1
                }
            }).fetch()[0].x;
            var maxY = worldMapFields.find({}, {
                fields: {
                    y: 1
                },
                sort: {
                    y: -1
                }
            }).fetch()[0].y;
            initWorldMapArray(cursorUser.x, cursorUser.y, maxX, maxY);
        }
    }

    function navigateWorldMap(direction) {

        var top = parseInt($('#currentMapView').css("margin-top"));
        var right = parseInt($('#currentMapView').css("margin-right"));

        switch (direction) {

            case 'worldMapGoUp':

                $('#currentMapView').filter(':not(:animated)').animate({
                    "margin-top": (top + 300) + "px"
                }, 250);

                break;

            case 'worldMapGoDown':

                $('#currentMapView').filter(':not(:animated)').animate({
                    "margin-top": (top - 300) + "px"
                }, 250);

                break;

            case 'worldMapGoRight':

                $('#currentMapView').filter(':not(:animated)').animate({
                    "margin-right": (right + 300) + "px"
                }, 250);

                break;

            case 'worldMapGoLeft':

                $('#currentMapView').filter(':not(:animated)').animate({
                    "margin-right": (right - 300) + "px"
                }, 250);

                break;

            default:
                //console.log("Slide für diesen Hover nicht definiert !");
                break;

        }

    }

    var deps_count = 0;

    Deps.autorun(function() {
        var init = Session.get("init");
        // console.log("count: " + deps_count);
        if (deps_count == 1) {
            init_draggable();
            init_droppable();
        }

        var middle = Session.get("middle");
        if (!middle) {
            middle = "";
        } else if (middle.length > 2 && middle !== "characterView") {

            var amountSlots;
            var amountScroungeSlots;
            var input;
            var minControl;
            var maxControl;
            var lowerControl;
            var higherControl;

            switch (middle) {
                case "mineBase":
                    var name = Meteor.users.findOne({
                        _id: Meteor.userId()
                    }).username;
                    var cursorPlayerData = playerData.findOne({
                        user: name
                    });
                    var input = mine.findOne({
                        user: name
                    });
                    amountSlots = cursorPlayerData.mine.ownSlots;
                    amountScroungeSlots = cursorPlayerData.mine.srcSlots;
                    minControl = cursorPlayerData.mine.minControl;
                    maxControl = cursorPlayerData.mine.maxControl;
                    break;
                case "mineScrounge":
                    var name = Meteor.users.findOne({
                        _id: Meteor.userId()
                    }).cu;
                    var cursorPlayerData = playerData.findOne({
                        user: name
                    });
                    var input = mine.findOne({
                        user: name
                    });
                    amountSlots = cursorPlayerData.mine.ownSlots;
                    amountScroungeSlots = 0;
                    minControl = cursorPlayerData.mine.minControl;
                    maxControl = cursorPlayerData.mine.maxControl;
                    break;
                case "battlefieldBase":
                    var name = Meteor.users.findOne({
                        _id: Meteor.userId()
                    }).username;
                    var cursorPlayerData = playerData.findOne({
                        user: name
                    });
                    var input = battlefield.findOne({
                        user: name
                    });
                    amountSlots = cursorPlayerData.battlefield.ownSlots;
                    amountScroungeSlots = cursorPlayerData.battlefield.srcSlots;
                    minControl = cursorPlayerData.battlefield.minControl;
                    maxControl = cursorPlayerData.battlefield.maxControl;
                    break;
                case "battlefieldScrounge":
                    var name = Meteor.users.findOne({
                        _id: Meteor.userId()
                    }).cu;
                    var cursorPlayerData = playerData.findOne({
                        user: name
                    });
                    var input = battlefield.findOne({
                        user: name
                    });
                    amountSlots = cursorPlayerData.battlefield.ownSlots;
                    amountScroungeSlots = 0;
                    minControl = cursorPlayerData.battlefield.minControl;
                    maxControl = cursorPlayerData.battlefield.maxControl;
                    break;
                default:
                    console.log('default');
                    break;
            }

            for (var i = 0; i < amountSlots; i++) {
                if (input['owns' + i].input > 0) {
                    range_slider(i, minControl, maxControl, input['owns' + i].control.min, input['owns' + i].control.max);
                }
            }
            // for (var y = 0; y < amountScroungeSlots; y++) {
            //     if (input['owns' + y].input > 0) {
            //         range_slider(y, minControl, maxControl, input['owns' + y].control.min, input['owns' + y].control.max);
            //     }
            // }
            Session.set("middle", "");

        } else if (middle === "characterView") {
            character_view_droppable();
            Session.set("middle", "");
        }

        deps_count++;
    });

    var worldMapArray = new Array();

    function initWorldMapArray(orientationX, orientationY, maxX, maxY) {
        //reset array
        worldMapArray.length = 0;
        //go all rows
        for (var i = 0; i < mapRows; i++) {
            worldMapArray.push(createRowObject(orientationX, orientationY, maxX, maxY, i));
        }
        Session.set("worldMapArray", worldMapArray);
    }

    function createRowObject(orientationX, orientationY, maxX, maxY, rowNo) {
        var row = {};
        var column = new Array();
        var myName = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                username: 1
            }
        }).username;
        //go all columns
        for (var j = 0; j < mapColumns; j++) {
            //if coordinates are bigger than map max: get new data with modulo for infinite map size
            var user = worldMapFields.findOne({
                x: (orientationX + j) % (maxX + 1),
                y: (orientationY + rowNo) % (maxY + 1)
            }, {
                fields: {
                    user: 1
                }
            }).user;
            var infoMemory = {};
            //without user push empty object
            if (user != '') {
                var cursorPlayerData = playerData.findOne({
                    user: user
                }, {
                    fields: {
                        level: 1,
                        backgroundId: 1
                    }
                });
                var playerLevel = cursorPlayerData.level;
                var backgroundNumber = cursorPlayerData.backgroundId;
                infoMemory['playerLevel'] = playerLevel;
                infoMemory['playerImage'] = "worldMapPlayerImage";
                infoMemory['playerImageId'] = "01";
                if (myName == user) infoMemory['playerImageId'] = "00";
                infoMemory['playerName'] = user;
                infoMemory['backgroundNumber'] = backgroundNumber;
            } else  {
                infoMemory['backgroundNumber'] = 0;
            }
            infoMemory['x'] = (orientationX + j) % (maxX + 1);
            infoMemory['y'] = (orientationY + rowNo) % (maxY + 1);
            infoMemory['left'] = j * 300;
            infoMemory['bottom'] = rowNo * 250;
            column.push(infoMemory);
        }
        row['columns'] = column;
        return row;
    }

    //TO-DO: Datenbankanfrage optimieren + debuggen
    // function updateWorldMapArray(direction) {
    //     //get max map size
    //     var maxX = worldMapFields.find({}, {
    //         fields: {
    //             x: 1
    //         },
    //         sort: {
    //             x: -1
    //         }
    //     }).fetch()[0].x;
    //     var maxY = worldMapFields.find({}, {
    //         fields: {
    //             y: 1
    //         },
    //         sort: {
    //             y: -1
    //         }
    //     }).fetch()[0].y;
    //     if (direction == "worldMapGoUp" || direction == "worldMapGoDown") {
    //         var result = getNewRow(direction, maxX, maxY);
    //     } else {
    //      //To-DO: getNewColumn implementieren
    //     }
    //     return result;
    // }

    // function getNewRow(direction, maxX, maxY) {
    //     var newArray = new Array();
    //     if (direction == "worldMapGoUp") {
    //         //slide useable data
    //         for (var i = 0; i < worldMapArray.length - 1; i++) {
    //             newArray[i] = worldMapArray[i + 1];
    //         }
    //         //create the NEW row
    //         newArray[mapRows - 1] = createRowObject(worldMapArray[0].columns[0].x, worldMapArray[0].columns[0].y + 1, maxX, maxY, mapRows - 1, mapColumns);
    //     } else {
    //         //slide useable data
    //         for (var i = worldMapArray.length - 1; i > 0; i--) {
    //             newArray[i] = worldMapArray[i - 1];
    //         }
    //         //create the NEW row
    //         newArray[0] = createRowObject(worldMapArray[0].columns[0].x, worldMapArray[0].columns[0].y - 1, maxX, maxY, mapRows - 1, mapColumns);
    //     }
    //     return newArray;
    // }

    // function getNewColumn(direction, maxX, maxY) {
    //     too complex
    // }

    //Deps.Autorun
    Deps.autorun(function() {
        if (!Meteor.user()) {
            //not logged in yet
            // console.log("DEPS.AUTORUN: not logged in");
        } else {
            var self = Meteor.users.findOne({
                _id: Meteor.userId()
            }, {
                fields: {
                    menu: 1,
                    cu: 1,
                    username: 1
                }
            });
            var menu = self.menu;
            var cu = self.cu;
            if (cu && menu) {
                Meteor.subscribe(menu, cu, function(rdy) {
                    // console.log("DEPS.AUTORUN: Sub: " + menu + ", " + cu + " - " + rdy);
                });
            } else {
                // console.log("DEPS.AUTORUN: cu or menu undefined");
            }
        }
    });

    ///////////////////
    //// DEBUGGING ////
    ///////////////////

    function logRenders() {
        _.each(Template, function(template, name) {
            var oldRender = template.rendered;
            var counter = 0;

            template.rendered = function() {
                console.log(name, "render count: ", ++counter);
                oldRender && oldRender.apply(this, arguments);
            };
        });
    }
}

/*  function hoverScroungeBase() {
    var pos = button.style.backgroundPosition;
    alert(pos);*/
