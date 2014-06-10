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
                var cMatterID = cMine[cSlot].input.matter;
                if (cMatterID > 0) {
                    var cMatter = MatterBlocks.findOne({
                        matter: cMatterID
                    });
                    var cValue = cMatter.value;

                    var startTime = cMine[cSlot].stamp.time.getTime();
                    var progress = (serverTime - startTime) * (7.5 / 3600000);

                    var allSups = new Array();
                    //Iterate Supporter
                    for (var k = 0; k < cPData.mine.supSlots; k++) {
                        var cSup = cMine[cSlot]['sup' + k];
                        //SupSlot used?
                        if (cSup != undefined && cSup != "false") {
                            var sMine = mine.findOne({
                                user: cSup
                            });
                            //get index of scr slot
                            var index = 0;
                            var result = 0;
                            while (result = 0) {
                                if (sMine['scrs' + index].victim = cUser) {
                                    result = index;
                                }
                                index++;
                            }

                            allSups[k] = cSup;
                            //calculate mined by cSup
                            var sTime = sMine['scrs' + result].time.getTime();
                            var sRate = sMine['scrs' + result].miningrate;
                            progress = progress + (serverTime - sTime) * (sRate / 3600000);

                            /*console.log(cUser + ' Progress: ' + progress);*/
                        }
                    }
                    //Matter CLEAR?
                    if (progress > cValue) {
                        //split matter
                        var matterColor = cMatter.color;
                        var ownProfit = 0.5 * cValue;
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
                            var sMine2 = mine.findOne({
                                user: allSups[l]
                            });
                            var index2 = 0;
                            var result2 = 0;
                            while (result2 = 0) {
                                if (sMine2['scrs' + index2].victim = cUser) {
                                    result2 = index2;
                                }
                                index2++;
                            }

                            obj2 = {};
                            obj2['scrs' + result2 + '.victim'] = 'false';

                            mine.update({
                                user: allSups[l]
                            }, {
                                $set: obj2
                            });
                        }

                        //reset owner slots
                        var obj3 = {};
                        obj3[cSlot + '.input.matter'] = '0000';
                        for (var m = 0; m < cPData.mine.supSlots; m++) {
                            obj3[cSlot + '.sup' + m] = 'false';
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



    //Publish
    Meteor.publish("userData", function() {
        if (this.userId) {
            return Meteor.users.find({}, {
                fields: {
                    'username': 1,
                    'menu': 1,
                    'cu': 1
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
            var self = Meteor.users.findOne({_id: this.userId});
            var name = self.username;
            return resources.find({user: name});
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
