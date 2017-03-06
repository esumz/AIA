/**
 * Created by HaThao on 8/8/14.
 */

var AdminEcomBlock = {

    init: function()
    {
        var table = $('table.list-block');

        $('.btn.create-block-btn').click(function() {
            $('.modal.block-create-modal').modal('show');
        });

        this.changePreview();
        this.saveBlock();
        AdminMainPage.deleteItem(table);
    },

    /**
     * Change preview
     */
    changePreview: function()
    {
        var block = $('.block-preview', '#block-view-content');

        $('.property-value', '#tool-box-block').change(function() {
            var self = $(this);
            var value = self.val();

            switch (self.attr('name')) {
                case 'column':
                    if (value > 0 && value < 13) {
                        block.attr('class', 'block-preview col-md-'+value);
                    }
                    break;
                case 'height':
                    if (value > 0) {
                        block.height(value);
                    }
                    break;
                case 'type':
                    AdminEcomBlock.changeType(value);
                    break;
                case 'style':
                    AdminEcomBlock.changeStyle(value);
                    break;
            }
        });

        // add html
        $('.save-html-btn').click(function() {
            var html = $('textarea.html-input').val();
            $('.block-preview').html($(html));
            $('.add-html-panel').hide();
        });
    },

    changeType: function(value)
    {
        if (value == 'html') {
            $('.add-html-panel').show();
        } else {
            $('.add-html-panel').hide();
        }

        $('option', 'select[name=style]').hide();
        $('option.'+value, 'select[name=style]').show();
        $('select[name=style]').val('');
    },

    /**
     * Get style preview
     * @param value
     */
    changeStyle: function(value)
    {
        var type = $('select[name=type]').val();

        $.ajax({
            url: '/admin/e-commerce/block-style/'+type+'/'+value,
            type: 'POST',
            success: function(data) {
                $('.block-preview').html(data);
            }
        });
    },

    saveBlock: function()
    {
        var toolBox = $('#tool-box-block');

        $('.save-block-btn').click(function() {
            var btn = $(this);
            var data = {
                name: $('input[name=name]', toolBox).val(),
                column: $('input[name=column]', toolBox).val(),
                height: $('input[name=height]', toolBox).val(),
                type: $('select[name=type]', toolBox).val(),
                style: $('select[name=style]', toolBox).val(),
                display: $('select[name=display]', toolBox).val()
            }
            if (data.type == 'html') {
                data.data = escape($('.block-preview').html());
            }
            $.ajax({
                url: btn.data('route'),
                type: 'POST',
                dataType: 'JSON',
                data: data,
                beforeSend: function() {
                    btn.button('loading');
                },
                success: function(data) {
                    btn.button('reset');
                    if (data) {
                        location.reload();
                    }
                }
            });
        });
    }
}

$(document).ready(function() {
    AdminEcomBlock.init();
});