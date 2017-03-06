/**
 * Created by thaoha on 9/10/14.
 */

var AdminPage = {

    init: function() {
        AdminMainPage.deleteItem($('table.list-page'));
    }
}

$(document).ready(function() {
    AdminPage.init();
});