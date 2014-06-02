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
        //Meteor.setInterval(update(), 10000);
        //update();
    });

    function update() {
        var allUsers = Meteor.users.find({}).fetch();
        //Iterate all users
        for (var i = 0; i < allUsers.length; i++) {
            var cUser = allUsers[i].username;
            var cPData = playerData.findOne({
                user: cUser
            });
            var cMine = mine.findOne({
                user: cUser
            });

            var serverTime = new Date().getTime();

            //update current users mine || all ownSlots
            for (var j = 0; j < cPData.mine.ownSlots; j++) {
                var cSlot = 'owns' + j;
                //Materie vorhanden?
                var cMatterID = cMine[cSlot].input.matter;
                if (cMatterID > 0) {
                    var cMatter = MatterBlocks.findOne({
                        matter: cMatterID
                    });
                    var value = cMatter.value;

                    var startTime = cMine[cSlot].stamp.time.getTime();
                    //console.log('ST: ' + serverTime + ' STARTT: ' + startTime);
                    //console.log(serverTime-startTime);
                    var progress = (serverTime - startTime) * (7.5 / 3600000);
                    //console.log('1: ' + progress);
                    //Iterate Supporter
                    for (var k = 0; k < cPData.mine.supSlots; k++) {
                        var cSup = cMine[cSlot]['sup' + k];
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

                        var sTime = sMine['scrs' + result].time.getTime();
                        var sRate = sMine['scrs' + result].miningrate;
                        progress = progress + (serverTime - sTime) * (sRate / 3600000);
                        console.log('2: '+ progress);
                    }
                }
            }
        };
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
