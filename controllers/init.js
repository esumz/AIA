global.mongoose          = require('mongoose');
global.async             = require('async');
global.util              = require('util');
global.admZip            = require('adm-zip');
global.fs                = require('fs');
global.formidable        = require('formidable');
global.passport          = require('passport');
global.thComponent       = require('../components/main.js');
global.fsExtra           = require('fs-extra');
global.facebookStrategy  = require('passport-facebook').Strategy;
global.googleStrategy    = require('passport-google').Strategy;
global.permission        = framework.module('permission');


/**
 * Created by thaoha on 9/8/14.
 */

framework.on('controller', function(self, name) {

    // check admin area
    var adRoute = framework.config['admin-route'];
    if (name.substring(0, adRoute.length) === adRoute && self.user && self.user.role !== 'ROLE_ADMIN') {
        self.cancel();
        self.view401();
        return;
    }
    if (typeof global.thData === 'undefined') {
        global.thData = {
            setting: null,
            menus: null,
            catalogs: null,
            categories: null,
            user: null
        };
    }
    if (!thData.setting) {
        MODEL('setting').schema.get(function (err, setting) {
            thData.setting = setting;
        });
    }
    if (!thData.menus) {
        MODEL('menu').schema.getList({parent: null}, function (err, list) {
            thData.menus = list;
        });
    }
    if (!thData.catalogs) {
        MODEL('ecomCatalog').schema.getListCount({}, function (err, list) {
            thData.catalogs = list;
        });
    }
    if (!thData.categories) {
        MODEL('cmsCategory').schema.getListCount({}, function(err, list) {
            thData.categories = list;
        });
    }
    global.thData['user'] = self.user || null;
});