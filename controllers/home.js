exports.install = function(framework) {

};

function indexAction() {
	var self = this;
	self.view('main/index', {
        currentUser: self.user
    });
}
