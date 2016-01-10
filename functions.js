////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// CLIENT + SERVER FUNCTIONS ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

isScroungeable = function(menu, self, currentUser, slotID) {
    // console.log('(menu, self, currentUser, slotID):', menu, self, currentUser, slotID);
    var obj = [];

    //CHECK IF YOU ARE TRYING TO SCROUNGE YOURSELF
    if (self == currentUser) {
        obj['result'] = false;
        obj['message'] = 'You cannot scrounge here: You are trying to scrounge yourself! How stupid is that? o.O';
        return obj;
    }

    //this syntax works in mongodb shell but not with meteor -> switch case
    // var lala = menu + 'Scrounge';
    // console.log('lala:', lala);
    // var arrayMenuScrounge = [lala].find({
    //     user: self
    // });
    // console.log(arrayMenuScrounge);
    switch (menu) {
        case "mine":
            var cursorMenuBase = mineBase.findOne({
                user: currentUser,
                slotID: slotID
            });
            var arrayMenuScrounge = mineScrounge.find({
                user: self
            }).fetch();
            var arrayMenuSupport = mineSupport.find({
                user: currentUser,
                refID: slotID
            }).fetch();
            var scrItemBenefit = playerData.findOne({
                user: self
            }).mine.scrItem.benefit;
            break;
        case "battlefield":
            var cursorMenuBase = battlefieldBase.findOne({
                user: currentUser,
                slotID: slotID
            });
            var arrayMenuScrounge = battlefieldScrounge.find({
                user: self
            }).fetch();
            var arrayMenuSupport = battlefieldSupport.find({
                user: currentUser,
                refID: slotID
            }).fetch();
            var scrItemBenefit = playerData.findOne({
                user: self
            }).battlefield.scrItem.benefit;
            break;
        default:
            console.log("default case: isScroungeable");
            break;
    }

    //CHECK IF TARGET IS ALREADY SCROUNGED
    for (i = 0; i < arrayMenuScrounge.length; i++) {
        if (arrayMenuScrounge[i].victim == currentUser) {
            obj['result'] = false;
            obj['message'] = 'You cannot scrounge here: You already scrounge this user!';
            return obj;
        }
    }

    //CHECK IF THERE IS A FREE SCRSLOT
    var resultFreeScrSlot = -1;
    for (i = 0; i < arrayMenuScrounge.length; i++) {
        if (arrayMenuScrounge[i].victim == null || arrayMenuScrounge[i].victim == "") {
            resultFreeScrSlot = arrayMenuScrounge[i].slotID;
            break;
        }
    }
    if (resultFreeScrSlot == -1) {
        obj['result'] = false;
        obj['message'] = 'You cannot scrounge here: Your Scrounge slots are all in use!';
        return obj;
    }

    // CHECK IF THERE IS A FREE SUPSLOT
    var resultFreeSupSlot = -1;
    for (i = 0; i < arrayMenuSupport.length; i++) {
        if (arrayMenuSupport[i].supporter == null || arrayMenuSupport[i].supporter == "") {
            resultFreeSupSlot = arrayMenuSupport[i].slotID;
            break;
        }
    }
    if (resultFreeSupSlot == -1) {
        obj['result'] = false;
        obj['message'] = 'You cannot scrounge here: There is no free support slot!';
        return obj;
    }

    //CHECK IF THE RANGE IS CORRECT
    if (!(cursorMenuBase.controlMin <= scrItemBenefit && scrItemBenefit <= cursorMenuBase.controlMax)) {
        obj['result'] = false;
        obj['message'] = 'You cannot scrounge here: You do not have the right item benefit!';
        return obj;
    }

    //                ! ! ! ! ! ! ! !                \\
    //  S C R O U N G I N G    E X E C U T A B L E   \\
    //                ! ! ! ! ! ! ! !                \\
    obj['result'] = true;
    obj['scrSlotID'] = resultFreeScrSlot;
    obj['supSlotID'] = resultFreeSupSlot;
    obj['message'] = "Scrounging " + currentUser + "'s " + menu + " successful!";
    return obj;
}

split = function(menu, mode, owner, beneficary, slotID) {
    // //--The Split--\\
    // TO-DO:
    // item
    // science
    // level
    // rankMine
    // rankLaboratory
    // rankBattlefield
    // rankWorkshop
    // rankThievery
    // rankSmelter

    var split = []; //TO-DO: Fill variable for complex return when with final culculations
    //this syntax works in mongodb shell but not with meteor -> switch case
    // var lala = menu + 'Scrounge';
    // console.log('lala:', lala);
    // var arrayMenuScrounge = [lala].find({
    //     user: self
    // });
    // console.log(arrayMenuScrounge);
    switch (menu) {
        case "mine":
            if (mode == "base") {
                var cursorMenu = mineBase.findOne({
                    user: owner,
                    slotID: slotID
                });
            } else {
                var cursorMenu = mineScrounge.findOne({
                    victim: owner,
                    refID: slotID
                });
            }
            break;
        case "battlefield":
            if (mode == "base") {
                var cursorMenu = battlefieldBase.findOne({
                    user: owner,
                    slotID: slotID
                });
            } else {
                var cursorMenu = battlefieldScrounge.findOne({
                    victim: owner,
                    refID: slotID
                });
            }
            break;
        default:
            console.log("default case: split");
            break;
    }

    //TO-DO: Split Table implementation
    ///////////////////////////////
    //TEMPORARY split calculation//
    ///////////////////////////////
    //TO-DO: Split Table implementation
    var result;

    //get data for splitting
    var splitValue = cursorMenu.splitValue;
    var supporterCount = cursorMenu.slots1;

    //do the calculations
    if (owner == beneficary) {
        if (supporterCount == 0) {
            //owner receives all when no supporter
            result = splitValue;
        } else {
            //owner receives 50% when any amount of supporter
            result = 0.5 * splitValue;
        }
    } else {
        //supporter receive splitted other 50%
        result = (0.5 * splitValue) / supporterCount;
    }
    //return amount
    return result;
}
