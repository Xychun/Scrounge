///// STANDARD BORDER /////
Template.standardBorder.onCreated(function() {
    var inst = this;
    inst.state = new ReactiveDict();
    
    var self = Meteor.users.findOne({
        _id: Meteor.userId()
    }, {
        fields: {
            username: 1,
            _id: 0
        }
    }).username;
    inst.autorun(function() {
        var subsResourcesBorder = inst.subscribe('resources');
    })
    inst.state.set('self', self);
});

Template.standardBorder.helpers({
    resources: function() {
        return resources.find({
            user: Template.instance().state.get('self')
        });
    },

    imagePosition: function(sr) {
        return resourcesCTBP(this.colorCode, sr);
    }
});

Template.standardBorder.events({

    'click #testButton': function(e, t) {
        // console.log('Bots are generating!');
        // This methodes activates l-k bots with the names from l to k
        // createBots(1, 1000);
        // This methodes activates n bots to simulate user actions
        // actionBots(5);
    },

    'click #testButton2': function(e, t) {
        // logRenders();
        Meteor.call('singleUpdate');
    },

    'click #testButton3': function(e, t) {
        //param: interval in seconds
        Meteor.call('updateLoop', 25);
    },

    'click .category_1': function(e, t) {
        //console.time("SWITCH CATEGORY3");
        //console.time("SWITCH CATEGORY4");
        switch_category($(e.target), 100, function() {
            Meteor.users.update({
                _id: Meteor.userId()
            }, {
                $set: {
                    menu: 'mine'
                }
            });
        });
    },

    'click .category_3': function(e, t) {
        //console.time("SWITCH CATEGORY3");
        //console.time("SWITCH CATEGORY4");
        switch_category($(e.target), 100, function() {
            Meteor.users.update({
                _id: Meteor.userId()
            }, {
                $set: {
                    menu: 'battlefield'
                }
            });
        });
    },

    'click #switchToWorldMap': function(e, t) {
        if (!$("#worldViewPort").length) {
            switchToWorldMap();
        } else {
            renderActiveMiddle();
        }
    },

    'click #character': function(e, t) {
        if ($('.characterView').length == 0) {
            Router.current().render('characterView', {
                to: 'middle'
            });
        } else {
            renderActiveMiddle();
        }
    },

    'click #scrounge': function(e, t) {
        var self = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                cu: 1,
                username: 1
            }
        });
        if (self.cu != self.username) {
            Session.set("lastPlayer", self.cu);
            Meteor.users.update({
                _id: Meteor.userId()
            }, {
                $set: {
                    cu: self.username
                }
            });
        } else {
            if (Session.get("lastPlayer") != undefined) {
                Meteor.users.update({
                    _id: Meteor.userId()
                }, {
                    $set: {
                        cu: Session.get("lastPlayer")
                    }
                });
            } else {
                switchToWorldMap();
            }
        }
        // console.log("SWITCH MODE");
    }
});

//Created by Michael Kochanke, 30.08.2014

function switch_category(clicked_obj, speed, callback) {
    //console.time("SWITCH CATEGORY1");
    //console.time("SWITCH CATEGORY2");
    // console.log("SWITCH CATEGORY");

    if ($("#categories_wrapper").filter(':not(:animated)').length == 1) {

        var width_child = parseFloat($("#categories_wrapper").children().eq(0).width()) + 10;
        var margin_left_middle = -1 * (parseFloat($("#categories_wrapper").width()) - width_child) / 2;

        var current_margin_left = $("#categories_wrapper").attr("style");
        if (current_margin_left == undefined) {
            current_margin_left = parseFloat($("#categories_wrapper").css("margin-left"));
        } else {
            var start = current_margin_left.search("margin-left: ");
            var end = current_margin_left.search("px");
            current_margin_left = parseFloat(current_margin_left.slice(start + 13, end));
        }

        var direction = null;
        var category_offset = null;
        var animation_type = "linear";
        var buffer_image = null;

        var break_while = false;
        var y = 0;
        while (y < $("#categories_wrapper").children().length && break_while == false) {
            if ($("#categories_wrapper").children().eq(y)[0] == $(clicked_obj)[0])
                break_while = true;
            y++;
        }

        if (current_margin_left < margin_left_middle) {
            buffer_image = "left";
            y--;
        } else if (current_margin_left >= margin_left_middle) {
            buffer_image = "right";
        }
        category_offset = y - 4;

        if (category_offset < 0) {
            direction = "left";
            var forth_animation = margin_left_middle;
            var rollback = margin_left_middle - width_child;
            category_offset = Math.abs(category_offset);
        } else if (category_offset > 0) {
            direction = "right";
            var forth_animation = margin_left_middle - width_child;
            var rollback = margin_left_middle;
        }

        if (!(buffer_image == direction)) {
            if (direction == "right") {
                $("#categories_wrapper").children().eq(0).remove();
                var buffer = $("#categories_wrapper").children().eq(1).clone();
                $("#categories_wrapper").append(buffer);
                $("#categories_wrapper").css({
                    "margin-left": margin_left_middle
                });
            } else if (direction == "left") {
                $("#categories_wrapper").children().eq(-1).remove();
                var buffer = $("#categories_wrapper").children().eq(-2).clone();
                $("#categories_wrapper").prepend(buffer);
                $("#categories_wrapper").css({
                    "margin-left": (margin_left_middle - width_child)
                });
            }
        }

        var animation_type = "linear";
        var animation_obj_forth = ({
            'margin-left': forth_animation
        });
        var animation_obj_rollback = ({
            'margin-left': rollback
        });

        var animation_count = 0;
        for (var x = 0; x < category_offset; x++) {
            //console.log('for x : ' + x + " offset: " + category_offset);
            if (x == category_offset - 1) {
                animation_type = "easeOutBack";
                speed = speed * 4;
            }
            $("#categories_wrapper").animate(animation_obj_forth, speed, animation_type, function() {
                //console.log('animate: ' + x);
                if (direction == "left") {
                    $("#categories_wrapper").children().eq(-1).remove();
                    $("#categories_wrapper").prepend($("#categories_wrapper").children().eq(-2).clone());
                    $("#categories_wrapper").css(
                        animation_obj_rollback
                    );
                } else if (direction == "right") {
                    $("#categories_wrapper").children().eq(0).remove();
                    var buffer = $("#categories_wrapper").children().eq(1).clone();
                    $("#categories_wrapper").append(buffer);
                    $("#categories_wrapper").css(
                        animation_obj_rollback
                    );
                }
                animation_count++;
                if (animation_count == category_offset) {
                    callback();
                }
            });
        }
    }
}
