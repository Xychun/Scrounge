var handle_check = false;

//Created by Michael Kochanke, 30.08.2014
// Funktion um die Tooltips der Range Slider anzuzeigen und auszublenden
fade_In_and_Out = function(element, slot, state) {

    //console.log('element: ' + element + ' slot: ' + slot + ' state: ' + state);

    // Solange der User den Handle vom Range Slider festhält soll der Tooltip anbleiben
    // zusätzlich soll er anbleiben solange man mit der Maus über dem Range Slider ist
    if (element === "handle" && state === "out") {
        //console.log("handle.out");
        handle_check = false;
    } else if (element === "handle" && state === "in") {
        //console.log("handle.in");
        handle_check = true;
    }
    if (element === "tooltip" && state === "out") {
        //console.log("hover.out");
        hover_check = false;
    } else if (element === "tooltip" && state === "in") {
        //console.log("hover.in");
        hover_check = true;
    }

    // Tooltip geht an wenn entweder der Handle verschoben wird oder man mit der Maus über den Range Slider hovert
    // Tooltip geht nur aus wenn Maus nicht mehr auf dem Range Slider und kein Handle gezogen wird
    if (handle_check === true || hover_check === true) {
        $("#tooltip_left_handle_" + slot).filter(':not(:animated)').fadeIn('fast');
        $("#tooltip_right_handle_" + slot).filter(':not(:animated)').fadeIn('fast');
    } else if (handle_check === false && hover_check === false) {
        $("#tooltip_left_handle_" + slot).fadeOut('fast');
        $("#tooltip_right_handle_" + slot).fadeOut('fast');
    }

}

//Created by Michael Kochanke, 30.08.2014
range_slider = function(slot, min_ctrl, max_ctrl, lower_ctrl, higher_ctrl) {
    // console.log('slot: ' + slot + ' min_ctrl: ' + min_ctrl + ' max_ctrl: ' + max_ctrl + ' lower_ctrl: ' + lower_ctrl + ' higher_ctrl: ' + higher_ctrl);
    if (!$("#range_slider_" + slot).data('uiSlider') || slot === "Buy_Menu") { // Wenn der Slider noch nicht Initialisiert ist oder das BuyMenu aufgerufen wird -> True
        var left_handle;
        var right_handle;
        var current_handle;
        var disable_boolean = true;

        /*            $("#range_slider_" + slot).width($("#range_slider_" + slot).parent().width());*/

        tooltip_adjustment(slot, min_ctrl, max_ctrl, lower_ctrl, higher_ctrl, "left");
        $('.range_slider_tooltip').hide();

        if (slot === "Buy_Menu") {
            disable_boolean = false;
        }

        $("#range_slider_" + slot).slider({
            range: true,
            step: 0.01,
            min: min_ctrl,
            max: max_ctrl,
            values: [lower_ctrl, higher_ctrl],
            disabled: disable_boolean,

            start: function(event, ui) {
                left_handle = ui.values[0];
                right_handle = ui.values[1];
                //Initialisierung der Tooltip Fenster an den stellen der Handle
                tooltip_adjustment(slot, min_ctrl, max_ctrl, ui.values[0], ui.values[1], "last");
                fade_In_and_Out("handle", slot, "in");
            },

            slide: function(event, ui) {
                if (left_handle != ui.values[0])
                    current_handle = "left";
                else if (right_handle != ui.values[1])
                    current_handle = "right";
                if (left_handle === ui.values[0] && right_handle === ui.values[1])
                    current_handle = "last";
                var slide_check = tooltip_adjustment(slot, min_ctrl, max_ctrl, ui.values[0], ui.values[1], current_handle);
                return slide_check;
            },
            stop: function(event, ui) {
                fade_In_and_Out("handle", slot, "out");
            }
        });
    }
}

