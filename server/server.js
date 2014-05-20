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
/////////////////////////////////////////// SERVER /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  //Publish
  Meteor.publish("userData", function(){
    if (this.userId) {
      return Meteor.users.find({}, {fields: {'username': 1, 'menu': 1, 'cu': 1}});
    } else {
      this.ready();
    }
  });

  Meteor.publish("mine", function(current){
    if (this.userId) {
      return mine.find({user: current});
    } else {
      this.ready();
    }
  });

  Meteor.publish("laboratory", function(current){
    if (this.userId) {
      return laboratory.find({user: current});
    } else {
      this.ready();
    }
  });

  Meteor.publish("colosseum", function(current){
    if (this.userId) {
      return colosseum.find({user: current});
    } else {
      this.ready();
    }
  });

  Meteor.users.allow({
    update: function(userId, docs, fields, modifier) {
      if(fields == 'menu' || fields == 'cu'){
        return true;
      } else {
        return false;
      }
    }
  });
}
