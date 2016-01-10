/////////////////////////
////// BATTLEFIELD //////
/////////////////////////

///// BATTLEFIELDOWNER /////
Template.battlefieldOwner.onCreated(function() {
    var inst = this;
    inst.state = new ReactiveDict();

    var self = Meteor.users.findOne({
        _id: Meteor.userId()
    }, {
        fields: {
            username: 1,
            _id: 0
        }
    }).username;
    var color = 'green';

    inst.autorun(function() {
        var currentUser = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                cu: 1
            }
        }).cu;

        var subsPlayerDataBattlefield = inst.subscribe('playerDataBattlefield', self);
        var subsFightArenas = inst.subscribe('FightArenas', color);
        var subsBattlefieldBase = inst.subscribe('battlefieldBase', currentUser);
        var subsBattlefieldSupport = inst.subscribe('battlefieldSupport', currentUser);
        var subsBattlefieldScrounge = inst.subscribe('battlefieldScrounge', currentUser);

        if (subsPlayerDataBattlefield.ready()) {
            var cursorPlayerDataBattlefield = playerData.findOne({
                user: self
            }, {
                fields: {
                    battlefield: 1
                }
            });
            var amountSupSlots = cursorPlayerDataBattlefield.battlefield.amountSupSlots;
            inst.state.set('amountSupSlots', amountSupSlots);
        }
        inst.state.set('currentUser', currentUser);
    })
});

Template.battlefieldOwner.helpers({
    battlefieldBaseUnused: function() {
        return battlefieldBase.find({
            user: Template.instance().state.get('currentUser'),
            input: "0000"
        });
    },

    battlefieldBaseUsed: function() {
        return battlefieldBase.find({
            user: Template.instance().state.get('currentUser'),
            input: {
                $ne: "0000"
            }
        }, {
            sort: {
                remaining: 1
            }
        });
    },

    battlefieldScroungeUnused: function() {
        return battlefieldScrounge.find({
            user: Template.instance().state.get('currentUser'),
            input: "0000"
        });
    },

    battlefieldScroungeUsed: function() {
        return battlefieldScrounge.find({
            user: Template.instance().state.get('currentUser'),
            input: {
                $ne: "0000"
            }
        }, {
            sort: {
                remaining: 1
            }
        });
    },

    supporter: function(refID) {
        return battlefieldSupport.find({
            user: Template.instance().state.get('currentUser'),
            refID: refID,
            supporter: {
                $nin: [null, ""]
            }
        }, {
            sort: {
                timeStart: 1
            }
        });
    },

    percentageProgress: function() {
        return Math.floor(TimeSync.serverTime(Date.now() - this.timeStart) / this.progress2 * 100);
    },

    imagePosition: function() {
        return battlefieldCTBP(this.input.substring(0, 2));
    },

    remainingTimeFormat: function() {
        return msToTime(this.remaining);
    },

    timeSpentTimeFormat: function() {
        return msToTime(TimeSync.serverTime(Date.now() - this.timeStart));
    },

    progressTimeFormat: function() {
        return msToTime(this.progress2);
    },

    profit: function(status) {
        if (status == "base") {
            var profit = split("battlefield", status, this.user, this.user, this.slotID);
        } else if (status == "scrounge") {
            var profit = split("battlefield", status, this.victim, this.user, this.refID);
        }
        var percent = Math.floor((profit / this.splitValue) * 100);
        return profit + '/' + this.splitValue + '(' + percent + '%)';
    },

    arenaColors: function() {
        var cursorFightColors = FightArenas.find({}, {
            fields: {
                'color': 1
            }
        }).fetch();
        var colorArray = new Array();
        for (var i = 0; i < cursorFightColors.length; i++) {
            colorArray[i] = cursorFightColors[i].color;
        }
        var result = colorArray.filter(onlyUnique);
        var objects = new Array();
        for (var j = 0; j < result.length; j++) {
            switch (result[j]) {
                case "green":
                    objects[j] = {
                        'color': "-683px -27px"
                    };
                    break;
                case "red":
                    objects[j] = {
                        'color': "-683px -45px"
                    };
                    break;
                default:
                    console.log("oops");
            }
        }
        return objects;
    },

    fightArenas: function() {
        var objects = new Array();
        var cursorFightArenas = FightArenas.find({}, {
            sort: {
                fight: 1
            }
        }).fetch();
        for (var i = 0; i < cursorFightArenas.length; i++) {
            var obj0 = {};
            obj0['fight'] = cursorFightArenas[i].fight;
            switch (cursorFightArenas[i].color) {
                case "green":
                    obj0['color'] = "-2678px 0px";
                    obj0['colorCost'] = "-1725px 0px";
                    break;
                case "red":
                    obj0['color'] = "-2678px -50px";
                    obj0['colorCost'] = "-1725px -25px";
                    break;
                default:
                    console.log("oops");
            }
            obj0['cost'] = cursorFightArenas[i].cost;
            obj0['value'] = cursorFightArenas[i].value + "XP";
            obj0['time'] = cursorFightArenas[i].time;
            objects[i] = obj0;
        }
        return objects;
    }
});

