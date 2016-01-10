////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// SERVER /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isServer) {
    ///////////////////
    //////Publish//////
    ///////////////////

    Meteor.publish("userDataInitial", function(users) {
        //can't be unblocked because then iron router 
        //won't set "this.ready()" to true to continue in the action hook
        //this.unblock();
        if (this.userId) {
            return Meteor.users.find({
                username: {
                    $in: users
                }
            }, {
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

    Meteor.publish("mineBase", function(userName) {
        this.unblock();
        if (this.userId) {
            return mineBase.find({
                user: userName
            });
        } else {
            this.ready();
        }
    });

    Meteor.publish("mineScrounge", function(userName) {
        this.unblock();
        if (this.userId) {
            return mineScrounge.find({
                user: userName
            });
        } else {
            this.ready();
        }
    });

    Meteor.publish("mineSupport", function(userName) {
        this.unblock();
        if (this.userId) {
            return mineSupport.find({
                user: userName
            });
        } else {
            this.ready();
        }
    });

    Meteor.publish("battlefieldBase", function(userName) {
        this.unblock();
        if (this.userId) {
            return battlefieldBase.find({
                user: userName
            });
        } else {
            this.ready();
        }
    });

    Meteor.publish("battlefieldScrounge", function(userName) {
        this.unblock();
        if (this.userId) {
            return battlefieldScrounge.find({
                user: userName
            });
        } else {
            this.ready();
        }
    });

    Meteor.publish("battlefieldSupport", function(userName) {
        this.unblock();
        if (this.userId) {
            return battlefieldSupport.find({
                user: userName
            });
        } else {
            this.ready();
        }
    });

    Meteor.publish("playerDataMine", function(userName) {
        this.unblock();
        // console.log('playerDataMineBase', userName);
        if (this.userId) {
            return playerData.find({
                user: userName
            }, {
                fields: {
                    'user': 1,
                    'mine': 1,
                }
            });
        } else {
            this.ready();
        }
    });

    Meteor.publish("playerDataImprovementsmine", function(userName) {
        this.unblock();
        //console.log('playerDataImprovementsmine');
        if (this.userId) {
            return playerData.find({
                user: userName
            }, {
                fields: {
                    'user': 1,
                    'level': 1,
                    'XP': 1,
                    'requiredXP': 1,
                    'mine': 1
                }
            });
        } else {
            this.ready();
        }
    });

    Meteor.publish("playerDataBattlefield", function(userName) {
        this.unblock();
        //console.log('playerDataBattlefieldBase');
        if (this.userId) {
            return playerData.find({
                user: userName
            }, {
                fields: {
                    'user': 1,
                    'battlefield': 1
                }
            });
        } else {
            this.ready();
        }
    });

    Meteor.publish("playerDataImprovementsbattlefield", function(userName) {
        this.unblock();
        //console.log('playerDataImprovementsbattlefield');
        if (this.userId) {
            return playerData.find({
                user: userName
            }, {
                fields: {
                    'user': 1,
                    'level': 1,
                    'XP': 1,
                    'requiredXP': 1,
                    'battlefield': 1
                }
            });
        } else {
            this.ready();
        }
    });

    //published die client only collection, die Daten aus der playerData enthält, aber nur solche, die
    //für die worldMap relevant sind (vorher "worldMapPlayerData")
    Meteor.publish('playerDataForWorldMap', function(usersXY) {
        this.unblock();

        if (this.userId) {
            var sub = this;
            var cursor = playerData.find({
                $and: [{
                        $or: [{
                            x: {
                                $in: usersXY[0]
                            }
                        }]
                    }, {
                        $or: [{
                            y: {
                                $in: usersXY[1]
                            }
                        }]
                    },
                    // { $in['owns0','owns1','owns2','owns3','owns4','owns5']: [$elemMatch: {input: {$exists: true}}]}
                ]
            }, {
                fields: {
                    'user': 1,
                    'x': 1,
                    'y': 1,
                    'level': 1,
                    'backgroundId': 1,
                    // 'mine.ownSlots': 1,
                    //Es gibt keine Möglichkeit den Teil "owns?" als Variable umzusetzen ohne teure zusätzliche Abfragen
                    //Daher sind hier alle slots aufgelistet, die ein Spieler maximal erreichen kann
                    //Solche, die in der Datenbank noch nicht vorhanden sind, werden einfach nicht mitgeschickt.
                    //Es resultieren keine Fehler
                    //Einsparung von: 445 bytes pro Dokument
                    'mine.ownSlots.owns0.input': 1,
                    'mine.ownSlots.owns0.control': 1,
                    'mine.ownSlots.owns0.sup0.name': 1,
                    'mine.ownSlots.owns0.sup1.name': 1,
                    'mine.ownSlots.owns0.sup2.name': 1,
                    'mine.ownSlots.owns0.sup3.name': 1,
                    'mine.ownSlots.owns0.sup4.name': 1,
                    'mine.ownSlots.owns0.sup5.name': 1,
                    'mine.ownSlots.owns1.input': 1,
                    'mine.ownSlots.owns1.control': 1,
                    'mine.ownSlots.owns1.sup0.name': 1,
                    'mine.ownSlots.owns1.sup1.name': 1,
                    'mine.ownSlots.owns1.sup2.name': 1,
                    'mine.ownSlots.owns1.sup3.name': 1,
                    'mine.ownSlots.owns1.sup4.name': 1,
                    'mine.ownSlots.owns1.sup5.name': 1,
                    'mine.ownSlots.owns2.input': 1,
                    'mine.ownSlots.owns2.control': 1,
                    'mine.ownSlots.owns2.sup0.name': 1,
                    'mine.ownSlots.owns2.sup1.name': 1,
                    'mine.ownSlots.owns2.sup2.name': 1,
                    'mine.ownSlots.owns2.sup3.name': 1,
                    'mine.ownSlots.owns2.sup4.name': 1,
                    'mine.ownSlots.owns2.sup5.name': 1,
                    'mine.ownSlots.owns3.input': 1,
                    'mine.ownSlots.owns3.control': 1,
                    'mine.ownSlots.owns3.sup0.name': 1,
                    'mine.ownSlots.owns3.sup1.name': 1,
                    'mine.ownSlots.owns3.sup2.name': 1,
                    'mine.ownSlots.owns3.sup3.name': 1,
                    'mine.ownSlots.owns3.sup4.name': 1,
                    'mine.ownSlots.owns3.sup5.name': 1,
                    'mine.ownSlots.owns4.input': 1,
                    'mine.ownSlots.owns4.control': 1,
                    'mine.ownSlots.owns4.sup0.name': 1,
                    'mine.ownSlots.owns4.sup1.name': 1,
                    'mine.ownSlots.owns4.sup2.name': 1,
                    'mine.ownSlots.owns4.sup3.name': 1,
                    'mine.ownSlots.owns4.sup4.name': 1,
                    'mine.ownSlots.owns4.sup5.name': 1,
                    'mine.ownSlots.owns5.input': 1,
                    'mine.ownSlots.owns5.control': 1,
                    'mine.ownSlots.owns5.sup0.name': 1,
                    'mine.ownSlots.owns5.sup1.name': 1,
                    'mine.ownSlots.owns5.sup2.name': 1,
                    'mine.ownSlots.owns5.sup3.name': 1,
                    'mine.ownSlots.owns5.sup4.name': 1,
                    'mine.ownSlots.owns5.sup5.name': 1,
                    'mine.amountOwnSlots': 1,
                    'mine.amountSupSlots': 1,
                    'mine.amountScrSlots': 1,
                    'mine.scrItem.benefit': 1,
                    // 'battlefield.ownSlots': 1,
                    'battlefield.ownSlots.owns0.input': 1,
                    'battlefield.ownSlots.owns0.control': 1,
                    'battlefield.ownSlots.owns0.sup0.name': 1,
                    'battlefield.ownSlots.owns0.sup1.name': 1,
                    'battlefield.ownSlots.owns0.sup2.name': 1,
                    'battlefield.ownSlots.owns0.sup3.name': 1,
                    'battlefield.ownSlots.owns0.sup4.name': 1,
                    'battlefield.ownSlots.owns0.sup5.name': 1,
                    'battlefield.ownSlots.owns1.input': 1,
                    'battlefield.ownSlots.owns1.control': 1,
                    'battlefield.ownSlots.owns1.sup0.name': 1,
                    'battlefield.ownSlots.owns1.sup1.name': 1,
                    'battlefield.ownSlots.owns1.sup2.name': 1,
                    'battlefield.ownSlots.owns1.sup3.name': 1,
                    'battlefield.ownSlots.owns1.sup4.name': 1,
                    'battlefield.ownSlots.owns1.sup5.name': 1,
                    'battlefield.ownSlots.owns2.input': 1,
                    'battlefield.ownSlots.owns2.control': 1,
                    'battlefield.ownSlots.owns2.sup0.name': 1,
                    'battlefield.ownSlots.owns2.sup1.name': 1,
                    'battlefield.ownSlots.owns2.sup2.name': 1,
                    'battlefield.ownSlots.owns2.sup3.name': 1,
                    'battlefield.ownSlots.owns2.sup4.name': 1,
                    'battlefield.ownSlots.owns2.sup5.name': 1,
                    'battlefield.ownSlots.owns3.input': 1,
                    'battlefield.ownSlots.owns3.control': 1,
                    'battlefield.ownSlots.owns3.sup0.name': 1,
                    'battlefield.ownSlots.owns3.sup1.name': 1,
                    'battlefield.ownSlots.owns3.sup2.name': 1,
                    'battlefield.ownSlots.owns3.sup3.name': 1,
                    'battlefield.ownSlots.owns3.sup4.name': 1,
                    'battlefield.ownSlots.owns3.sup5.name': 1,
                    'battlefield.ownSlots.owns4.input': 1,
                    'battlefield.ownSlots.owns4.control': 1,
                    'battlefield.ownSlots.owns4.sup0.name': 1,
                    'battlefield.ownSlots.owns4.sup1.name': 1,
                    'battlefield.ownSlots.owns4.sup2.name': 1,
                    'battlefield.ownSlots.owns4.sup3.name': 1,
                    'battlefield.ownSlots.owns4.sup4.name': 1,
                    'battlefield.ownSlots.owns4.sup5.name': 1,
                    'battlefield.ownSlots.owns5.input': 1,
                    'battlefield.ownSlots.owns5.control': 1,
                    'battlefield.ownSlots.owns5.sup0.name': 1,
                    'battlefield.ownSlots.owns5.sup1.name': 1,
                    'battlefield.ownSlots.owns5.sup2.name': 1,
                    'battlefield.ownSlots.owns5.sup3.name': 1,
                    'battlefield.ownSlots.owns5.sup4.name': 1,
                    'battlefield.ownSlots.owns5.sup5.name': 1,
                    'battlefield.amountOwnSlots': 1,
                    'battlefield.amountSupSlots': 1,
                    'battlefield.amountScrSlots': 1,
                    'battlefield.scrItem.benefit': 1,
                }
            });

            Mongo.Collection._publishCursor(cursor, sub, 'playerDataForWorldMap')
            return sub.ready();

        } else {
            this.ready();
        }
    });

    Meteor.publish("resources", function() {
        this.unblock();
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

    Meteor.publish("MatterBlocks", function(color) {
        this.unblock();
        if (this.userId) {
            return MatterBlocks.find({
                color: color
            }, {
                fields: {
                    'name': 0,
                }
            });
        } else {
            this.ready();
        }
    });

    Meteor.publish("FightArenas", function(color) {
        this.unblock();
        if (this.userId) {
            return FightArenas.find({
                color: color
            }, {
                fields: {
                    'name': 0,
                }
            });
        } else {
            this.ready();
        }
    });
    //momentan nicht benötigt
    // Meteor.publish("worldMapFields", function(users) {
    //     this.unblock();
    //     if (this.userId) {
    //         return worldMapFields.find({});
    //     } else {
    //         this.ready();
    //     }
    // });

    Meteor.publish("worldMapSize", function() {
        this.unblock();
        if (this.userId) {
            return STATUS.find({
                maxXY: {
                    $exists: true
                }
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
