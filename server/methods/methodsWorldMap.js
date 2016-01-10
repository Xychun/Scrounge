////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// SERVER /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isServer) {
    /////////////////////////
    //////// METHODS ////////
    /////////////////////////
    Meteor.methods({
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
            var maxXY = STATUS.findOne({
                maxXY: {
                    $exists: true
                }
            }).maxXY;
            var newMaxXY = (maxXY * 2) + 1;

            STATUS.update({
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

        // // DENSITIY MAP POSITION
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

        // RANDOM MAP POSITION
        createRandomMapPosition: function(username) {
            //Find all free slots
            var cursorFreeSlots = worldMapFields.find({
                user: ""
            }, {
                fields: {
                    _id: 1
                }
            }).fetch();
            if (cursorFreeSlots.length > 0) {
                //Place player into free slot
                var obj1 = {};
                obj1['_id'] = cursorFreeSlots[0]._id;
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
            } else {
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
                //WorldMap has to high density: Extend and create position again
                Meteor.call('extendMapSize', cursorGodTurf);
                Meteor.call('createRandomMapPosition', username);
            }
        }
    });
}
