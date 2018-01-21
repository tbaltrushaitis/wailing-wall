/*!
 * Project: wailing-wall
 * File:    ./src/assets/js/app/wailing-wall.js
 * Author:  Baltrushaitis Tomas <tbaltrushaitis@gmail.com>
 * Created: 2018-01-21
 */

'use strict';

var wallJson = (function () {
  var wallJson;
  $.ajax({
    async: false,
    global: false,
    url: 'data/wall.json', // local
    dataType: 'json',
    success: function (data) {
      wallJson = data;
    }
  });
  return wallJson;
})();

$(document).ready(function () {

  let arrWishes     = {};
  let htmlContainer = '.wall-container';

  $('#wallModal').find('.wish-text').autogrow();

  /* CLICK on the wall */
  $('.wall-container').on('click', function (lo) {
    if ($(lo.target).hasClass('wish-cell')
     || $(lo.target).hasClass('btn-wall-info')
     || $(lo.target).hasClass('btn-wall-burn')
     || $(lo.target).hasClass('checked')
     || !$(lo.target).hasClass('wall-block')) {
      return false;
    } else {
      var wishType = $(lo.target).attr('data-wish-type');
      _.extend(arrWishes, lo, {'data-wish-type': wishType});
      $('#wallModal').modal({
        show: true,
        keyboard: true
      });
    };
  });

  /*
   * RESET data-wish-text, data-wish-submit;
   * SET data-wish-type attributes BEFORE SHOW MODAL dialog
   */
  $('#wallModal').on('show.bs.modal', function (eventModal) {
    var wishType = $(arrWishes).attr('data-wish-type');
    $('#wallModal').attr('data-wish-type', wishType);
    $(arrWishes).attr('data-wish-text', false);
    $(arrWishes).attr('data-wish-submit', false);
    $('#wallModal').find('.wish-text').val('');
    $('#wallModal').find('.wish-text').focus();
  });

  $('#wallModal').on('shown.bs.modal', function () {
    $('#wallModal').find('#wish-text').focus();
  });

  /* CHECK data-wish-submit value and CALL addWishCell function if TRUE */
  $('#wallModal').on('hidden.bs.modal', function (eventModal) {
    if (true === $(arrWishes).attr('data-wish-submit') && $(arrWishes).attr('data-wish-text') !== '') {
      addWishCell(arrWishes);
    } else {
      //console.log("CANCELLED addWishCell with arrWishes = ", arrWishes);
    };
  });

  /* SET data-wish-text and data-wish-submit attributes if SUBMIT button was clicked */
  $('#wish-submit').on('click', function (e) {
    var wishText = $.trim($(e.currentTarget).parent().prev().find('.wish-text').val());
    _.extend(arrWishes, {
        'data-wish-text':   wishText
      , 'data-wish-submit': true
    });
  });

  $('#btn-wall-refresh').on('click', function (evt) {
    addWishesRandom(100);
  });

  /* CLICK on BURN button */
  $('#btn-wall-burn').on('click', function () {
    fireWishes();
  });

  /* BATCH WISHES GENERATION */
  buildWall('.wall-container');
  addWishesRandom(100);

});


function buildWall (htmlContainer) {
  let bWidth = ($(htmlContainer).prop('clientWidth') / _.size(wallJson.blocks)) * 100 / $(htmlContainer).prop('clientWidth') + '%';
  _.each(wallJson.blocks, function (loBlock, blockName) {
    var htmlBlock = $('<div />')
                      .attr({
                        id:    'wall-block-' + blockName,
                        class: loBlock['attributes']['class'],
                        'data-wish-type': blockName
                      })
                      .css(loBlock.css)
                      .css({'width': bWidth});
    $(htmlContainer).append(htmlBlock);
  });
};

function fireWishes (cb) {
  $($.find('.wall-block')).each(function (idx, wb) {
    var wt = $(wb).attr('data-wish-type');
    $(wb).animate((wt == 'positive' ? {'top': "-=500"} : {'bottom': "-=500"}), 7000, function () {
      $(wb).find('.wish-cell')
        .effect("drop", {'direction': (wt == 'positive' ? "up" : "down"), 'easing': "easeInSine"}, 5000, function () {
          $(this).remove();
        });
    })
    .delay(5000)
    .animate((wt == 'positive' ? {'top': "+=500"} : {'bottom': "+=500"}), 300);
  });
  if ('function' === typeof cb) {
    console.log('RUNNING CALLBACK');
    return cb();
  }
};

