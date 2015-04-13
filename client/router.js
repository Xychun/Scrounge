Router.configure({
    layout: 'masterlayout',
    // loadingTemplate: 'loading',
    // notFoundTemplate: 'NotFound'
})


Router.route('login', {
    path: '/',
    layoutTemplate: 'masterLayout',
    yieldTemplates: {
        'login': {
            to: 'middle'
        },
        /*            'register': {
                to: 'middle'
            },*/
    },
});

Router.route('game', {
    path: '/game',
    layoutTemplate: 'masterLayout',
    yieldTemplates: {
        'standardBorder': {
            to: 'border'
        },
        'buyMenu': {
            to: 'buyMenuField'
        },
    },
    onBeforeAction: function() {
        //get the TIME ZONE difference (not the ping!)
        timeClient = new Date();
        timeServer = TimeSync.serverTime(Date.now());
        timeDifference = Math.round((timeClient - timeServer) / 10000) * 10000;
        this.next();
    },
    // a place to put your subscriptions
    subscriptions: function() {
        // add the subscription to the waitlist
        this.subscribe("userData").wait();
        this.subscribe("playerData").wait();
        this.subscribe("MatterBlocks").wait();
        this.subscribe("FightArenas").wait();
        this.subscribe("resources").wait();
        this.subscribe("mine").wait();
        this.subscribe("battlefield").wait();        
    },
    action: function() {
        if (this.ready()) {
            this.render();
            var self = Meteor.users.findOne({
                _id: Meteor.userId()
            }, {
                fields: {
                    menu: 1,
                    cu: 1,
                    username: 1
                }
            });
            var cu = self.cu;
            var menu = self.menu;
            //in your own menu? base:scrounge
            if (cu == self.username) {
                Router.current().render(menu + 'Base', {
                    to: 'middle'
                });
                //change menu colors to green
                $('#scrounge').css({
                    backgroundPosition: "0px -303px"
                });
                $('#character').css({
                    backgroundPosition: "0px 0px"
                });
                $(".category_1").attr("src", "/Aufloesung1920x1080/Mine/MineMenuBaseNormal.png");
                $(".category_3").attr("src", "/Aufloesung1920x1080/Battlefield/BattlefieldMenuBaseNormal.png");
                $("#category_right").css({
                    backgroundPosition: "-109px 0px"
                });
                $("#category_left").css({
                    backgroundPosition: "-109px 0px"
                });
            } else {
                Router.current().render(menu + 'Scrounge', {
                    to: 'middle'
                });
                //change menu colors to red
                $('#scrounge').css({
                    backgroundPosition: "0px 0px"
                });
                $('#character').css({
                    backgroundPosition: "0px -152px"
                });
                $(".category_1").attr("src", "/Aufloesung1920x1080/Mine/MineMenuScroungeNormal.png");
                $(".category_3").attr("src", "/Aufloesung1920x1080/Battlefield/BattlefieldMenuScroungeNormal.png");
                $("#category_right").css({
                    backgroundPosition: "-216px 0px"
                });
                $("#category_left").css({
                    backgroundPosition: "-216px 0px"
                });
            }
        }
    }
});