Template.battlefieldOwner.events({
    'click .item': function(e, t) {
        var currentUser = Template.instance().state.get('currentUser');
        var amountSupSlots = Template.instance().state.get('amountSupSlots');
        var cursorPlayerDataBattlefield = playerData.findOne({
            user: currentUser
        }).battlefield;
        $("#buyMenuWrapper").show(0, function() {
            $("#background_fade").fadeIn();
        });
        Session.set("clickedFight", e.currentTarget.id);
        switch (e.currentTarget.id.substring(0, 2)) {
            case "01":
                $("#buyMenuItem").css({
                    backgroundPosition: "-220px 0px"
                });
                $("#matterImg").css({
                    backgroundPosition: "-1725px 0px"
                });
                break;
            case "02":
                $("#buyMenuItem").css({
                    backgroundPosition: "-220px -100px"
                });
                $("#matterImg").css({
                    backgroundPosition: "-1725px -50px"
                });
                break;
            default:
                console.log("oops");
        };
        $('#item').text("XP: " + this.value);
        range_slider("Buy_Menu", cursorPlayerDataBattlefield.minControl, cursorPlayerDataBattlefield.maxControl, cursorPlayerDataBattlefield.minControl, cursorPlayerDataBattlefield.maxControl);
        $('#time').text("Time: " + msToTime(this.time));
        $('#price').text("Price: " + this.cost);

        $("#range_slider_Buy_Menu").children('.ui-slider-handle').css("display", "block");

        if ($('#AmountScroungerSlots').children()) {
            $('#AmountScroungerSlots').children().remove();
        }

        for (var i = 0; i < 6; i++) {

            if (amountSupSlots > i) {

                $('#AmountScroungerSlots').append("<div class='sslots_available sshr'> </div>");

            } else {

                $('#AmountScroungerSlots').append("<div class='sslots_unavailable sshr'> </div>");

            }
        }
    }
});

///// BATTLEFIELDENEMY /////
Template.battlefieldEnemy.onCreated(function() {
    var inst = this;
    inst.state = new ReactiveDict();

    var self = Meteor.users.findOne({
        _id: Meteor.userId()
    }, {
        fields: {
            username: 1,
            _id: 0
        }
    }).username;
    inst.state.set('self', self);

    inst.autorun(function() {
        var currentUser = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                cu: 1
            }
        }).cu;

        var subsPlayerDataBattlefieldOwn = inst.subscribe('playerDataBattlefield', self);
        var subsPlayerDataBattlefieldEnemy = inst.subscribe('playerDataBattlefield', currentUser);
        var subsBattlefieldBase = inst.subscribe('battlefieldBase', currentUser);
        var subsBattlefieldScrounge = inst.subscribe('battlefieldScrounge', self);
        var subsBattlefieldSupport = inst.subscribe('battlefieldSupport', currentUser);

        if (subsPlayerDataBattlefieldEnemy.ready()) {
            var cursorPlayerDataBattlefieldEnemy = playerData.findOne({
                user: currentUser
            }, {
                fields: {
                    battlefield: 1
                }
            });
            var amountSupSlots = cursorPlayerDataBattlefieldEnemy.battlefield.amountSupSlots;
            inst.state.set('amountSupSlots', amountSupSlots);
        }
        inst.state.set('currentUser', currentUser);
    })
});

Template.battlefieldEnemy.helpers({
    activeSlots: function() {
        //TO-DO: If enemy is clicked this function is called twice - template renders twice? why? => autorun triggers twice. why?
        var arrayBattlefieldBase = battlefieldBase.find({
            user: Template.instance().state.get('currentUser'),
            input: {
                $ne: "0000"
            }
        }, {
            sort: {
                remaining: 1
            }
        }).fetch();
        if (arrayBattlefieldBase.length == 0) {
            arrayBattlefieldBase = false
        };
        return arrayBattlefieldBase;
    },

    supporter: function(refID) {
        return battlefieldSupport.find({
            user: Template.instance().state.get('currentUser'),
            refID: refID,
            supporter: {
                $nin: [null, ""]
            }
        }, {
            sort: {
                timeStart: 1
            }
        });
    },

    scroungeable: function() {
        //TO-DO: If enemy is clicked this function is called twice - template renders twice? why? => autorun triggers twice. why?
        var result = isScroungeable('battlefield', Template.instance().state.get('self'), Template.instance().state.get('currentUser'), this.slotID);
        if (result.result == true) {
            return true;
        } else {
            return result;
        }
    },

    percentageProgress: function() {
        return Math.floor(TimeSync.serverTime(Date.now() - this.timeStart) / this.progress2 * 100);
    },

    imagePosition: function() {
        return battlefieldCTBP(this.input.substring(0, 2));
    },

    remainingTimeFormat: function() {
        return msToTime(this.remaining);
    },

    timeSpentTimeFormat: function() {
        return msToTime(TimeSync.serverTime(Date.now() - this.timeStart));
    },

    progressTimeFormat: function() {
        return msToTime(this.progress2);
    },

    benefitChange: function() {
        //TO-DO: Get item value
        return this.benefitTotal + 50;
    },

    slotsChange: function() {
        return this.slots1 + 1;
    },

    xpChange: function() {
        //TO-DO: Get item value
        return this.splitValue + (0.5 * this.value);
    }
});

Template.battlefieldEnemy.events({
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
        Meteor.call('goScroungingBattlefield', parseInt(e.currentTarget.id.split("_").pop()), function(err, result) {
            if (err) {
                console.log('goScroungingBattlefield:', err);
            } else if (result) {
                infoLog(result);
                showInfoTextAnimation(result);
            }
        });
    }
});

// OLD OLD 2016/01/03 OLD OLD
// ///// BATTLEFIELDOWNER /////
// Template.battlefieldOwner.onCreated(function() {

//     //console.time('createBattlefieldBase');
//     var inst = this;
//     inst.state = new ReactiveDict();
//     var self = Meteor.users.findOne({
//         _id: Meteor.userId()
//     }, {
//         fields: {
//             username: 1,
//             _id: 0
//         }
//     }).username;
//     var users = [self];

//     inst.autorun(function() {

//         var subsPlayerDataBattlefield = inst.subscribe('playerDataBattlefield', users);
//         var color = 'green';
//         var subsFightArenas = inst.subscribe('FightArenas', color);

//         if (subsPlayerDataBattlefield.ready() && subsFightArenas.ready()) {
//             var cursorPlayerDataBattlefield = playerData.findOne({
//                 user: self
//             }, {
//                 fields: {
//                     battlefield: 1
//                 }
//             }).battlefield;

