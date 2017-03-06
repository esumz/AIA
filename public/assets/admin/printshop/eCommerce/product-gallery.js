/**
 * Created by thaoha on 8/27/14.
 */

var AdProductGallery = function () {

    return {
        //main function to initiate the module
        init: function () {
            var form = $('form.product-gallery-form');

            Dropzone.options.productGalleryUpload = {
                init: function() {
                    AdProductGallery.handleEvents(this, form);
                }
            }
            FormDropzone.loadImages($('#product-gallery-upload'), function() {
                $('button[type=submit]', 'form.product-gallery-form').removeClass('disabled');
            });
            this.searchAlbum();
        },

        /**
         * Handle dropZone event
         *
         * @param form
         */
        handleEvents: function(dropZone, form) {

            dropZone.on("addedfile", function(file) {
                // Create the remove button
                var removeButton = Dropzone.createElement("<button class='btn btn-sm btn-block'>Remove file</button>");

                // Capture the Dropzone instance as closure.
                var _this = this;

                // Listen to the click event
                removeButton.addEventListener("click", function(e) {
                    // Make sure the button click doesn't submit the form:
                    e.preventDefault();
                    e.stopPropagation();

                    // Remove the file preview.
                    _this.removeFile(file);

                    // remove in form
                    $('input[name=images]', form).filter(function() {
                        return this.value == $(file.previewElement).attr('data-route');
                    }).remove();

                    $('button[type=submit]', 'form.product-gallery-form').removeClass('disabled');

                    // If you want to the delete the file on the server as well,
                    // you can do the AJAX request here.
                });

                // Add the button to the file preview element.
                file.previewElement.appendChild(removeButton);
                $('button[type=submit]', 'form.product-gallery-form').removeClass('disabled');
            });

            dropZone.on('success', function(file, data) {
                form.prepend($('<input type="hidden" name="images" value="'+data+'">'));
                $(file.previewElement).attr('data-route', data);
            });
        },

        /**
         * Search album for product
         */
        searchAlbum: function() {
            var search = $('.search-album');
            search.select2({
                placeholder: "Search for a album",
                minimumInputLength: 2,
                id: function(element) {
                    return element.id;
                },
                ajax: {
                    url: search.data('route'),
                    dataType: 'JSON',
                    type: 'POST',
                    data: function (term, page) {
                        return {
                            keyword: term
                        };
                    },
                    results: function (data, page) {
                        var list = new Array();
                        data.albums.forEach(function(album) {
                            list.push({
                                id: album._id,
                                text: album.name,
                                images: album.images
                            });
                        });
                        return {
                            results: list
                        };
                    }
                },
                initSelection: function (element, callback) {
                    var id = $(element).val();
                    return id;
                }
            });

            /**
             * Select exist album
             */
            search.on("select2-selecting", function(e) {
                var images = e.object.images;
                if (images.length) {
                    var dropZone = $('#product-gallery-upload');
                    var form = $('form.product-gallery-form');

                    $('input[name=images]', dropZone).remove();
                    $('.dz-preview', dropZone).remove();
                    $('input[name=images]', form).remove();

                    images.forEach(function(img) {
                        dropZone.prepend($('<input type="hidden" name="images" value="'+img+'">'));
                        form.prepend($('<input type="hidden" name="images" value="'+img+'">'));
                    });
                    FormDropzone.loadImages(dropZone, function() {
                        $('button[type=submit]', 'form.product-gallery-form').removeClass('disabled');
                    });
                    $('.dz-message', dropZone).remove();
                }
            });
        }
    };
}();

$(document).ready(function() {
    AdProductGallery.init();
});