/**
 * Created by HaThao on 7/9/14.
 */

var AdminEComAttribute = {

    init: function()
    {
        var groupForm = $('form', '#create-attribute-group-form');
        var fieldForm = $('form', '#add-field-group-form');
        var table = $('table.list-attribute-group');

        this.editAttribute(table);
        this.showModal(groupForm);
        this.addFieldShow();
        this.removeField();
        this.selectTypeAction(fieldForm);
        AdminMainPage.submitForm(groupForm, AdminEComAttribute.beforeSubmit);
        AdminMainPage.submitForm(fieldForm);
        AdminMainPage.deleteItem(table);
    },

    showModal: function(form)
    {
        $('.create-attribute-group-btn').click(function(e) {
            e.preventDefault();
            form.clearForm();

            $('.modal-title', '#create-attribute-group-form').text('Create new attribute group');
            $('#create-attribute-group-form').modal('show');
        });
    },

    addFieldShow: function()
    {
        var modal = $('#add-field-group-form');

        $('a.add-field-group:not(.inited)').addClass('inited').click(function(e) {
            e.preventDefault();

            var item = $(this).parents('tr').first();
            var groupId = item.data('id');

            var form = $('form', modal);
            var route = form.attr('data-action');
            form.attr('action', route + groupId);

            $('input', form).each(function(i) {
                $(this).val('');
            });
            $('textarea', form).each(function(i) {
                $(this).val('');
            });
            modal.modal('show');
        });
    },

    removeField: function()
    {
        $('a.remove-field-group:not(.inited)').addClass('inited').click(function(e) {
            e.preventDefault();

            var item = $(this);
            if (item.hasClass('loading')) {
                return false;
            }
            $.ajax({
                url: item.attr('href'),
                type: 'POST',
                dataType: 'JSON',
                beforeSend: function() {
                    item.addClass('loading');
                    item.text('loading');
                },
                success: function(data) {
                    item.removeClass('loading');
                    if (data) {
                        item.parents('li').first().remove();
                    } else {
                        item.text('Delete');
                    }
                }
            })
        });
    },

    /**
     * Create new catalog
     *
     * @param form
     */
    createAttributeGroup: function(form)
    {
        form.ajaxForm({
            dataType: 'JSON',
            beforeSubmit: function() {
                $('button[type=submit]', form).button('loading');
            },
            success: function(data) {
                $('button[type=submit]', form).button('reset');
                if (data == true) {
                    bootbox.alert('Successful');
                    location.reload();
                } else {
                    bootbox.alert('Have something went wrong');
                }
            }
        });
    },

    /**
     * Edit attribute
     *
     * @param table
     */
    editAttribute: function(table)
    {
        $('.edit-item', table).click(function(e) {
            e.preventDefault();

            var editBtn = $(this);
            var modal = $(editBtn.attr('data-modal'));
            var currentItem = editBtn.parents('tr').first();
            var editBox = $('form', modal);

            var data = {
                id: $.trim(currentItem.attr('data-id')),
                name: $.trim($('.name', currentItem).text()),
                description: $.trim($('.description', currentItem).text())
            }

            // fill date to modal
            $('input[name=id]', editBox).val(data.id);
            $('input[name=name]', editBox).val(data.name);
            $('textarea[name=description]', editBox).val(data.description);

            $('.modal-title', modal).html('Edit catalog');

            modal.modal('show');
        });
    },

    selectTypeAction: function(form)
    {
        $('select[name=type]', form).change(function() {
            var value = $(this).val();
            var selectType = ['multiSelect', 'singleSelect', 'selectList'];

            if (selectType.indexOf(value) == -1) {
                $('.value-input', form).hide();
            } else {
                $('.value-input', form).show();
            }
        });
    }
}

$(document).ready(function() {
    AdminEComAttribute.init();
});
