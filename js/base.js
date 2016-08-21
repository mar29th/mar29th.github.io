/**
 * Created by @tourbillon on 5/2/16.
 */

$(document).ready(function () {
  $('.ui.dropdown.auto').dropdown({
    on: 'hover'
  });
  
  var $menu = $('#menu'),
      $header = $('#header'),
      $content = $('#content');

  $('#intro').visibility({
    observeChanges : false,
    once           : false,
    continuous     : false,
    onBottomPassed: function (calculations) {
      requestAnimationFrame(function () {
        $menu
          .transition('hide')
          .removeClass('inverted')
          .transition('fade in')
          .addClass('fixed')
          .find('.right.item button, i')
          .removeClass('inverted');
        $content
          .css('margin-top', $header.position().top + $header.height() - $menu.position().top);
      });
    },
    onBottomPassedReverse: function (calculations) {
      requestAnimationFrame(function () {
        $menu
          .transition('hide')
          .addClass('inverted')
          .transition('fade in')
          .removeClass('fixed')
          .find('.right.item button, i')
          .addClass('inverted');
        $content.css('margin-top', 0);
      });
    }
  });

});