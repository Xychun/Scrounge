Router.configure({
    layout: 'masterlayout',
    loadingTemplate: 'loading',
    // notFoundTemplate: 'NotFound'
})

Router.map(function() {
    this.route('login', {
        path: '/login',
        layoutTemplate: 'masterLayout',
        yieldTemplates: {
            'login': {
                to: 'center'
            },
            'register': {
                to: 'center2'
            },
        },
        // action: function() {
        //     if (gameRenderer) gameRenderer.stop();
        // }
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
            } else {
                Router.current().render(menu + 'Scrounge', {
                    to: 'middle'
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

        /*
    action: function () {

      this.render('standardBorder', {to: 'border'});
      this.render('mineMiddle', {to: 'middle'});

      console.log(getRenderPara("buyMenu"));
    },*/
    });
});
