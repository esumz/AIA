/**
 * Created by HaThao on 7/17/14.
 */

var AdminCmsComment = {

    init: function()
    {
        var commentForm = $('form.post-comment-form');
        var table = $('table.list-comment');
        var toolBar = $('.table-toolbar.comment-list');

        this.addComment(commentForm);
        this.addReply();
        this.filterUser(toolBar);
        AdminMainPage.deleteItem(table);
    },

    filterUser: function(toolbar)
    {
        $('.comment-filter-btn', toolbar).click(function(e) {
            var searchBtn = $(this);
            var data = {
                username: $.trim($('.comment-user-filter', toolbar).val())
            }
            $.ajax({
                url: '/admin/cms/comment-list',
                type: 'POST',
                dataType: 'HTML',
                data: data,
                beforeSend: function() {
                    searchBtn.button('loading');
                },
                success: function(data) {
                    searchBtn.button('reset');
                    var listUser = $('table.list-comment');

                    $('tbody', listUser).html($(data));
                    AdminMainPage.deleteItem(listUser);
                }
            });
            e.preventDefault();
        });
    },

    searchUser: function()
    {
        $('.comment-search-data').sieve({
            searchInput: $('input', '.comment-search-wrap'),
            searchLimit: 7
        });
    },

    /**
     * Add comment
     *
     * @param form
     */
    addComment: function(form)
    {
        var btnSubmit = $('button[type=submit]', form);

        form.ajaxForm({
            beforeSubmit: function() {
                btnSubmit.button('loading');
            },
            success: function(data) {
                btnSubmit.button('reset');
                if (data !== false) {
                    $('textarea', form).val('');
                    $('.comment-list-wrap').append($('<hr>'+data));
                    AdminCmsComment.addReply();
                }
            }
        });
    },

    /**
     * Add reply
     */
    addReply: function()
    {
        var replyBoxWrap = $('.reply-box-wrap', '.comment-list-wrap');

        $('.comment-item', '.comment-list-wrap').each(function(i) {
            var item = $(this);
            $('.reply-btn:not(.inited)', item).addClass('inited').click(function(e) {
                e.preventDefault();

                var replyBox = $('.reply-box', item);
                if (replyBox.length > 0) {
                    replyBox.toggle(300);
                } else {
                    replyBox = $(replyBoxWrap.html());
                    $('.media-body', item).append(replyBox);
                }

                // cancel action
                $('.actions .cancel-btn:not(.inited)', item).addClass('inited').click(function(e) {
                    e.preventDefault();
                    replyBox.hide(300);
                });

                // reply action
                $('.actions .reply-btn:not(.inited)', item).addClass('inited').click(function(e) {
                    e.preventDefault();

                    var replyBtn = $(this);

                    $.ajax({
                        url: replyBtn.attr('href'),
                        type: 'POST',
                        data: {
                            type: 'reply',
                            content: $.trim($('textarea.reply-input', replyBox).val()),
                            commentId: item.attr('data-id')
                        },
                        beforeSend: function() {
                            replyBtn.button('loading');
                        },
                        success: function(data) {
                            replyBtn.button('reset');
                            if (data !== false) {
                                $('textarea.reply-input', replyBox).val('');
                                replyBox.hide();

                                var item = $('<hr>'+data);
                                $('.comment-item', item).removeClass('comment-item');
                                $('.reply-btn', item).remove();
                                replyBox.before(item);
                            }
                        }
                    });
                });
            });
        });
    }
}

$(document).ready(function() {
    AdminCmsComment.init();
});
