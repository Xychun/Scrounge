//Created by Michael Kochanke, 30.08.2014
Template.masterLayout.events({
    'mousedown img': function(e, t) {
        return false;
    },
    'mouseover .item_tooltip': function(e, t) {
        //Session.set("changes", "onMouseOver");
        $("#item_tooltip_window").html($(e.target).attr("title"));
        $(e.target).attr("title", "");
        $("#item_tooltip_window").css({
            display: "table"
        });
        if ($("#item_tooltip_window").width() + e.clientX > $(window).width()) {
            var offset = -1 * $("#item_tooltip_window").width();
            $("#item_tooltip_window").css({
                "margin-left": offset
            });
        } else {
            $("#item_tooltip_window").css({
                "margin-left": "0px"
            });
        }

        $("#item_tooltip_window").stop().fadeTo("fast", 1);
    },
    'mousemove .item_tooltip': function(e, t) {
        $("#item_tooltip_window").css({
            left: e.clientX,
            top: e.clientY
        });
    },
    'mouseout .item_tooltip': function(e, t) {
        //Session.set("changes", "onMouseOut");
        $(e.target).attr("title", $("#item_tooltip_window").html());
        $("#item_tooltip_window").stop().fadeTo("fast", 0, function() {
            $("#item_tooltip_window").css({
                display: "none"
            });
        });
    },
    'mouseover .short_tooltip': function(e, t) {
        $("#short_tooltip_text").html($(e.currentTarget).attr("title"));
        $(e.currentTarget).attr("title", "");
        $("#short_tooltip_window").css({
            display: "table"
        });
        if ($("#short_tooltip_window").width() + e.clientX > $(window).width()) {
            var offset = -1 * $("#short_tooltip_window").width();
            $("#short_tooltip_window").css({
                "margin-left": offset
            });
        } else {
            $("#short_tooltip_window").css({
                "margin-left": "0px"
            });
        }
        if ($("#short_tooltip_window").height() + e.clientY + 18 > $(window).height()) {
            var offset = -1 * $("#short_tooltip_window").height();
            $("#short_tooltip_window").css({
                "margin-top": (offset - 10)
            });
        } else {
            $("#short_tooltip_window").css({
                "margin-top": "18px"
            });
        }

        $("#short_tooltip_window").stop(true).fadeTo(400, 0);
        $("#short_tooltip_window").fadeTo("fast", 1);
    },
    'mousemove .short_tooltip': function(e, t) {
        if ($("#short_tooltip_window").width() + e.clientX > $(window).width()) {
            var offset = -1 * $("#short_tooltip_window").width();
            $("#short_tooltip_window").css({
                "margin-left": offset
            });
        } else {
            $("#short_tooltip_window").css({
                "margin-left": "0px"
            });
        }
        if ($("#short_tooltip_window").height() + e.clientY + 18 > $(window).height()) {
            var offset = -1 * $("#short_tooltip_window").height();
            $("#short_tooltip_window").css({
                "margin-top": (offset - 10)
            });
        } else {
            $("#short_tooltip_window").css({
                "margin-top": "18px"
            });
        }
        $("#short_tooltip_window").css({
            left: e.clientX,
            top: e.clientY
        });
    },
    'mouseout .short_tooltip': function(e, t) {
        //Session.set("changes", "onMouseOut");
        $(e.currentTarget).attr("title", $("#short_tooltip_text").html());
        $("#short_tooltip_window").stop(true).fadeTo("fast", 0, function() {
            $("#short_tooltip_window").css({
                display: "none"
            });
        });
    },
    'mouseover .slider': function(e, t) {
        slide($(e.target));
    },
    'mouseout .slider': function(e, t) {
        slide_stop();
    },
    'mouseenter .tooltip_hover': function(e, t) {
        fade_In_and_Out("tooltip", $(e.currentTarget).children().attr('id').substr(20), "in");
    },
    'mouseleave .tooltip_hover': function(e, t) {
        fade_In_and_Out("tooltip", $(e.currentTarget).children().attr('id').substr(20), "out");
    },

    //To-DO Media Queries in 3 CSS files aufteilen und je nach Query nutzen
    //      Evtl. SpriteSheets anlegen im 4er Block und abhängig von der Größe benutzen
    'mouseover .hover': function(e, t) {
        var pos = $(e.currentTarget).css("background-position");

        //Get only the className which is responsible for the background-Image to manipulate its background-position
        //Kennzeichen: "SS" (SpriteSheet) im Klassennamen
        var className = e.currentTarget.className;
        var temp1 = className.indexOf("SS");
        var classNameSub = className.substr(temp1);
        var temp2 = classNameSub.indexOf(" ");
        var classToBeChanged = "." + classNameSub.substr(0, temp2);
        moveSpriteSheetBackground(pos, classToBeChanged);
    },
    'mouseout .hover': function(e, t) {
        var pos = $(e.currentTarget).css("background-position");

        //Get only the className which is responsible for the background-Image to manipulate its background-position
        //Kennzeichen: "SS" (SpriteSheet) im Klassennamen
        var className = e.currentTarget.className;
        var temp1 = className.indexOf("SS");
        var classNameSub = className.substr(temp1);
        var temp2 = classNameSub.indexOf(" ");
        var classToBeChanged = "." + classNameSub.substr(0, temp2);
        moveSpriteSheetBackground(pos, classToBeChanged);
    },
    'click .scrounge_now': function(e, t) {
        switchToWorldMap();
    },
    'click .dropdown': function(e, t) {
        //console.log($(e.target).parent().attr("class").search("goScroungingIcon"));
        // if ($(e.target).src().length() == 1) {
        //     console.log('blub');
        // }
        if ($(e.target).attr("class").search("goScroungingIcon") == -1) {

            if ($(e.currentTarget).children().eq(1).filter(':not(:animated)').length == 1) { //das 2te child element (der advanced div) wird auf laufende animationen geprüft

                var height2 = $(e.currentTarget).height();

                if ($(e.currentTarget).children().eq(1).filter(':not(:animated)').height() == 0) {
                    $(e.currentTarget).children().eq(1).css({
                        "height": "auto"
                    });
                    var height = $(e.currentTarget).children().eq(1).height();
                    $(e.currentTarget).children().eq(1).animate({
                        "height": "0px"
                    }, 0, function() {
                        $(e.currentTarget).children().eq(1).animate({
                            "height": "13px"
                        }, 50, function() {
                            $(e.currentTarget).children().eq(1).animate({
                                "height": height
                            }, 1000);
                            $(e.currentTarget).animate({
                                "height": parseInt(height2) + parseInt(height) - 13
                            }, 1000);
                        });

                    });


                } else if ($(e.currentTarget).children().eq(1).filter(':not(:animated)').height() != 0) {

                    var height3 = $(e.currentTarget).children().eq(1).height();
                    $(e.currentTarget).animate({
                        "height": parseInt(height2) - parseInt(height3) + 13
                    }, 1000);
                    $(e.currentTarget).children().eq(1).animate({
                        "height": "13px"
                    }, 1000, function() {
                        $(e.currentTarget).children().eq(1).animate({
                            "height": "0px"
                        }, 50);
                    });
                }
            }
        }

    }
});

