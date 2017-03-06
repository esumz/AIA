/**
 * Created by HaThao on 7/9/14.
 */

var UserProfile = {

    init: function()
    {
        var profileForm = $('form.profile-info-form');
        var passwordForm = $('form.profile-password-form');
        var avatarForm = $('form#profileChangeAvatar');

        this.updateProfile(profileForm);
        this.updateProfile(passwordForm, true);
        this.updateProfile(avatarForm);
    },

    /**
     * Edit user
     *
     * @param table
     */
    updateProfile: function(form, clear) {
        clear = clear || false;

        form.ajaxForm({
            dataType: 'JSON',
            beforeSubmit: function () {
                $('button[type=submit]', form).button('loading');
            },
            success: function (data) {
                $('button[type=submit]', form).button('reset');
                var alertBox = $('.alert', form);

                if (data === true) {
                    $('.alert-content', alertBox).html('Successful');
                    alertBox.removeClass('alert-warning').addClass('alert-success');

                    if (clear) {
                        form.clearForm();
                    }
                } else {
                    $('.alert-content', alertBox).html('Have something went wrong');
                    alertBox.removeClass('alert-success').addClass('alert-warning');
                }
                alertBox.show();
            }
        });
    }
};

$(document).ready(function() {
    UserProfile.init();
});
