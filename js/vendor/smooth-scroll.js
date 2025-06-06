'use strict';

// Обязательно нужно указать все возможные настройки
const _baseSmoothScroll = {
  listenChange: true,
  duration: 1000,
  positionBlock: 'top',
  margin: 50,
  speed: false,
}

window.requestAnimFrame = function(){
  return (
      window.requestAnimationFrame       || 
      window.webkitRequestAnimationFrame || 
      window.mozRequestAnimationFrame    || 
      window.oRequestAnimationFrame      || 
      window.msRequestAnimationFrame     || 
      function(callback){
          window.setTimeout(callback, 16.666);
      }
  );
}();

function smoothScrollToCoords(block, option) {
  let setting = addStandartOpt(option, _baseSmoothScroll);

  if (typeof block == 'string') {
    block = document.querySelector(block);
  }

  let curentScroll = pageYOffset,
      startDocumentHeight = setting.listenChange ? fullHeightDocument() : 0,
      distanse,
      duration = setting.duration;

  if (setting.positionBlock == 'top') {
    distanse = block.getBoundingClientRect().top - setting.margin;
  } 
  else if (setting.positionBlock == 'bottom') {
    distanse = block.getBoundingClientRect().top + block.offsetHeight - document.documentElement.clientHeight + setting.margin;
  } 
  else if (setting.positionBlock == 'center') {
    distanse = block.getBoundingClientRect().top + (block.offsetHeight/2) - (document.documentElement.clientHeight/2) + setting.margin;
  }

  if (setting.speed) {
    duration = Math.abs(Math.ceil(distanse/setting.speed)) * 100;
  }

  if ('scrollTo' in window) {

    let start = null;
    var keys = {37: 1, 38: 1, 39: 1, 40: 1};

    function preventDefault(e) {
      e.preventDefault();
    }

    function preventDefaultForScrollKeys(e) {
      if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
      }
    }

    // modern Chrome requires { passive: false } when adding event
    var supportsPassive = false;
    try {
      window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
        get: function () { supportsPassive = true; } 
      }));
    } catch(e) {}

    var wheelOpt = supportsPassive ? { passive: false } : false;
    var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    // call this to Disable
    function disableScroll() {
      window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
      window.addEventListener('mousewheel', preventDefault, wheelOpt); // modern desktop
      window.addEventListener('wheel', preventDefault, wheelOpt);
      window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
      window.addEventListener('keydown', preventDefaultForScrollKeys, false);
      
    }

    function enableScroll() {
      window.removeEventListener('DOMMouseScroll', preventDefault, false);
      window.removeEventListener('mousewheel', preventDefault, wheelOpt); // modern desktop
      window.removeEventListener('wheel', preventDefault, wheelOpt);
      window.removeEventListener('touchmove', preventDefault, wheelOpt);
      window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
      
    }

    disableScroll();

    requestAnimFrame(function scroll() {
      let time = Date.now();
      let differenceScroll = 0;
      if (setting.listenChange) {
        differenceScroll = fullHeightDocument() - startDocumentHeight;
      }

      if (start === null) start = time;

      let timeFraction = (time - start) / duration;

      if (timeFraction > 1) { 
        timeFraction = 1;
        enableScroll();
      }

      let progress = Math.sin((timeFraction * Math.PI) / 2);
      window.scrollTo(0, curentScroll + (distanse + differenceScroll)* progress);

      if (curentScroll + (distanse + differenceScroll) * progress <= 0) {
        // timeFraction = 1;
      }      
      
      if (timeFraction < 1) {
        requestAnimFrame(scroll);
      } else {
        enableScroll();
      }
    })
  } else {
    document.documentElement.scrollTop = block.getCoords().top
  }
}

function addStandartOpt(curentOpt, baseOpt) {
  if (!curentOpt) {
    return baseOpt;
  }
  let newObject = {};
  for (let key in baseOpt) {
    newObject[key] = curentOpt[key] !== undefined ? curentOpt[key] : baseOpt[key];
  } 
  return newObject;
}

function getCoords(elem) {
  let box = elem.getBoundingClientRect();
  return {
    top: box.top + pageYOffset,
    bottom: box.top + elem.offsetHeight + pageYOffset,
    left: box.left + pageXOffset
  };
}

function fullHeightDocument() {
  return Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
  );
}