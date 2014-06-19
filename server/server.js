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
                                user: currentSup
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

    function createMapPosition(username) {
        //Find random position
        //Find turf highest size
        var godTurf = Turf.find({}, {
            fields: {
                turfSize: 1
            }
        }, {
            sort: {
                turfSize: -1
            }
        }).fetch()[0];
        //Find lowest density Turf, babyTurf
        var babyTurfId = getBabyTurf(godTurf._id);
        var cursorBabyTurf = Turf.findOne({
            _id: babyTurfId
        }, {
            fields: {
                turfSize: 0
            }
        });

        //Check lowest densitiy value
        if (cursorBabyTurf.density < 60) {
            //Set player position on free slot and update densitiy
            //Find all free slots
            var freeSlots = new Array();
            for (i = 0; i < 3; i++) {
                if (worldMapFields.findOne({
                    _id: cursorBabyTurf['child' + i]
                }, {
                    fields: {
                        user: 1
                    }
                }).user != "") freeSlots.push(i);
            }
            //Values randomPosition are [0-(freeSlots.length-1)]
            var randomPosition = Math.floor((Math.random() * freeSlots.length));
            //Place player into random free slot
            var obj1 = {};
            obj1['_id'] = cursorBabyTurf['child' + randomPosition];
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
            })
            console.log('Position done!');
            //TO-DO updateDensitiy
        } else {
            //Create new Turf and search again
        }
    }

    function getBabyTurf(godTurfId) {
        var cursorGodTurf = Turf.findOne({
            _id: godTurfId
        });
        //No more Turf childs ?
        if (cursorGodTurf.turfSize == 0) return godTurfId
        var cursorChild0 = Turf.findOne({
            _id: cursorGodTurf.child0
        }, {
            fields: {
                _id: 1,
                densitiy: 1
            }
        });
        var cursorChild1 = Turf.findOne({
            _id: cursorGodTurf.child1
        }, {
            fields: {
                _id: 1,
                densitiy: 1
            }
        });
        var cursorChild2 = Turf.findOne({
            _id: cursorGodTurf.child2
        }, {
            fields: {
                _id: 1,
                densitiy: 1
            }
        });
        var cursorChild3 = Turf.findOne({
            _id: cursorGodTurf.child3
        }, {
            fields: {
                _id: 1,
                densitiy: 1
            }
        });

        //Lowest densitiy of Turf childs
        var lowestDensity = Math.min(cursorChild0.densitiy, cursorChild1.densitiy, cursorChild2.densitiy, cursorChild3.densitiy);

        //Recursive: get lowest Turf with lowest densitiy - - -
        if (cursorChild0.densitiy == lowestDensity) {
            return getBabyTurf(cursorChild0._id);
        } else if (cursorChild1.densitiy == lowestDensity) {
            return getBabyTurf(cursorChild1._id);
        } else if (cursorChild2.densitiy == lowestDensity) {
            return getBabyTurf(cursorChild2._id);
        } else {
            return getBabyTurf(cursorChild3._id);
        }
    }

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
