////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// SERVER /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isServer) {
    var turfUpdateArray = new Array();

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

        goScroungingMine: function(slotId) {
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
            });
            var amountScrSlots = cursorMyPlayerData.mine.scrSlots;
            var cursorMineScrounger = mine.findOne({
                user: myName
            });
            for (i = 0; i < amountScrSlots; i++) {
                if (cursorMineScrounger['scrs' + i].victim == currentUser) {
                    Meteor.call("infoLog", 'You cannot scrounge here: You already scrounge this user!', myName);
                    return '0You cannot scrounge here: You already scrounge this user!';
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
                Meteor.call("infoLog", 'You cannot scrounge here: Your Scrounge slots are all in use!', myName);
                return '0You cannot scrounge here: Your Scrounge slots are all in use!';
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
                Meteor.call("infoLog", 'You cannot scrounge here: You do not have the right miningrate!', myName);
                return '0You cannot scrounge here: You do not have the right miningrate!';
            }

            //SupSlot with id result is free and correct: update it ?
            if (resultOwner == -1) {
                Meteor.call("infoLog", 'You cannot scrounge here: The owners support slots are all full!', myName);
                return '0You cannot scrounge here: The owners support slots are all full!';
            }
            //set to mine of owner
            var obj0 = {};
            obj0['owns' + slotId + '.sup' + resultOwner] = myName;
            mine.update({
                user: currentUser
            }, {
                $set: obj0
            });

            //set to mine of scrounger
            var obj0 = {};
            obj0['scrs' + resultScrounger + '.victim'] = currentUser;
            obj0['scrs' + resultScrounger + '.stamp'] = new Date();
            mine.update({
                user: myName
            }, {
                $set: obj0
            });
            Meteor.call("infoLog", '1Scrounging successful!', myName);
            return "1Scrounging successful!";
        },

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
            });
            var amountScrSlots = cursorMyPlayerData.battlefield.scrSlots;
            var cursorBattlefieldScrounger = battlefield.findOne({
                user: myName
            });
            for (i = 0; i < amountScrSlots; i++) {
                if (cursorBattlefieldScrounger['scrs' + i].victim == currentUser) {
                    Meteor.call("infoLog", 'You cannot scrounge here: You already scrounge this user!', myName);
                    return '0You cannot scrounge here: You already scrounge this user!';
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
                Meteor.call("infoLog", 'You cannot scrounge here: Your Scrounge slots are all in use!', myName);
                return '0You cannot scrounge here: Your Scrounge slots are all in use!';
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
                Meteor.call("infoLog", 'You cannot scrounge here: You do not have the right epicness!', myName);
                return '0You cannot scrounge here: You do not have the right epicness!';
            }

            //SupSlot with id result is free and correct: update it ?
            if (resultOwner == -1) {
                Meteor.call("infoLog", 'You cannot scrounge here: The owners support slots are all full!', myName);
                return '0You cannot scrounge here: The owners support slots are all full!';
            }
            //set to battlefield of owner
            var obj0 = {};
            obj0['owns' + slotId + '.sup' + resultOwner] = myName;
            battlefield.update({
                user: currentUser
            }, {
                $set: obj0
            });

            //set to battlefield of scrounger
            var obj0 = {};
            obj0['scrs' + resultScrounger + '.victim'] = currentUser;
            obj0['scrs' + resultScrounger + '.stamp'] = new Date();
            battlefield.update({
                user: myName
            }, {
                $set: obj0
            });
            Meteor.call("infoLog", '1Scrounging successful!', myName);
            return '1Scrounging successful!';
        },

        buyMatter: function(matterId, slider_range) {
            var name = Meteor.users.findOne({
                _id: this.userId
            }).username;
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
            var matter = resources.findOne({
                user: name
            }).values[matterColor].matter;
            var cost = MatterBlocks.findOne({
                matter: matterId
            }).cost;

            //check costs
            if (!(matter >= cost)) {
                Meteor.call("infoLog", 'You cannot buy this matter: You do not have enough matter!', name);
                return '0You cannot buy this matter: You do not have enough matter!';
            }
            var amountSlots = playerData.findOne({
                user: name
            }).mine.ownSlots;

            var cursor = mine.findOne({
                user: name
            })

            //Iterate all own slots and fill matter into free one
            for (i = 0; i < amountSlots; i++) {
                if (cursor['owns' + i].input == "0000") {
                    //pay matter
                    var obj1 = {};
                    obj1['values.' + matterColor + '.matter'] = matter - cost;
                    resources.update({
                        user: name
                    }, {
                        $set: obj1
                    });
                    //add purchased item
                    var obj0 = {};
                    obj0['owns' + i + '.stamp'] = new Date();
                    obj0['owns' + i + '.input'] = matterId;
                    obj0['owns' + i + '.control.min'] = slider_range[0];
                    obj0['owns' + i + '.control.max'] = slider_range[1];
                    mine.update({
                        user: name
                    }, {
                        $set: obj0
                    });
                    break;
                }
            }
            Meteor.call("infoLog", '1Matter purchase successful!', name);
            return '1Matter purchase successful!';
        },

        buyFight: function(fightId, slider_range) {
            var name = Meteor.users.findOne({
                _id: this.userId
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
            }).values[matterColor].matter;
            var cost = FightArenas.findOne({
                fight: fightId
            }).cost;

            //check costs
            if (!(matter >= cost)) {
                Meteor.call("infoLog", 'You cannot buy this fight: You do not have enough matter!', name);
                return '0You cannot buy this fight: You do not have enough matter!';
            }
            var amountSlots = playerData.findOne({
                user: name
            }).battlefield.ownSlots;

            var cursor = battlefield.findOne({
                user: name
            })

            //Iterate all own slots and fill matter into free one
            for (i = 0; i < amountSlots; i++) {
                if (cursor['owns' + i].input == "0000") {
                    //pay matter
                    var obj1 = {};
                    obj1['values.' + matterColor + '.matter'] = matter - cost;
                    resources.update({
                        user: name
                    }, {
                        $set: obj1
                    });
                    //add purchased item
                    var obj0 = {};
                    obj0['owns' + i + '.stamp'] = new Date();
                    obj0['owns' + i + '.input'] = fightId;
                    obj0['owns' + i + '.control.min'] = slider_range[0];
                    obj0['owns' + i + '.control.max'] = slider_range[1];
                    battlefield.update({
                        user: name
                    }, {
                        $set: obj0
                    });
                    break;
                }
            }
            Meteor.call("infoLog", '1Fight purchase successful!', name);
            return '1Fight purchase successful!';
        },

        initBots: function(i) {
            function asyncInitBots(callsCount, callback) {
                callback(null);
            }
            var syncInitBots = Meteor.wrapAsync(asyncInitBots);
            try {
                var res = syncInitBots(i);
                var name = "bot" + i;
                var pw = i.toString();
                Accounts.createUser({
                    username: name,
                    password: pw
                });
                Meteor.call('init', name);
                return res;
            } catch (exception) {
                console.log('exc:', exception);
                throw exception;
            }
        },

        init: function(name) {
            // var self = Meteor.users.findOne({
            //     _id: this.userId
            // });
            // var name = self.username;
            // if (!self) return;

            // // USERS //
            // Meteor.users.update({
            //     _id: this.userId
            // }, {
            //     $set: {
            //         menu: 'mine',
            //         cu: name
            //     }
            // }, function(err) {
            //     if (err) {
            //         throw new Meteor.Error(404, 'account creation users error: ' + err);
            //     } else {
            //         //upsert successful
            //     }
            // });

            // USERS //
            Meteor.users.update({
                username: name
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
            resources.update({
                user: name
            }, {
                $set: {
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
                }
            }, {
                multi: false,
                upsert: true
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation resources error: ' + err);
                } else {
                    //insert successful
                }
            });

            //Values randomNumber are [1-5]
            var randomNumber = Math.floor((Math.random() * 5)) + 1;

            // PLAYERDATA //
            playerData.update({
                user: name
            }, {
                $set: {
                    user: name,
                    level: 0,
                    XP: 0,
                    requiredXP: 2014,
                    backgroundId: randomNumber,
                    mine: {
                        ownItem: {
                            blank: "",
                            benefit: 1,
                            upgrades: 1,
                            stolen: "null",
                            active: "false"
                        },
                        scrItem: {
                            blank: "",
                            benefit: 5,
                            upgrades: 1,
                            stolen: "null",
                            active: "false"
                        },
                        ownSlots: 3,
                        scrSlots: 6,
                        supSlots: 2,
                        science: 0.1,
                        minControl: 0.1,
                        maxControl: 10
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
                        ownItem: {
                            blank: "",
                            benefit: 0.5,
                            upgrades: 1,
                            stolen: "null",
                            active: "false"
                        },
                        scrItem: {
                            blank: "",
                            benefit: 50,
                            upgrades: 1,
                            stolen: "null",
                            active: "false"
                        },
                        ownSlots: 3,
                        scrSlots: 6,
                        supSlots: 2,
                        science: 0.1,
                        minControl: 50,
                        maxControl: 80
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
                }
            }, {
                multi: false,
                upsert: true
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation playerData error: ' + err);
                } else {
                    //insert successful
                }
            });

            // MINE //
            mine.update({
                user: name
            }, {
                $set: {
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
                }
            }, {
                multi: false,
                upsert: true
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation mine error: ' + err);
                } else {
                    //insert successful
                }
            });

            // LABORATORY //
            laboratory.update({
                user: name
            }, {
                $set: {
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
                }
            }, {
                multi: false,
                upsert: true
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation laboratory error: ' + err);
                } else {
                    //insert successful
                }
            });

            // WORKSHOP //
            workshop.update({
                user: name
            }, {
                $set: {
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
                }
            }, {
                multi: false,
                upsert: true
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation workshop error: ' + err);
                } else {
                    //insert successful
                }
            });

            // BATTLEFIELD //
            battlefield.update({
                user: name
            }, {
                $set: {
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
                }
            }, {
                multi: false,
                upsert: true
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation battlefield error: ' + err);
                } else {
                    //insert successful
                }
            });

            // THIEVERY //
            thievery.update({
                user: name
            }, {
                $set: {
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
                }
            }, {
                multi: false,
                upsert: true
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation thivery error: ' + err);
                } else {
                    //insert successful
                }
            });

            // SMELTER //
            smelter.update({
                user: name
            }, {
                $set: {
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
                }
            }, {
                multi: false,
                upsert: true
            }, function(err) {
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
}