//Created by Michael Kochanke, 30.08.2014
tooltip_adjustment = function(slot, min_ctrl, max_ctrl, lower_ctrl, higher_ctrl, handle) {
    var ctrl_range = max_ctrl - min_ctrl,
        slider_threshold = ctrl_range * 0.1,
        lower_pixel = ((lower_ctrl - min_ctrl) * 100 / ctrl_range) * $("#range_slider_" + slot).width() / 100,
        higher_pixel = ((higher_ctrl - min_ctrl) * 100 / ctrl_range) * $("#range_slider_" + slot).width() / 100,
        last,
        range_end_left,
        range_end_right;

    if (handle === "last")
        handle = last;

    if (higher_ctrl - lower_ctrl >= slider_threshold) {

        if (lower_pixel < 27)
            lower_pixel = 27;

        if (higher_pixel > $("#range_slider_" + slot).width() - 27)
            higher_pixel = $("#range_slider_" + slot).width() - 27;

        if (handle === "left") {
            last = handle;
            if (lower_pixel > higher_pixel - 54)
                lower_pixel = higher_pixel - 54;
        }
        if (handle === "right") {
            last = handle;
            if (higher_pixel < lower_pixel + 54)
                higher_pixel = lower_pixel + 54;
        }

        $("#tooltip_left_handle_" + slot).css('left', lower_pixel).text(lower_ctrl);
        $("#tooltip_right_handle_" + slot).css('left', higher_pixel).text(higher_ctrl);
        return true;
    } else if (higher_ctrl - lower_ctrl < slider_threshold) {
        return false;
    }
}

var deps_count = 0;
//Created by Michael Kochanke, 30.08.2014
//DEPS AUTORUN FOR RANGE SLIDER
Deps.autorun(function() {
    var init = Session.get("init");
    // console.log('rangeautorun:', deps_count);
    if (deps_count == 1) {

        init_draggable();
        init_droppable();

        $("#right_resolution").append("<div id='item_tooltip_window' title=''></div>");
        $("#right_resolution").append("<div id='short_tooltip_window' title=''><div id='short_tooltip_background'><p id='short_tooltip_text' class='text'></p></div></div>");

        if ($(window).width() < 1920 && $("#loginWrapper").length == 0) {
            current_resolution = "<1920";
            $("#wrong_resolution").css({
                "display": "block"
            });
            $("#right_resolution").css({
                "display": "none"
            });
        }
        if ($(window).width() >= 1920 && $("#loginWrapper").length == 0) {
            current_resolution = ">=1920";
            $("#wrong_resolution").css({
                "display": "none"
            });
            $("#right_resolution").css({
                "display": "block"
            });
        }

        var menu = Meteor.users.findOne({
            _id: Meteor.userId()
        }).menu;
        var break_while = false;
        var while_count = 0;
        while (while_count < GV_category_names.length && break_while == false) {
            if (menu.search(GV_category_names[while_count]) == 0)
                break_while = true;
            while_count++;
        }
        var category_offset_left = (Math.abs(while_count - 6) + GV_current_category) % 6;
        for (var x = 0; x < (category_offset_left); x++) {
            $("#categories_wrapper").children().eq(-1).remove();
            $("#categories_wrapper").prepend($("#categories_wrapper").children().eq(-2).clone());
        }
        GV_current_category = while_count;
    }

    var middle = Session.get("middle");
    if (!middle) {
        middle = "";
    } else if (middle.length > 2 && middle !== "characterView") {

        var amountSlots;
        var amountScroungeSlots;
        var input;
        var minControl;
        var maxControl;
        var lowerControl;
        var higherControl;

        switch (middle) {
            case "mine":
                var name = Meteor.users.findOne({
                    _id: Meteor.userId()
                }).cu;
                var cursorPlayerData = playerData.findOne({
                    user: name
                });
                var input = mineBase.find({
                    user: name
                }).fetch();
                amountSlots = cursorPlayerData.mine.amountOwnSlots;
                amountScroungeSlots = cursorPlayerData.mine.amountSrcSlots;
                minControl = cursorPlayerData.mine.minControl;
                maxControl = cursorPlayerData.mine.maxControl;
                break;
            case "battlefield":
                var name = Meteor.users.findOne({
                    _id: Meteor.userId()
                }).cu;
                var cursorPlayerData = playerData.findOne({
                    user: name
                });
                var input = battlefieldBase.find({
                    user: name
                }).fetch();
                amountSlots = cursorPlayerData.battlefield.amountOwnSlots;
                amountScroungeSlots = cursorPlayerData.battlefield.amountSrcSlots;
                minControl = cursorPlayerData.battlefield.minControl;
                maxControl = cursorPlayerData.battlefield.maxControl;
                break;
            default:
                console.log('default');
                break;
        }

        for (var i = 0; i < input.length; i++) {
            if (input[i].input > 0) {
                range_slider(input[i].slotID, minControl, maxControl, input[i].controlMin, input[i].controlMax);
            }
        }
        Session.set("middle", "");

    } else if (middle === "characterView") {
        character_view_droppable();
        Session.set("middle", "");
    }
    deps_count++;
});