//SpriteSheet anpassen

function moveSpriteSheetBackground(pos, classToBeChanged, scrounge) {

    var styleSheetList = document.styleSheets;
    var rules = styleSheetList[0].cssRules;

    /*to get the width of the spritesheet*/
    var tempImg = new Image;
    //Man könnte theoretisch auch jedes andere div nehmen, das das SpriteSheet als background-image hat
    tempImg.src = $("#scrounge").css('background-image').replace(/url\(|\)$/ig, "");
    var spriteSheetWidth = tempImg.width;

    /*Der Umweg via split ist notwendig, da Firefox background-position-x bzw. -y nicht unterstützt*/
    var posXY = pos.split(" ");
    var posXAbsolute = Math.abs(parseInt(posXY[0]));

    /*console.log(posXY[0]); 
          console.log("case 1 "+ (posXAbsolute < spriteSheetWidth/4 || (posXAbsolute >= spriteSheetWidth/2 && posXAbsolute < spriteSheetWidth*0.75)));*/
    /*          console.log(posXAbsolute+" "+spriteSheetWidth/4+" "+posXAbsolute+" "+spriteSheetWidth/2+" "+posXAbsolute+" "+spriteSheetWidth*0.75);*/

    //Falls es sich um eine Schaltfläche im Status "normal" handelt (linke Abfrage Base / rechte Abfrage Scrounge)
    if (posXAbsolute < spriteSheetWidth / 4 || (posXAbsolute >= spriteSheetWidth / 2 && posXAbsolute < spriteSheetWidth * 0.75)) {
        var newPosX = parseInt(posXY[0]) - (spriteSheetWidth / 4);
        /*console.log("IF "+newPosX);*/
    }
    //Falls es sich um eine Schaltfläche im Status "hovered" handelt
    else {
        var newPosX = parseInt(posXY[0]) + (spriteSheetWidth / 4);
    }
    for (i = 0; i < rules.length; i++) {
        /*console.log("obereForSchleife "+i)*/
        //Falls kleinstes SpriteSheet, classToBeChanged Klasse ist in der obersten Ebene des spriteSheets zu finden
        if (spriteSheetWidth == 1472) {

            /*console.log("kleinstesSpriteSheet");*/
            if (rules[i].selectorText == classToBeChanged) {
                rules[i].style.backgroundPosition = newPosX + "px " + posXY[1];
                /*                console.log(rules[i].style.backgroundPosition);*/
                break;
            }

        }

        //Falls mittelgroßes SpriteSheet
        else if (spriteSheetWidth == 1880) {

            /*console.log("mittelgroßesSpriteSheet");*/
            if (rules[i].cssText.substr(0, 42) == "@media only screen and (max-width: 1919px)") {
                //spriteSheet rules in tieferer Verschachtelung innerhalb der spriteSheet rule der media queries
                var rulesInner = rules[i].cssRules;
                for (k = 0; k < rulesInner.length; k++) {
                    /*console.log("innereForSchleife" + k);*/
                    if (rulesInner[k].selectorText == classToBeChanged) {
                        rulesInner[k].style.backgroundPosition = newPosX + "px " + posXY[1];
                        /*console.log("mittelgroß "+rulesInner[k].style.backgroundPosition);*/
                        break;
                    }
                }
            }
        } else if (spriteSheetWidth == 2800) {

            /*console.log("großesSpriteSheet");
              console.log(rules[i].cssText.substr(0,42));*/
            /*console.log(rules[i].cssText.substr(0,42) == "@media only screen and (min-width: 1920px)");*/
            if (rules[i].cssText.substr(0, 42) == "@media only screen and (min-width: 1920px)") {
                //spriteSheet rules in tieferer Verschachtelung innerhalb der spriteSheet rule der media queries
                var rulesInner = rules[i].cssRules;
                for (j = 0; j < rulesInner.length; j++) {
                    /*console.log("innereForSchleife" + j);*/
                    /*console.log(rulesInner[j].selectorText);
                        console.log(rulesInner[j].selectorText==classToBeChanged);*/
                    if (rulesInner[j].selectorText == classToBeChanged) {
                        rulesInner[j].style.backgroundPosition = newPosX + "px " + posXY[1];
                        /*console.log("groß "+rulesInner[j].style.backgroundPosition);*/
                        break;
                    }
                }
            }
        }
    }
}

