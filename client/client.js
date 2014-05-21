////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// CLIENT /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isClient){
	//Subscriptions
  Meteor.subscribe("userData");

  var clicked = false;


/*Seltsame Darstellungsfehler bedürfen es, dass der Hintergrund um ein Pixel weiter verschoben wird, als die Datei es hergibt (beobachtet in Chrome)*/
Template.standardBorder.events({

/*Events Frame-Buttons + Hover*/

    'mouseover #scrounge' : function(e, t){

        console.log("id"+ " "+event.target.id+" "+t.which+" "+e);

        var elem = event.target;

        console.log(elem);

    	var pos = $('#scrounge').css("background-position");
    	var size = $('#scrounge').css("padding");
        console.log(pos);
        console.log(size);

        /*Umsetzung der media queries in javascript, Abfrage über die Größe des Elements, muss noch für alle anderen Elemente übernommen werden*/
        switch (size) {

            case "76px":

            $('#scrounge').css({"background-position":"0px -153px"});
            break;

            case "51px":

            $('#scrounge').css({"background-position":"0px -103px"});
            break;

            case"40px":

            $('#scrounge').css({"background-position":"0px -80px"});
            break;

            default:

            console.log("something's wrong...");
        }  	
    },

    'mouseout #scrounge' : function(e, t){

    	var pos = $('#scrounge').css("background-position");
    	var size = $('#scrounge').css("padding");
        console.log(pos);
        console.log(size);

        /*Umsetzung der media queries in javascript, Abfrage über die Größe des Elements, muss noch für alle anderen Elemente übernommen werden*/
        switch (size) {

            case "76px":

            $('#scrounge').css({"background-position":"0px 0px"});
            break;

            case "51px":

            $('#scrounge').css({"background-position":"0px 0px"});
            break;

            case"40px":

            $('#scrounge').css({"background-position":"0px 0px"});
            break;

            default:

            console.log("something's wrong...");
        } 	
    },

    'mouseover #character' : function(e, t){

    	var pos = $('#character').css("background-position");
    	console.log(pos);
    	$('#character').css({"background-position":"0px -152px"});	
    },

    'mouseout #character' : function(e, t){

    	if(clicked==false) {
    	var pos = $('#character').css("background-position");
    	console.log(pos);
    	$('#character').css({"background-position":"0px 0px"});
    	}	
    },

    'click #character' : function(e, t){

    	if(clicked==false) {
    		clicked = true;
    		$('#mitte').css({"display":"none"});
    		$('#mitteCharacterScreen').css({"display":"block"});
    		$('#character').css({"background-position":"0px -152px"});
    	}

    	else{
    		clicked = false;
    		$('#mitte').css({"display":"block"});
    		$('#mitteCharacterScreen').css({"display":"none"});
    	}
    		
    },

    'mouseover #message' : function(e, t){

    	var pos = $('#message').css("background-position");
    	console.log(pos);
    	$('#message').css({"background-position":"0px -152px"});	
    },

    'mouseout #message' : function(e, t){

    	var pos = $('#message').css("background-position");
    	console.log(pos);
    	$('#message').css({"background-position":"0px 0px"});	
    },

    'mouseover #social' : function(e, t){

    	var pos = $('#social').css("background-position");
    	console.log(pos);
    	$('#social').css({"background-position":"0px -153px"});	
    },

    'mouseout #social' : function(e, t){

    	var pos = $('#social').css("background-position");
    	console.log(pos);
    	$('#social').css({"background-position":"0px 0px"});	
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

    		case "74px 36px 0px 0px":

    		$('#left_slider_category').css({"background-position":"-110px 0px"});
    		break;

    		case"58px 28px 0px 0px":

    		$('#left_slider_category').css({"background-position":"-86px 0px"});
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

    		case "74px 36px 0px 0px":

    		$('#left_slider_category').css({"background-position":"-74px 0px"});
    		break;

    		case"58px 28px 0px 0px":

    		$('#left_slider_category').css({"background-position":"-58px 0px"});
    		break;

    		default:

    		console.log("something's wrong...");
    	} 
    		
    },

    'mouseover #right_slider_category' : function(e, t){

    	var pos = $('#right_slider_category').css("background-position");
    	var size = $('#right_slider_category').css("padding");
        console.log(pos);
        console.log(size);

        switch (size) {

            case "110px 54px 0px 0px":

            $('#right_slider_category').css({"background-position":"-163px 0px"});
            break;

            case "74px 36px 0px 0px":

            $('#right_slider_category').css({"background-position":"-110px 0px"});
            break;

            case"58px 28px 0px 0px":

            $('#right_slider_category').css({"background-position":"-58px 0px"});
            break;

            default:

            console.log("something's wrong...");
        } 	
    },

    'mouseout #right_slider_category' : function(e, t){

    	var pos = $('#right_slider_category').css("background-position");
    	var size = $('#right_slider_category').css("padding");
        console.log(pos);
        console.log(size);

        switch (size) {

            case "110px 54px 0px 0px":

            $('#right_slider_category').css({"background-position":"-109px 0px"});
            break;

            case "74px 36px 0px 0px":

            $('#right_slider_category').css({"background-position":"-74pxpx 0px"});
            break;

            case"58px 28px 0px 0px":

            $('#right_slider_category').css({"background-position":"-58px 0px"});
            break;

            default:

            console.log("something's wrong...");
        } 
    },

    'mouseover #up_slider_stolen' : function(e, t){

    	var pos = $('#up_slider_stolen').css("background-position");
    	var size = $('#up_slider_stolen').css("padding");
        console.log(pos);
        console.log(size);

        switch (size) {

            case "110px 54px 0px 0px":

            $('#up_slider_stolen').css({"background-position":"-55px 0px"});
            break;

            case "74px 36px 0px 0px":

            $('#up_slider_stolen').css({"background-position":"-39px 0px"});
            break;

            case"58px 28px 0px 0px":

            $('#up_slider_stolen').css({"background-position":"-28px 0px"});
            break;

            default:

            console.log("something's wrong...");
        } 
    },

    'mouseout #up_slider_stolen' : function(e, t){

    	var pos = $('#up_slider_stolen').css("background-position");
    	var size = $('#up_slider_stolen').css("padding");
        console.log(pos);
        console.log(size);

        switch (size) {

            case "110px 54px 0px 0px":

            $('#up_slider_stolen').css({"background-position":"0px 0px"});
            break;

            case "74px 36px 0px 0px":

            $('#up_slider_stolen').css({"background-position":"0px 0px"});
            break;

            case"58px 28px 0px 0px":

            $('#up_slider_stolen').css({"background-position":"0px 0px"});
            break;

            default:

            console.log("something's wrong...");
        } 
    },

    'mouseover #down_slider_stolen' : function(e, t){

    	var pos = $('#down_slider_stolen').css("background-position");
    	var size = $('#left_slider_category').css("padding");
        console.log(pos);
        console.log(size);
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
