/**
 * Created by HaThao on 7/9/14.
 */

var AdminEComCatalog = {

    init: function()
    {
        var createForm = $('form', '#create-catalog-form');
        var table = $('table.list-catalog');

        this.createCatalog(createForm);
        this.editCatalog(table);
        this.showModal(createForm);
        AdminMainPage.deleteItem(table);
    },

    showModal: function(form)
    {
        $('.create-catalog-btn').click(function(e) {
            e.preventDefault();
            form.clearForm();

            $('.modal-title', '#create-catalog-form').text('Create new catalog');
            $('#create-catalog-form').modal('show');
        });
    },

    /**
     * Create new catalog
     *
     * @param form
     */
    createCatalog: function(form)
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
    editCatalog: function(table)
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
                alias: $.trim($('.alias', currentItem).text()),
                description: $.trim($('.description', currentItem).text()),
                attributeGroup: {
                    name: $.trim($('.attribute-group', currentItem).text()),
                    id: $('.attribute-group', currentItem).attr('data-id')
                }
            };

            // fill date to modal
            $('input[name=id]', editBox).val(data.id);
            $('input[name=name]', editBox).val(data.name);
            $('input[name=alias]', editBox).val(data.alias);
            $('textarea[name=description]', editBox).val(data.description);
            $('.modal-title', modal).html('Edit catalog');

            $('select[name=attributeGroup]>option', editBox).each(function(i) {
                var currentOption = $(this);
                currentOption.attr('selected', false);

                if ($.trim(currentOption.attr('value')) == data.attributeGroup.id) {
                    currentOption.attr('selected', true);
                }
            });
            modal.modal('show');
        });
    }
}

$(document).ready(function() {
    AdminEComCatalog.init();
});