//             //Get data from all own slots
//             var inputs = [];
//             var stampsSlotsLeft = [];
//             var supStamps = [];
//             var supEpicness = [];
//             var supNames = [];
//             var supLevels = [];
//             var fightArenasValues = [];
//             var fightArenasColors = [];
//             var fightArenasTimes = [];

//             var amountOwnSlots = cursorPlayerDataBattlefield.amountOwnSlots;
//             var amountSupSlots = cursorPlayerDataBattlefield.amountSupSlots;
//             var ownEpic = cursorPlayerDataBattlefield.scrItem.benefit;

//             for (i = 0; i < amountOwnSlots; i++) {
//                 inputs[i] = cursorPlayerDataBattlefield.ownSlots['owns' + i].input;
//                 //falls der slot benutzt ist
//                 if (inputs[i] > 0) {
//                     var cursorFightArena = FightArenas.findOne({
//                         fight: inputs[i]
//                     })
//                     fightArenasValues[i] = cursorFightArena.value;
//                     fightArenasColors[i] = cursorFightArena.color;
//                     fightArenasTimes[i] = cursorFightArena.time;
//                 }
//                 stampsSlotsLeft[i] = cursorPlayerDataBattlefield.ownSlots['owns' + i].stamp;

//                 var supStampsOneSlot = [];
//                 var supEpicnessOneSlot = [];
//                 var supNamesOneSlot = [];
//                 var supLevelsOneSlot = [];
//                 for (k = 0; k < amountSupSlots; k++) {
//                     supStampsOneSlot[k] = cursorPlayerDataBattlefield.ownSlots['owns' + i]['sup' + k].stamp;
//                     supEpicnessOneSlot[k] = cursorPlayerDataBattlefield.ownSlots['owns' + i]['sup' + k].benefit;
//                     supNamesOneSlot[k] = cursorPlayerDataBattlefield.ownSlots['owns' + i]['sup' + k].name;
//                     supLevelsOneSlot[k] = cursorPlayerDataBattlefield.ownSlots['owns' + i]['sup' + k].level;
//                 }
//                 supStamps[i] = supStampsOneSlot;
//                 supEpicness[i] = supEpicnessOneSlot;
//                 supNames[i] = supNamesOneSlot;
//                 supLevels[i] = supLevelsOneSlot;
//             }

//             //Get data from all scrounge slots
//             var dataScrSlots = {};
//             var stampsSlotsRight = [];
//             var ownEpicness = [];
//             var fightArenasValuesScrounge = [];
//             var fightArenasColorsScrounge = [];
//             var fightArenasTimesScrounge = [];
//             var stampsScroungedUsers = [];
//             var inputsScroungedUsers = [];
//             var namesScroungedUsers = [];
//             var supsVictimsStamps = [];
//             var supsVictimsEpics = [];
//             var amountVictimsSupSlots = [];

//             var amountScrSlots = cursorPlayerDataBattlefield.amountScrSlots;

//             for (i = 0; i < amountScrSlots; i++) {
//                 ownEpicness[i] = cursorPlayerDataBattlefield.scrSlots['scrs' + i].benefit;
//                 stampsSlotsRight[i] = cursorPlayerDataBattlefield.scrSlots['scrs' + i].stamp;
//                 stampsScroungedUsers[i] = cursorPlayerDataBattlefield.scrSlots['scrs' + i].victim.stamp;
//                 inputsScroungedUsers[i] = cursorPlayerDataBattlefield.scrSlots['scrs' + i].victim.input;
//                 namesScroungedUsers[i] = cursorPlayerDataBattlefield.scrSlots['scrs' + i].victim.name;
//                 //falls der slot benutzt ist
//                 if (inputsScroungedUsers[i] > 0) {
//                     var cursorFightArena = FightArenas.findOne({
//                         fight: inputsScroungedUsers[i]
//                     })
//                     fightArenasValuesScrounge[i] = cursorFightArena.value;
//                     fightArenasColorsScrounge[i] = cursorFightArena.color;
//                     fightArenasTimesScrounge[i] = cursorFightArena.time;
//                 }

//                 var amountVictimSupSlots = cursorPlayerDataBattlefield.scrSlots['scrs' + i].victim.supSlotsVictim;
//                 amountVictimsSupSlots[i] = amountVictimSupSlots;

//                 var supsVictimsStampsOneSlot = [];
//                 var supsVictimsEpicsOneSlot = [];
//                 for (k = 0; k < amountVictimSupSlots; k++) {
//                     supsVictimsStampsOneSlot[k] = cursorPlayerDataBattlefield.scrSlots['scrs' + i].victim['sup' + k].stamp;
//                     supsVictimsEpicsOneSlot[k] = cursorPlayerDataBattlefield.scrSlots['scrs' + i].victim['sup' + k].benefit;
//                 }
//                 supsVictimsStamps[i] = supsVictimsStampsOneSlot;
//                 supsVictimsEpics[i] = supsVictimsEpicsOneSlot;
//             }
//             //set Data Context for other helpers         

//             //allgemeine Daten
//             inst.state.set('self', users);
//             inst.state.set('amountScrSlots', amountScrSlots);
//             inst.state.set('amountSupSlots', amountSupSlots);
//             inst.state.set('amountOwnSlots', amountOwnSlots);
//             inst.state.set('ownEpic', ownEpic);

//             //für linke Seite benötigt
//             inst.state.set('fightIds', inputs);
//             inst.state.set('timeStamps', stampsSlotsLeft);
//             inst.state.set('supTimeStamps', supStamps);
//             inst.state.set('supEpics', supEpicness);
//             inst.state.set('supLevels', supLevels);
//             inst.state.set('supporters', supNames);
//             inst.state.set('fightArenasValues', fightArenasValues);
//             inst.state.set('fightArenasColors', fightArenasColors);
//             inst.state.set('fightArenasTimes', fightArenasTimes);

