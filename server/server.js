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
        }, 25 * 1000);
    });

    function update() {
        // var START = new Date().getTime();

        var allUsers = Meteor.users.find({}).fetch();
        //Iterate all users
        for (var i = 0; i < allUsers.length; i++) {
            var cUser = allUsers[i].username;
            var cPData = playerData.findOne({
                user: cUser
            });
            updateMine(cUser, cPData);
            updateBattlefield(cUser, cPData);
        };

        /*var END = new Date().getTime();
        var DURATION = END - START;
        console.log('UPDATE DURATION: ' + DURATION);*/
    }

    //updates the mine

    function updateMine(cUser, cPData) {
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
                        var supProfit = (0.5 * cValue) / (allSups.length);
                    }
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
                        var obj0 = {};
                        var cSupResources = resources.findOne({
                            user: allSups[l]
                        });
                        var cSupMatter = cSupResources.values[matterColor].matter;
                        obj0['values.' + matterColor + '.matter'] = cSupMatter + supProfit;
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
                            if (sMine['scrs' + m].victim == cUser) indexScr = m;
                        }
                        if (indexScr == -1) {
                            console.log('Template.rmineBase slot calculation problem - index scr Slot');
                            break;
                        }
                        var result = indexScr;

                        var obj0 = {};
                        obj0['scrs' + result + '.victim'] = "";

                        mine.update({
                            user: allSups[l]
                        }, {
                            $set: obj0
                        });
                    }

                    //reset owner slots
                    var obj0 = {};
                    obj0[cSlot + '.input'] = '0000';
                    for (var m = 0; m < cPData.mine.supSlots; m++) {
                        obj0[cSlot + '.sup' + m] = "";
                    }
                    mine.update({
                        user: cUser
                    }, {
                        $set: obj0
                    });
                }
            }
        }
    }

    //updates the battlefield

    function updateBattlefield(cUser, cPData) {
        var cBattlefield = battlefield.findOne({
            user: cUser
        });
        var serverTime = new Date().getTime();
        //update current users BATTLEFIELD || all ownSlots
        for (var j = 0; j < cPData.battlefield.ownSlots; j++) {
            var cSlot = 'owns' + j;
            //Fight exists?
            var cFightID = cBattlefield[cSlot].input;
            if (cFightID > 0) {
                var cFight = FightArenas.findOne({
                    fight: cFightID
                });
                var overallTime = cFight.time;
                var startTime = cBattlefield[cSlot].stamp.getTime();
                //Fight DONE?
                if ((serverTime - startTime) > overallTime) {
                    var sEpics = 0;
                    var allSups = new Array();
                    //Iterate Supporter
                    for (var k = 0; k < cPData.battlefield.supSlots; k++) {
                        var cSup = cBattlefield[cSlot]['sup' + k];
                        //SupSlot used?
                        if (cSup != undefined && cSup.length != 0) {
                            var sBattlefield = battlefield.findOne({
                                user: cSup
                            });
                            var currentSupScrSlots = playerData.findOne({
                                user: cSup
                            }, {
                                fields: {
                                    battlefield: 1
                                }
                            }).battlefield.scrSlots;
                            //get index of scr slot
                            var indexScr = -1;                            
                            for (var m = 0; m < currentSupScrSlots; m++) {
                                if (sBattlefield['scrs' + m].victim == cUser) indexScr = m;
                            }
                            console.log('cUser: ' + cUser + ' currentSupScrSlots: ' + currentSupScrSlots + ' indexScr: ' + indexScr);
                            if (indexScr == -1) {
                                console.log('Server battlefield slot calculation problem 1! - index scr Slot');
                                break;
                            }
                            var result = indexScr;

                            allSups[k] = cSup;
                            //calculate epicness of cSup
                            var sEpic = sBattlefield['scrs' + result].benefit;
                            sEpics = sEpics + sEpic;
                            /*console.log(cUser + ' Progress: ' + progress);*/
                        }
                    }
                    //split XP
                    var overallXP = (cFight.value * (100 + sEpics)) / 100;
                    var ownProfit = 0;
                    if (allSups.length == 0) {
                        ownProfit = overallXP;
                    } else {
                        ownProfit = 0.5 * overallXP;
                        var supProfit = (0.5 * overallXP) / (allSups.length);
                    }
                    //owner
                    var cUserXP = cPData.XP;
                    var cUserRequXP = cPData.requiredXP;
                    //LvlUP?
                    if ((cUserXP + ownProfit) >= cUserRequXP) {
                        var lvl = cPData.level;
                        var obj0 = {};
                        obj0['requiredXP'] = cUserRequXP + (225 * ((lvl + 10) / 2))
                        obj0['XP'] = (cUserXP + ownProfit) - cUserRequXP;
                        obj0['level'] = lvl+1;
                        playerData.update({
                            user: cUser
                        }, {
                            $set: obj0
                        });
                    } else {
                        var ownerNewXPValue = (cUserXP + ownProfit);
                        playerData.update({
                            user: cUser
                        }, {
                            $set: {
                                XP: ownerNewXPValue
                            },
                        });
                    }

                    //sups
                    for (var l = 0; l < allSups.length; l++) {
                        var cSupPData = playerData.findOne({
                            user: allSups[l]
                        }, {
                            fields: {
                                requiredXP: 1,
                                XP: 1,
                                level: 1
                            }
                        });
                        var cSupXP = cSupPData.XP;
                        var cSupRequXP = cSupPData.requiredXP;
                        //LvlUP?
                        if ((cSupXP + supProfit) >= cSupRequXP) {
                            var lvl = cSupPData.level;
                            var obj0 = {};
                            obj0['requiredXP'] = cSupRequXP + (225 * ((lvl + 10) / 2))
                            obj0['XP'] = (cSupXP + supProfit) - cSupRequXP;
                            obj0['level'] = lvl+1;
                            playerData.update({
                                user: allSups[l]
                            }, {
                                $set: obj0
                            });
                        } else {
                            var supNewXPValue = (cSupXP + supProfit);
                            playerData.update({
                                user: allSups[l]
                            }, {
                                $set: {
                                    XP: supNewXPValue
                                },
                            });
                        }
                        //reset scr slot of sup
                        //get index of scr slot
                        var sBattlefield = battlefield.findOne({
                            user: allSups[l]
                        });
                        var currentSupScrSlots = playerData.findOne({
                            user: allSups[l]
                        }, {
                            fields: {
                                battlefield: 1
                            }
                        }).battlefield.scrSlots;
                        //get index of scr slot
                        var indexScr = -1;
                        for (var m = 0; m < currentSupScrSlots; m++) {
                            if (sBattlefield['scrs' + m].victim == cUser) indexScr = m;
                        }
                        console.log('cUser: ' + cUser + ' currentSupScrSlots: ' + currentSupScrSlots + ' indexScr: ' + indexScr);
                        if (indexScr == -1) {
                            console.log('Server battlefield slot calculation problem 2! - index scr Slot');
                            break;
                        }
                        var result = indexScr;
                        var obj0 = {};
                        obj0['scrs' + result + '.victim'] = "";
                        battlefield.update({
                            user: allSups[l]
                        }, {
                            $set: obj0
                        });
                    }
                    //reset owner slots
                    var obj0 = {};
                    obj0[cSlot + '.input'] = '0000';
                    for (var m = 0; m < cPData.battlefield.supSlots; m++) {
                        obj0[cSlot + '.sup' + m] = "";
                    }
                    battlefield.update({
                        user: cUser
                    }, {
                        $set: obj0
                    });
                }
            }
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

    Meteor.publish("FightArenas", function() {
        if (this.userId) {
            return FightArenas.find({});
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

    Meteor.publish("battlefield", function(current) {
        if (this.userId) {
            return battlefield.find({});
        } else {
            this.ready();
        }
    });

    Meteor.publish("worldMapFields", function() {
        if (this.userId) {
            return worldMapFields.find({});
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
