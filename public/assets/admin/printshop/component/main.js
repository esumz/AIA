/**
 * Created by HaThao on 8/18/14.
 */

var AdminComponent = {
    init: function()
    {
        var list = $('table.list-component');
        this.install();
        this.delete(list);
    },

    /**
     * Install component
     */
    install: function()
    {
        $('input.component-upload').fileupload({
            progressall: function (e, data) {
//                var progress = parseInt(data.loaded / data.total * 100, 10);
//                $('#progress .bar').css(
//                    'width',
//                    progress + '%'
//                );
            },
            done: function (e, data) {
                if (data.jqXHR && data.jqXHR['responseText']) {
                    var result = JSON.parse(data.jqXHR['responseText']);
                    if (result.error === false) {
                        location.reload();
                    } else {
                        bootbox.alert(result.message);
                    }
                }
            }
        });
    },

    /**
     * Delete component
     *
     * @param list
     */
    delete: function(list)
    {
        $('.delete.component-action', list).click(function(e) {
            e.preventDefault();
            var btn = $(this);
            var route = btn.data('route');

            bootbox.confirm("Are you sure?", function(ok) {
                if (ok) {
                    $.ajax({
                        url: route,
                        type: 'POST',
                        dataType: 'JSON',
                        beforeSend: function() {
                            btn.html('Deleting');
                        },
                        success: function(data) {
                            if (data === true) {
                                btn.parents('tr').first().remove();
                            }
                            btn.html('Delete');
                        }
                    });
                }
            });
        });
    }
}

$(document).ready(function() {
    AdminComponent.init();
});