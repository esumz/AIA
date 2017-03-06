/**
 * Created by HaThao on 7/9/14.
 */

var AdminUserMain = {

    init: function()
    {
        var loginForm = $('#admin-login-box');
        var createForm = $('form', '#create-user-form');
        var table = $('table.list-user');
        var toolBar = $('.table-toolbar.user-list');

        this.loginAction(loginForm);
        this.createUser(createForm);
        this.editUser(table);
        this.loadMore(toolBar);
        this.filterUser(toolBar);
        this.backup();
        this.restore();
        AdminMainPage.deleteItem(table);
    },

    /**
     * Login action
     *
     * @param loginBox
     */
    loginAction: function(loginForm)
    {
        loginForm.ajaxForm({
            dataType: 'JSON',
            beforeSubmit: function() {
                $('button[type=submit]', loginForm).button('loading');
            },
            success: function(data) {
                $('button[type=submit]', loginForm).button('reset');
                var alertBox = $('.alert', loginForm);

                if (data == true) {
                    $('.alert-content', alertBox).html('Successful');
                    alertBox.addClass('alert-success');

                    window.location.assign("/admin");
                } else {
                    $('.alert-content', alertBox).html('Email or password wrong');
                    alertBox.addClass('alert-warning');
                }
                alertBox.show();
            }
        });
    },

    /**
     * Create new user
     *
     * @param form
     */
    createUser: function(form)
    {
        form.ajaxForm({
            dataType: 'JSON',
            beforeSubmit: function() {
                $('button[type=submit]', form).button('loading');
            },
            success: function(data) {
                $('button[type=submit]', form).button('reset');
                var alertBox = $('.alert', form);

                if (data == true) {
                    $('.alert-content', alertBox).html('Successful');
                    alertBox.addClass('alert-success');

                    location.reload();
                } else {
                    $('.alert-content', alertBox).html('Have something went wrong');
                    alertBox.addClass('alert-warning');
                }
                alertBox.show();
            }
        });
    },

    /**
     * Edit user
     *
     * @param table
     */
    editUser: function(table) {

        $('.edit-item', table).click(function(e) {
            e.preventDefault();

            var editBtn = $(this);
            var modal = $(editBtn.attr('data-modal'));
            var currentItem = editBtn.parents('tr').first();
            var editBox = $('form', modal);
            var route = editBtn.attr('data-route');

            var data = {
                id: $.trim(currentItem.attr('data-id')),
                firstName: $.trim($('.first-name', currentItem).text()),
                lastName: $.trim($('.last-name', currentItem).text()),
                email: $.trim($('.email', currentItem).text()),
                isActive: $.trim($('.is-active', currentItem).text()),
                group: {
                    name: $.trim($('.group', currentItem).text()),
                    id: $('.group', currentItem).attr('data-id')
                }
            }

            // fill date to modal
            $('input[name=id]', editBox).val(data.id);
            $('input[name=firstName]', editBox).val(data.firstName);
            $('input[name=lastName]', editBox).val(data.lastName);
            $('input[name=email]', editBox).val(data.email);

            if (data.isActive == 'true') {
                $('#uniform-inputActive>span', editBox).addClass('checked');
            }
            $('.modal-title', modal).html('Edit user');

            $('select[name=group]>option', editBox).each(function(i) {
                var currentOption = $(this);
                currentOption.attr('selected', false);

                if ($.trim(currentOption.attr('value')) == data.group.id) {
                    currentOption.attr('selected', true);
                }
            });

            modal.modal('show');
        });
    },

    filterUser: function(toolbar)
    {
        $('.user-filter-btn', toolbar).click(function(e) {
            var searchBtn = $(this);

            var data = {
                group: $('select.user-group-filter', toolbar).val(),
                isActive: $('select.user-active-filter', toolbar).val(),
                email: $.trim($('.user-email-filter', toolbar).val())
            }

            $.ajax({
                url: '/admin/user/list',
                type: 'POST',
                dataType: 'HTML',
                data: data,
                beforeSend: function() {
                    searchBtn.button('loading');
                },
                success: function(data) {
                    searchBtn.button('reset');
                    var listUser = $('table.list-user');

                    $('tbody', listUser).html($(data));
                    AdminUserMain.editUser(listUser);
                    AdminMainPage.deleteItem(listUser);
                }
            });

            e.preventDefault();
        });
    },

    loadMore: function(toolbar)
    {
        $('a.btn', '.load-more-user').click(function(e) {
            e.preventDefault();

            var searchBtn = $(this);

            var data = {
                group: $('select.user-group-filter', toolbar).val(),
                isActive: $('select.user-active-filter', toolbar).val(),
                email: $.trim($('.user-email-filter', toolbar).val()),
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
                    var listUser = $('table.list-user');

                    $('tbody', listUser).append($(data));
                    AdminUserMain.editUser(listUser);
                    AdminMainPage.deleteItem(listUser);
                }
            });

        });
    },

    /**
     * Backup user
     */
    backup: function()
    {
        $('.backup-user-btn').click(function(e) {
            e.preventDefault();

            var btn = $(this);
            $.ajax({
                url: btn.attr('href'),
                dataType: 'JSON',
                beforeSend: function() {
                    bootbox.alert('Wait a minute. System is saving all of your user.');
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
     * Restore user
     */
    restore: function()
    {
        $('.restore-user-btn').click(function(e) {
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
    }
}

$(document).ready(function() {
    AdminUserMain.init();
});
