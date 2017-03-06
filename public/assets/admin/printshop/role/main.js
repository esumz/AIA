/**
 * Created by thaoha on 8/25/14.
 */

var AdminUserRole = {

    init: function()
    {
        var form = $('#create-role-form');
        var table = $('table.list-role');

        this.generatePermission();
        this.save(form);
        this.edit(table);
        AdminMainPage.deleteItem(table);
    },

    /**
     * Create permission tree
     */
    generatePermission: function()
    {
        $('#permission-tree').jstree({
            'plugins': ["wholerow", "checkbox", "types"],
            'core': {
                "themes" : {
                    "responsive": false
                }
            },
            "types" : {
                "default" : {
                    "icon" : "fa fa-folder icon-state-warning icon-lg"
                },
                "file" : {
                    "icon" : "fa fa-file icon-state-warning icon-lg"
                }
            }
        });
    },

    /**
     * Get permission data
     */
    getPermission: function(data)
    {
        var tree = $('#permission-tree');
        var selectedNodes = tree.jstree(true).get_selected('full');
        data = data || new Object();

        selectedNodes.forEach(function(node) {
            if (node.data.type == 'action') {
                var parent = $('#'+node.parent, tree);
                if (typeof data[parent.data('name')] == 'undefined')
                    data[parent.data('name')] = new Array();
                data[parent.data('name')].push(node.data.name);
            }
        });
        return data;
    },

    /**
     * Save role
     *
     * @param form
     */
    save: function(form)
    {
        $('.create-role-btn').click(function(e) {
            e.preventDefault();

            var tree = $('#permission-tree');
            var modal = $($(this).data('target'));

            tree.jstree(true).deselect_all();
            tree.jstree(true).close_all();
            $('.modal-title', modal).text('Add new role');
            $('input[name=id]', modal).val('');
            $('input[name=name]', form).val('');
            $('textarea[name=description]', form).val('');
            modal.modal('show');
        });

        form.ajaxForm({
            beforeSubmit: function(arr, $form, options) {
                var data = AdminUserRole.getPermission();
                arr.push({
                    name: 'permissions',
                    value: JSON.stringify(data)
                });
                $('button[type=submit]', form).button('loading');
            },
            success: function(data) {
                $('button[type=submit]', form).button('reset');
                if (data === true) {
                    window.location.reload();
                } else {
                    bootbox.alert('Have something wrong');
                }
            }
        });
    },

    /**
     * Edit role
     */
    edit: function(table)
    {
        $('.edit-item', table).click(function(e) {
            e.preventDefault();

            var modal = $('#create-role-form');
            var tree = $('#permission-tree');
            var item = $(this).parents('tr').first();
            var data = {
                name: $.trim($('.name', item).text()),
                description: $.trim($('.description', item).text())
            }
            tree.jstree(true).deselect_all();
            $('.permissions', item).each(function() {
                var self = $(this);
                var parent = $('li[data-name='+self.data('name')+']', tree);
                var actions = self.val().split(',');

                if (actions.length) {
                    tree.jstree(true).open_node(parent);

                    actions.forEach(function(action) {
                        tree.jstree(true).select_node($('li[data-name='+action+']', 'li[data-name='+self.data('name')+']'));
                    });
                }

            });
            $('.modal-title', modal).text('Edit new role');
            $('input[name=id]', modal).val(item.data('id'));
            $('input[name=name]', modal).val(data.name);
            $('textarea[name=description]', modal).val(data.description);
            modal.modal('show');
        });
    }
}

$(document).ready(function() {
    AdminUserRole.init();
});