//             //für rechte Seite benötigt
//             inst.state.set('ownTimeStamps', stampsSlotsRight);
//             inst.state.set('victims', namesScroungedUsers);
//             inst.state.set('victimsSupSlots', amountVictimsSupSlots);
//             inst.state.set('timeStampsScrounge', stampsScroungedUsers);
//             inst.state.set('supEpicsScrounge', supsVictimsEpics);
//             inst.state.set('supTimeStampsScrounge', supsVictimsStamps);
//             inst.state.set('fightArenasColorsScrounge', fightArenasColorsScrounge);
//             inst.state.set('fightArenasValuesScrounge', fightArenasValuesScrounge);
//             inst.state.set('fightArenasTimesScrounge', fightArenasTimesScrounge);
//             //console.timeEnd('createBattlefieldBase');

//             // console.log('battlefieldBaseDict');
//             // console.log(inst.state);
//         }
//     })
// });

// Template.battlefieldOwner.helpers({
//     battlefieldUnusedSlots: function() {

//         // Battlefield
//         //get fields from data context
//         var name = Template.instance().state.get('self');
//         var amountOwnSlots = Template.instance().state.get('amountOwnSlots');
//         var fightIds = Template.instance().state.get('fightIds');
//         var objects = new Array();
//         var amountObjects = 0;

//         for (var i = 0; i < amountOwnSlots; i++) {
//             if (fightIds[i] == "0000") {
//                 amountObjects++;
//             }
//         }
//         for (var j = 0; j < amountObjects; j++) {
//             objects[j] = {};
//         }
//         // console.log('objectsUnusedB', objects);
//         return objects;
//     },
//     battlefieldUsedSlots: function() {
//         /*Battlefield*/
//         //get fields from data context
//         var name = Template.instance().state.get('self');
//         var amountOwnSlots = Template.instance().state.get('amountOwnSlots');
//         var amountSupSlots = Template.instance().state.get('amountSupSlots');
//         var supLevels = Template.instance().state.get('supLevels');
//         var fightIds = Template.instance().state.get('fightIds');
//         var fightArenasValues = Template.instance().state.get('fightArenasValues');
//         var fightArenasColors = Template.instance().state.get('fightArenasColors');
//         var fightArenasTimes = Template.instance().state.get('fightArenasTimes');
//         var timeStamps = Template.instance().state.get('timeStamps');
//         var supporters = Template.instance().state.get('supporters');
//         var supTimeStamps = Template.instance().state.get('supTimeStamps');
//         var supEpics = Template.instance().state.get('supEpics');
//         var objects = new Array();

//         var calculatedServerTime = TimeSync.serverTime(Date.now());
//         /*Iterate OwnSlots*/
//         for (var i = 0; i < amountOwnSlots; i++) {
//             //falls der slot benutzt ist (nicht 0000)
//             if (fightIds[i] > 0) {
//                 var amountUsedSupSlots = 0;
//                 var obj0 = {};
//                 var supEpicsAdded = 0;

//                 var supSlotsMemory = new Array();
//                 //Iterate Supporter
//                 for (var k = 0; k < amountSupSlots; k++) {
//                     //SupSlot used?
//                     if (supporters[i] != "") {
//                         if (supporters[i][k] != "") {
//                             amountUsedSupSlots++;
//                             var obj00 = {};
//                             var supTime = supTimeStamps[i][k];

//                             obj00['timeSpentId'] = 'timerInc_' + i + k + '_battlefield_sup';
//                             var obj01 = {};
//                             obj01['id'] = obj00['timeSpentId'];
//                             obj01['miliseconds'] = calculatedServerTime - supTime;
//                             obj01['notFound'] = 0;
//                             obj01['prefix'] = 1;
//                             GV_timers.push(obj01);
//                             obj00['timeSpent'] = msToTime(obj01['miliseconds']);

//                             var supEpic = supEpics[i][k];
//                             supEpicsAdded = supEpicsAdded + supEpic;
//                             obj00['epicness'] = supEpic + '%';
//                             obj00['level'] = supLevels[i];
//                             obj00['supName'] = supporters[i][k];
//                             supSlotsMemory[k] = obj00;
//                         }
//                     }
//                 }

//                 //Diese Switch-Anweisung existiert nur, um den Sprite Sheets gerecht zu werden
//                 //Es wird geprüft, um welchen Farbcode es sich handelt, dieser wird dann in die background-position im Sprite Sheet übersetzt
//                 //Im HTML wird der Wert entsprechend für die background-position eingesetzt
//                 //Diese "Übersetzung" ist notwendig, da der Farbcode an verschiedenen Stellen abgefragt wird und jeweils eine andere 
//                 //background-position nötig ist. (Unterschiedlich große images)
//                 switch (fightArenasColors[i]) {
//                     case "green":
//                         obj0['color'] = "-216px 0px";
//                         break;
//                     case "red":
//                         obj0['color'] = "-0px -0px";
//                         break;
//                     default:
//                         console.log("no fightArena color defined");
//                 }
//                 //if else funktioniert identisch wie obiges aber da viele Farben geplant sind, ist ein switch case eleganter
//                 /*if(cursorFightArena.color == "green") {obj0['color'] = "-550px 0px";}*/
//                 //vorherige Lösung
//                 /*obj0['color'] = cursorFightArena.color;*/
//                 obj0['slots'] = amountUsedSupSlots + '/' + amountSupSlots;
//                 obj0['xp'] = Math.floor((fightArenasValues[i] * (100 + supEpicsAdded)) / 100) + '(' + Math.floor(100 + supEpicsAdded) + '%)';
//                 obj0['timeSpentId'] = 'timerInc_' + i + '_battlefield';

