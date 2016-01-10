///// IMPROVEMENTS /////
    Template.improvements.onCreated(function() {

        // console.log('createImprovementStart');
        //console.time('createImprovement');
        var inst = this;
        inst.state = new ReactiveDict();
        var cursorSelf = Meteor.users.findOne({
            _id: Meteor.userId()
        }, {
            fields: {
                menu: 1,
                username: 1,
                cu: 1,
                _id: 0
            }
        });
        var self = cursorSelf.username;
        var currentUser = cursorSelf.cu;
        var menu = cursorSelf.menu;
        inst.autorun(function() {
            var subsPlayerDataImprovements = inst.subscribe('playerDataImprovements' + menu, self);
            if (subsPlayerDataImprovements.ready()) {

                //set Data Context for other helpers
                inst.state.set('self', self);
                inst.state.set('currentUser', currentUser);
                inst.state.set('menu', menu);
                //console.timeEnd('createImprovement');
                //console.timeEnd('SWITCH CATEGORY4');
                //console.timeEnd('LOGINI');
            }

        })
    });

    Template.improvements.helpers({
        improvement: function() {
            //get Data Context
            var self = Template.instance().state.get('self');
            var cu = Template.instance().state.get('currentUser');
            var menu = Template.instance().state.get('menu');
            var color = "firebrick";
            if (cu == self) {
                cu = 'YOUR BASE';
                color = "green";
            }
            var cursorPlayerData = playerData.findOne({
                user: self
            });
            obj0 = {};
            obj0['color'] = color;
            obj0['name'] = cu;
            obj0['xp'] = Math.floor(cursorPlayerData.XP) + '/' + cursorPlayerData.requiredXP;
            obj0['level'] = cursorPlayerData.level;
            if (cursorPlayerData[menu]) {
                obj0['science'] = cursorPlayerData[menu].science;
                obj0['item'] = cursorPlayerData[menu].scrItem.benefit;
            }
            // //console.timeEnd("LOGINHELPER5");
            return obj0;
        }
    });