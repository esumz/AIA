/**
 * Created by thaoha on 8/26/14.
 */

/**
 * Check access permission
 *
 * @param user
 * @param resourse
 * @param action
 * @returns {boolean}
 */
exports.check = function(user, resourse, action) {
    var systemRole = user.role || null;
    var userRoles = user.roles || null;

    if (systemRole === 'ROLE_ADMIN') {
        return true;
    }
    var userActions = (userRoles.permissions || false) ? userRoles.permissions[resourse] : null;
    return (userActions && userActions.indexOf(action) != -1) ? true : false;
}