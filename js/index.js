/**
 * Based on http://codepen.io/fabricelejeune/pen/KdWzWg
 */

window.onload = function() {
  var rotateXLimit = 5,
      rotateYLimit = 5,
      lightAngleBase = 45,
      lightWidthBase = 30,
      lightAngleLimit = 20,
      lightWidthLimit = 20,
      lightValues = {
        angle: lightAngleBase,
        width: lightWidthBase
      };

  var card = document.getElementById('floating-card'),
      cardWrapper = card.getElementsByClassName('floating-card-wrapper')[0],
      light = cardWrapper.getElementsByClassName('light')[0];

  cardWrapper.addEventListener('mousemove', function (e) {
    var position = card.getBoundingClientRect(),
        topWithScroll = position.top + document.body.scrollTop,
        topCenter = topWithScroll + (card.clientHeight / 2),
        leftWithScroll = position.left + document.body.scrollLeft,
        leftCenter = leftWithScroll + (card.clientWidth / 2);

    var offsetTop = topCenter - e.pageY,
        offsetLeft = e.pageX - leftCenter;
    var rotateX = offsetTop / topCenter * rotateXLimit;
    var rotateY = offsetLeft / leftCenter * rotateYLimit;

    dynamics.stop(cardWrapper);
    cardWrapper.style.transform = 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';

    lightValues.angle = lightAngleBase - offsetTop / topCenter * lightAngleLimit;
    lightValues.width = lightWidthBase - offsetLeft / leftCenter * lightWidthLimit;

    dynamics.stop(lightValues);
    light.style.background = 'linear-gradient(' + lightValues.angle + 'deg, white, transparent ' + lightValues.width + '%)';
  });

  cardWrapper.addEventListener('mouseleave', function (e) {
    dynamics.animate(cardWrapper, {
      rotateX: 0,
      rotateY: 0
    }, {
      type: dynamics.spring,
      duration: 1500
    });

    dynamics.animate(lightValues, {
      width: lightWidthBase,
      angle: lightAngleBase
    }, {
      type: dynamics.spring,
      duration: 1500,
      change: function (o) {
        light.style.backgroundImage = 'linear-gradient(' + o.angle + 'deg, white, transparent ' + o.width + '%)';
      }
    });
  });
};
