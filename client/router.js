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
            'mineBuyMenu': {
                to: 'buyMenu'
            },
            'mapSimulation': {
                to: 'rightSideTest'
            },
        },

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
            if (cu == self.username) {
                Router.current().render('mineBase', {
                    to: 'middle'
                });
            } else {
                Router.current().render('mineScrounge', {
                    to: 'middle'
                });
            }
        },

        waitOn: function() {
            return [
                Meteor.subscribe("userData"),
                Meteor.subscribe("playerData"),
                Meteor.subscribe("MatterBlocks"),
                Meteor.subscribe("resources"),
                Meteor.subscribe("mine")
            ];
        },

        action: function() {
            if (this.ready()) this.render();
        }

        /*
    action: function () {

      this.render('standardBorder', {to: 'border'});
      this.render('mineMiddle', {to: 'middle'});

      console.log(getRenderPara("mineBuyMenu"));
    },*/
    });
});