//                 // var obj1 = {};
//                 // obj1['id'] = obj0['remainingId'];
//                 // obj1['miliseconds'] = ((fightArenasValues[i] - progressTotal) / ((7.5 + supEpicsAdded) / 3600000));
//                 // obj1['notFound'] = 0;
//                 // obj1['prefix'] = -1;
//                 // GV_timers.push(obj1);
//                 // obj0['remaining'] = msToTime((parseInt(fightArenasValues[i]) - progressTotal) / ((7.5 + supEpicsAdded) / 3600000));

//                 var obj2 = {};
//                 obj2['id'] = obj0['timeSpentId'];
//                 obj2['miliseconds'] = calculatedServerTime - timeStamps[i];
//                 obj2['notFound'] = 0;
//                 obj2['prefix'] = 1;
//                 GV_timers.push(obj2);
//                 obj0['timeSpent'] = msToTime(calculatedServerTime) - timeStamps[i];

//                 obj0['timeOverall'] = '/' + msToTime(fightArenasTimes[i]) + '(' + Math.floor((obj2['miliseconds'] / fightArenasTimes[i]) * 100) + '%)';

//                 if (amountUsedSupSlots == 0) {
//                     obj0['profit'] = Math.floor(fightArenasValues[i]) + '(100%)';
//                 } else {
//                     obj0['profit'] = Math.floor(0.5 * (fightArenasValues[i] + ((fightArenasValues[i] * supEpicsAdded) / 100))) + '(50%)';
//                 }
//                 obj0['epicness'] = supEpicsAdded + '%';

//                 obj0['supporter'] = supSlotsMemory;

//                 //für den range slider
//                 obj0['slot'] = i;

//                 objects[i] = obj0;
//             }
//         }
//         // console.log('objectsUsedB', objects);
//         return objects;
//     },

//     battlefieldUnusedScroungeSlots: function() {
//         //Battlefield Scrounging
//         //get fields from data context
//         var name = Template.instance().state.get('self');
//         var victims = Template.instance().state.get('victims');
//         var amountScrSlots = Template.instance().state.get('amountScrSlots');
//         var objects = new Array();

//         for (var i = 0; i < amountScrSlots; i++) {
//             if (victims[i] == "") objects[i] = {};
//         }
//         return objects;
//     },

//     battlefieldUsedScroungeSlots: function() {
//         //Battlefield Scrounging
//         //get fields from data context
//         var name = Template.instance().state.get('self')[0];
//         var ownEpics = Template.instance().state.get('ownEpics');
//         var ownTimeStamps = Template.instance().state.get('ownTimeStamps');
//         var amountScrSlots = Template.instance().state.get('amountScrSlots');
//         var victimsSupSlots = Template.instance().state.get('victimsSupSlots');
//         var victims = Template.instance().state.get('victims');
//         var timeStampsScrounge = Template.instance().state.get('timeStampsScrounge');
//         var supEpicsScrounge = Template.instance().state.get('supEpicsScrounge');
//         var supTimeStampsScrounge = Template.instance().state.get('supTimeStampsScrounge');
//         var fightArenasColorsScrounge = Template.instance().state.get('fightArenasColorsScrounge');
//         var fightArenasValuesScrounge = Template.instance().state.get('fightArenasValuesScrounge');
//         var fightArenasTimesScrounge = Template.instance().state.get('fightArenasTimesScrounge');
//         var objects = new Array();

//         var calculatedServerTime = TimeSync.serverTime(Date.now());
//         //Iterate all Scrounging Slots (i = scrounge slots)
//         for (var i = 0; i < amountScrSlots; i++) {
//             //Is used?
//             if (victims[i] != "") {
//                 var supEpicsScroungeAdded = 0;
//                 var amountUsedSupSlots = 0
//                 //Iterate Supporter (l = supporter slot)
//                 for (var l = 0; l < victimsSupSlots[i]; l++) {
//                     //Falls ein Supporter vorhanden ist, verwende dessen supEpic und Zeitstempel
//                     //scr slot überhaupt benutzt?
//                     if (supTimeStampsScrounge[i] != "") {
//                         //welcher/wieviele supporter slots des scr slots sind besetzt
//                         if (supTimeStampsScrounge[i][l] != "") {
//                             amountUsedSupSlots++;
//                             var supTime = supTimeStampsScrounge[i][l];
//                             var supEpic = supEpicsScrounge[i][l];
//                             supEpicsScroungeAdded = supEpicsScroungeAdded + supEpic;
//                         }
//                     }
//                 }
//                 var obj0 = {};
//                 //Diese Switch-Anweisung existiert nur, um den Sprite Sheets gerecht zu werden
//                 //Es wird geprüft, um welchen Farbcode es sich handelt, dieser wird dann in die background-position im Sprite Sheet übersetzt
//                 //Im HTML wird der Wert entsprechend für die background-position eingesetzt
//                 //Diese "Übersetzung" ist notwendig, da der Farbcode an verschiedenen Stellen abgefragt wird und jeweils eine andere 
//                 //background-position nötig ist. (Unterschiedlich große images)
//                 //switch(cursorFightArena.color) {
//                 switch (fightArenasColorsScrounge[i]) {
//                     case "green":
//                         obj0['color'] = "-216px 0px";
//                         break;
//                     case "red":
//                         obj0['color'] = "-0px -0px";
//                         break;
//                     default:
//                         console.log("oops");
//                 }
//                 //if else funktioniert identisch wie obiges aber da viele Farben geplant sind, ist ein switch case eleganter
//                 if(cursorFightArena.color == "green") {obj0['color'] = "-550px 0px";}
//                 //vorherige Lösung
//                 /*obj0['color'] = cursorFightArena.color;*/
//                 obj0['victim'] = victims[i];
//                 obj0['slots'] = amountUsedSupSlots + '/' + victimsSupSlots[i];
//                 obj0['remainingId'] = 'timerDec_' + i + '_battlefield_scr';
//                 obj0['timeSpentId'] = 'timerInc_' + i + '_battlefield_scr';

