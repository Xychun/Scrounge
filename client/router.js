Router.configure({
  layout: 'masterlayout',
  loadingTemplate: 'loading',
  // notFoundTemplate: 'NotFound'
})

Router.map( function () {
  this.route('login', {
    path: '/login',
    layoutTemplate: 'masterLayout',
    yieldTemplates:{
      'login': {to: 'center'},
      'register': {to: 'center2'},
    }
  });

  this.route('game', {
    path: '/game/:name/:menu',
    layoutTemplate: 'masterLayout',
    yieldTemplates:{
      'standardBorder': {to: 'border'},
      'gameMiddle': {to: 'middle'},
    }
  });
});