////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// HELP SECTION /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

//[JQUERY: ATTR = Attribute Selector!]
// expl: $(this).attr('id') 

// var elm = document.createElement("div");
// var jelm = $(elm);//convert to jQuery Element
// var htmlElm = jelm[0];//convert to HTML Element

// Meteor - get object : $(event.target).css({"background-color":"orange"});
// Meteor - get object ID: alert($(event.currentTarget.ID));     alert(event.target.id);

////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// CLIENT /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isClient){
	//Subscriptions
  Meteor.subscribe("userData");


/*Seltsame Darstellungsfehler bedürfen es, dass der Hintergrund um ein Pixel weiter verschoben wird, als die Datei es hergibt (beobachtet in Chrome)*/
Template.standardBorder.events({

/*Events Frame-Buttons + Hover*/

    'mouseover #scrounge' : function(e, t){

    	var pos = $('#scrounge').css("background-position");
    	console.log(pos);
    	$('#scrounge').css({"background-position":"0px -152px"});	
    },

    'mouseout #scrounge' : function(e, t){

    	var pos = $('#scrounge').css("background-position");
    	console.log(pos);
    	$('#scrounge').css({"background-position":"0px 0px"});	
    },


/*HOVER*/

    'mouseover #left_slider_category' : function(e, t){

    	var pos = $('#left_slider_category').css("background-position");
    	var size = $('#left_slider_category').css("padding");
    	console.log(pos);
    	console.log(size);

    	/*Umsetzung der media queries in javascript, Abfrage über die Größe des Elements, muss noch für alle anderen Elemente übernommen werden*/
    	switch (size) {

    		case "110px 54px 0px 0px":

    		$('#left_slider_category').css({"background-position":"-163px 0px"});

    		break;

    		case "":

    		break;

    		case"":

    		break;

    		default:

    		console.log("something's wrong...");
    	}    		
    },

    'mouseout #left_slider_category' : function(e, t){

    	var pos = $('#left_slider_category').css("background-position");
    	var size = $('#left_slider_category').css("padding");
    	console.log(pos);

    	switch (size) {

    		case "110px 54px 0px 0px":

    		$('#left_slider_category').css({"background-position":"-109px 0px"});

    		break;

    		case "":

    		break;

    		case"":

    		break;

    		default:

    		console.log("something's wrong...");
    	} 
    		
    },

    'mouseover #right_slider_category' : function(e, t){

    	var pos = $('#right_slider_category').css("background-position");
    	console.log(pos);
    	$('#right_slider_category').css({"background-position":"-163px 0px"});	
    },

    'mouseout #right_slider_category' : function(e, t){

    	var pos = $('#right_slider_category').css("background-position");
    	console.log(pos);
    	$('#right_slider_category').css({"background-position":"-109px 0px"});	
    },

    'mouseover #up_slider_stolen' : function(e, t){

    	var pos = $('#up_slider_stolen').css("background-position");
    	console.log(pos);
    	$('#up_slider_stolen').css({"background-position":"-55px 0px"});	
    },

    'mouseout #up_slider_stolen' : function(e, t){

    	var pos = $('#up_slider_stolen').css("background-position");
    	console.log(pos);
    	$('#up_slider_stolen').css({"background-position":"0px 0px"});	
    },

    'mouseover #down_slider_stolen' : function(e, t){

    	var pos = $('#down_slider_stolen').css("background-position");
    	console.log(pos);
    	$('#down_slider_stolen').css({"background-position":"-55px 0px"});	
    },

    'mouseout #down_slider_stolen' : function(e, t){

    	var pos = $('#down_slider_stolen').css("background-position");
    	console.log(pos);
    	$('#down_slider_stolen').css({"background-position":"0px 0px"});	
    },

    'mouseover #down_slider_own' : function(e, t){

    	var pos = $('#down_slider_own').css("background-position");
    	console.log(pos);
    	$('#down_slider_own').css({"background-position":"-55px 0px"});	
    },

    'mouseout #down_slider_own' : function(e, t){

    	var pos = $('#down_slider_own').css("background-position");
    	console.log(pos);
    	$('#down_slider_own').css({"background-position":"0px 0px"});	
    },

    'mouseover #up_slider_own' : function(e, t){

    	var pos = $('#up_slider_own').css("background-position");
    	console.log(pos);
    	$('#up_slider_own').css({"background-position":"-55px 0px"});	
    },

    'mouseout #up_slider_own' : function(e, t){

    	var pos = $('#up_slider_own').css("background-position");
    	console.log(pos);
    	$('#up_slider_own').css({"background-position":"0px 0px"});	
    },

    'mouseover #right_slider_matter' : function(e, t){

    	var pos = $('#right_slider_matter').css("background-position");
    	console.log(pos);
    	$('#right_slider_matter').css({"background-position":"-55px 0px"});	
    },

    'mouseout #right_slider_matter' : function(e, t){

    	var pos = $('#right_slider_matter').css("background-position");
    	console.log(pos);
    	$('#right_slider_matter').css({"background-position":"0px 0px"});	
    },

    'mouseover #left_slider_matter' : function(e, t){

    	var pos = $('#left_slider_matter').css("background-position");
    	console.log(pos);
    	$('#left_slider_matter').css({"background-position":"-55px 0px"});	
    },

    'mouseout #left_slider_matter' : function(e, t){

    	var pos = $('#left_slider_matter').css("background-position");
    	console.log(pos);
    	$('#left_slider_matter').css({"background-position":"0px 0px"});	
    }
});

}
/*  function hoverScroungeBase() {
	var pos = button.style.backgroundPosition;
	alert(pos);*/
	


// if (Meteor.isClient) {
//   //Methods
//   Meteor.methods({
//     name: function(param) {

//     }
//   });

//   //Subscriptions
//   Meteor.subscribe("name");

//   //Template Returns
//   Template.content.TestInput = function (){
//     return null;
//   }

//  //Template Events
//  Template.tempName.events({
//   'click': function () {
//       //asd
//     }
//   });

//  //Deps.Autorun
//  Deps.autorun(function () {
//     //asd
//   });
// }
