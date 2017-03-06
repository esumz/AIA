/**
 * Created by HaThao on 7/9/14.
 */

var AdminCmsCategory = {

    init: function()
    {
        var createForm = $('form', '#create-category-form');
        var table = $('table.list-category');

        this.createGroup(createForm);
        this.editGroup(table);
        this.showModal(createForm);
        AdminMainPage.deleteItem(table);
    },

    showModal: function(form)
    {
        $('.create-category-btn').click(function(e) {
            e.preventDefault();
            form.clearForm();

            $('.modal-title', '#create-category-form').text('Create new category');
            $('#create-category-form').modal('show');
        });
    },

    /**
     * Create new group
     *
     * @param form
     */
    createGroup: function(form)
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
     * Edit group
     *
     * @param table
     */
    editGroup: function(table) {

        $('.edit-item', table).click(function(e) {
            e.preventDefault();

            var editBtn = $(this);
            var modal = $(editBtn.attr('data-modal'));
            var currentItem = editBtn.parents('tr').first();
            var editBox = $('form', modal);

            var data = {
                id: $.trim(currentItem.attr('data-id')),
                name: $.trim($('.name', currentItem).text()),
                alias: $.trim($('.alias', currentItem).text()),
                description: $.trim($('.description', currentItem).text())
            };

            // fill date to modal
            $('input[name=id]', editBox).val(data.id);
            $('input[name=name]', editBox).val(data.name);
            $('input[name=alias]', editBox).val(data.alias);
            $('textarea[name=description]', editBox).val(data.description);

            $('.modal-title', modal).html('Edit category');

            modal.modal('show');
        });
    }
}

$(document).ready(function() {
    AdminCmsCategory.init();
});
