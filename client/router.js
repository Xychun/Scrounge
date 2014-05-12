Router.configure({
  layout: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'NotFound'
})

Router.map( function () {
  this.route('login', {
    path: '/login',
    layoutTemplate: 'layout',
    yieldTemplates:{
      'login': {to: 'center'},
      'register': {to: 'center2'},
    }
  });

  this.route('game', {
    path: '/game/:name/:menu',
    layoutTemplate: 'masterLayout',
    yieldTemplates:{
      'switchButton': {to: 'topLeftCorner'},
      'otherInventory': {to: 'leftInventory'},
      'socialButton': {to: 'botLeftCorner'},
    }
  });
});