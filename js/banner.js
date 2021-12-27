'use strict';

// 키오스크 메인 화면의 상단에 존재하는 배너의 슬라이드 애니메이션 설정하는 함수
const slideBanner = function() {
  let slides = document.querySelector('.main__banner').children;
  let conditions = ['slide--in', 'slide--out', 'slide--wait'];
  let count = 0;

  slides[0].classList.replace(conditions[2], conditions[0]);

  function auto() {
    slides[(count+0)%3].classList.replace(conditions[(count+0)%3], conditions[(count+1)%3]);
    slides[(count+1)%3].classList.replace(conditions[(count+2)%3], conditions[(count+0)%3]);
    slides[(count+2)%3].classList.replace(conditions[(count+1)%3], conditions[(count+2)%3]);

    count++;
  }

  setInterval(auto, 3000);
};
