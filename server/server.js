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
