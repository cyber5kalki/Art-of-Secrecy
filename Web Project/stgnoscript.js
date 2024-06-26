$(document).ready(function() {
  // Bind click event to encode button after the document is ready
  $('button.encode').click(function(event) {
      event.preventDefault();
      encodeMessage();
  });

  // Bind click event to decode button after the document is ready
  $('button.decode').click(function(event) {
      event.preventDefault();
      decodeMessage(); // Call decode function when decode button is clicked
  });
});

function previewEncodeImage() {
  var file = document.querySelector("input[name=baseFile]").files[0];

  $(".images .nulled").hide();
  $(".images .message").hide();

  previewImage(file, ".original canvas", function() {
      $(".images .original").fadeIn();
      $(".images").fadeIn();
  });
}

function previewDecodeImage() {
  var file = document.querySelector('input[name=decodeFile]').files[0];

  previewImage(file, ".decode canvas", function() {
      $(".decode").fadeIn();
  });
}

function previewImage(file, canvasSelector, callback) {
  var reader = new FileReader();
  var image = new Image;
  var $canvas = $(canvasSelector);
  var context = $canvas[0].getContext('2d');

  if (file) {
      reader.readAsDataURL(file);
  }

  reader.onloadend = function () {
      image.src = URL.createObjectURL(file);

      image.onload = function() {
          $canvas.prop({
              'width': image.width,
              'height': image.height
          });

          context.drawImage(image, 0, 0);

          callback();
      }
  }
}

function encodeMessage() {
  $(".error").hide();
  $(".binary").hide();

  var text = $("textarea.message").val();

  var $originalCanvas = $('.original canvas');
  var $nulledCanvas = $('.nulled canvas');
  var $messageCanvas = $('.message canvas');

  var originalContext = $originalCanvas[0].getContext("2d");
  var nulledContext = $nulledCanvas[0].getContext("2d");
  var messageContext = $messageCanvas[0].getContext("2d");

  var width = $originalCanvas[0].width;
  var height = $originalCanvas[0].height;

  // Check if the image is big enough to hide the message
  if ((text.length * 8) > (width * height * 3)) {
      $(".error")
          .text("Text too long for chosen image....")
          .fadeIn();

      return;
  }

  $nulledCanvas.prop({
      'width': width,
      'height': height
  });

  $messageCanvas.prop({
      'width': width,
      'height': height
  });

  // Normalize the original image and draw it
  var original = originalContext.getImageData(0, 0, width, height);
  var pixel = original.data;
  for (var i = 0, n = pixel.length; i < n; i += 4) {
      for (var offset =0; offset < 3; offset ++) {
          if(pixel[i + offset] %2 != 0) {
              pixel[i + offset]--;
          }
      }
  }
  nulledContext.putImageData(original, 0, 0);

  // Convert the message to a binary string
  var binaryMessage = "";
  for (i = 0; i < text.length; i++) {
      var binaryChar = text[i].charCodeAt(0).toString(2);

      // Pad with 0 until the binaryChar has a length of 8 (1 Byte)
      while(binaryChar.length < 8) {
          binaryChar = "0" + binaryChar;
      }

      binaryMessage += binaryChar;
  }
  $('.binary textarea').text(binaryMessage);

  // Apply the binary string to the image and draw it
  var message = nulledContext.getImageData(0, 0, width, height);
  pixel = message.data;
  counter = 0;
  for (var i = 0, n = pixel.length; i < n; i += 4) {
      for (var offset =0; offset < 3; offset ++) {
          if (counter < binaryMessage.length) {
              pixel[i + offset] += parseInt(binaryMessage[counter]);
              counter++;
          }
          else {
              break;
          }
      }
  }
  messageContext.putImageData(message, 0, 0);

  $(".binary").fadeIn();
  $(".images .nulled").fadeIn();
  $(".images .message").fadeIn();
};

function decodeMessage() {
  var $decodeCanvas = $('.decode canvas');
  var decodeContext = $decodeCanvas[0].getContext("2d");

  var decodeImageData = decodeContext.getImageData(0, 0, $decodeCanvas.width(), $decodeCanvas.height());
  var binaryMessage = "";
  var pixel = decodeImageData.data;

  for (var i = 0, n = pixel.length; i < n; i += 4) {
      for (var offset = 0; offset < 3; offset++) {
          var value = pixel[i + offset] & 1; // Get the least significant bit (LSB) of each color channel

          binaryMessage += value;
      }
  }

  var output = "";
  for (var i = 0; i < binaryMessage.length; i += 8) {
      var c = 0;
      for (var j = 0; j < 8; j++) {
          c <<= 1;
          c |= parseInt(binaryMessage[i + j]);
      }

      output += String.fromCharCode(c);
  }

  $('.binary-decode textarea').val(output);
  $('.binary-decode').fadeIn();
}