function presentation () {
  addWishesRandom(100);
  fireWishes();
};


/* ADD wish-cell element to wall block
// and extend it with wish-sticky and wish-noty elements */
function addWishCell (loWish, mode) {
  var autoMode = (mode === undefined ? false : true),
      wishType = loWish['data-wish-type'],
      wishText = loWish['data-wish-text'],
      X = parseInt(loWish['pageX']),
      Y = parseInt(loWish['pageY']),
      PX = parseInt($(loWish.target).prop('offsetLeft')),
      PY = parseInt($(loWish.target).prop('offsetTop')),
      iX = X - PX,
      iY = Y - PY,
      iD = iX + '-' + iY;

  /* define elements */
  // Wish container
  var i_block = $('<div />').attr({
                  'class': 'wish-cell',
                  'id': 'cell-' + iD,
                  'data-irow': iX,
                  'data-icol': iY
                })
                .css({
                  left: iX - 16 + "px",
                  top: iY - 32 + "px",
                  'background-image': "url('" + getRndImage(wishType) + "')"
                })
    // Container for jquery.noty
    , i_noty =  $('<div />').attr({
                  'class': 'wish-noty',
                  'id': 'noty-' + iD
                })
                .css({
                  left: 0,
                  top: 0,
                  'z-index': iX * iY //10000000
                }).hide();
  i_block.append(i_noty);
  $(loWish.target).append(i_block);

  if (!autoMode) {
    $(loWish.target).find('#' + 'noty-' + iD)
      .show()
      .noty({
        type:   wishType === 'positive' ? "success" : "warning",
        text:   "<h4>" + (wishType == 'positive' ? " Dream Accepted " : " Wish Accepted") + "<h4/>",
        dismissQueue: false,
        timeout: 2000, //false, // or time in milliseconds, e.g. 4000 = 4s
        force: false,
        modal: false,
        killer: false,
        closeWith:  ['click', 'button'],
        callback: {
          /*onShow: function() {},
          afterShow: function() {},*/
          onClose: function () {
            $(loWish.target).find('#' + 'noty-' + iD).remove();
          },
          afterClose: function () {
            $(i_block).pulsate({
              color: "#ffccff", // set the color of the pulse
              reach: 100,     // how far the pulse goes in px
              speed: 1100,   // how long one pulse takes in ms
              pause: 100,    // how long the pause between pulses is in ms
              glow: false,    // if the glow should be shown too
              repeat: true,  // will repeat forever if true, if given a number will repeat for that many times
              onHover: false // if true only pulsate if user hovers over the element
            });
          }
        },
        buttons: false
      });
  };
  i_block.addClass('checked');
};

function getRndImage (wt) {
  var imgSize = wallJson.blocks[wt]['options']['imagesize'];
  var imgFile = (wallJson.blocks[wt]).images.stick[imgSize][_.random((wallJson.blocks[wt]).images.stick[imgSize].length - 1)];
  return imgFile;
};

function addWishesRandom (wc) {
  var wc = ($.isNumeric(wc) ? wc : 1),
    arrBlocks = $('.wall-block'),
    bCount = arrBlocks.length;

  for (var i = 1; i <= wc; i++) {

    var cBlock = $(arrBlocks[_.random(bCount - 1)])
      , clW = cBlock.prop('clientWidth') - 20
      , clH = cBlock.prop('clientHeight') - 20;

    var evt = new $.Event("click");
    _.extend(evt, {
        'target':           $(cBlock)
      , 'data-wish-type':   $(cBlock).attr('data-wish-type')
      , 'data-wish-text':   'Atomatically added wish'
      , 'data-wish-submit': true
      , 'offsetLeft':       cBlock.prop('offsetLeft')
      , 'offsetTop':        cBlock.prop('offsetTop')
      , 'pageX':            _.random(clW) + cBlock.prop('offsetLeft')
      , 'pageY':            _.random(clH) + cBlock.prop('offsetTop')
    });
    addWishCell(evt, true);
  };

};

function postWishJson (wc) {
  var ts = $.now(),
    userWishes = wallJson.wishes;
  _.each(userWishes, function(wishType, idx) {
    _.each(wishType.list, function (userData, i) {
      // console.log("userData = ", idx, i, userData);
    });
  });

};
