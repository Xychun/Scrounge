//////////////////
////// MINE //////
//////////////////

///// MINEOWNER /////    
Template.mineOwner.onCreated(function() {
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

        var subsPlayerDataMine = inst.subscribe('playerDataMine', self);
        var subsMatterBlocks = inst.subscribe('MatterBlocks', color);
        var subsMineBase = inst.subscribe('mineBase', currentUser);
        var subsMineSupport = inst.subscribe('mineSupport', currentUser);
        var subsMineScrounge = inst.subscribe('mineScrounge', currentUser);

        if (subsPlayerDataMine.ready()) {
            var cursorPlayerDataMine = playerData.findOne({
                user: self
            }, {
                fields: {
                    mine: 1
                }
            });
            var amountSupSlots = cursorPlayerDataMine.mine.amountSupSlots;
            inst.state.set('amountSupSlots', amountSupSlots);
        }
        inst.state.set('currentUser', currentUser);
    })
});


Template.mineOwner.helpers({
    mineBaseUnused: function() {
        return mineBase.find({
            user: Template.instance().state.get('currentUser'),
            input: "0000"
        });
    },

    mineBaseUsed: function() {
        return mineBase.find({
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

    mineScroungeUnused: function() {
        return mineScrounge.find({
            user: Template.instance().state.get('currentUser'),
            input: "0000"
        });
    },

    mineScroungeUsed: function() {
        return mineScrounge.find({
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
        return mineSupport.find({
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

    progress: function() {
        var ownerProgress = (TimeSync.serverTime(Date.now() - this.timeStart)) * (7.5 / 3600000);
        var suppsProgress = 0;
        var arrayMineSupport = mineSupport.find({
            user: Template.instance().state.get('currentUser'),
            refID: this.slotID,
            supporter: {
                $nin: [null, ""]
            }
        }).fetch();
        for (i = 0; i < arrayMineSupport.length; i++) {
            suppsProgress = suppsProgress + (TimeSync.serverTime(Date.now() - arrayMineSupport[i].timeStart)) * (arrayMineSupport[i].benefit / 3600000);
        }
        return Math.floor(ownerProgress + suppsProgress);
    },

    percentageProgress: function() {
        var progress1 = 0;
        var ownerProgress = (TimeSync.serverTime(Date.now() - this.timeStart)) * (7.5 / 3600000);
        var suppsProgress = 0;
        var arrayMineSupport = mineSupport.find({
            user: Template.instance().state.get('currentUser'),
            refID: this.slotID,
            supporter: {
                $nin: [null, ""]
            }
        }).fetch();
        for (i = 0; i < arrayMineSupport.length; i++) {
            suppsProgress = suppsProgress + (TimeSync.serverTime(Date.now() - arrayMineSupport[i].timeStart)) * (arrayMineSupport[i].benefit / 3600000);
        }
        progress1 = ownerProgress + suppsProgress;
        return Math.floor(((progress1) / this.progress2) * 100);
    },

    imagePosition: function() {
        return mineCTBP(this.input.substring(0, 2));
    },

    remainingTimeFormat: function() {
        return msToTime(this.remaining);
    },

    // remainingId: function(appendix) {
    //     var result = 'timerDec_' + this.slotID + '_mine_' + appendix;
    //     var obj0 = {};
    //     obj0['id'] = result;
    //     obj0['miliseconds'] = this.remaining;
    //     obj0['notFound'] = 0;
    //     obj0['prefix'] = -1;
    //     GV_timers.push(obj0);
    //     return result;
    // },

    timeSpentTimeFormat: function() {
        return msToTime(TimeSync.serverTime(Date.now() - this.timeStart));
    },

    // timeSpentId: function(appendix) {
    //     var result = 'timerInc_' + this.slotID + '_mine_' + appendix;
    //     var obj0 = {};
    //     obj0['id'] = result;
    //     obj0['miliseconds'] = TimeSync.serverTime(Date.now() - this.timeStart);
    //     obj0['notFound'] = 0;
    //     obj0['prefix'] = 1;
    //     GV_timers.push(obj0);
    //     return result;
    // },

    mined: function() {
        //TO-DO: Get item value
        return Math.floor(TimeSync.serverTime((Date.now() - this.timeStart)) * (5 / 3600000));
    },

    profit: function(status) {
        if (status == "base") {
            var profit = split("mine", status, this.user, this.user, this.slotID);
        } else if (status == "scrounge") {
            var profit = split("mine", status, this.victim, this.user, this.refID);
        }
        var percent = Math.floor((profit / this.splitValue) * 100);
        return profit + '/' + this.splitValue + '(' + percent + '%)';
    },

    // OLD OLD 2015/11/21 OLD OLD
    // ...
    // Template.mineBase.onCreated(function() {

    //     // console.log('createMineBaseStart');
    //     //console.time('createMineBase');
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

    //         var subsPlayerDataMine = inst.subscribe('playerDataMine', users);
    //          var color = 'green';
    //          var subsMatterBlocks = inst.subscribe('MatterBlocks', color);

    //         if (subsPlayerDataMine.ready() && subsMatterBlocks.ready()) {
    //             var cursorPlayerDataMine = playerData.findOne({
    //                 user: self
    //             }, {
    //                 fields: {
    //                     mine: 1
    //                 }
    //             }).mine;

    //             //Get data from all own slots
    //             var inputs = [];
    //             var stampsSlotsLeft = [];
    //             var supStamps = [];
    //             var supMiningrates = [];
    //             var supNames = [];
    //             var matterBlocksValues = [];
    //             var matterBlocksColors = [];

    //             var amountOwnSlots = cursorPlayerDataMine.amountOwnSlots;
    //             var amountSupSlots = cursorPlayerDataMine.amountSupSlots;
    //             var ownRate = cursorPlayerDataMine.scrItem.benefit;

    //             for (i = 0; i < amountOwnSlots; i++) {
    //                 inputs[i] = cursorPlayerDataMine.ownSlots['owns' + i].input;
    //                 //falls der slot benutzt ist
    //                 if (inputs[i] > 0) {
    //                     var cursorMatterBlock = MatterBlocks.findOne({
    //                         matter: inputs[i]
    //                     })
    //                     matterBlocksValues[i] = cursorMatterBlock.value;
    //                     matterBlocksColors[i] = cursorMatterBlock.color;
    //                 }
    //                 stampsSlotsLeft[i] = cursorPlayerDataMine.ownSlots['owns' + i].stamp;

    //                 var supStampsOneSlot = [];
    //                 var supMiningratesOneSlot = [];
    //                 var supNamesOneSlot = [];
    //                 for (k = 0; k < amountSupSlots; k++) {
    //                     supStampsOneSlot[k] = cursorPlayerDataMine.ownSlots['owns' + i]['sup' + k].stamp;
    //                     supMiningratesOneSlot[k] = cursorPlayerDataMine.ownSlots['owns' + i]['sup' + k].benefit;
    //                     supNamesOneSlot[k] = cursorPlayerDataMine.ownSlots['owns' + i]['sup' + k].name;
    //                 }
    //                 supStamps[i] = supStampsOneSlot;
    //                 supMiningrates[i] = supMiningratesOneSlot;
    //                 supNames[i] = supNamesOneSlot;
    //             }

    //             //Get data from all scrounge slots
    //             var dataScrSlots = {};
    //             var stampsSlotsRight = [];
    //             var ownMiningrates = [];
    //             var matterBlocksValuesScrounge = [];
    //             var matterBlocksColorsScrounge = [];
    //             var stampsScroungedUsers = [];
    //             var inputsScroungedUsers = [];
    //             var namesScroungedUsers = [];
    //             var supsVictimsStamps = [];
    //             var supsVictimsRates = [];
    //             var amountVictimsSupSlots = [];

    //             var amountScrSlots = cursorPlayerDataMine.amountScrSlots;

    //             for (i = 0; i < amountScrSlots; i++) {
    //                 ownMiningrates[i] = cursorPlayerDataMine.scrSlots['scrs' + i].benefit;
    //                 stampsSlotsRight[i] = cursorPlayerDataMine.scrSlots['scrs' + i].stamp;
    //                 stampsScroungedUsers[i] = cursorPlayerDataMine.scrSlots['scrs' + i].victim.stamp;
    //                 inputsScroungedUsers[i] = cursorPlayerDataMine.scrSlots['scrs' + i].victim.input;
    //                 namesScroungedUsers[i] = cursorPlayerDataMine.scrSlots['scrs' + i].victim.name;
    //                 //falls der slot benutzt ist
    //                 if (inputsScroungedUsers[i] > 0) {
    //                     var cursorMatterBlock = MatterBlocks.findOne({
    //                         matter: inputsScroungedUsers[i]
    //                     })
    //                     matterBlocksValuesScrounge[i] = cursorMatterBlock.value;
    //                     matterBlocksColorsScrounge[i] = cursorMatterBlock.color;
    //                 }

    //                 var amountVictimSupSlots = cursorPlayerDataMine.scrSlots['scrs' + i].victim.supSlotsVictim;
    //                 amountVictimsSupSlots[i] = amountVictimSupSlots;

    //                 var supsVictimsStampsOneSlot = [];
    //                 var supsVictimsRatesOneSlot = [];
    //                 for (k = 0; k < amountVictimSupSlots; k++) {
    //                     supsVictimsStampsOneSlot[k] = cursorPlayerDataMine.scrSlots['scrs' + i].victim['sup' + k].stamp;
    //                     supsVictimsRatesOneSlot[k] = cursorPlayerDataMine.scrSlots['scrs' + i].victim['sup' + k].benefit;
    //                 }
    //                 supsVictimsStamps[i] = supsVictimsStampsOneSlot;
    //                 supsVictimsRates[i] = supsVictimsRatesOneSlot;
    //             }
    //             //set Data Context for other helpers         

    //             //allgemeine Daten
    //             inst.state.set('self', users);
    //             inst.state.set('amountScrSlots', amountScrSlots);
    //             inst.state.set('amountSupSlots', amountSupSlots);
    //             inst.state.set('amountOwnSlots', amountOwnSlots);
    //             inst.state.set('ownRate', ownRate);

    //             //für linke Seite benötigt
    //             inst.state.set('matterIds', inputs);
    //             inst.state.set('timeStamps', stampsSlotsLeft);
    //             inst.state.set('supTimeStamps', supStamps);
    //             inst.state.set('supRates', supMiningrates);
    //             inst.state.set('supporters', supNames);
    //             inst.state.set('matterBlocksValues', matterBlocksValues);
    //             inst.state.set('matterBlocksColors', matterBlocksColors);

    //             //für rechte Seite benötigt
    //             inst.state.set('ownTimeStamps', stampsSlotsRight);
    //             inst.state.set('victims', namesScroungedUsers);
    //             inst.state.set('victimsSupSlots', amountVictimsSupSlots);
    //             inst.state.set('timeStampsScrounge', stampsScroungedUsers);
    //             inst.state.set('supRatesScrounge', supsVictimsRates);
    //             inst.state.set('supTimeStampsScrounge', supsVictimsStamps);
    //             inst.state.set('matterBlocksColorsScrounge', matterBlocksColorsScrounge);
    //             inst.state.set('matterBlocksValuesScrounge', matterBlocksValuesScrounge);
    //             //console.timeEnd('createMineBase');
    //             //console.timeEnd("LOGINMB");

    //             // console.log('mineBaseDict');
    //             // console.log(inst.state);
    //         }
    //     })
    // });

    // mineUnusedSlots: function() {

    //     // Mine
    //     //get fields from data context
    //     var name = Template.instance().state.get('self');
    //     var amountOwnSlots = Template.instance().state.get('amountOwnSlots');
    //     var matterIds = Template.instance().state.get('matterIds');
    //     var objects = new Array();
    //     var amountObjects = 0;

    //     for (var i = 0; i < amountOwnSlots; i++) {
    //         if (matterIds[i] == "0000") {
    //             amountObjects++;
    //         }
    //     }
    //     for (var j = 0; j < amountObjects; j++) {
    //         objects[j] = {};
    //     }
    //     //console.timeEnd("LOGINHELPER1");
    //     // console.log('objects mineUnused', objects);
    //     return objects;
    // },
    // mineUsedSlots: function() {
    //     /*Mine*/
    //     //get fields from data context
    //     var name = Template.instance().state.get('self');
    //     var amountOwnSlots = Template.instance().state.get('amountOwnSlots');
    //     var amountSupSlots = Template.instance().state.get('amountSupSlots');
    //     var matterIds = Template.instance().state.get('matterIds');
    //     var matterBlocksValues = Template.instance().state.get('matterBlocksValues');
    //     var matterBlocksColors = Template.instance().state.get('matterBlocksColors');
    //     var timeStamps = Template.instance().state.get('timeStamps');
    //     var supporters = Template.instance().state.get('supporters');
    //     var supTimeStamps = Template.instance().state.get('supTimeStamps');
    //     var supRates = Template.instance().state.get('supRates');
    //     var objects = new Array();

    //     var calculatedServerTime = TimeSync.serverTime(Date.now());
    //     /*Iterate OwnSlots*/
    //     for (var i = 0; i < amountOwnSlots; i++) {
    //         //falls der slot benutzt ist (nicht 0000)
    //         if (matterIds[i] > 0) {
    //             //falls es keinen Supporter gibt > iteriere gar nicht
    //             // if(supporters[i] == undefined) {
    //             var amountUsedSupSlots = 0;
    //             var obj0 = {};

    //             var progressOwn = (calculatedServerTime - timeStamps[i]) * (7.5 / 3600000);
    //             var progressSups = 0;
    //             var supRatesAdded = 0;

    //             var supSlotsMemory = new Array();
    //             //Iterate Supporter
    //             for (var k = 0; k < amountSupSlots; k++) {
    //                 //SupSlot used?
    //                 if (supporters[i] != "") {
    //                     if (supporters[i][k] != "") {
    //                         amountUsedSupSlots++;
    //                         var obj00 = {};
    //                         var supTime = supTimeStamps[i][k];

    //                         obj00['timeSpentId'] = 'timerInc_' + i + k + '_mine_sup';
    //                         var obj01 = {};
    //                         obj01['id'] = obj00['timeSpentId'];
    //                         obj01['miliseconds'] = (calculatedServerTime - supTime);
    //                         obj01['notFound'] = 0;
    //                         obj01['prefix'] = 1;
    //                         GV_timers.push(obj01);
    //                         obj00['timeSpent'] = msToTime(obj01['miliseconds']);

    //                         var supRate = supRates[i][k];
    //                         supRatesAdded = supRatesAdded + supRate;
    //                         progressSups = progressSups + (calculatedServerTime - supTime) * (supRate / 3600000);
    //                         obj00['mined'] = Math.floor((calculatedServerTime - supTime) * (supRate / 3600000));
    //                         obj00['miningrate'] = supRate + '/hr';
    //                         obj00['supName'] = supporters[i][k];
    //                         supSlotsMemory[k] = obj00;
    //                     }
    //                 }
    //             }

    //             var progressTotal = progressOwn + progressSups;
    //             obj0['value'] = Math.floor(progressTotal) + '/' + matterBlocksValues[i] + '(' + Math.floor((Math.floor(progressTotal) / matterBlocksValues[i]) * 100) + '%)';
    //             //Diese Switch-Anweisung existiert nur, um den Sprite Sheets gerecht zu werden
    //             //Es wird geprüft, um welchen Farbcode es sich handelt, dieser wird dann in die background-position im Sprite Sheet übersetzt
    //             //Im HTML wird der Wert entsprechend für die background-position eingesetzt
    //             //Diese "Übersetzung" ist notwendig, da der Farbcode an verschiedenen Stellen abgefragt wird und jeweils eine andere 
    //             //background-position nötig ist. (Unterschiedlich große images)
    //             switch (matterBlocksColors[i]) {
    //                 case "green":
    //                     obj0['color'] = "-550px 0px";
    //                     break;
    //                 case "red":
    //                     obj0['color'] = "-550px -100px";
    //                     break;
    //                 default:
    //                     console.log("no matterBlock color defined");
    //             }
    //             //if else funktioniert identisch wie obiges aber da viele Farben geplant sind, ist ein switch case eleganter
    //             /*if(cursorMatterBlock.color == "green") {obj0['color'] = "-550px 0px";}*/
    //             //vorherige Lösung
    //             /*obj0['color'] = cursorMatterBlock.color;*/
    //             obj0['slots'] = amountUsedSupSlots + '/' + amountSupSlots;
    //             obj0['remainingId'] = 'timerDec_' + i + '_mine';
    //             obj0['timeSpentId'] = 'timerInc_' + i + '_mine';

    //             var obj1 = {};
    //             obj1['id'] = obj0['remainingId'];
    //             obj1['miliseconds'] = ((matterBlocksValues[i] - progressTotal) / ((7.5 + supRatesAdded) / 3600000));
    //             obj1['notFound'] = 0;
    //             obj1['prefix'] = -1;
    //             GV_timers.push(obj1);
    //             obj0['remaining'] = msToTime((parseInt(matterBlocksValues[i]) - progressTotal) / ((7.5 + supRatesAdded) / 3600000));

    //             var obj2 = {};
    //             obj2['id'] = obj0['timeSpentId'];
    //             obj2['miliseconds'] = (calculatedServerTime - timeStamps[i]);
    //             obj2['notFound'] = 0;
    //             obj2['prefix'] = 1;
    //             GV_timers.push(obj2);
    //             obj0['timeSpent'] = msToTime((calculatedServerTime - timeStamps[i]));

    //             if (amountUsedSupSlots == 0) {
    //                 obj0['profit'] = Math.floor(matterBlocksValues[i]) + '(100%)';
    //             } else {
    //                 obj0['profit'] = Math.floor(0.5 * matterBlocksValues[i]) + '(50%)';
    //             }
    //             obj0['miningrate'] = (7.5 + supRatesAdded) + '/hr';

    //             obj0['supporter'] = supSlotsMemory;

    //             //für den range slider
    //             obj0['slot'] = i;

    //             objects[i] = obj0;
    //         }
    //     }
    //     //console.timeEnd("LOGINHELPER2");
    //     // console.log('objects mineUsed', objects);
    //     return objects;
    // },

    // mineUnusedScroungeSlots: function() {
    //     //Mine Scrounging
    //     //get fields from data context
    //     var name = Template.instance().state.get('self');
    //     var victims = Template.instance().state.get('victims');
    //     var amountScrSlots = Template.instance().state.get('amountScrSlots');
    //     var objects = new Array();

    //     for (var i = 0; i < amountScrSlots; i++) {
    //         if (victims[i] == "") objects[i] = {};
    //     }
    //     //console.timeEnd("LOGINHELPER3");
    //     return objects;
    // },

    // mineUsedScroungeSlots: function() {
    //     //Mine Scrounging
    //     //get fields from data context
    //     var name = Template.instance().state.get('self')[0];
    //     var ownRate = Template.instance().state.get('ownRate');
    //     var ownTimeStamps = Template.instance().state.get('ownTimeStamps');
    //     var amountScrSlots = Template.instance().state.get('amountScrSlots');
    //     var victimsSupSlots = Template.instance().state.get('victimsSupSlots');
    //     var victims = Template.instance().state.get('victims');
    //     var timeStampsScrounge = Template.instance().state.get('timeStampsScrounge');
    //     var supRatesScrounge = Template.instance().state.get('supRatesScrounge');
    //     var supTimeStampsScrounge = Template.instance().state.get('supTimeStampsScrounge');
    //     var matterBlocksColorsScrounge = Template.instance().state.get('matterBlocksColorsScrounge');
    //     var matterBlocksValuesScrounge = Template.instance().state.get('matterBlocksValuesScrounge');

    //     var calculatedServerTime = TimeSync.serverTime(Date.now());
    //     var objects = new Array();

    //     //Iterate all Scrounging Slots (i = scrounge slots)
    //     for (var i = 0; i < amountScrSlots; i++) {
    //         //Is used?
    //         if (victims[i] != "") {
    //             var progressOwn = (calculatedServerTime - timeStampsScrounge[i]) * (7.5 / 3600000);
    //             var progressSups = 0;
    //             var supRatesScroungeAdded = 0;
    //             var amountUsedSupSlots = 0;
    //             //Iterate Supporter (l = supporter slot)
    //             for (var l = 0; l < victimsSupSlots[i]; l++) {
    //                 //Falls ein Supporter vorhanden ist, verwende dessen supRate und Zeitstempel
    //                 //scr slot überhaupt benutzt?
    //                 if (supTimeStampsScrounge[i] != "") {
    //                     //welcher/wieviele supporter slots des scr slots sind besetzt
    //                     if (supTimeStampsScrounge[i][l] != "") {
    //                         amountUsedSupSlots++;
    //                         var supTime = supTimeStampsScrounge[i][l];
    //                         var supRate = supRatesScrounge[i][l];
    //                         supRatesScroungeAdded = supRatesScroungeAdded + supRate;
    //                         progressSups = progressSups + (calculatedServerTime - supTime) * (supRate / 3600000);
    //                     }
    //                 }
    //             }
    //             var obj0 = {};
    //             var progressTotal = progressOwn + progressSups;
    //             //Diese Switch-Anweisung existiert nur, um den Sprite Sheets gerecht zu werden
    //             //Es wird geprüft, um welchen Farbcode es sich handelt, dieser wird dann in die background-position im Sprite Sheet übersetzt
    //             //Im HTML wird der Wert entsprechend für die background-position eingesetzt
    //             //Diese "Übersetzung" ist notwendig, da der Farbcode an verschiedenen Stellen abgefragt wird und jeweils eine andere 
    //             //background-position nötig ist. (Unterschiedlich große images)
    //             //switch(cursorMatterBlock.color) {
    //             switch (matterBlocksColorsScrounge[i]) {
    //                 case "green":
    //                     obj0['color'] = "-550px 0px";
    //                     break;
    //                 case "red":
    //                     obj0['color'] = "-550px -100px";
    //                     break;
    //                 default:
    //                     console.log("mineUsedScroungeSlots oops");
    //             }
    //             //if else funktioniert identisch wie obiges aber da viele Farben geplant sind, ist ein switch case eleganter
    //             /*if(cursorMatterBlock.color == "green") {obj0['color'] = "-550px 0px";}*/
    //             //vorherige Lösung
    //             /*obj0['color'] = cursorMatterBlock.color;*/
    //             obj0['victim'] = victims[i];
    //             obj0['slots'] = amountUsedSupSlots + '/' + victimsSupSlots[i];
    //             obj0['remainingId'] = 'timerDec_' + i + '_mine_scr';
    //             obj0['timeSpentId'] = 'timerInc_' + i + '_mine_scr';

    //             var obj1 = {};
    //             obj1['id'] = obj0['remainingId'];
    //             obj1['miliseconds'] = ((matterBlocksValuesScrounge[i] - progressTotal) / ((7.5 + supRatesScroungeAdded) / 3600000));
    //             obj1['notFound'] = 0;
    //             obj1['prefix'] = -1;
    //             GV_timers.push(obj1);
    //             obj0['remaining'] = msToTime((matterBlocksValuesScrounge[i] - progressTotal) / ((7.5 + supRatesScroungeAdded) / 3600000));

    //             var obj2 = {};
    //             obj2['id'] = obj0['timeSpentId'];
    //             obj2['miliseconds'] = (calculatedServerTime - ownTimeStamps[i]);
    //             obj2['notFound'] = 0;
    //             obj2['prefix'] = 1;
    //             GV_timers.push(obj2);
    //             obj0['timeSpent'] = msToTime((calculatedServerTime - ownTimeStamps[i]));

    //             obj0['profit'] = Math.floor((0.5 / amountUsedSupSlots) * matterBlocksValuesScrounge[i]) + '(' + (0.5 / amountUsedSupSlots) * 100 + '%)';
    //             obj0['miningrate'] = ownRate + '/hr';
    //             obj0['mined'] = Math.floor((calculatedServerTime - supTime) * (ownRate / 3600000));
    //             obj0['slider_id'] = i + 6;
    //             objects[i] = obj0;
    //         }
    //     }
    //     //console.timeEnd("LOGINHELPER4");
    //     return objects;
    // },
    // ...
    // OLD OLD 2015/11/21 OLD OLD

    blockColors: function() {
        var cursorMatterColors = MatterBlocks.find({}, {
            fields: {
                'color': 1
            }
        }).fetch();
        var colorArray = new Array();
        for (var i = 0; i < cursorMatterColors.length; i++) {
            colorArray[i] = cursorMatterColors[i].color;
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

    matterBlocks: function() {
        var objects = new Array();
        var cursorMatterBlocks = MatterBlocks.find({}, {
            sort: {
                matter: 1
            }
        }).fetch();
        for (var i = 0; i < cursorMatterBlocks.length; i++) {
            var obj0 = {};
            obj0['matter'] = cursorMatterBlocks[i].matter;
            switch (cursorMatterBlocks[i].color) {
                case "green":
                    obj0['color'] = "-1658px 2px";
                    obj0['colorCost'] = "-1725px 0px";
                    break;
                case "red":
                    obj0['color'] = "-1658px -50px";
                    obj0['colorCost'] = "-1725px -25px";
                    break;
                default:
                    console.log("oops");
            }
            obj0['cost'] = cursorMatterBlocks[i].cost;
            obj0['value'] = cursorMatterBlocks[i].value;
            objects[i] = obj0;
        }
        return objects;
    }
});

Template.mineOwner.events({
    'click .item': function(e, t) {
        var currentUser = Template.instance().state.get('currentUser');
        var amountSupSlots = Template.instance().state.get('amountSupSlots');
        var cursorPlayerDataMine = playerData.findOne({
            user: currentUser
        }).mine;
        $("#buyMenuWrapper").show(0, function() {
            $("#background_fade").fadeIn();
        });
        Session.set("clickedMatter", e.currentTarget.id);
        switch (e.currentTarget.id.substring(0, 2)) {
            case "01":
                $("#buyMenuItem").css({
                    backgroundPosition: "-550px 0px"
                });
                $("#matterImg").css({
                    backgroundPosition: "-1725px 0px"
                });
                break;
            case "02":
                $("#buyMenuItem").css({
                    backgroundPosition: "-550px -100px"
                });
                $("#matterImg").css({
                    backgroundPosition: "-1725px -50px"
                });
                break;
            default:
                console.log("oops");
        };
        $('#item').text("Matter: " + this.value);
        range_slider("Buy_Menu", cursorPlayerDataMine.minControl, cursorPlayerDataMine.maxControl, cursorPlayerDataMine.minControl, cursorPlayerDataMine.maxControl);
        $('#time').text("Time: " + msToTime(this.value / (7.5 / 3600000)));
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

///// MINEENEMY /////
Template.mineEnemy.onCreated(function() {
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

        var subsPlayerDataMineOwn = inst.subscribe('playerDataMine', self);
        var subsPlayerDataMineEnemy = inst.subscribe('playerDataMine', currentUser);
        var subsMineBase = inst.subscribe('mineBase', currentUser);
        var subsMineScrounge = inst.subscribe('mineScrounge', self);
        var subsMineSupport = inst.subscribe('mineSupport', currentUser);

        if (subsPlayerDataMineEnemy.ready()) {
            var cursorPlayerDataMineEnemy = playerData.findOne({
                user: currentUser
            }, {
                fields: {
                    mine: 1
                }
            });
            var amountSupSlots = cursorPlayerDataMineEnemy.mine.amountSupSlots;
            inst.state.set('amountSupSlots', amountSupSlots);
        }
        inst.state.set('currentUser', currentUser);
    })
    // OLD OLD 2015/12/05 OLD OLD
    // ...
    //console.time('createMineScrounge');
    // var inst = this;
    // inst.state = new ReactiveDict();
    // var cursorSelf = Meteor.users.findOne({
    //     _id: Meteor.userId()
    // }, {
    //     fields: {
    //         username: 1,
    //         cu: 1
    //     }
    // });
    // var currentUser = cursorSelf.cu;
    // var self = cursorSelf.username;
    // var users = [currentUser, self];

    // inst.autorun(function() {

    //     var subsPlayerDataMine = inst.subscribe('playerDataMine', users);
    //     var color = 'green';
    //     var subsMatterBlocks = inst.subscribe('MatterBlocks', color);

    //     if (subsPlayerDataMine.ready() && subsMatterBlocks.ready()) {
    //         var cursorPlayerDataMineSelf = playerData.findOne({
    //             user: self
    //         }, {
    //             fields: {
    //                 mine: 1
    //             }
    //         }).mine;
    //         var cursorPlayerDataMineCu = playerData.findOne({
    //             user: currentUser
    //         }, {
    //             fields: {
    //                 mine: 1
    //             }
    //         }).mine;

    //         //data from active player
    //         var namesScroungedUsers = [];
    //         var amountScrSlots = cursorPlayerDataMineSelf.amountScrSlots;
    //         var ownRate = cursorPlayerDataMineSelf.scrItem.benefit;

    //         //data from looked at player
    //         var inputs = [];
    //         var stamps = [];
    //         var supNames = [];
    //         var supMiningrates = [];
    //         var supStamps = [];
    //         var amountSupSlots = cursorPlayerDataMineCu.amountSupSlots;
    //         var amountOwnSlots = cursorPlayerDataMineCu.amountOwnSlots;
    //         var matterBlocksValues = [];
    //         var matterBlocksColors = [];

    //         for (i = 0; i < amountScrSlots; i++) {
    //             namesScroungedUsers[i] = cursorPlayerDataMineSelf.scrSlots['scrs' + i].victim.name;
    //         };

    //         for (var i = 0; i < amountOwnSlots; i++) {
    //             inputs[i] = cursorPlayerDataMineCu.ownSlots['owns' + i].input;
    //             //falls der slot benutzt ist                                      
    //             if (inputs[i] > 0) {
    //                 cursorMatterBlock = MatterBlocks.findOne({
    //                     matter: inputs[i]
    //                 });
    //                 matterBlocksValues[i] = cursorMatterBlock.value;
    //                 matterBlocksColors[i] = cursorMatterBlock.color;
    //             }
    //             stamps[i] = cursorPlayerDataMineCu.ownSlots['owns' + i].stamp;

    //             //Iterate Supporter
    //             var supNamesOneSlot = [];
    //             var supStampsOneSlot = [];
    //             var supMiningratesOneSlot = [];
    //             for (var k = 0; k < amountSupSlots; k++) {
    //                 supNamesOneSlot[k] = cursorPlayerDataMineCu.ownSlots['owns' + i]['sup' + k].name;
    //                 supStampsOneSlot[k] = cursorPlayerDataMineCu.ownSlots['owns' + i]['sup' + k].stamp;
    //                 supMiningratesOneSlot[k] = cursorPlayerDataMineCu.ownSlots['owns' + i]['sup' + k].benefit;
    //             }
    //             supNames[i] = supNamesOneSlot;
    //             supStamps[i] = supStampsOneSlot;
    //             supMiningrates[i] = supMiningratesOneSlot;
    //         }

    //         //set Data Context for other helpers
    //         inst.state.set('self', users);
    //         inst.state.set('ownRate', ownRate);
    //         inst.state.set('victimsM', namesScroungedUsers);
    //         //muss als Mine angehörig gekennzeichnet werden, da die Variable in einer gemeinsamen
    //         //Funktion vom Template WorldMap sonst mit anderen Templates überschneidet
    //         //(worldmap.events)
    //         inst.state.set('amountScrSlotsM', amountScrSlots);
    //         inst.state.set('amountSupSlots', amountSupSlots);
    //         inst.state.set('amountOwnSlots', amountOwnSlots);
    //         inst.state.set('matterIds', inputs);
    //         inst.state.set('timeStamps', stamps);
    //         inst.state.set('supporters', supNames);
    //         inst.state.set('supTimeStamps', supStamps);
    //         inst.state.set('supRates', supMiningrates);
    //         inst.state.set('matterBlocksValues', matterBlocksValues);
    //         inst.state.set('matterBlocksColors', matterBlocksColors);
    //         //console.timeEnd('createMineScrounge');
    //     }
    // })
    // ...
    // OLD OLD 2015/12/05 OLD OLD
});

Template.mineEnemy.helpers({
    activeSlots: function() {
        //TO-DO: If enemy is clicked this function is called twice - template renders twice? why? => autorun triggers twice. why?
        var arrayMineBase = mineBase.find({
            user: Template.instance().state.get('currentUser'),
            input: {
                $ne: "0000"
            }
        }, {
            sort: {
                remaining: 1
            }
        }).fetch();
        if (arrayMineBase.length == 0) {
            arrayMineBase = false
        };
        return arrayMineBase;
    },

    supporter: function(refID) {
        return mineSupport.find({
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
        var result = isScroungeable('mine', Template.instance().state.get('self'), Template.instance().state.get('currentUser'), this.slotID);
        if (result.result == true) {
            return true;
        } else {
            return result;
        }
    },

    progress: function() {
        var ownerProgress = (TimeSync.serverTime(Date.now() - this.timeStart)) * (7.5 / 3600000);
        var suppsProgress = 0;
        var arrayMineSupport = mineSupport.find({
            user: Template.instance().state.get('currentUser'),
            refID: this.slotID,
            supporter: {
                $nin: [null, ""]
            }
        }).fetch();
        for (i = 0; i < arrayMineSupport.length; i++) {
            suppsProgress = suppsProgress + (TimeSync.serverTime(Date.now() - arrayMineSupport[i].timeStart)) * (arrayMineSupport[i].benefit / 3600000);
        }
        return Math.floor(ownerProgress + suppsProgress);
    },

    percentageProgress: function() {
        var progress1 = 0;
        var ownerProgress = (TimeSync.serverTime(Date.now() - this.timeStart)) * (7.5 / 3600000);
        var suppsProgress = 0;
        var arrayMineSupport = mineSupport.find({
            user: Template.instance().state.get('currentUser'),
            refID: this.slotID,
            supporter: {
                $nin: [null, ""]
            }
        }).fetch();
        for (i = 0; i < arrayMineSupport.length; i++) {
            suppsProgress = suppsProgress + (TimeSync.serverTime(Date.now() - arrayMineSupport[i].timeStart)) * (arrayMineSupport[i].benefit / 3600000);
        }
        progress1 = ownerProgress + suppsProgress;
        return Math.floor(((progress1) / this.progress2) * 100);
    },

    imagePosition: function() {
        return mineCTBP(this.input.substring(0, 2));
    },

    // remainingId: function(appendix) {
    //     var result = 'timerDec_' + this.slotID + '_mine_' + appendix;
    //     var obj0 = {};
    //     obj0['id'] = result;
    //     obj0['miliseconds'] = this.remaining;
    //     obj0['notFound'] = 0;
    //     obj0['prefix'] = -1;
    //     GV_timers.push(obj0);
    //     return result;
    // },

    // remainingChangeId: function(appendix) {
    //     var result = 'timerDec_' + this.slotID + '_mine_' + appendix;
    //     var obj0 = {};
    //     obj0['id'] = result;
    //     //TO-DO: Get item value
    //     obj0['miliseconds'] = ((this.progress2 - this.progress1) / ((this.miningrate + 5) / 3600000));
    //     obj0['notFound'] = 0;
    //     obj0['prefix'] = -1;
    //     GV_timers.push(obj0);
    //     return result;
    // },

    // timeSpentId: function(appendix) {
    //     var result = 'timerInc_' + this.slotID + '_mine_' + appendix;
    //     var obj0 = {};
    //     obj0['id'] = result;
    //     obj0['miliseconds'] = TimeSync.serverTime(Date.now() - this.timeStart);
    //     obj0['notFound'] = 0;
    //     obj0['prefix'] = 1;
    //     GV_timers.push(obj0);
    //     return result;
    // },

    remainingTimeFormat: function() {
        return msToTime(this.remaining);
    },

    timeSpentTimeFormat: function() {
        return msToTime(TimeSync.serverTime(Date.now() - this.timeStart));
    },

    remainingChangeTimeFormat: function() {
        //unsued variable to force reactive update every second
        var reactive = this.remaining;
        //TO-DO: Get item value
        var ownerProgress = TimeSync.serverTime(Date.now() - this.timeStart) * (7.5 / 3600000);
        var suppsProgress = 0;
        var arrayMineSupport = mineSupport.find({
            user: Template.instance().state.get('currentUser'),
            refID: this.slotID,
            supporter: {
                $nin: [null, ""]
            }
        }).fetch();
        for (i = 0; i < arrayMineSupport.length; i++) {
            suppsProgress = suppsProgress + (TimeSync.serverTime(Date.now() - arrayMineSupport[i].timeStart)) * (arrayMineSupport[i].benefit / 3600000);
        }
        var progress1 = ownerProgress + suppsProgress;
        return msToTime(((this.progress2 - progress1) / ((this.benefitTotal + 5) / 3600000)));
    },

    benefitChange: function() {
        //TO-DO: Get item value
        return this.benefitTotal + 5;
    },

    slotsChange: function() {
        return this.slots1 + 1;
    },

    mined: function() {
        //TO-DO: Get item value
        return Math.floor(TimeSync.serverTime((Date.now() - this.timeStart)) * (5 / 3600000));
    }

    // OLD OLD 2015/12/05 OLD OLD
    // ...
    // mineSupporterSlots: function() {
    //     //Mine
    //     //get Data Context
    //     var self = Template.instance().state.get('self')[1];
    //     var currentUser = Template.instance().state.get('self')[0];
    //     var ownRate = Template.instance().state.get('ownRate');
    //     var amountSupSlots = Template.instance().state.get('amountSupSlots');
    //     var amountOwnSlots = Template.instance().state.get('amountOwnSlots');
    //     var matterIds = Template.instance().state.get('matterIds');
    //     var supporters = Template.instance().state.get('supporters');
    //     var timeStamps = Template.instance().state.get('timeStamps');
    //     var supTimeStamps = Template.instance().state.get('supTimeStamps');
    //     var supRates = Template.instance().state.get('supRates');
    //     var matterBlocksValues = Template.instance().state.get('matterBlocksValues');
    //     var matterBlocksColors = Template.instance().state.get('matterBlocksColors');
    //     var objects = new Array();

    //     var calculatedServerTime = TimeSync.serverTime(Date.now());
    //     //Iterate OwnSlots
    //     for (var i = 0; i < amountOwnSlots; i++) {
    //         if (matterIds[i] > 0) {
    //             var amountUsedSupSlots = 0
    //             var obj0 = {};

    //             var progressOwn = (calculatedServerTime - timeStamps[i]) * (7.5 / 3600000);
    //             var progressSups = 0;
    //             var supRatesAdded = 0;

    //             var supSlotsMemory = new Array();
    //             //Iterate Supporter
    //             for (var k = 0; k < amountSupSlots; k++) {
    //                 //SupSlot used?
    //                 if (supporters[i] != "") {
    //                     if (supporters[i][k] != "") {
    //                         amountUsedSupSlots++;
    //                         var obj00 = {};
    //                         var supTime = supTimeStamps[i][k];

    //                         obj00['timeSpentId'] = 'timerInc_' + i + k + '_mine_sup';
    //                         var obj01 = {};
    //                         obj01['id'] = obj00['timeSpentId'];
    //                         obj01['miliseconds'] = (calculatedServerTime - supTime);
    //                         obj01['notFound'] = 0;
    //                         obj01['prefix'] = 1;
    //                         GV_timers.push(obj01);
    //                         obj00['timeSpent'] = msToTime(obj01['miliseconds']);

    //                         var supRate = supRates[i][k];
    //                         supRatesAdded = supRatesAdded + supRate;
    //                         progressSups = progressSups + (calculatedServerTime - supTime) * (supRate / 3600000);

    //                         obj00['mined'] = Math.floor((calculatedServerTime - supTime) * (supRate / 3600000));
    //                         obj00['miningrate'] = supRate + '/hr';
    //                         obj00['supName'] = supporters[i][k];
    //                         supSlotsMemory[k] = obj00;
    //                     }
    //                 }
    //             }
    //             var progressTotal = progressOwn + progressSups;
    //             obj0['value'] = Math.floor(progressTotal) + '/' + matterBlocksValues[i] + '(' + Math.floor((Math.floor(progressTotal) / matterBlocksValues[i]) * 100) + '%)';
    //             //Diese Switch-Anweisung existiert nur, um den Sprite Sheets gerecht zu werden
    //             //Es wird geprüft, um welchen Farbcode es sich handelt, dieser wird dann in die background-position im Sprite Sheet übersetzt
    //             //Im HTML wird der Wert entsprechend für die background-position eingesetzt
    //             //Diese "Übersetzung" ist notwendig, da der Farbcode an verschiedenen Stellen abgefragt wird und jeweils eine andere 
    //             //background-position nötig ist. (Unterschiedlich große images)
    //             switch (matterBlocksColors[i]) {
    //                 case "green":
    //                     obj0['color'] = "-550px 0px";
    //                     break;
    //                 case "red":
    //                     obj0['color'] = "-550px -100px";
    //                     break;
    //                 default:
    //                     console.log("mineScrounge oops");
    //             }
    //             /*                    obj0['color'] = cursorMatterBlock.color;*/
    //             obj0['slots'] = amountUsedSupSlots + '/' + amountSupSlots;
    //             obj0['slotsChange'] = (amountUsedSupSlots + 1) + '/' + amountSupSlots;
    //             obj0['remainingId'] = 'timerDec_' + i + '_mine';
    //             obj0['remainingChangeId'] = 'timerDec_' + i + '_mineChange';
    //             obj0['timeSpentId'] = 'timerInc_' + i + '_mine';

    //             //Remaining calculation
    //             var obj1 = {};
    //             obj1['id'] = obj0['remainingId'];
    //             obj1['miliseconds'] = ((matterBlocksValues[i] - progressTotal) / ((7.5 + supRatesAdded) / 3600000));
    //             obj1['notFound'] = 0;
    //             obj1['prefix'] = -1;
    //             GV_timers.push(obj1);
    //             obj0['remaining'] = msToTime((matterBlocksValues[i] - progressTotal) / ((7.5 + supRatesAdded) / 3600000));

    //             //RemainingChange calcuation
    //             var obj3 = {};
    //             obj3['id'] = obj0['remainingChangeId'];
    //             obj3['miliseconds'] = ((matterBlocksValues[i] - progressTotal) / ((7.5 + supRatesAdded + ownRate) / 3600000));
    //             obj3['notFound'] = 0;
    //             obj3['prefix'] = -1;
    //             GV_timers.push(obj3);
    //             obj0['remainingChange'] = msToTime((matterBlocksValues[i] - progressTotal) / ((7.5 + supRatesAdded + ownRate) / 3600000));

    //             var obj2 = {};
    //             obj2['id'] = obj0['timeSpentId'];
    //             obj2['miliseconds'] = (calculatedServerTime - timeStamps[i]);
    //             obj2['notFound'] = 0;
    //             obj2['prefix'] = 1;
    //             GV_timers.push(obj2);
    //             obj0['timeSpent'] = msToTime((calculatedServerTime - timeStamps[i]));

    //             obj0['miningrate'] = (7.5 + supRatesAdded) + '/hr';
    //             obj0['miningrateChange'] = (7.5 + supRatesAdded + ownRate) + '/hr';;

    //             //Make Slot scroungeable
    //             obj0['goScrounging'] = 'goScroungingMine_' + i;

    //             obj0['index'] = i;
    //             obj0['supporter'] = supSlotsMemory;
    //             var lockCheck = checkScroungeMine(i, self, currentUser);
    //             obj0['lockedMsg'] = lockCheck;
    //             if (lockCheck != false) lockCheck = true
    //             obj0['locked'] = lockCheck;
    //             objects[i] = obj0;
    //         }
    //     }
    //     return objects;
    // }
    // ...
    // OLD OLD 2015/12/05 OLD OLD
});

Template.mineEnemy.events({
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
        //param: slotID
        Meteor.call('goScroungingMine', parseInt(e.currentTarget.id.split("_").pop()), function(err, result) {
            if (err) {
                console.log('goScroungingMine:', err);
            } else if (result) {
                infoLog(result);
                showInfoTextAnimation(result);
            }
        });
    },
});

onlyUnique = function(value, index, self) {
    return self.indexOf(value) === index;
}
