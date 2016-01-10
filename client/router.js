Router.configure({
    layout: 'masterlayout',
})

Router.route('/', {

    layoutTemplate: 'masterLayout',
    yieldRegions: {
        'login': {
            to: 'middle'
        },
    },
});

var allReady = false;

Router.route('/game', {

    layoutTemplate: 'masterLayout',
    yieldRegions: {
        'standardBorder': {
            to: 'border'
        },
        'buyMenu': {
            to: 'buyMenuField'
        },
        'loading': {
            to: 'middle'
        },
    },

    onBeforeAction: function() {
        //get the TIME ZONE difference (not the ping!)
        if (allReady) {
            var timeClient = new Date();
            var timeServer = TimeSync.serverTime(Date.now());
            GV_timeDifference = Math.round((timeClient - timeServer) / 10000) * 10000;
            this.next();
        }
    },
    // a place to put your subscriptions
    subscriptions: function() {
        var self;
        var cu;
        var cursorSelf = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                username: 1,
                cu: 1
            }
        });
        if (cursorSelf) {
            self = cursorSelf.username;
            cu = cursorSelf.cu;
            users = [self, cu];
            this.subscribe('userDataInitial', users).wait();
            allReady = true;
        }
    },
    //LIKE Deps.autorun
    action: function() {
        //diese if else Verschachtelung ist notwendig, da action sonst bereits aufgerufen wrid
        //bevor die subscription ausgeführt wurde.
        //Reihenfolge der Ausführung ist seltsamerweise wie folgt: subscriptions > onBeforeAction > action
        if (allReady) {
            if (this.ready()) {
                this.render();
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
                //console.log('MENU ROUTER '+menu);
                //console.log(cu == self.username);
                //in your own menu? base:scrounge
                if (cu == self.username) {
                    Router.current().render(menu + 'Owner', {
                        to: 'middle'
                    });

                    //change menu colors to green
                    /*/////////////////////////////////////////////////// SOLL EIGENTLICH IN CLIENT.JS AUFGERUFEN WERDEN   ///////////////////////////////////////////////////////////////////////////*/
                    //Die if-Abfrage ist notwendig, damit der Aufruf der Methode nicht zu früh erfolgt
                    if ($('#scrounge').css("backgroundPosition")) switchScroungeBaseMode($('#scrounge').css("backgroundPosition"), '.SSscroungeBaseButton', 'scrounge');
                    if ($('#character').css("backgroundPosition")) switchScroungeBaseMode($('#character').css("backgroundPosition"), '.SScharacterButton', 'scrounge');
                    if ($('.category_1').css("backgroundPosition")) switchScroungeBaseMode($('.category_1').css("backgroundPosition"), '.SSCategoryMine', 'scrounge');
                    if ($('.category_3').css("backgroundPosition")) switchScroungeBaseMode($('.category_3').css("backgroundPosition"), '.SSCategoryBattlefield', 'scrounge');
                    if ($('#category_right').css("backgroundPosition")) switchScroungeBaseMode($('#category_right').css("backgroundPosition"), '.SScategory_right', 'scrounge');
                    if ($('#category_left').css("backgroundPosition")) switchScroungeBaseMode($('#category_left').css("backgroundPosition"), '.SScategory_left', 'scrounge');

                } else {
                    Router.current().render(menu + 'Enemy', {
                        to: 'middle'
                    });

                    //change menu colors to red
                    /*/////////////////////////////////////////////////// SOLL EIGENTLICH IN CLIENT.JS AUFGERUFEN WERDEN   ///////////////////////////////////////////////////////////////////////////*/
                    //Die if-Abfrage ist notwendig, damit der Aufruf der Methode nicht zu früh erfolgt
                    if ($('#scrounge').css("backgroundPosition")) switchScroungeBaseMode($('#scrounge').css("backgroundPosition"), '.SSscroungeBaseButton', 'base');
                    if ($('#character').css("backgroundPosition")) switchScroungeBaseMode($('#character').css("backgroundPosition"), '.SScharacterButton', 'base');
                    if ($('.category_1').css("backgroundPosition")) switchScroungeBaseMode($('.category_1').css("backgroundPosition"), '.SSCategoryMine', 'base');
                    if ($('.category_3').css("backgroundPosition")) switchScroungeBaseMode($('.category_3').css("backgroundPosition"), '.SSCategoryBattlefield', 'base');
                    if ($('#category_right').css("backgroundPosition")) switchScroungeBaseMode($('#category_right').css("backgroundPosition"), '.SScategory_right', 'base');
                    if ($('#category_left').css("backgroundPosition")) switchScroungeBaseMode($('#category_left').css("backgroundPosition"), '.SScategory_left', 'base');
                    /*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/
                }
            } else {
                Router.current().render('loading', {
                    to: 'middle'
                });
            }
        }
    }
});

function switchScroungeBaseMode(pos, classToBeChanged, mode) {

    /*    console.log(classToBeChanged);*/
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
    var newPosX;
    //Falls Wechsel von Base zu Scrounge, die dritte if-Abfrage ist notwendig, da sonst der Code zum Scrounge-Base-Wechsel
    //auch ausgeführt wird, wenn innerhalb des Scrounge-Modus Kategorien gewechselt werden, wodurch sich das SpriteSheet 
    //unvorhergesehen verschiebt.
    if (mode == 'base' && posXAbsolute <= spriteSheetWidth / 2 && posXAbsolute != spriteSheetWidth / 2) {
        /*console.log("BASE TO SCROUNGE");*/
        //großer Sprung in die rechte Hälfte des SpriteSheets
        newPosX = parseInt(posXY[0]) - spriteSheetWidth / 2;
    }
    //Falls Wechsel von Scrounge zu Base
    else if (mode == 'scrounge' && posXAbsolute >= spriteSheetWidth / 2) {
        /*console.log("SCROUNGE TO BASE");*/
        //großer Sprung in die linke Hälfte des SpriteSheets
        newPosX = parseInt(posXY[0]) + spriteSheetWidth / 2;
    }
    /*console.log("newPosX  "+newPosX);*/

    if (newPosX || newPosX === 0) {

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
                            /*                    console.log("mittelgroß "+rulesInner[k].style.backgroundPosition);*/
                            break;
                        }
                    }
                }
            } else if (spriteSheetWidth == 2800) {

                /*console.log("großesSpriteSheet");*/
                if (rules[i].cssText.substr(0, 42) == "@media only screen and (min-width: 1920px)") {
                    //spriteSheet rules in tieferer Verschachtelung innerhalb der spriteSheet rule der media queries
                    var rulesInner = rules[i].cssRules;
                    for (j = 0; j < rulesInner.length; j++) {
                        /*console.log("innereForSchleife" + j);*/
                        if (rulesInner[j].selectorText == classToBeChanged) {
                            rulesInner[j].style.backgroundPosition = newPosX + "px " + posXY[1];
                            /*                                console.log("groß "+rulesInner[j].style.backgroundPosition);*/
                            break;
                        }
                    }
                }
            }
        }
    }
}
