////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// SERVER /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isServer) {
    var turfUpdateArray = new Array();
    //Array, das Fertigstellung der slots trackt
    var timers = [];

    //Methods
    Meteor.methods({
        asyncJob: function() {
            this.unblock();
        },

        getServerTime: function() {
            console.log('getServerTime server: ' + new Date());
            return new Date();
        },

        createMapPosition: function(username) {
            turfUpdateArray.length = 0;
            //Find random position
            //Find turf highest size
            var cursorGodTurf = Turf.find({}, {
                fields: {
                    turfSize: 1,
                    density: 1,
                    _id: 1
                },
                sort: {
                    turfSize: -1
                }
            }).fetch()[0];
            //Check average density value: <60% create position:extend mapSize
            console.log('Avg. Density: ' + cursorGodTurf.density);
            if (cursorGodTurf.density < 55) {
                //Set player position on free slot and update density
                //Find lowest density Turf, babyTurf
                turfUpdateArray.push(cursorGodTurf._id);
                var babyTurfId = Meteor.call('getBabyTurf', cursorGodTurf._id);
                var cursorBabyTurf = Turf.findOne({
                    _id: babyTurfId
                }, {
                    fields: {
                        turfSize: 0
                    }
                });
                //Find all free slots
                var freeSlots = new Array();
                for (var i = 0; i < 4; i++) {
                    if (worldMapFields.findOne({
                        _id: cursorBabyTurf['child' + i]
                    }, {
                        fields: {
                            user: 1
                        }
                    }).user == "") {
                        freeSlots.push(i);
                    }
                }
                //Values randomPosition are [0-(freeSlots.length-1)]
                var randomPosition = Math.floor((Math.random() * freeSlots.length));
                //Place player into random free slot
                var obj1 = {};
                obj1['_id'] = cursorBabyTurf['child' + freeSlots[randomPosition]];
                worldMapFields.update(obj1, {
                    $set: {
                        user: username
                    }
                });
                cursorWorldMap = worldMapFields.findOne({
                    user: username
                });
                var obj2 = {};
                obj2['x'] = cursorWorldMap.x;
                obj2['y'] = cursorWorldMap.y;
                Meteor.users.update({
                    username: username
                }, {
                    $set: obj2
                });
                playerData.update({
                    user: username
                }, {
                    $set: obj2
                })
                //Show the new generated map position in the console
                console.log(new Date() + ': Position done - ' + username + ' (x: ' + obj2['x'] + ' y: ' + obj2['y'] + ')!');
                Meteor.call('updateDensity');
            } else {
                //WorldMap has to high density: Extend and create position again
                Meteor.call('extendMapSize', cursorGodTurf);
                Meteor.call('createMapPosition', username);
            }
        },

        getBabyTurf: function(parentTurfId) {
            var cursorParentTurf = Turf.findOne({
                _id: parentTurfId
            });
            //No more Turf childs ?
            if (cursorParentTurf.turfSize == 0) {
                return parentTurfId;
            }
            var cursorChild0 = Turf.findOne({
                _id: cursorParentTurf.child0
            }, {
                fields: {
                    _id: 1,
                    density: 1
                }
            });
            var cursorChild1 = Turf.findOne({
                _id: cursorParentTurf.child1
            }, {
                fields: {
                    _id: 1,
                    density: 1
                }
            });
            var cursorChild2 = Turf.findOne({
                _id: cursorParentTurf.child2
            }, {
                fields: {
                    _id: 1,
                    density: 1
                }
            });
            var cursorChild3 = Turf.findOne({
                _id: cursorParentTurf.child3
            }, {
                fields: {
                    _id: 1,
                    density: 1
                }
            });

            //Lowest density of Turf childs
            var lowestDensity = Math.min(cursorChild0.density, cursorChild1.density, cursorChild2.density, cursorChild3.density);

            //Recursive: get lowest Turf with lowest density - - -
            if (cursorChild0.density == lowestDensity) {
                turfUpdateArray.push(cursorChild0._id);
                return Meteor.call('getBabyTurf', cursorChild0._id);
            } else if (cursorChild1.density == lowestDensity) {
                turfUpdateArray.push(cursorChild1._id);
                return Meteor.call('getBabyTurf', cursorChild1._id);
            } else if (cursorChild2.density == lowestDensity) {
                turfUpdateArray.push(cursorChild2._id);
                return Meteor.call('getBabyTurf', cursorChild2._id);
            } else {
                turfUpdateArray.push(cursorChild3._id);
                return Meteor.call('getBabyTurf', cursorChild3._id);
            }
        },

        updateDensity: function() {
            //Reverse the Array so that the algorithm starts with the lowest Turf size
            turfUpdateArray.reverse();
            //Update BabyTurf - always one element at the beginning of the array
            var obj0 = {};
            obj0['density'] = Meteor.call('getDensity', turfUpdateArray[0]);
            Turf.update({
                _id: turfUpdateArray[0]
            }, {
                $set: obj0
            });
            //Update the other Turf
            for (var i = 1; i < turfUpdateArray.length; i++) {
                var cursorCurrentTurf = Turf.findOne({
                    _id: turfUpdateArray[i]
                });
                var newDensity = Meteor.call('getDensity', turfUpdateArray[i]);
                if (cursorCurrentTurf.density != newDensity) {
                    obj0 = {};
                    obj0['density'] = newDensity;
                    Turf.update({
                        _id: turfUpdateArray[i]
                    }, {
                        $set: obj0
                    });
                }
            }
        },

        getDensity: function(turfId) {
            var cursorCurrentTurf = Turf.findOne({
                _id: turfId
            });
            if (cursorCurrentTurf.turfSize == 0) {
                var field0 = worldMapFields.findOne({
                    _id: cursorCurrentTurf.child0
                }, {
                    fields: {
                        user: 1
                    }
                }).user.length;
                if (field0 > 0) field0 = 1;
                var field1 = worldMapFields.findOne({
                    _id: cursorCurrentTurf.child1
                }, {
                    fields: {
                        user: 1
                    }
                }).user.length;
                if (field1 > 0) field1 = 1;
                var field2 = worldMapFields.findOne({
                    _id: cursorCurrentTurf.child2
                }, {
                    fields: {
                        user: 1
                    }
                }).user.length;
                if (field2 > 0) field2 = 1;
                var field3 = worldMapFields.findOne({
                    _id: cursorCurrentTurf.child3
                }, {
                    fields: {
                        user: 1
                    }
                }).user.length;
                if (field3 > 0) field3 = 1;
                return (((field0 + field1 + field2 + field3) / 4) * 100);
            } else {
                //Get density of childs for this density
                return ((Turf.findOne({
                    _id: cursorCurrentTurf.child0
                }, {
                    fields: {
                        density: 1
                    }
                }).density + Turf.findOne({
                    _id: cursorCurrentTurf.child1
                }, {
                    fields: {
                        density: 1
                    }
                }).density + Turf.findOne({
                    _id: cursorCurrentTurf.child2
                }, {
                    fields: {
                        density: 1
                    }
                }).density + Turf.findOne({
                    _id: cursorCurrentTurf.child3
                }, {
                    fields: {
                        density: 1
                    }
                }).density) / 4);
            }
        },

        extendMapSize: function(cursorGodTurf) {
            //Get orientation and size of the map
            //Bottom left
            var minX = worldMapFields.find({}, {
                fields: {
                    x: 1
                },
                sort: {
                    x: 1
                }
            }).fetch()[0].x;
            var minY = worldMapFields.find({}, {
                fields: {
                    y: 1
                },
                sort: {
                    y: 1
                }
            }).fetch()[0].y;
            //Top right
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
            //The Edge length of the whole map
            var mapEdgeLength = Math.pow(2, cursorGodTurf.turfSize + 1);

            //Create new GodTurf with the old one as child0
            var obj0 = {};
            obj0['child0'] = cursorGodTurf._id;
            obj0['child1'] = Meteor.call('createNewTurf', minX, maxY + 1, maxX, maxY + mapEdgeLength, mapEdgeLength, cursorGodTurf.turfSize);
            obj0['child2'] = Meteor.call('createNewTurf', maxX + 1, maxY + 1, maxX + mapEdgeLength, maxY + mapEdgeLength, mapEdgeLength, cursorGodTurf.turfSize);
            obj0['child3'] = Meteor.call('createNewTurf', maxX + 1, minY, maxX + mapEdgeLength, maxY, mapEdgeLength, cursorGodTurf.turfSize);
            obj0['turfSize'] = cursorGodTurf.turfSize + 1;
            obj0['density'] = 15;
            Turf.insert(obj0);

            //Save new Map size inside worldMapFields collection
            var maxXY = worldMapFields.findOne({maxXY: {$exists: true}}).maxXY;
            var newMaxXY = maxXY*2;

            worldMapFields.update({
                maxXY: maxXY
            }, {
                $set: {
                    maxXY: newMaxXY
                }
            });
        },

        createNewTurf: function(bottomLeftX, bottomLeftY, topRightX, topRightY, mapEdgeLength, turfSize) {
            //It's a Baby Turf?
            if (turfSize == 0) {
                var obj0 = {};
                for (var i = 0; i < 2; i++) {
                    for (var j = 0; j < 2; j++) {
                        var obj1 = {};
                        obj1['x'] = bottomLeftX + j;
                        obj1['y'] = bottomLeftY + i;
                        obj1['user'] = "";
                        worldMapFields.insert(obj1);
                        console.log('===================== new world map field ======================');
                        console.log(worldMapFields.find({
                            x: obj1['x'],
                            y: obj1['y']
                        }, {
                            fields: {
                                _id: 1
                            }
                        }).fetch());
                        var tempFieldId = worldMapFields.findOne({
                            x: obj1['x'],
                            y: obj1['y']
                        }, {
                            fields: {
                                _id: 1
                            }
                        })._id;
                        eval('var child' + j + i + 'Id = tempFieldId;')
                    }
                }
                obj0['child0'] = child00Id;
                obj0['child1'] = child01Id;
                obj0['child2'] = child11Id;
                obj0['child3'] = child10Id;
                obj0['turfSize'] = turfSize;
                obj0['density'] = 0;
                Turf.insert(obj0);
                var tempTurfId = Turf.findOne({
                    child1: obj0['child1']
                }, {
                    fields: {
                        _id: 1
                    }
                })._id;
                return tempTurfId;
            } else {
                //Create new Turf with childs
                var obj0 = {};
                //Recursive: Reduce turfSize until new worldMapFields are generated and connect them as child/parent
                obj0['child0'] = Meteor.call('createNewTurf', bottomLeftX, bottomLeftY, topRightX - (mapEdgeLength / 2), topRightY - (mapEdgeLength / 2), mapEdgeLength / 2, turfSize - 1);
                obj0['child1'] = Meteor.call('createNewTurf', bottomLeftX, bottomLeftY + (mapEdgeLength / 2), topRightX - (mapEdgeLength / 2), topRightY, mapEdgeLength / 2, turfSize - 1);
                obj0['child2'] = Meteor.call('createNewTurf', bottomLeftX + (mapEdgeLength / 2), bottomLeftY + (mapEdgeLength / 2), topRightX, topRightY, mapEdgeLength / 2, turfSize - 1);
                obj0['child3'] = Meteor.call('createNewTurf', bottomLeftX + (mapEdgeLength / 2), bottomLeftY, topRightX, topRightY - (mapEdgeLength / 2), mapEdgeLength / 2, turfSize - 1);
                obj0['turfSize'] = turfSize;
                obj0['density'] = 0;
                Turf.insert(obj0);
                var tempTurfId = Turf.findOne({
                    child1: obj0['child1']
                }, {
                    fields: {
                        _id: 1
                    }
                })._id;
                return tempTurfId;
            }
        },

        //ERROR logging
        infoLog: function(text, username) {
            console.log(new Date() + ': ' + username + ': ' + text);
        },

        //goScroungingMine new
        goScroungingMine: function(slotId) {
            console.time("SCROUNGING");
            var currentUser = Meteor.users.findOne({
                _id: this.userId
            }, {
                fields: {
                    cu: 1
                }
            }).cu;
            var myName = Meteor.users.findOne({
                _id: this.userId
            }, {
                fields: {
                    username: 1
                }
            }).username;
            //CHECK IF YOU ARE TRYING TO SCROUNGE YOURSELF OR TARGET IS ALLRDY SCROUNGED
            if (currentUser == myName) {
                Meteor.call("infoLog", 'You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O', myName);
                return '0You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O';
            }
            var cursorMyPlayerData = playerData.findOne({
                user: myName
            }, {
                fields: {
                    mine: 1
                }
            }).mine;
            var amountScrSlots = cursorMyPlayerData.amountScrSlots;
            for (i = 0; i < amountScrSlots; i++) {
                if (cursorMyPlayerData.scrSlots['scrs' + i].victim.name == currentUser) {
                    Meteor.call("infoLog", 'You cannot scrounge here: You already scrounge this user!', myName);
                    return '0You cannot scrounge here: You already scrounge this user!';
                }
            }
            //CHECK FREE SCRSLOTS OF SCROUNGER DATA
            var resultScrounger = -1;
            for (i = 0; i < amountScrSlots; i++) {
                if (cursorMyPlayerData.scrSlots['scrs' + i].victim.name == "") {
                    resultScrounger = i;
                    break;
                }
            }
            if (resultScrounger == -1) {
                Meteor.call("infoLog", 'You cannot scrounge here: Your Scrounge slots are all in use!', myName);
                return '0You cannot scrounge here: Your Scrounge slots are all in use!';
            }
            //CHECK FREE SUPSLOTS OF CURRENT USER DATA                
            var obj0 = {};
            obj0['owns' + slotId] = 1;
            var cursorCurrentUser = playerData.findOne({
                user: currentUser
            }, {
                fields: {
                    mine: 1
                }
            }).mine;
            //Get free SupSlots index
            var amountSupSlots = cursorCurrentUser.amountSupSlots;
            var resultOwner = -1;
            for (i = 0; i < amountSupSlots; i++) {
                if (cursorCurrentUser.ownSlots['owns' + slotId]['sup' + i].name == "") {
                    resultOwner = i;
                    break;
                }
            }
            //LAST CHECK: RANGE SLIDER
            if (!(cursorCurrentUser.ownSlots['owns' + slotId].control.min <= cursorMyPlayerData.scrItem.benefit && cursorMyPlayerData.scrItem.benefit <= cursorCurrentUser.ownSlots['owns' + slotId].control.max)) {
                Meteor.call("infoLog", 'You cannot scrounge here: You do not have the right miningrate!', myName);
                return '0You cannot scrounge here: You do not have the right miningrate!';
            }

            //SupSlot with id result is free and correct: update it ?
            if (resultOwner == -1) {
                Meteor.call("infoLog", 'You cannot scrounge here: The owners support slots are all used!', myName);
                return '0You cannot scrounge here: The owners support slots are all used!';
            }
            //get benefit of scrounger
            var myBenefit = cursorMyPlayerData.scrItem.benefit; 

            //set time for the scrounging
            var timeStamp = new Date();

            //set playerData of owner
            var obj0 = {};
            obj0['mine.ownSlots.owns' + slotId + '.sup' + resultOwner+'.name'] = myName;
            obj0['mine.ownSlots.owns' + slotId + '.sup' + resultOwner+'.benefit'] = myBenefit;
            obj0['mine.ownSlots.owns' + slotId + '.sup' + resultOwner+'.stamp'] = timeStamp.getTime();
            playerData.update({
                user: currentUser
            }, {
                $set: obj0
            });
            var cursorCurrentUserUpdated = playerData.findOne({
                user: currentUser
            }, {
                fields: {
                    mine: 1
                }
            });

            //set my playerData
            var amountSupSlotsVictim = cursorCurrentUserUpdated.mine.amountSupSlots;
            var amountScrSlotsVictim = cursorCurrentUserUpdated.mine.amountScrSlots;
            var timeStampVictim = cursorCurrentUserUpdated.mine.ownSlots['owns'+slotId].stamp;
            var inputVictim = cursorCurrentUserUpdated.mine.ownSlots['owns'+slotId].input;

            //data for timer
            var progressSups = 0;
            var supRatesAdded = 0;
           
            var obj0 = {};
            //eigener Zeitstempel des Scroungens und eigene Rate
            obj0['mine.scrSlots.scrs' + resultScrounger + '.stamp'] = timeStamp.getTime();
            obj0['mine.scrSlots.scrs' + resultScrounger + '.benefit'] = myBenefit;
            //Anzahl sup slots des Opfers, Zeitstempel und input des gescroungten own slots des Opfers, 
            obj0['mine.scrSlots.scrs' + resultScrounger + '.victim.supSlotsVictim'] = amountSupSlotsVictim;
            obj0['mine.scrSlots.scrs' + resultScrounger + '.victim.stamp'] = timeStampVictim;
            obj0['mine.scrSlots.scrs' + resultScrounger + '.victim.input'] = inputVictim;
            obj0['mine.scrSlots.scrs' + resultScrounger + '.victim.name'] = currentUser;

            //Name und rate von Scroungern des slots und Zeitstempel des Scroungens
            //Für jeden sup slot des Opfers
            for(i = 0; i < amountSupSlotsVictim; i++) {
                var supporter = cursorCurrentUserUpdated.mine.ownSlots['owns'+slotId]['sup'+i];
                //falls sup slot i des gescroungten own slots des Opfers einen Eintrag hat
                if(supporter.name != "") {
                    //hole seinen Namen
                    var supVictimName = supporter.name;
                    //hole seine Rate
                    var supVictimBenefit = supporter.benefit;
                    //hole den Zeitstempel seines Scroungens
                    var supVictimTimeStamp = supporter.stamp;
                    obj0['mine.scrSlots.scrs' + resultScrounger + '.victim.sup' + i + '.name'] = supVictimName;
                    obj0['mine.scrSlots.scrs' + resultScrounger + '.victim.sup' + i + '.benefit'] = supVictimBenefit;
                    obj0['mine.scrSlots.scrs' + resultScrounger + '.victim.sup' + i + '.stamp'] = supVictimTimeStamp;

                    //for timer
                    //der bisherige Fortschritt wird hier gesucht, deshalb wird der scroungende Spieler "myName" ausgeschlossen, da er
                    //erst ab nun an mit macht.
                    if(supVictimName != myName) progressSups = progressSups + (timeStamp.getTime() - supVictimTimeStamp) * (supVictimBenefit / 3600000);
                    //hier wiederum wird der scroungende Spieler bereits mit einbezogen
                    supRatesAdded = supRatesAdded + supVictimBenefit;
                }
            }
            playerData.update({
                user: myName
            }, {
                $set: obj0
            });

            //push timer (hat ein bisschen lag zum "wirklichen" Start, aber das ist vertretbar)
            //timeStamp des own slots, der hier gescroungt wird
            var startTime = timeStampVictim;
            var progressOwner = (timeStamp.getTime() - startTime) * (7.5 / 3600000);
            console.log('startTime',startTime);
            console.log('scroungeTime', timeStamp.getTime());
            console.log('progressOwner',progressOwner);
            console.log('progressSups',progressSups);
            console.log('supRatesAdded',supRatesAdded);
            //bei progressSups werden nur die berücksichtigt, die bereits vorhanden waren bis 
            //zum Zeitpunkt des Scroungens
            var progressTotal = progressOwner + progressSups;
            console.log('progressTotal', progressTotal);
            var matterId = cursorCurrentUserUpdated.mine.ownSlots['owns'+slotId].input;
            console.log('matterId', matterId);
            var value = MatterBlocks.findOne({
                matter: matterId
            }, {
                fields: {
                    value: 1,
                }
            }).value;
            var remainingMatter = value - progressTotal;
            console.log('remainingMatter', remainingMatter);
            //bei der Kalkulation der verbleibenden Zeit wird der neue User miteinbezogen (supRatesAdded)
            var remainingTime = (remainingMatter / ((7.5+supRatesAdded) / 3600000));
            console.log((7.5+supRatesAdded));
            console.log('remainingTime',remainingTime);
            //prüfen, ob dieser slot schon in der timer Liste steht oder nicht
            var check = checkIfDuplicate('mine', currentUser, slotId, remainingTime);
            if(check === 'push') {
                //der slot steht nicht in der Liste und wird hinzugefügt
                console.log('slot not yet in list, push timer');
                timers.push(['mine', currentUser, slotId, remainingTime]);
            } else {
                console.log('result of check',check);
                //der slot steht bereits in der Liste und wird beschleunigt
                console.log('slot is already in list, accelerate');
                // //entferne den timer
                // timers.splice(i,1);
                // //ersetze ihn mit der neuen Restzeit (kürzer, weil jetzt supporter vorhanden)
                // timers.push(menu, user, slot, time);
            }
        
            Meteor.call("infoLog", '1Scrounging successful!', myName);
            console.timeEnd("SCROUNGING");
            return "1Scrounging successful!";
        },

        //new version
        goScroungingBattlefield: function(slotId) {
            var currentUser = Meteor.users.findOne({
                _id: this.userId
            }, {
                fields: {
                    cu: 1
                }
            }).cu;
            var myName = Meteor.users.findOne({
                _id: this.userId
            }, {
                fields: {
                    username: 1
                }
            }).username;
            //CHECK IF YOU ARE TRYING TO SCROUNGE YOURSELF OR TARGET IS ALLRDY SCROUNGED
            if (currentUser == myName) {
                Meteor.call("infoLog", 'You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O', myName);
                return '0You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O';
            }
            var cursorMyPlayerData = playerData.findOne({
                user: myName
            }, {
                fields: {
                    battlefield: 1
                }
            }).battlefield;

            var amountScrSlots = cursorMyPlayerData.amountScrSlots;

            for (i = 0; i < amountScrSlots; i++) {
                if (cursorMyPlayerData.scrSlots['scrs' + i].victim.name == currentUser) {
                    Meteor.call("infoLog", 'You cannot scrounge here: You already scrounge this user!', myName);
                    return '0You cannot scrounge here: You already scrounge this user!';
                }
            }
            //CHECK FREE SCRSLOTS OF SCROUNGER DATA
            var resultScrounger = -1;
            for (i = 0; i < amountScrSlots; i++) {
                if (cursorMyPlayerData.scrSlots['scrs' + i].victim.name == "") {
                    resultScrounger = i;
                    break;
                }
            }
            if (resultScrounger == -1) {
                Meteor.call("infoLog", 'You cannot scrounge here: Your Scrounge slots are all in use!', myName);
                return '0You cannot scrounge here: Your Scrounge slots are all in use!';
            }
            //CHECK FREE SUPSLOTS OF CURRENT USER DATA                
            var obj0 = {};
            obj0['owns' + slotId] = 1;
            var cursorCurrentUser = playerData.findOne({
                user: currentUser
            }, {
                fields: {
                    battlefield: 1
                }
            }).battlefield;

            //Get free SupSlots index
            var amountSupSlots = cursorCurrentUser.amountSupSlots;

            var resultOwner = -1;
            for (i = 0; i < amountSupSlots; i++) {
                if (cursorCurrentUser.ownSlots['owns' + slotId]['sup' + i].name == "") {
                    resultOwner = i;
                    break;
                }
            }
            //LAST CHECK: RANGE SLIDER
            if (!(cursorCurrentUser.ownSlots['owns' + slotId].control.min <= cursorMyPlayerData.scrItem.benefit && cursorMyPlayerData.scrItem.benefit <= cursorCurrentUser.ownSlots['owns' + slotId].control.max)) {
                Meteor.call("infoLog", 'You cannot scrounge here: You do not have the right epicness!', myName);
                return '0You cannot scrounge here: You do not have the right epicness!';
            }

            //SupSlot with id result is free and correct: update it ?
            if (resultOwner == -1) {
                Meteor.call("infoLog", 'You cannot scrounge here: The owners support slots are all in use!', myName);
                return '0You cannot scrounge here: The owners support slots are all in use!';
            }
            //get my benefit
            var myBenefit = cursorMyPlayerData.scrItem.benefit; 
            console.log('myBenefit', myBenefit);

            //get my level
            var myLevel = cursorMyPlayerData.level; 
            console.log('myLevel', myLevel);

            //set time for the scrounging
            var timeStamp = new Date();
            console.log('timeStamp', timeStamp);

            //set playerData of owner
            var obj0 = {};
            obj0['battlefield.ownSlots.owns' + slotId + '.sup' + resultOwner+'.name'] = myName;
            obj0['battlefield.ownSlots.owns' + slotId + '.sup' + resultOwner+'.benefit'] = myBenefit;
            obj0['battlefield.ownSlots.owns' + slotId + '.sup' + resultOwner+'.level'] = myLevel;
            obj0['battlefield.ownSlots.owns' + slotId + '.sup' + resultOwner+'.stamp'] = timeStamp.getTime();
            playerData.update({
                user: currentUser
            }, {
                $set: obj0
            });
            var cursorCurrentUserUpdated = playerData.findOne({
                user: currentUser
            }, {
                fields: {
                    battlefield: 1
                }
            }).battlefield;

            //set my playerData
            var amountSupSlotsVictim = cursorCurrentUserUpdated.amountSupSlots;
            var amountScrSlotsVictim = cursorCurrentUserUpdated.amountScrSlots;
            var timeStampVictim = cursorCurrentUserUpdated.ownSlots['owns'+slotId].stamp;
            var inputVictim = cursorCurrentUserUpdated.ownSlots['owns'+slotId].input;

            var obj0 = {};
            //eigener Zeitstempel des Scroungens und eigene Rate
            obj0['battlefield.scrSlots.scrs' + resultScrounger + '.stamp'] = timeStamp.getTime();
            obj0['battlefield.scrSlots.scrs' + resultScrounger + '.benefit'] = myBenefit;
            //Anzahl sup slots des Opfers, Zeitstempel und input des gescroungten own slots des Opfers, 
            obj0['battlefield.scrSlots.scrs' + resultScrounger + '.victim.supSlotsVictim'] = amountSupSlotsVictim;
            obj0['battlefield.scrSlots.scrs' + resultScrounger + '.victim.stamp'] = timeStampVictim;
            obj0['battlefield.scrSlots.scrs' + resultScrounger + '.victim.input'] = inputVictim;
            obj0['battlefield.scrSlots.scrs' + resultScrounger + '.victim.name'] = currentUser;

            //Name und rate von Scroungern des slots und Zeitstempel des Scroungens
            //Für jeden sup slot des Opfers
            for(i = 0; i < amountSupSlotsVictim; i++) {
                var supporter = cursorCurrentUserUpdated.ownSlots['owns'+slotId]['sup'+i];
                //falls sup slot i des gescroungten own slots des Opfers einen Eintrag hat
                if(supporter.name != "") {
                    //hole seinen Namen
                    var supVictimName = supporter.name;
                    //hole seine Rate
                    var supVictimBenefit = supporter.benefit;
                    //hole den Zeitstempel seines Scroungens
                    var supVictimTimeStamp = supporter.stamp;
                    obj0['battlefield.scrSlots.scrs' + resultScrounger + '.victim.sup' + i + '.name'] = supVictimName;
                    obj0['battlefield.scrSlots.scrs' + resultScrounger + '.victim.sup' + i + '.benefit'] = supVictimBenefit;
                    obj0['battlefield.scrSlots.scrs' + resultScrounger + '.victim.sup' + i + '.stamp'] = supVictimTimeStamp;
                }
            }
            playerData.update({
                user: myName
            }, {
                $set: obj0
            });
            
            Meteor.call("infoLog", '1Scrounging successful!', myName);
            return '1Scrounging successful!';
        },

        //buyMatterNew
        buyMatter: function(matterId, slider_range) {

            console.log("BUYMATTERSTART",new Date(),new Date().getMilliseconds());
            console.time("BUY MATTER METHOD JS");
            console.time("S1");

            var cursorUser = Meteor.users.findOne({
                _id: this.userId
                }, {
                fields: {
                    username: 1,
                }
            });

            var name = cursorUser.username;

            console.timeEnd("S1");

            var colorCode = matterId.substring(0, 2);
            switch (colorCode) {
                case "01":
                    var matterColor = "green";
                    break;
                case "02":
                    var matterColor = "red";
                    break;
                default:
                    Meteor.call("infoLog", 'methods.js: something is wrong...', name);
                    return 'methods.js: something is wrong...';
            }

            console.time("S3");

            var matter = resources.findOne({
                user: name
            }, {
                fields: {
                    values: 1,
                }
            }).values[matterColor].matter;

            console.timeEnd("S3");
            console.time("S4");

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

            console.timeEnd("S4");


            //check costs
            if (!(matter >= cost)) {
                Meteor.call("infoLog", 'You cannot buy this matter: You do not have enough matter!', name);
                return '0You cannot buy this matter: You do not have enough matter!';
            }

            console.time("S7");

            var cursor = playerData.findOne({
                user: name
            }, {
                fields: {
                    'mine.amountOwnSlots': 1,
                    'mine.ownSlots': 1,
                    'user': 1,
                    'mine.ownItem.benefit': 1,
                }
            });
            var cursorMine = cursor.mine;
            var amountSlots = cursorMine.amountOwnSlots;

            console.timeEnd("S7");
            console.time("S8");

            //Iterate all own slots and fill matter into free one
            for (i = 0; i < amountSlots; i++) {
                if (cursorMine.ownSlots['owns' + i].input == "0000") {
                    //pay matter
                    var obj1 = {};
                    obj1['values.' + matterColor + '.matter'] = matter - cost;
                    resources.update({
                        user: name
                    }, {
                        $set: obj1
                    });
                    //add item in playerData
                    var obj2 = {};
                    obj2['mine.ownSlots.owns' + i + '.stamp'] = new Date().getTime();
                    obj2['mine.ownSlots.owns' + i + '.input'] = matterId;
                    obj2['mine.ownSlots.owns' + i + '.control.min'] = slider_range[0];
                    obj2['mine.ownSlots.owns' + i + '.control.max'] = slider_range[1];
                    playerData.update({
                        user: name
                    }, {
                        $set: obj2
                    });
                    var remainingMine = (value/(7.5/3600000));
                    console.log('before',timers);
                    //seltsam aber wahr: Wenn das nicht hier über diesen Umweg gesetzt wird, dann
                    //wird manchmal der Wert einer anderen "i" Variable verwendet, was dann wiederum einen
                    //slot repräsentiert, der nicht existiert
                    var p = i;
                    //Parameter: (menu, user, slot, remainingTime)
                    timers.push(['mine', name, p, remainingMine]);
                    console.log('after',timers);
                    break;
                }
            }

            console.timeEnd("S8");

            Meteor.call("infoLog", '1Matter purchase successful!', name);

            console.timeEnd("BUY MATTER METHOD JS");
            console.log("BUYMATTEREND ",new Date(),new Date().getMilliseconds());

            return '1Matter purchase successful!';
        },

        //BuyFight new
        buyFight: function(fightId, slider_range) {

            var name = Meteor.users.findOne({
                _id: this.userId
            }, {
                fields: {
                    username: 1,
                }
            }).username;
            var colorCode = fightId.substring(0, 2);
            switch (colorCode) {
                case "01":
                    var matterColor = "green";
                    break;
                case "02":
                    var matterColor = "red";
                    break;
                default:
                    Meteor.call("infoLog", 'methods.js: something is wrong...', name);
                    return 'methods.js: something is wrong...';
            }
            var matter = resources.findOne({
                user: name
            }, {
                fields: {
                    values: 1,
                }
            }).values[matterColor].matter;

            var cursorFight = FightArenas.findOne({
                fight: fightId
            }, {
                fields: {
                    cost: 1,
                    time: 1,
                }
            });
            var cost = cursorFight.cost;
            var time = cursorFight.time;

            //check costs
            if (!(matter >= cost)) {
                Meteor.call("infoLog", 'You cannot buy this fight: You do not have enough matter!', name);
                    return '0You cannot buy this fight: You do not have enough matter!';
            }

            var cursor = playerData.findOne({
                user: name
            }, {
                fields: {
                    'battlefield.amountOwnSlots': 1,
                    'battlefield.ownSlots': 1,
                    'user': 1
                }
            }).battlefield;

            var amountSlots = cursor.amountOwnSlots;

            //Iterate all own slots and fill fight into free one
            for (i = 0; i < amountSlots; i++) {
                if (cursor.ownSlots['owns' + i].input == "0000") {
                    //pay fight
                    var obj1 = {};
                    obj1['values.' + matterColor + '.fight'] = matter - cost;
                    resources.update({
                        user: name
                    }, {
                        $set: obj1
                    });
                    //add purchased item in playerData
                    var obj2 = {};
                    obj2['battlefield.ownSlots.owns' + i + '.stamp'] = new Date().getTime();
                    obj2['battlefield.ownSlots.owns' + i + '.input'] = fightId;
                    obj2['battlefield.ownSlots.owns' + i + '.control.min'] = slider_range[0];
                    obj2['battlefield.ownSlots.owns' + i + '.control.max'] = slider_range[1];
                    playerData.update({
                        user: name
                    }, {
                        $set: obj2
                    });
                    console.log(timers);
                    //seltsam aber wahr: Wenn das nicht hier über diesen Umweg gesetzt wird, dann
                    //wird manchmal der Wert einer anderen "i" Variable verwendet, was dann wiederum einen
                    //slot repräsentiert, der nicht existiert
                    var q = i;
                    console.log('saved',q,'into battlefield timer, buyFight');
                    //timers.push(menu, user, slot, remainingTime)
                    timers.push(['battlefield', name, i, time]);
                    console.log(timers);
                    break;
                }
            }
            Meteor.call("infoLog", '1Fight purchase successful!', name);
            return '1Fight purchase successful!';
        },

        initialUpdate: function(user) {
            console.log('initalUpdate');

            //pD of active player
            console.time('InitialUpdate');
            var pD = playerData.findOne({
                user: user
            });

            //update own slots
            var username = pD.user;
            var ownSlotsMine = pD.mine.amountOwnSlots;
            var ownSlotsBattlefield = pD.battlefield.amountOwnSlots;

            for(var i = 0; i < ownSlotsMine; i++) {
                console.log('own mine',i);
                console.log('slot',i,'of user',username,'might need update');
                remainingMine = updateMineSlot(username, i);
                //falls slot benutzt und noch Zeit verbleibend
                if(remainingMine > 0) {
                    console.log('saved',i,'into mine timer, initialUpdate');
                    timers.push(['mine', username, i, remainingMine]);
                }
            }
            for(var b = 0; b < ownSlotsBattlefield; b++) {
                console.log('own battlefield', b);
                console.log('slot',b,'of user',username,'might need update');
                remainingBattlefield = updateBattlefieldSlot(username, b);
                //falls slot benutzt und noch Zeit verbleibend
                if(remainingBattlefield > 0){
                    console.log('saved',b,'into battlefield timer, initialUpdate');
                    timers.push(['battlefield', username, b, remainingBattlefield]);
                } 
            }

            //check which scrounge slots might need an update
            var scrSlotsMine = pD.mine.amountScrSlots;
            var scroungedSlotsUsersMine = {};
            var scrSlotsBattlefield = pD.battlefield.amountScrSlots;
            var scroungedSlotsUsersBattlefield = {};

            //mine
            for(var m = 0; m < scrSlotsMine; m++) {
                console.log('mine', m);
                var scroungedUser = pD.mine.scrSlots['scrs'+m].victim.name;
                //falls scr slot benutzt
                if(scroungedUser != "") {
                    var pDscroungedUser = playerData.findOne({
                        user: scroungedUser
                    }).mine;
                    var ownSlots = pDscroungedUser.amountOwnSlots;
                    var supSlots = pDscroungedUser.amountSupSlots;
                    var indexScr = -1;
                    for(k = 0; k < ownSlots; k++) {
                        for(m = 0; m < supSlots; m++) {
                            if(pDscroungedUser.ownSlots['owns'+k]['sup'+m].name == pD.user) indexScr = k;
                        }
                    }
                    //falls ein slot gefunden wurde, der evtl. update benötigt
                    if(indexScr != -1) {
                        //update this slot if need be
                        console.log('slot',indexScr,'of user',scroungedUser,'might need update');
                        remainingMine = updateMineSlot(scroungedUser, indexScr);
                        //falls slot benutzt und noch Zeit verbleibend
                        if(remainingMine > 0) timers.push(['mine', scroungedUser, indexScr, remainingMine]);
                    }
                    else {
                        console.log('serious PROBLEM, slot calculation initialUpdate Mine');
                    }
                } 
            }
            //battlefield
            for(var z = 0; z < scrSlotsBattlefield; z++) {
                console.log('battlefield', z);
                var scroungedUser = pD.battlefield.scrSlots['scrs'+z].victim.name;
                if(scroungedUser != "") {
                    var pDscroungedUser = playerData.findOne({
                        user: scroungedUser
                    }).battlefield;
                    var ownSlots = pDscroungedUser.amountOwnSlots;
                    var supSlots = pDscroungedUser.amountSupSlots;
                    var indexScr = -1;
                    for(r = 0; r < ownSlots; r++) {
                        for(m = 0; m < supSlots; m++) {
                            if(pDscroungedUser.ownSlots['owns'+r]['sup'+m].name == pD.user) indexScr = r;
                        }
                    }
                    //falls ein slot gefunden wurde, der evtl. update benötigt
                    if(indexScr != -1) {
                        //update this slot if need be
                        console.log('slot',indexScr,'of user',scroungedUser,'might need update');
                        remainingBattlefield = updateBattlefieldSlot(scroungedUser, indexScr);
                        //falls slot benutzt und noch Zeit verbleibend
                        if(remainingBattlefield > 0) timers.push(['battlefield', scroungedUser, indexScr, remainingBattlefield]);
                    }
                    else {
                        console.log('serious PROBLEM, slot calculation initialUpdate Battlefield');
                    }
                } 
            }   
            console.timeEnd('InitialUpdate');
            //dieser return hat noch keine Bewandnis, vllt in Zukunft für etwas nützlich
            return 'update done'
        },

    updateMineSlot: function(user, slotNumber) {

        console.time('UPDATEMS');

        //what is left of an unfinished slot
        var remaining = 0;

        var slot = 'owns'+slotNumber;

        var pDM = playerData.findOne({
            user: user
        }, {
            fields: {
                'level': 0,
                'XP': 0,
                'requiredXP': 0,
                'backgroundId': 0,
                'battlefield': 0,
                'laboratory': 0,
                'thivery': 0,
                'workshop': 0,
                'smelter': 0,
                'mine.amountScrSlots': 0,
                'mine.science': 0,
                'mine.minControl': 0,
                'mine.maxControl': 0,
                'mine.ownItem': 0,
                'mine.scrItem': 0,
                'mine.scrSlots': 0,
                'mine.ownSlots.owns0.control': 0,
                'mine.ownSlots.owns1.control': 0,
                'mine.ownSlots.owns2.control': 0,
                'mine.ownSlots.owns3.control': 0,
                'mine.ownSlots.owns4.control': 0,
                'mine.ownSlots.owns5.control': 0,
            }
        }).mine;
        var mineOwnSlots = pDM.amountOwnSlots;
        var mineSupSlots = pDM.amountSupSlots;
        var serverTime = new Date().getTime();

        //update mine of user || ownSlots
        //HIER WIRD MANCHMAL NE EXCEPTION GEWORFEN; WEIL pDM NOCH NICHT VORHANDEN IST. BUGGY??
        // console.log('slot',slot);
        // console.log('matterID',matterID);
        // console.log('pDM2',pDM.ownSlots[slot]);
        var matterID = pDM.ownSlots[slot].input;
        //slot used?
        if(matterID > 0) {
            var matter = MatterBlocks.findOne({
                matter: matterID
            }, {
                fields: {
                    name: 0,
                    cost: 0,
                }
            });
            var value = matter.value;
            var startTime = pDM.ownSlots[slot].stamp;
            var progress = (serverTime - startTime) * (7.5 / 3600000);
            var sups = [];
            //iterate supporter
            for(var k = 0; k < mineSupSlots; k++) {
                var sup = pDM.ownSlots[slot]['sup'+k];
                //slot used?
                if(sup.name != "") {
                    supTime = sup.stamp;
                    supRate = sup.benefit;
                    progress = progress + (serverTime - supTime) * (supRate / 3600000);
                    sups.push(sup.name);
                    console.log('supName',sup.name);
                }
            }
            //matter finished?
            if(progress > value) {
                console.log('matter is finished');
                //split matter
                var matterColor = matter.color;
                var ownProfit = 0;
                //falls keine supporter, user bekommt ganzen Gewinn
                if (sups.length == 0) {
                    console.log('no sup present');
                    ownProfit = value;
                //falls supporter, user bekommt Teil des Gewinns
                } else {
                    console.log('sup(s) present');
                    ownProfit = 0.5 * value;
                    //jeder supporter bekommt einen Teil der Hälfte
                    var supProfit = (0.5 * value) / sups.length;
                    console.log('supProfit', supProfit);
                }
                var cursorResources = resources.findOne({
                    user: user
                }, {
                    fields: {
                        values: 1
                    }
                });
                var ownedMatter = cursorResources.values[matterColor].matter;
                //pay user
                var obj0 = {};
                obj0['values.' + matterColor + '.matter'] = (ownedMatter + ownProfit);
                console.log('ownProfit',ownProfit);
                console.log('ownedMatter',ownedMatter);
                console.log('obj0',obj0);
                resources.update({
                    user: user
                }, {
                    $set: obj0
                });
                //supporter
                for(var m = 0; m < sups.length; m++) {
                    console.log('supporter',sups[m]);
                    var obj0 = {};
                    var cursorResourcesSup = resources.findOne({
                        user: sups[m]
                    }, {
                        fields: {
                            values: 1,
                        }
                    });
                    var supsOwnedMatter = cursorResourcesSup.values[matterColor].matter;
                    console.log(sups[m]);
                    console.log('supsOwnedMatter',supsOwnedMatter);
                    //pay sup
                    var obj0 = {};
                    obj0['values.' + matterColor + '.matter'] = (supsOwnedMatter + supProfit);
                    console.log('obj0',obj0);
                    resources.update({
                        user: sups[m]
                    }, {
                        $set: obj0
                    });
                    //reset sup scr slot
                    console.log('reset sup',sups[m]);
                    var pDMsup = playerData.findOne({
                        user: sups[m]
                    }, {
                        fields: {
                            'mine.amountScrSlots': 1,
                            'mine.scrSlots.scrs0.victim.name': 1,
                            'mine.scrSlots.scrs1.victim.name': 1,
                            'mine.scrSlots.scrs2.victim.name': 1,
                            'mine.scrSlots.scrs3.victim.name': 1,
                            'mine.scrSlots.scrs4.victim.name': 1,
                            'mine.scrSlots.scrs5.victim.name': 1,
                        }
                    }).mine;
                    var supScrSlots = pDMsup.amountScrSlots;
                    for(var w = 0; w < supScrSlots; w++) {
                        if(pDMsup.scrSlots['scrs'+w].victim.name == user) indexScr = w;
                    }
                    var obj0 = {};
                    obj0['mine.scrSlots.scrs' + indexScr + '.benefit'] = 5;
                    obj0['mine.scrSlots.scrs' + indexScr + '.stamp'] = "";
                    obj0['mine.scrSlots.scrs' + indexScr + '.victim.supSlotsVictim'] = "";
                    obj0['mine.scrSlots.scrs' + indexScr + '.victim.name'] = "";
                    obj0['mine.scrSlots.scrs' + indexScr + '.victim.stamp'] = "";
                    obj0['mine.scrSlots.scrs' + indexScr + '.victim.input'] = "";
                    for(var t = 0; t < sups.length; t++) {
                        obj0['mine.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.name'] = "";
                        obj0['mine.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.benefit'] = 5;
                        obj0['mine.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.stamp'] = "";
                    }
                    playerData.update({
                        user: sups[m]
                    }, {
                        $set: obj0
                    });
                }
                //reset user slots
                console.log('reset user');
                var obj0 = {};
                obj0['mine.ownSlots.'+ slot + '.input'] = "0000";
                obj0['mine.ownSlots.'+ slot + '.stamp'] = "";
                obj0['mine.ownSlots.'+ slot + '.control.min'] = 0.1;
                obj0['mine.ownSlots.'+ slot + '.control.max'] = 10;
                for(var s = 0; s < mineSupSlots; s++) {
                    obj0['mine.ownSlots.'+ slot + '.sup' + s + '.name'] = "";
                    obj0['mine.ownSlots.'+ slot + '.sup' + s + '.benefit'] = 5;
                    obj0['mine.ownSlots.'+ slot + '.sup' + s + '.stamp'] = "";
                }
                playerData.update({
                    user: user
                }, {
                    $set: obj0
                });
            //if slot isn't finished, remember remaining
            } else {
                console.log('else Mine');
                progressTime = progress / (7.5/3600000);
                neededTime = value / (7.5/3600000);
                leftTime = neededTime - progressTime;
                remaining = leftTime;
            }
        }
        console.log('ENDM',user,slot);
        console.timeEnd('UPDATEMS');
        
        return remaining;
    },

    updateBattlefieldSlot: function(user, slotNumber) {

        console.time('UPDATEBS');

        //what is left of an unfinished slot
        var remaining = 0;
        
        var slot = 'owns'+slotNumber;

        var pD = playerData.findOne({
            user: user
        }, {
            fields: {
                'backgroundId': 0,
                'mine': 0,
                'laboratory': 0,
                'thivery': 0,
                'workshop': 0,
                'smelter': 0,
                'battlefield.amountScrSlots': 0,
                'battlefield.science': 0,
                'battlefield.minControl': 0,
                'battlefield.maxControl': 0,
                'battlefield.ownItem': 0,
                'battlefield.scrItem': 0,
                'battlefield.scrSlots': 0,
                'battlefield.ownSlots.owns0.control': 0,
                'battlefield.ownSlots.owns1.control': 0,
                'battlefield.ownSlots.owns2.control': 0,
                'battlefield.ownSlots.owns3.control': 0,
                'battlefield.ownSlots.owns4.control': 0,
                'battlefield.ownSlots.owns5.control': 0,
            }
        });
        var pDB = pD.battlefield;
        var battlefieldOwnSlots = pDB.amountOwnSlots;
        var battlefieldSupSlots = pDB.amountSupSlots;
        var serverTime = new Date().getTime();

        //update battlefield of user || ownSlots
        console.log('fightID',fightID);
        //slot used?
        if(fightID > 0) {
            var fight = FightArenas.findOne({
                fight: fightID
            }, {
                fields: {
                    name: 0,
                    cost: 0,
                }
            });
            var startTime = pDB.ownSlots[slot].stamp;
            var overallTime = fight.time;
            //fight finished?
            if((serverTime - startTime) > overallTime) {
                console.log('fight finished',(serverTime - startTime) > overallTime);
                var sups = [];
                var supEpics = 0;
                //iterate supporter
                for(var k = 0; k < battlefieldSupSlots; k++) {
                    var sup = pDB.ownSlots[slot]['sup'+k];
                    //slot used?
                    if(sup.name != "") {
                        supTime = sup.stamp;
                        supEpic = sup.benefit;
                        supEpics = supEpics + supEpic;
                        sups.push(sup.name);
                    }
                }
                //split XP
                overallXP = parseInt(((fight.value * (100 + supEpics)) / 100));
                var ownProfit = 0;
                console.log('overallXP', overallXP);
                //falls keine supporter, user bekommt ganzen Gewinn
                if (sups.length == 0) {
                    console.log('no sups present');
                    ownProfit = overallXP;
                //falls supporter, user bekommt Teil des Gewinns
                } else {
                    console.log('sups present');
                    ownProfit = 0.5 * overallXP;
                    //jeder supporter bekommt einen Teil der Hälfte
                    var supProfit = (0.5 * overallXP) / sups.length;
                    console.log('supProfit', supProfit);
                }
                //lvl up user
                var userXP = parseInt(pD.XP);
                var userReqXP = parseInt(pD.requiredXP);
                console.log('userXP',userXP);
                console.log('userReqXP',userReqXP);
                if((userXP + ownProfit) >= userReqXP) {
                    var lvl = pD.level;
                    var obj0 = {};
                    obj0['requiredXP'] = userReqXP + (225 * ((lvl + 10) / 2))
                    obj0['XP'] = (userXP + ownProfit) - userReqXP;
                    obj0['level'] = lvl+1;
                    console.log('obj0', obj0);
                    playerData.update({
                        user: user
                    }, {
                        $set: obj0
                    });
                } else {
                    var userNewXPValue = (userXP + ownProfit);
                    console.log('userNewXPValue',userNewXPValue);
                    playerData.update({
                        user: user
                    }, {
                        $set: {
                            XP: userNewXPValue
                        },
                    });
                }
                //lvl up sups
                for(var m = 0; m < sups.length; m++) {
                    var pDsup = playerData.findOne({
                        user: sups[m]
                    }, {
                        fields: {
                            requiredXP: 1,
                            XP: 1,
                            level: 1,
                        }
                    });
                    var supXP = pDsup.XP;
                    var supReqXP = pDsup.requiredXP;
                    if((supXP + ownProfit) >= supReqXP) {
                        var lvl = pDsup.level;
                        var obj0 = {};
                        obj0['requiredXP'] = (supReqXP + (225 * ((lvl + 10) / 2)));
                        obj0['XP'] = ((supXP + ownProfit) - supReqXP);
                        obj0['level'] = (lvl+1);
                        console.log('obj0',obj0);
                        playerData.update({
                            user: sups[m]
                        }, {
                            $set: obj0
                        });
                    } else {
                        var supNewXPValue = (supXP + ownProfit);
                        playerData.update({
                            user: sups[m]
                        }, {
                            $set: {
                                XP: supNewXPValue
                            },
                        });
                    }
                    //reset sup scr slot
                    var pDBsup = playerData.findOne({
                        user: sups[m]
                    }, {
                        fields: {
                            'battlefield.amountScrSlots': 1,
                            'battlefield.scrSlots.scrs0.victim.name': 1,
                            'battlefield.scrSlots.scrs1.victim.name': 1,
                            'battlefield.scrSlots.scrs2.victim.name': 1,
                            'battlefield.scrSlots.scrs3.victim.name': 1,
                            'battlefield.scrSlots.scrs4.victim.name': 1,
                            'battlefield.scrSlots.scrs5.victim.name': 1,
                        }
                    }).battlefield;
                    var supScrSlots = pDBsup.amountScrSlots;
                    for(var w = 0; w < supScrSlots; w++) {
                        if(pDBsup.scrSlots['scrs'+w].victim.name == user) indexScr = w;
                    }
                    var obj0 = {};
                    obj0['battlefield.scrSlots.scrs' + indexScr + '.benefit'] = 50;
                    obj0['battlefield.scrSlots.scrs' + indexScr + '.stamp'] = "";
                    obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.supSlotsVictim'] = "";
                    obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.name'] = "";
                    obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.stamp'] = "";
                    obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.input'] = "";
                    for(var t = 0; t < sups.length; t++) {
                        obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.name'] = "";
                        obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.benefit'] = 50;
                        obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.stamp'] = "";
                    }
                    playerData.update({
                        user: sups[m]
                    }, {
                        $set: obj0
                    });
                }
                //reset user slots
                var obj0 = {};
                obj0['battlefield.ownSlots.'+ slot + '.input'] = "0000";
                obj0['battlefield.ownSlots.'+ slot + '.stamp'] = "";
                obj0['battlefield.ownSlots.'+ slot + '.control.min'] = 0.1;
                obj0['battlefield.ownSlots.'+ slot + '.control.max'] = 10;
                for(var s = 0; s < battlefieldSupSlots; s++) {
                    obj0['battlefield.ownSlots.'+ slot + '.sup' + s + '.name'] = "";
                    obj0['battlefield.ownSlots.'+ slot + '.sup' + s + '.benefit'] = 5;
                    obj0['battlefield.ownSlots.'+ slot + '.sup' + s + '.stamp'] = "";
                    obj0['battlefield.ownSlots.'+ slot + '.sup' + s + '.level'] = "";
                }
                playerData.update({
                    user: user
                }, {
                    $set: obj0
                });
            //if slot isn't finished, remember remaining
            } else {
                remaining = overallTime - (serverTime - startTime);
            }
        }
        console.log('ENDB',user,slot);
        console.timeEnd('UPDATEBS');
        
        return remaining;
    },

        init: function() {
            var self = Meteor.users.findOne({
                _id: this.userId
            });
            var name = self.username;
            if (!self) return;

            // USERS //
            Meteor.users.update({
                _id: this.userId
            }, {
                $set: {
                    menu: 'mine',
                    cu: name
                }
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation users error: ' + err);
                } else {
                    //upsert successful
                }
            });

            // RESOURCES //
            resources.insert({
                user: name,
                values: {
                    green: {
                        matter: 0,
                        sr1: 0,
                        sr2: 0,
                        sr3: 0,
                        sr4: 0,
                        sr5: 0,
                        sr6: 0
                    },
                    red: {
                        matter: 0,
                        sr1: 0,
                        sr2: 0,
                        sr3: 0,
                        sr4: 0,
                        sr5: 0,
                        sr6: 0
                    }
                }
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation resources error: ' + err);
                } else {
                    //insert successful
                }
            });

            //Values randomNumber are [1-5]
            var randomNumber = Math.floor((Math.random() * 5)) + 1;
            //Diese switch case Gabelung dient der Umsetzung der sprite sheets
            //Zuvor wurde die ermittelte Zufallszahl so in der Datenbank gespeichert und später im html an einen Bildpfad angehängt
            //verschiedene Hintergründe wurden so jedem Spieler anhand dieser Zufallszahl zugeordnet
            //Mit sprite sheets muss diese Info aber in eine background-position übersetzt werden
            //dies geschieht hiermit. In der Datenbank werden die Pixelangaben gespeichert, die im sprite sheet verschiedene Hintergründe repräsentieren
            switch(randomNumber) {
                        case 1:
                            randomNumber = "-310px 0px";
                            break;
                        case 2:
                            randomNumber = "-620px 0px";
                            break;
                        case 3:
                            randomNumber = "-930px 0px";
                            break;
                        case 4:
                            randomNumber = "-1240px 0px";
                            break;
                        case 5:
                            randomNumber = "-1550px 0px";
                            break;
                        default:
                            console.log("initial background oops");
                    }
            // PLAYERDATA //
            playerData.insert({
                user: name,
                level: 0,
                XP: 0,
                requiredXP: 2014,
                backgroundId: randomNumber,
                x: 0,
                y: 0,
                mine: {
                    amountOwnSlots: 3,
                    amountScrSlots: 6,
                    amountSupSlots: 2,
                    science: 0.1,
                    minControl: 0.1,
                    maxControl: 10,
                    ownItem: {
                        blank: "",
                        benefit: 1,
                        upgrades: 1,
                        stolen: null,
                        active: false
                    },
                    scrItem: {
                        blank: "",
                        benefit: 5,
                        upgrades: 1,
                        stolen: null,
                        active: false
                    },
                    ownSlots: {
                        owns0: {
                            input: '0000',
                            stamp: "",
                            control: {
                                min: 5,
                                max: 10,
                            },
                            sup0: {
                                name: "",
                                benefit: 5,
                                stamp: "",
                            },
                            sup1: {
                                name: "",
                                benefit: 5,
                                stamp: "",
                            }
                        },
                        owns1: {
                            input: '0000',
                            stamp: "",
                            control: {
                                min: 5,
                                max: 10,
                            },
                            sup0: {
                                name: "",
                                benefit: 5,
                                stamp: "",
                            },
                            sup1: {
                                name: "",
                                benefit: 5,
                                stamp: "",
                            }
                        },
                        owns2: {
                            input: '0000',
                            stamp: "",
                            control: {
                                min: 5,
                                max: 10,
                            },
                            sup0: {
                                name: "",
                                benefit: 5,
                                stamp: "",
                            },
                            sup1: {
                                name: "",
                                benefit: 5,
                                stamp: "",
                            }
                        },
                    },
                    scrSlots: {
                        scrs0: {
                            benefit: 5,
                            stamp: "",
                            victim: {
                                supSlotsVictim: "",
                                name: "",
                                stamp: "",
                                input: "",
                                sup0: {
                                    name: "",
                                    benefit: 5,
                                    stamp: "",
                                },
                                sup1: {
                                    name: "",
                                    benefit: 5,
                                    stamp: "",
                                }
                            }
                        },
                        scrs1: {
                            benefit: 5,
                            stamp: "",
                            victim: {
                                supSlotsVictim: "",
                                name: "",
                                stamp: "",
                                input: "",
                                sup0: {
                                    name: "",
                                    benefit: 5,
                                    stamp: "",
                                },
                                sup1: {
                                    name: "",
                                    benefit: 5,
                                    stamp: "",
                                }
                            }
                        },
                        scrs2: {
                            benefit: 5,
                            stamp: "",
                            victim: {
                                supSlotsVictim: "",
                                name: "",
                                stamp: "",
                                input: "",
                                sup0: {
                                    name: "",
                                    benefit: 5,
                                    stamp: "",
                                },
                                sup1: {
                                    name: "",
                                    benefit: 5,
                                    stamp: "",
                                }
                            }
                        },
                        scrs3: {
                            benefit: 5,
                            stamp: "",
                            victim: {
                                supSlotsVictim: "",
                                name: "",
                                stamp: "",
                                input: "",
                                sup0: {
                                    name: "",
                                    benefit: 5,
                                    stamp: "",
                                },
                                sup1: {
                                    name: "",
                                    benefit: 5,
                                    stamp: "",
                                }
                            }
                        },
                        scrs4: {
                            benefit: 5,
                            stamp: "",
                            victim: {
                                supSlotsVictim: "",
                                name: "",
                                stamp: "",
                                input: "",
                                sup0: {
                                    name: "",
                                    benefit: 5,
                                    stamp: "",
                                },
                                sup1: {
                                    name: "",
                                    benefit: 5,
                                    stamp: "",
                                }
                            }
                        },
                        scrs5: {
                            benefit: 5,
                            stamp: "",
                            victim: {
                                supSlotsVictim: "",
                                name: "",
                                stamp: "",
                                input: "",
                                sup0: {
                                    name: "",
                                    benefit: 5,
                                    stamp: "",
                                },
                                sup1: {
                                    name: "",
                                    benefit: 5,
                                    stamp: "",
                                }
                            }
                        } 
                    }
                },
                laboratory: {
                    ownItem: {
                        blank: "",
                        benefit: 110,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    scrItem: {
                        blank: "",
                        benefit: 1,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    ownSlots: 1,
                    scrSlots: 1,
                    supSlots: 1,
                    science: 0.1,
                    minControl: 0.1,
                    maxControl: 10
                },
                workshop: {
                    ownItem: {
                        blank: "",
                        benefit: 5,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    scrItem: {
                        blank: "",
                        benefit: 1,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    ownSlots: 1,
                    scrSlots: 1,
                    supSlots: 1,
                    science: 0.1,
                    minControl: 0.1,
                    maxControl: 10
                },
                battlefield: {
                    amountOwnSlots: 3,
                    amountScrSlots: 6,
                    amountSupSlots: 2,
                    science: 0.1,
                    minControl: 50,
                    maxControl: 80,
                    ownItem: {
                        blank: "",
                        benefit: 0.5,
                        upgrades: 1,
                        stolen: null,
                        active: false
                    },
                    scrItem: {
                        blank: "",
                        benefit: 50,
                        upgrades: 1,
                        stolen: null,
                        active: false
                    },
                    ownSlots: {
                        owns0: {
                            input: '0000',
                            stamp: "",
                            control: {
                                min: 50,
                                max: 80,
                            },
                            sup0: {
                                name: "",
                                level: "",
                                benefit: 50,
                                stamp: "",
                            },
                            sup1: {
                                name: "",
                                level: "",
                                benefit: 50,
                                stamp: "",
                            }
                        },
                        owns1: {
                            input: '0000',
                            stamp: "",
                            control: {
                                min: 50,
                                max: 80,
                            },
                            sup0: {
                                name: "",
                                level: "",
                                benefit: 50,
                                stamp: "",
                            },
                            sup1: {
                                name: "",
                                level: "",
                                benefit: 50,
                                stamp: "",
                            }
                        },
                        owns2: {
                            input: '0000',
                            stamp: "",
                            control: {
                                min: 50,
                                max: 80,
                            },
                            sup0: {
                                name: "",
                                level: "",
                                benefit: 50,
                                stamp: "",
                            },
                            sup1: {
                                name: "",
                                level: "",
                                benefit: 50,
                                stamp: "",
                            }
                        },
                    },
                    scrSlots: {
                        scrs0: {
                            benefit: 50,
                            stamp: "",
                            victim: {
                                supSlotsVictim: "",
                                name: "",
                                stamp: "",
                                input: "",
                                sup0: {
                                    name: "",
                                    benefit: 50,
                                    stamp: "",
                                },
                                sup1: {
                                    name: "",
                                    benefit: 50,
                                    stamp: "",
                                }
                            }
                        },
                        scrs1: {
                            benefit: 50,
                            stamp: "",
                            victim: {
                                supSlotsVictim: "",
                                name: "",
                                stamp: "",
                                input: "",
                                sup0: {
                                    name: "",
                                    benefit: 50,
                                    stamp: "",
                                },
                                sup1: {
                                    name: "",
                                    benefit: 50,
                                    stamp: "",
                                }
                            }
                        },
                        scrs2: {
                            benefit: 50,
                            stamp: "",
                            victim: {
                                supSlotsVictim: "",
                                name: "",
                                stamp: "",
                                input: "",
                                sup0: {
                                    name: "",
                                    benefit: 50,
                                    stamp: "",
                                },
                                sup1: {
                                    name: "",
                                    benefit: 50,
                                    stamp: "",
                                }
                            }
                        },
                        scrs3: {
                            benefit: 50,
                            stamp: "",
                            victim: {
                                supSlotsVictim: "",
                                name: "",
                                stamp: "",
                                input: "",
                                sup0: {
                                    name: "",
                                    benefit: 50,
                                    stamp: "",
                                },
                                sup1: {
                                    name: "",
                                    benefit: 50,
                                    stamp: "",
                                }
                            }
                        },
                        scrs4: {
                            benefit: 50,
                            stamp: "",
                            victim: {
                                supSlotsVictim: "",
                                name: "",
                                stamp: "",
                                input: "",
                                sup0: {
                                    name: "",
                                    benefit: 50,
                                    stamp: "",
                                },
                                sup1: {
                                    name: "",
                                    benefit: 50,
                                    stamp: "",
                                }
                            }
                        },
                        scrs5: {
                            benefit: 50,
                            stamp: "",
                            victim: {
                                supSlotsVictim: "",
                                name: "",
                                stamp: "",
                                input: "",
                                sup0: {
                                    name: "",
                                    benefit: 50,
                                    stamp: "",
                                },
                                sup1: {
                                    name: "",
                                    benefit: 50,
                                    stamp: "",
                                }
                            }
                        } 
                    }
                },
                thivery: {
                    ownItem: {
                        blank: "",
                        benefit: 5,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    scrItem: {
                        blank: "",
                        benefit: 1,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    ownSlots: 1,
                    scrSlots: 1,
                    supSlots: 1,
                    science: 0.1,
                    minControl: 0.1,
                    maxControl: 10
                },
                smelter: {
                    ownItem: {
                        blank: "",
                        benefit: 5,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    scrItem: {
                        blank: "",
                        benefit: 1,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    ownSlots: 1,
                    scrSlots: 1,
                    supSlots: 1,
                    science: 0.1,
                    minControl: 0.1,
                    maxControl: 10
                }
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation playerData error: ' + err);
                } else {
                    //insert successful
                }
            });

            // MINE //
            mine.insert({
                user: name,
                owns0: {
                    input: "0000",
                    stamp: "",
                    control: {
                        min: 5,
                        max: 10
                    },
                    sup0: "",
                    sup1: ""
                },
                owns1: {
                    input: "0000",
                    stamp: "",
                    control: {
                        min: 5,
                        max: 10
                    },
                    sup0: "",
                    sup1: ""
                },
                owns2: {
                    input: "0000",
                    stamp: "",
                    control: {
                        min: 5,
                        max: 10
                    },
                    sup0: "",
                    sup1: ""
                },
                scrs0: {
                    victim: "",
                    stamp: "",
                    benefit: 5
                },
                scrs1: {
                    victim: "",
                    stamp: "",
                    benefit: 5
                },
                scrs2: {
                    victim: "",
                    stamp: "",
                    benefit: 5
                },
                scrs3: {
                    victim: "",
                    stamp: "",
                    benefit: 5
                },
                scrs4: {
                    victim: "",
                    stamp: "",
                    benefit: 5
                },
                scrs5: {
                    victim: "",
                    stamp: "",
                    benefit: 5
                }
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation mine error: ' + err);
                } else {
                    //insert successful
                }
            });

            // LABORATORY //
            laboratory.insert({
                user: name,
                owns0: {
                    input: "000000",
                    stamp: "",
                    control: {
                        min: 105,
                        max: 113
                    },
                    sup0: ""
                },
                scrs0: {
                    victim: "",
                    stamp: "",
                    benefit: 110
                }
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation laboratory error: ' + err);
                } else {
                    //insert successful
                }
            });

            // WORKSHOP //
            workshop.insert({
                    user: name,
                    owns0: {
                        input: "000000",
                        stamp: "",
                        control: {
                            min: 5,
                            max: 10
                        },
                        sup0: ""
                    },
                    scrs0: {
                        victim: "",
                        stamp: "",
                        benefit: 2.5
                    }
                },
                function(err) {
                    if (err) {
                        throw new Meteor.Error(404, 'account creation workshop error: ' + err);
                    } else {
                        //insert successful
                    }
                });

            // BATTLEFIELD //
            battlefield.insert({
                    user: name,
                    owns0: {
                        input: "0000",
                        stamp: "",
                        control: {
                            min: 50,
                            max: 80
                        },
                        sup0: "",
                        sup1: ""
                    },
                    owns1: {
                        input: "0000",
                        stamp: "",
                        control: {
                            min: 50,
                            max: 80
                        },
                        sup0: "",
                        sup1: ""
                    },
                    owns2: {
                        input: "0000",
                        stamp: "",
                        control: {
                            min: 50,
                            max: 80
                        },
                        sup0: "",
                        sup1: ""
                    },
                    scrs0: {
                        victim: "",
                        stamp: "",
                        benefit: 50
                    },
                    scrs1: {
                        victim: "",
                        stamp: "",
                        benefit: 50
                    },
                    scrs2: {
                        victim: "",
                        stamp: "",
                        benefit: 50
                    },
                    scrs3: {
                        victim: "",
                        stamp: "",
                        benefit: 50
                    },
                    scrs4: {
                        victim: "",
                        stamp: "",
                        benefit: 50
                    },
                    scrs5: {
                        victim: "",
                        stamp: "",
                        benefit: 50
                    }
                },
                function(err) {
                    if (err) {
                        throw new Meteor.Error(404, 'account creation battlefield error: ' + err);
                    } else {
                        //insert successful
                    }
                });

            // THIEVERY //
            thievery.insert({
                    user: name,
                    owns0: {
                        input: "0000",
                        stamp: "",
                        control: {
                            min: 1,
                            max: 3.2
                        },
                        sup0: ""
                    },
                    scrs0: {
                        victim: "",
                        stamp: "",
                        benefit: 1
                    }
                },
                function(err) {
                    if (err) {
                        throw new Meteor.Error(404, 'account creation thivery error: ' + err);
                    } else {
                        //insert successful
                    }
                });

            // SMELTER //
            smelter.insert({
                    user: name,
                    owns0: {
                        input: "0000",
                        stamp: "",
                        control: {
                            min: 0.1,
                            max: 0.2
                        },
                        sup0: ""
                    },
                    scrs0: {
                        victim: "",
                        stamp: "",
                        benefit: 0.1
                    }
                },
                function(err) {
                    if (err) {
                        throw new Meteor.Error(404, 'account creation smelter error: ' + err);
                    } else {
                        //insert successful
                    }
                });
            Meteor.call('createMapPosition', name);
            return "account init OK!";
        }
    });

    //server methods
    //updateMineSlot/BattlefieldSlot sind doppelt deklariert, weil:
    //einmal zum Aufrufen aus "InitialUpdate" heraus (dafür müssen es server-Methoden sein)
    //zum anderen stehen sie als Meteor methods auch zum Aufrufen vom Client aus zur Verfügung (noch prüfen, ob das relevant ist...)

    function updateMineSlot(user, slotNumber) {

        console.time('UPDATEMS');

        //what is left of an unfinished slot
        var remaining = 0;

        var slot = 'owns'+slotNumber;

        var pDM = playerData.findOne({
            user: user
        }, {
            fields: {
                'level': 0,
                'XP': 0,
                'requiredXP': 0,
                'backgroundId': 0,
                'battlefield': 0,
                'laboratory': 0,
                'thivery': 0,
                'workshop': 0,
                'smelter': 0,
                'mine.amountScrSlots': 0,
                'mine.science': 0,
                'mine.minControl': 0,
                'mine.maxControl': 0,
                'mine.ownItem': 0,
                'mine.scrItem': 0,
                'mine.scrSlots': 0,
                'mine.ownSlots.owns0.control': 0,
                'mine.ownSlots.owns1.control': 0,
                'mine.ownSlots.owns2.control': 0,
                'mine.ownSlots.owns3.control': 0,
                'mine.ownSlots.owns4.control': 0,
                'mine.ownSlots.owns5.control': 0,
            }
        }).mine;
        var mineOwnSlots = pDM.amountOwnSlots;
        var mineSupSlots = pDM.amountSupSlots;
        var serverTime = new Date().getTime();

        //update mine of user || ownSlots
        var matterID = pDM.ownSlots[slot].input;
        //slot used?
        if(matterID > 0) {
            var matter = MatterBlocks.findOne({
                matter: matterID
            }, {
                fields: {
                    name: 0,
                    cost: 0,
                }
            });
            var value = matter.value;
            var startTime = pDM.ownSlots[slot].stamp;
            var progress = (serverTime - startTime) * (7.5 / 3600000);
            console.log('progress',progress,'vor sups');
            var sups = [];
            //noch ist das 7.5, muss irgendwann mit dem benefit des ownItems getauscht werden
            var totalRate = 7.5;
            //iterate supporter
            for(var k = 0; k < mineSupSlots; k++) {
                var sup = pDM.ownSlots[slot]['sup'+k];
                //slot used?
                if(sup.name != "") {
                    console.log('sups');
                    supTime = sup.stamp;
                    supRate = sup.benefit;
                    totalRate = totalRate + supRate;
                    progress = progress + (serverTime - supTime) * (supRate / 3600000);
                    console.log('progress',progress,k);
                    sups.push(sup.name);
                    // console.log('supName',sup.name);
                }
            }
            //matter finished?
            if(progress > value) {
                // console.log('matter is finished');
                //split matter
                var matterColor = matter.color;
                var ownProfit = 0;
                //falls keine supporter, user bekommt ganzen Gewinn
                if (sups.length == 0) {
                    // console.log('no sup present');
                    ownProfit = value;
                //falls supporter, user bekommt Teil des Gewinns
                } else {
                    // console.log('sup(s) present');
                    ownProfit = 0.5 * value;
                    //jeder supporter bekommt einen Teil der Hälfte
                    var supProfit = (0.5 * value) / sups.length;
                    // console.log('supProfit', supProfit);
                }
                var cursorResources = resources.findOne({
                    user: user
                }, {
                    fields: {
                        values: 1
                    }
                });
                var ownedMatter = cursorResources.values[matterColor].matter;
                //pay user
                var obj0 = {};
                obj0['values.' + matterColor + '.matter'] = (ownedMatter + ownProfit);
                // console.log('ownProfit',ownProfit);
                // console.log('ownedMatter',ownedMatter);
                // console.log('obj0',obj0);
                resources.update({
                    user: user
                }, {
                    $set: obj0
                });
                //supporter
                for(var m = 0; m < sups.length; m++) {
                    // console.log('supporter',sups[m]);
                    var obj0 = {};
                    var cursorResourcesSup = resources.findOne({
                        user: sups[m]
                    }, {
                        fields: {
                            values: 1,
                        }
                    });
                    var supsOwnedMatter = cursorResourcesSup.values[matterColor].matter;
                    // console.log(sups[m]);
                    // console.log('supsOwnedMatter',supsOwnedMatter);
                    //pay sup
                    var obj0 = {};
                    obj0['values.' + matterColor + '.matter'] = (supsOwnedMatter + supProfit);
                    // console.log('obj0',obj0);
                    resources.update({
                        user: sups[m]
                    }, {
                        $set: obj0
                    });
                    //reset sup scr slot
                    // console.log('reset sup',sups[m]);
                    var pDMsup = playerData.findOne({
                        user: sups[m]
                    }, {
                        fields: {
                            'mine.amountScrSlots': 1,
                            'mine.scrSlots.scrs0.victim.name': 1,
                            'mine.scrSlots.scrs1.victim.name': 1,
                            'mine.scrSlots.scrs2.victim.name': 1,
                            'mine.scrSlots.scrs3.victim.name': 1,
                            'mine.scrSlots.scrs4.victim.name': 1,
                            'mine.scrSlots.scrs5.victim.name': 1,
                        }
                    }).mine;
                    var supScrSlots = pDMsup.amountScrSlots;
                    for(var w = 0; w < supScrSlots; w++) {
                        if(pDMsup.scrSlots['scrs'+w].victim.name == user) indexScr = w;
                    }
                    var obj0 = {};
                    obj0['mine.scrSlots.scrs' + indexScr + '.benefit'] = 5;
                    obj0['mine.scrSlots.scrs' + indexScr + '.stamp'] = "";
                    obj0['mine.scrSlots.scrs' + indexScr + '.victim.supSlotsVictim'] = "";
                    obj0['mine.scrSlots.scrs' + indexScr + '.victim.name'] = "";
                    obj0['mine.scrSlots.scrs' + indexScr + '.victim.stamp'] = "";
                    obj0['mine.scrSlots.scrs' + indexScr + '.victim.input'] = "";
                    for(var t = 0; t < sups.length; t++) {
                        obj0['mine.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.name'] = "";
                        obj0['mine.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.benefit'] = 5;
                        obj0['mine.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.stamp'] = "";
                    }
                    playerData.update({
                        user: sups[m]
                    }, {
                        $set: obj0
                    });
                }
                //reset user slots
                // console.log('reset user');
                var obj0 = {};
                obj0['mine.ownSlots.'+ slot + '.input'] = "0000";
                obj0['mine.ownSlots.'+ slot + '.stamp'] = "";
                obj0['mine.ownSlots.'+ slot + '.control.min'] = 0.1;
                obj0['mine.ownSlots.'+ slot + '.control.max'] = 10;
                for(var s = 0; s < mineSupSlots; s++) {
                    obj0['mine.ownSlots.'+ slot + '.sup' + s + '.name'] = "";
                    obj0['mine.ownSlots.'+ slot + '.sup' + s + '.benefit'] = 5;
                    obj0['mine.ownSlots.'+ slot + '.sup' + s + '.stamp'] = "";
                }
                playerData.update({
                    user: user
                }, {
                    $set: obj0
                });
            //if slot isn't finished, remember remaining
            } else {
                // push timer with remaining time of this user's slot
                progressTime = progress / (totalRate/3600000);
                console.log(totalRate);
                neededTime = value / (totalRate/3600000);
                leftTime = neededTime - progressTime;
                remaining = leftTime;
            }
        }
        // console.log('ENDM',user,slot);
        console.timeEnd('UPDATEMS');
        
        return remaining;
    }

    function updateBattlefieldSlot(user, slotNumber) {

        console.time('UPDATEBS');

        //what is left of an unfinished slot
        var remaining = 0;
        
        var slot = 'owns'+slotNumber;

        var pD = playerData.findOne({
            user: user
        }, {
            fields: {
                'backgroundId': 0,
                'mine': 0,
                'laboratory': 0,
                'thivery': 0,
                'workshop': 0,
                'smelter': 0,
                'battlefield.amountScrSlots': 0,
                'battlefield.science': 0,
                'battlefield.minControl': 0,
                'battlefield.maxControl': 0,
                'battlefield.ownItem': 0,
                'battlefield.scrItem': 0,
                'battlefield.scrSlots': 0,
                'battlefield.ownSlots.owns0.control': 0,
                'battlefield.ownSlots.owns1.control': 0,
                'battlefield.ownSlots.owns2.control': 0,
                'battlefield.ownSlots.owns3.control': 0,
                'battlefield.ownSlots.owns4.control': 0,
                'battlefield.ownSlots.owns5.control': 0,
            }
        });
        var pDB = pD.battlefield;
        var battlefieldOwnSlots = pDB.amountOwnSlots;
        var battlefieldSupSlots = pDB.amountSupSlots;
        var serverTime = new Date().getTime();

        //update battlefield of user || ownSlots
        var fightID = pDB.ownSlots[slot].input;
        //slot used?
        if(fightID > 0) {
            var fight = FightArenas.findOne({
                fight: fightID
            }, {
                fields: {
                    name: 0,
                    cost: 0,
                }
            });
            var startTime = pDB.ownSlots[slot].stamp;
            var overallTime = fight.time;
            //fight finished?
            if((serverTime - startTime) > overallTime) {
                // console.log('fight finished',(serverTime - startTime) > overallTime);
                var sups = [];
                var supEpics = 0;
                //iterate supporter
                for(var k = 0; k < battlefieldSupSlots; k++) {
                    var sup = pDB.ownSlots[slot]['sup'+k];
                    //slot used?
                    if(sup.name != "") {
                        supTime = sup.stamp;
                        supEpic = sup.benefit;
                        supEpics = supEpics + supEpic;
                        sups.push(sup.name);
                    }
                }
                //split XP
                overallXP = parseInt(((fight.value * (100 + supEpics)) / 100));
                var ownProfit = 0;
                // console.log('overallXP', overallXP);
                //falls keine supporter, user bekommt ganzen Gewinn
                if (sups.length == 0) {
                    // console.log('no sups present');
                    ownProfit = overallXP;
                //falls supporter, user bekommt Teil des Gewinns
                } else {
                    // console.log('sups present');
                    ownProfit = 0.5 * overallXP;
                    //jeder supporter bekommt einen Teil der Hälfte
                    var supProfit = (0.5 * overallXP) / sups.length;
                    // console.log('supProfit', supProfit);
                }
                //lvl up user
                var userXP = parseInt(pD.XP);
                var userReqXP = parseInt(pD.requiredXP);
                // console.log('userXP',userXP);
                // console.log('userReqXP',userReqXP);
                if((userXP + ownProfit) >= userReqXP) {
                    var lvl = pD.level;
                    var obj0 = {};
                    obj0['requiredXP'] = userReqXP + (225 * ((lvl + 10) / 2))
                    obj0['XP'] = (userXP + ownProfit) - userReqXP;
                    obj0['level'] = lvl+1;
                    // console.log('obj0', obj0);
                    playerData.update({
                        user: user
                    }, {
                        $set: obj0
                    });
                } else {
                    var userNewXPValue = (userXP + ownProfit);
                    // console.log('userNewXPValue',userNewXPValue);
                    playerData.update({
                        user: user
                    }, {
                        $set: {
                            XP: userNewXPValue
                        },
                    });
                }
                //lvl up sups
                for(var m = 0; m < sups.length; m++) {
                    var pDsup = playerData.findOne({
                        user: sups[m]
                    }, {
                        fields: {
                            requiredXP: 1,
                            XP: 1,
                            level: 1,
                        }
                    });
                    var supXP = pDsup.XP;
                    var supReqXP = pDsup.requiredXP;
                    if((supXP + ownProfit) >= supReqXP) {
                        var lvl = pDsup.level;
                        var obj0 = {};
                        obj0['requiredXP'] = (supReqXP + (225 * ((lvl + 10) / 2)));
                        obj0['XP'] = ((supXP + ownProfit) - supReqXP);
                        obj0['level'] = (lvl+1);
                        console.log('obj0',obj0);
                        playerData.update({
                            user: sups[m]
                        }, {
                            $set: obj0
                        });
                    } else {
                        var supNewXPValue = (supXP + ownProfit);
                        playerData.update({
                            user: sups[m]
                        }, {
                            $set: {
                                XP: supNewXPValue
                            },
                        });
                    }
                    //reset sup scr slot
                    var pDBsup = playerData.findOne({
                        user: sups[m]
                    }, {
                        fields: {
                            'battlefield.amountScrSlots': 1,
                            'battlefield.scrSlots.scrs0.victim.name': 1,
                            'battlefield.scrSlots.scrs1.victim.name': 1,
                            'battlefield.scrSlots.scrs2.victim.name': 1,
                            'battlefield.scrSlots.scrs3.victim.name': 1,
                            'battlefield.scrSlots.scrs4.victim.name': 1,
                            'battlefield.scrSlots.scrs5.victim.name': 1,
                        }
                    }).battlefield;
                    var supScrSlots = pDBsup.amountScrSlots;
                    for(var w = 0; w < supScrSlots; w++) {
                        if(pDBsup.scrSlots['scrs'+w].victim.name == user) indexScr = w;
                    }
                    var obj0 = {};
                    obj0['battlefield.scrSlots.scrs' + indexScr + '.benefit'] = 50;
                    obj0['battlefield.scrSlots.scrs' + indexScr + '.stamp'] = "";
                    obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.supSlotsVictim'] = "";
                    obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.name'] = "";
                    obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.stamp'] = "";
                    obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.input'] = "";
                    for(var t = 0; t < sups.length; t++) {
                        obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.name'] = "";
                        obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.benefit'] = 50;
                        obj0['battlefield.scrSlots.scrs' + indexScr + '.victim.sup' + t + '.stamp'] = "";
                    }
                    playerData.update({
                        user: sups[m]
                    }, {
                        $set: obj0
                    });
                }
                //reset user slots
                var obj0 = {};
                obj0['battlefield.ownSlots.'+ slot + '.input'] = "0000";
                obj0['battlefield.ownSlots.'+ slot + '.stamp'] = "";
                obj0['battlefield.ownSlots.'+ slot + '.control.min'] = 0.1;
                obj0['battlefield.ownSlots.'+ slot + '.control.max'] = 10;
                for(var s = 0; s < battlefieldSupSlots; s++) {
                    obj0['battlefield.ownSlots.'+ slot + '.sup' + s + '.name'] = "";
                    obj0['battlefield.ownSlots.'+ slot + '.sup' + s + '.benefit'] = 5;
                    obj0['battlefield.ownSlots.'+ slot + '.sup' + s + '.stamp'] = "";
                    obj0['battlefield.ownSlots.'+ slot + '.sup' + s + '.level'] = "";
                }
                playerData.update({
                    user: user
                }, {
                    $set: obj0
                });
            //if slot isn't finished, remember remaining
            } else {
                remaining = overallTime - (serverTime - startTime);
            }
        }
        // console.log('ENDB',user,slot);
        console.timeEnd('UPDATEBS');
        
        return remaining;
    }
    function updateTimers() {
        // console.log(timers);
        // console.log(timers.length);

        //timers0 = menu, timers1 = user, timers2 = slot, timers3 = time
        //falls timers bereits gesetzt ist
        if(timers) {
            //für jeden Eintrag im Array
            for(i = 0; i < timers.length; i++) {
                //falls noch verbleibende Zeit vorhanden
                // console.log(timers[i][3] > 0);
                if(timers[i][3] > 0) {
                    //decrement time
                    // console.log('OneTimer',timers[i][3]);
                    timers[i][3] = timers[i][3] - 1000;
                //für einen slot timer ist die Zeit abgelaufen >> trigger update
                } else if(timers[i][0] === 'mine') {
                    console.log('mine');
                    console.log('update slot',timers[i][2],'of user',timers[i][1],'in mine');
                    updateMineSlot(timers[i][1], timers[i][2]);
                    //remove timer
                    timers.splice(i, 1);
                } else if(timers[i][0] === 'battlefield') {
                    console.log('battlefield');
                    console.log('update slot',timers[i][2],'of user',timers[i][1],'in battlefield');
                    updateBattlefieldSlot(timers[i][1], timers[i][2]);
                    //remove timer
                    timers.splice(i, 1);
                }
            }
        }
    }

    //ERSETZT DURCH checkIfDuplicate


    // function addOrReplaceTimer(menu, user, slot, time) {

    //     console.log('addOrReplaceTimer');

    //     //falls der Timer einen Eintrag hat
    //     if(timers.length > 0) {
    //         //prüfe, ob der gescroungte slot bereits vorhanden ist und beschleunigt werden muss (wegen neuem sup)
    //         for(var i = 0; i < timers.length; i++) {
    //             console.log('i',i);
    //             console.log('timer_',i,'user',timers[i][1],user,'slot',timers[i][2],slot);
    //             var userFromTimer = timers[i][1];
    //             var slotFromTimer = timers[i][2];
    //             console.log('fromTimer',userFromTimer);
    //             console.log('scrounger',user);
    //             console.log('fromTimer',slotFromTimer);
    //             console.log('scrounger',slot);
    //             console.log(userFromTimer == user);
    //             var areSlotsIdentical = userFromTimer == user && slotFromTimer == slot;
    //             console.log('areSlotsIdentical',areSlotsIdentical);
    //             //bei Verwendung eines if/else Konstruktes ist der Server immer eingefroren... buggy?!
    //             // switch(areSlotsIdentical) {
    //             //         case true:
    //             //             console.log('switch true');
    //             //             // entferne den timer
    //             //             timers.splice(i,1);
    //             //             //ersetze ihn mit der neuen Restzeit (kürzer, weil jetzt supporter vorhanden)
    //             //             timers.push(menu, user, slot, time);
    //             //             break;
    //             //         case false:
    //             //             console.log('switch false');
    //             //             console.log('before',timers);
    //             //             timers.push(menu, user, slot, time);
    //             //             console.log('after',timers);
    //             //             break;
    //             //         default:
    //             //             console.log("shit");
    //             // }
    //         }
    //     //falls der Timer noch keinen Eintrag hat
    //     } else {
    //         console.log('timer was empty');
    //         console.log('before',timers);
    //         timers.push(menu, user, slot, time);
    //         console.log('after',timers);
    //     }
    // }

    function checkIfDuplicate(user, slot) {
    console.log('checkIfDuplicate');
        //falls der Timer einen Eintrag hat
        if(timers.length > 0) {
            //prüfe, ob der gescroungte slot bereits vorhanden ist und beschleunigt werden muss (wegen neuem sup)
            for(var i = 0; i < timers.length; i++) {
                console.log('i',i);
                console.log('timer',i,'user',timers[i][1],user,'slot',timers[i][2],slot);
                var userFromTimer = timers[i][1];
                var slotFromTimer = timers[i][2];
                //falls Name und Slot in derselben Kombination bereits im timer eingetragen sind, gebe slot zurück, der
                //ausgetauscht werden muss
                if(userFromTimer == user && slotFromTimer == slot) {
                    console.log('checkIfDuplicate true > updateTimer');
                    return i;
                } else {
                    //kein Duplikat
                    console.log('timers not empty but slot not duplicate either');
                    return "push";
                }
            }
        //falls der Timer noch keinen Eintrag hat
        } else {
            //falls der Timer noch keinen Eintrag hat, kann der gescroungte slot auch nicht bereits darin enthalten sein
            console.log('timers empty > push timer');
            return "push";
        }
    }

    Meteor.startup(function() {
        Meteor.setInterval(function() {
            updateTimers();
        }, 1 * 1000);
    });
}
