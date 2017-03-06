exports.install = function(framework, options) {
    framework.route('#400', error400);
    framework.route('#401', error401);
    framework.route('#403', error403);
    framework.route('#404', error404);
    framework.route('#408', error408);
    framework.route('#431', error431);
    framework.route('#500', error500);
    framework.route('#501', error501);
};

// Bad Request
function error400() {
    var self = this;
    self.status = 400;
    self.view('~/error/400');
}

// Unauthorized
function error401() {
    var self = this;
    self.status = 401;
    self.view('~/error/401');
}

// Forbidden
function error403() {
    var self = this;
    self.status = 403;
    self.view('~/error/403');
}

// Not Found
function error404() {
    var self = this;
    self.status = 404;
    self.view('~/error/404');
}

// Request Timeout
function error408() {
    var self = this;
    self.status = 408;
    self.view('~/error/408');
}

// Request Header Fields Too Large
function error431() {
    var self = this;
    self.status = 431;
    self.view('~/error/431');
}

// Internal Server Error
function error500() {
    var self = this;
    self.status = 500;
    self.view('~/error/500');
}

// Not Implemented
function error501() {
    var self = this;
    self.status = 501;
    self.view('~/error/501');
}