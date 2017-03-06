/**
 * Created by HaThao on 7/9/14.
 */

var AdminEComProduct = {

    init: function()
    {
        var createForm = $('form.create-product-form');
        var table = $('table.list-product');
        var toolBar = $('.table-toolbar.product-list');

        if (createForm.length > 0) {
            this.uploadAvatar(createForm);
            this.submitProduct(createForm);
            this.addTag();
            this.getAlias(createForm);
            this.initEditor();
        }
        this.filterProduct(toolBar);
        this.loadMore(toolBar);
        this.catalogSelect();
        this.addProductField();
        this.backup();
        this.restore();
        this.changeTab(createForm);
        this.submitAttribute();
        this.submitGallery();
        AdminMainPage.deleteItem(table);
    },

    /**
     * Init editor
     */
    initEditor: function()
    {
        $('#summernote_1').summernote({
            height: 300,
            onImageUpload: function(files, editor, welEditable) {
                var data = new FormData();
                data.append("file", files[0]);
                data.append('folder', 'product');
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
    },

    /**
     * Change tab event
     */
    changeTab: function(productForm)
    {
        $('ul', '.product-tabs').on('shown.bs.tab', function (e) {
            var target = $(e.target).attr("href");

            switch (target) {
                case '#product-attribute-tab':
                    break;
                case '#product-gallery-tab':
                    break;
                case '#product-info-tab':
                    break;
            }
        });
    },

    /**
     * Add tag for post
     */
    addTag: function()
    {
        $('input#tags-product-input').tagsInput({
            width:'100%',
            defaultText:'Add a tag',
            onAddTag: function(tag) {},
            onRemoveTag: function(tag) {},
            minChars : 3,
            maxChars : 16
        });
    },

    /**
     * Upload avatar
     *
     * @param form
     */
    uploadAvatar: function(form)
    {
        $('.product-avatar-upload', form).fileupload({
            formData: {folder: 'product'},
            done: function (e, data) {
                if (data.jqXHR && data.jqXHR['responseText']) {
                    var result = JSON.parse(data.jqXHR['responseText']);
                    $('input[name=avatar]', form).val(result);
                }
            }
        });
    },

    /**
     * Create product
     *
     * @param form
     */
    submitProduct: function(form, callback)
    {
        var btnSubmit = $('button[type=submit]', form);
        form.validate({
            rules: {
                name: 'required',
                alias: 'required',
                price: 'required',
                avatar: 'required'
            },
            invalidHandler: function(event, validator) {

            },
            submitHandler: function(frm) {
                var description = AdminMainPage.stripScripts($.trim($('#summernote_1[name=description]', form).code()));
                $('input[name=files].note-image-input', form).val('');

                $(frm).ajaxSubmit({
                    data: {description: encodeURI(description)},
                    type: 'POST',
                    beforeSend: function() {
                        btnSubmit.button('loading');
                    },
                    success: function(data) {
                        btnSubmit.button('reset');

                        if (data.error === false) {
                            $('input[name=id]', form).val(data.productId);
                            bootbox.alert('Successful');

                            // get route to save attribute
                            var attributeForm = $('.attribute-product-form');
                            var route = attributeForm.data('action') + data.productId;
                            attributeForm.attr('action', route);

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

    /**
     * Search product
     *
     * @param toolbar
     */
    filterProduct: function(toolbar)
    {
        $('.product-filter-btn', toolbar).click(function(e) {
            var searchBtn = $(this);
            var data = {
                catalog: $('select.product-catalog-filter', toolbar).val(),
                published: $('select.product-published-filter', toolbar).val(),
                name: $.trim($('.product-name-filter', toolbar).val())
            };
            $.ajax({
                url: '/admin/e-commerce/product-list',
                type: 'POST',
                dataType: 'HTML',
                data: data,
                beforeSend: function() {
                    searchBtn.button('loading');
                },
                success: function(data) {
                    searchBtn.button('reset');
                    var table = $('table.list-product');

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
        $('a.btn', '.load-more-product').click(function(e) {
            e.preventDefault();
            var searchBtn = $(this);
            var data = {
                catalog: $('select.product-catalog-filter', toolbar).val(),
                published: $('select.product-published-filter', toolbar).val(),
                name: $.trim($('.product-name-filter', toolbar).val()),
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
                    var table = $('table.list-product');

                    $('tbody', table).append($(data));
                    AdminMainPage.deleteItem(table);
                }
            });

        });
    },

    /**
     * Generate attribute form
     */
    catalogSelect: function()
    {
        $('select[name=catalog]').change(function() {
            var catalogId = $(this).val();
            if (catalogId == '') {
                return false;
            }
            $.ajax({
                url: '/admin/e-commerce/attr-generate-form/' + catalogId,
                type: 'POST',
                data: {catalog: true, attrGroup: false},
                success: function(data) {
                    var attributeForm = $('.attribute-product-form');
                    $('.form-body > .field-wrapper', attributeForm).html($(data));
                }
            });
        });

        $('select.select-attribute-group').change(function() {
            var attrGroupId = $(this).val();
            if (attrGroupId == '') {
                return false;
            }
            $.ajax({
                url: '/admin/e-commerce/attr-generate-form/' + attrGroupId,
                type: 'POST',
                data: {catalog: false, attrGroup: true},
                success: function(data) {
                    var attributeForm = $('.attribute-product-form');
                    $('.form-body > .field-wrapper', attributeForm).html($(data));
                }
            });
        });
    },

    /**
     * Submit attribute for product
     */
    submitAttribute: function()
    {
        var form = $('form.attribute-product-form');

        AdminMainPage.submitForm(form, function(arr) {
            if ($('input[name=id]', 'form.create-product-form').val() == '') {
                bootbox.alert('Save product info first');
                $('button[type=submit]', 'form').button('reset');
                $('.product-tabs a[href="#product-info-tab"]').tab('show');
                return false;
            }
        }, function(data) {
            console.log(data);
        });
    },

    /**
     * Submit attribute for product
     */
    submitGallery: function()
    {
        var form = $('form.product-gallery-form');

        AdminMainPage.submitForm(form, function(arr) {
            var productForm = $('form.create-product-form');

            if ($('input[name=id]', productForm).val() == '') {
                bootbox.alert('Save product info first');
                $('button[type=submit]', 'form').button('reset');
                $('.product-tabs a[href="#product-info-tab"]').tab('show');
                return false;
            }
            arr.push({name: 'name', value: $.trim($('input[name=name]', productForm).val())});
            arr.push({name: 'description', value: $.trim($('input[name=description]', productForm).val())});
            arr.push({name: 'productId', value: $('input[name=id]', productForm).val()});

        }, function(data) {
            $('.note-success > p', '#product-gallery-tab').text('This gallery was saved');
        });
    },

    /**
     * New field for product
     */
    addProductField: function()
    {
        var modal = $('#add-field-form');

        $('.add-field-btn', modal).click(function() {
            var fieldName = $('input.field-name', modal);
            var fieldValue = $('textarea.field-value', modal);
            var item = $($('.add-field-data').html());

            var tmpValue = fieldValue.clone();
            var name = $.trim(fieldName.val());
            $('label', item).text(name);

            tmpValue.attr('name', name);
            tmpValue.val(fieldValue.val());
            $('.input-value', item).html(tmpValue);
            $('.field-wrapper', '.attribute-product-form').prepend(item);

            fieldName.val('');
            fieldValue.val('');
            modal.modal('hide');
        });
    },

    /**
     * Backup product
     */
    backup: function()
    {
        $('.backup-product-btn').click(function(e) {
            e.preventDefault();

            var btn = $(this);
            $.ajax({
                url: btn.attr('href'),
                dataType: 'JSON',
                beforeSend: function() {
                    bootbox.alert('Wait a minute. System is saving all of your product.');
                },
                success: function(data) {
                    if (!data.error) {
                        var content = '<h4>Backup Info</h4>' +
                            '<div class="alert alert-info" role="alert">' +
                            'Successful! '+
                            'Download <a href="http://'+data.url+'" class="alert-link">here</a>' +
                            '</div>';
                        bootbox.alert(content);
                    }
                }
            });
        });
    },

    /**
     * Restore product
     */
    restore: function()
    {
        $('.restore-product-btn').click(function(e) {
            e.preventDefault();

            var btn = $(this);
            $.ajax({
                url: btn.attr('href'),
                dataType: 'JSON',
                beforeSend: function() {
                    bootbox.alert('Wait a minute. System is restoring ... This page will be refresh after done.');
                },
                success: function(data) {
                    if (data) {
                        location.reload();
                    }
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
        $('input[name=name]', form).focusin(function() {
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
                    if (newValue != aliasInput.val()) {
                        aliasInput.val(newValue);
                        AdminEComProduct.checkAlias(form);
                    }
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
                    AdminEComProduct.checkAlias(form);
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
    AdminEComProduct.init();
});