//                 var obj1 = {};
//                 obj1['id'] = obj0['remainingId'];
//                 obj1['miliseconds'] = (fightArenasTimesScrounge[i]) - calculatedServerTime - ownTimeStamps[i];
//                 obj1['notFound'] = 0;
//                 obj1['prefix'] = -1;
//                 GV_timers.push(obj1);
//                 obj0['remaining'] = msToTime(obj1['miliseconds']);

//                 var obj2 = {};
//                 obj2['id'] = obj0['timeSpentId'];
//                 obj2['miliseconds'] = calculatedServerTime - ownTimeStamps[i];
//                 obj2['notFound'] = 0;
//                 obj2['prefix'] = 1;
//                 GV_timers.push(obj2);
//                 obj0['timeSpent'] = msToTime(calculatedServerTime) - ownTimeStamps[i];

//                 obj0['timeOverall'] = '/' + msToTime(fightArenasTimesScrounge[i]) + '(' + Math.floor((obj2['miliseconds'] / fightArenasTimesScrounge[i]) * 100) + '%)';

//                 obj0['profit'] = Math.floor((0.5 / amountUsedSupSlots) * fightArenasValuesScrounge[i]) + '(' + (0.5 / amountUsedSupSlots) * 100 + '%)';
//                 obj0['epicness'] = supEpicsScroungeAdded + '%';
//                 obj0['slider_id'] = i + 6;
//                 objects[i] = obj0;
//             }
//         }
//         return objects;
//     },

//     arenaColors: function() {
//         var cursorFightColors = FightArenas.find({}, {
//             fields: {
//                 'color': 1
//             }
//         }).fetch();
//         var colorArray = new Array();
//         for (var i = 0; i < cursorFightColors.length; i++) {
//             colorArray[i] = cursorFightColors[i].color;
//         }
//         var result = colorArray.filter(onlyUnique);
//         var objects = new Array();
//         for (var j = 0; j < result.length; j++) {
//             switch (result[j]) {
//                 case "green":
//                     objects[j] = {
//                         'color': "-683px -27px"
//                     };
//                     break;
//                 case "red":
//                     objects[j] = {
//                         'color': "-683px -45px"
//                     };
//                     break;
//                 default:
//                     console.log("oops");
//             }
//         }
//         return objects;
//     },
//     fightArenas: function() {
//         var objects = new Array();
//         var cursorFightArenas = FightArenas.find({}, {
//             sort: {
//                 fight: 1
//             }
//         }).fetch();
//         for (var i = 0; i < cursorFightArenas.length; i++) {
//             var obj0 = {};
//             obj0['fight'] = cursorFightArenas[i].fight;
//             switch (cursorFightArenas[i].color) {
//                 case "green":
//                     obj0['color'] = "-2678px 0px";
//                     obj0['colorCost'] = "-1725px 0px";
//                     break;
//                 case "red":
//                     obj0['color'] = "-2678px -50px";
//                     obj0['colorCost'] = "-1725px -25px";
//                     break;
//                 default:
//                     console.log("oops");
//             }
//             obj0['cost'] = cursorFightArenas[i].cost;
//             obj0['value'] = cursorFightArenas[i].value + "XP";
//             obj0['time'] = cursorFightArenas[i].time;
//             objects[i] = obj0;
//         }
//         return objects;
//     }
// });

// Template.battlefieldOwner.events({
//     'click .item': function(e, t) {
//         var currentUser = Template.instance().state.get('self')[0];
//         var amountSupSlots = Template.instance().state.get('amountSupSlots');
//         var cursorPlayerDataBattlefield = playerData.findOne({
//             user: currentUser
//         }).battlefield;
//         $("#buyMenuWrapper").show(0, function() {
//             $("#background_fade").fadeIn();
//         });
//         Session.set("clickedFight", e.currentTarget.id);
//         switch (e.currentTarget.id.substring(0, 2)) {
//             case "01":
//                 $("#buyMenuItem").css({
//                     backgroundPosition: "-220px 0px"
//                 });
//                 $("#matterImg").css({
//                     backgroundPosition: "-1725px 0px"
//                 });
//                 break;
//             case "02":
//                 $("#buyMenuItem").css({
//                     backgroundPosition: "-220px -100px"
//                 });
//                 $("#matterImg").css({
//                     backgroundPosition: "-1725px -50px"
//                 });
//                 break;
//             default:
//                 console.log("oops");
//         };
//         $('#item').text("XP: " + this.value);
//         range_slider("Buy_Menu", cursorPlayerDataBattlefield.minControl, cursorPlayerDataBattlefield.maxControl, cursorPlayerDataBattlefield.minControl, cursorPlayerDataBattlefield.maxControl);
//         $('#time').text("Time: " + msToTime(this.time));
//         $('#price').text("Price: " + this.cost);

//         $("#range_slider_Buy_Menu").children('.ui-slider-handle').css("display", "block");

//         if ($('#AmountScroungerSlots').children()) {
//             $('#AmountScroungerSlots').children().remove();
//         }

//         for (var i = 0; i < 6; i++) {

//             if (amountSupSlots > i) {

//                 $('#AmountScroungerSlots').append("<div class='sslots_available sshr'> </div>");

//             } else {

//                 $('#AmountScroungerSlots').append("<div class='sslots_unavailable sshr'> </div>");

//             }
//         }
//     }
// });

// ///// BATTLEFIELDENEMY /////
// Template.battlefieldEnemy.onCreated(function() {

//     //console.time('createBattlefieldScrounge');
//     var inst = this;
//     inst.state = new ReactiveDict();
//     var cursorSelf = Meteor.users.findOne({
//         _id: Meteor.userId()
//     }, {
//         fields: {
//             username: 1,
//             cu: 1
//         }
//     });
//     var currentUser = cursorSelf.cu;
//     var self = cursorSelf.username;
//     var users = [currentUser, self];

//     inst.autorun(function() {

