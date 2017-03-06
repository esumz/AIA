/**
 * Created by HaThao on 7/18/14.
 */
var FormFileUpload = {

    init: function () {

        // Initialize the jQuery File Upload widget:
        $('#fileupload').fileupload({
            disableImageResize: false,
            autoUpload: false,
            disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator.userAgent),
            // maxFileSize: 5000000,
            // acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
            // Uncomment the following to send cross-domain cookies:
            //xhrFields: {withCredentials: true},
            done: function(data) {

            }
        });

        // Enable iframe cross-domain access via redirect option:
        $('#fileupload').fileupload(
            'option',
            'redirect',
            window.location.href.replace(
                /\/[^\/]*$/,
                '/cors/result.html?%s'
            )
        );

        // Load & display existing files:
        $('#fileupload').addClass('fileupload-processing');
        $.ajax({
            // Uncomment the following to send cross-domain cookies:
            //xhrFields: {withCredentials: true},
            url: $('#fileupload').attr("action"),
            dataType: 'json',
            context: $('#fileupload')[0]
        }).always(function () {
            $(this).removeClass('fileupload-processing');
        }).done(function (result) {
            $(this).fileupload('option', 'done')
                .call(this, $.Event('done'), {result: result});
        });
    }
};

var AdminFileManager = {

    init: function()
    {
        $('.fancybox').fancybox();
        var listFile = $('.file-list-manager');

        this.deleteFile(listFile);
        this.createFolder(listFile);
        this.viewFolder(listFile);
    },

    /**
     * Delete file
     *
     * @param listFile
     */
    deleteFile: function(listFile)
    {
        $('.check-all', listFile).change(function() {
            var $this = $(this);
            var checked = $this.is(':checked') ? true : false;

            $('.file-item', listFile).each(function(i) {
                var checker = $('input[type=checkbox]', $(this));
                checker.attr('checked', checked);
            });
        });

        // Delete file selected
        $('.delete-btn', listFile).click(function() {
            var deleteBtn = $(this);
            var filesDelete = new Array();

            $('.file-item', listFile).each(function() {
                var item = $(this);
                var checker = $('input[type=checkbox]', item);
                if (checker.is(':checked')) {
                    filesDelete.push(item.data('id'));
                }
            });
            if (filesDelete.length < 1) {
                return false;
            }
            $.ajax({
                url: '/admin/file/delete/file',
                data: {
                    files: filesDelete.join(","),
                    folder: listFile.attr('data-folder')
                },
                type: 'POST',
                dataType: 'JSON',
                beforeSend: function() {
                    deleteBtn.button('loading');
                },
                success: function(data) {
                    deleteBtn.button('reset');
                    if (data) {
                        filesDelete.forEach(function(e) {
                            $('.file-item.'+e, listFile).remove();
                        });
                    }
                }
            });
        });
    },

    /**
     * Create folder
     *
     * @param listFile
     */
    createFolder: function(listFile)
    {
        $('.create-folder-btn', listFile).click(function() {
            var createBtn = $(this);
            bootbox.prompt('Folder name', function(folderName) {
                folderName = $.trim(folderName);
                if (folderName == '') {
                    return false;
                }
                $.ajax({
                    url: createBtn.data('route') + folderName,
                    type: 'POST',
                    dataType:'JSON',
                    success: function(status) {
                        if (status) {
                            var item =  '<div class="col-md-3 folder-item">' +
                                        '<p>' +
                                        '    <span class="glyphicon glyphicon-folder-open"></span>' +
                                        '    &nbsp<a href="#">' +folderName+ '</a>' +
                                        '</p>' +
                                        '</div>';
                            $('.panel-body > .list-folder', listFile).prepend($(item));
                            AdminFileManager.viewFolder(listFile);
                        }
                    }
                });
            });
        });
    },

    /**
     * View folder
     *
     * @param listFile
     */
    viewFolder: function(listFile)
    {
        // view root folder
        $('.panel-title:not(.inited)', listFile).addClass('inited').click(function() {
            $('.panel-body > .list-folder', listFile).show();
            $('.panel-body > .list-file', listFile).hide();
            $('.panel-title', listFile).html('List file');
            $('#fileupload').hide();
            $('.create-folder-btn', listFile).show();
            $('.delete-file-panel', listFile).hide();
            listFile.attr('data-folder', '');
        });

        //view folder
        $('.folder-item:not(.inited) a', listFile).addClass('inited').click(function() {
            var folder = $(this).parents('.folder-item').first().data('name');

            $.ajax({
                url: listFile.data('route') + folder,
                type: 'POST',
                beforeSend: function() {

                },
                success: function(list) {
                    $('.panel-body > .list-file', listFile).html($(list)).show();
                    $('.panel-body > .list-folder', listFile).hide();
                    $('input[name=folder]', '#fileupload').val(folder);
                    $('.panel-title', listFile).html('<a href="#">Home</a> / ' + folder);
                    $('#fileupload').show();
                    $('.create-folder-btn', listFile).hide();
                    $('.delete-file-panel', listFile).show();
                    listFile.attr('data-folder', folder);
                }
            });
        });
    }
};

$(document).ready(function() {
    AdminFileManager.init();
    FormFileUpload.init();
});