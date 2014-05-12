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
      'errors': {to: 'bottom'}
    }
  });

  this.route('game', {
    path: '/game/:name/:menu',
    layoutTemplate: 'layout',
    yieldTemplates:{
      'menus': {to: 'top'},
      'dummies': {to: 'left'},
      'account': {to: 'right'},
      'content': {to: 'center'},
      'errors': {to: 'bottom'}
    }
  });
});