//         var subsPlayerDataBattlefield = inst.subscribe('playerDataBattlefield', users);
//         var color = 'green';
//         var subsFightArenas = inst.subscribe('FightArenas', color);

//         if (subsPlayerDataBattlefield.ready() && subsFightArenas.ready()) {
//             var cursorPlayerDataBattlefieldSelf = playerData.findOne({
//                 user: self
//             }, {
//                 fields: {
//                     battlefield: 1
//                 }
//             }).battlefield;
//             var cursorPlayerDataBattlefieldCu = playerData.findOne({
//                 user: currentUser
//             }, {
//                 fields: {
//                     battlefield: 1
//                 }
//             }).battlefield;

//             //data from active player
//             var namesScroungedUsers = [];
//             var amountScrSlots = cursorPlayerDataBattlefieldSelf.amountScrSlots;
//             var ownEpic = cursorPlayerDataBattlefieldSelf.scrItem.benefit;

//             //data from looked at player
//             var inputs = [];
//             var stamps = [];
//             var supNames = [];
//             var supEpicness = [];
//             var supStamps = [];
//             var supLevels = [];
//             var amountSupSlots = cursorPlayerDataBattlefieldCu.amountSupSlots;
//             var amountOwnSlots = cursorPlayerDataBattlefieldCu.amountOwnSlots;
//             var fightArenasValues = [];
//             var fightArenasColors = [];
//             var fightArenasTimes = [];

//             for (i = 0; i < amountScrSlots; i++) {
//                 namesScroungedUsers[i] = cursorPlayerDataBattlefieldSelf.scrSlots['scrs' + i].victim.name;
//             };

//             for (var i = 0; i < amountOwnSlots; i++) {
//                 inputs[i] = cursorPlayerDataBattlefieldCu.ownSlots['owns' + i].input;
//                 //falls der slot benutzt ist                                      
//                 if (inputs[i] > 0) {
//                     cursorFightArena = FightArenas.findOne({
//                         fight: inputs[i]
//                     });
//                     fightArenasValues[i] = cursorFightArena.value;
//                     fightArenasColors[i] = cursorFightArena.color;
//                     fightArenasTimes[i] = cursorFightArena.time;
//                 }
//                 stamps[i] = cursorPlayerDataBattlefieldCu.ownSlots['owns' + i].stamp;

//                 //Iterate Supporter
//                 var supNamesOneSlot = [];
//                 var supStampsOneSlot = [];
//                 var supEpicnessOneSlot = [];
//                 var supLevelsOneSlot = [];
//                 for (var k = 0; k < amountSupSlots; k++) {
//                     supNamesOneSlot[k] = cursorPlayerDataBattlefieldCu.ownSlots['owns' + i]['sup' + k].name;
//                     supStampsOneSlot[k] = cursorPlayerDataBattlefieldCu.ownSlots['owns' + i]['sup' + k].stamp;
//                     supEpicnessOneSlot[k] = cursorPlayerDataBattlefieldCu.ownSlots['owns' + i]['sup' + k].benefit;
//                     supLevelsOneSlot[k] = cursorPlayerDataBattlefieldCu.ownSlots['owns' + i]['sup' + k].level;
//                 }
//                 supNames[i] = supNamesOneSlot;
//                 supStamps[i] = supStampsOneSlot;
//                 supEpicness[i] = supEpicnessOneSlot;
//                 supLevels[i] = supLevelsOneSlot;
//             }

//             //set Data Context for other helpers
//             inst.state.set('self', users);
//             inst.state.set('ownEpic', ownEpic);
//             inst.state.set('victimsB', namesScroungedUsers);
//             //muss als Battlefield angehörig gekennzeichnet werden, da die Variable in einer gemeinsamen
//             //Funktion vom Template WorldMap sonst mit anderen Templates überschneidet
//             //(worldmap.events)
//             inst.state.set('amountScrSlotsB', amountScrSlots);
//             inst.state.set('amountSupSlots', amountSupSlots);
//             inst.state.set('amountOwnSlots', amountOwnSlots);
//             inst.state.set('fightIds', inputs);
//             inst.state.set('supLevels', supLevels);
//             inst.state.set('timeStamps', stamps);
//             inst.state.set('supporters', supNames);
//             inst.state.set('supTimeStamps', supStamps);
//             inst.state.set('supEpics', supEpicness);
//             inst.state.set('fightArenasValues', fightArenasValues);
//             inst.state.set('fightArenasColors', fightArenasColors);
//             inst.state.set('fightArenasTimes', fightArenasTimes);
//             //console.timeEnd('createBattlefieldScrounge');
//         }
//     })
// });

// Template.battlefieldEnemy.helpers({
//     battlefieldSupporterSlots: function() {
//         //Battlefield
//         //get Data Context
//         var self = Template.instance().state.get('self')[1];
//         var currentUser = Template.instance().state.get('self')[0];
//         var ownEpic = Template.instance().state.get('ownEpic');
//         var amountSupSlots = Template.instance().state.get('amountSupSlots');
//         var amountOwnSlots = Template.instance().state.get('amountOwnSlots');
//         var supLevels = Template.instance().state.get('supLevels');
//         var fightIds = Template.instance().state.get('fightIds');
//         var supporters = Template.instance().state.get('supporters');
//         var timeStamps = Template.instance().state.get('timeStamps');
//         var supTimeStamps = Template.instance().state.get('supTimeStamps');
//         var supEpics = Template.instance().state.get('supEpics');
//         var fightArenasValues = Template.instance().state.get('fightArenasValues');
//         var fightArenasColors = Template.instance().state.get('fightArenasColors');
//         var fightArenasTimes = Template.instance().state.get('fightArenasTimes');
//         var objects = new Array();

//         var calculatedServerTime = TimeSync.serverTime(Date.now());
//         //Iterate OwnSlots
//         for (var i = 0; i < amountOwnSlots; i++) {
//             if (fightIds[i] > 0) {
//                 var amountUsedSupSlots = 0
//                 var obj0 = {};

