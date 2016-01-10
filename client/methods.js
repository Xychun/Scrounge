///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// CLIENT //////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isClient) {

    /////////////////////////
    //////// METHODS ////////
    /////////////////////////

    // //client versions of buyMatter and buyFight

    // Meteor.methods({
    //     //buyMatterNew
    //     buyMatter: function(matterId, slider_range) {
    //         console.time("BUY MATTER CLIENT");
    //         var name = Meteor.users.findOne({
    //             _id: this.userId
    //             }, {
    //             fields: {
    //                 username: 1,
    //             }
    //         }).username;
    //         var colorCode = matterId.substring(0, 2);
    //         switch (colorCode) {
    //             case "01":
    //                 var matterColor = "green";
    //                 break;
    //             case "02":
    //                 var matterColor = "red";
    //                 break;
    //             default:
    //                 console.log("infoLog", 'methods.js: something is wrong...', name);
    //                 return 'methods.js: something is wrong...';
    //         }
    //         var matter = resources.findOne({
    //             user: name
    //         }, {
    //             fields: {
    //                 values: 1,
    //             }
    //         }).values[matterColor].matter;
    //         var cursorMatter = MatterBlocks.findOne({
    //             matter: matterId
    //         }, {
    //             fields: {
    //                 cost: 1,
    //                 value: 1,
    //             }
    //         });
    //         var cost = cursorMatter.cost;
    //         var value = cursorMatter.value;
    //         //check costs
    //         if (!(matter >= cost)) {
    //             Meteor.call("infoLog", 'You cannot buy this matter: You do not have enough matter!', name);
    //             return '0You cannot buy this matter: You do not have enough matter!';
    //         }
    //         var cursor = playerData.findOne({
    //             user: name
    //         }, {
    //             fields: {
    //                 'mine.amountOwnSlots': 1,
    //                 'mine.ownSlots': 1,
    //                 'user': 1,
    //                 'mine.ownItem.benefit': 1,
    //             }
    //         });
    //         var cursorMine = cursor.mine;
    //         var amountSlots = cursorMine.amountOwnSlots;
    //         //Iterate all own slots and fill matter into free one
    //         for (i = 0; i < amountSlots; i++) {
    //             if (cursorMine.ownSlots['owns' + i].input == "0000") {
    //                 //pay matter
    //                 var obj1 = {};
    //                 obj1['values.' + matterColor + '.matter'] = matter - cost;
    //                 resources.update({
    //                     user: name
    //                 }, {
    //                     $set: obj1
    //                 });
    //                 //add item in playerData
    //                 var obj2 = {};
    //                 obj2['mine.ownSlots.owns' + i + '.stamp'] = new Date().getTime();
    //                 obj2['mine.ownSlots.owns' + i + '.input'] = matterId;
    //                 obj2['mine.ownSlots.owns' + i + '.control.min'] = slider_range[0];
    //                 obj2['mine.ownSlots.owns' + i + '.control.max'] = slider_range[1];
    //                 playerData.update({
    //                     user: name
    //                 }, {
    //                     $set: obj2
    //                 });
    //                 break;
    //             }
    //         }
    //         showInfoTextAnimation('1Purchase submitted'); 
    //         console.timeEnd("BUY MATTER CLIENT");
    //     },


    // 	//buyMatterNew
    //     buyMatter: function(matterId, slider_range) {
    //         console.time("BUY MATTER CLIENT");
    //         var name = Meteor.users.findOne({
    //             _id: this.userId
    //             }, {
    //             fields: {
    //                 username: 1,
    //             }
    //         }).username;
    //         var colorCode = matterId.substring(0, 2);
    //         switch (colorCode) {
    //             case "01":
    //                 var matterColor = "green";
    //                 break;
    //             case "02":
    //                 var matterColor = "red";
    //                 break;
    //             default:
    //                 console.log("infoLog", 'methods.js: something is wrong...', name);
    //                 return 'methods.js: something is wrong...';
    //         }
    //         var matter = resources.findOne({
    //             user: name
    //         }, {
    //             fields: {
    //                 values: 1,
    //             }
    //         }).values[matterColor].matter;
    //         var cursorMatter = MatterBlocks.findOne({
    //             matter: matterId
    //         }, {
    //             fields: {
    //                 cost: 1,
    //                 value: 1,
    //             }
    //         });
    //         var cost = cursorMatter.cost;
    //         var value = cursorMatter.value;
    //         //check costs
    //         if (!(matter >= cost)) {
    //             Meteor.call("infoLog", 'You cannot buy this matter: You do not have enough matter!', name);
    //             return '0You cannot buy this matter: You do not have enough matter!';
    //         }
    //         var cursor = playerData.findOne({
    //             user: name
    //         }, {
    //             fields: {
    //                 'mine.amountOwnSlots': 1,
    //                 'mine.ownSlots': 1,
    //                 'user': 1,
    //                 'mine.ownItem.benefit': 1,
    //             }
    //         });
    //         var cursorMine = cursor.mine;
    //         var amountSlots = cursorMine.amountOwnSlots;
    //         //Iterate all own slots and fill matter into free one
    //         for (i = 0; i < amountSlots; i++) {
    //             if (cursorMine.ownSlots['owns' + i].input == "0000") {
    //                 //pay matter
    //                 var obj1 = {};
    //                 obj1['values.' + matterColor + '.matter'] = matter - cost;
    //                 resources.update({
    //                     user: name
    //                 }, {
    //                     $set: obj1
    //                 });
    //                 //add item in playerData
    //                 var obj2 = {};
    //                 obj2['mine.ownSlots.owns' + i + '.stamp'] = new Date().getTime();
    //                 obj2['mine.ownSlots.owns' + i + '.input'] = matterId;
    //                 obj2['mine.ownSlots.owns' + i + '.control.min'] = slider_range[0];
    //                 obj2['mine.ownSlots.owns' + i + '.control.max'] = slider_range[1];
    //                 playerData.update({
    //                     user: name
    //                 }, {
    //                     $set: obj2
    //                 });
    //                 break;
    //             }
    //         }
    //         showInfoTextAnimation('1Purchase submitted'); 
    //         console.timeEnd("BUY MATTER CLIENT");
    //     },

    //     //BuyFight new
    //     buyFight: function(fightId, slider_range) {

    //         var name = Meteor.users.findOne({
    //             _id: this.userId
    //         }, {
    //             fields: {
    //                 username: 1,
    //             }
    //         }).username;
    //         var colorCode = fightId.substring(0, 2);
    //         switch (colorCode) {
    //             case "01":
    //                 var matterColor = "green";
    //                 break;
    //             case "02":
    //                 var matterColor = "red";
    //                 break;
    //             default:
    //                 Meteor.call("infoLog", 'methods.js: something is wrong...', name);
    //                 return 'methods.js: something is wrong...';
    //         }
    //         var matter = resources.findOne({
    //             user: name
    //         }, {
    //             fields: {
    //                 values: 1,
    //             }
    //         }).values[matterColor].matter;
    //         var cursorFight = FightArenas.findOne({
    //             fight: fightId
    //         }, {
    //             fields: {
    //                 cost: 1,
    //                 time: 1,
    //             }
    //         });
    //         var cost = cursorFight.cost;
    //         var time = cursorFight.time;
    //         //check costs
    //         if (!(matter >= cost)) {
    //             Meteor.call("infoLog", 'You cannot buy this fight: You do not have enough matter!', name);
    //                 return '0You cannot buy this fight: You do not have enough matter!';
    //         }
    //         var cursor = playerData.findOne({
    //             user: name
    //         }, {
    //             fields: {
    //                 'battlefield.amountOwnSlots': 1,
    //                 'battlefield.ownSlots': 1,
    //                 'user': 1
    //             }
    //         }).battlefield;
    //         var amountSlots = cursor.amountOwnSlots;
    //         //Iterate all own slots and fill fight into free one
    //         for (i = 0; i < amountSlots; i++) {
    //             if (cursor.ownSlots['owns' + i].input == "0000") {
    //                 //pay fight
    //                 var obj1 = {};
    //                 obj1['values.' + matterColor + '.fight'] = matter - cost;
    //                 resources.update({
    //                     user: name
    //                 }, {
    //                     $set: obj1
    //                 });
    //                 //add purchased item in playerData
    //                 var obj2 = {};
    //                 obj2['battlefield.ownSlots.owns' + i + '.stamp'] = new Date().getTime();
    //                 obj2['battlefield.ownSlots.owns' + i + '.input'] = fightId;
    //                 obj2['battlefield.ownSlots.owns' + i + '.control.min'] = slider_range[0];
    //                 obj2['battlefield.ownSlots.owns' + i + '.control.max'] = slider_range[1];
    //                 playerData.update({
    //                     user: name
    //                 }, {
    //                     $set: obj2
    //                 });
    //                 break;
    //             }
    //         }
    //         showInfoTextAnimation('1Purchase submitted');
    //         return '1Fight purchase successful!';
    //     },
    // });
}