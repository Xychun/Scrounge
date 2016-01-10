///// MINE \\\\\
//prevent double loot when reset takes longer than update loop check
disableMineBase = function(user, slotID) {
    mineBase.update({
        user: user,
        slotID: slotID
    }, {
        $set: {
            input: "0000"
        }
    });
}

resetMineBase = function(user, slotID) {
    var objMineBase = {}; //mineBase
    //SAME (7)
    objMineBase['input'] = "0000";
    objMineBase['remaining'] = null,
    objMineBase['splitValue'] = 0,
    objMineBase['value1'] = 0,
    objMineBase['value2'] = 0,
    objMineBase['slots1'] = 0,
    objMineBase['benefitTotal'] = 7.5,

    mineBase.update({
        user: user,
        slotID: slotID
    }, {
        $set: objMineBase
    });
}

resetMineScrounge = function(user, victim, refID) {
    var objMineScrounge = {}; //mineScrounge
    //SAME (7)
    objMineScrounge['input'] = "0000";
    objMineScrounge['remaining'] = null,
    objMineScrounge['splitValue'] = 0,
    objMineScrounge['value1'] = 0,
    objMineScrounge['value2'] = 0,
    objMineScrounge['slots1'] = 0,
    //UNIQUE (1)
    objMineScrounge['victim'] = "";

    mineScrounge.update({
        user: user,
        victim: victim,
        refID: refID
    }, {
        $set: objMineScrounge
    });
}

resetMineSupport = function(user, refID) {
    var objMineSupport = {}; //mineSupport
    objMineSupport['supporter'] = "";

    mineSupport.update({
        user: user,
        refID: refID
    }, {
        $set: objMineSupport
    }, {
        multi: true
    });
}

///// BATTLEFIELD \\\\\
//prevent double loot when reset takes longer than update loop check
disableBattlefieldBase = function(user, slotID) {
    battlefieldBase.update({
        user: user,
        slotID: slotID
    }, {
        $set: {
            input: "0000"
        }
    });
}

resetBattlefieldBase = function(user, slotID) {
    var objBattlefieldBase = {}; //battlefieldBase
    //SAME (8)
    objBattlefieldBase['input'] = "0000";
    objBattlefieldBase['remaining'] = null,
    objBattlefieldBase['value'] = 0,
    objBattlefieldBase['splitValue'] = 0,
    objBattlefieldBase['value1'] = 0,
    objBattlefieldBase['value2'] = 0,
    objBattlefieldBase['slots1'] = 0,
    objBattlefieldBase['benefitTotal'] = 0,

    battlefieldBase.update({
        user: user,
        slotID: slotID
    }, {
        $set: objBattlefieldBase
    });
}

resetBattlefieldScrounge = function(user, victim, refID) {
    var objBattlefieldScrounge = {}; //battlefieldScrounge
    //SAME (8)
    objBattlefieldScrounge['input'] = "0000";
    objBattlefieldScrounge['remaining'] = null,
    objBattlefieldScrounge['value'] = 0,
    objBattlefieldScrounge['splitValue'] = 0,
    objBattlefieldScrounge['value1'] = 0,
    objBattlefieldScrounge['value2'] = 0,
    objBattlefieldScrounge['slots1'] = 0,
    //UNIQUE (1)
    objBattlefieldScrounge['victim'] = "";

    battlefieldScrounge.update({
        user: user,
        victim: victim,
        refID: refID
    }, {
        $set: objBattlefieldScrounge
    });
}

resetBattlefieldSupport = function(user, refID) {
    var objBattlefieldSupport = {}; //battlefieldSupport
    objBattlefieldSupport['supporter'] = "";

    battlefieldSupport.update({
        user: user,
        refID: refID
    }, {
        $set: objBattlefieldSupport
    }, {
        multi: true
    });
}
