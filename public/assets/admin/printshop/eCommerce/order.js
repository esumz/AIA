/**
 * Created by HaThao on 7/9/14.
 */

var AdminEComOrder = {

    init: function()
    {
        var table = $('table.list-order');
        var toolBar = $('.table-toolbar.order-list');

        this.filter(toolBar);
        AdminMainPage.deleteItem(table);
    },

    /**
     * Search order
     *
     * @param toolbar
     */
    filter: function(toolbar)
    {
        $('.order-filter-btn', toolbar).click(function(e) {
            var searchBtn = $(this);
            var data = {
                status: $('select.state-filter', toolbar).val()
            };
            $.ajax({
                url: searchBtn.attr('href'),
                type: 'POST',
                dataType: 'HTML',
                data: data,
                beforeSend: function() {
                    searchBtn.button('loading');
                },
                success: function(data) {
                    searchBtn.button('reset');
                    var table = $('table.list-order');

                    $('tbody', table).html($(data));
                    AdminMainPage.deleteItem(table);
                }
            });
            e.preventDefault();
        });
    }

};

$(document).ready(function() {
    AdminEComOrder.init();
});
