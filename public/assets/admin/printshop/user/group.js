/**
 * Created by HaThao on 7/9/14.
 */

var AdminGroup = {

    init: function()
    {
        var createForm = $('form', '#create-group-form');
        var table = $('table.list-group');

        this.createCategory(createForm);
        this.editCategory(table);
        this.showModal(createForm);
        this.roleAction();
        AdminMainPage.deleteItem(table);
    },

    /**
     * Show modal create group
     *
     * @param form
     */
    showModal: function(form)
    {
        $('.create-group-btn').click(function(e) {
            $('input', form).each(function(i) {
                $(this).val('');
            });

            $('textarea', form).each(function(i) {
                $(this).val('');
            });

            $('.modal-title', '#create-group-form').text('Create new group');
            $('#create-group-form').modal('show');

            e.preventDefault();
        });
    },

    /**
     * Create new category
     *
     * @param form
     */
    createCategory: function(form)
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
     * Edit category
     *
     * @param table
     */
    editCategory: function(table)
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
            $('.bs-select').selectpicker('deselectAll');
            $('input[name=id]', editBox).val(data.id);
            $('input[name=name]', editBox).val(data.name);
            $('textarea[name=description]', editBox).val(data.description);
            $('.modal-title', modal).html('Edit group');

            modal.modal('show');
        });
    },

    /**
     * Role action
     */
    roleAction: function()
    {
        $('.bs-select').selectpicker({
            iconBase: 'fa',
            tickIcon: 'fa-check'
        });
    }
}

$(document).ready(function() {
    AdminGroup.init();
});
