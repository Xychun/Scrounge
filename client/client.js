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
    mapRows = 4;
    mapColumns = 6;

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
                timers[i].miliseconds = timers[i].miliseconds + (timers[i].prefix * 1000);
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
    Template.mineScrounge.current = function() {
        return Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                cu: 1
            }
        });
    }

    Template.battlefieldScrounge.current = function() {
        return Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                cu: 1
            }
        });
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
        // für den Range Slider
        Meteor.call("slider_init", function(err, result) {
            for (var i = 0; i < amountOwnSlots; i++) {
                var matterId = cursorMine['owns' + i].input;
                if (matterId > 0) {
                    range_slider(i, cursorPlayerData.mine.minControl, cursorPlayerData.mine.maxControl, cursorMine['owns' + i].control.min, cursorMine['owns' + i].control.max);
                }
            }
        });
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
                    obj0['profit'] = Math.floor(0.5 * cursorFightArena.value) + '(50%)';
                }
                obj0['epicness'] = supEpics + '%';

                obj0['supporter'] = supSlotsMemory;

                //für den range slider
                obj0['slot'] = i;

                objects[i] = obj0;
            }
        }
        // für den Range Slider
        Meteor.call("slider_init", function(err, result) {
            for (var i = 0; i < amountOwnSlots; i++) {
                var fightId = cursorBattlefield['owns' + i].input;
                if (fightId > 0) {
                    range_slider(i, cursorPlayerData.battlefield.minControl, cursorPlayerData.battlefield.maxControl, cursorBattlefield['owns' + i].control.min, cursorBattlefield['owns' + i].control.max);
                }
            }
        });
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

                obj0['profit'] = Math.floor((0.5 / amountUsedSupSlots) * cursorFightArena.value) + '(' + (0.5 / amountUsedSupSlots) * 100 + '%)';
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
                    obj0['profit'] = Math.floor(0.5 * cursorFightArena.value) + '(50%)';
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

        return resources.find({});

    };

    Template.standardBorder.worldMapFields = function() {

        return worldMapFields.find({});

    }

    /*    Template.worldMap.rendered= function() {
      createWorldMap();
    }*/

    //////////////////
    ///// EVENTS /////
    //////////////////
    Template.standardBorder.events({

        'click #testButton': function(e, t) {

        },

        'click #testButton2': function(e, t) {

            logRenders();

        },

        'click #testButton3': function(e, t) {

            var self = Meteor.users.findOne({
                _id: Meteor.userId()
            }, {
                fields: {
                    cu: 1
                }
            });
            var current = self.cu;
            Meteor.users.update({
                _id: Meteor.userId()
            }, {
                $set: {
                    menu: 'mine'
                }
            });
            Router.go('game', {
                name: current,
                menu: 'mine'
            });

        },

        'click #testButton4': function(e, t) {

            var self = Meteor.users.findOne({
                _id: Meteor.userId()
            }, {
                fields: {
                    cu: 1
                }
            });
            var current = self.cu;
            Meteor.users.update({
                _id: Meteor.userId()
            }, {
                $set: {
                    menu: 'battlefield'
                }
            });
            Router.go('game', {
                name: current,
                menu: 'battlefield'
            });

        },

        'click #switchToWorldMap': function(e, t) {

            if (!$("#world").length) {
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
                    initWorldMapArray(cursorUser.x, cursorUser.y);
                }

            } else {
            	var currentMenu = Meteor.users.findOne({
                        _id: Meteor.userId()
                    }, {
                        fields: {
                            menu: 1
                        }
                    }).menu;
                Router.current().render(currentMenu + 'Base', {
                    to: 'middle'
                });

            }
        },

        'click #character': function(e, t) {

            if (!$("#characterView").length) {

                Router.current().render('characterView', {
                    to: 'middle'
                });

            } else {

                $('#characterView').show();

            }
        },

        'click #scrounge': function(e, t) {

            if ($('#scrounge').css("background-position") == "0px 0px" || $('#scrounge').css("background-position") == "0% 0%") {

                Router.current().render('mineScrounge', {
                    to: 'middle'
                });

                $('#scrounge').css({
                    backgroundPosition: "0 -306px"
                });
            } else {

                Router.current().render('mineBase', {
                    to: 'middle'
                });

                $('#scrounge').css({
                    backgroundPosition: "0px 0px"
                });
            }



        },

    });


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
        'mouseover .slider': function(e, t) {
            slide($(e.target).attr('id'));
        },
        'mouseout .slider': function(e, t) {
            slide_stop();
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
        }
    });

    Template.mineBase.events({
        'click .used_slot': function(e, t) {

            /*AN GRAFIK ANGEPASSTE VERSION VON J.P.*/

            if ($(e.currentTarget).next(".used_slot_advanced").height() == 0) {
                $(e.currentTarget).next(".used_slot_advanced").animate({
                    "height": "100%"
                }, 0);
                var height = $(e.currentTarget).next(".used_slot_advanced").height() + 13 + "px";
                $(e.currentTarget).next(".used_slot_advanced").filter(':not(:animated)').animate({
                    "height": "0px"
                }, 0, function() {

                    $(e.currentTarget).next(".used_slot_advanced").filter(':not(:animated)').animate({
                        "margin-top": "-13px"
                    }, 150, function() {

                        $(e.currentTarget).next(".used_slot_advanced").filter(':not(:animated)').animate({
                            "height": height
                        }, 1000);

                    });
                });

            } else {
                $(e.currentTarget).next(".used_slot_advanced").animate({
                    "height": "0px",
                }, 1000);
                $(e.currentTarget).next(".used_slot_advanced").animate({
                    "margin-top": "0px"
                }, 150);
            }

            /*MICHA'S URSPRÜNGLICHE VERSION*/

            /*            if ($(e.currentTarget).next(".used_slot_advanced").height() == 0) {
                $(e.currentTarget).next(".used_slot_advanced").animate({
                    "height": "100%"
                }, 0);
                var height = $(e.currentTarget).next(".used_slot_advanced").height()+13 + "px";
                $(e.currentTarget).next(".used_slot_advanced").filter(':not(:animated)').animate({
                    "height": "0px"
                }, 0);
                $(e.currentTarget).next(".used_slot_advanced").filter(':not(:animated)').animate({
                    "height": height
                }, 1000);
            } else {
                $(e.currentTarget).next(".used_slot_advanced").animate({
                    "height": "0px",
                }, 1000);
            }*/
        },
        'mouseenter .tooltip_hover': function(e, t) {
            fade_In_and_Out("tooltip", $(e.currentTarget).children().attr('id').substr(20), "in");
        },
        'mouseleave .tooltip_hover': function(e, t) {
            fade_In_and_Out("tooltip", $(e.currentTarget).children().attr('id').substr(20), "out");
        },

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
    	'click .used_slot': function(e, t) {

            /*AN GRAFIK ANGEPASSTE VERSION VON J.P.*/

            if ($(e.currentTarget).next(".used_slot_advanced").height() == 0) {
                $(e.currentTarget).next(".used_slot_advanced").animate({
                    "height": "100%"
                }, 0);
                var height = $(e.currentTarget).next(".used_slot_advanced").height() + 13 + "px";
                $(e.currentTarget).next(".used_slot_advanced").filter(':not(:animated)').animate({
                    "height": "0px"
                }, 0, function() {

                    $(e.currentTarget).next(".used_slot_advanced").filter(':not(:animated)').animate({
                        "margin-top": "-13px"
                    }, 150, function() {

                        $(e.currentTarget).next(".used_slot_advanced").filter(':not(:animated)').animate({
                            "height": height
                        }, 1000);

                    });
                });

            } else {
                $(e.currentTarget).next(".used_slot_advanced").animate({
                    "height": "0px",
                }, 1000);
                $(e.currentTarget).next(".used_slot_advanced").animate({
                    "margin-top": "0px"
                }, 150);
            }
        },

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
            Session.set("clickedFight", e.currentTarget.id);
            $("#buyMenuItem").attr("src", "/Aufloesung1920x1080/Battlefield/Colosseum_" + this.color + ".png");
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
            Meteor.call('goScroungingMine', slotId, function(err) {
                if (err) {
                    console.log('goScroungingMine: ' + err);
                }
            });
        }
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
            Meteor.call('goScroungingBattlefield', slotId, function(err) {
                if (err) {
                    console.log('goScroungingBattlefield: ' + err);
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
                Meteor.call('buyMatter', Session.get("clickedMatter"), slider_range, function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
            if (menu == 'battlefield'){
            	Meteor.call('buyFight', Session.get("clickedFight"), slider_range, function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
            $('#buyMenu').fadeOut();

        },

        'click #buyMenuNo': function(e, t) {
            $('#buyMenu').fadeOut();

        },
    });

    Template.worldMap.events({
        'click .worldMapNavigators': function(e, t) {
            switch (e.currentTarget.id) {
                case "worldMapGoUp":
                    var yValue = worldMapArray[0].columns[0].y + 1;
                    if (yValue > mapRows - 1) yValue = 0
                    initWorldMapArray(worldMapArray[0].columns[0].x, yValue);
                    break;
                case "worldMapGoDown":
                    var yValue = worldMapArray[0].columns[0].y - 1;
                    if (yValue < 0) yValue = mapRows - 1
                    initWorldMapArray(worldMapArray[0].columns[0].x, yValue);
                    break;
                case "worldMapGoRight":
                    var xValue = worldMapArray[0].columns[0].x + 1;
                    if (xValue > mapColumns - 1) xValue = 0
                    initWorldMapArray(xValue, worldMapArray[0].columns[0].y);
                    break;
                case "worldMapGoLeft":
                    var xValue = worldMapArray[0].columns[0].x - 1;
                    if (xValue < 0) xValue = mapColumns - 1
                    initWorldMapArray(xValue, worldMapArray[0].columns[0].y);
                    break;
                default:
                    console.log('default case: worldMapNavigators');
                    break;
            }
            Session.set("worldMapArray", worldMapArray);
        },

        'click .worldMapPlayerPlace': function(e, t){
        	var current = e.currentTarget.id;
            var currentMenu = Meteor.users.findOne({
                _id: Meteor.userId()
            }, {
                fields: {
                    menu: 1
                }
            }).menu;
            Meteor.users.update({
                _id: Meteor.userId()
            }, {
                $set: {
                    cu: current
                }
            });
            var myName = Meteor.users.findOne({
                _id: Meteor.userId()
            }, {
                fields: {
                    username: 1
                }
            }).username;
            //in your own menu? base:scrounge
            if (current == myName) {
                Router.current().render(currentMenu + 'Base', {
                    to: 'middle'
                });
            } else {
                Router.current().render(currentMenu + 'Scrounge', {
                    to: 'middle'
                });
            }
        }

    });


    var time = 1200; //Animationszeit in ms
    var c = 1; //Start Kategorie
    var max_cat = 6; //Anzahl Kategorien
    var interval;
    var ready_check;
    var size;
    var slots_count = 10;
    var handle_check = false;
    var hover_check = false;

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
        if (!$("#range_slider_" + slot).data('uiSlider')) { // Wenn der Slider noch nicht Initialisiert ist -> True
            var left_handle;
            var right_handle;
            var current_handle;
            var disable_boolean = true;

            $("#range_slider_" + slot).width($("#range_slider_" + slot).parent().width());

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

    function slide(element) //abfrage welches ID gehovert wurde und umsetzung des richtigen slides
    {
        switch (element) {
            case 'left_slider_category':
                slide_left();
                //slide_start("left", 1, "#k1","#k2");
                break;
            case 'right_slider_category':
                slide_right();
                //slide_start("right", 1, "#k2", "#k1");
                break;
            case 'base_up':
                slide_up();
                break;
            case 'base_down':
                slide_down();
                break;
            case 'left_slider_slot_items':
                slide_left_simple('slot_items_content');
                break;
            case 'right_slider_slot_items':
                slide_right_simple('slot_items_content');
                break;
            case 'scroungeUp':
                slide_up_simple('scroungeAreaContent');
                break;
            case 'scroungeDown':
                slide_down_simple('scroungeAreaContent');
                break;
            default:
                //console.log("Slide für diesen Hover nicht definiert !");
                break;
        }
    }


    function slide_left_simple(element) {
        //console.log(element);
        //console.log($("." + element).position().left);
        size = size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
        var pos = size.p;
        var pos_r = size.pr + "px";
        var pos_p = "-=" + size.pp + "px";

        //console.log("s1: "+$("#s1").position().top);
        if ($("." + element).filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
        {
            if ($("." + element).position().left >= 60) {
                // Vorab Animation da Intervall erst nach [Time] anfängt
                $("." + element).filter(':not(:animated)').animate({
                    "left": "-=60px"
                }, 300, "linear");
                //Rekursiver Intervall (unendlich)
                var action = function() {
                    //Animation im laufenden Intervall  
                    $("." + element).animate({
                        "left": "-=60px"
                    }, 300, "linear");
                };
                //Start des Intervalls
                interval = setInterval(action, 300);
            }
        }
    }

    function slide_right_simple(element) {
        size = size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
        var pos = size.p;
        var pos_r = size.pr + "px";
        var pos_p = "+=" + size.pp + "px";

        //console.log("s1: "+$("#s1").position().top);
        if ($("." + element).filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
        {
            if ($("." + element).position().left >= 0) {
                // Vorab Animation da Intervall erst nach [Time] anfängt
                $("." + element).filter(':not(:animated)').animate({
                    "left": "+=60px"
                }, 300, "linear");
                //Rekursiver Intervall (unendlich)
                var action = function() {
                    //Animation im laufenden Intervall  
                    $("." + element).animate({
                        "left": "+=60px"
                    }, 300, "linear");
                };
                //Start des Intervalls
                interval = setInterval(action, 300);
            }
        }
    }

    function slide_down_simple(element) {
        size = size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
        var pos = size.p;
        var pos_r = size.pr + "px";
        var pos_p = "-=" + size.pp + "px";
        //console.log("s1: "+$("#s1").position().top);
        if ($("#" + element).filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
        {
            if ($("#" + element).position().top <= 0) {
                // Vorab Animation da Intervall erst nach [Time] anfängt
                $("#" + element).filter(':not(:animated)').animate({
                    "top": "-=80px"
                }, 300, "linear");
                //Rekursiver Intervall (unendlich)
                var action = function() {
                    //Animation im laufenden Intervall  
                    $("#" + element).animate({
                        "top": "-=80px"
                    }, 300, "linear");
                };
                //Start des Intervalls
                interval = setInterval(action, 300);
            }
        }
    }

    function slide_up_simple(element) {
        size = size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
        var pos = size.p;
        var pos_r = size.pr + "px";
        var pos_p = "+=" + size.pp + "px";
        //console.log("s1: "+$("#s1").position().top);
        if ($("#" + element).filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
        {
            if ($("#" + element).position().top <= -80) {
                // Vorab Animation da Intervall erst nach [Time] anfängt
                $("#" + element).filter(':not(:animated)').animate({
                    "top": "+=80px"
                }, 300, "linear");
                //Rekursiver Intervall (unendlich)
                var action = function() {
                    //Animation im laufenden Intervall  
                    if ($("#" + element).position().top <= -80)
                        $("#" + element).animate({
                            "top": "+=80px"
                        }, 300, "linear");
                };
                //Start des Intervalls
                interval = setInterval(action, 300);
            }
        }
    }









    function slide_start(direction, endless, element1, element2) {

        if (!element2) {
            element2 = 0;
        }
        console.log(direction + " " + endless + " " + element1 + " " + element2);
    }

    function slide_left() {
        size = size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
        var pos = size.p;
        var pos_r = size.pr + "px";
        var pos_p = "-=" + size.pp + "px";

        if ($("#k1").filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
        {
            if ($("#k2").position().left < pos) //Positionierung der Div's wenn Slide am anfang auf Startpunkt
            {
                $("#k2").css({
                    left: pos_r
                });
                $("#k1").css({
                    left: "0px"
                });
            }
            // Vorab Animation da Intervall erst nach [Time] anfängt
            // $("#k1").filter(':not(:animated)').animate({
            //     left: pos_p
            // }, time, "linear");
            // $("#k2").filter(':not(:animated)').animate({
            //     left: pos_p
            // }, time, "linear");
            //Rekursiver Intervall (unendlich)
            var action = function() {
                if ($("#k2").position().left < pos) //Positionierung der Div's wenn Slide wieder am Startpunkt
                {
                    $("#k2").animate({
                        left: pos_r
                    }, 0, "linear");
                    $("#k1").animate({
                        left: "0px"
                    }, 0, "linear");
                }
                //Animation im laufenden Intervall  
                $("#k1").animate({
                    left: pos_p
                }, time, "linear");
                $("#k2").animate({
                    left: pos_p
                }, time, "linear");
                update_category("left");
            };
            //Start des Intervalls
            interval = setInterval(action, time);
            update_category("left");
        }
    }

    function slide_right() {
        size = size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
        var pos = size.p;
        var pos_r = "-" + size.pr + "px";
        var pos_p = "+=" + size.pp + "px";

        if ($("#k1").filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
        {
            if ($("#k1").position().left > -pos) //Positionierung der Div's wenn Slide am anfang auf Startpunkt
            {
                $("#k1").css({
                    left: pos_r
                });
                $("#k2").css({
                    left: "0px"
                });
            }
            // Vorab Animation da Intervall erst nach [Time] anfängt
            // $("#k1").filter(':not(:animated)').animate({
            //     left: pos_p
            // }, time, "linear");
            // $("#k2").filter(':not(:animated)').animate({
            //     left: pos_p
            // }, time, "linear");
            //Rekursiver Intervall (unendlich)
            var action = function() {
                if ($("#k1").position().left > -pos) //Positionierung der Div's wenn Slide wieder am Startpunkt
                {
                    $("#k1").animate({
                        left: pos_r
                    }, 0, "linear");
                    $("#k2").animate({
                        left: "0px"
                    }, 0, "linear");
                }
                //Animation im laufenden Intervall  
                $("#k1").animate({
                    left: pos_p
                }, time, "linear");
                $("#k2").animate({
                    left: pos_p
                }, time, "linear");
                update_category("right");
            };
            //Start des Intervalls
            interval = setInterval(action, time);
            update_category("right");
        }
    }

    function slide_down() {
        size = size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
        var pos = size.p;
        var pos_r = size.pr + "px";
        var pos_p = "-=" + size.pp + "px";
        //console.log("s1: "+$("#s1").position().top);
        if ($("#base_area_content").filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
        {
            if ($("#base_area_content").position().top <= 0) {
                // Vorab Animation da Intervall erst nach [Time] anfängt
                // $("#base_area_content").filter(':not(:animated)').animate({
                //     "top": "-=80px"
                // }, 300, "linear");
                //Rekursiver Intervall (unendlich)
                var action = function() {
                    //Animation im laufenden Intervall  
                    $("#base_area_content").animate({
                        "top": "-=80px"
                    }, 300, "linear");
                };
                //Start des Intervalls
                interval = setInterval(action, 300);
            }
        }
    }

    function slide_up() {
        size = size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
        var pos = size.p;
        var pos_r = size.pr + "px";
        var pos_p = "+=" + size.pp + "px";
        //console.log("s1: "+$("#s1").position().top);
        if ($("#base_area_content").filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
        {
            if ($("#base_area_content").position().top <= -80) {
                // Vorab Animation da Intervall erst nach [Time] anfängt
                // $("#base_area_content").filter(':not(:animated)').animate({
                //     "top": "+=80px"
                // }, 300, "linear");
                //Rekursiver Intervall (unendlich)
                var action = function() {
                    //Animation im laufenden Intervall  
                    if ($("#base_area_content").position().top <= -80)
                        $("#base_area_content").animate({
                            "top": "+=80px"
                        }, 300, "linear");
                };
                //Start des Intervalls
                interval = setInterval(action, 300);
            }
        }
    }

    function slide_stop() {
        clearInterval(interval);
    }

    function update_category(direction) { // in der Variable C ist die aktuelle Kategorie gespeichert und wird beim Sliden nach links und rechts hoch oder runter gezählt
        if (direction == "left") {
            c--;
        } else if (direction == "right") {
            c++;
        }

        if (c == 0 && direction == "left") {
            c = max_cat;
        } else if (c == (max_cat + 1) && direction == "right") {
            c = 1;
        }
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
        size = size_check();
        var pos = size.p;
        var pos_r = size.pr;
        var pos_p = size.pp;

        var cur_pos_right = (c * pos_p) - pos_p;
        var cur_pos_left = cur_pos_right - (pos_r);
        $("#k1").css({
            left: cur_pos_left
        });
        $("#k2").css({
            left: cur_pos_right
        });
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
    });

    //Changes array to unique array with distinct values

    function distinct(array) {
        var uniqueArray = array.filter(function(elem, pos) {
            return array.indexOf(elem) == pos;
        })
        return uniqueArray
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

    var worldMapArray = new Array();

    function initWorldMapArray(orientationX, orientationY) {
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
                var playerLevel = playerData.findOne({
                    user: user
                }, {
                    fields: {
                        level: 1
                    }
                }).level;
                infoMemory['playerLevel'] = playerLevel;
                infoMemory['playerImage'] = "worldMapPlayerImage";
                infoMemory['playerName'] = user;
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
    //     	//To-DO: getNewColumn implementieren
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
