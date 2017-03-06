/**
 * Created by thaoha on 8/27/14.
 */

var FormDropzone = function () {

    return {
        //main function to initiate the module
        init: function () {
            var form = $('form.create-album-form');

            Dropzone.options.myDropzone = {
                init: function() {
                    FormDropzone.handleEvents(this, form);
                    FormDropzone.formActions(this, form);
                }
            }
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

                    // If you want to the delete the file on the server as well,
                    // you can do the AJAX request here.
                });

                // Add the button to the file preview element.
                file.previewElement.appendChild(removeButton);
            });

            dropZone.on('success', function(file, data) {
                form.prepend($('<input type="hidden" name="images" value="'+data+'">'));
                $(file.previewElement).attr('data-route', data);

            });
        },

        /**
         * Submit form
         *
         * @param form
         */
        formActions: function(dropZone, form) {
            form.ajaxForm({
                beforeSubmit: function() {
                    $('button[type=submit]', form).button('loading');
                },
                success: function(data) {
                    $('button[type=submit]', form).button('reset');
                    if (data === true) {
                        bootbox.alert('Successful. Check in album list.');
                        dropZone.removeAllFiles();
                        $('input.image-item', form).remove();
                        $('input[name=name]', form).val('');
                        $('textarea[name=description]', form).val('');
                    } else {
                        bootbox.alert('Have something wrong.');
                    }
                }
            });
        },

        /**
         * Load images exist in dropZone
         * @param dropZone
         */
        loadImages: function(dropZone, removeCallback) {
            var previewTemplate = "<div class=\"dz-preview dz-file-preview\">\n  <div class=\"dz-details\">\n    <div class=\"dz-filename\"><span data-dz-name></span></div>\n    <div class=\"dz-size\" data-dz-size></div>\n    <img data-dz-thumbnail style='display: block;'/>\n  </div>\n  <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  <div class=\"dz-success-mark\"><span>✔</span></div>\n  <div class=\"dz-error-mark\"><span>✘</span></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n</div>"

            var images = $('input[name=images]', dropZone);
            if (images.length > 0) {
                images.each(function() {
                    var image = $(this);
                    var template = $(previewTemplate).clone();
                    var removeButton = Dropzone.createElement("<button class='btn btn-sm btn-block'>Remove file</button>");

                    removeButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        FormDropzone.removeImage(template, image.val());
                        if (typeof removeCallback !== 'undefined') {
                            removeCallback();
                        }
                    });
                    template.append(removeButton);
                    $('.dz-details > img', template).attr('src', 'uploads/' + image.val());
                    dropZone.append(template);
                });
            }
        },

        removeImage: function(template, imageUrl) {
            // remove in form
            $('input[name=images]', 'form.product-gallery-form').filter(function() {
                return this.value == imageUrl;
            }).remove();

            template.remove();
        }
    };
}();

$(document).ready(function() {
    FormDropzone.init();
});