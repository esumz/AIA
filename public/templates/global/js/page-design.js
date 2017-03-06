/**
 * Created by HaThao on 8/11/14.
 */

var PageDesign = {

    init: function()
    {
        $('.item > img', '.list-component').tooltip();
        this.toolBarAction();
        this.componentAction();
    },

    componentAction: function()
    {
        this.rowAction();
        this.dragComponent();
        this.dropComponent();
        this.rowToolBox();
        this.componentToolBox();
    },

    /**
     * Select row
     *
     * @param row
     */
    rowAction: function(row)
    {
        var row = row || $('.one-row');

        row.click(function() {
            var self = $(this);
            $('.one-row').css('background', '#fafafa');
            self.css('background', '#eee');
            $('.one-row').removeClass('selected');
            self.addClass('selected');
            $('#component-panel').show();

            var toolBox = $('#row-tool-box');
            var style = {
                top: self.offset().top,
                right: self.offset().right
            };
            // get attribute of row
            var attributes = ['height', 'padding', 'margin'];
            attributes.forEach(function(attr) {
                var value = self.attr('data-' + attr);
                if (typeof value === 'undefined' || value === false) {
                    self.attr('data-'+attr, self.css(attr) || 0);
                }
                $('input[name='+attr+']', toolBox).val(self.attr('data-'+attr));
            });
            toolBox.css(style).show();
        });
    },

    /**
     * Tool box for row
     */
    rowToolBox: function()
    {
        var toolBox = $('#row-tool-box');
        var mainAction = $('.main-actions', toolBox);
        var moreAction = $('.more-actions', toolBox);

        // main actions
        $('.action:not(.inited)', mainAction).addClass('inited').click(function() {
            var row = $('.one-row.selected');
            var self = $(this);
            var action = self.data('action');

            // get attribute of row
            var attributes = ['height', 'padding', 'margin'];
            attributes.forEach(function(attr) {
                $('input[name='+attr+']', toolBox).val(row.attr('data-'+attr));
            });

            switch (action) {
                case 'up':
                    var preRow = row.prev('.one-row');
                    row.insertBefore(preRow);
                    break;
                case 'down':
                    var preRow = row.next('.one-row');
                    row.insertAfter(preRow);
                    break;
                case 'above':
                    $('<div class="row-fluid one-row" style="height: 300px;" data-height="300px" data-padding="0" data-margin="0"></div>').insertBefore(row);
                    PageDesign.init();
                    break;
                case 'below':
                    $('<div class="row-fluid one-row" style="height: 300px;" data-height="300px" data-padding="0" data-margin="0"></div>').insertAfter(row);
                    PageDesign.init();
                    break;
                case 'more':
                    $('.more-actions', toolBox).toggle();
                    break;
                case 'delete':
                    row.remove();
                    toolBox.hide();
                    break;
            }
        });

        // more actions
        $('input:not(.inited)', moreAction).addClass('inited').change(function() {
            var self = $(this);
            var name = self.attr('name');
            var row = $('.one-row.selected');

            switch (name) {
                case 'height':
                case 'padding':
                case 'margin':
                    row.css(name, self.val());
                    row.attr('data-'+name, self.val());
                    break;
            }
        });
    },

    /**
     * Drag component
     */
    dragComponent: function()
    {
        var listComponent = $('.list-component', '#component-panel');

        $('.item:not(.inited)', listComponent).addClass('inited').draggable({
            cursor: 'move',
            appendTo: 'body',
            helper: 'clone',
            cursorAt: {
                top: 30,
                left: 40
            },
            start: function() {

            },
            drag: function() {

            },
            stop: function() {

            }
        });
    },

    /**
     * Bind droppable
     */
    dropComponent: function()
    {
        $('.one-row:not(.inited)').addClass('inited').droppable({
            drop: function(event, ui) {
                var component = ui.draggable.detach().css({top: 0,left: 0});
                PageDesign.getComponent(component.data('name'), $('.one-row.selected'));
            }
        });
    },

    /**
     * Get component content
     *
     * @param name
     * @param taget
     */
    getComponent: function(name, taget)
    {
        $.ajax({
            url: $('.list-component', '#component-panel').data('url') + name,
            success: function(content) {
                var component = $('<div class="component-box" data-name="'+name+'">'+content+'</div>');
                taget.append(component);
                PageDesign.componentToolBox();
            }
        });
    },

    /**
     * Show toolBox for design component
     *
     * @param component
     */
    componentToolBox: function()
    {
        var toolBox = $('#component-tool-box');

        // show toolBox
        $('.component-box:not(.inited)').addClass('inited').mouseenter(function() {
            var self = $(this);
            $('.component-box').removeClass('selected');
            self.addClass('selected');
            self.resizable();
            var style = {
                top: self.offset().top,
                left: self.offset().left
            };
            // get attribute of component
            var attributes = ['height', 'width', 'padding', 'margin'];
            attributes.forEach(function(attr) {
                var value = self.attr('data-' + attr);
                if (typeof value === 'undefined' || value === false) {
                    self.attr('data-'+attr, self.css(attr) || 0);
                }
                $('input[name='+attr+']', toolBox).val(self.attr('data-'+attr));
            });
            toolBox.css(style).show();
        });

        // main actions
        var mainAction = $('.main-actions', toolBox);

        $('.action:not(.inited)', mainAction).addClass('inited').click(function() {
            var component = $('.component-box.selected');
            var self = $(this);
            var action = self.data('action');

            switch (action) {
                case 'up':
                case 'down':
                case 'left':
                case 'right':
                    PageDesign.moveComponent(component, action);
                    break;
                case 'more':
                    $('.more-actions', toolBox).toggle();
                    break;
                case 'delete':
                    component.remove();
                    toolBox.hide();
                    break;
            }
        });

        // more actions
        var moreAction = $('.more-actions', toolBox);
        $('input:not(.inited)', moreAction).addClass('inited').change(function() {
            var self = $(this);
            var name = self.attr('name');
            var component = $('.component-box.selected');

            switch (name) {
                case 'width':
                case 'height':
                case 'padding':
                case 'margin':
                    component.css(name, self.val());
                    component.attr('data-'+name, self.val());
                    break;
                case 'border':
                    component.css('border', self.val() + 'px solid #000');
                    component.attr('data-'+name, self.val());
                    break;
            }
        });
    },

    // move component
    moveComponent: function(component, action)
    {
        switch (action) {
            case 'left':
                var prevComponent = component.prev('.component-box');
                if (prevComponent.length) {
                    component.insertBefore(prevComponent);
                }
                break;
            case 'right':
                var nextComponent = component.next('.component-box');
                if (nextComponent.length) {
                    component.insertAfter(nextComponent);
                }
                break;
            case 'up':
                var row = component.parents('.one-row').first();
                var upRow = row.prev('.one-row');
                if (upRow.length) {
                    component.appendTo(upRow);
                }
                break;
            case 'down':
                var row = component.parents('.one-row').first();
                var downRow = row.next('.one-row');
                if (downRow.length) {
                    component.prependTo(downRow);
                }
                break;
            default:
                break;
        }
    },

    /**
     * ToolBar action
     */
    toolBarAction: function()
    {
        var toolBar = $('#design-tool-bar');

        $('.actions .action:not(.inited)', toolBar).addClass('inited').click(function() {
            var self = $(this);
            var box = $('#'+self.data('box'));
            if (box.hasClass('active-panel')) {
                box.removeClass('active-panel').hide();
            } else {
                $('.active-panel').removeClass('active-panel').hide();
                box.addClass('active-panel').show();
            }
        });

        // save template
        var saveModal = $('#save-page-modal');
        $('.save-page', toolBar).click(function(e) {
            e.preventDefault();

            var btn = $(this);
            $('input.name', saveModal).val(btn.data('name'));
            $('input.link', saveModal).val(btn.data('link'));
            $('.save-template-btn', saveModal).attr('data-route', btn.attr('href'));
            $('.alert', saveModal).html('').hide();
            saveModal.modal('show');
        });

        $('.save-template-btn:not(.inited)', saveModal).addClass('inited').click(function(e) {
            var self = $(this);
            var dataPage = {rows: new Array()};

            // get data
            PageDesign.getTemplateData(dataPage);
            $('.inited', '.main-layout-content').removeClass('inited');

            dataPage.name = $.trim($('input.name', saveModal).val());
            dataPage.link = $.trim($('input.link', saveModal).val());
            dataPage.rows = JSON.stringify(dataPage.rows);
            dataPage.layout = escape($('.main-layout-content').html());

            if (dataPage.name == '' || dataPage.link == '') {
                $('.alert', saveModal).html('Some field still empty').show();
            } else {
                $.ajax({
                    url: self.attr('data-route'),
                    data: dataPage,
                    type: 'POST',
                    dataType: 'JSON',
                    beforeSend: function() {
                        //self.button('loading');
                    },
                    success: function(data) {
                        //self.button('reset');
                        if (data === true) {
                            window.location.assign('/page-design/' + dataPage.link);
                        } else {
                            bootbox.alert('Maybe your link is already exist');
                        }
                    }
                });
            }
        });
    },

    /**
     * Get template data to save
     *
     * @param data
     */
    getTemplateData: function(data)
    {
        var listRow = $('.one-row', '.main-layout-content');

        if (listRow.length) {
            listRow.each(function() {
                var row = $(this);
                var components = new Array();
                var listComponent = $('.component-box', row);

                if (listComponent.length) {
                    listComponent.each(function() {
                        var self = $(this);
                        components.push({
                            name: self.data('name'),
                            attributes: {
                                height: self.attr('data-height') || 'auto',
                                width: self.attr('data-width') || '100%',
                                padding: self.attr('data-padding') || '0',
                                margin: self.attr('data-margin') || '0'
                            }
                        });
                    });
                }
                data.rows.push({
                    components: components,
                    attributes: {
                        height: row.attr('data-height') || 'auto',
                        padding: row.attr('data-padding') || '0',
                        margin: row.attr('data-margin') || '0'
                    }
                });
            });
        } else {
            data = null;
        }
    },

    /**
     * Select template
     */
    templateSelect: function()
    {
        var listTemplate = $('.list-template', '#template-panel');
        $('.item', listTemplate).click(function() {
            var self = $(this);
            var id = self.attr('id');

            $('.main-layout-content').html($('> .content', self).html());
            $('.save-template-btn:not(.new)', '#design-tool-bar').attr('data-id', id);
            $('.inited', '.main-layout-content').removeClass('inited');
            PageDesign.componentAction();
        });
    }
};

$(document).ready(function() {
    PageDesign.init();
});