//                 var supEpicsAdded = 0;

//                 var supSlotsMemory = new Array();
//                 //Iterate Supporter
//                 for (var k = 0; k < amountSupSlots; k++) {
//                     //SupSlot used?
//                     if (supporters[i] != "") {
//                         if (supporters[i][k] != "") {
//                             amountUsedSupSlots++;
//                             var obj00 = {};
//                             var supTime = supTimeStamps[i][k];

//                             obj00['timeSpentId'] = 'timerInc_' + i + k + '_battlefield_sup';
//                             var obj01 = {};
//                             obj01['id'] = obj00['timeSpentId'];
//                             obj01['miliseconds'] = calculatedServerTime - supTime;
//                             obj01['notFound'] = 0;
//                             obj01['prefix'] = 1;
//                             GV_timers.push(obj01);
//                             obj00['timeSpent'] = msToTime(obj01['miliseconds']);

//                             var supEpic = supEpics[i][k];
//                             supEpicsAdded = supEpicsAdded + supEpic;

//                             obj00['epicness'] = supEpic + '%';
//                             obj00['level'] = supLevels[i];
//                             obj00['supName'] = supporters[i][k];
//                             supSlotsMemory[k] = obj00;
//                         }
//                     }
//                 }
//                 //Diese Switch-Anweisung existiert nur, um den Sprite Sheets gerecht zu werden
//                 //Es wird geprüft, um welchen Farbcode es sich handelt, dieser wird dann in die background-position im Sprite Sheet übersetzt
//                 //Im HTML wird der Wert entsprechend für die background-position eingesetzt
//                 //Diese "Übersetzung" ist notwendig, da der Farbcode an verschiedenen Stellen abgefragt wird und jeweils eine andere 
//                 //background-position nötig ist. (Unterschiedlich große images)
//                 switch (fightArenasColors[i]) {
//                     case "green":
//                         obj0['color'] = "-216px 0px";
//                         break;
//                     case "red":
//                         obj0['color'] = "-0px -0px";
//                         break;
//                     default:
//                         console.log("no color defined for fight arena");
//                 }
//                 obj0['slots'] = amountUsedSupSlots + '/' + amountSupSlots;
//                 obj0['slotsChange'] = (amountUsedSupSlots + 1) + '/' + amountSupSlots;
//                 obj0['xp'] = Math.floor((fightArenasValues[i] * (100 + supEpicsAdded)) / 100) + '(' + Math.floor(100 + supEpicsAdded) + '%)';
//                 obj0['xpChange'] = Math.floor((fightArenasValues[i] * (100 + supEpicsAdded + ownEpic)) / 100) + '(' + Math.floor(100 + supEpicsAdded) + '%)';
//                 obj0['timeSpentId'] = 'timerInc_' + i + '_battlefield';

//                 var obj2 = {};
//                 obj2['id'] = obj0['timeSpentId'];
//                 obj2['miliseconds'] = calculatedServerTime - timeStamps[i];
//                 obj2['notFound'] = 0;
//                 obj2['prefix'] = 1;
//                 GV_timers.push(obj2);
//                 obj0['timeSpent'] = msToTime(calculatedServerTime) - timeStamps[i];
//                 obj0['timeOverall'] = '/' + msToTime(fightArenasTimes[i]) + '(' + Math.floor((obj2['miliseconds'] / fightArenasTimes[i]) * 100) + '%)';

//                 obj0['epicness'] = supEpicsAdded + '%';
//                 obj0['epicnessChange'] = (supEpicsAdded + ownEpic) + '%';

//                 //Make Slot scroungeable
//                 obj0['goScrounging'] = 'goScroungingBattlefield_' + i;

//                 obj0['index'] = i;
//                 obj0['supporter'] = supSlotsMemory;
//                 var lockCheck = checkScroungeBattlefield(i, self, currentUser);
//                 obj0['lockedMsg'] = lockCheck;
//                 if (lockCheck != false) lockCheck = true
//                 obj0['locked'] = lockCheck;
//                 objects[i] = obj0;
//             }
//         }
//         return objects;
//     }
// });

// Template.battlefieldEnemy.events({
//     'click .scroungable': function(e, t) {

//         /*AN GRAFIK ANGEPASSTE VERSION VON J.P.*/

//         if ($(e.currentTarget).next(".scroungable_advanced").height() == 0) {
//             $(e.currentTarget).next(".scroungable_advanced").animate({
//                 "height": "100%"
//             }, 0);
//             var height = $(e.currentTarget).next(".scroungable_advanced").height() + 13 + "px";
//             $(e.currentTarget).next(".scroungable_advanced").filter(':not(:animated)').animate({
//                 "height": "0px"
//             }, 0, function() {

//                 $(e.currentTarget).next(".scroungable_advanced").filter(':not(:animated)').animate({
//                     "margin-top": "-13px"
//                 }, 150, function() {

//                     $(e.currentTarget).next(".scroungable_advanced").filter(':not(:animated)').animate({
//                         "height": height
//                     }, 1000);

//                 });
//             });

//         } else {
//             $(e.currentTarget).next(".scroungable_advanced").animate({
//                 "height": "0px",
//             }, 1000);
//             $(e.currentTarget).next(".scroungable_advanced").animate({
//                 "margin-top": "0px"
//             }, 150);
//         }
//     },

//     'click .goScroungingBattlefield': function(e, t) {
//         var slotId = e.currentTarget.id.split("_").pop();
//         Meteor.call('goScroungingBattlefield', slotId, function(err, result) {
//             if (err) {
//                 console.log('goScroungingBattlefield: ' + err);
//             }
//             if (result) {
//                 infoLog(result);
//                 showInfoTextAnimation(result);
//             }
//         });
//     }
// });
// OLD OLD 2016/01/03 OLD OLD
