///// WORLD MAP /////
Template.worldMap.onCreated(function() {
    //TO-DO: Rebuild the playerData like it was before!!! Just subscribe to full data then!!!
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
        var subsSelfM = inst.subscribe('playerDataMine', self);
        var subsSelfB = inst.subscribe('playerDataBattlefield', self);
        var subsSelfMineScrounge = inst.subscribe('mineScrounge', self);
        var subsMineBase = inst.subscribe('mineBase', inst.state.get('player'));
        var subsMineSupport = inst.subscribe('mineSupport', inst.state.get('player'));
        var subsSelfBattlefieldScrounge = inst.subscribe('battlefieldScrounge', self);
        var subsBattlefieldBase = inst.subscribe('battlefieldBase', inst.state.get('player'));
        var subsBattlefieldSupport = inst.subscribe('battlefieldSupport', inst.state.get('player'));

        inst.state.set('self', self);
    })

    // OLD OLD 2015/12/26 OLD OLD
    // var inst = this;
    // inst.state = new ReactiveDict();
    // var self = Meteor.users.findOne({
    //     _id: Meteor.userId()
    // }, {
    //     fields: {
    //         username: 1
    //     }
    // }).username;
    // inst.autorun(function() {
    //     var subsSelfM = inst.subscribe('playerDataMine', [self]);
    //     var subsSelfB = inst.subscribe('playerDataBattlefield', [self]);
    //     if (subsSelfM.ready() && subsSelfB.ready()) {
    //         var cursorMyPlayerData = playerData.findOne({
    //             user: self
    //         }, {
    //             fields: {
    //                 mine: 1,
    //                 battlefield: 1
    //             }
    //         });
    //         if (cursorMyPlayerData) {
    //             //Die Funktionen checkScroungeMine/Battlefield werden aus zwei verschiedenen Templates heraus
    //             //aufgerufen.
    //             console.log('cursorMyPlayerData:', cursorMyPlayerData);
    //             var amountScrSlotsB = cursorMyPlayerData.battlefield.amountScrSlots;
    //             var amountScrSlotsM = cursorMyPlayerData.mine.amountScrSlots;
    //             var ownRate = cursorMyPlayerData.mine.scrItem.benefit;
    //             var ownEpic = cursorMyPlayerData.battlefield.scrItem.benefit;
    //             victimsM = [];
    //             for (i = 0; i < amountScrSlotsM; i++) {
    //                 victimsM[i] = cursorMyPlayerData.mine.scrSlots['scrs' + i].victim.name;
    //             }
    //             inst.state.set('victimsM', victimsM);
    //             victimsB = [];
    //             for (i = 0; i < amountScrSlotsB; i++) {
    //                 victimsB[i] = cursorMyPlayerData.battlefield.scrSlots['scrs' + i].victim.name;
    //             }
    //             inst.state.set('victimsB', victimsB);

    //             //set Data Context for other helpers and connected methods (e.g. checkScroungeMine/Battlefield)
    //             inst.state.set('self', self);
    //             inst.state.set('ownRate', ownRate);
    //             inst.state.set('ownEpic', ownEpic);
    //             inst.state.set('amountScrSlotsM', amountScrSlotsM);
    //             inst.state.set('amountScrSlotsB', amountScrSlotsB);
    //             //console.timeEnd('createWorldMap');
    //             //console.timeEnd("SWITCH TO WORLD MAP");
    //             // console.log('worldMapDict');
    //             // console.log(inst.state);
    //         }
    //     }
    // })
    // OLD OLD 2015/12/26 OLD OLD
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
        Template.instance().state.set('player', player);
        var obj0 = {};
        obj0['id'] = 'preview' + player;
        $("#scroungePreviewWrapper").css({
            "left": $(e.currentTarget).css("left")
        });
        $("#scroungePreviewWrapper").css({
            "bottom": $(e.currentTarget).css("bottom")
        });

        //check mine
        var activeSlotsCount = 0;
        var falseCount = 0;
        var playerActiveSlots = mineBase.find({
            user: player,
            input: {
                $ne: "0000"
            }
        }).fetch();
        activeSlotsCount = playerActiveSlots.length;
        for (var i = 0; i < playerActiveSlots.length; i++) {
            if (isScroungeable('mine', self, player, playerActiveSlots[i].slotID).result == false) {
                falseCount++;
            }
        }
        obj0['mineImpossible'] = falseCount;
        obj0['mineMax'] = activeSlotsCount;
        if (activeSlotsCount - falseCount == 0) {
            obj0['mineLocked'] = true;
        } else {
            obj0['mineLocked'] = false;
        }
        if (activeSlotsCount == 0 && self != player) {
            obj0['mineInactive'] = true;
        }

        //check battlefield
        var activeSlotsCount = 0;
        var falseCount = 0;
        var playerActiveSlots = battlefieldBase.find({
            user: player,
            input: {
                $ne: "0000"
            }
        }).fetch();
        activeSlotsCount = playerActiveSlots.length;
        for (var i = 0; i < playerActiveSlots.length; i++) {
            if (isScroungeable('battlefield', self, player, playerActiveSlots[i].slotID).result == false) {
                falseCount++;
            }
        }
        obj0['battlefieldImpossible'] = falseCount;
        obj0['battlefieldMax'] = activeSlotsCount;
        if (activeSlotsCount - falseCount == 0) {
            obj0['battlefieldLocked'] = true;
        } else {
            obj0['battlefieldLocked'] = false;
        }
        if (activeSlotsCount == 0 && self != player) {
            obj0['battlefieldInactive'] = true;
        }

        Session.set("worldMapPreview", obj0);
        $("#scroungePreviewWrapper").css({
            display: "block"
        });
        $("#scroungePreviewWrapper").stop().fadeTo("fast", 1);

        // OLD OLD 2015/12/26 OLD OLD
        // get db data
        // var cursorPlayerData = WorldMapPlayerData.findOne({
        //     user: player
        // }, {
        //     fields: {
        //         mine: 1,
        //         battlefield: 1,
        //     }
        // });
        // //Check mine
        // var amountOwnSlots = cursorPlayerData.mine.amountOwnSlots;
        // var trueCount = 0;
        // var falseCount = 0;
        // var maxCount = 0;
        // //Iterate OwnSlots
        // for (var i = 0; i < amountOwnSlots; i++) {
        //     var matterId = cursorPlayerData.mine.ownSlots['owns' + i].input;
        //     if (matterId > 0) {
        //         maxCount++;
        //         trueCount++;
        //         //check all circumstances
        //         cannot be "==true": has to be !=false
        //         if (checkResult.result == false) falseCount++;
        //     }
        // }
        // OLD OLD 2015/12/26 OLD OLD

        // OLD OLD 2016/01/09 OLD OLD
        // //Check battlefield
        // var amountOwnSlots = cursorPlayerData.battlefield.amountOwnSlots;
        // var trueCount = 0;
        // var falseCount = 0;
        // var maxCount = 0;
        // //Iterate OwnSlots
        // for (var i = 0; i < amountOwnSlots; i++) {
        //     var fightId = cursorPlayerData.battlefield.ownSlots['owns' + i].input;
        //     if (fightId > 0) {
        //         maxCount++;
        //         trueCount++;
        //         //check all circumstances
        //         // var checkResult = checkScroungeBattlefield(i, self, player);
        //         //cannot be "==true": has to be !=false
        //         if (checkResult != false) falseCount++;
        //     }
        // }
        // obj0['battlefieldImpossible'] = falseCount;
        // obj0['battlefieldMax'] = maxCount;
        // if (trueCount - falseCount > 0 || maxCount == 0) {
        //     obj0['battlefieldResult'] = false;
        // } else {
        //     obj0['battlefieldResult'] = true;
        // }
        // if (maxCount == 0 && self != player) {
        //     obj0['battlefieldInactive'] = true;
        // }
        // OLD OLD 2016/01/09 OLD OLD
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
            // console.log('ready:', ready);
        }
    })
});