//Created by Michael Kochanke, 30.08.2014
$(window).bind('mousewheel DOMMouseScroll', function(event) {
    if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
        var direction = "back";
    } else {
        var direction = "forth"
    }
    if (direction) {
        //var parent = document.elementFromPoint(x, y);
        //console.log(parent);
        var parent = $(document.elementFromPoint(posX, posY)).parent();
        var x = 0;

        while (!parent.hasClass("scrollable") && x < 4) {
            parent = parent.parent();
            x++;
        }
        if (parent.hasClass("scrollable")) {
            if (!parent.attr("id")) {
                scroll_content(direction, "horizontal", 100, parent);
            } else {
                scroll_content(direction, "vertical", 100, parent);
            }
        }
    }
});

/////////////////////
// CHANGE CATEGORY //
/////////////////////
//Created by Michael Kochanke, 30.08.2014
var time = 1200; //Animationszeit in ms
var max_cat = 6; //Anzahl Kategorien
var interval;
var current_resolution = null;
var hover_check = false;
var stop_bool = false;

var posX = 0;
var posY = 0;

function slide(element) //abfrage welche ID gehovert wurde und umsetzung des richtigen slides
{
    switch (element.attr("id")) {
        case 'category_left':
            // slide_category("left", 800, 4);
            break;
        case 'category_right':
            // slide_category("right", 800, 4);
            break;
        case 'base_up':
            slide_start("back", "vertical", 100, 400, "#base_area_content");
            break;
        case 'base_down':
            slide_start("forth", "vertical", 100, 400, "#base_area_content");
            break;
        case 'scrounge_up':
            slide_start("back", "vertical", 100, 400, "#scroungeAreaContent");
            break;
        case 'scrounge_down':
            slide_start("forth", "vertical", 100, 400, "#scroungeAreaContent");
            break;
        case 'slot_items_left':
            slide_start("back", "horizontal", 100, 400, element.next().children());
            break;
        case 'slot_items_right':
            slide_start("forth", "horizontal", 100, 400, element.prev().children());
            break;
        case 'slot_colors_left':
            break;
        case 'slot_colors_right':
            break;
        case 'matter_left':
            slide_start("back", "horizontal", 100, 400, "#matter_content");
            break;
        case 'matter_right':
            slide_start("forth", "horizontal", 100, 400, "#matter_content");
            break;
        case 'own_up':
            slide_start("back", "vertical", 100, 400, "#inventory_own");
            break;
        case 'own_down':
            slide_start("forth", "vertical", 100, 400, "#inventory_own");
            break;
        case 'stolen_up':
            slide_start("back", "vertical", 100, 400, "#inventory_stolen");
            break;
        case 'stolen_down':
            slide_start("forth", "vertical", 100, 400, "#inventory_stolen");
            break;
        default:
            console.log("Slide für " + element.attr("id") + " nicht definiert !");
            break;
    }
}

