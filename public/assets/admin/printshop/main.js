/**
 * Created by HaThao on 7/18/14.
 */

var AdminMainPage = {

    init: function()
    {
        if ($('.dashboard-stats-block').length) {
            this.getInfo();
        }

        if ($('.new-data-stat').length) {
            this.getNewData();
        }
    },

    getInfo: function()
    {
        var userBlock = $('.stats-user', '.dashboard-stats-block');
        var siteBlock = $('.stats-site', '.dashboard-stats-block');
        var productBlock = $('.stats-product', '.dashboard-stats-block');
        var postBlock = $('.stats-post', '.dashboard-stats-block');
        var commentBlock = $('.stats-comment', '.dashboard-stats-block');

        $.ajax({
            url: '/admin/get-system-info',
            type: 'POST',
            dataType: 'JSON',
            success: function(data) {
                $('.number', userBlock).text(data.numberOfUser);
                $('.number', siteBlock).text(data.numberOfSite);
                $('.number', productBlock).text(data.numberOfProduct);
                $('.number', postBlock).text(data.numberOfPost);
                $('.number', commentBlock).text(data.numberOfComment);
            }
        });
    },

    getNewData: function()
    {
        var newDataBlock = $('.tab-content', '.new-data-stat');

        $.ajax({
            url: '/admin/get-new-data',
            type: 'POST',
            success: function(data) {
                newDataBlock.html($(data));
            }
        });
    },

    /**
     * Delete item on table
     *
     * @param table
     */
    deleteItem: function(table)
    {
        $('.delete:not(.inited)', table).addClass('inited').click(function(e) {
            e.preventDefault();
            var btn = $(this);
            bootbox.confirm('Are you sure to delete?', function(result) {
                if (result == true && !btn.hasClass('loading')) {
                    $.ajax({
                        url: btn.attr('data-route'),
                        dataType: 'JSON',
                        type: 'POST',
                        beforeSend: function() {
                            btn.addClass('loading');
                            btn.html('Deleting');
                        },
                        success: function(status) {
                            btn.removeClass('loading');
                            btn.html('Delete');
                            if (status == true) {
                                var nRow = btn.parents('tr')[0];
                                nRow.remove();
                            }
                        }
                    });
                }
            });
        });
    },

    stripScripts: function(s) {
        var div = document.createElement('div');
        div.innerHTML = s;
        var scripts = div.getElementsByTagName('script');
        var i = scripts.length;
        while (i--) {
            scripts[i].parentNode.removeChild(scripts[i]);
        }
        return div.innerHTML;
    },

    /**
     * Filter form data
     *
     * @param form
     */
    filterFormData: function(arr) {
        for (var key in arr) {
            arr[key].value = AdminMainPage.stripScripts($.trim(arr[key].value));
        }
        return arr;
    },

    /**
     * Submit form by ajax
     *
     * @param form
     */
    submitForm: function(form, beforeSubmit, fnCallback)
    {
        form.ajaxForm({
            dataType: 'JSON',
            beforeSubmit: function(arr) {
                $('button[type=submit]', form).button('loading');
                if (typeof beforeSubmit != 'undefined') {
                    return beforeSubmit(arr);
                }
            },
            success: function(data) {
                $('button[type=submit]', form).button('reset');
                var message = data === true ? 'Successful' : 'Have something went wrong';
                bootbox.alert(message);

                if (typeof fnCallback != 'undefined') {
                    fnCallback(data);
                } else if (data === true) {
                    location.reload();
                }
            }
        });
    }
}

$(document).ready(function() {
    AdminMainPage.init();
});