////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// HELP SECTION /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//[JQUERY: ATTR = Attribute Selector!]
// expl: $(this).attr('id') 

// var elm = document.createElement("div");
// var jelm = $(elm);//convert to jQuery Element
// var htmlElm = jelm[0];//convert to HTML Element

// Meteor - get object : $(e.target).css({"background-color":"orange"});
// Meteor - get object ID: alert($(event.currentTarget.ID));     alert(event.target.id);    e.currentTarget.id;

//target vs. currentTarget:
//bei target nimmt die Funktion Bezug auf das Element, auf das geklickt wurde. Und zwar das zuoberst liegende Element
//Beispiel bei Micha's Dropdown: Nachdem ich ein Bild über das DIV eingefügt hatte, reagierte die DropDown Funktion nicht mehr
//nimmt man stattdessen currentTarget, so werden alle oberhalb liegenden Elemente ignoriert und das spezifizierte Element 
//rafft, dass auf es geklickt wurde.

////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// CLIENT /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isClient) {
    Meteor.startup(function() {
        timeClient = new Date();
        Meteor.call("getServerTime", function(err, result) {
            timeServer = result;
            timeDifference = timeClient.getTime() - timeServer.getTime();
            // console.log('timeServer' + timeServer.getTime());
        });
    });

    /////////////////////////
    ///// SUBSCRIPTIONS /////
    /////////////////////////

    Meteor.subscribe("userData");
    Meteor.subscribe("playerData");
    Meteor.subscribe("MatterBlocks");
    Meteor.subscribe("resources");

    ////////////////////////////
    ///// GLOBAL VARIABLES /////
    ////////////////////////////

    timersInc = new Array();
    timersDec = new Array();

    ////////////////////////////
    ///// TEMPLATE RETURNS /////
    ////////////////////////////


    setInterval(function() {
        updateTimersInc();
        updateTimersDec();
    }, 1 * 1000);

    //Client Live Render timers that increase value by 1 second

    function updateTimersInc() {
        for (i = 0; i < timersInc.length; i++) {
            if ($('#' + timersInc[i].id).length > 0) {
                obj0 = {};
                obj0['id'] = timersInc[i].id;
                obj0['miliseconds'] = timersInc[i].miliseconds + 1000;
                $('#' + obj0['id']).text(msToTime(obj0['miliseconds']));
                timersInc[i] = obj0;
            }
        }
    }

    //Client Live Render timers that decrease value by 1 second

    function updateTimersDec() {
        for (i = 0; i < timersDec.length; i++) {
            if ($('#' + timersDec[i].id).length > 0) {
                obj0 = {};
                obj0['id'] = timersDec[i].id;
                obj0['miliseconds'] = timersDec[i].miliseconds - 1000;
                if (obj0['miliseconds'] < 0) obj0['miliseconds'] = 0;
                $('#' + obj0['id']).text(msToTime(obj0['miliseconds']));
                timersDec[i] = obj0;
            }
        }
    }

    function msToTime(ms) {
        var helper = Math.round(ms / 1000);
        var secs = helper % 60;
        helper = (helper - secs) / 60;
        var mins = helper % 60;
        var hrs = (helper - mins) / 60;

        return hrs + ':' + mins + ':' + secs;
    }

    //To-DO für andere Menüs anpassen
    Template.mineBase.mineUnusedSlots = function() {
        //Mine
        var name = Meteor.users.findOne({
            _id: Meteor.userId()
        }).username;
        var cursorPlayerData = playerData.findOne({
            user: name
        });
        var amountOwnSlots = cursorPlayerData.mine.ownSlots;
        var cursorMine = mine.findOne({
            user: name
        });
        var objects = new Array();

        for (var i = 0; i < amountOwnSlots; i++) {
            if (cursorMine['owns' + i].input == "0000")
                objects[i] = {};
        }
        return objects;
    };


    // supSlotsMemory = new Array();

    // Template.mineBase.supSlots = function() {
    //     console.log(supSlotsMemory);
    //     return supSlotsMemory;
    // }

    //To-DO für andere Menüs anpassen
    Template.mineBase.mineUsedSlots = function() {
        //Mine
        var name = Meteor.users.findOne({
            _id: Meteor.userId()
        }).username;
        var cursorPlayerData = playerData.findOne({
            user: name
        });
        var amountOwnSlots = cursorPlayerData.mine.ownSlots;
        var cursorMine = mine.findOne({
            user: name
        });
        var objects = new Array();

        var calculatedServerTime = (new Date()).getTime() - timeDifference;
        var timersHelperInc = new Array();
        var timersHelperDec = new Array();
        //Iterate OwnSlots
        for (var i = 0; i < amountOwnSlots; i++) {
            var matterId = cursorMine['owns' + i].input;
            if (matterId > 0) {
                var cursorMatterBlock = MatterBlocks.findOne({
                    matter: matterId
                });
                var amountMaxSupSlots = cursorPlayerData.mine.supSlots;
                var amountUsedSupSlots = 0;
                for (var j = 0; j < amountMaxSupSlots; j++) {
                    if (cursorMine['owns' + i]['sup' + j].length != 0) amountUsedSupSlots++;
                }
                var obj0 = {};

                var progressOwn = (calculatedServerTime - cursorMine['owns' + i].stamp.getTime()) * (7.5 / 3600000);
                var progressSups = 0;
                var supRates = 0;

                var supSlotsMemory = new Array();
                //Iterate Supporter
                for (var k = 0; k < cursorPlayerData.mine.supSlots; k++) {
                    var currentSup = cursorMine['owns' + i]['sup' + k];
                    //SupSlot used?
                    if (currentSup != undefined && currentSup.length != 0) {
                        var obj00 = {};
                        var supMine = mine.findOne({
                            user: currentSup
                        });
                        //get index of scr slot
                        var index = 0;
                        var result = -1;
                        while (result == -1) {
                            if (supMine['scrs' + index].victim == name) {
                                result = index;
                            }
                            index++;
                        }
                        //calculate mined by cSup
                        var supTime = supMine['scrs' + result].stamp.getTime();

                        obj00['timeSpentId'] = 'timerInc_' + k + '_mine_sup';
                        var obj01 = {};
                        obj01['id'] = obj00['timeSpentId'];
                        obj01['miliseconds'] = (calculatedServerTime - supTime);
                        timersHelperInc.push(obj01);
                        obj00['timeSpent'] = msToTime(obj01['miliseconds']);

                        var supRate = supMine['scrs' + result].benefit;
                        supRates = supRates + supRate;
                        progressSups = progressSups + (calculatedServerTime - supTime) * (supRate / 3600000);

                        obj00['mined'] = Math.floor((calculatedServerTime - supTime) * (supRate / 3600000));
                        obj00['miningrate'] = supRate + '/hr';
                        supSlotsMemory[k] = obj00;
                    }
                }


                var progressTotal = progressOwn + progressSups;
                obj0['value'] = Math.floor(progressTotal) + '/' + cursorMatterBlock.value + '(' + Math.floor((Math.floor(progressTotal) / cursorMatterBlock.value) * 100) + '%)';
                obj0['color'] = cursorMatterBlock.color;
                obj0['slots'] = amountUsedSupSlots + '/' + amountMaxSupSlots;
                obj0['remainingId'] = 'timerDec_' + i + '_mine';
                obj0['timeSpentId'] = 'timerInc_' + i + '_mine';

                var obj1 = {};
                obj1['id'] = obj0['remainingId'];
                obj1['miliseconds'] = ((cursorMatterBlock.value - progressTotal) / ((7.5 + supRates) / 3600000));
                timersHelperDec.push(obj1);
                obj0['remaining'] = msToTime((cursorMatterBlock.value - progressTotal) / ((7.5 + supRates) / 3600000));

                var obj2 = {};
                obj2['id'] = obj0['timeSpentId'];
                obj2['miliseconds'] = (calculatedServerTime - cursorMine['owns' + i].stamp);
                timersHelperInc.push(obj2);
                obj0['timeSpent'] = msToTime((calculatedServerTime - cursorMine['owns' + i].stamp));

                //TO-DO Anteile richtig berechnen
                obj0['profit'] = Math.floor(0.5 * cursorMatterBlock.value) + '(50%)';
                obj0['miningrate'] = (7.5 + supRates) + '/hr';

                obj0['index'] = i;
                obj0['scroungers'] = supSlotsMemory;
                objects[i] = obj0;

            }
        }
        timersInc = timersHelperInc;
        timersDec = timersHelperDec;
        return objects;
    };

    Template.mineBase.blockColors = function() {
        var cursorMatterColors = MatterBlocks.find({}, {
            fields: {
                'color': 1
            }
        }).fetch();
        var colorArray = new Array();
        for (i = 0; i < cursorMatterColors.length; i++) {
            colorArray[i] = cursorMatterColors[i].color;
        }
        var result = distinct(colorArray);
        var objects = new Array();
        for (var j = 0; j < result.length; j++) {
            objects[j] = {
                'color': result[j]
            };
        }
        return objects;
    };

    Template.mineBase.matterBlocks = function() {

        return MatterBlocks.find({});

    };

    Template.mineBuyMenu.playerData = function() {

        return playerData.find({});

    };

    Template.mineBuyMenu.mineSlots = function() {

        return mineSlots.find({});

    };

    Template.mineBase.playerData = function() {

        return playerData.find({});

    };

    Template.standardBorder.resources = function() {

        return resources.find({});

    };

    ////////////////////
    ///// Rendered /////
    ////////////////////

    Template.masterLayout.rendered = function() {

        // $("#disable_range_slider").draggable();

        console.log("masterLayout rendered successfully");

        if (!$('#range_slider').data('uiSlider')) {
            // The data attribute for the slider is not set, so the slider has not yet been created
            // If the slider is still around, we don't want to initialize it again
            var slider = $('#range_slider'),
                tooltip = $('.tooltip'),
                tooltip_left_handle = $('#tooltip_left_handle'),
                tooltip_right_handle = $('#tooltip_right_handle'),
                left_handle,
                right_handle,
                min_control = 0.5, //Untere Grenze 
                max_control = 0.8, //Obere Grenze
                full_control = max_control - min_control
                lower_control = 0.6, //Aktueller untere Wert
                higher_control = 0.7, //Aktueller oberer Wert
                slider_threshold = (max_control - min_control) / 10;

            tooltip_left_handle.css('left', ((lower_control - min_control) * 100 / full_control) * 1.5).text(lower_control);
            tooltip_right_handle.css('left', ((higher_control - min_control) * 100 / full_control) * 1.5).text(higher_control);

            tooltip.hide();

            slider.slider({
                range: true,
                step: 0.01,
                min: min_control,
                max: max_control,
                values: [lower_control, higher_control],

                start: function(event, ui) {
                    left_handle = ui.values[0];
                    right_handle = ui.values[1];
                    //Initialisierung der Tooltip Fenster an den stellen der Handle
                    tooltip_left_handle.css('left', ((ui.values[0] - min_control) * 100 / full_control) * 1.5).text(ui.values[0]);
                    tooltip_right_handle.css('left', ((ui.values[1] - min_control) * 100 / full_control) * 1.5).text(ui.values[1]);
                    fade_In_and_Out("handle", "in");
                },

                slide: function(event, ui) {

                    px_left = ((ui.values[0] - min_control) * 100 / full_control) * 1.5;
                    px_right = ((ui.values[1] - min_control) * 100 / full_control) * 1.5;
                    console.log(px_left + " " + px_right);

                    if (ui.values[1] - ui.values[0] > slider_threshold) {
                        if (left_handle != ui.values[0]) {
                            if ((px_left + 40) <= px_right) {
                                tooltip_left_handle.css('left', px_left).text(ui.values[0]);
                            } else {
                                console.log("stop_left");
                                tooltip_left_handle.css('left', px_right - 40).text(ui.values[0]);
                            }
                        } else if (right_handle != ui.values[1]) {
                            if ((px_right - 40) >= px_left) {
                                tooltip_right_handle.css('left', px_right).text(ui.values[1]);
                            } else {
                                console.log("stop_right");
                                tooltip_right_handle.css('left', px_left + 40).text(ui.values[1]);
                            }
                        }
                    } else if (ui.values[1] - ui.values[0] < slider_threshold) {
                        return (false);
                    }
                },
                stop: function(event, ui) {
                    fade_In_and_Out("handle", "out");
                }
            });

        }

    };

    //////////////////
    ///// EVENTS /////
    //////////////////

    /*Seltsame Darstellungsfehler bedürfen es, dass der Hintergrund um ein Pixel weiter verschoben wird, als die Datei es hergibt (beobachtet in Chrome)*/
    Template.standardBorder.events({

        'click #testButton': function(e, t) {


        },

        'click #testButton2': function(e, t) {

            if (!$("#characterView").length) {

                Router.current().render('characterView', {
                    to: 'middle'
                });

            } else {

                $('#characterView').show();

            }

        }

    });


    /*
        Events Frame-Buttons + Hover

        // 'mouseover #scrounge': function(e, t) {

        //     var pos = $('#scrounge').css("background-position");
        //     var size = $('#scrounge').css("padding");
        //     //console.log(pos);
        //     //console.log(size);

        //     /*Umsetzung der media queries in javascript, Abfrage über die Größe des Elements, muss noch für alle anderen Elemente übernommen werden*/
    //     switch (size) {

    //         case "76px":

    //             $('#scrounge').css({
    //                 "background-position": "0px -153px"
    //             });
    //             break;

    //         case "51px":

    //             $('#scrounge').css({
    //                 "background-position": "0px -103px"
    //             });
    //             break;

    //         case "40px":

    //             $('#scrounge').css({
    //                 "background-position": "0px -80px"
    //             });
    //             break;

    //         default:

    //             console.log("something's wrong...");
    //     }
    // },

    // 'mouseout #scrounge': function(e, t) {

    //     var pos = $('#scrounge').css("background-position");
    //     var size = $('#scrounge').css("padding");
    //     //console.log(pos);
    //     //console.log(size);

    //     /*Umsetzung der media queries in javascript, Abfrage über die Größe des Elements, muss noch für alle anderen Elemente übernommen werden*/
    //     switch (size) {

    //         case "76px":

    //             $('#scrounge').css({
    //                 "background-position": "0px 0px"
    //             });
    //             break;

    //         case "51px":

    //             $('#scrounge').css({
    //                 "background-position": "0px 0px"
    //             });
    //             break;

    //         case "40px":

    //             $('#scrounge').css({
    //                 "background-position": "0px 0px"
    //             });
    //             break;

    //         default:

    //             console.log("something's wrong...");
    //     }
    // }
    // });

    Template.masterLayout.events({
        'mouseover .slider': function(e, t) {
            slide($(e.target).attr('id'));
        },
        'mouseout .slider': function(e, t) {
            slide_stop();
        },

        //To-DO Media Queries in 3 CSS files aufteilen und je nach Query nutzen
        //      Evtl. SpriteSheets anlegen im 4er Block und abhängig von der Größe benutzen
        'mouseover .hover': function(e, t) {
            //console.log(e.target);
            var pos = $(e.target).css("background-position");
            var size = $(e.target).css("padding");
            var bImage = $(e.target).css("background-image");
            var bImageHover = bImage.replace(".png", "_hover.png");
            $(e.target).css({
                "background-image": bImageHover
            });
        },
        'mouseout .hover': function(e, t) {
            //console.log(e.target);
            var pos = $(e.target).css("background-position");
            var size = $(e.target).css("padding");
            var bImageHover = $(e.target).css("background-image");
            var bImage = bImageHover.replace("_hover.png", ".png");
            $(e.target).css({
                "background-image": bImage
            });
        }
    });

    Template.mineBase.events({
        'click .used_slot': function(e, t) {

            /*AN GRAFIK ANGEPASSTE VERSION VON J.P.*/

            if ($(e.currentTarget).next(".used_slot_advanced").height() == 0) {
                $(e.currentTarget).next(".used_slot_advanced").animate({
                    "height": "100%"
                }, 0);
                var height = $(e.currentTarget).next(".used_slot_advanced").height() + 13 + "px";
                $(e.currentTarget).next(".used_slot_advanced").filter(':not(:animated)').animate({
                    "height": "0px"
                }, 0, function() {

                    $(e.currentTarget).next(".used_slot_advanced").filter(':not(:animated)').animate({
                        "margin-top": "-13px"
                    }, 150, function() {

                        $(e.currentTarget).next(".used_slot_advanced").filter(':not(:animated)').animate({
                            "height": height
                        }, 1000);

                    });
                });

            } else {
                $(e.currentTarget).next(".used_slot_advanced").animate({
                    "height": "0px",
                }, 1000);
                $(e.currentTarget).next(".used_slot_advanced").animate({
                    "margin-top": "0px"
                }, 150);
            }

            /*MICHA'S URSPRÜNGLICHE VERSION*/

            /*            if ($(e.currentTarget).next(".used_slot_advanced").height() == 0) {
                $(e.currentTarget).next(".used_slot_advanced").animate({
                    "height": "100%"
                }, 0);
                var height = $(e.currentTarget).next(".used_slot_advanced").height()+13 + "px";
                $(e.currentTarget).next(".used_slot_advanced").filter(':not(:animated)').animate({
                    "height": "0px"
                }, 0);
                $(e.currentTarget).next(".used_slot_advanced").filter(':not(:animated)').animate({
                    "height": height
                }, 1000);
            } else {
                $(e.currentTarget).next(".used_slot_advanced").animate({
                    "height": "0px",
                }, 1000);
            }*/
        },

        'click .item': function(e, t) {
            Session.set("clickedMatter", e.currentTarget.id);

            //target: Element, auf das geklickt wird  currentTarget: Element, an das das Event geheftet wurde

            //Variante A

            /*        var cursor = MatterBlocks.findOne({matter: e.currentTarget.id});

          console.log(cursor);

          $('#mineBuyMenu').fadeIn();
          $("#mineBuyMenuMatterBlock").attr("src","/Aufloesung1920x1080/Mine/MatterBlock_"+cursor.color+".png");
          $('#price').text("Price: "+cursor.cost);
          $('#matter').text("Matter: "+cursor.value);*/

            //Variante B

            $('#mineBuyMenu').fadeIn();
            $("#mineBuyMenuMatterBlock").attr("src", "/Aufloesung1920x1080/Mine/MatterBlock_" + this.color + ".png");
            $('#price').text("Price: " + this.cost);
            $('#matter').text("Matter: " + this.value);

            var currentUser = Meteor.users.findOne({
                _id: Meteor.userId()
            }).username;

            var cursorPlayerData = playerData.findOne({
                user: currentUser
            });

            var amountSupSlots = cursorPlayerData.mine.supSlots;

            if ($('#AmountScroungerSlots').children()) {
                $('#AmountScroungerSlots').children().remove();
            }

            for (i = 0; i < 6; i++) {

                if (amountSupSlots > i) {

                    $('#AmountScroungerSlots').append("<div class='sslots_available'> </div>");

                } else {

                    $('#AmountScroungerSlots').append("<div class='sslots_unavailable'> </div>");

                }
            }
        }

    });

    //TODO: noch nicht fertig !
    Template.mineBuyMenu.events({

        'click #buyMenuYes': function(e, t) {

            var currentUser = Meteor.users.findOne({
                _id: Meteor.userId()
            }).username;
            var cursorPlayerData = playerData.findOne({
                user: currentUser
            });

            //updating the database
            Meteor.call('buyMatter', Session.get("clickedMatter"), function(err) {
                if (err) {
                    console.log(err);
                }
            });

            $('#mineBuyMenu').fadeOut();

        },

        'click #buyMenuNo': function(e, t) {

            $('#mineBuyMenu').fadeOut();

        },
    })


    var time = 1200; //Animationszeit in ms
    var c = 1; //Start Kategorie
    var max_cat = 6; //Anzahl Kategorien
    var interval;
    var ready_check;
    var size;
    var slots_count = 10;

    if ($(window).width() <= 1024) {
        // console.log("1024");
        ready_check = 1;
    }
    if ($(window).width() <= 1280 && $(window).width() >= 1024) {
        // console.log("1280");
        ready_check = 2;
    }
    if ($(window).width() >= 1280) {
        // console.log("1920");
        ready_check = 3;
    }

    function slide(element) //abfrage welches ID gehovert wurde und umsetzung des richtigen slides
    {
        switch (element) {
            case 'left_slider_category':
                slide_left();
                //slide_start("left", 1, "#k1","#k2");
                break;
            case 'right_slider_category':
                slide_right();
                //slide_start("right", 1, "#k2", "#k1");
                break;
            case 'base_up':
                slide_up();
                break;
            case 'base_down':
                slide_down();
                break;
            case 'left_slider_slot_items':
                slide_left_simple('slot_items_content');
                break;
            case 'right_slider_slot_items':
                slide_right_simple('slot_items_content');
                break;
            default:
                //console.log("Slide für diesen Hover nicht definiert !");
                break;
        }
    }


    function slide_left_simple(element) {
        //console.log(element);
        //console.log($("." + element).position().left);
        size = size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
        var pos = size.p;
        var pos_r = size.pr + "px";
        var pos_p = "-=" + size.pp + "px";

        //console.log("s1: "+$("#s1").position().top);
        if ($("." + element).filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
        {
            if ($("." + element).position().left >= 60) {
                // Vorab Animation da Intervall erst nach [Time] anfängt
                $("." + element).filter(':not(:animated)').animate({
                    "left": "-=60px"
                }, 300, "linear");
                //Rekursiver Intervall (unendlich)
                var action = function() {
                    //Animation im laufenden Intervall  
                    $("." + element).animate({
                        "left": "-=60px"
                    }, 300, "linear");
                };
                //Start des Intervalls
                interval = setInterval(action, 300);
            }
        }
    }

    function slide_right_simple(element) {
        size = size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
        var pos = size.p;
        var pos_r = size.pr + "px";
        var pos_p = "+=" + size.pp + "px";

        //console.log("s1: "+$("#s1").position().top);
        if ($("." + element).filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
        {
            if ($("." + element).position().left >= 0) {
                // Vorab Animation da Intervall erst nach [Time] anfängt
                $("." + element).filter(':not(:animated)').animate({
                    "left": "+=60px"
                }, 300, "linear");
                //Rekursiver Intervall (unendlich)
                var action = function() {
                    //Animation im laufenden Intervall  
                    $("." + element).animate({
                        "left": "+=60px"
                    }, 300, "linear");
                };
                //Start des Intervalls
                interval = setInterval(action, 300);
            }
        }
    }









    function slide_start(direction, endless, element1, element2) {
        element2 = (typeof element2 === "undefined") ? "0" : element2; // optionaler Parameter wenn nicht vorhanden dann = 0
        //console.log(direction + " " + endless + " " + element1 + " " + element2);
    }

    function slide_left() {
        size = size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
        var pos = size.p;
        var pos_r = size.pr + "px";
        var pos_p = "-=" + size.pp + "px";

        if ($("#k1").filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
        {
            if ($("#k2").position().left < pos) //Positionierung der Div's wenn Slide am anfang auf Startpunkt
            {
                $("#k2").css({
                    left: pos_r
                });
                $("#k1").css({
                    left: "0px"
                });
            }
            // Vorab Animation da Intervall erst nach [Time] anfängt
            $("#k1").filter(':not(:animated)').animate({
                left: pos_p
            }, time, "linear");
            $("#k2").filter(':not(:animated)').animate({
                left: pos_p
            }, time, "linear");
            //Rekursiver Intervall (unendlich)
            var action = function() {
                if ($("#k2").position().left < pos) //Positionierung der Div's wenn Slide wieder am Startpunkt
                {
                    $("#k2").animate({
                        left: pos_r
                    }, 0, "linear");
                    $("#k1").animate({
                        left: "0px"
                    }, 0, "linear");
                }
                //Animation im laufenden Intervall  
                $("#k1").animate({
                    left: pos_p
                }, time, "linear");
                $("#k2").animate({
                    left: pos_p
                }, time, "linear");
                update("left");
            };
            //Start des Intervalls
            interval = setInterval(action, time);
            update("left");
        }
    }

    function slide_right() {
        size = size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
        var pos = size.p;
        var pos_r = "-" + size.pr + "px";
        var pos_p = "+=" + size.pp + "px";

        if ($("#k1").filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
        {
            if ($("#k1").position().left > -pos) //Positionierung der Div's wenn Slide am anfang auf Startpunkt
            {
                $("#k1").css({
                    left: pos_r
                });
                $("#k2").css({
                    left: "0px"
                });
            }
            // Vorab Animation da Intervall erst nach [Time] anfängt
            $("#k1").filter(':not(:animated)').animate({
                left: pos_p
            }, time, "linear");
            $("#k2").filter(':not(:animated)').animate({
                left: pos_p
            }, time, "linear");
            //Rekursiver Intervall (unendlich)
            var action = function() {
                if ($("#k1").position().left > -pos) //Positionierung der Div's wenn Slide wieder am Startpunkt
                {
                    $("#k1").animate({
                        left: pos_r
                    }, 0, "linear");
                    $("#k2").animate({
                        left: "0px"
                    }, 0, "linear");
                }
                //Animation im laufenden Intervall  
                $("#k1").animate({
                    left: pos_p
                }, time, "linear");
                $("#k2").animate({
                    left: pos_p
                }, time, "linear");
                update("right");
            };
            //Start des Intervalls
            interval = setInterval(action, time);
            update("right");
        }
    }

    function slide_down() {
        size = size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
        var pos = size.p;
        var pos_r = size.pr + "px";
        var pos_p = "-=" + size.pp + "px";
        //console.log("s1: "+$("#s1").position().top);
        if ($("#base_area_content").filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
        {
            if ($("#base_area_content").position().top <= 0) {
                // Vorab Animation da Intervall erst nach [Time] anfängt
                $("#base_area_content").filter(':not(:animated)').animate({
                    "top": "-=80px"
                }, 300, "linear");
                //Rekursiver Intervall (unendlich)
                var action = function() {
                    //Animation im laufenden Intervall  
                    $("#base_area_content").animate({
                        "top": "-=80px"
                    }, 300, "linear");
                };
                //Start des Intervalls
                interval = setInterval(action, 300);
            }
        }
    }

    function slide_up() {
        size = size_check(); //Checkt welche Auflösung gerade vorhanden ist und passt die Animations-Daten an
        var pos = size.p;
        var pos_r = size.pr + "px";
        var pos_p = "+=" + size.pp + "px";
        //console.log("s1: "+$("#s1").position().top);
        if ($("#base_area_content").filter(':not(:animated)').length == 1) //Wenn Animation läuft keine neue Anfangen
        {
            if ($("#base_area_content").position().top <= -80) {
                // Vorab Animation da Intervall erst nach [Time] anfängt
                $("#base_area_content").filter(':not(:animated)').animate({
                    "top": "+=80px"
                }, 300, "linear");
                //Rekursiver Intervall (unendlich)
                var action = function() {
                    //Animation im laufenden Intervall  
                    if ($("#base_area_content").position().top <= -80)
                        $("#base_area_content").animate({
                            "top": "+=80px"
                        }, 300, "linear");
                };
                //Start des Intervalls
                interval = setInterval(action, 300);
            }
        }
    }

    function slide_stop() {
        clearInterval(interval);
    }

    function update(direction) {
        if (direction == "left") {
            c--;
        } else if (direction == "right") {
            c++;
        }

        if (c == 0 && direction == "left") {
            c = max_cat;
        } else if (c == (max_cat + 1) && direction == "right") {
            c = 1;
        }
    }

    function size_check() {
        switch (ready_check) {
            case 3:
                var pos = 256;
                var pos_plus = pos + 10;
                break;
            case 2:
                var pos = 170;
                var pos_plus = pos + 7;
                break;
            case 1:
                var pos = 136;
                var pos_plus = pos + 6;
                break;
            default:
                console.log("failed to check size !(default)");
                break;
        }
        var pos_reset = pos_plus * max_cat;

        return {
            p: pos,
            pp: pos_plus,
            pr: pos_reset
        };
    }


    function repositioning(ready_check) //Bei Media Query Sprung neu Posi der Leiste [Parameter : Aktueller Media Querie]
    {
        size = size_check();
        var pos = size.p;
        var pos_r = size.pr;
        var pos_p = size.pp;

        var cur_pos_right = (c * pos_p) - pos_p;
        var cur_pos_left = cur_pos_right - (pos_r);
        $("#k1").css({
            left: cur_pos_left
        });
        $("#k2").css({
            left: cur_pos_right
        });
    }

    $(window).resize(function() {
        if ($(window).width() <= 1024 && ready_check !== 1) {
            //console.log("1024");
            ready_check = 1;
            repositioning(ready_check);
        }
        if ($(window).width() <= 1280 && $(window).width() >= 1024 && ready_check != 2) {
            //console.log("1280");
            ready_check = 2;
            repositioning(ready_check);
        }
        if ($(window).width() >= 1280 && ready_check != 3) {
            //console.log("1920");
            ready_check = 3;
            repositioning(ready_check);
        }
    });

    //Changes array to unique array with distinct values

    function distinct(array) {
        var uniqueArray = array.filter(function(elem, pos) {
            return array.indexOf(elem) == pos;
        })
        return uniqueArray
    }

    //Deps.Autorun
    Deps.autorun(function() {
        if (!Meteor.user()) {
            //not logged in yet
            // console.log("DEPS.AUTORUN: not logged in");
        } else {
            var self = Meteor.users.findOne({
                _id: Meteor.userId()
            });
            var menu = self.menu;
            var cu = self.cu;
            if (cu && menu) {
                Meteor.subscribe(menu, cu, function(rdy) {
                    // console.log("DEPS.AUTORUN: Sub: " + menu + ", " + cu + " - " + rdy);
                });
            } else {
                // console.log("DEPS.AUTORUN: cu or menu undefined");
            }
        }
    });
}

/*  function hoverScroungeBase() {
    var pos = button.style.backgroundPosition;
    alert(pos);*/
