//Created by Michael Kochanke, 30.08.2014
init_droppable = function () {
    $(".droppable").droppable({
        hoverClass: "droppable_slot_hover",
        drop: function(event, ui) {
            if ($(this).html().trim().length == 0) {
                $(ui.draggable).detach().appendTo($(this));
            } else if ($(this).html().trim().length > 0) {
                var buffer_parent = $(ui.draggable).parent();
                $(ui.draggable).detach();
                $(this).children().detach().appendTo(buffer_parent);
                $(ui.draggable).appendTo($(this));
            }
        },
    });
    Session.set("init_bool", false);
}

//Created by Michael Kochanke, 30.08.2014
character_view_droppable = function () {
    for (var x = 1; x <= 6; x++) {
        item_type = "#item_type_" + x;
        $("#scrounge_item_slot_" + x).droppable({
            accept: ".item_type_" + x,
            addClasses: false,
            hoverClass: "proper_droppable_slot_hover",
            drop: function(event, ui) {
                if ($(this).html().trim().length == 0) {
                    $(ui.draggable).detach().appendTo($(this));
                } else if ($(this).html().trim().length > 0) {
                    var buffer_parent = $(ui.draggable).parent();
                    $(ui.draggable).detach();
                    $(this).children().detach().appendTo(buffer_parent);
                    $(ui.draggable).appendTo($(this));
                }
            }
        });
    }
}

//Created by Michael Kochanke, 30.08.2014
init_draggable = function () {
    $(".draggable").draggable({
        addClasses: false,
        helper: 'clone',
        revert: 'invalid',
        appendTo: 'body',
        containment: "window",
        start: function(event, ui) {
            $(this).hide();
            $("#scrounge_item_slot_" + $(this).attr("class").substr(54)).addClass("proper_droppable_slot");
        },
        stop: function() {
            $(this).show();
            $("#scrounge_item_slot_" + $(this).attr("class").substr(54)).removeClass("proper_droppable_slot");
        }
    });
}