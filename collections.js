////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// CLIENT + SERVER //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

/*Meteor.Collection was renamed Mongo.Collection in 0.9.1. 
The change is currently backward compatible, however you should 
switch to using Mongo.Collection for any new projects. It looks 
like the docs have mostly been updated except for the wording in 
the Data and security section.*/

//Collection init
//Users = new Mongo.Collection("users");
Menus = new Mongo.Collection("Menus");
MatterBlocks = new Mongo.Collection("MatterBlocks");
FightArenas = new Mongo.Collection("FightArenas");

playerData = new Mongo.Collection("playerData");
resources = new Mongo.Collection("resources");

Turf = new Mongo.Collection("Turf");
worldMapFields = new Mongo.Collection("worldMapFields");
STATUS = new Mongo.Collection("STATUS");

mine = new Mongo.Collection("mine");
laboratory = new Mongo.Collection("laboratory");
workshop = new Mongo.Collection("workshop");
battlefield = new Mongo.Collection("battlefield");
thievery = new Mongo.Collection("thievery");
smelter = new Mongo.Collection("smelter");


//CLIENT ONLY COLLECTIONS

//die client only collection, die Daten aus der playerData enthält, aber nur solche, die
//für die worldMap relevant sind (vorher "worldMapPlayerData")
if(Meteor.isClient) {
	WorldMapPlayerData = new Mongo.Collection('playerDataForWorldMap');
}