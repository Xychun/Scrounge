////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// SERVER /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isServer) {
    /////////////////////////
    //////// METHODS ////////
    /////////////////////////
    Meteor.methods({
        init: function(name) {
            /////////////////////
            /////// USERS ///////
            /////////////////////
            Meteor.users.update({
                username: name
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


            /////////////////////
            ///// RESOURCES /////
            /////////////////////
            var objResources = {}; //Resources
            objResources['user'] = name;
            objResources['color'] = "green";
            objResources['colorCode'] = "01";
            objResources['matter'] = 0;
            objResources['sr1'] = 0;
            objResources['sr2'] = 0;
            objResources['sr3'] = 0;
            objResources['sr4'] = 0;
            objResources['sr5'] = 0;
            objResources['sr6'] = 0;

            resources.insert(objResources);


            ////////////////
            ///// MINE /////
            ////////////////
            var objMineBase = {}; //mineBase
            //SAME (6)
            objMineBase['input'] = "0000";
            objMineBase['remaining'] = null;
            objMineBase['splitValue'] = null;
            objMineBase['progress2'] = null;
            objMineBase['slots1'] = 0;
            objMineBase['slots2'] = null;
            //UNIQUE (4)
            objMineBase['controlMin'] = 5;
            objMineBase['controlMax'] = 10;
            objMineBase['timeStart'] = null;
            objMineBase['benefitTotal'] = 7.5;
            //--The Split--\\
            objMineBase['item'] = null;
            objMineBase['science'] = null;
            objMineBase['level'] = null;
            objMineBase['rankMine'] = null;
            objMineBase['rankLaboratory'] = null;
            objMineBase['rankBattlefield'] = null;
            objMineBase['rankWorkshop'] = null;
            objMineBase['rankThievery'] = null;
            objMineBase['rankSmelter'] = null;

            var objMineScrounge = {}; //mineScrounge
            //SAME (6)
            objMineScrounge['input'] = "0000";
            objMineScrounge['remaining'] = null;
            objMineScrounge['splitValue'] = null;
            objMineScrounge['progress2'] = null;
            objMineScrounge['slots1'] = null;
            objMineScrounge['slots2'] = null;
            //UNIQUE (4)
            objMineScrounge['refID'] = null;
            objMineScrounge['victim'] = null;
            objMineScrounge['timeStart'] = null;
            objMineScrounge['benefit'] = 5;
            //--The Split--\\
            objMineScrounge['item'] = null;
            objMineScrounge['science'] = null;
            objMineScrounge['level'] = null;
            objMineScrounge['rankMine'] = null;
            objMineScrounge['rankLaboratory'] = null;
            objMineScrounge['rankBattlefield'] = null;
            objMineScrounge['rankWorkshop'] = null;
            objMineScrounge['rankThievery'] = null;
            objMineScrounge['rankSmelter'] = null;

            var objMineSupport = {}; //mineSupport
            objMineSupport['supporter'] = null;
            objMineSupport['benefit'] = 5;
            objMineSupport['timeStart'] = null;
            //--The Split--\\
            objMineSupport['item'] = null;
            objMineSupport['science'] = null;
            objMineSupport['level'] = null;
            objMineSupport['rankMine'] = null;
            objMineSupport['rankLaboratory'] = null;
            objMineSupport['rankBattlefield'] = null;
            objMineSupport['rankWorkshop'] = null;
            objMineSupport['rankThievery'] = null;
            objMineSupport['rankSmelter'] = null;

            ///////////////////////
            ///// BATTLEFIELD /////
            ///////////////////////
            var objBattlefieldBase = {}; //battlefieldBase
            //SAME (7)
            objBattlefieldBase['input'] = "0000";
            objBattlefieldBase['remaining'] = null;
            objBattlefieldBase['value'] = null;
            objBattlefieldBase['splitValue'] = null;
            objBattlefieldBase['progress2'] = null;
            objBattlefieldBase['slots1'] = 0;
            objBattlefieldBase['slots2'] = null;
            //UNIQUE (4)
            objBattlefieldBase['controlMin'] = 5;
            objBattlefieldBase['controlMax'] = 10;
            objBattlefieldBase['timeStart'] = null;
            objBattlefieldBase['benefitTotal'] = 0;
            //--The Split--\\
            objBattlefieldBase['item'] = null;
            objBattlefieldBase['science'] = null;
            objBattlefieldBase['level'] = null;
            objBattlefieldBase['rankMine'] = null;
            objBattlefieldBase['rankLaboratory'] = null;
            objBattlefieldBase['rankBattlefield'] = null;
            objBattlefieldBase['rankWorkshop'] = null;
            objBattlefieldBase['rankThievery'] = null;
            objBattlefieldBase['rankSmelter'] = null;

            var objBattlefieldScrounge = {}; //battlefieldScrounge
            //SAME (7)
            objBattlefieldScrounge['input'] = "0000";
            objBattlefieldScrounge['remaining'] = null;
            objBattlefieldScrounge['value'] = null;
            objBattlefieldScrounge['splitValue'] = null;
            objBattlefieldScrounge['progress2'] = null;
            objBattlefieldScrounge['slots1'] = null;
            objBattlefieldScrounge['slots2'] = null;
            //UNIQUE (4)
            objBattlefieldScrounge['refID'] = null;
            objBattlefieldScrounge['victim'] = null;
            objBattlefieldScrounge['timeStart'] = null;
            objBattlefieldScrounge['benefit'] = 5;
            //--The Split--\\
            objBattlefieldScrounge['item'] = null;
            objBattlefieldScrounge['science'] = null;
            objBattlefieldScrounge['level'] = null;
            objBattlefieldScrounge['rankMine'] = null;
            objBattlefieldScrounge['rankLaboratory'] = null;
            objBattlefieldScrounge['rankBattlefield'] = null;
            objBattlefieldScrounge['rankWorkshop'] = null;
            objBattlefieldScrounge['rankThievery'] = null;
            objBattlefieldScrounge['rankSmelter'] = null;

            var objBattlefieldSupport = {}; //battlefieldSupport
            objBattlefieldSupport['supporter'] = null;
            objBattlefieldSupport['benefit'] = 5;
            objBattlefieldSupport['timeStart'] = null;
            //--The Split--\\
            objBattlefieldSupport['item'] = null;
            objBattlefieldSupport['science'] = null;
            objBattlefieldSupport['level'] = null;
            objBattlefieldSupport['rankMine'] = null;
            objBattlefieldSupport['rankLaboratory'] = null;
            objBattlefieldSupport['rankBattlefield'] = null;
            objBattlefieldSupport['rankWorkshop'] = null;
            objBattlefieldSupport['rankThievery'] = null;
            objBattlefieldSupport['rankSmelter'] = null;

            var slotID = 0;
            for (var i = 0; i < 3; i++) {
                objMineBase['slotID'] = i;
                mineBase.insert(objMineBase);

                objBattlefieldBase['slotID'] = i;
                battlefieldBase.insert(objBattlefieldBase);
                for (var j = 0; j < 2; j++) {
                    objMineSupport['slotID'] = slotID;
                    objMineSupport['refID'] = i;
                    mineSupport.insert(objMineSupport);

                    objBattlefieldSupport['slotID'] = slotID;
                    objBattlefieldSupport['refID'] = i;
                    battlefieldSupport.insert(objBattlefieldSupport);
                    objMineScrounge['slotID'] = slotID;
                    mineScrounge.insert(objMineScrounge);

                    objBattlefieldScrounge['slotID'] = slotID;
                    battlefieldScrounge.insert(objBattlefieldScrounge);
                };
                slotID++;
            }

            //Values randomNumber are [1-5]
            var randomNumber = Math.floor((Math.random() * 5)) + 1;
            //Diese switch case Gabelung dient der Umsetzung der sprite sheets
            //Zuvor wurde die ermittelte Zufallszahl so in der Datenbank gespeichert und später im html an einen Bildpfad angehängt
            //verschiedene Hintergründe wurden so jedem Spieler anhand dieser Zufallszahl zugeordnet
            //Mit sprite sheets muss diese Info aber in eine background-position übersetzt werden
            //dies geschieht hiermit. In der Datenbank werden die Pixelangaben gespeichert, die im sprite sheet verschiedene Hintergründe repräsentieren
            switch (randomNumber) {
                case 1:
                    randomNumber = "-310px 0px";
                    break;
                case 2:
                    randomNumber = "-620px 0px";
                    break;
                case 3:
                    randomNumber = "-930px 0px";
                    break;
                case 4:
                    randomNumber = "-1240px 0px";
                    break;
                case 5:
                    randomNumber = "-1550px 0px";
                    break;
                default:
                    console.log("initial background oops");
            }

            ///////////////////////
            ////// PLAYERDATA /////
            ///////////////////////
            playerData.insert({
                user: name,
                level: 0,
                XP: 0,
                requiredXP: 2014,
                backgroundId: randomNumber,
                x: 0,
                y: 0,
                mine: {
                    amountOwnSlots: 3,
                    amountScrSlots: 6,
                    amountSupSlots: 2,
                    science: 0.1,
                    minControl: 0.1,
                    maxControl: 10,
                    ownItem: {
                        blank: "",
                        benefit: 1,
                        upgrades: 1,
                        stolen: null,
                        active: false
                    },
                    scrItem: {
                        blank: "",
                        benefit: 5,
                        upgrades: 1,
                        stolen: null,
                        active: false
                    },
                },
                battlefield: {
                    amountOwnSlots: 3,
                    amountScrSlots: 6,
                    amountSupSlots: 2,
                    science: 0.1,
                    minControl: 50,
                    maxControl: 80,
                    ownItem: {
                        blank: "",
                        benefit: 0.5,
                        upgrades: 1,
                        stolen: null,
                        active: false
                    },
                    scrItem: {
                        blank: "",
                        benefit: 50,
                        upgrades: 1,
                        stolen: null,
                        active: false
                    },
                },
            }, {
                multi: false
            }, function(err) {
                if (err) {
                    throw new Meteor.Error(404, 'account creation playerData error: ' + err);
                } else {
                    //insert successful
                }
            });
            Meteor.call('createMapPosition', name);
            return "account init OK!";
        }
    });
}
