/**
 * Created by HaThao on 7/9/14.
 */

var AdminCmsPost = {

    init: function()
    {
        var createForm = $('form.create-post-form');
        var toolBar = $('.table-toolbar.post-list');
        var table = $('table.list-post');

        if (createForm.length > 0) {
            this.uploadAvatar(createForm);
            this.submitPost(createForm);
            this.addTag();
            this.getAlias(createForm);
            this.initEditor();
        }

        this.filterPost(toolBar);
        this.loadMore(toolBar);
        AdminMainPage.deleteItem(table);
    },

    initEditor: function()
    {
        $('#summernote_1').summernote({
            height: 300,
            onImageUpload: function(files, editor, welEditable) {
                var data = new FormData();
                data.append("file", files[0]);
                data.append('folder', 'post');
                $.ajax({
                    url: '/upload-small-file',
                    data: data,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: 'POST',
                    success: function(url) {
                        editor.insertImage(welEditable, '/uploads/'+url);
                    }
                });
            }
        });

        //$(".form_datetime").datetimepicker({
        //    autoclose: true,
        //    isRTL: Metronic.isRTL(),
        //    format: "dd MM yyyy hh:ii",
        //    pickerPosition: (Metronic.isRTL() ? "bottom-right" : "bottom-left")
        //});
    },

    /**
     * Add tag for post
     */
    addTag: function()
    {
        $('input#tags-post-input').tagsInput({
            width:'100%',
            defaultText:'Add a tag',
            onAddTag: function(tag) {

            },
            onRemoveTag: function(tag) {

            },
            minChars : 3,
            maxChars : 16
        });
    },

    /**
     * Upload avatar for post
     *
     * @param form
     */
    uploadAvatar: function(form)
    {
        $('.post-avatar-upload', form).fileupload({
            formData: {folder: 'post'},
            done: function (e, data) {
                if (data.jqXHR && data.jqXHR['responseText']) {
                    var result = JSON.parse(data.jqXHR['responseText']);
                    $('input[name=avatar]', form).val(result);
                }
            }
        });
    },

    /**
     * Create post
     *
     * @param form
     */
    submitPost: function(form, callback)
    {
        var btnSubmit = $('button[type=submit]', form);

        form.validate({
            rules: {
                title: 'required',
                alias: 'required',
                content: 'required',
                description: 'required'
            },
            invalidHandler: function(event, validator) {

            },
            submitHandler: function(frm) {
                var content = AdminMainPage.stripScripts($.trim($('#summernote_1[name=content]', form).code()));
                $('input[name=files].note-image-input', form).val('');

                $(frm).ajaxSubmit({
                    data: {content: encodeURI(content)},
                    type: 'POST',
                    beforeSend: function() {
                        btnSubmit.button('loading');
                    },
                    success: function(data) {
                        btnSubmit.button('reset');

                        if (data.error === false) {
                            $('input[name=id]', form).val(data.postId);
                            bootbox.alert('Successful');

                            if (typeof callback != 'undefined') {
                                callback();
                            }
                        } else {
                            bootbox.alert('Have something went wrong');
                        }
                    }
                });
            }
        });
    },

    deletePost: function()
    {
        $('.article-item:not(.inited)', '.article-block').each(function(i) {
            var currentItem = $(this);
            currentItem.addClass('inited');

            $('.actions .delete-btn', currentItem).click(function(e) {
                var deleteBtn = $(this);
                if (deleteBtn.hasClass('loading')) {
                    return false;
                }
                $.ajax({
                    url: deleteBtn.attr('href'),
                    type: 'POST',
                    dataType: 'JSON',
                    beforeSend: function() {
                        deleteBtn.addClass('loading');
                    },
                    success: function(data) {
                        deleteBtn.removeClass('loading');
                        if (data) {
                            currentItem.remove();
                        }
                    }
                });
                e.preventDefault();
            });
        });
    },

    filterPost: function(toolbar)
    {
        $('.post-filter-btn', toolbar).click(function(e) {
            var searchBtn = $(this);
            var data = {
                category: $('select.post-category-filter', toolbar).val(),
                published: $('select.post-published-filter', toolbar).val(),
                title: $.trim($('.post-title-filter', toolbar).val())
            }
            $.ajax({
                url: '/admin/cms/post-list',
                type: 'POST',
                dataType: 'HTML',
                data: data,
                beforeSend: function() {
                    searchBtn.button('loading');
                },
                success: function(data) {
                    searchBtn.button('reset');
                    var table = $('table.list-post');

                    $('tbody', table).html($(data));
                    AdminMainPage.deleteItem(table);
                }
            });
            e.preventDefault();
        });
    },

    loadMore: function(toolbar)
    {
        $('a.btn', '.load-more-post').click(function(e) {
            e.preventDefault();
            var searchBtn = $(this);
            var data = {
                category: $('select.post-category-filter', toolbar).val(),
                published: $('select.post-published-filter', toolbar).val(),
                title: $.trim($('.post-title-filter', toolbar).val()),
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
                    $('.article-list-wrap').append($(data));
                    AdminCmsPost.deletePost();
                }
            });
        });
    },

    /**
     * Generate alias
     *
     * @param form
     */
    getAlias: function(form)
    {
        // Check alias
        $('input[name=title]', form).focusin(function() {
            var input = $(this);
            var oldValue = $.trim(input.val());

            input.unbind('focusout').focusout(function() {
                var aliasInput = $('input[name=alias]', form);
                var newValue = $.trim(input.val());
                if (newValue != '' && (newValue != oldValue || $.trim(aliasInput.val() == ''))) {
                    newValue = newValue
                        .toLowerCase()
                        .replace(/ /g,'-')
                        .replace(/[^\w-]+/g,'')
                    ;
                    aliasInput.val(newValue);
                    AdminCmsPost.checkAlias(form);
                }
            });
        });

        $('input[name=alias]', form).focusin(function() {
            var input = $(this);
            var oldValue = $.trim(input.val());

            input.unbind('focusout').focusout(function() {
                var newValue = $.trim(input.val());
                if (newValue != '' && newValue != oldValue) {
                    newValue = newValue
                        .toLowerCase()
                        .replace(/ /g,'-')
                        .replace(/[^\w-]+/g,'')
                    ;
                    input.val(newValue);
                    AdminCmsPost.checkAlias(form);
                } else if (newValue == '') {
                    input.val(oldValue);
                }
            });
        });
    },

    /**
     * Check alias exist
     *
     * @param aliasInput
     */
    checkAlias: function(form)
    {
        var aliasInput = $('input[name=alias]', form);
        var newValue = aliasInput.val();
        if (newValue == '' || aliasInput.data('original') == newValue) {
            return;
        }
        $.ajax({
            url: aliasInput.data('route'),
            type: 'POST',
            dataType: 'JSON',
            data: {
                alias: newValue,
                id: $('input[name=id]', form).val()
            },
            beforeSend: function() {
                aliasInput.addClass('spinner');
            },
            success: function(data) {
                aliasInput.removeClass('spinner');
                var formGroup = aliasInput.parents('.form-group').first();
                var messageBlock = $('.help-block.alias');

                if (data === true) {
                    formGroup.removeClass('has-error');
                    messageBlock.html('');
                } else {
                    formGroup.addClass('has-error');
                    messageBlock.html('This alias is already exist');
                }
            }
        });
    }
};

$(document).ready(function() {
    AdminCmsPost.init();
});
