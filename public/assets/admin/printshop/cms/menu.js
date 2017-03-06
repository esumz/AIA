/**
 * Created by HaThao on 7/9/14.
 */

var AdminCmsMenu = {

    init: function()
    {
        var createForm = $('form', '#create-menu-form');
        var table = $('table.list-menu');

        this.createMenu(createForm);
        this.editMenu(table);
        this.showModal(createForm);
        AdminMainPage.deleteItem(table);
    },

    /**
     *
     * @param form
     */
    showModal: function(form)
    {
        $('.create-menu-btn').click(function(e) {
            e.preventDefault();
            form.clearForm();

            $('.modal-title', '#create-menu-form').text('Create new menu');
            $('#create-menu-form').modal('show');
        });

        $('.page-select select', form).change(function() {
            $('input[name=value]', form).val($(this).val());
        });
    },

    /**
     * Create new menu
     *
     * @param form
     */
    createMenu: function(form)
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
     * Edit menu
     *
     * @param table
     */
    editMenu: function(table) {

        $('.edit-item', table).click(function(e) {
            e.preventDefault();

            var editBtn = $(this);
            var modal = $(editBtn.attr('data-modal'));
            var currentItem = editBtn.parents('tr').first();
            var editBox = $('form', modal);

            var data = {
                id: currentItem.attr('data-id'),
                name: $.trim($('.name', currentItem).text()),
                type: $.trim($('.type', currentItem).text()),
                parent: $('.parent', currentItem).data('id')
            }

            // fill date to modal
            $('input[name=id]', editBox).val(data.id);
            $('input[name=name]', editBox).val(data.name);

            $('select[name=parent]>option', editBox).each(function(i) {
                var currentOption = $(this);
                currentOption.attr('selected', false);

                if (currentOption.attr('value') == data.parent) {
                    currentOption.attr('selected', true);
                }
            });
            $('.modal-title', modal).html('Edit menu');
            modal.modal('show');
        });
    }
}

$(document).ready(function() {
    AdminCmsMenu.init();
});
