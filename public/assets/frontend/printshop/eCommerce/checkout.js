var Checkout = function () {

    return {
        data: new Object(),
        rules: {
            firstName: "required",
            lastName: "required",
            email: {
                required: true,
                email: true
            },
            telephone: "required",
            address1: "required",
            city: "required",
            postCode: {
                required: true,
                digits: true
            },
            country: "required"
        },

        init: function () {

            if ($.isEmptyObject(Cart.data())) {
                $('.checkout-steps').hide();
                $('.cart-empty').show();
                return;
            }

            if ($('.btn.step-one-submit', '#checkout-page').length) {
                Checkout.stepOne();
            } else {
                Checkout.stepTwo();
            }
            Checkout.selectCountry();
        },

        getFormData: function(form) {
            var data = new Object();

            $('.form-data', form).each(function() {
                var self = $(this);
                data[self.attr('name')] = self.val();
            });
            return data;
        },

        nextStep: function(nextPanel, fn) {

            $('.panel-collapse.in', '#checkout-page').collapse('hide');
            $('.accordion-toggle', nextPanel).attr('data-toggle', 'collapse');
            $('.panel-collapse', nextPanel).collapse('show');
            fn();
        },

        stepOne: function() {

            $('.btn.step-one-submit', '#checkout-page').click(function() {
                var account = $('input[name=account]', '#checkout-content').val();
                Checkout.data['account'] = account;
                Checkout.nextStep($('#payment-address'), Checkout.stepTwo);
            });

            UserMain.submitForm($('#login-form-checkout'), '/checkout');
        },

        // payment address
        stepTwo: function() {

            var panel = $('#payment-address');
            var submitBtn = $('.btn.step-two-submit', panel);
            submitBtn.prop('disabled', true);

            $('form', panel).validate({
                rules: Checkout.rules,
                invalidHandler: function(event, validator) {

                },
                submitHandler: function(form) {
                    Checkout.data['billingDetail'] = Checkout.getFormData(form);
                    var sameDelivery = $('input[name=sameDelivery]', panel).is(':checked');

                    if (sameDelivery) {
                        Checkout.data['deliveryDetail'] = 'billingDetail';
                        Checkout.nextStep($('#shipping-method'), Checkout.stepFour);
                    } else {
                        Checkout.nextStep($('#shipping-address'), Checkout.stepThree);
                    }
                }
            });

            $('input[name=sameDelivery]', panel).change(function() {
                if ($(this).is(':checked')) {

                }
            });

            $('input[name=privacyPolicy]', panel).change(function() {
                if ($(this).is(':checked')) {
                    submitBtn.prop('disabled', false);
                } else {
                    submitBtn.prop('disabled', true);
                }
            });
        },

        // shipping address
        stepThree: function() {
            var panel = $('#shipping-address');

            $('form', panel).validate({
                rules: Checkout.rules,
                invalidHandler: function(event, validator) {

                },
                submitHandler: function(form) {
                    Checkout.data['deliveryDetail'] = Checkout.getFormData(form);
                    Checkout.nextStep($('#shipping-method'), Checkout.stepFour);
                }
            });
        },

        // shipping method
        stepFour: function() {
            var panel = $('#shipping-method');

            $('form', panel).validate({
                rules: Checkout.rules,
                invalidHandler: function(event, validator) {

                },
                submitHandler: function(form) {
                    Checkout.data['deliveryMethod'] = Checkout.getFormData($('form', panel));
                    Checkout.nextStep($('#payment-method'), Checkout.stepFive);
                }
            });
        },

        // payment method
        stepFive: function() {

            var panel = $('#payment-method');
            var submitBtn = $('.btn.step-five-submit', panel);
            submitBtn.prop('disabled', true);

            $('form', panel).validate({
                rules: Checkout.rules,
                invalidHandler: function(event, validator) {

                },
                submitHandler: function(form) {
                    Checkout.data['paymentMethod'] = Checkout.getFormData($('form', panel));
                    $(form).ajaxSubmit({
                        data: {
                            cartData: JSON.stringify(Cart.data()),
                            deliveryMethod: Checkout.data['deliveryMethod']['name']
                        },
                        type: 'POST',
                        beforeSend: function() {
                            submitBtn.button('loading');
                        },
                        success: function(html) {
                            submitBtn.button('reset');
                            $('.cart-content', '#confirm-content').html(html);
                            Checkout.nextStep($('#confirm'), Checkout.stepSix);
                        }
                    });
                }
            });

            $('input[name=term]', panel).change(function() {
                if ($(this).is(':checked')) {
                    submitBtn.prop('disabled', false);
                } else {
                    submitBtn.prop('disabled', true);
                }
            });
        },

        // confirm
        stepSix: function() {

            $('.btn.step-six-submit', '#confirm').click(function() {
                var btn = $(this);

                $.ajax({
                    url: btn.data('route'),
                    data: {
                        account: JSON.stringify(Checkout.data['account']),
                        billingDetail: JSON.stringify(Checkout.data['billingDetail']),
                        deliveryDetail: JSON.stringify(Checkout.data['deliveryDetail']),
                        deliveryMethod: JSON.stringify(Checkout.data['deliveryMethod']),
                        paymentMethod: JSON.stringify(Checkout.data['paymentMethod']),
                        cartData: JSON.stringify(Cart.data())
                    },
                    type: 'POST',
                    dataType: 'JSON',
                    beforeSend: function() {
                        bootbox.dialog({
                            title: "Create order",
                            message: 'Please wait a minute.'
                        });
                        btn.button('loading');
                    },
                    success: function(data) {
                        btn.button('reset');
                        if (data.success === true) {
                            Cart.clear();
                            window.location.assign(data.url);
                        }
                    }
                });
            });
            $('.btn.checkout-cancel', '#confirm').click(function() {
                Cart.clear();
                window.location.assign('/');
            });
        },

        /**
         * Select country action
         */
        selectCountry: function() {

            $('select[name=country]').change(function() {
                var $that = $(this);
                var form = $that.parents('form').first();
                var route = $that.data('route') + $that.val();

                $.ajax({
                    url: route,
                    type: 'POST',
                    success: function(list) {
                        $('.state-group', form).html(list);
                    }
                });
            });
        }
    };

}();

$(document).ready(function() {
    Checkout.init();
});