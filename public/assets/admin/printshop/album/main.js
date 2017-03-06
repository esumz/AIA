/**
 * Created by thaoha on 8/27/14.
 */

var AdminAlbum = {

    init: function() {
        var toolBar = $('.table-toolbar.album-list');
        var table = $('table.list-album');

        this.filterAlbum(toolBar);
        this.loadMore(toolBar);
        AdminMainPage.deleteItem(table);
    },

    /**
     * Search product
     *
     * @param toolbar
     */
    filterAlbum: function(toolbar)
    {
        $('.album-filter-btn', toolbar).click(function(e) {
            var searchBtn = $(this);
            var data = {
                published: $('select.album-published-filter', toolbar).val(),
                name: $.trim($('.album-name-filter', toolbar).val())
            }
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
                    var table = $('table.list-album');

                    $('tbody', table).html($(data));
                    AdminMainPage.deleteItem(table);
                }
            });
            e.preventDefault();
        });
    },

    /**
     * Load more
     *
     * @param toolbar
     */
    loadMore: function(toolbar)
    {
        $('a.btn', '.load-more-album').click(function(e) {
            e.preventDefault();
            var searchBtn = $(this);
            var data = {
                published: $('select.album-published-filter', toolbar).val(),
                name: $.trim($('.album-name-filter', toolbar).val()),
                page: searchBtn.attr('data-page')
            }
            searchBtn.attr('data-page', parseInt(data.page)+1);

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
                    var table = $('table.list-album');

                    $('tbody', table).append($(data));
                    AdminMainPage.deleteItem(table);
                }
            });
        });
    }

}

$(document).ready(function() {
    AdminAlbum.init();
});