/**
 * Created by HaThao on 7/9/14.
 */

var AdminSetting = {

    init: function()
    {
        var generalForm = $('.setting-form.general');
        var cacheForm = $('.setting-form.cache');

        AdminMainPage.submitForm(generalForm, AdminSetting.beforeSubmit);
        AdminMainPage.submitForm(cacheForm);
        this.addMethod();
        this.deleteMethod();
    },

    addMethod: function()
    {
        $('.add-new-method').click(function(e) {
            e.preventDefault();
            var box = $(this).parents('div').first();
            var panel = $('.add-panel', box);
            panel.toggle();

            $('.add-btn:not(.inited)', panel).addClass('inited').click(function(e) {
                e.preventDefault();
                var data = {
                    name: $('input.name-input', panel).val(),
                    title: $('input.title-input', panel).val(),
                    cost: $('input.cost-input', panel).val()
                };
                var item = $($('.empty-method', panel).html());
                $('.title-display', item).html(data.title);
                $('.cost-display', item).text(data.cost);
                $('input.name', item).val(data.name);
                $('input.title', item).val(data.title);
                $('input.cost', item).val(data.cost);
                $('ul', box).append(item);
                AdminSetting.deleteMethod();
            });
        });
    },

    deleteMethod: function()
    {
        $('.delete-btn:not(.inited)', '.method-item').addClass('inited').click(function(e) {
            $(this).parents('.method-item').first().remove();
            e.preventDefault();
        });
    },

    beforeSubmit: function(arr)
    {
        var deliveryList = $('.delivery-list', 'form.setting-form');
        var paymentList = $('.payment-list', 'form.setting-form');
        var deliveryMethods = new Array();
        var paymentMethods = new Array();

        $('.method-item', deliveryList).each(function(i) {
            var item = $(this);

            deliveryMethods.push({
                name: $('input.name', item).val(),
                title: $('input.title', item).val(),
                cost: $('input.cost', item).val()
            });
        });
        arr.push({
            name: 'deliveryMethods',
            value: JSON.stringify(deliveryMethods)
        });

        //==============================================//
        $('.method-item', paymentList).each(function(i) {
            var item = $(this);

            paymentMethods.push({
                name: $('input.name', item).val(),
                title: $('input.title', item).val()
            });
        });
        arr.push({
            name: 'paymentMethods',
            value: JSON.stringify(paymentMethods)
        });
    }
};

$(document).ready(function() {
    AdminSetting.init();
});
