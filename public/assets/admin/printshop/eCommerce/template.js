/**
 * Created by HaThao on 8/4/14.
 */

var AdminEcomTemplate = {

    init: function()
    {
        this.getBlockData();
        this.toolBoxAction();
    },

    /**
     * Save layout
     *
     * @param btn
     * @param data
     */
    saveLayout: function(btn, blockInfo)
    {
        $.ajax({
            data: {data: JSON.stringify(blockInfo)},
            type: 'POST',
            dataType: 'JSON',
            beforeSend: function() {
                btn.button('loading');
            },
            success: function(status) {
                if (status === true) {
                    bootbox.alert('Successful');
                } else {
                    bootbox.alert('Have something went wrong');
                }
                btn.button('reset');
            }
        });
    },

    /**
     * Get block info
     */
    getBlockData: function()
    {
        $('.save-layout').click(function(e) {
            e.preventDefault();

            var btn = $(this);
            var blockInfo = new Array();
            $('.page-layout > .block').each(function(i) {
                var block = $(this);
                var blockData = {
                    id:         block.attr('data-id'),
                    name:       block.attr('data-name'),
                    style:      block.attr('data-style') || 'default',
                    type:       block.attr('data-type') || 'html',
                    top:        block.offset().top,
                    left:       block.offset().left,
                    column:     block.attr('data-column') || 12,
                    height:     block.attr('data-height') || (block.height()),
                    subBlocks:  new Array()
                };
                $('> .block', block).each(function() {
                    var subBlock = $(this);
                    blockData.subBlocks.push({
                        id:     subBlock.attr('data-id'),
                        name:   subBlock.attr('data-name'),
                        style:  subBlock.attr('data-style') || 'default',
                        type:   subBlock.attr('data-type') || 'html',
                        top:    subBlock.offset().top,
                        left:   subBlock.offset().left,
                        column: subBlock.attr('data-column') || 12,
                        height: subBlock.attr('data-height') || (subBlock.height())
                    });
                });
                blockInfo.push(blockData);
            });
            AdminEcomTemplate.saveLayout(btn, blockInfo);
        });
    },

    /**
     * Toolbox action
     */
    toolBoxAction: function()
    {
        var toolBox = $('#tool-box-layout');

        $('.block:not(.parent)', '.page-layout').click(function(e) {
            $('.block', '.page-layout').removeClass('selected');
            var block = $(this);
            block.addClass('selected');

            var blockData = {
                name:       block.attr('data-name'),
                style:      block.attr('data-style') || 'default',
                type:       block.attr('data-type') || 'html',
                top:        block.offset().top,
                left:       block.offset().left,
                column:     block.attr('data-column') || 12,
                height:     block.attr('data-height') || (block.height() + 10),
                subBlocks:  new Array()
            };
            $('input[name=name]', toolBox).val(blockData.name);
            $('input[name=column]', toolBox).val(blockData.column);
            $('input[name=height]', toolBox).val(blockData.height);
            $('select[name=type] option', toolBox).each(function() {
                var option = $(this);
                option.attr('selected', option.attr('value') == blockData.type ? true : false);
            });
            $('select[name=style] option', toolBox).each(function() {
                var option = $(this);
                option.attr('selected', option.attr('value') == blockData.style ? true : false);
            });
            toolBox.show(200);
        });

        // close toolbox
        $('button.close-btn', toolBox).click(function() {
            toolBox.hide();
        });

        //save toolbox
        $('button.save-btn', toolBox).click(function() {
            var selectedItem = $('.block.selected', '.page-layout');
            if (selectedItem.length) {
                // get info
                var data = {
                    name: $('input[name=name]', toolBox).val(),
                    column: $('input[name=column]', toolBox).val(),
                    height: $('input[name=height]', toolBox).val(),
                    type: $('select[name=type]', toolBox).val(),
                    style: $('select[name=style]', toolBox).val()
                }
                selectedItem.height(data.height);
                selectedItem.removeClass('col-md-' + selectedItem.attr('data-column'));
                selectedItem.addClass('col-md-' + data.column);
                /**
                 * Check valid here
                 */
                selectedItem.attr('data-name', data.name);
                selectedItem.attr('data-column', data.column);
                selectedItem.attr('data-height', data.height);
                selectedItem.attr('data-type', data.type);
                selectedItem.attr('data-style', data.style);
            }
        });
    }
}

$(document).ready(function() {
    AdminEcomTemplate.init();
});