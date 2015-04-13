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

function validLength(val) {
    return val.length >= 5 ? true : false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// CLIENT /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isClient) {
    Template.login.events({
        'submit #login-form': function(e, t) {
            var name = t.find('#login-name').value;
            var password = t.find('#login-password').value;
            // TO-DO: Trim and validate your fields here
            Meteor.loginWithPassword(name, password, function(err) {
                if (err) {
                    // The user might not have been found, or their passwword could be incorrect.
                    $('#login-error').text(err);
                    $('#login-error').css({
                        "color": "red",
                        "display": "block"
                    });
                } else {
                    // Everything is all right, login successfull
                      switchToGame();
                    
                }
            });
            return false;
        },

        'submit #register-form': function(e, t) {
            var name = t.find('#account-name').value;
            var password = t.find('#account-password').value;
            if (checkUsername(name)) {
                if (validLength(name)) {
                    Accounts.createUser({
                        username: name,
                        password: password
                    }, function(err) {
                        if (err) {
                            $('#register-error').text(err);
                            $('#register-error').css({
                                "color": "red",
                                "display": "block"
                            });
                        } else {
                            // Success. Account has been created and the user has logged in successfully. 
                            // Now init account data
                            Meteor.call('init', function(err) {
                                if (err) {
                                    console.log('account init: ' + err);
                                } else {
                                    switchToGame();
                                }
                            });
                        }
                    });
                }
            }
            return false;
        },
        'blur #register-form': function(e, t) {
            var name = t.find('#account-name').value;
            var password = t.find('#account-password').value;

            //Check for letters / numbers
            if (checkUsername(name)) {
                if (validLength(name)) {
                    $('#register-error').text('OK!');
                    $('#register-error').css({
                        "color": "green",
                        "display": "block"
                    });
                } else {
                    $('#register-error').text('Your username has to contain at least 6 symbols!');
                    $('#register-error').css({
                        "color": "red",
                        "display": "block"
                    });
                }
            } else {
                $('#register-error').text('Your username contains unallowed symbols!');
                $('#register-error').css({
                    "color": "red",
                    "display": "block"
                });
            }
        }
    });


    function switchToGame() {

        preloadImages();

        var self = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                cu: 1,
                menu: 1,
                username: 1
            }
        });
        if (self) {
            if ($(window).width() < 1920) {
                current_resolution = "<1920";
                $("#wrong_resolution").css({
                    "display": "block"
                });
                $("#right_resolution").css({
                    "display": "none"
                });
            }
            if ($(window).width() >= 1920) {
                current_resolution = ">=1920";
                $("#wrong_resolution").css({
                    "display": "none"
                });
                $("#right_resolution").css({
                    "display": "block"
                });
            }
            Router.go('game');
        } else {
            console.log("User not yet defined problem switchToGame");
        }
    }

    function preloadImages() {
      var imgPath;
      //lade die kleinen Bilder
      if ($(window).width() < 1280) {
        imgPath = "/Aufloesung1024xXXX/";
      }

      //lade die mittelgroßen Bilder
      if ($(window).width() < 1920) {
        imgPath = "/Aufloesung1280xXXX/";
      }

      //lade die großen Bilder
      else {
        imgPath = "/Aufloesung1920x1080/";
      }

      var ImgList = new Array();
      ImgList[0] = imgPath+"MegaSpriteSheets/MegaSpriteSheetInterfaceHover.gif";
      ImgList[1] = imgPath+"MegaSpriteSheets/MegaSpriteSheetInterfaceStatic.gif";

      var Images = new Array();

      for (i = 0; i < ImgList.length; i++) 
        { 
          Images[i] = new Image(); 
          Images[i].src = ImgList[i]; 
        } 

      }
}
