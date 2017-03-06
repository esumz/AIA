/**
 * Created by thaoha on 9/8/14.
 */

var Product = {

    init: function()
    {
        this.loadMore();
        Layout.initOWL();
        Layout.initImageZoom();
        Layout.initTouchspin();
    },

    /**
     * Load more
     *
     * @param toolbar
     */
    loadMore: function()
    {
        var panel = $('#load-more-product');

        $('a.btn', panel).click(function(e) {
            e.preventDefault();
            var searchBtn = $(this);

            $.ajax({
                url: searchBtn.attr('href'),
                type: 'POST',
                dataType: 'HTML',
                data: {
                    page: parseInt(searchBtn.attr('data-page')) + 1
                },
                beforeSend: function() {
                    searchBtn.button('loading');
                },
                success: function(data) {
                    searchBtn.button('reset');
                    $('.list-product').append($(data));

                    panel.remove();
                    Product.loadMore();
                    Order.add();
                }
            });
        });
    }
}

$(document).ready(function() {
    Product.init();
});