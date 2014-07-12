///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// CLIENT //////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isClient) {

    /////////////////////////
    ///// SUBSCRIPTIONS /////
    /////////////////////////


    Meteor.methods({

	    showInfoTextAnimation: function(text, color) {

		    var textAnimation = document.createElement("div");
		    textAnimation.innerHTML = text;
		    textAnimation.id = "textAnimation";
		    document.getElementById("mitte").appendChild(textAnimation);
		    textAnimation.style.color = color;
		    setTimeout(function() {document.getElementById("mitte").removeChild(document.getElementById("textAnimation"))}, 2000);

			},

		infoLog: function(text, color) {

			var log = document.createElement("div");
			var previousLogID;
		    log.innerHTML = text;
		    log.className = "logs";
		    log.style.color = color;
			$("#infoLog").prepend(log);
			
		}
	});

}