//Created by Michael Kochanke, 30.08.2014

function slide_category(direction, speed, delay_factor) {

    if ($("#categories_wrapper").filter(':not(:animated)').length == 1) {
        stop_bool = false;
        hidden_menu_icon_check(direction);

        var margin_left = parseFloat($("#categories_wrapper").css("margin-left"));
        var width_child = parseFloat($("#categories_wrapper").children().eq(0).width()) + 10;

        if (direction === "left") {
            var animation_obj_start = ({
                'margin-left': (margin_left + width_child)
            });
        } else if (direction === "right") {
            var animation_obj_start = ({
                'margin-left': (margin_left - width_child)
            });
        }
        var animation_obj_stop = ({
            'margin-left': margin_left
        });

        var action = function() {
            $("#categories_wrapper").animate(animation_obj_start, speed, "linear", function() {
                if (direction === "left") {
                    $("#categories_wrapper").children().eq(-1).remove();
                    $("#categories_wrapper").prepend($("#categories_wrapper").children().eq(-2).clone());
                    $("#categories_wrapper").css(
                        animation_obj_stop
                    );
                } else if (direction === "right") {
                    $("#categories_wrapper").children().eq(0).remove();
                    $("#categories_wrapper").append($("#categories_wrapper").children().eq(1).clone());
                    $("#categories_wrapper").css(
                        animation_obj_stop
                    );
                }
                if (stop_bool == true) {
                    $("#categories_wrapper").stop(true);
                    stop_bool = false;
                }
                update_current_category(direction, 1);
            });
        }
        //Start des Intervalls
        interval = setInterval(action, speed / delay_factor);
    }

}

//Created by Michael Kochanke, 30.08.2014

function scroll_content(direction, orientation, pixel, content_div) {

    var css_direction;
    var css_changes_obj = {};
    var current_position;
    var content_end;
    var pos_neg;
    var parent_end;

    if (direction === "back") {
        transition = "+=" + pixel + "px";
        pos_neg = +1;
    } else if (direction === "forth") {
        transition = "-=" + pixel + "px";
        pos_neg = -1;
    }

    if (orientation === "horizontal") {
        css_direction = "left";
        current_position = $(content_div).position().left;
        content_end = $(content_div).width();
        parent_end = $(content_div).parent().width();
    } else if (orientation === "vertical") {
        css_direction = "top";
        current_position = $(content_div).position().top;
        content_end = $(content_div).height();
        parent_end = $(content_div).parent().height();

    }

    eval("css_changes_obj = {" + css_direction + ": '" + transition + "'}");

    if (current_position < 0 && direction === "back" || current_position + content_end > parent_end && direction === "forth") {

        if (parent_end - content_end > current_position + (pos_neg * pixel) && direction === "forth") {
            eval("css_changes_obj = {" + css_direction + ": '" + (parent_end - content_end) + "px'}");
            $(content_div).css(css_changes_obj);
        } else if (current_position + (pos_neg * pixel) > 0 && direction === "back") {
            eval("css_changes_obj = {" + css_direction + ": '0px'}");
            $(content_div).css(css_changes_obj);
        } else {
            $(content_div).css(css_changes_obj);
        }
    }
}

//Created by Michael Kochanke, 30.08.2014

