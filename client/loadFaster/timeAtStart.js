////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// CLIENT /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

// Meteor File Loading Order:
// Files in [project_root]/lib are loaded first
// Files are sorted by directory depth. Deeper files are loaded first.
// Files are sorted in alphabetical order.
// main.* files are loaded last.

if (Meteor.isClient) {
    //get the TIME ZONE difference (not the ping!)
    Meteor.call("getServerTime", function(err, result) {
        timeClient = new Date();
        timeServer = result;
        timeDifference = timeClient - timeServer;
        // console.log(timeDifference);
        // console.log('timeServer' + timeServer.getTime());
    });
}