//PI
Template.scroungePreview.helpers({
    previewInfos: function() {
        return Session.get("worldMapPreview");
    },
});

switchToWorldMap = function() {
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
        case "worldMapHomeButton":
            var cursorUser = Meteor.users.findOne({
                _id: Meteor.userId()
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
            break;
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
            for (var i = 0; i < GV_mapColumns; i++) {
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
            for (var i = 0; i < GV_mapColumns; i++) {
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
            for (var i = 0; i < GV_mapRows; i++) {
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
            for (var i = 0; i < GV_mapRows; i++) {
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

initWorldMapArray = function(orientationX, orientationY, maxX, maxY) {
    //reset array
    worldMapArray.length = 0;
    //go all rows
    for (var i = 0; i < GV_mapRows; i++) {
        worldMapArray.push(createRowObject(orientationX, orientationY, maxX, maxY, i));
    }
    // //console.timeEnd('SWITCH TO WORLD MAP2');
    Session.set("worldMapArray", worldMapArray);
}

createRowObject = function(orientationX, orientationY, maxX, maxY, rowNo) {
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
    for (var j = 0; j < GV_mapColumns; j++) {
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

            for (var i = 0; i < GV_mapRows; i++) {
                for (var j = 0; j < GV_mapColumns; j++) {
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

//Created by Michael Kochanke, 30.08.2014
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
