Router.configure({
    layout: 'masterlayout',
    // loadingTemplate: 'loading',
    // notFoundTemplate: 'NotFound'
})

Router.map(function() {
    this.route('login', {
        path: '/login',
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

    this.route('game', {
        path: '/game/:name/:menu',
        layoutTemplate: 'masterLayout',

        yieldTemplates: {
            'standardBorder': {
                to: 'border'
            },
            'buyMenu': {
                to: 'buyMenuField'
            },
        },

        //like autorun
        onData: function() {
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
                    backgroundPosition: "0px -306px"
                });
                $('#character').css({
                    backgroundPosition: "0px 0px"
                });
                $("#mineMenu0").attr("src", "/Aufloesung1920x1080/Mine/MineMenuBaseNormal.png");
                $("#battlefieldMenu0").attr("src", "/Aufloesung1920x1080/Battlefield/BattlefieldMenuBaseNormal.png");
                $("#mineMenu1").attr("src", "/Aufloesung1920x1080/Mine/MineMenuBaseNormal.png");
                $("#battlefieldMenu1").attr("src", "/Aufloesung1920x1080/Battlefield/BattlefieldMenuBaseNormal.png");
                $("#right_slider_category").css({
                    backgroundPosition: "-109px 0px"
                });
                $("#left_slider_category").css({
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
                    backgroundPosition: "0px -151px"
                });
                $("#mineMenu0").attr("src", "/Aufloesung1920x1080/Mine/MineMenuScroungeNormal.png");
                $("#battlefieldMenu0").attr("src", "/Aufloesung1920x1080/Battlefield/BattlefieldMenuScroungeNormal.png");
                $("#mineMenu1").attr("src", "/Aufloesung1920x1080/Mine/MineMenuScroungeNormal.png");
                $("#battlefieldMenu1").attr("src", "/Aufloesung1920x1080/Battlefield/BattlefieldMenuScroungeNormal.png");
                $("#right_slider_category").css({
                    backgroundPosition: "-216px 0px"
                });
                $("#left_slider_category").css({
                    backgroundPosition: "-216px 0px"
                });                
            }
        },

        //returns true or false for the array: does NOT stop or pause
        waitOn: function() {
            return [
                Meteor.subscribe("userData"),
                Meteor.subscribe("playerData"),
                Meteor.subscribe("MatterBlocks"),
                Meteor.subscribe("FightArenas"),
                Meteor.subscribe("resources"),
                Meteor.subscribe("mine"),
                Meteor.subscribe("battlefield")
            ];
        },

        action: function() {
            //render if waitOn is true
            if (this.ready()) this.render();
        }
    });
});
