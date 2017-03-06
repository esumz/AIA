/**
 * Created by HaThao on 7/9/14.
 */

var UserMain = {

    init: function()
    {
        this.submitForm($('#login-form'));
        this.submitForm($('#registry-form'));
    },

    /**
     * Login action
     *
     * @param loginBox
     */
    submitForm: function(form, urlCallback)
    {
        form.ajaxForm({
            dataType: 'JSON',
            beforeSubmit: function() {
                $('button[type=submit]', form).button('loading');
            },
            success: function(data) {
                $('button[type=submit]', form).button('reset');
                var alertBox = $('.alert', form);

                if (data === true) {
                    $('.alert-content', alertBox).html('Successful');
                    alertBox.attr('class', 'alert alert-dismissible display-hide alert-success');

                    window.location.assign(urlCallback || '/');
                } else {
                    $('.alert-content', alertBox).html('Have something went wrong');
                    alertBox.attr('class', 'alert alert-dismissible display-hide alert-warning');
                }
                alertBox.show();
            }
        });
    }
};

$(document).ready(function() {
    UserMain.init();
});
