/**
 * Created by thaoha on 9/8/14.
 */

var Post = {

    init: function()
    {
        this.loadMore();
    },

    /**
     * Load more
     *
     * @param toolbar
     */
    loadMore: function()
    {
        var panel = $('#load-more-post');

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
                    $('.blog-posts').append($(data));

                    panel.remove();
                    Post.loadMore();
                }
            });
        });
    }
}

$(document).ready(function() {
    Post.init();
});