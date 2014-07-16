////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// CLIENT + SERVER //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//Collection init
Menus = new Meteor.Collection("Menus");
MatterBlocks = new Meteor.Collection("MatterBlocks");
FightArenas = new Meteor.Collection("FightArenas");
Items = new Meteor.Collection("Items");

playerData = new Meteor.Collection("playerData");
resources = new Meteor.Collection("resources");
craftedItems = new Meteor.Collection("craftedItems");
stolenItems = new Meteor.Collection("stolenItems");

Turf = new Meteor.Collection("Turf");
worldMapFields = new Meteor.Collection("worldMapFields");

mine = new Meteor.Collection("mine");
laboratory = new Meteor.Collection("laboratory");
workshop = new Meteor.Collection("workshop");
battlefield = new Meteor.Collection("battlefield");
thievery = new Meteor.Collection("thievery");
smelter = new Meteor.Collection("smelter");
