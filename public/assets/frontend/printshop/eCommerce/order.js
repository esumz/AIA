/**
 * Created by thaoha on 9/11/14.
 */

var Cart = {

    name: 'CartData',

    /**
     * Get CartData
     *
     * @returns {*}
     */
    data: function() {
        return $.cookie(Cart.name);
    },

    /**
     * Clear cart
     *
     * @returns {*}
     */
    clear: function() {
        return $.removeCookie(Cart.name);
    },

    /**
     * Add item
     *
     * @param item
     */
    add: function(item, next) {

        var data = $.cookie(Cart.name) || new Object();
        data[item.id] = item;
        $.cookie(Cart.name, data);
        if (typeof next !== 'undefined') {
            next();
        }
    },

    /**
     * Remove item
     *
     * @param item
     */
    remove: function(id, next) {

        var data = $.cookie(Cart.name) || null;
        if (data) {
            delete data[id];
            $.cookie(Cart.name, data);
        }
        if (typeof next !== 'undefined') {
            next();
        }
    },

    /**
     * Update item
     *
     * @param item
     * @param data
     */
    update: function(item, data, next) {

        if (typeof next !== 'undefined') {
            next();
        }
    }
};

var Order  = {

    init: function() {
        $.cookie.json = true;

        this.add();
        this.topCartRefresh();
        this.topCartRemove();
        this.topCartClear();
        this.loadCart();
    },

    /**
     * Add product to cart
     */
    add: function() {

        $('.add2cart').unbind('click').on('click', function(e) {
            e.preventDefault();

            var btn = $(this);
            var item = {
                id: btn.data('product-id'),
                alias: btn.data('product-alias'),
                name: btn.data('product-name'),
                price: btn.data('product-price'),
                quantity: btn.data('product-quantity') || 1
            };
            Cart.add(item, function() {
                btn.text('View cart');
                Order.topCartRefresh();
            });
        });
    },

    /**
     * Remove item in topCart
     *
     * @param item
     */
    topCartRemove: function() {

        $('.del-goods', '.top-cart-block').unbind('click').on('click', function() {
            var item = $(this).parents('.top-cart-item').first();
            var id = item.data('id');
            Cart.remove(id, function() {
                item.remove();
                Order.topCartRefresh();
            });
        });
    },

    /**
     * Remove item in cart
     */
    cartRemove: function() {

        $('.del-goods:not(.inited)', '.cart-item').addClass('inited').on('click', function() {
            var item = $(this).parents('.cart-item').first();
            var id = item.data('id');
            Cart.remove(id, function() {
                item.remove();
                Order.loadCart();
                Order.topCartRefresh();
            });
        });
    },

    /**
     * Clear all item in topCart
     */
    topCartClear: function() {

        $('.clear-top-cart', '.top-cart-block').on('click', function() {
            Cart.clear();
            Order.topCartRefresh();
        });
    },

    /**
     * Update item in topCart
     */
    topCartRefresh: function() {

        var topCartInfo = $('.top-cart-info', '.top-cart-block');
        var topCartContent = $('.top-cart-content', '.top-cart-block');
        var emptyItem = $('.empty-item', topCartContent).html();
        var data = Cart.data() || {};
        var totalPrice = 0;
        $('.list-item', topCartContent).html('');

        for (var key in data) {
            var newItem = $(emptyItem);
            var name = $('.name', newItem);

            newItem.data('id', key);
            name.html(data[key].name);
            name.attr('href', name.attr('href') + data[key].alias);

            $('.quantity', newItem).html('x'+data[key].quantity);
            $('.price', newItem).html(data[key].price);
            $('.list-item', topCartContent).append(newItem);
            totalPrice += data[key].price;
        }
        totalPrice = Math.floor(totalPrice * 100) / 100;
        $('.number-of-item', topCartInfo).text(Object.keys(data).length);
        $('.total-price', topCartInfo).text(totalPrice);
        Order.topCartRemove();
    },

    /**
     * Load cart
     */
    loadCart: function() {

        if ($.isEmptyObject(Cart.data())) {
            $('.cart-view').hide();
            $('.cart-empty').show();
            return;
        }

        var cart = $('table.cart');
        var data = Cart.data() || {};
        var emptyItem = $('.cart-item-empty', cart);
        var totalPrice = 0;
        $('.cart-item', cart).remove();

        for (var key in data) {
            var newItem = emptyItem.clone();
            var itemPrice = data[key].quantity*data[key].price;

            newItem.data('id', key);

            $('.product-img', newItem).attr('src', data[key].img || 'http://placehold.it/40x60');
            $('.product-name', newItem).html(data[key].name);
            $('.product-quantity', newItem).val(data[key].quantity);
            $('.product-price', newItem).html(data[key].price);
            $('.product-total-price', newItem).html(itemPrice);

            totalPrice += itemPrice;
            newItem.removeClass('cart-item-empty').addClass('cart-item').appendTo(cart).show();
        }
        totalPrice = Math.floor(totalPrice * 100) / 100;
        $('.sub-total', '.shopping-total').html(totalPrice);
        $('.final-price', '.shopping-total').html(totalPrice+3);
        Order.cartRemove();
    }
};

$(document).ready(function() {
    Order.init();
});