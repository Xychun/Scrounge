////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// HELP SECTION /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//[JQUERY: ATTR = Attribute Selector!]
// expl: $(this).attr('id') 

// var elm = document.createElement("div");
// var jelm = $(elm);//convert to jQuery Element
// var htmlElm = jelm[0];//convert to HTML Element

// Meteor - get object : $(event.target).css({"background-color":"orange"});
// Meteor - get object ID: alert($(event.currentTarget.ID));     alert(event.target.id);

////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// SERVER /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isServer) {
    Meteor.startup(function() {
        // code to run on server at startup
        update();
        Meteor.setInterval(function() {
            update();
        }, 20 * 1000);
    });

    function update() {
        var START = new Date().getTime();

        var allUsers = Meteor.users.find({}).fetch();
        //Iterate all users
        for (var i = 0; i < allUsers.length; i++) {
            //TO-DO nur die Felder aus der DB holen, die verwendet werden
            var cUser = allUsers[i].username;
            var cPData = playerData.findOne({
                user: cUser
            });
            var cMine = mine.findOne({
                user: cUser
            });

            var serverTime = new Date().getTime();

            //update current users MINE || all ownSlots
            for (var j = 0; j < cPData.mine.ownSlots; j++) {
                var cSlot = 'owns' + j;
                //Matter exists?
                var cMatterID = cMine[cSlot].input;
                if (cMatterID > 0) {
                    var cMatter = MatterBlocks.findOne({
                        matter: cMatterID
                    });
                    var cValue = cMatter.value;

                    var startTime = cMine[cSlot].stamp.getTime();
                    var progress = (serverTime - startTime) * (7.5 / 3600000);
                    // console.log(cUser + ': ' + progress);

                    var allSups = new Array();
                    //Iterate Supporter
                    for (var k = 0; k < cPData.mine.supSlots; k++) {
                        var cSup = cMine[cSlot]['sup' + k];
                        //SupSlot used?
                        if (cSup != undefined && cSup.length != 0) {
                            var sMine = mine.findOne({
                                user: cSup
                            });
                            var currentSupScrSlots = playerData.findOne({
                                user: cSup
                            }, {
                                fields: {
                                    mine: 1
                                }
                            }).mine.scrSlots;
                            //get index of scr slot
                            var indexScr = -1;
                            for (var m = 0; m < currentSupScrSlots; m++) {
                                if (sMine['scrs' + m].victim == cUser) indexScr = m;
                            }
                            if (indexScr == -1) {
                                console.log('Template.rmineBase slot calculation problem - index scr Slot');
                                break;
                            }
                            var result = indexScr;

                            allSups[k] = cSup;
                            //calculate mined by cSup
                            var sTime = sMine['scrs' + result].stamp.getTime();
                            var sRate = sMine['scrs' + result].benefit;
                            progress = progress + (serverTime - sTime) * (sRate / 3600000);

                            /*console.log(cUser + ' Progress: ' + progress);*/
                        }
                    }
                    //Matter CLEAR?
                    if (progress > cValue) {
                        //split matter
                        var matterColor = cMatter.color;
                        var ownProfit = 0;
                        if (allSups.length == 0) {
                            ownProfit = cValue;
                        } else {
                            ownProfit = 0.5 * cValue;
                        }
                        var supProfit = (0.5 * cValue) / (allSups.length);
                        var cUserResources = resources.findOne({
                            user: cUser
                        });
                        var cUserMatter = cUserResources.values[matterColor].matter;

                        //owner
                        var obj0 = {};
                        obj0['values.' + matterColor + '.matter'] = cUserMatter + ownProfit;
                        resources.update({
                            user: cUser
                        }, {
                            $set: obj0
                        });

                        //sups
                        for (var l = 0; l < allSups.length; l++) {
                            var obj1 = {};
                            var cSupResources = resources.findOne({
                                user: allSups[l]
                            });
                            var cSupMatter = cSupResources.values[matterColor].matter;
                            obj1['values.' + matterColor + '.matter'] = cSupMatter + supProfit;
                            resources.update({
                                user: allSups[l]
                            }, {
                                $set: obj0
                            });
                            //reset scr slot of sup
                            //get index of scr slot
                            var sMine = mine.findOne({
                                user: allSups[l]
                            });
                            var currentSupScrSlots = playerData.findOne({
                                user: allSups[l]
                            }, {
                                fields: {
                                    mine: 1
                                }
                            }).mine.scrSlots;
                            //get index of scr slot
                            var indexScr = -1;
                            for (var m = 0; m < currentSupScrSlots; m++) {
                                console.log(m);
                                console.log(sMine['scrs' + m].victim);
                                if (sMine['scrs' + m].victim == cUser) indexScr = m;
                            }
                            if (indexScr == -1) {
                                console.log('Template.rmineBase slot calculation problem - index scr Slot');
                                break;
                            }
                            var result = indexScr;

                            var obj2 = {};
                            obj2['scrs' + result + '.victim'] = '';

                            mine.update({
                                user: allSups[l]
                            }, {
                                $set: obj2
                            });
                        }

                        //reset owner slots
                        var obj3 = {};
                        obj3[cSlot + '.input'] = '0000';
                        for (var m = 0; m < cPData.mine.supSlots; m++) {
                            obj3[cSlot + '.sup' + m] = '';
                        }
                        mine.update({
                            user: cUser
                        }, {
                            $set: obj3
                        });
                    }
                }
            }
        };

        /*var END = new Date().getTime();
        var DURATION = END - START;
        console.log('UPDATE DURATION: ' + DURATION);*/
    }

    // var turfUpdateArray = new Array();

    // function createMapPosition(username) {
    //     turfUpdateArray.length = 0;
    //     //Find random position
    //     //Find turf highest size
    //     var cursorGodTurf = Turf.find({}, {
    //         fields: {
    //             turfSize: 1
    //         }
    //     }, {
    //         sort: {
    //             turfSize: -1
    //         }
    //     }).fetch()[0];

    //     //Check average density value: <60% create position:extend mapSize
    //     if (cursorGodTurf.density < 60) {
    //         //Set player position on free slot and update density
    //         //Find lowest density Turf, babyTurf
    //         var babyTurfId = getBabyTurf(cursorGodTurf._id);
    //         var cursorBabyTurf = Turf.findOne({
    //             _id: babyTurfId
    //         }, {
    //             fields: {
    //                 turfSize: 0
    //             }
    //         });
    //         //Find all free slots
    //         var freeSlots = new Array();
    //         for (var i = 0; i < 3; i++) {
    //             if (worldMapFields.findOne({
    //                 _id: cursorBabyTurf['child' + i]
    //             }, {
    //                 fields: {
    //                     user: 1
    //                 }
    //             }).user != "") freeSlots.push(i);
    //         }
    //         //Values randomPosition are [0-(freeSlots.length-1)]
    //         var randomPosition = Math.floor((Math.random() * freeSlots.length));
    //         //Place player into random free slot
    //         var obj1 = {};
    //         obj1['_id'] = cursorBabyTurf['child' + randomPosition];
    //         worldMapFields.update(obj1, {
    //             $set: {
    //                 user: username
    //             }
    //         });
    //         cursorWorldMap = worldMapFields.findOne({
    //             user: username
    //         });
    //         var obj2 = {};
    //         obj2['x'] = cursorWorldMap.x;
    //         obj2['y'] = cursorWorldMap.y;
    //         Meteor.users.update({
    //             username: username
    //         }, {
    //             $set: obj2
    //         })
    //         console.log('Position done!');
    //         updateDensity();
    //     } else {
    //         extendMapSize(cursorGodTurf);
    //         createMapPosition(username);
    //     }
    // }

    // function getBabyTurf(parentTurfId) {
    //     var cursorParentTurf = Turf.findOne({
    //         _id: parentTurfId
    //     });
    //     //No more Turf childs ?
    //     if (cursorParentTurf.turfSize == 0) return parentTurfId
    //     var cursorChild0 = Turf.findOne({
    //         _id: cursorParentTurf.child0
    //     }, {
    //         fields: {
    //             _id: 1,
    //             density: 1
    //         }
    //     });
    //     var cursorChild1 = Turf.findOne({
    //         _id: cursorParentTurf.child1
    //     }, {
    //         fields: {
    //             _id: 1,
    //             density: 1
    //         }
    //     });
    //     var cursorChild2 = Turf.findOne({
    //         _id: cursorParentTurf.child2
    //     }, {
    //         fields: {
    //             _id: 1,
    //             density: 1
    //         }
    //     });
    //     var cursorChild3 = Turf.findOne({
    //         _id: cursorParentTurf.child3
    //     }, {
    //         fields: {
    //             _id: 1,
    //             density: 1
    //         }
    //     });

    //     //Lowest density of Turf childs
    //     var lowestDensity = Math.min(cursorChild0.density, cursorChild1.density, cursorChild2.density, cursorChild3.density);

    //     //Recursive: get lowest Turf with lowest density - - -
    //     if (cursorChild0.density == lowestDensity) {
    //         turfUpdateArray.push(cursorChild0._id);
    //         return getBabyTurf(cursorChild0._id);
    //     } else if (cursorChild1.density == lowestDensity) {
    //         turfUpdateArray.push(cursorChild1._id);
    //         return getBabyTurf(cursorChild1._id);
    //     } else if (cursorChild2.density == lowestDensity) {
    //         turfUpdateArray.push(cursorChild2._id);
    //         return getBabyTurf(cursorChild2._id);
    //     } else {
    //         turfUpdateArray.push(cursorChild3._id);
    //         return getBabyTurf(cursorChild3._id);
    //     }
    // }

    // // function updateDensity() {
    // //     //Reverse the Array so that the algorithm starts with the lowest Turf size
    // //     turfUpdateArray.reverse();
    // //     //Update BabyTurf - always one element at the beginning of the array
    // //     var obj0 = {};
    // //     obj['density'] = getDensity(turfUpdateArray[0]);
    // //     // Turf.update({
    // //     //         _id: turfUpdateArray[0]
    // //     //     }, {
    // //     //         $set: obj0)
    // //     // });

    // //     //Update the other Turf
    // //     for (var i = 1; i < turfUpdateArray.lgenth; i++) {
    // //         var cursorCurrentTurf = Turf.findOne({
    // //             _id: turfUpdateArray[i]
    // //         });
    // //         var newDensity = getDensity(turfUpdateArray[i]);
    // //         if (cursorCurrentTurf.density != newDensity) {
    // //             obj0 = {};
    // //             obj0['density'] = newDensity;
    // //             Turf.update({
    // //                     _id: turfUpdateArray[i]
    // //                 }, {
    // //                     $set: obj0
    // //                 }
    // //             }
    // //         }
    // //     }
    // // }

    // function getDensity(turfId) {
    //     var cursorCurrentTurf = Turf.findOne({
    //         _id: turfId
    //     });
    //     if (cursorCurrentTurf.turfSize == 0) {
    //         console.log(worldMapFields.findOne({
    //             _id: cursorCurrentTurf.child0
    //         }, {
    //             fields: {
    //                 user: 1
    //             }
    //         }).user.length);
    //         var field0 = worldMapFields.findOne({
    //             _id: cursorCurrentTurf.child0
    //         }, {
    //             fields: {
    //                 user: 1
    //             }
    //         }).user.length;
    //         if (field0 > 0) field0 = 1;
    //         var field1 = worldMapFields.findOne({
    //             _id: cursorCurrentTurf.child1
    //         }, {
    //             fields: {
    //                 user: 1
    //             }
    //         }).user.length;
    //         if (field1 > 0) field1 = 1;
    //         var field2 = worldMapFields.findOne({
    //             _id: cursorCurrentTurf.child2
    //         }, {
    //             fields: {
    //                 user: 1
    //             }
    //         }).user.length;
    //         if (field2 > 0) field2 = 1;
    //         var field3 = worldMapFields.findOne({
    //             _id: cursorCurrentTurf.child3
    //         }, {
    //             fields: {
    //                 user: 1
    //             }
    //         }).user.length;
    //         if (field3 > 0) field3 = 1;
    //         return ((field0 + field1 + field2 + field3) / 4);
    //     } else {
    //         //Recursive: get density of childs for this density - - -
    //         return ((getDensity(cursorCurrentTurf.child0) + getDensity(cursorCurrentTurf.child1) + getDensity(cursorCurrentTurf.child2) + getDensity(cursorCurrentTurf.child3)) / 4);
    //     }
    // }

    // function extendMapSize(cursorGodTurf) {
    //     //Get orientation and size of the map
    //     //Bottom left
    //     var minX = worldMapFields.findOne({}, {
    //         fields: {
    //             x: 1
    //         }
    //     }, {
    //         sort: 1
    //     }).fetch()[0];
    //     var minY = worldMapFields.findOne({}, {
    //         fields: {
    //             y: 1
    //         }
    //     }, {
    //         sort: 1
    //     }).fetch()[0];
    //     //Top right
    //     var maxX = worldMapFields.findOne({}, {
    //         fields: {
    //             x: 1
    //         }
    //     }, {
    //         sort: -1
    //     }).fetch()[0];
    //     var maxY = worldMapFields.findOne({}, {
    //         fields: {
    //             y: 1
    //         }
    //     }, {
    //         sort: -1
    //     }).fetch()[0];
    //     //The Edge length of the whole map
    //     var mapEdgeLength = Math.pow(2, cursorGodTurf.turfSize + 1);

    //     //Create new GodTurf with the old one as child0
    //     obj0 = {};
    //     obj['child0'] = cursorGodTurf._id;
    //     for (var i = 1; i < 4; i++) {
    //         obj['child' + i] = createNewTurf(cursorGodTurf.turfSize);
    //     }
    //     obj0['turfSize'] = cursorGodTurf.turfSize + 1;
    //     obj0['density'] = 15;
    //     Turf.insert(obj0);
    // }

    // function createNewTurf(turfSize) {

    // }

    //Publish
    Meteor.publish("userData", function() {
        if (this.userId) {
            return Meteor.users.find({}, {
                fields: {
                    'username': 1,
                    'menu': 1,
                    'cu': 1,
                    'x': 1,
                    'y': 1
                }
            });
        } else {
            this.ready();
        }
    });

    Meteor.publish("playerData", function() {
        if (this.userId) {
            return playerData.find({});
        } else {
            this.ready();
        }
    });

    Meteor.publish("resources", function() {
        if (this.userId) {
            var self = Meteor.users.findOne({
                _id: this.userId
            });
            var name = self.username;
            return resources.find({
                user: name
            });
        } else {
            this.ready();
        }
    });

    Meteor.publish("MatterBlocks", function() {
        if (this.userId) {
            return MatterBlocks.find({});
        } else {
            this.ready();
        }
    });

    Meteor.publish("mine", function(current) {
        if (this.userId) {
            return mine.find({});
        } else {
            this.ready();
        }
    });

    Meteor.publish("laboratory", function(current) {
        if (this.userId) {
            return laboratory.find({
                user: current
            });
        } else {
            this.ready();
        }
    });

    Meteor.publish("colosseum", function(current) {
        if (this.userId) {
            return colosseum.find({
                user: current
            });
        } else {
            this.ready();
        }
    });

    Meteor.users.allow({
        update: function(userId, docs, fields, modifier) {
            if (fields == 'menu' || fields == 'cu') {
                return true;
            } else {
                return false;
            }
        }
    });
}
