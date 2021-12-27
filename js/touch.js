'use strict';

let isTakeout = null;

// 첫번째와 두번째 팝업 이벤트를 설정하는 함수
const setPopupEvent = function() {
  let firstPopup = document.querySelector('.stand-by-popup');
  let secondPopuBtns = [document.querySelector('.btn--for-here'), document.querySelector('.btn--take-out')];

  firstPopup.addEventListener('click', function() {
    firstPopup.classList.add('stand-by-popup--out');
    document.querySelector('.popup__takeout-desc').classList.remove('popup__takeout-desc--out');
    document.querySelector('.popup__takeout-btns').classList.remove('popup__takeout-btns--out');
    document.querySelector('.popup__takeout-footer').classList.remove('popup__takeout-footer--out')
  }, false);

  secondPopuBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (btn.getAttribute('id') === 'take-out') {
        isTakeout = 1;
      } else {
        isTakeout = 0;
      }

      document.querySelector('.popup__takeout-footer').classList.add('popup__takeout-footer--out');
      setTimeout(function() {
        document.querySelector('.popup__takeout-btns').classList.add('popup__takeout-btns--out');
      }, 200);
      setTimeout(function() {
        document.querySelector('.popup__takeout-desc').classList.add('popup__takeout-desc--out')
      }, 600);
      document.querySelector('.take-out-popup').classList.add('take-out-popup--out');
    }, false);
  });
};
