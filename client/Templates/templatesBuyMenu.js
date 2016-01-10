    ///// BUY MENU /////

    //Parts created by Michael Kochanke, 30.08.2014
    //TODO: RangeSlider(?!) noch nicht fertig !
    Template.buyMenu.events({
        'click #buyMenuYes': function(e, t) {
            //console.time("BUYRESOURCE");
            //console.time("S1");
            var menu = Meteor.users.findOne({
                _id: Meteor.userId()
            }, {
                fields: {
                    menu: 1,
                }
            }).menu;
            //console.timeEnd("S1");

            // Werte des Range Sliders
            var slider_range = $('#range_slider_Buy_Menu').slider("option", "values");

            //updating the database
            if (menu == 'mine') {
                Meteor.call('buyMatter', Session.get("clickedMatter"), slider_range, function(err, result) {
                    if (err) {
                        console.log(err);
                    }
                    if (result) {
                        infoLog(result);
                        showInfoTextAnimation(result);
                        //console.timeEnd("BUYRESOURCE");
                    }
                });
            }
            if (menu == 'battlefield') {
                Meteor.call('buyFight', Session.get("clickedFight"), slider_range, function(err, result) {
                    if (err) {
                        console.log(err);
                    }
                    if (result) {
                        infoLog(result);
                        showInfoTextAnimation(result);
                    }
                });
            }
            $('#buyMenuWrapper').fadeOut();
            $('#background_fade').fadeOut();
        },

        'click #buyMenuNo': function(e, t) {
            $('#buyMenuWrapper').fadeOut();
            $('#background_fade').fadeOut();

        },
    });
