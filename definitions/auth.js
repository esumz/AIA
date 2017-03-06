/**
 * Created by thaoha on 8/23/14.
 */

framework.on('install', function(type, name) {

    //if (type !== 'module' && name !== 'auth')
    //    return;
    //
    //var auth = MODULE('auth');
    //
    //auth.onAuthorization = function(id, callback, flags) {
    //
    //    // - this function is cached
    //    // - here you must read user information from a database
    //    // - insert the user object into the callback (this object will be saved to session/cache)
    //    callback({ id: '1', alias: 'Peter Sirka', roles: ['admin'] });
    //
    //    // if user not exist then
    //    // callback(null);
    //};

});

// Documentation: http://docs.totaljs.com/Framework/#framework.on('controller')
framework.on('controller', function(self, name) {

    var user = self.user;
    if (user === null)
        return;

//    var length = user.roles.length;
//    for (var i = 0; i < length; i++) {
//
//        var role = '!' + user.roles[i];
//        if (self.flags.indexOf(role) === -1) {
//
//            // cancel executing of controller
//            self.cancel();
//
//            // redirect
//            self.redirect('/you-do-not-have-permission/')
//            return;
//        }
//
//    }
});
