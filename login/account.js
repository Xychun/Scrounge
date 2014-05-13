////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// CLIENT + SERVER //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// check input
function checkUsername(string) {
  if (string.match(/^[0-9a-zA-Z]+$/)) {
    return true;
  }
  return false;
}
function validLength(val){
  return val.length >= 6 ? true : false;
}

Meteor.methods({
  init: function () {
    Meteor.users.update({_id: this.userId}, {$set: {menu: 'mine'}}, function(err){
      if(err){
        throw new Meteor.Error(404, 'account creation menu error: ' + err);
      } else{
        //upsert successful
      }
    });
    var self = Meteor.users.findOne({_id: this.userId});
    var name = self.username;
    Meteor.users.update({_id: this.userId}, {$set: {cu: name}}, function(err){
      if(err){
        throw new Meteor.Error(404, 'account creation cu error: ' + err);
      } else{
        //update successful
      }
    });
    //TO-DO INIT
    // mine.insert({user: name, src: "/pics/green_1.gif"}, function(err){
    //   if(err){
    //     throw new Meteor.Error(404, 'account creation mine error: ' + err);
    //   } else{
    //     //insert successful
    //   }
    // });
    // laboratory.insert({user: name, src: "/pics/yel_1.gif"}, function(err){
    //   if(err){
    //     throw new Meteor.Error(404, 'account creation laboratory error: ' + err);
    //   } else{
    //     //insert successful
    //   }
    // });
    // battlefield.insert({user: name, src: "/pics/red_1.gif"}, function(err){
    //   if(err){
    //     throw new Meteor.Error(404, 'account creation battlefield error: ' + err);
    //   } else{
    //     //insert successful
    //   }
    // });
    return "account init OK!";
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// CLIENT /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isClient) {
  Template.login.events({
    'submit #login-form' : function(e, t){
      var name = t.find('#login-name').value;
      var password = t.find('#login-password').value;
        // TO-DO: Trim and validate your fields here
        Meteor.loginWithPassword(name, password, function(err){
          if (err){
            // The user might not have been found, or their passwword could be incorrect.
            $('#login-error').text(err);
            $('#login-error').css({"color":"red", "display":"block"});
          }  else {
            // Everything is all right, login successfull
            switchToGame();
          }
        });
        return false; 
      }
    });

  Template.register.events({
    'submit #register-form' : function(e, t) {
      var name = t.find('#account-name').value;
      var password = t.find('#account-password').value;
      if(checkUsername(name)){
        if(validLength(name)){
          Accounts.createUser({username: name, password: password}, function(err){
            if (err) {
              $('#register-error').text(err);
              $('#register-error').css({"color":"red", "display":"block"});
            } else {
            // Success. Account has been created and the user has logged in successfully. 
            // Now init account data
            Meteor.call('init', function(err){
              if (err) {
                alert(err)
              }
            });
            switchToGame();
          }
        });     
        }
      }
      return false;
    },
    'blur #register-form' : function(e, t) {
      var name = t.find('#account-name').value;
      var password = t.find('#account-password').value;

      //Check for letters / numbers
      if(checkUsername(name)){
        if(validLength(name)){
          $('#register-error').text('OK!');
          $('#register-error').css({"color":"green", "display":"block"});
        } else{
          $('#register-error').text('Your username has to contain at least 6 symbols!');
          $('#register-error').css({"color":"red", "display":"block"});
        }
      } else{
        $('#register-error').text('Your username contains unallowed symbols!');
        $('#register-error').css({"color":"red", "display":"block"});
      }
    }
  });

function switchToGame(){
  var self = Meteor.users.findOne({_id: Meteor.userId()});
  if (self){
    var cu = self.cu;
    var menu = self.menu;
    Router.go('game', {name: cu, menu: menu});
  } else {
    Meteor.call('error', "User not yet defined problem switchToGame", 5000);
  } 
}
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// SERVER /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isServer) {

}