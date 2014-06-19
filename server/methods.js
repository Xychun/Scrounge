////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// SERVER /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isServer) {
    //Methods
    Meteor.methods({
        getServerTime: function() {
            return new Date();
        },

        goScrounging: function(slotId) {
            var currentUser = Meteor.users.findOne({
                _id: this.userId
            }, {
                fields: {
                    cu: 1
                }
            }).cu;
            var myName = Meteor.users.findOne({
                _id: this.userId
            }, {
                fields: {
                    username: 1
                }
            }).username;
            //CHECK IF YOU ARE TRYING TO SCROUNGE YOURSELF OR TARGET IS ALLRDY SCROUNGED
            if (currentUser == myName) {
                console.log('You cant scrounge here: You are trying to scrounge yourself! How stupid is that? ô.O');
                return;
            }
            var cursorMyPlayerData = playerData.findOne({
                user: myName
            }, {
                fields: {
                    mine: 1
                }
            });
            var amountScrSlots = cursorMyPlayerData.mine.scrSlots;
            var cursorMineScrounger = mine.findOne({
                user: myName
            });
            for (i = 0; i < amountScrSlots; i++) {
                if (cursorMineScrounger['scrs' + i].victim == currentUser) {
                    console.log('You cant scrounge here: You allready scrounge this user!');
                    return;
                }
            }
            //CHECK FREE SCRSLOTS OF SCROUNGER DATA
            var resultScrounger = -1;
            for (i = 0; i < amountScrSlots; i++) {
                if (cursorMineScrounger['scrs' + i].victim == "") {
                    resultScrounger = i;
                    break;
                }
            }
            if (resultScrounger == -1) {
                console.log('You cant scrounge here: Your Scrounge slots are all in use!');
                return;
            }
            //CHECK FREE SUPSLOTS OF CURRENT USER DATA                
            var obj0 = {};
            obj0['owns' + slotId] = 1;
            var cursorMineOwner = mine.findOne({
                user: currentUser
            }, {
                fields: obj0
            });
            //Get free SupSlots index
            var amountSupSlots = playerData.findOne({
                user: currentUser
            }, {
                fields: {
                    mine: 1
                }
            }).mine.supSlots;
            var resultOwner = -1;
            for (i = 0; i < amountSupSlots; i++) {
                if (cursorMineOwner['owns' + slotId]['sup' + i] == "") {
                    resultOwner = i;
                    break;
                }
            }
            //LAST CHECK: RANGE SLIDER
            if (!(cursorMineOwner['owns' + slotId].control.min < cursorMyPlayerData.mine.scrItem.benefit < cursorMineOwner['owns' + slotId].control.max)) {
                console.log('You cant scrounge here: You do not have the right miningrate!');
                return;
            }

            //SupSlot with id result is free and correct: update it ?
            if (resultOwner == -1) {
                console.log('You cant scrounge here: The owners support slots are all full!');
                return;
            }
            //set to mine of owner
            var obj0 = {};
            obj0['owns' + slotId + '.sup' + resultOwner] = myName;
            mine.update({
                user: currentUser
            }, {
                $set: obj0
            });

            //set to mine of scrounger
            var obj0 = {};
            obj0['scrs' + resultScrounger + '.victim'] = currentUser;
            obj0['scrs' + resultScrounger + '.stamp'] = new Date();
            mine.update({
                user: myName
            }, {
                $set: obj0
            });
            console.log('Scrounging successul!');
        },

        buyMatter: function(matterId,slider_range) {
            var name = Meteor.users.findOne({
                _id: this.userId
            }).username;
            var colorCode = matterId.substring(0, 2);
            switch (colorCode) {
                case "01":
                    var matterColor = "green";
                    break;
                case "02":
                    var matterColor = "red";
                    break;
                default:
                    console.log("methods.js: something's wrong...");
            }
            var matter = resources.findOne({
                user: name
            }).values[matterColor].matter;
            var cost = MatterBlocks.findOne({
                matter: matterId
            }).cost;

            //check costs
            if (!(matter >= cost)) {
                console.log('You cant buy this matter: You do not have anough matter!');
                return;
            }
            var amountSlots = playerData.findOne({
                user: name
            }).mine.ownSlots;

            var cursor = mine.findOne({
                user: name
            })

                //Iterate all own slots and fill matter into free one
                for (i = 0; i < amountSlots; i++) {
                    if (cursor['owns' + i].input == "0000") {
                        var obj0 = {};
                        obj0['owns' + i + '.stamp'] = new Date();
                        obj0['owns' + i + '.input'] = matterId;
                        obj0['owns' + i + '.control.min'] = slider_range[0];
                        obj0['owns' + i + '.control.max'] = slider_range[1];
                        mine.update({
                            user: name
                        }, {
                            $set: obj0
                        });
                        //pay matter
                        var obj1 = {};
                        obj1['values.' + matterColor + '.matter'] = matter - cost;
                        resources.update({
                            user: name
                        }, {
                            $set: obj1
                        });
                        break;
                    }
                }
            }
        },

        init: function() {

            var self = Meteor.users.findOne({
                _id: this.userId
            });
            var name = self.username;
            //TO-DO: Methode richtig einpflegen
            // createMapPosition(name);

            // USERS //
            Meteor.users.update({
                _id: this.userId
            }, {
                $set: {
                    menu: 'mine',
                    cu: name
                }
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation users error: ' + err);
                } else {
                    //upsert successful
                }
            });

            // RESOURCES //
            resources.insert({
                user: name,
                values: {
                    green: {
                        matter: 0,
                        sr1: 0,
                        sr2: 0,
                        sr3: 0,
                        sr4: 0,
                        sr5: 0,
                        sr6: 0
                    }
                }
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation resources error: ' + err);
                } else {
                    //insert successful
                }
            });

            // PLAYERDATA //
            playerData.insert({
                user: name,
                level: 1,
                mine: {
                    ownItem: {
                        blank: "",
                        benefit: 1,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    scrItem: {
                        blank: "",
                        benefit: 5,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    ownSlots: 1,
                    scrSlots: 1,
                    supSlots: 1,
                    science: 0.1,
                    minControl: 0.1,
                    maxControl: 10
                },
                laboratory: {
                    ownItem: {
                        blank: "",
                        benefit: 110,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    scrItem: {
                        blank: "",
                        benefit: 1,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    ownSlots: 1,
                    scrSlots: 1,
                    supSlots: 1,
                    science: 0.1,
                    minControl: 0.1,
                    maxControl: 10
                },
                workshop: {
                    ownItem: {
                        blank: "",
                        benefit: 5,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    scrItem: {
                        blank: "",
                        benefit: 1,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    ownSlots: 1,
                    scrSlots: 1,
                    supSlots: 1,
                    science: 0.1,
                    minControl: 0.1,
                    maxControl: 10
                },
                battlefield: {
                    ownItem: {
                        blank: "",
                        benefit: 5,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    scrItem: {
                        blank: "",
                        benefit: 1,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    ownSlots: 1,
                    scrSlots: 1,
                    supSlots: 1,
                    science: 0.1,
                    minControl: 0.1,
                    maxControl: 10
                },
                thivery: {
                    ownItem: {
                        blank: "",
                        benefit: 5,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    scrItem: {
                        blank: "",
                        benefit: 1,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    ownSlots: 1,
                    scrSlots: 1,
                    supSlots: 1,
                    science: 0.1,
                    minControl: 0.1,
                    maxControl: 10
                },
                smelter: {
                    ownItem: {
                        blank: "",
                        benefit: 5,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    scrItem: {
                        blank: "",
                        benefit: 1,
                        upgrades: 1,
                        stolen: "null",
                        active: "false"
                    },
                    ownSlots: 1,
                    scrSlots: 1,
                    supSlots: 1,
                    science: 0.1,
                    minControl: 0.1,
                    maxControl: 10
                }
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation playerData error: ' + err);
                } else {
                    //insert successful
                }
            });

            // MINE //
            mine.insert({
                user: name,
                owns0: {
                    input: "0000",
                    stamp: "",
                    control: {
                        min: 5,
                        max: 10
                    },
                    sup0: ""
                },
                scrs0: {
                    victim: "",
                    stamp: "",
                    benefit: 5
                }
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation mine error: ' + err);
                } else {
                    //insert successful
                }
            });

            // LABORATORY //
            laboratory.insert({
                user: name,
                owns0: {
                    input: "000000",
                    stamp: "",
                    control: {
                        min: 105,
                        max: 113
                    },
                    sup0: ""
                },
                scrs0: {
                    victim: "",
                    stamp: "",
                    benefit: 110
                }
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation laboratory error: ' + err);
                } else {
                    //insert successful
                }
            });

            // WORKSHOP //
            workshop.insert({
                    user: name,
                    owns0: {
                        input: "000000",
                        stamp: "",
                        control: {
                            min: 5,
                            max: 10
                        },
                        sup0: ""
                    },
                    scrs0: {
                        victim: "",
                        stamp: "",
                        benefit: 2.5
                    }
                },
                function(err) {
                    if (err) {
                        throw new Meteor.Error(404, 'account creation workshop error: ' + err);
                    } else {
                        //insert successful
                    }
                });

            // BATTLEFIELD //
            battlefield.insert({
                    user: name,
                    owns0: {
                        input: "0000",
                        stamp: "",
                        control: {
                            min: 50,
                            max: 80
                        },
                        sup0: ""
                    },
                    scrs0: {
                        victim: "",
                        stamp: "",
                        benefit: 50
                    }
                },
                function(err) {
                    if (err) {
                        throw new Meteor.Error(404, 'account creation battlefield error: ' + err);
                    } else {
                        //insert successful
                    }
                });

            // THIEVERY //
            thievery.insert({
                    user: name,
                    owns0: {
                        input: "0000",
                        stamp: "",
                        control: {
                            min: 1,
                            max: 3.2
                        },
                        sup0: ""
                    },
                    scrs0: {
                        victim: "",
                        stamp: "",
                        benefit: 1
                    }
                },
                function(err) {
                    if (err) {
                        throw new Meteor.Error(404, 'account creation thivery error: ' + err);
                    } else {
                        //insert successful
                    }
                });

            // SMELTER //
            smelter.insert({
                    user: name,
                    owns0: {
                        input: "0000",
                        stamp: "",
                        control: {
                            min: 0.1,
                            max: 0.2
                        },
                        sup0: ""
                    },
                    scrs0: {
                        victim: "",
                        stamp: "",
                        benefit: 0.1
                    }
                },
                function(err) {
                    if (err) {
                        throw new Meteor.Error(404, 'account creation smelter error: ' + err);
                    } else {
                        //insert successful
                    }
                });



            return "account init OK!";
        }
    });
}
