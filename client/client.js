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

    ////////////////////////////
    ///// GLOBAL VARIABLES /////
    ////////////////////////////

    timers = new Array();
    mapRows = 6;
    mapColumns = 8;

    ////////////////////////////
    ////// FUNCTION CALLS //////
    ////////////////////////////

    Meteor.call('rootUrl', function(err, result) {
        if (err) {
            console.log('rootUrl Error: ' + err);
        }
        if (result) {
            console.log('Serving from: ' + result);
        }
    });

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

    ///// IMPROVEMENTS /////
    Template.improvements.onCreated(function() {

        // console.log('createImprovementStart');
        //console.time('createImprovement');
        var inst = this;
        inst.state = new ReactiveDict();
        var cursorSelf = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                menu: 1,
                username: 1,
                _id: 0
            }
        });
        var self = cursorSelf.username;
        var currentUser = cursorSelf.cu;
        var menu = cursorSelf.menu;
        inst.autorun(function() {
            var subsPlayerDataImprovements = inst.subscribe('playerDataImprovements' + menu, self);
            if (subsPlayerDataImprovements.ready()) {

                //set Data Context for other helpers
                inst.state.set('self', self);
                inst.state.set('currentUser', currentUser);
                inst.state.set('menu', menu);
                //console.timeEnd('createImprovement');
                //console.timeEnd('SWITCH CATEGORY4');
                //console.timeEnd('LOGINI');
            }

        })
    });

    Template.improvements.helpers({
        improvement: function() {
            //get Data Context
            var self = Template.instance().state.get('self');
            var cu = Template.instance().state.get('currentUser');
            var menu = Template.instance().state.get('menu');
            var color = "firebrick";
            if (cu == self) {
                cu = 'YOUR BASE';
                color = "green";
            }
            var cursorPlayerData = playerData.findOne({
                user: self
            });
            obj0 = {};
            obj0['color'] = color;
            obj0['name'] = cu;
            obj0['xp'] = Math.floor(cursorPlayerData.XP) + '/' + cursorPlayerData.requiredXP;
            obj0['level'] = cursorPlayerData.level;
            if (cursorPlayerData[menu]) {
                obj0['science'] = cursorPlayerData[menu].science;
                obj0['item'] = cursorPlayerData[menu].scrItem.benefit;
            }
            // //console.timeEnd("LOGINHELPER5");
            return obj0;
        }
    });

    //////////////////
    ////// MINE //////
    //////////////////

    ///// MINE BASE /////
    Template.mineBase.onCreated(function() {

        // console.log('createMineBaseStart');
        //console.time('createMineBase');
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
        var users = [self];

        inst.autorun(function() {

            var subsPlayerDataMine = inst.subscribe('playerDataMine', users);
            var color = 'green';
            var subsMatterBlocks = inst.subscribe('MatterBlocks', color);

            if (subsPlayerDataMine.ready() && subsMatterBlocks.ready()) {
                var cursorPlayerDataMine = playerData.findOne({
                    user: self
                }, {
                    fields: {
                        mine: 1
                    }
                }).mine;

                //Get data from all own slots
                var inputs = [];
                var stampsSlotsLeft = [];
                var supStamps = [];
                var supMiningrates = [];
                var supNames = [];
                var matterBlocksValues = [];
                var matterBlocksColors = [];

                var amountOwnSlots = cursorPlayerDataMine.amountOwnSlots;
                var amountSupSlots = cursorPlayerDataMine.amountSupSlots;
                var ownRate = cursorPlayerDataMine.scrItem.benefit;

                for (i = 0; i < amountOwnSlots; i++) {
                    inputs[i] = cursorPlayerDataMine.ownSlots['owns' + i].input;
                    //falls der slot benutzt ist
                    if (inputs[i] > 0) {
                        var cursorMatterBlock = MatterBlocks.findOne({
                            matter: inputs[i]
                        })
                        matterBlocksValues[i] = cursorMatterBlock.value;
                        matterBlocksColors[i] = cursorMatterBlock.color;
                    }
                    stampsSlotsLeft[i] = cursorPlayerDataMine.ownSlots['owns' + i].stamp;

                    var supStampsOneSlot = [];
                    var supMiningratesOneSlot = [];
                    var supNamesOneSlot = [];
                    for (k = 0; k < amountSupSlots; k++) {
                        supStampsOneSlot[k] = cursorPlayerDataMine.ownSlots['owns' + i]['sup' + k].stamp;
                        supMiningratesOneSlot[k] = cursorPlayerDataMine.ownSlots['owns' + i]['sup' + k].benefit;
                        supNamesOneSlot[k] = cursorPlayerDataMine.ownSlots['owns' + i]['sup' + k].name;
                    }
                    supStamps[i] = supStampsOneSlot;
                    supMiningrates[i] = supMiningratesOneSlot;
                    supNames[i] = supNamesOneSlot;
                }

                //Get data from all scrounge slots
                var dataScrSlots = {};
                var stampsSlotsRight = [];
                var ownMiningrates = [];
                var matterBlocksValuesScrounge = [];
                var matterBlocksColorsScrounge = [];
                var stampsScroungedUsers = [];
                var inputsScroungedUsers = [];
                var namesScroungedUsers = [];
                var supsVictimsStamps = [];
                var supsVictimsRates = [];
                var amountVictimsSupSlots = [];

                var amountScrSlots = cursorPlayerDataMine.amountScrSlots;

                for (i = 0; i < amountScrSlots; i++) {
                    ownMiningrates[i] = cursorPlayerDataMine.scrSlots['scrs' + i].benefit;
                    stampsSlotsRight[i] = cursorPlayerDataMine.scrSlots['scrs' + i].stamp;
                    stampsScroungedUsers[i] = cursorPlayerDataMine.scrSlots['scrs' + i].victim.stamp;
                    inputsScroungedUsers[i] = cursorPlayerDataMine.scrSlots['scrs' + i].victim.input;
                    namesScroungedUsers[i] = cursorPlayerDataMine.scrSlots['scrs' + i].victim.name;
                    //falls der slot benutzt ist
                    if (inputsScroungedUsers[i] > 0) {
                        var cursorMatterBlock = MatterBlocks.findOne({
                            matter: inputsScroungedUsers[i]
                        })
                        matterBlocksValuesScrounge[i] = cursorMatterBlock.value;
                        matterBlocksColorsScrounge[i] = cursorMatterBlock.color;
                    }

                    var amountVictimSupSlots = cursorPlayerDataMine.scrSlots['scrs' + i].victim.supSlotsVictim;
                    amountVictimsSupSlots[i] = amountVictimSupSlots;

                    var supsVictimsStampsOneSlot = [];
                    var supsVictimsRatesOneSlot = [];
                    for (k = 0; k < amountVictimSupSlots; k++) {
                        supsVictimsStampsOneSlot[k] = cursorPlayerDataMine.scrSlots['scrs' + i].victim['sup' + k].stamp;
                        supsVictimsRatesOneSlot[k] = cursorPlayerDataMine.scrSlots['scrs' + i].victim['sup' + k].benefit;
                    }
                    supsVictimsStamps[i] = supsVictimsStampsOneSlot;
                    supsVictimsRates[i] = supsVictimsRatesOneSlot;
                }
                //set Data Context for other helpers         

                //allgemeine Daten
                inst.state.set('self', users);
                inst.state.set('amountScrSlots', amountScrSlots);
                inst.state.set('amountSupSlots', amountSupSlots);
                inst.state.set('amountOwnSlots', amountOwnSlots);
                inst.state.set('ownRate', ownRate);

                //für linke Seite benötigt
                inst.state.set('matterIds', inputs);
                inst.state.set('timeStamps', stampsSlotsLeft);
                inst.state.set('supTimeStamps', supStamps);
                inst.state.set('supRates', supMiningrates);
                inst.state.set('supporters', supNames);
                inst.state.set('matterBlocksValues', matterBlocksValues);
                inst.state.set('matterBlocksColors', matterBlocksColors);

                //für rechte Seite benötigt
                inst.state.set('ownTimeStamps', stampsSlotsRight);
                inst.state.set('victims', namesScroungedUsers);
                inst.state.set('victimsSupSlots', amountVictimsSupSlots);
                inst.state.set('timeStampsScrounge', stampsScroungedUsers);
                inst.state.set('supRatesScrounge', supsVictimsRates);
                inst.state.set('supTimeStampsScrounge', supsVictimsStamps);
                inst.state.set('matterBlocksColorsScrounge', matterBlocksColorsScrounge);
                inst.state.set('matterBlocksValuesScrounge', matterBlocksValuesScrounge);
                //console.timeEnd('createMineBase');
                //console.timeEnd("LOGINMB");

                // console.log('mineBaseDict');
                // console.log(inst.state);
            }
        })
    });

    Template.mineBase.helpers({
        mineUnusedSlots: function() {

            // Mine
            //get fields from data context
            var name = Template.instance().state.get('self');
            var amountOwnSlots = Template.instance().state.get('amountOwnSlots');
            var matterIds = Template.instance().state.get('matterIds');
            var objects = new Array();
            var amountObjects = 0;

            for (var i = 0; i < amountOwnSlots; i++) {
                if (matterIds[i] == "0000") {
                    amountObjects++;
                }
            }
            for (var j = 0; j < amountObjects; j++) {
                objects[j] = {};
            }
            //console.timeEnd("LOGINHELPER1");
            // console.log('objects mineUnused', objects);
            return objects;
        },
        mineUsedSlots: function() {
            /*Mine*/
            //get fields from data context
            var name = Template.instance().state.get('self');
            var amountOwnSlots = Template.instance().state.get('amountOwnSlots');
            var amountSupSlots = Template.instance().state.get('amountSupSlots');
            var matterIds = Template.instance().state.get('matterIds');
            var matterBlocksValues = Template.instance().state.get('matterBlocksValues');
            var matterBlocksColors = Template.instance().state.get('matterBlocksColors');
            var timeStamps = Template.instance().state.get('timeStamps');
            var supporters = Template.instance().state.get('supporters');
            var supTimeStamps = Template.instance().state.get('supTimeStamps');
            var supRates = Template.instance().state.get('supRates');
            var objects = new Array();

            var calculatedServerTime = new Date().getTime() - timeDifference;
            /*Iterate OwnSlots*/
            for (var i = 0; i < amountOwnSlots; i++) {
                //falls der slot benutzt ist (nicht 0000)
                if (matterIds[i] > 0) {
                    //falls es keinen Supporter gibt > iteriere gar nicht
                    // if(supporters[i] == undefined) {
                    var amountUsedSupSlots = 0;
                    var obj0 = {};

                    var progressOwn = (calculatedServerTime - timeStamps[i]) * (7.5 / 3600000);
                    var progressSups = 0;
                    var supRatesAdded = 0;

                    var supSlotsMemory = new Array();
                    //Iterate Supporter
                    for (var k = 0; k < amountSupSlots; k++) {
                        //SupSlot used?
                        if (supporters[i] != "") {
                            if (supporters[i][k] != "") {
                                amountUsedSupSlots++;
                                var obj00 = {};
                                var supTime = supTimeStamps[i][k];

                                obj00['timeSpentId'] = 'timerInc_' + i + k + '_mine_sup';
                                var obj01 = {};
                                obj01['id'] = obj00['timeSpentId'];
                                obj01['miliseconds'] = (calculatedServerTime - supTime);
                                obj01['notFound'] = 0;
                                obj01['prefix'] = 1;
                                timers.push(obj01);
                                obj00['timeSpent'] = msToTime(obj01['miliseconds']);

                                var supRate = supRates[i][k];
                                supRatesAdded = supRatesAdded + supRate;
                                progressSups = progressSups + (calculatedServerTime - supTime) * (supRate / 3600000);
                                obj00['mined'] = Math.floor((calculatedServerTime - supTime) * (supRate / 3600000));
                                obj00['miningrate'] = supRate + '/hr';
                                obj00['supName'] = supporters[i][k];
                                supSlotsMemory[k] = obj00;
                            }
                        }
                    }

                    var progressTotal = progressOwn + progressSups;
                    obj0['value'] = Math.floor(progressTotal) + '/' + matterBlocksValues[i] + '(' + Math.floor((Math.floor(progressTotal) / matterBlocksValues[i]) * 100) + '%)';
                    //Diese Switch-Anweisung existiert nur, um den Sprite Sheets gerecht zu werden
                    //Es wird geprüft, um welchen Farbcode es sich handelt, dieser wird dann in die background-position im Sprite Sheet übersetzt
                    //Im HTML wird der Wert entsprechend für die background-position eingesetzt
                    //Diese "Übersetzung" ist notwendig, da der Farbcode an verschiedenen Stellen abgefragt wird und jeweils eine andere 
                    //background-position nötig ist. (Unterschiedlich große images)
                    switch (matterBlocksColors[i]) {
                        case "green":
                            obj0['color'] = "-550px 0px";
                            break;
                        case "red":
                            obj0['color'] = "-550px -100px";
                            break;
                        default:
                            console.log("no matterBlock color defined");
                    }
                    //if else funktioniert identisch wie obiges aber da viele Farben geplant sind, ist ein switch case eleganter
                    /*if(cursorMatterBlock.color == "green") {obj0['color'] = "-550px 0px";}*/
                    //vorherige Lösung
                    /*obj0['color'] = cursorMatterBlock.color;*/
                    obj0['slots'] = amountUsedSupSlots + '/' + amountSupSlots;
                    obj0['remainingId'] = 'timerDec_' + i + '_mine';
                    obj0['timeSpentId'] = 'timerInc_' + i + '_mine';

                    var obj1 = {};
                    obj1['id'] = obj0['remainingId'];
                    obj1['miliseconds'] = ((matterBlocksValues[i] - progressTotal) / ((7.5 + supRatesAdded) / 3600000));
                    obj1['notFound'] = 0;
                    obj1['prefix'] = -1;
                    timers.push(obj1);
                    obj0['remaining'] = msToTime((parseInt(matterBlocksValues[i]) - progressTotal) / ((7.5 + supRatesAdded) / 3600000));

                    var obj2 = {};
                    obj2['id'] = obj0['timeSpentId'];
                    obj2['miliseconds'] = (calculatedServerTime - timeStamps[i]);
                    obj2['notFound'] = 0;
                    obj2['prefix'] = 1;
                    timers.push(obj2);
                    obj0['timeSpent'] = msToTime((calculatedServerTime - timeStamps[i]));

                    if (amountUsedSupSlots == 0) {
                        obj0['profit'] = Math.floor(matterBlocksValues[i]) + '(100%)';
                    } else {
                        obj0['profit'] = Math.floor(0.5 * matterBlocksValues[i]) + '(50%)';
                    }
                    obj0['miningrate'] = (7.5 + supRatesAdded) + '/hr';

                    obj0['supporter'] = supSlotsMemory;

                    //für den range slider
                    obj0['slot'] = i;

                    objects[i] = obj0;
                }
            }
            //console.timeEnd("LOGINHELPER2");
            // console.log('objects mineUsed', objects);
            return objects;
        },

        mineUnusedScroungeSlots: function() {
            //Mine Scrounging
            //get fields from data context
            var name = Template.instance().state.get('self');
            var victims = Template.instance().state.get('victims');
            var amountScrSlots = Template.instance().state.get('amountScrSlots');
            var objects = new Array();

            for (var i = 0; i < amountScrSlots; i++) {
                if (victims[i] == "") objects[i] = {};
            }
            //console.timeEnd("LOGINHELPER3");
            return objects;
        },

        mineUsedScroungeSlots: function() {
            //Mine Scrounging
            //get fields from data context
            var name = Template.instance().state.get('self')[0];
            var ownRate = Template.instance().state.get('ownRate');
            var ownTimeStamps = Template.instance().state.get('ownTimeStamps');
            var amountScrSlots = Template.instance().state.get('amountScrSlots');
            var victimsSupSlots = Template.instance().state.get('victimsSupSlots');
            var victims = Template.instance().state.get('victims');
            var timeStampsScrounge = Template.instance().state.get('timeStampsScrounge');
            var supRatesScrounge = Template.instance().state.get('supRatesScrounge');
            var supTimeStampsScrounge = Template.instance().state.get('supTimeStampsScrounge');
            var matterBlocksColorsScrounge = Template.instance().state.get('matterBlocksColorsScrounge');
            var matterBlocksValuesScrounge = Template.instance().state.get('matterBlocksValuesScrounge');

            var calculatedServerTime = new Date().getTime() - timeDifference;
            var objects = new Array();

            //Iterate all Scrounging Slots (i = scrounge slots)
            for (var i = 0; i < amountScrSlots; i++) {
                //Is used?
                if (victims[i] != "") {
                    var progressOwn = (calculatedServerTime - timeStampsScrounge[i]) * (7.5 / 3600000);
                    var progressSups = 0;
                    var supRatesScroungeAdded = 0;
                    var amountUsedSupSlots = 0;
                    //Iterate Supporter (l = supporter slot)
                    for (var l = 0; l < victimsSupSlots[i]; l++) {
                        //Falls ein Supporter vorhanden ist, verwende dessen supRate und Zeitstempel
                        //scr slot überhaupt benutzt?
                        if (supTimeStampsScrounge[i] != "") {
                            //welcher/wieviele supporter slots des scr slots sind besetzt
                            if (supTimeStampsScrounge[i][l] != "") {
                                amountUsedSupSlots++;
                                var supTime = supTimeStampsScrounge[i][l];
                                var supRate = supRatesScrounge[i][l];
                                supRatesScroungeAdded = supRatesScroungeAdded + supRate;
                                progressSups = progressSups + (calculatedServerTime - supTime) * (supRate / 3600000);
                            }
                        }
                    }
                    var obj0 = {};
                    var progressTotal = progressOwn + progressSups;
                    //Diese Switch-Anweisung existiert nur, um den Sprite Sheets gerecht zu werden
                    //Es wird geprüft, um welchen Farbcode es sich handelt, dieser wird dann in die background-position im Sprite Sheet übersetzt
                    //Im HTML wird der Wert entsprechend für die background-position eingesetzt
                    //Diese "Übersetzung" ist notwendig, da der Farbcode an verschiedenen Stellen abgefragt wird und jeweils eine andere 
                    //background-position nötig ist. (Unterschiedlich große images)
                    //switch(cursorMatterBlock.color) {
                    switch (matterBlocksColorsScrounge[i]) {
                        case "green":
                            obj0['color'] = "-550px 0px";
                            break;
                        case "red":
                            obj0['color'] = "-550px -100px";
                            break;
                        default:
                            console.log("mineUsedScroungeSlots oops");
                    }
                    //if else funktioniert identisch wie obiges aber da viele Farben geplant sind, ist ein switch case eleganter
                    /*if(cursorMatterBlock.color == "green") {obj0['color'] = "-550px 0px";}*/
                    //vorherige Lösung
                    /*obj0['color'] = cursorMatterBlock.color;*/
                    obj0['victim'] = victims[i];
                    obj0['slots'] = amountUsedSupSlots + '/' + victimsSupSlots[i];
                    obj0['remainingId'] = 'timerDec_' + i + '_mine_scr';
                    obj0['timeSpentId'] = 'timerInc_' + i + '_mine_scr';

                    var obj1 = {};
                    obj1['id'] = obj0['remainingId'];
                    obj1['miliseconds'] = ((matterBlocksValuesScrounge[i] - progressTotal) / ((7.5 + supRatesScroungeAdded) / 3600000));
                    obj1['notFound'] = 0;
                    obj1['prefix'] = -1;
                    timers.push(obj1);
                    obj0['remaining'] = msToTime((matterBlocksValuesScrounge[i] - progressTotal) / ((7.5 + supRatesScroungeAdded) / 3600000));

                    var obj2 = {};
                    obj2['id'] = obj0['timeSpentId'];
                    obj2['miliseconds'] = (calculatedServerTime - ownTimeStamps[i]);
                    obj2['notFound'] = 0;
                    obj2['prefix'] = 1;
                    timers.push(obj2);
                    obj0['timeSpent'] = msToTime((calculatedServerTime - ownTimeStamps[i]));

                    obj0['profit'] = Math.floor((0.5 / amountUsedSupSlots) * matterBlocksValuesScrounge[i]) + '(' + (0.5 / amountUsedSupSlots) * 100 + '%)';
                    obj0['miningrate'] = ownRate + '/hr';
                    obj0['mined'] = Math.floor((calculatedServerTime - supTime) * (ownRate / 3600000));
                    obj0['slider_id'] = i + 6;
                    objects[i] = obj0;
                }
            }
            //console.timeEnd("LOGINHELPER4");
            return objects;
        },

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
            var result = distinct(colorArray);
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
            //console.timeEnd("LOGINHELPER6");
            return objects;
        }
    });

    Template.mineBase.events({
        'click .item': function(e, t) {
            var currentUser = Template.instance().state.get('self')[0];
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

    ///// MINE SCROUNGE /////
    Template.mineScrounge.onCreated(function() {

        //console.time('createMineScrounge');
        var inst = this;
        inst.state = new ReactiveDict();
        var cursorSelf = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                username: 1,
                cu: 1
            }
        });
        var currentUser = cursorSelf.cu;
        var self = cursorSelf.username;
        var users = [currentUser, self];

        inst.autorun(function() {

            var subsPlayerDataMine = inst.subscribe('playerDataMine', users);
            var color = 'green';
            var subsMatterBlocks = inst.subscribe('MatterBlocks', color);

            if (subsPlayerDataMine.ready() && subsMatterBlocks.ready()) {
                var cursorPlayerDataMineSelf = playerData.findOne({
                    user: self
                }, {
                    fields: {
                        mine: 1
                    }
                }).mine;
                var cursorPlayerDataMineCu = playerData.findOne({
                    user: currentUser
                }, {
                    fields: {
                        mine: 1
                    }
                }).mine;

                //data from active player
                var namesScroungedUsers = [];
                var amountScrSlots = cursorPlayerDataMineSelf.amountScrSlots;
                var ownRate = cursorPlayerDataMineSelf.scrItem.benefit;

                //data from looked at player
                var inputs = [];
                var stamps = [];
                var supNames = [];
                var supMiningrates = [];
                var supStamps = [];
                var amountSupSlots = cursorPlayerDataMineCu.amountSupSlots;
                var amountOwnSlots = cursorPlayerDataMineCu.amountOwnSlots;
                var matterBlocksValues = [];
                var matterBlocksColors = [];

                for (i = 0; i < amountScrSlots; i++) {
                    namesScroungedUsers[i] = cursorPlayerDataMineSelf.scrSlots['scrs' + i].victim.name;
                };

                for (var i = 0; i < amountOwnSlots; i++) {
                    inputs[i] = cursorPlayerDataMineCu.ownSlots['owns' + i].input;
                    //falls der slot benutzt ist                                      
                    if (inputs[i] > 0) {
                        cursorMatterBlock = MatterBlocks.findOne({
                            matter: inputs[i]
                        });
                        matterBlocksValues[i] = cursorMatterBlock.value;
                        matterBlocksColors[i] = cursorMatterBlock.color;
                    }
                    stamps[i] = cursorPlayerDataMineCu.ownSlots['owns' + i].stamp;

                    //Iterate Supporter
                    var supNamesOneSlot = [];
                    var supStampsOneSlot = [];
                    var supMiningratesOneSlot = [];
                    for (var k = 0; k < amountSupSlots; k++) {
                        supNamesOneSlot[k] = cursorPlayerDataMineCu.ownSlots['owns' + i]['sup' + k].name;
                        supStampsOneSlot[k] = cursorPlayerDataMineCu.ownSlots['owns' + i]['sup' + k].stamp;
                        supMiningratesOneSlot[k] = cursorPlayerDataMineCu.ownSlots['owns' + i]['sup' + k].benefit;
                    }
                    supNames[i] = supNamesOneSlot;
                    supStamps[i] = supStampsOneSlot;
                    supMiningrates[i] = supMiningratesOneSlot;
                }

                //set Data Context for other helpers
                inst.state.set('self', users);
                inst.state.set('ownRate', ownRate);
                inst.state.set('victimsM', namesScroungedUsers);
                //muss als Mine angehörig gekennzeichnet werden, da die Variable in einer gemeinsamen
                //Funktion vom Template WorldMap sonst mit anderen Templates überschneidet
                //(worldmap.events)
                inst.state.set('amountScrSlotsM', amountScrSlots);
                inst.state.set('amountSupSlots', amountSupSlots);
                inst.state.set('amountOwnSlots', amountOwnSlots);
                inst.state.set('matterIds', inputs);
                inst.state.set('timeStamps', stamps);
                inst.state.set('supporters', supNames);
                inst.state.set('supTimeStamps', supStamps);
                inst.state.set('supRates', supMiningrates);
                inst.state.set('matterBlocksValues', matterBlocksValues);
                inst.state.set('matterBlocksColors', matterBlocksColors);
                //console.timeEnd('createMineScrounge');
            }
        })
    });

    Template.mineScrounge.helpers({
        mineSupporterSlots: function() {
            //Mine
            //get Data Context
            var self = Template.instance().state.get('self')[1];
            var currentUser = Template.instance().state.get('self')[0];
            var ownRate = Template.instance().state.get('ownRate');
            var amountSupSlots = Template.instance().state.get('amountSupSlots');
            var amountOwnSlots = Template.instance().state.get('amountOwnSlots');
            var matterIds = Template.instance().state.get('matterIds');
            var supporters = Template.instance().state.get('supporters');
            var timeStamps = Template.instance().state.get('timeStamps');
            var supTimeStamps = Template.instance().state.get('supTimeStamps');
            var supRates = Template.instance().state.get('supRates');
            var matterBlocksValues = Template.instance().state.get('matterBlocksValues');
            var matterBlocksColors = Template.instance().state.get('matterBlocksColors');
            var objects = new Array();

            var calculatedServerTime = (new Date()).getTime() - timeDifference;
            //Iterate OwnSlots
            for (var i = 0; i < amountOwnSlots; i++) {
                if (matterIds[i] > 0) {
                    var amountUsedSupSlots = 0
                    var obj0 = {};

                    var progressOwn = (calculatedServerTime - timeStamps[i]) * (7.5 / 3600000);
                    var progressSups = 0;
                    var supRatesAdded = 0;

                    var supSlotsMemory = new Array();
                    //Iterate Supporter
                    for (var k = 0; k < amountSupSlots; k++) {
                        //SupSlot used?
                        if (supporters[i] != "") {
                            if (supporters[i][k] != "") {
                                amountUsedSupSlots++;
                                var obj00 = {};
                                var supTime = supTimeStamps[i][k];

                                obj00['timeSpentId'] = 'timerInc_' + i + k + '_mine_sup';
                                var obj01 = {};
                                obj01['id'] = obj00['timeSpentId'];
                                obj01['miliseconds'] = (calculatedServerTime - supTime);
                                obj01['notFound'] = 0;
                                obj01['prefix'] = 1;
                                timers.push(obj01);
                                obj00['timeSpent'] = msToTime(obj01['miliseconds']);

                                var supRate = supRates[i][k];
                                supRatesAdded = supRatesAdded + supRate;
                                progressSups = progressSups + (calculatedServerTime - supTime) * (supRate / 3600000);

                                obj00['mined'] = Math.floor((calculatedServerTime - supTime) * (supRate / 3600000));
                                obj00['miningrate'] = supRate + '/hr';
                                obj00['supName'] = supporters[i][k];
                                supSlotsMemory[k] = obj00;
                            }
                        }
                    }
                    var progressTotal = progressOwn + progressSups;
                    obj0['value'] = Math.floor(progressTotal) + '/' + matterBlocksValues[i] + '(' + Math.floor((Math.floor(progressTotal) / matterBlocksValues[i]) * 100) + '%)';
                    //Diese Switch-Anweisung existiert nur, um den Sprite Sheets gerecht zu werden
                    //Es wird geprüft, um welchen Farbcode es sich handelt, dieser wird dann in die background-position im Sprite Sheet übersetzt
                    //Im HTML wird der Wert entsprechend für die background-position eingesetzt
                    //Diese "Übersetzung" ist notwendig, da der Farbcode an verschiedenen Stellen abgefragt wird und jeweils eine andere 
                    //background-position nötig ist. (Unterschiedlich große images)
                    switch (matterBlocksColors[i]) {
                        case "green":
                            obj0['color'] = "-550px 0px";
                            break;
                        case "red":
                            obj0['color'] = "-550px -100px";
                            break;
                        default:
                            console.log("mineScrounge oops");
                    }
                    /*                    obj0['color'] = cursorMatterBlock.color;*/
                    obj0['slots'] = amountUsedSupSlots + '/' + amountSupSlots;
                    obj0['slotsChange'] = (amountUsedSupSlots + 1) + '/' + amountSupSlots;
                    obj0['remainingId'] = 'timerDec_' + i + '_mine';
                    obj0['remainingChangeId'] = 'timerDec_' + i + '_mineChange';
                    obj0['timeSpentId'] = 'timerInc_' + i + '_mine';

                    //Remaining calculation
                    var obj1 = {};
                    obj1['id'] = obj0['remainingId'];
                    obj1['miliseconds'] = ((matterBlocksValues[i] - progressTotal) / ((7.5 + supRatesAdded) / 3600000));
                    obj1['notFound'] = 0;
                    obj1['prefix'] = -1;
                    timers.push(obj1);
                    obj0['remaining'] = msToTime((matterBlocksValues[i] - progressTotal) / ((7.5 + supRatesAdded) / 3600000));

                    //RemainingChange calcuation
                    var obj3 = {};
                    obj3['id'] = obj0['remainingChangeId'];
                    obj3['miliseconds'] = ((matterBlocksValues[i] - progressTotal) / ((7.5 + supRatesAdded + ownRate) / 3600000));
                    obj3['notFound'] = 0;
                    obj3['prefix'] = -1;
                    timers.push(obj3);
                    obj0['remainingChange'] = msToTime((matterBlocksValues[i] - progressTotal) / ((7.5 + supRatesAdded + ownRate) / 3600000));

                    var obj2 = {};
                    obj2['id'] = obj0['timeSpentId'];
                    obj2['miliseconds'] = (calculatedServerTime - timeStamps[i]);
                    obj2['notFound'] = 0;
                    obj2['prefix'] = 1;
                    timers.push(obj2);
                    obj0['timeSpent'] = msToTime((calculatedServerTime - timeStamps[i]));

                    obj0['miningrate'] = (7.5 + supRatesAdded) + '/hr';
                    obj0['miningrateChange'] = (7.5 + supRatesAdded + ownRate) + '/hr';;

                    //Make Slot scroungeable
                    obj0['goScrounging'] = 'goScroungingMine_' + i;

                    obj0['index'] = i;
                    obj0['supporter'] = supSlotsMemory;
                    var lockCheck = checkScroungeMine(i, self, currentUser);
                    obj0['lockedMsg'] = lockCheck;
                    if (lockCheck != false) lockCheck = true
                    obj0['locked'] = lockCheck;
                    objects[i] = obj0;
                }
            }
            return objects;
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
            //console.time("GO SCROUNGING");
            var slotId = e.currentTarget.id.split("_").pop();
            Meteor.call('goScroungingMine', slotId, function(err, result) {
                if (err) {
                    console.log('goScroungingMine: ' + slotId + ' : ' + err);
                }
                if (result) {
                    infoLog(result);
                    showInfoTextAnimation(result);
                    //console.timeEnd("GO SCROUNGING");
                }
            });
        },
    });

    /////////////////////////
    ////// BATTLEFIELD //////
    /////////////////////////

    ///// BATTLEFIELD BASE /////
    Template.battlefieldBase.onCreated(function() {

        //console.time('createBattlefieldBase');
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
        var users = [self];

        inst.autorun(function() {

            var subsPlayerDataBattlefield = inst.subscribe('playerDataBattlefield', users);
            var color = 'green';
            var subsFightArenas = inst.subscribe('FightArenas', color);

            if (subsPlayerDataBattlefield.ready() && subsFightArenas.ready()) {
                var cursorPlayerDataBattlefield = playerData.findOne({
                    user: self
                }, {
                    fields: {
                        battlefield: 1
                    }
                }).battlefield;

                //Get data from all own slots
                var inputs = [];
                var stampsSlotsLeft = [];
                var supStamps = [];
                var supEpicness = [];
                var supNames = [];
                var supLevels = [];
                var fightArenasValues = [];
                var fightArenasColors = [];
                var fightArenasTimes = [];

                var amountOwnSlots = cursorPlayerDataBattlefield.amountOwnSlots;
                var amountSupSlots = cursorPlayerDataBattlefield.amountSupSlots;
                var ownEpic = cursorPlayerDataBattlefield.scrItem.benefit;

                for (i = 0; i < amountOwnSlots; i++) {
                    inputs[i] = cursorPlayerDataBattlefield.ownSlots['owns' + i].input;
                    //falls der slot benutzt ist
                    if (inputs[i] > 0) {
                        var cursorFightArena = FightArenas.findOne({
                            fight: inputs[i]
                        })
                        fightArenasValues[i] = cursorFightArena.value;
                        fightArenasColors[i] = cursorFightArena.color;
                        fightArenasTimes[i] = cursorFightArena.time;
                    }
                    stampsSlotsLeft[i] = cursorPlayerDataBattlefield.ownSlots['owns' + i].stamp;

                    var supStampsOneSlot = [];
                    var supEpicnessOneSlot = [];
                    var supNamesOneSlot = [];
                    var supLevelsOneSlot = [];
                    for (k = 0; k < amountSupSlots; k++) {
                        supStampsOneSlot[k] = cursorPlayerDataBattlefield.ownSlots['owns' + i]['sup' + k].stamp;
                        supEpicnessOneSlot[k] = cursorPlayerDataBattlefield.ownSlots['owns' + i]['sup' + k].benefit;
                        supNamesOneSlot[k] = cursorPlayerDataBattlefield.ownSlots['owns' + i]['sup' + k].name;
                        supLevelsOneSlot[k] = cursorPlayerDataBattlefield.ownSlots['owns' + i]['sup' + k].level;
                    }
                    supStamps[i] = supStampsOneSlot;
                    supEpicness[i] = supEpicnessOneSlot;
                    supNames[i] = supNamesOneSlot;
                    supLevels[i] = supLevelsOneSlot;
                }

                //Get data from all scrounge slots
                var dataScrSlots = {};
                var stampsSlotsRight = [];
                var ownEpicness = [];
                var fightArenasValuesScrounge = [];
                var fightArenasColorsScrounge = [];
                var fightArenasTimesScrounge = [];
                var stampsScroungedUsers = [];
                var inputsScroungedUsers = [];
                var namesScroungedUsers = [];
                var supsVictimsStamps = [];
                var supsVictimsEpics = [];
                var amountVictimsSupSlots = [];

                var amountScrSlots = cursorPlayerDataBattlefield.amountScrSlots;

                for (i = 0; i < amountScrSlots; i++) {
                    ownEpicness[i] = cursorPlayerDataBattlefield.scrSlots['scrs' + i].benefit;
                    stampsSlotsRight[i] = cursorPlayerDataBattlefield.scrSlots['scrs' + i].stamp;
                    stampsScroungedUsers[i] = cursorPlayerDataBattlefield.scrSlots['scrs' + i].victim.stamp;
                    inputsScroungedUsers[i] = cursorPlayerDataBattlefield.scrSlots['scrs' + i].victim.input;
                    namesScroungedUsers[i] = cursorPlayerDataBattlefield.scrSlots['scrs' + i].victim.name;
                    //falls der slot benutzt ist
                    if (inputsScroungedUsers[i] > 0) {
                        var cursorFightArena = FightArenas.findOne({
                            fight: inputsScroungedUsers[i]
                        })
                        fightArenasValuesScrounge[i] = cursorFightArena.value;
                        fightArenasColorsScrounge[i] = cursorFightArena.color;
                        fightArenasTimesScrounge[i] = cursorFightArena.time;
                    }

                    var amountVictimSupSlots = cursorPlayerDataBattlefield.scrSlots['scrs' + i].victim.supSlotsVictim;
                    amountVictimsSupSlots[i] = amountVictimSupSlots;

                    var supsVictimsStampsOneSlot = [];
                    var supsVictimsEpicsOneSlot = [];
                    for (k = 0; k < amountVictimSupSlots; k++) {
                        supsVictimsStampsOneSlot[k] = cursorPlayerDataBattlefield.scrSlots['scrs' + i].victim['sup' + k].stamp;
                        supsVictimsEpicsOneSlot[k] = cursorPlayerDataBattlefield.scrSlots['scrs' + i].victim['sup' + k].benefit;
                    }
                    supsVictimsStamps[i] = supsVictimsStampsOneSlot;
                    supsVictimsEpics[i] = supsVictimsEpicsOneSlot;
                }
                //set Data Context for other helpers         

                //allgemeine Daten
                inst.state.set('self', users);
                inst.state.set('amountScrSlots', amountScrSlots);
                inst.state.set('amountSupSlots', amountSupSlots);
                inst.state.set('amountOwnSlots', amountOwnSlots);
                inst.state.set('ownEpic', ownEpic);

                //für linke Seite benötigt
                inst.state.set('fightIds', inputs);
                inst.state.set('timeStamps', stampsSlotsLeft);
                inst.state.set('supTimeStamps', supStamps);
                inst.state.set('supEpics', supEpicness);
                inst.state.set('supLevels', supLevels);
                inst.state.set('supporters', supNames);
                inst.state.set('fightArenasValues', fightArenasValues);
                inst.state.set('fightArenasColors', fightArenasColors);
                inst.state.set('fightArenasTimes', fightArenasTimes);

                //für rechte Seite benötigt
                inst.state.set('ownTimeStamps', stampsSlotsRight);
                inst.state.set('victims', namesScroungedUsers);
                inst.state.set('victimsSupSlots', amountVictimsSupSlots);
                inst.state.set('timeStampsScrounge', stampsScroungedUsers);
                inst.state.set('supEpicsScrounge', supsVictimsEpics);
                inst.state.set('supTimeStampsScrounge', supsVictimsStamps);
                inst.state.set('fightArenasColorsScrounge', fightArenasColorsScrounge);
                inst.state.set('fightArenasValuesScrounge', fightArenasValuesScrounge);
                inst.state.set('fightArenasTimesScrounge', fightArenasTimesScrounge);
                //console.timeEnd('createBattlefieldBase');

                // console.log('battlefieldBaseDict');
                // console.log(inst.state);
            }
        })
    });

    Template.battlefieldBase.helpers({
        battlefieldUnusedSlots: function() {

            // Battlefield
            //get fields from data context
            var name = Template.instance().state.get('self');
            var amountOwnSlots = Template.instance().state.get('amountOwnSlots');
            var fightIds = Template.instance().state.get('fightIds');
            var objects = new Array();
            var amountObjects = 0;

            for (var i = 0; i < amountOwnSlots; i++) {
                if (fightIds[i] == "0000") {
                    amountObjects++;
                }
            }
            for (var j = 0; j < amountObjects; j++) {
                objects[j] = {};
            }
            // console.log('objectsUnusedB', objects);
            return objects;
        },
        battlefieldUsedSlots: function() {
            /*Battlefield*/
            //get fields from data context
            var name = Template.instance().state.get('self');
            var amountOwnSlots = Template.instance().state.get('amountOwnSlots');
            var amountSupSlots = Template.instance().state.get('amountSupSlots');
            var supLevels = Template.instance().state.get('supLevels');
            var fightIds = Template.instance().state.get('fightIds');
            var fightArenasValues = Template.instance().state.get('fightArenasValues');
            var fightArenasColors = Template.instance().state.get('fightArenasColors');
            var fightArenasTimes = Template.instance().state.get('fightArenasTimes');
            var timeStamps = Template.instance().state.get('timeStamps');
            var supporters = Template.instance().state.get('supporters');
            var supTimeStamps = Template.instance().state.get('supTimeStamps');
            var supEpics = Template.instance().state.get('supEpics');
            var objects = new Array();

            var calculatedServerTime = new Date().getTime() - timeDifference;
            /*Iterate OwnSlots*/
            for (var i = 0; i < amountOwnSlots; i++) {
                //falls der slot benutzt ist (nicht 0000)
                if (fightIds[i] > 0) {
                    var amountUsedSupSlots = 0;
                    var obj0 = {};
                    var supEpicsAdded = 0;

                    var supSlotsMemory = new Array();
                    //Iterate Supporter
                    for (var k = 0; k < amountSupSlots; k++) {
                        //SupSlot used?
                        if (supporters[i] != "") {
                            if (supporters[i][k] != "") {
                                amountUsedSupSlots++;
                                var obj00 = {};
                                var supTime = supTimeStamps[i][k];

                                obj00['timeSpentId'] = 'timerInc_' + i + k + '_battlefield_sup';
                                var obj01 = {};
                                obj01['id'] = obj00['timeSpentId'];
                                obj01['miliseconds'] = (calculatedServerTime - supTime);
                                obj01['notFound'] = 0;
                                obj01['prefix'] = 1;
                                timers.push(obj01);
                                obj00['timeSpent'] = msToTime(obj01['miliseconds']);

                                var supEpic = supEpics[i][k];
                                supEpicsAdded = supEpicsAdded + supEpic;
                                obj00['epicness'] = supEpic + '%';
                                obj00['level'] = supLevels[i];
                                obj00['supName'] = supporters[i][k];
                                supSlotsMemory[k] = obj00;
                            }
                        }
                    }

                    //Diese Switch-Anweisung existiert nur, um den Sprite Sheets gerecht zu werden
                    //Es wird geprüft, um welchen Farbcode es sich handelt, dieser wird dann in die background-position im Sprite Sheet übersetzt
                    //Im HTML wird der Wert entsprechend für die background-position eingesetzt
                    //Diese "Übersetzung" ist notwendig, da der Farbcode an verschiedenen Stellen abgefragt wird und jeweils eine andere 
                    //background-position nötig ist. (Unterschiedlich große images)
                    switch (fightArenasColors[i]) {
                        case "green":
                            obj0['color'] = "-216px 0px";
                            break;
                        case "red":
                            obj0['color'] = "-0px -0px";
                            break;
                        default:
                            console.log("no fightArena color defined");
                    }
                    //if else funktioniert identisch wie obiges aber da viele Farben geplant sind, ist ein switch case eleganter
                    /*if(cursorFightArena.color == "green") {obj0['color'] = "-550px 0px";}*/
                    //vorherige Lösung
                    /*obj0['color'] = cursorFightArena.color;*/
                    obj0['slots'] = amountUsedSupSlots + '/' + amountSupSlots;
                    obj0['xp'] = Math.floor((fightArenasValues[i] * (100 + supEpicsAdded)) / 100) + '(' + Math.floor(100 + supEpicsAdded) + '%)';
                    obj0['timeSpentId'] = 'timerInc_' + i + '_battlefield';

                    // var obj1 = {};
                    // obj1['id'] = obj0['remainingId'];
                    // obj1['miliseconds'] = ((fightArenasValues[i] - progressTotal) / ((7.5 + supEpicsAdded) / 3600000));
                    // obj1['notFound'] = 0;
                    // obj1['prefix'] = -1;
                    // timers.push(obj1);
                    // obj0['remaining'] = msToTime((parseInt(fightArenasValues[i]) - progressTotal) / ((7.5 + supEpicsAdded) / 3600000));

                    var obj2 = {};
                    obj2['id'] = obj0['timeSpentId'];
                    obj2['miliseconds'] = (calculatedServerTime - timeStamps[i]);
                    obj2['notFound'] = 0;
                    obj2['prefix'] = 1;
                    timers.push(obj2);
                    obj0['timeSpent'] = msToTime((calculatedServerTime - timeStamps[i]));

                    obj0['timeOverall'] = '/' + msToTime(fightArenasTimes[i]) + '(' + Math.floor((obj2['miliseconds'] / fightArenasTimes[i]) * 100) + '%)';

                    if (amountUsedSupSlots == 0) {
                        obj0['profit'] = Math.floor(fightArenasValues[i]) + '(100%)';
                    } else {
                        obj0['profit'] = Math.floor(0.5 * (fightArenasValues[i] + ((fightArenasValues[i] * supEpicsAdded) / 100))) + '(50%)';
                    }
                    obj0['epicness'] = supEpicsAdded + '%';

                    obj0['supporter'] = supSlotsMemory;

                    //für den range slider
                    obj0['slot'] = i;

                    objects[i] = obj0;
                }
            }
            // console.log('objectsUsedB', objects);
            return objects;
        },

        battlefieldUnusedScroungeSlots: function() {
            //Battlefield Scrounging
            //get fields from data context
            var name = Template.instance().state.get('self');
            var victims = Template.instance().state.get('victims');
            var amountScrSlots = Template.instance().state.get('amountScrSlots');
            var objects = new Array();

            for (var i = 0; i < amountScrSlots; i++) {
                if (victims[i] == "") objects[i] = {};
            }
            return objects;
        },

        battlefieldUsedScroungeSlots: function() {
            //Battlefield Scrounging
            //get fields from data context
            var name = Template.instance().state.get('self')[0];
            var ownEpics = Template.instance().state.get('ownEpics');
            var ownTimeStamps = Template.instance().state.get('ownTimeStamps');
            var amountScrSlots = Template.instance().state.get('amountScrSlots');
            var victimsSupSlots = Template.instance().state.get('victimsSupSlots');
            var victims = Template.instance().state.get('victims');
            var timeStampsScrounge = Template.instance().state.get('timeStampsScrounge');
            var supEpicsScrounge = Template.instance().state.get('supEpicsScrounge');
            var supTimeStampsScrounge = Template.instance().state.get('supTimeStampsScrounge');
            var fightArenasColorsScrounge = Template.instance().state.get('fightArenasColorsScrounge');
            var fightArenasValuesScrounge = Template.instance().state.get('fightArenasValuesScrounge');
            var fightArenasTimesScrounge = Template.instance().state.get('fightArenasTimesScrounge');
            var calculatedServerTime = new Date().getTime() - timeDifference;
            var objects = new Array();

            //Iterate all Scrounging Slots (i = scrounge slots)
            for (var i = 0; i < amountScrSlots; i++) {
                //Is used?
                if (victims[i] != "") {
                    var supEpicsScroungeAdded = 0;
                    var amountUsedSupSlots = 0
                    //Iterate Supporter (l = supporter slot)
                    for (var l = 0; l < victimsSupSlots[i]; l++) {
                        //Falls ein Supporter vorhanden ist, verwende dessen supEpic und Zeitstempel
                        //scr slot überhaupt benutzt?
                        if (supTimeStampsScrounge[i] != "") {
                            //welcher/wieviele supporter slots des scr slots sind besetzt
                            if (supTimeStampsScrounge[i][l] != "") {
                                amountUsedSupSlots++;
                                var supTime = supTimeStampsScrounge[i][l];
                                var supEpic = supEpicsScrounge[i][l];
                                supEpicsScroungeAdded = supEpicsScroungeAdded + supEpic;
                            }
                        }
                    }
                    var obj0 = {};
                    //Diese Switch-Anweisung existiert nur, um den Sprite Sheets gerecht zu werden
                    //Es wird geprüft, um welchen Farbcode es sich handelt, dieser wird dann in die background-position im Sprite Sheet übersetzt
                    //Im HTML wird der Wert entsprechend für die background-position eingesetzt
                    //Diese "Übersetzung" ist notwendig, da der Farbcode an verschiedenen Stellen abgefragt wird und jeweils eine andere 
                    //background-position nötig ist. (Unterschiedlich große images)
                    //switch(cursorFightArena.color) {
                    switch (fightArenasColorsScrounge[i]) {
                        case "green":
                            obj0['color'] = "-216px 0px";
                            break;
                        case "red":
                            obj0['color'] = "-0px -0px";
                            break;
                        default:
                            console.log("oops");
                    }
                    //if else funktioniert identisch wie obiges aber da viele Farben geplant sind, ist ein switch case eleganter
                    /*if(cursorFightArena.color == "green") {obj0['color'] = "-550px 0px";}*/
                    //vorherige Lösung
                    /*obj0['color'] = cursorFightArena.color;*/
                    obj0['victim'] = victims[i];
                    obj0['slots'] = amountUsedSupSlots + '/' + victimsSupSlots[i];
                    obj0['remainingId'] = 'timerDec_' + i + '_battlefield_scr';
                    obj0['timeSpentId'] = 'timerInc_' + i + '_battlefield_scr';

                    var obj1 = {};
                    obj1['id'] = obj0['remainingId'];
                    obj1['miliseconds'] = (fightArenasTimesScrounge[i]) - (calculatedServerTime - ownTimeStamps[i])
                    obj1['notFound'] = 0;
                    obj1['prefix'] = -1;
                    timers.push(obj1);
                    obj0['remaining'] = msToTime(obj1['miliseconds']);

                    var obj2 = {};
                    obj2['id'] = obj0['timeSpentId'];
                    obj2['miliseconds'] = (calculatedServerTime - ownTimeStamps[i]);
                    obj2['notFound'] = 0;
                    obj2['prefix'] = 1;
                    timers.push(obj2);
                    obj0['timeSpent'] = msToTime((calculatedServerTime - ownTimeStamps[i]));

                    obj0['timeOverall'] = '/' + msToTime(fightArenasTimesScrounge[i]) + '(' + Math.floor((obj2['miliseconds'] / fightArenasTimesScrounge[i]) * 100) + '%)';

                    obj0['profit'] = Math.floor((0.5 / amountUsedSupSlots) * fightArenasValuesScrounge[i]) + '(' + (0.5 / amountUsedSupSlots) * 100 + '%)';
                    obj0['epicness'] = supEpicsScroungeAdded + '%';
                    obj0['slider_id'] = i + 6;
                    objects[i] = obj0;
                }
            }
            return objects;
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
            var result = distinct(colorArray);
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

    Template.battlefieldBase.events({
        'click .item': function(e, t) {
            var currentUser = Template.instance().state.get('self')[0];
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

    ///// BATTLEFIELD SCROUNGE /////
    Template.battlefieldScrounge.onCreated(function() {

        //console.time('createBattlefieldScrounge');
        var inst = this;
        inst.state = new ReactiveDict();
        var cursorSelf = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                username: 1,
                cu: 1
            }
        });
        var currentUser = cursorSelf.cu;
        var self = cursorSelf.username;
        var users = [currentUser, self];

        inst.autorun(function() {

            var subsPlayerDataBattlefield = inst.subscribe('playerDataBattlefield', users);
            var color = 'green';
            var subsFightArenas = inst.subscribe('FightArenas', color);

            if (subsPlayerDataBattlefield.ready() && subsFightArenas.ready()) {
                var cursorPlayerDataBattlefieldSelf = playerData.findOne({
                    user: self
                }, {
                    fields: {
                        battlefield: 1
                    }
                }).battlefield;
                var cursorPlayerDataBattlefieldCu = playerData.findOne({
                    user: currentUser
                }, {
                    fields: {
                        battlefield: 1
                    }
                }).battlefield;

                //data from active player
                var namesScroungedUsers = [];
                var amountScrSlots = cursorPlayerDataBattlefieldSelf.amountScrSlots;
                var ownEpic = cursorPlayerDataBattlefieldSelf.scrItem.benefit;

                //data from looked at player
                var inputs = [];
                var stamps = [];
                var supNames = [];
                var supEpicness = [];
                var supStamps = [];
                var supLevels = [];
                var amountSupSlots = cursorPlayerDataBattlefieldCu.amountSupSlots;
                var amountOwnSlots = cursorPlayerDataBattlefieldCu.amountOwnSlots;
                var fightArenasValues = [];
                var fightArenasColors = [];
                var fightArenasTimes = [];

                for (i = 0; i < amountScrSlots; i++) {
                    namesScroungedUsers[i] = cursorPlayerDataBattlefieldSelf.scrSlots['scrs' + i].victim.name;
                };

                for (var i = 0; i < amountOwnSlots; i++) {
                    inputs[i] = cursorPlayerDataBattlefieldCu.ownSlots['owns' + i].input;
                    //falls der slot benutzt ist                                      
                    if (inputs[i] > 0) {
                        cursorFightArena = FightArenas.findOne({
                            fight: inputs[i]
                        });
                        fightArenasValues[i] = cursorFightArena.value;
                        fightArenasColors[i] = cursorFightArena.color;
                        fightArenasTimes[i] = cursorFightArena.time;
                    }
                    stamps[i] = cursorPlayerDataBattlefieldCu.ownSlots['owns' + i].stamp;

                    //Iterate Supporter
                    var supNamesOneSlot = [];
                    var supStampsOneSlot = [];
                    var supEpicnessOneSlot = [];
                    var supLevelsOneSlot = [];
                    for (var k = 0; k < amountSupSlots; k++) {
                        supNamesOneSlot[k] = cursorPlayerDataBattlefieldCu.ownSlots['owns' + i]['sup' + k].name;
                        supStampsOneSlot[k] = cursorPlayerDataBattlefieldCu.ownSlots['owns' + i]['sup' + k].stamp;
                        supEpicnessOneSlot[k] = cursorPlayerDataBattlefieldCu.ownSlots['owns' + i]['sup' + k].benefit;
                        supLevelsOneSlot[k] = cursorPlayerDataBattlefieldCu.ownSlots['owns' + i]['sup' + k].level;
                    }
                    supNames[i] = supNamesOneSlot;
                    supStamps[i] = supStampsOneSlot;
                    supEpicness[i] = supEpicnessOneSlot;
                    supLevels[i] = supLevelsOneSlot;
                }

                //set Data Context for other helpers
                inst.state.set('self', users);
                inst.state.set('ownEpic', ownEpic);
                inst.state.set('victimsB', namesScroungedUsers);
                //muss als Mine angehörig gekennzeichnet werden, da die Variable in einer gemeinsamen
                //Funktion vom Template WorldMap sonst mit anderen Templates überschneidet
                //(worldmap.events)
                inst.state.set('amountScrSlotsB', amountScrSlots);
                inst.state.set('amountSupSlots', amountSupSlots);
                inst.state.set('amountOwnSlots', amountOwnSlots);
                inst.state.set('fightIds', inputs);
                inst.state.set('supLevels', supLevels);
                inst.state.set('timeStamps', stamps);
                inst.state.set('supporters', supNames);
                inst.state.set('supTimeStamps', supStamps);
                inst.state.set('supEpics', supEpicness);
                inst.state.set('fightArenasValues', fightArenasValues);
                inst.state.set('fightArenasColors', fightArenasColors);
                inst.state.set('fightArenasTimes', fightArenasTimes);
                //console.timeEnd('createBattlefieldScrounge');
            }
        })
    });

    Template.battlefieldScrounge.helpers({
        battlefieldSupporterSlots: function() {
            //Battlefield
            //get Data Context
            var self = Template.instance().state.get('self')[1];
            var currentUser = Template.instance().state.get('self')[0];
            var ownEpic = Template.instance().state.get('ownEpic');
            var amountSupSlots = Template.instance().state.get('amountSupSlots');
            var amountOwnSlots = Template.instance().state.get('amountOwnSlots');
            var supLevels = Template.instance().state.get('supLevels');
            var fightIds = Template.instance().state.get('fightIds');
            var supporters = Template.instance().state.get('supporters');
            var timeStamps = Template.instance().state.get('timeStamps');
            var supTimeStamps = Template.instance().state.get('supTimeStamps');
            var supEpics = Template.instance().state.get('supEpics');
            var fightArenasValues = Template.instance().state.get('fightArenasValues');
            var fightArenasColors = Template.instance().state.get('fightArenasColors');
            var fightArenasTimes = Template.instance().state.get('fightArenasTimes');
            var objects = new Array();

            var calculatedServerTime = (new Date()).getTime() - timeDifference;
            //Iterate OwnSlots
            for (var i = 0; i < amountOwnSlots; i++) {
                if (fightIds[i] > 0) {
                    var amountUsedSupSlots = 0
                    var obj0 = {};

                    var supEpicsAdded = 0;

                    var supSlotsMemory = new Array();
                    //Iterate Supporter
                    for (var k = 0; k < amountSupSlots; k++) {
                        //SupSlot used?
                        if (supporters[i] != "") {
                            if (supporters[i][k] != "") {
                                amountUsedSupSlots++;
                                var obj00 = {};
                                var supTime = supTimeStamps[i][k];

                                obj00['timeSpentId'] = 'timerInc_' + i + k + '_battlefield_sup';
                                var obj01 = {};
                                obj01['id'] = obj00['timeSpentId'];
                                obj01['miliseconds'] = (calculatedServerTime - supTime);
                                obj01['notFound'] = 0;
                                obj01['prefix'] = 1;
                                timers.push(obj01);
                                obj00['timeSpent'] = msToTime(obj01['miliseconds']);

                                var supEpic = supEpics[i][k];
                                supEpicsAdded = supEpicsAdded + supEpic;

                                obj00['epicness'] = supEpic + '%';
                                obj00['level'] = supLevels[i];
                                obj00['supName'] = supporters[i][k];
                                supSlotsMemory[k] = obj00;
                            }
                        }
                    }
                    //Diese Switch-Anweisung existiert nur, um den Sprite Sheets gerecht zu werden
                    //Es wird geprüft, um welchen Farbcode es sich handelt, dieser wird dann in die background-position im Sprite Sheet übersetzt
                    //Im HTML wird der Wert entsprechend für die background-position eingesetzt
                    //Diese "Übersetzung" ist notwendig, da der Farbcode an verschiedenen Stellen abgefragt wird und jeweils eine andere 
                    //background-position nötig ist. (Unterschiedlich große images)
                    switch (fightArenasColors[i]) {
                        case "green":
                            obj0['color'] = "-216px 0px";
                            break;
                        case "red":
                            obj0['color'] = "-0px -0px";
                            break;
                        default:
                            console.log("no color defined for fight arena");
                    }
                    obj0['slots'] = amountUsedSupSlots + '/' + amountSupSlots;
                    obj0['slotsChange'] = (amountUsedSupSlots + 1) + '/' + amountSupSlots;
                    obj0['xp'] = Math.floor((fightArenasValues[i] * (100 + supEpicsAdded)) / 100) + '(' + Math.floor(100 + supEpicsAdded) + '%)';
                    obj0['xpChange'] = Math.floor((fightArenasValues[i] * (100 + supEpicsAdded + ownEpic)) / 100) + '(' + Math.floor(100 + supEpicsAdded) + '%)';
                    obj0['timeSpentId'] = 'timerInc_' + i + '_battlefield';

                    var obj2 = {};
                    obj2['id'] = obj0['timeSpentId'];
                    obj2['miliseconds'] = (calculatedServerTime - timeStamps[i]);
                    obj2['notFound'] = 0;
                    obj2['prefix'] = 1;
                    timers.push(obj2);
                    obj0['timeSpent'] = msToTime((calculatedServerTime - timeStamps[i]));
                    obj0['timeOverall'] = '/' + msToTime(fightArenasTimes[i]) + '(' + Math.floor((obj2['miliseconds'] / fightArenasTimes[i]) * 100) + '%)';

                    obj0['epicness'] = supEpicsAdded + '%';
                    obj0['epicnessChange'] = (supEpicsAdded + ownEpic) + '%';

                    //Make Slot scroungeable
                    obj0['goScrounging'] = 'goScroungingBattlefield_' + i;

                    obj0['index'] = i;
                    obj0['supporter'] = supSlotsMemory;
                    var lockCheck = checkScroungeBattlefield(i, self, currentUser);
                    obj0['lockedMsg'] = lockCheck;
                    if (lockCheck != false) lockCheck = true
                    obj0['locked'] = lockCheck;
                    objects[i] = obj0;
                }
            }
            return objects;
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
            Meteor.call('goScroungingBattlefield', slotId, function(err, result) {
                if (err) {
                    console.log('goScroungingBattlefield: ' + err);
                }
                if (result) {
                    infoLog(result);
                    showInfoTextAnimation(result);
                }
            });
        }
    });

    Template.worldMapPreload.onCreated(function() {

        // console.log('createWorldMapPreStart');
        //console.time('createWorldMapPre');

        var inst = this;
        var user = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                cu: 1,
                username: 1
            }
        });
        var myName = user.username;
        var currentUser = user.cu;
        var cursorUser = Meteor.users.findOne({
            username: currentUser
        }, {
            fields: {
                x: 1,
                y: 1
            }
        });

        inst.autorun(function() {

            var subsWorldMapSize = inst.subscribe('worldMapSize');

            if (subsWorldMapSize.ready()) {

                //"$exists: true" > mongo syntax, sucht alle Dokumente, die das Feld "maxXY" haben
                //in diesem Fall ist das nur ein Objekt
                //workaround, weil Suche über _id nicht funktioniert
                var maxX = STATUS.findOne({
                    maxXY: {
                        $exists: true
                    }
                }).maxXY;
                var maxY = maxX;
                var orientationX = cursorUser.x;
                var orientationY = cursorUser.y;
                var xInformation = [];
                var yInformation = [];
                var neededWorldMapFields = {};

                for (var i = 0; i < mapRows; i++) {
                    for (var j = 0; j < mapColumns; j++) {
                        xInformation[j] = (orientationX + j) % (maxX + 1);
                        //without user push empty object
                    }
                    yInformation[i] = (orientationY + i) % (maxY + 1);
                }
                neededWorldMapFields[0] = xInformation;
                neededWorldMapFields[1] = yInformation;

                var subsWorldMapPlayerData = inst.subscribe('playerDataForWorldMap', neededWorldMapFields);
                if (subsWorldMapPlayerData.ready()) {
                    //console.timeEnd('createWorldMapPre');
                    // //console.timeEnd("LOGINWP");
                }
            }
        })
    });
    ///// WORLD MAP /////
    Template.worldMap.onCreated(function() {
        //console.time('createWorldMap');

        var inst = this;
        inst.state = new ReactiveDict();
        var self = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                username: 1
            }
        }).username;
        inst.autorun(function() {

            var subsSelfM = inst.subscribe('playerDataMine', [self]);
            var subsSelfB = inst.subscribe('playerDataBattlefield', [self]);
            if (subsSelfM.ready() && subsSelfB.ready()) {
                var cursorMyPlayerData = playerData.findOne({
                    user: self
                }, {
                    fields: {
                        mine: 1,
                        battlefield: 1
                    }
                });
                if (cursorMyPlayerData) {
                    //Die Funktionen checkScroungeMine/Battlefield werden aus zwei verschiedenen Templates heraus
                    //aufgerufen. 
                    var amountScrSlotsM = cursorMyPlayerData.mine.amountScrSlots;
                    var amountScrSlotsB = cursorMyPlayerData.battlefield.amountScrSlots;
                    var ownRate = cursorMyPlayerData.mine.scrItem.benefit;
                    var ownEpic = cursorMyPlayerData.battlefield.scrItem.benefit;
                    victimsM = [];
                    for (i = 0; i < amountScrSlotsM; i++) {
                        victimsM[i] = cursorMyPlayerData.mine.scrSlots['scrs' + i].victim.name;
                    }
                    inst.state.set('victimsM', victimsM);
                    victimsB = [];
                    for (i = 0; i < amountScrSlotsB; i++) {
                        victimsB[i] = cursorMyPlayerData.battlefield.scrSlots['scrs' + i].victim.name;
                    }
                    inst.state.set('victimsB', victimsB);

                    //set Data Context for other helpers and connected methods (e.g. checkScroungeMine/Battlefield)
                    inst.state.set('self', self);
                    inst.state.set('ownRate', ownRate);
                    inst.state.set('ownEpic', ownEpic);
                    inst.state.set('amountScrSlotsM', amountScrSlotsM);
                    inst.state.set('amountScrSlotsB', amountScrSlotsB);
                    //console.timeEnd('createWorldMap');
                    //console.timeEnd("SWITCH TO WORLD MAP");
                    // console.log('worldMapDict');
                    // console.log(inst.state);
                }
            }


        })
    });

    Template.worldMap.helpers({
        worldMapArray: function() {
            return Session.get("worldMapArray");
        }
    });

    Template.worldMap.events({
        'mouseover .worldMapPlayerPlace': function(e, t) {
            //get Data Context
            var self = Template.instance().state.get('self');

            // get orientation
            var player = $(e.currentTarget).attr("id");
            if (!player) return
            var obj0 = {};
            obj0['id'] = 'preview' + player;

            $("#scroungePreviewWrapper").css({
                "left": $(e.currentTarget).css("left")
            });
            $("#scroungePreviewWrapper").css({
                "bottom": $(e.currentTarget).css("bottom")
            });
            // get db data
            var cursorPlayerData = WorldMapPlayerData.findOne({
                user: player
            }, {
                fields: {
                    mine: 1,
                    battlefield: 1,
                }
            });
            //Check mine
            var amountOwnSlots = cursorPlayerData.mine.amountOwnSlots;
            var trueCount = 0;
            var falseCount = 0;
            var maxCount = 0;
            //Iterate OwnSlots
            for (var i = 0; i < amountOwnSlots; i++) {
                var matterId = cursorPlayerData.mine.ownSlots['owns' + i].input;
                if (matterId > 0) {
                    maxCount++;
                    trueCount++;
                    //check all circumstances
                    var checkResult = checkScroungeMine(i, self, player);
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
            if (maxCount == 0 && self != player) {
                obj0['mineInactive'] = true;
            }
            //WWW
            //Check battlefield
            var amountOwnSlots = cursorPlayerData.battlefield.amountOwnSlots;
            var trueCount = 0;
            var falseCount = 0;
            var maxCount = 0;
            //Iterate OwnSlots
            for (var i = 0; i < amountOwnSlots; i++) {
                var fightId = cursorPlayerData.battlefield.ownSlots['owns' + i].input;
                if (fightId > 0) {
                    maxCount++;
                    trueCount++;
                    //check all circumstances
                    var checkResult = checkScroungeBattlefield(i, self, player);
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
            if (maxCount == 0 && self != player) {
                obj0['battlefieldInactive'] = true;
            }
            Session.set("worldMapPreview", obj0);

            $("#scroungePreviewWrapper").css({
                display: "block"
            });
            $("#scroungePreviewWrapper").stop().fadeTo("fast", 1);
        },

        'mouseout .worldMapScroungePreview': function(e, t) {
            $("#scroungePreviewWrapper").stop().fadeTo("fast", 0, function() {
                $("#scroungePreviewWrapper").css({
                    display: "none"
                });
            });
        },

        'click .worldMapNavigators': function(e, t) {
            navigateWorldMap($(e.currentTarget).attr("id"));
        },

        'click .worldMapPlayerPlace': function(e, t) {
            if (e.currentTarget.id != '') {
                var current = e.currentTarget.id;
                Meteor.users.update({
                    _id: Meteor.userId()
                }, {
                    $set: {
                        cu: current
                    }
                });
                renderActiveMiddle();
            }
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
    ///// SCROUNGE PREVIEW /////
    Template.scroungePreview.onCreated(function() {
        // console.log('createScroungePreviewStart');
        //console.time('createScroungePreview');

        var inst = this;
        var neededWorldMapFields = {};
        var xInformation = [];
        var yInformation = [];
        var worldMapArray = Session.get('worldMapArray');
        for (i = 0; i < worldMapArray[0].columns.length; i++) {
            for (j = 0; j < worldMapArray.length; j++) {
                if (worldMapArray[j].columns[i].playerName != undefined) {
                    x = worldMapArray[j].columns[i].x;
                    y = worldMapArray[j].columns[i].y;
                    if ($.inArray(x, xInformation) == -1) xInformation.push(x);
                    if ($.inArray(y, yInformation) == -1) yInformation.push(y);
                }
            }
        }
        neededWorldMapFields[0] = xInformation;
        neededWorldMapFields[1] = yInformation;

        inst.autorun(function() {

            var subsPlayerDataScroungePreview = inst.subscribe('playerDataForWorldMap', neededWorldMapFields);
            if (subsPlayerDataScroungePreview.ready()) {
                //console.timeEnd('createScroungePreview');
                // //console.timeEnd("SWITCH TO WORLD MAP");
            }
        })
    });
    //PI
    Template.scroungePreview.helpers({
        previewInfos: function() {
            return Session.get("worldMapPreview");
        },
    });

    ///// BUY MENU /////
    // Template.buyMenu.helpers({
    //     playerData: function() {
    //         return playerData.find({});
    //     },
    //     mineSlots: function() {
    //         return mineSlots.find({});
    //     }
    // });

    //TODO: noch nicht fertig !
    Template.buyMenu.events({
        'click #buyMenuYes': function(e, t) {
            //console.time("BUYRESOURCE");
            //console.time("S1");
            var menu = Meteor.users.findOne({
                _id: Meteor.userId()
            }, {
                fields: {
                    menu: 1,
                }
            }).menu;
            //console.timeEnd("S1");

            // Werte des Range Sliders
            var slider_range = $('#range_slider_Buy_Menu').slider("option", "values");

            //updating the database
            if (menu == 'mine') {
                Meteor.call('buyMatter', Session.get("clickedMatter"), slider_range, function(err, result) {
                    if (err) {
                        console.log(err);
                    }
                    if (result) {
                        infoLog(result);
                        showInfoTextAnimation(result);
                        //console.timeEnd("BUYRESOURCE");
                    }
                });
            }
            if (menu == 'battlefield') {
                Meteor.call('buyFight', Session.get("clickedFight"), slider_range, function(err, result) {
                    if (err) {
                        console.log(err);
                    }
                    if (result) {
                        infoLog(result);
                        showInfoTextAnimation(result);
                    }
                });
            }
            $('#buyMenuWrapper').fadeOut();
            $('#background_fade').fadeOut();
        },

        'click #buyMenuNo': function(e, t) {
            $('#buyMenuWrapper').fadeOut();
            $('#background_fade').fadeOut();

        },
    });

    ///// STANDARD BORDER /////
    Template.standardBorder.onCreated(function() {

        //console.timeEnd('Oo');
        // console.log('createBorderStart');
        //console.time('createBorder');

        var inst = this;

        inst.autorun(function() {
            var subsResourcesBorder = inst.subscribe('resources');
            if (subsResourcesBorder.ready()) {
                //console.timeEnd("LOGINSB");
                //console.timeEnd('createBorder');
            }
        })
    });

    Template.standardBorder.helpers({
        resources: function() {
            var arrayHelper = resources.find({}).fetch();
            arrayHelper[0].values.green.matter = Math.floor(arrayHelper[0].values.green.matter);
            return arrayHelper;
        },

        // worldMapFields: function()  {
        //     return worldMapFields.find({});
        // }
    });

    Template.standardBorder.events({

        'click #testButton': function(e, t) {
            console.log('action Button!');
            // This methodes activates l-k bots with the names from l to k
            createBots(1, 1000);
            // This methodes activates n bots to simulate user actions
            // actionBots(5);
        },

        'click #testButton2': function(e, t) {
            // logRenders();
            Meteor.call('singleUpdate');
        },

        'click #testButton3': function(e, t) {
            //param: interval in seconds
            Meteor.call('updateLoop', 25);
        },        

        'click .category_1': function(e, t) {
            //console.time("SWITCH CATEGORY3");
            //console.time("SWITCH CATEGORY4");
            switch_category($(e.target), 100, function() {
                Meteor.users.update({
                    _id: Meteor.userId()
                }, {
                    $set: {
                        menu: 'mine'
                    }
                });
            });
        },

        'click .category_3': function(e, t) {
            //console.time("SWITCH CATEGORY3");
            //console.time("SWITCH CATEGORY4");
            switch_category($(e.target), 100, function() {
                Meteor.users.update({
                    _id: Meteor.userId()
                }, {
                    $set: {
                        menu: 'battlefield'
                    }
                });
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
                } else {
                    switchToWorldMap();
                }
            }
            // console.log("SWITCH MODE");
        }
    });

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
        'mouseover .short_tooltip': function(e, t) {
            $("#short_tooltip_text").html($(e.currentTarget).attr("title"));
            $(e.currentTarget).attr("title", "");
            $("#short_tooltip_window").css({
                display: "table"
            });
            if ($("#short_tooltip_window").width() + e.clientX > $(window).width()) {
                var offset = -1 * $("#short_tooltip_window").width();
                $("#short_tooltip_window").css({
                    "margin-left": offset
                });
            } else {
                $("#short_tooltip_window").css({
                    "margin-left": "0px"
                });
            }
            if ($("#short_tooltip_window").height() + e.clientY + 18 > $(window).height()) {
                var offset = -1 * $("#short_tooltip_window").height();
                $("#short_tooltip_window").css({
                    "margin-top": (offset - 10)
                });
            } else {
                $("#short_tooltip_window").css({
                    "margin-top": "18px"
                });
            }

            $("#short_tooltip_window").stop(true).fadeTo(400, 0);
            $("#short_tooltip_window").fadeTo("fast", 1);
        },
        'mousemove .short_tooltip': function(e, t) {
            if ($("#short_tooltip_window").width() + e.clientX > $(window).width()) {
                var offset = -1 * $("#short_tooltip_window").width();
                $("#short_tooltip_window").css({
                    "margin-left": offset
                });
            } else {
                $("#short_tooltip_window").css({
                    "margin-left": "0px"
                });
            }
            if ($("#short_tooltip_window").height() + e.clientY + 18 > $(window).height()) {
                var offset = -1 * $("#short_tooltip_window").height();
                $("#short_tooltip_window").css({
                    "margin-top": (offset - 10)
                });
            } else {
                $("#short_tooltip_window").css({
                    "margin-top": "18px"
                });
            }
            $("#short_tooltip_window").css({
                left: e.clientX,
                top: e.clientY
            });
        },
        'mouseout .short_tooltip': function(e, t) {
            //Session.set("changes", "onMouseOut");
            $(e.currentTarget).attr("title", $("#short_tooltip_text").html());
            $("#short_tooltip_window").stop(true).fadeTo("fast", 0, function() {
                $("#short_tooltip_window").css({
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
            var pos = $(e.currentTarget).css("background-position");

            //Get only the className which is responsible for the background-Image to manipulate its background-position
            //Kennzeichen: "SS" (SpriteSheet) im Klassennamen
            var className = e.currentTarget.className;
            var temp1 = className.indexOf("SS");
            var classNameSub = className.substr(temp1);
            var temp2 = classNameSub.indexOf(" ");
            var classToBeChanged = "." + classNameSub.substr(0, temp2);
            moveSpriteSheetBackground(pos, classToBeChanged);
        },
        'mouseout .hover': function(e, t) {
            var pos = $(e.currentTarget).css("background-position");

            //Get only the className which is responsible for the background-Image to manipulate its background-position
            //Kennzeichen: "SS" (SpriteSheet) im Klassennamen
            var className = e.currentTarget.className;
            var temp1 = className.indexOf("SS");
            var classNameSub = className.substr(temp1);
            var temp2 = classNameSub.indexOf(" ");
            var classToBeChanged = "." + classNameSub.substr(0, temp2);
            moveSpriteSheetBackground(pos, classToBeChanged);
        },
        'click .scrounge_now': function(e, t) {
            switchToWorldMap();
        },
        'click .dropdown': function(e, t) {
            //console.log($(e.target).parent().attr("class").search("goScroungingIcon"));
            // if ($(e.target).src().length() == 1) {
            //     console.log('blub');
            // }
            if ($(e.target).attr("class").search("goScroungingIcon") == -1) {

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

    var time = 1200; //Animationszeit in ms
    var current_category = 1; //Start Kategorie
    var max_cat = 6; //Anzahl Kategorien
    var interval;
    var current_resolution = null;
    var handle_check = false;
    var hover_check = false;
    var stop_bool = false;


    var posX = 0;
    var posY = 0;



    // WorldMap Steuerung per Pfeiltasten

    (function($) {

        // Workaround für den Firefox zum Scrollen mit Mausrad
        document.addEventListener("mousemove", function(event) {
            posX = event.clientX;
            posY = event.clientY;
        });

        $(document).keyup(function(event) {
            // console.log(event.keyCode);
            if ($("#worldViewPort").length == 1) {
                if ((event.keyCode >= 37 && event.keyCode <= 40) || event.keyCode == 87 || event.keyCode == 68 || event.keyCode == 83 || event.keyCode == 65) {
                    switch (event.keyCode) {
                        case 37:
                            navigateWorldMap("worldMapGoLeft");
                            break;
                        case 38:
                            navigateWorldMap("worldMapGoUp");
                            break;
                        case 39:
                            navigateWorldMap("worldMapGoRight");
                            break;
                        case 40:
                            navigateWorldMap("worldMapGoDown");
                            break;
                        case 65:
                            navigateWorldMap("worldMapGoLeft");
                            break;
                        case 68:
                            navigateWorldMap("worldMapGoRight");
                            break;
                        case 83:
                            navigateWorldMap("worldMapGoDown");
                            break;
                        case 87:
                            navigateWorldMap("worldMapGoUp");
                            break;
                        default:
                            console.log("fehler beim verschieben der map !");
                            break;
                    }
                    $("#scroungePreviewWrapper").stop().fadeTo("fast", 0, function() {
                        $("#scroungePreviewWrapper").css({
                            display: "none"
                        });
                    });
                }
            }
        });

    })(jQuery);


    $(window).bind('mousewheel DOMMouseScroll', function(event) {
        if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            var direction = "back";
        } else {
            var direction = "forth"
        }
        if (direction) {
            //var parent = document.elementFromPoint(x, y);
            //console.log(parent);
            var parent = $(document.elementFromPoint(posX, posY)).parent();
            var x = 0;

            while (!parent.hasClass("scrollable") && x < 4) {
                parent = parent.parent();
                x++;
            }
            if (parent.hasClass("scrollable")) {
                if (!parent.attr("id")) {
                    scroll_content(direction, "horizontal", 100, parent);
                } else {
                    scroll_content(direction, "vertical", 100, parent);
                }
            }
        }
    });

    function slide(element) //abfrage welche ID gehovert wurde und umsetzung des richtigen slides
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
                console.log("Slide für " + element.attr("id") + " nicht definiert !");
                break;
        }
    }

    function switch_category(clicked_obj, speed, callback) {

        //console.time("SWITCH CATEGORY1");
        //console.time("SWITCH CATEGORY2");
        // console.log("SWITCH CATEGORY");

        if ($("#categories_wrapper").filter(':not(:animated)').length == 1) {

            var width_child = parseFloat($("#categories_wrapper").children().eq(0).width()) + 10;
            var margin_left_middle = -1 * (parseFloat($("#categories_wrapper").width()) - width_child) / 2;

            var current_margin_left = $("#categories_wrapper").attr("style");
            if (current_margin_left == undefined) {
                current_margin_left = parseFloat($("#categories_wrapper").css("margin-left"));
            } else {
                var start = current_margin_left.search("margin-left: ");
                var end = current_margin_left.search("px");
                current_margin_left = parseFloat(current_margin_left.slice(start + 13, end));
            }

            var direction = null;
            var category_offset = null;
            var animation_type = "linear";
            var buffer_image = null;

            var break_while = false;
            var y = 0;
            while (y < $("#categories_wrapper").children().length && break_while == false) {
                if ($("#categories_wrapper").children().eq(y)[0] == $(clicked_obj)[0])
                    break_while = true;
                y++;
            }

            if (current_margin_left < margin_left_middle) {
                buffer_image = "left";
                y--;
            } else if (current_margin_left >= margin_left_middle) {
                buffer_image = "right";
            }
            category_offset = y - 4;

            if (category_offset < 0) {
                direction = "left";
                var forth_animation = margin_left_middle;
                var rollback = margin_left_middle - width_child;
                category_offset = Math.abs(category_offset);
            } else if (category_offset > 0) {
                direction = "right";
                var forth_animation = margin_left_middle - width_child;
                var rollback = margin_left_middle;
            }

            if (!(buffer_image == direction)) {
                if (direction == "right") {
                    $("#categories_wrapper").children().eq(0).remove();
                    var buffer = $("#categories_wrapper").children().eq(1).clone();
                    $("#categories_wrapper").append(buffer);
                    $("#categories_wrapper").css({
                        "margin-left": margin_left_middle
                    });
                } else if (direction == "left") {
                    $("#categories_wrapper").children().eq(-1).remove();
                    var buffer = $("#categories_wrapper").children().eq(-2).clone();
                    $("#categories_wrapper").prepend(buffer);
                    $("#categories_wrapper").css({
                        "margin-left": (margin_left_middle - width_child)
                    });
                }
            }

            var animation_type = "linear";
            var animation_obj_forth = ({
                'margin-left': forth_animation
            });
            var animation_obj_rollback = ({
                'margin-left': rollback
            });

            var animation_count = 0;
            for (var x = 0; x < category_offset; x++) {
                //console.log('for x : ' + x + " offset: " + category_offset);
                if (x == category_offset - 1) {
                    animation_type = "easeOutBack";
                    speed = speed * 4;
                }
                $("#categories_wrapper").animate(animation_obj_forth, speed, animation_type, function() {
                    //console.log('animate: ' + x);
                    if (direction == "left") {
                        $("#categories_wrapper").children().eq(-1).remove();
                        $("#categories_wrapper").prepend($("#categories_wrapper").children().eq(-2).clone());
                        $("#categories_wrapper").css(
                            animation_obj_rollback
                        );
                    } else if (direction == "right") {
                        $("#categories_wrapper").children().eq(0).remove();
                        var buffer = $("#categories_wrapper").children().eq(1).clone();
                        $("#categories_wrapper").append(buffer);
                        $("#categories_wrapper").css(
                            animation_obj_rollback
                        );
                    }
                    animation_count++;
                    if (animation_count == category_offset) {
                        callback();
                    }
                });
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

    function scroll_content(direction, orientation, pixel, content_div) {

        var css_direction;
        var css_changes_obj = {};
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
            current_position = $(content_div).position().left;
            content_end = $(content_div).width();
            parent_end = $(content_div).parent().width();
        } else if (orientation === "vertical") {
            css_direction = "top";
            current_position = $(content_div).position().top;
            content_end = $(content_div).height();
            parent_end = $(content_div).parent().height();

        }

        eval("css_changes_obj = {" + css_direction + ": '" + transition + "'}");

        if (current_position < 0 && direction === "back" || current_position + content_end > parent_end && direction === "forth") {

            if (parent_end - content_end > current_position + (pos_neg * pixel) && direction === "forth") {
                eval("css_changes_obj = {" + css_direction + ": '" + (parent_end - content_end) + "px'}");
                $(content_div).css(css_changes_obj);
            } else if (current_position + (pos_neg * pixel) > 0 && direction === "back") {
                eval("css_changes_obj = {" + css_direction + ": '0px'}");
                $(content_div).css(css_changes_obj);
            } else {
                $(content_div).css(css_changes_obj);
            }
        }
    }

    function slide_start(direction, orientation, pixel, speed, content_div) {
        //console.log("direction: " + direction + " pixel: " + pixel + " speed: " + speed + " content_div: " + content_div);
        var animation_obj = {};
        var css_direction;
        var current_position;
        var content_end;
        var pos_neg;
        var parent_end;

        if ($(content_div).filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
        {

            if (direction === "back") {
                transition = "+=" + pixel + "px";
                pos_neg = +1;
            } else if (direction === "forth") {
                transition = "-=" + pixel + "px";
                pos_neg = -1;
            }

            if (orientation === "horizontal") {
                css_direction = "left";
                current_position = $(content_div).position().left;
                content_end = $(content_div).width();
                parent_end = $(content_div).parent().width();
            } else if (orientation === "vertical") {
                css_direction = "top";
                current_position = $(content_div).position().top;
                content_end = $(content_div).height();
                parent_end = $(content_div).parent().height();

            }

            eval("animation_obj = {" + css_direction + ": '" + transition + "'}");

            //Rekursiver Intervall (unendlich)
            var action = function() {
                //Animation im laufenden Intervall
                if (current_position < 0 && direction === "back" || current_position + content_end > parent_end && direction === "forth") {

                    if (parent_end - content_end > current_position + (pos_neg * pixel) && direction === "forth") {
                        eval("animation_obj = {" + css_direction + ": '" + (parent_end - content_end) + "px'}");
                        $(content_div).animate(animation_obj, speed, "linear");
                    } else if (current_position + (pos_neg * pixel) > 0 && direction === "back") {
                        eval("animation_obj = {" + css_direction + ": '0px'}");
                        $(content_div).animate(animation_obj, speed, "linear");
                    } else {
                        $(content_div).animate(animation_obj, speed, "linear");
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
                $("#scrounge_item_slot_" + $(this).attr("class").substr(54)).addClass("proper_droppable_slot");
            },
            stop: function() {
                $(this).show();
                $("#scrounge_item_slot_" + $(this).attr("class").substr(54)).removeClass("proper_droppable_slot");
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
            $('.range_slider_tooltip').hide();

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
    }

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

    var category_names = ["mine", "laboratory", "battlefield", "workshop", "thievery", "smelter"];

    $(window).resize(function() {
        if ($(window).width() < 1920 && current_resolution != "<1920" && $("#loginWrapper").length == 0) {
            current_resolution = "<1920";
            $("#wrong_resolution").css({
                "display": "block"
            });
            $("#right_resolution").css({
                "display": "none"
            });
        } else if ($(window).width() >= 1920 && current_resolution != ">=1920" && $("#loginWrapper").length == 0) {
            current_resolution = ">=1920";
            $("#wrong_resolution").css({
                "display": "none"
            });
            $("#right_resolution").css({
                "display": "block"
            });
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

    function showInfoTextAnimation(text) {

        var textForAnimation = text.substring(1);
        var textAnimation = document.createElement("p");
        var textAnimationWrapper = document.createElement("div");
        textAnimation.innerHTML = textForAnimation;
        textAnimation.style.color = checkColorCode(text);
        textAnimation.id = "textAnimation";
        textAnimation.className = "hammersmith";
        textAnimationWrapper.id = "textAnimationWrapper";
        textAnimationWrapper.className = "div_center_vertical";

        if (document.getElementById("oben")) document.getElementById("oben").appendChild(textAnimationWrapper);
        if (document.getElementById("textAnimationWrapper")) document.getElementById("textAnimationWrapper").appendChild(textAnimation);
        setTimeout(function() {
            if (document.getElementById("textAnimationWrapper")) document.getElementById("oben").removeChild(document.getElementById("textAnimationWrapper"))
        }, 1000);
    }

    function checkColorCode(infoLogText) {

        var logInput = infoLogText.substring(1);
        var colorCode = infoLogText.substring(0, 1);
        var color;

        switch (colorCode) {

            /*positive message*/
            case "0":

                color = "tomato";
                break;

                /*negative message*/
            case "1":

                color = "greenyellow";
                break;

                /*neutral message*/
            case "2":

                color = "white";

            default:

        }

        return color;
    }

    function infoLog(text) {

        var logInput = text.substring(1);
        var log = document.createElement("div");
        log.innerHTML = logInput;
        log.className = "logs";
        log.style.color = checkColorCode(text);
        $("#infoLog").prepend(log);

    }

    //returns true if locked

    function checkScroungeMine(slotId, myName, currentUser) {

        //get Data Context
        var self = Template.instance().state.get('self');
        var ownRate = Template.instance().state.get('ownRate');
        var amountScrSlots = Template.instance().state.get('amountScrSlotsM');
        var victims = Template.instance().state.get('victimsM');

        //CHECK IF YOU ARE TRYING TO SCROUNGE YOURSELF OR TARGET IS ALLRDY SCROUNGED
        // if (currentUser == myName) {
        if (currentUser == self) {
            return 'You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O';
        }
        var resultScrounger = -1;
        for (i = 0; i < amountScrSlots; i++) {
            if (victims[i] == currentUser) {
                return 'You cannot scrounge here: You already scrounge this user!';
            } else if (victims[i] == "") {
                resultScrounger = i;
                break;
            }
        }
        if (resultScrounger == -1) {
            return 'You cannot scrounge here: Your Scrounge slots are all in use!';
        }
        //CHECK FREE SUPSLOTS OF CURRENT USER DATA                
        //Get free SupSlots index
        cursorPlayerDataCu = WorldMapPlayerData.findOne({
            user: currentUser
        }, {
            fields: {
                mine: 1
            }
        }).mine;
        var amountSupSlots = cursorPlayerDataCu.amountSupSlots;
        var chosenScroungeSlot = cursorPlayerDataCu.ownSlots['owns' + slotId];

        var resultOwner = -1;
        for (i = 0; i < amountSupSlots; i++) {
            if (chosenScroungeSlot['sup' + i].name == "") {
                resultOwner = i;
                break;
            }
        }
        //LAST CHECK: RANGE SLIDER
        if (!(chosenScroungeSlot.control.min <= ownRate && ownRate <= chosenScroungeSlot.control.max)) {
            return 'You cannot scrounge here: You do not have the right miningrate!';
        }
        //SupSlot with id result is free and correct: update it ?
        if (resultOwner == -1) {
            return 'You cannot scrounge here: The owners support slots are all used!';
        }
        return false;
    }

    function checkScroungeBattlefield(slotId, myName, currentUser) {

        //get Data Context
        var self = Template.instance().state.get('self');
        var ownEpic = Template.instance().state.get('ownEpic');
        var amountScrSlots = Template.instance().state.get('amountScrSlotsB');
        var victims = Template.instance().state.get('victimsB');

        //CHECK IF YOU ARE TRYING TO SCROUNGE YOURSELF OR TARGET IS ALLRDY SCROUNGED
        if (currentUser == self) {
            return 'You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O';
        }
        var resultScrounger = -1;
        for (i = 0; i < amountScrSlots; i++) {
            if (victims[i] == currentUser) {
                return 'You cannot scrounge here: You already scrounge this user!';
            } else if (victims[i] == "") {
                resultScrounger = i;
                break;
            }
        }
        if (resultScrounger == -1) {
            return 'You cannot scrounge here: Your Scrounge slots are all in use!';
        }
        //CHECK FREE SUPSLOTS OF CURRENT USER DATA                
        //Get free SupSlots index
        cursorPlayerDataCu = WorldMapPlayerData.findOne({
            user: currentUser
        }, {
            fields: {
                battlefield: 1
            }
        });
        var amountSupSlots = cursorPlayerDataCu.battlefield.amountSupSlots;
        var chosenScroungeSlot = cursorPlayerDataCu.battlefield.ownSlots['owns' + slotId];
        var resultOwner = -1;
        for (i = 0; i < amountSupSlots; i++) {
            if (chosenScroungeSlot['sup' + i].name == "") {
                resultOwner = i;
                break;
            }
        }
        //LAST CHECK: RANGE SLIDER
        if (!(chosenScroungeSlot.control.min <= ownEpic && ownEpic <= chosenScroungeSlot.control.max)) {
            return 'You cannot scrounge here: You do not have the right epicness!';
        }
        //SupSlot with id result is free and correct: update it ?
        if (resultOwner == -1) {
            return 'You cannot scrounge here: The owners support slots are all used!';
        }
        return false;
    }

    function renderActiveMiddle() {
        // console.log('renderActiveMiddle');
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
        } else {
            Router.current().render(menu + 'Scrounge', {
                to: 'middle'
            });
        }
    }

    function switchToWorldMap() {
        //console.time("SWITCH TO WORLD MAP");
        //console.time("SWITCH TO WORLD MAP2");
        // console.log("SWITCH TO WORLD MAP");
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
            //"$exists: true" > mongo syntax, sucht alle Dokumente, die das Feld "maxXY" haben
            //in diesem Fall ist das nur ein Objekt
            //workaround, weil Suche über _id nicht funktioniert
            var maxX = parseInt(STATUS.findOne({
                maxXY: {
                    $exists: true
                }
            }).maxXY);
            //Für den Fall, dass die Map symmetrisch ist, sind maxY und maxX identisch
            //wird im Weiteren getrennt behandelt, damit das flexibel bleibt und bei
            //Bedarf geändert werden kann
            var maxY = maxX;
            initWorldMapArray(cursorUser.x, cursorUser.y, maxX, maxY);
        }
    }

    function navigateWorldMap(direction) {
        // //console.time("NAVIGATE WORLD MAP");
        //get max map size
        var maxX = parseInt(STATUS.findOne({
            maxXY: {
                $exists: true
            }
        }).maxXY);
        var maxY = maxX;
        switch (direction) {
            case "worldMapGoUp":
                //Scheint zu funktionieren
                //Die subscriptions müssen irgendwie noch händisch wieder gestoppt werden
                //eventuell?! Prüfen!
                var neededWorldMapFields = {};
                var xNewColumn = [];
                var yNewColumn = [];
                yNewColumn[0] = worldMapArray[5].columns[0].y + 1;
                if (yNewColumn[0] > maxY) yNewColumn[0] = 0;
                var currentLeftx = worldMapArray[5].columns[0].x;
                var yValue = worldMapArray[0].columns[0].y + 1;
                for (var i = 0; i < mapColumns; i++) {
                    xNewColumn[i] = currentLeftx;
                    currentLeftx++;
                }
                neededWorldMapFields[0] = xNewColumn;
                neededWorldMapFields[1] = yNewColumn;
                //subscribed die client only collection, die Daten aus der playerData enthält, aber nur solche, die
                //für die worldMap relevant sind (vorher "worldMapPlayerData")
                Meteor.subscribe("playerDataForWorldMap", neededWorldMapFields, function() {
                    if (yValue > maxY) yValue = 0
                    initWorldMapArray(worldMapArray[0].columns[0].x, yValue, maxX, maxY);
                    // //console.timeEnd("NAVIGATE WORLD MAP");
                });
                break;
            case "worldMapGoDown":
                var neededWorldMapFields = {};
                var xNewColumn = [];
                var yNewColumn = [];
                yNewColumn[0] = worldMapArray[0].columns[0].y - 1;
                if (yNewColumn[0] < 0) yNewColumn[0] = maxY;
                var currentLeftx = worldMapArray[5].columns[0].x;
                var yValue = worldMapArray[0].columns[0].y - 1;
                for (var i = 0; i < mapColumns; i++) {
                    xNewColumn[i] = currentLeftx;
                    currentLeftx++;
                }
                neededWorldMapFields[0] = xNewColumn;
                neededWorldMapFields[1] = yNewColumn;
                //get user data for new worldMap fields from database
                Meteor.subscribe("playerDataForWorldMap", neededWorldMapFields, function() {
                    if (yValue < 0) yValue = maxY
                    initWorldMapArray(worldMapArray[0].columns[0].x, yValue, maxX, maxY);
                    // //console.timeEnd("NAVIGATE WORLD MAP");
                });
                break;
            case "worldMapGoRight":
                //console.log(worldMapArray);
                var neededWorldMapFields = {};
                var xNewColumn = [];
                var yNewColumn = [];
                xNewColumn[0] = worldMapArray[0].columns[7].x + 1;
                if (xNewColumn[0] > maxX) xNewColumn[0] = 0;
                var currentbottomy = worldMapArray[0].columns[0].y;
                var xValue = worldMapArray[0].columns[0].x + 1;
                for (var i = 0; i < mapRows; i++) {
                    yNewColumn[i] = currentbottomy;
                    currentbottomy++;
                }
                neededWorldMapFields[0] = xNewColumn;
                neededWorldMapFields[1] = yNewColumn;
                //get user data for new worldMap fields from database
                Meteor.subscribe("playerDataForWorldMap", neededWorldMapFields, function() {
                    if (xValue > maxX) xValue = 0
                    initWorldMapArray(xValue, worldMapArray[0].columns[0].y, maxX, maxY);
                    // //console.timeEnd("NAVIGATE WORLD MAP");
                });
                break;
            case "worldMapGoLeft":
                var neededWorldMapFields = {};
                var xNewColumn = [];
                var yNewColumn = [];
                xNewColumn[0] = worldMapArray[0].columns[0].x - 1;
                if (xNewColumn[0] < 0) xNewColumn[0] = maxX;
                var currentbottomy = worldMapArray[0].columns[0].y;
                var xValue = worldMapArray[0].columns[0].x - 1;
                for (var i = 0; i < mapRows; i++) {
                    yNewColumn[i] = currentbottomy;
                    currentbottomy++;
                }
                neededWorldMapFields[0] = xNewColumn;
                neededWorldMapFields[1] = yNewColumn;
                //get user data for new worldMap fields from database
                Meteor.subscribe("playerDataForWorldMap", neededWorldMapFields, function() {
                    if (xValue < 0) xValue = maxX
                    initWorldMapArray(xValue, worldMapArray[0].columns[0].y, maxX, maxY);
                    // //console.timeEnd("NAVIGATE WORLD MAP");
                });
                break;
            default:
                console.log('default case: worldMapNavigators');
                break;
        }
        Session.set("worldMapArray", worldMapArray);
    }

    var worldMapArray = new Array();

    function initWorldMapArray(orientationX, orientationY, maxX, maxY) {
        //reset array
        worldMapArray.length = 0;
        //go all rows
        for (var i = 0; i < mapRows; i++) {
            worldMapArray.push(createRowObject(orientationX, orientationY, maxX, maxY, i));
        }
        // //console.timeEnd('SWITCH TO WORLD MAP2');
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
            //benutzt die client only collection, die Daten aus der playerData enthält, aber nur solche, die
            //für die worldMap relevant sind
            var cursorUser = WorldMapPlayerData.findOne({
                x: (orientationX + j) % (maxX + 1),
                y: (orientationY + rowNo) % (maxY + 1)
            }, {
                fields: {
                    user: 1,
                    level: 1,
                    backgroundId: 1
                }
            });
            //nicht alle worldMap Positionen haben einen Spieler. In diesem Fall ist cursorUser undefined.
            var infoMemory = {};
            //without user push empty object
            if (cursorUser != null) {
                var user = cursorUser.user;
                var playerLevel = cursorUser.level;
                var backgroundNumber = cursorUser.backgroundId;
                infoMemory['playerLevel'] = playerLevel;
                infoMemory['playerImage'] = "worldMapPlayerImage";
                if (playerLevel < 10) {
                    infoMemory['playerImageId'] = "-640px -138px";
                    if (myName == user) infoMemory['playerImageId'] = "-560px -138px";
                } else {
                    infoMemory['playerImageId'] = "-720px -138px";
                    if (myName == user) infoMemory['playerImageId'] = "-800px -138px";
                }
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

    var deps_count = 0;

    Deps.autorun(function() {
        //DEPS AUTORUN FOR RANGE SLIDER
        var init = Session.get("init");
        // console.log("count: " + deps_count);
        if (deps_count == 1) {

            init_draggable();
            init_droppable();

            $("#right_resolution").append("<div id='item_tooltip_window' title=''></div>");
            $("#right_resolution").append("<div id='short_tooltip_window' title=''><div id='short_tooltip_background'><p id='short_tooltip_text' class='text'></p></div></div>");

            if ($(window).width() < 1920 && $("#loginWrapper").length == 0) {
                current_resolution = "<1920";
                $("#wrong_resolution").css({
                    "display": "block"
                });
                $("#right_resolution").css({
                    "display": "none"
                });
            }
            if ($(window).width() >= 1920 && $("#loginWrapper").length == 0) {
                current_resolution = ">=1920";
                $("#wrong_resolution").css({
                    "display": "none"
                });
                $("#right_resolution").css({
                    "display": "block"
                });
            }

            var menu = Meteor.users.findOne({
                _id: Meteor.userId()
            }).menu;
            var break_while = false;
            var while_count = 0;
            while (while_count < category_names.length && break_while == false) {
                if (menu.search(category_names[while_count]) == 0)
                    break_while = true;
                while_count++;
            }
            var category_offset_left = (Math.abs(while_count - 6) + current_category) % 6;
            for (var x = 0; x < (category_offset_left); x++) {
                $("#categories_wrapper").children().eq(-1).remove();
                $("#categories_wrapper").prepend($("#categories_wrapper").children().eq(-2).clone());
            }
            current_category = while_count;
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
                    var input = cursorPlayerData.mine.ownSlots;
                    amountSlots = cursorPlayerData.mine.amountOwnSlots;
                    amountScroungeSlots = cursorPlayerData.mine.amountSrcSlots;
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
                    var input = cursorPlayerData.mine.ownSlots;
                    amountSlots = cursorPlayerData.mine.amountOwnSlots;
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
                    var input = cursorPlayerData.battlefield.ownSlots;
                    amountSlots = cursorPlayerData.battlefield.amountOwnSlots;
                    amountScroungeSlots = cursorPlayerData.battlefield.amountSrcSlots;
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
                    var input = cursorPlayerData.battlefield.ownSlots;
                    amountSlots = cursorPlayerData.battlefield.amountOwnSlots;
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

    function createBots(k, l) {
        for (var i = k; i < l + 1; i++) {
            Meteor.call('initBots', i, function(error, result) {
                if (error) {
                    console.log('err bot creation:', error.reason);
                    return;
                }
                console.log('Bots created!');
            });
        }
    }

    ///////////////////
    //// DEBUGGING ////
    ///////////////////

    function logRenders() {
        _.each(Template, function(template, name) {
            var oldRender = template.rendered;
            var counter = 0;

            template.rendered = function() {
                // console.log(name, "render count: ", ++counter);
                oldRender && oldRender.apply(this, arguments);
            };
        });
    }

    //SpriteSheet anpassen

    function moveSpriteSheetBackground(pos, classToBeChanged, scrounge) {

        var styleSheetList = document.styleSheets;
        var rules = styleSheetList[0].cssRules;

        /*to get the width of the spritesheet*/
        var tempImg = new Image;
        //Man könnte theoretisch auch jedes andere div nehmen, das das SpriteSheet als background-image hat
        tempImg.src = $("#scrounge").css('background-image').replace(/url\(|\)$/ig, "");
        var spriteSheetWidth = tempImg.width;

        /*Der Umweg via split ist notwendig, da Firefox background-position-x bzw. -y nicht unterstützt*/
        var posXY = pos.split(" ");
        var posXAbsolute = Math.abs(parseInt(posXY[0]));

        /*console.log(posXY[0]); 
          console.log("case 1 "+ (posXAbsolute < spriteSheetWidth/4 || (posXAbsolute >= spriteSheetWidth/2 && posXAbsolute < spriteSheetWidth*0.75)));*/
        /*          console.log(posXAbsolute+" "+spriteSheetWidth/4+" "+posXAbsolute+" "+spriteSheetWidth/2+" "+posXAbsolute+" "+spriteSheetWidth*0.75);*/

        //Falls es sich um eine Schaltfläche im Status "normal" handelt (linke Abfrage Base / rechte Abfrage Scrounge)
        if (posXAbsolute < spriteSheetWidth / 4 || (posXAbsolute >= spriteSheetWidth / 2 && posXAbsolute < spriteSheetWidth * 0.75)) {
            var newPosX = parseInt(posXY[0]) - (spriteSheetWidth / 4);
            /*console.log("IF "+newPosX);*/
        }
        //Falls es sich um eine Schaltfläche im Status "hovered" handelt
        else {
            var newPosX = parseInt(posXY[0]) + (spriteSheetWidth / 4);
        }
        for (i = 0; i < rules.length; i++) {
            /*console.log("obereForSchleife "+i)*/
            //Falls kleinstes SpriteSheet, classToBeChanged Klasse ist in der obersten Ebene des spriteSheets zu finden
            if (spriteSheetWidth == 1472) {

                /*console.log("kleinstesSpriteSheet");*/
                if (rules[i].selectorText == classToBeChanged) {
                    rules[i].style.backgroundPosition = newPosX + "px " + posXY[1];
                    /*                console.log(rules[i].style.backgroundPosition);*/
                    break;
                }

            }

            //Falls mittelgroßes SpriteSheet
            else if (spriteSheetWidth == 1880) {

                /*console.log("mittelgroßesSpriteSheet");*/
                if (rules[i].cssText.substr(0, 42) == "@media only screen and (max-width: 1919px)") {
                    //spriteSheet rules in tieferer Verschachtelung innerhalb der spriteSheet rule der media queries
                    var rulesInner = rules[i].cssRules;
                    for (k = 0; k < rulesInner.length; k++) {
                        /*console.log("innereForSchleife" + k);*/
                        if (rulesInner[k].selectorText == classToBeChanged) {
                            rulesInner[k].style.backgroundPosition = newPosX + "px " + posXY[1];
                            /*console.log("mittelgroß "+rulesInner[k].style.backgroundPosition);*/
                            break;
                        }
                    }
                }
            } else if (spriteSheetWidth == 2800) {

                /*console.log("großesSpriteSheet");
              console.log(rules[i].cssText.substr(0,42));*/
                /*console.log(rules[i].cssText.substr(0,42) == "@media only screen and (min-width: 1920px)");*/
                if (rules[i].cssText.substr(0, 42) == "@media only screen and (min-width: 1920px)") {
                    //spriteSheet rules in tieferer Verschachtelung innerhalb der spriteSheet rule der media queries
                    var rulesInner = rules[i].cssRules;
                    for (j = 0; j < rulesInner.length; j++) {
                        /*console.log("innereForSchleife" + j);*/
                        /*console.log(rulesInner[j].selectorText);
                        console.log(rulesInner[j].selectorText==classToBeChanged);*/
                        if (rulesInner[j].selectorText == classToBeChanged) {
                            rulesInner[j].style.backgroundPosition = newPosX + "px " + posXY[1];
                            /*console.log("groß "+rulesInner[j].style.backgroundPosition);*/
                            break;
                        }
                    }
                }
            }
        }
    }
}
