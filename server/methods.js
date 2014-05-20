////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// SERVER /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

if (Meteor.isServer) {
  //Methods
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
    
    mine.insert({user: name, value: 100, slots: 3, remaining: 45}, function(err){
      if(err){
        throw new Meteor.Error(404, 'account creation mine error: ' + err);
      } else{
        //insert successful
      }
    });
    laboratory.insert({user: name, value: 100, slots: 3, remaining: 45}, function(err){
      if(err){
        throw new Meteor.Error(404, 'account creation laboratory error: ' + err);
      } else{
        //insert successful
      }
    });
    battlefield.insert({user: name, value: 100, slots: 3, remaining: 45}, function(err){
      if(err){
        throw new Meteor.Error(404, 'account creation battlefield error: ' + err);
      } else{
        //insert successful
      }
    });
    return "account init OK!";
  }
  });
}