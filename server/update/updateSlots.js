Meteor.startup(function() {
    // code to run on server at startup
    Meteor.setInterval(function() {
        updateRemaining();
    }, 1 * 1000);
});

function updateRemaining() {
    ///// MINE \\\\\
    var arrayMineBase = mineBase.find({
        remaining: {
            $lt: 1
        },
        input: {
            $ne: "0000"
        }
    }).fetch();

    for (var i = 0; i < arrayMineBase.length; i++) {
        updateMineSlot(arrayMineBase[i].user, arrayMineBase[i].slotID);
    };

    mineBase.update({
        //<query>,
        input: {
            $ne: "0000"
        },
        remaining: {
            $gt: 0
        }
    }, {
        //<update>,
        $inc: {
            remaining: -1000
        }
    }, {
        //<options>
        multi: true
    });

    mineScrounge.update({
        //<query>,
        input: {
            $ne: "0000"
        },
        remaining: {
            $gt: 0
        }
    }, {
        //<update>,
        $inc: {
            remaining: -1000
        }
    }, {
        //<options>
        multi: true
    });

    ///// BATTLEFIELD \\\\\
    var arrayBattlefieldBase = battlefieldBase.find({
        remaining: {
            $lt: 1
        },
        input: {
            $ne: "0000"
        }
    }).fetch();

    for (var i = 0; i < arrayBattlefieldBase.length; i++) {
        updateBattlefieldSlot(arrayBattlefieldBase[i].user, arrayBattlefieldBase[i].slotID);
    };

    battlefieldBase.update({
        //<query>,
        input: {
            $ne: "0000"
        },
        remaining: {
            $gt: 0
        }
    }, {
        //<update>,
        $inc: {
            remaining: -1000
        }
    }, {
        //<options>
        multi: true
    });

    battlefieldScrounge.update({
        //<query>,
        input: {
            $ne: "0000"
        },
        remaining: {
            $gt: 0
        }
    }, {
        //<update>,
        $inc: {
            remaining: -1000
        }
    }, {
        //<options>
        multi: true
    });
}