function slide_start(direction, orientation, pixel, speed, content_div) {
    //console.log("direction: " + direction + " pixel: " + pixel + " speed: " + speed + " content_div: " + content_div);
    var animation_obj = {};
    var css_direction;
    var current_position;
    var content_end;
    var pos_neg;
    var parent_end;

    if ($(content_div).filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
    {

        if (direction === "back") {
            transition = "+=" + pixel + "px";
            pos_neg = +1;
        } else if (direction === "forth") {
            transition = "-=" + pixel + "px";
            pos_neg = -1;
        }

        if (orientation === "horizontal") {
            css_direction = "left";
            current_position = $(content_div).position().left;
            content_end = $(content_div).width();
            parent_end = $(content_div).parent().width();
        } else if (orientation === "vertical") {
            css_direction = "top";
            current_position = $(content_div).position().top;
            content_end = $(content_div).height();
            parent_end = $(content_div).parent().height();

        }

        eval("animation_obj = {" + css_direction + ": '" + transition + "'}");

        //Rekursiver Intervall (unendlich)
        var action = function() {
            //Animation im laufenden Intervall
            if (current_position < 0 && direction === "back" || current_position + content_end > parent_end && direction === "forth") {

                if (parent_end - content_end > current_position + (pos_neg * pixel) && direction === "forth") {
                    eval("animation_obj = {" + css_direction + ": '" + (parent_end - content_end) + "px'}");
                    $(content_div).animate(animation_obj, speed, "linear");
                } else if (current_position + (pos_neg * pixel) > 0 && direction === "back") {
                    eval("animation_obj = {" + css_direction + ": '0px'}");
                    $(content_div).animate(animation_obj, speed, "linear");
                } else {
                    $(content_div).animate(animation_obj, speed, "linear");
                }
                current_position = current_position + (pos_neg * pixel);
            }
        };
        //Start des Intervalls
        interval = setInterval(action, speed);
    }
}

//Created by Michael Kochanke, 30.08.2014
$(window).resize(function() {
    if ($(window).width() < 1920 && current_resolution != "<1920" && $("#loginWrapper").length == 0) {
        current_resolution = "<1920";
        $("#wrong_resolution").css({
            "display": "block"
        });
        $("#right_resolution").css({
            "display": "none"
        });
    } else if ($(window).width() >= 1920 && current_resolution != ">=1920" && $("#loginWrapper").length == 0) {
        current_resolution = ">=1920";
        $("#wrong_resolution").css({
            "display": "none"
        });
        $("#right_resolution").css({
            "display": "block"
        });
    }
    if ($("#range_slider_0").length > 0) { // Damit der Tooltip des Range Sliders beim verändern der Größe mitgeht.
        for (var x = 0; x < 6; x++) {
            if ($("#range_slider_" + x).length > 0) {
                // Syntax Parameter : tooltip_adjustment(slot, min_ctrl, max_ctrl, lower_ctrl, higher_ctrl, handle)
                tooltip_adjustment(
                    x,
                    $("#range_slider_" + x).slider("option", "min"),
                    $("#range_slider_" + x).slider("option", "max"),
                    $("#range_slider_" + x).slider("option", "values")[0],
                    $("#range_slider_" + x).slider("option", "values")[1],
                    "left");
            }
        }
    }
});

//Created by Michael Kochanke, 30.08.2014
//Changes array to unique array with distinct values

function distinct(array) {
    var uniqueArray = array.filter(function(elem, pos) {
        return array.indexOf(elem) == pos;
    })
    return uniqueArray
}

showInfoTextAnimation = function(text) {

    var textForAnimation = text.substring(1);
    var textAnimation = document.createElement("p");
    var textAnimationWrapper = document.createElement("div");
    textAnimation.innerHTML = textForAnimation;
    textAnimation.style.color = checkColorCode(text);
    textAnimation.id = "textAnimation";
    textAnimation.className = "hammersmith";
    textAnimationWrapper.id = "textAnimationWrapper";
    textAnimationWrapper.className = "div_center_vertical";

    if (document.getElementById("oben")) document.getElementById("oben").appendChild(textAnimationWrapper);
    if (document.getElementById("textAnimationWrapper")) document.getElementById("textAnimationWrapper").appendChild(textAnimation);
    setTimeout(function() {
        if (document.getElementById("textAnimationWrapper")) document.getElementById("oben").removeChild(document.getElementById("textAnimationWrapper"))
    }, 1000);
}

//Created by Michael Kochanke, 30.08.2014

function slide_stop() {
    stop_bool = true;
    clearInterval(interval);
}




//returns true if locked
function checkScroungeMine(slotId, myName, currentUser) {

    //get Data Context
    var self = Template.instance().state.get('self');
    var ownRate = Template.instance().state.get('ownRate');
    var amountScrSlots = Template.instance().state.get('amountScrSlotsM');
    var victims = Template.instance().state.get('victimsM');

    //CHECK IF YOU ARE TRYING TO SCROUNGE YOURSELF OR TARGET IS ALLRDY SCROUNGED
    // if (currentUser == myName) {
    if (currentUser == self) {
        return 'You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O';
    }
    var resultScrounger = -1;
    for (i = 0; i < amountScrSlots; i++) {
        if (victims[i] == currentUser) {
            return 'You cannot scrounge here: You already scrounge this user!';
        } else if (victims[i] == "") {
            resultScrounger = i;
            break;
        }
    }
    if (resultScrounger == -1) {
        return 'You cannot scrounge here: Your Scrounge slots are all in use!';
    }
    //CHECK FREE SUPSLOTS OF CURRENT USER DATA                
    //Get free SupSlots index
    cursorPlayerDataCu = WorldMapPlayerData.findOne({
        user: currentUser
    }, {
        fields: {
            mine: 1
        }
    }).mine;
    var amountSupSlots = cursorPlayerDataCu.amountSupSlots;
    var chosenScroungeSlot = cursorPlayerDataCu.ownSlots['owns' + slotId];

    var resultOwner = -1;
    for (i = 0; i < amountSupSlots; i++) {
        if (chosenScroungeSlot['sup' + i].name == "") {
            resultOwner = i;
            break;
        }
    }
    //LAST CHECK: RANGE SLIDER
    if (!(chosenScroungeSlot.control.min <= ownRate && ownRate <= chosenScroungeSlot.control.max)) {
        return 'You cannot scrounge here: You do not have the right miningrate!';
    }
    //SupSlot with id result is free and correct: update it ?
    if (resultOwner == -1) {
        return 'You cannot scrounge here: The owners support slots are all used!';
    }
    return false;
}

function checkScroungeBattlefield(slotId, myName, currentUser) {

    //get Data Context
    var self = Template.instance().state.get('self');
    var ownEpic = Template.instance().state.get('ownEpic');
    var amountScrSlots = Template.instance().state.get('amountScrSlotsB');
    var victims = Template.instance().state.get('victimsB');

    //CHECK IF YOU ARE TRYING TO SCROUNGE YOURSELF OR TARGET IS ALLRDY SCROUNGED
    if (currentUser == self) {
        return 'You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O';
    }
    var resultScrounger = -1;
    for (i = 0; i < amountScrSlots; i++) {
        if (victims[i] == currentUser) {
            return 'You cannot scrounge here: You already scrounge this user!';
        } else if (victims[i] == "") {
            resultScrounger = i;
            break;
        }
    }
    if (resultScrounger == -1) {
        return 'You cannot scrounge here: Your Scrounge slots are all in use!';
    }
    //CHECK FREE SUPSLOTS OF CURRENT USER DATA                
    //Get free SupSlots index
    cursorPlayerDataCu = WorldMapPlayerData.findOne({
        user: currentUser
    }, {
        fields: {
            battlefield: 1
        }
    });
    var amountSupSlots = cursorPlayerDataCu.battlefield.amountSupSlots;
    var chosenScroungeSlot = cursorPlayerDataCu.battlefield.ownSlots['owns' + slotId];
    var resultOwner = -1;
    for (i = 0; i < amountSupSlots; i++) {
        if (chosenScroungeSlot['sup' + i].name == "") {
            resultOwner = i;
            break;
        }
    }
    //LAST CHECK: RANGE SLIDER
    if (!(chosenScroungeSlot.control.min <= ownEpic && ownEpic <= chosenScroungeSlot.control.max)) {
        return 'You cannot scrounge here: You do not have the right epicness!';
    }
    //SupSlot with id result is free and correct: update it ?
    if (resultOwner == -1) {
        return 'You cannot scrounge here: The owners support slots are all used!';
    }
    return false;
}

renderActiveMiddle = function() {
    // console.log('renderActiveMiddle');
    var self = Meteor.users.findOne({
        _id: Meteor.userId()
    }, {
        fields: {
            menu: 1,
            cu: 1,
            username: 1
        }
    });
    var cu = self.cu;
    var menu = self.menu;
    //in your own menu? base:scrounge
    if (cu == self.username) {
        Router.current().render(menu + 'Owner', {
            to: 'middle'
        });
    } else {
        Router.current().render(menu + 'Enemy', {
            to: 'middle'
        });
    }
}
