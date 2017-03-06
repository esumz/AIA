/**
 * Created by HaThao on 7/9/14.
 */

var AdminCmsTag = {

    init: function()
    {
        var form = $('form', '#create-tag-form');
        var table = $('table.list-tag');

        AdminMainPage.deleteItem(table);
        this.createTag(form);
    },

    /**
     * Create new tag
     *
     * @param form
     */
    createTag: function(form)
    {
        form.ajaxForm({
            dataType: 'JSON',
            beforeSubmit: function() {
                $('button[type=submit]', form).button('loading');
            },
            success: function(data) {
                $('button[type=submit]', form).button('reset');
                var alertBox = $('.alert', form);

                if (data == true) {
                    $('.alert-content', alertBox).html('Successful');
                    alertBox.addClass('alert-success');

                    location.reload();
                } else {
                    $('.alert-content', alertBox).html('Have something went wrong');
                    alertBox.addClass('alert-warning');
                }
                alertBox.show();
            }
        });
    }
}

$(document).ready(function() {
    AdminCmsTag.init();
});
