'use strict';

// 키오스크 화면 좌측의 카테고리 항목 정보를 WeqSQL DB에서 받아온 뒤 알맞은 형태로 출력하는 함수
const initCategory = function() {
  const categoryContainer = document.querySelector('.main__products--category-container');

  db.transaction(function(tx) {
    tx.executeSql(`
      SELECT *
      FROM CATEGORY
    `, [], function(tx, res) {
      let inner = [];

      for (let i = 0; i < res.rows.length; i++) {
        let row = res.rows.item(i);
        let html = '';

        html += `<div class="category category-no${row['category_no']}">`;
        html += `<div class="category__contents">`;
        html += `<div class="category__contents--thumb" style="background: url('${row['category_img']}') center center / contain no-repeat;"></div>`;
        html += `<p class="category__contents--name p5">${row['category_name']}</p>`;
        html += `</div>`;
        html += `</div>`;

        inner.push(html);
      }

      // 초기 선택 메뉴가 버거 카테고리가 되게끔 카테고리 위치 조정
      for (let i = 0; i < inner.length; i++) {
        categoryContainer.innerHTML += inner[(i + 3) % inner.length];
      }
      setCategoryEvent();

    });
  },
  function(error) {
    console.log(error);
  },
  function() {
    displayCategory(1);
  });

};

// 카테고리 객체를 선언하여 카테고리 전체 및 각 카테고리 항목 별 기능과 동작을 설정하는 함수
const setCategoryEvent = function() {
  const category = {
    container: document.querySelector('.main__products--category-container'),
    opacity: [0.2, 0.6, 1, 1, 0.6, 0.2],
    isMousedownNormally: false,
    isChanged: false,
    originPoint: undefined,
    limit: undefined,
    length: 6,
    distanceY: 0,
    prevDistanceY: 0,
    // 카테고리 슬라이드시 적절한 위치로 초기화 하는 메소드
    initialize: function() {
      this.align();
      this.naming();
    },
    // 카테고리 항목 정렬 메소드
    align: function() {
      let i = 0;
      for (let member of this.container.children) {
        member.style.top = `${(11.2 * i) - 5.6}vh`;
        member.style.opacity = this.opacity[i];
        i++;
      }
    },
    // 카테고리 항목 위치별 css를 제어하기 위한 클래스 변경 메소드
    naming: function() {
      for (let member of this.container.children) {
        member.classList.remove('category--border');
        member.classList.remove('category--edge');
        member.classList.remove('category--in')
      }
      this.container.children[0].classList.add('category--border');
      this.container.children[1].classList.add('category--edge');
      this.container.children[2].classList.add('category--in');
      this.container.children[3].classList.add('category--in');
      this.container.children[4].classList.add('category--edge');
      this.container.children[5].classList.add('category--border');
    },
    // 카테고리 슬라이드 애니메이션 및 투명도를 설정하는 메소드
    move: function(e) {
      for (let i = 0; i < this.length; i++) {
        this.container.children[i].style.top = `${(11.2 * i) - 5.6 + pxToVh(this.distanceY)}vh`;
      }

      const ratio = (5.6 - Math.abs(pxToVh(this.distanceY))) / 5.6;
      if (pxToVh(this.distanceY) < 0) {
        [0.1, 0.6, 1, 1, 0.6, 0.1];
        this.container.children[0].style.opacity = `${0.1 * ratio}`;
        this.container.children[1].style.opacity = `${0.1 + 0.5 * ratio}`;
        this.container.children[2].style.opacity = `${0.6 + 0.4 * ratio}`;
        this.container.children[4].style.opacity = `${1 - 0.4 * ratio}`;
        this.container.children[5].style.opacity = `${0.6 - 0.5 * ratio}`;
      }

      if (pxToVh(strToNum(getComputedStyle(this.container.children[0]).top)) < -11.2 || pxToVh(strToNum(getComputedStyle(this.container.children[5]).top)) > 56) {
        this.change();
      }
    },
    // 카테고리 슬라이드 시 경계를 벗어나면 자동으로 조정하여 무한 스크롤 기능을 수행하게 해주는 메소드
    change: function() {
      if (pxToVh(strToNum(getComputedStyle(this.container.children[5]).top)) > 56) {
        /* Downward */
        this.container.insertBefore(this.container.children[5], this.container.children[0]);
        this.originPoint += this.limit;
      } else {
        /* Upward */
        this.container.appendChild(this.container.children[0], this.container.children[5]);
        this.originPoint -= this.limit;
      }
      this.distanceY = 0;
      this.prevDistanceY = 0;
      this.isChanged = true;
      this.naming();
    },
    // 카테고리 애니메이션 수행을 위한 초기값을 설정하는 메소드
    ready: function(e) {
      this.isMousedownNormally = true;
      this.isChanged = false;
      this.originPoint = e.clientY;
      this.limit = this.container.children[2].offsetHeight;
      this.distanceY = this.prevDistanceY = 0;
    },
    // 카테고리 항목을 선택했을 시 수행되는 메소드
    select: function(target) {
      // 적절한 target(category__contents)을 찾기 시도하는 횟수를 10회로, 아닌 경우는 잘못된 클릭으로 간주
      for (let i = 0; i < 10; i++) {
        if (target.classList.contains('category__contents')) {
          break;
        } else {
          target = target.parentNode;
        }
      }

      for (let member of this.container.children) {
        member.children[0].classList.remove('category__contents--selected');
      }
      target.classList.add('category__contents--selected');

      for (let i = 0; i < this.length; i++) {
        if (this.container.children[i].children[0] === target) {
          const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
          const inner = async () => {
            let swap;
            if (i < 3) {
              swap = () => this.container.insertBefore(this.container.children[5], this.container.children[0]);
            } else if (i > 3) {
              swap = () => this.container.appendChild(this.container.children[0], this.container.children[5]);
            }
            for (let k = 0; k < Math.abs(i - 3); k++) {
              swap();
              this.initialize();
              await sleep(30);
            }
          };

          inner();
          break;
        }
      }

      // 주문 수행?
      // productTitle.innerHTML = target.children[1].innerHTML;
      const category_no = parseInt(target.parentNode.classList[1].split('category-no')[1]);
      console.log(category_no);
      displayCategory(category_no);
    }
  };

  // 마우스 클릭 이벤트를 터치 이벤트처럼 작동하게 도와주는 메소드
  category.container.addEventListener('mousedown', function(e) {
    this.ready(e);
    this.container.classList.replace('category--mouse-stop', 'category--mouse-move');
  }.bind(category));

  category.container.addEventListener('mousemove', function(e) {
    if (this.isMousedownNormally) {
      this.distanceY = e.clientY - this.originPoint;
      this.move(e);
    }
    this.prevDistanceY = this.distanceY;
  }.bind(category));

  category.container.addEventListener('mouseup', function(e) {
    // 평범하게 카테고리 항목을 터치한 경우
    if (!this.isChanged && !e.target.classList.contains('category')) {
      this.select(e.target);
    }
    this.align();
    this.container.classList.replace('category--mouse-move', 'category--mouse-stop');
    this.isMousedownNormally = false;
  }.bind(category));

   // 선언된 카테고리 객체에 대한 초기화 메소드 실행
  category.initialize();
};

// px 단위를 vh단위로 알맞게 변환해주는 함수
const pxToVh = function(px) {
  return Math.round(px / window.innerHeight * 1000) / 10
};

// px 단위와 vh 단위가 표기된 value에 대하여 숫자를 추출하는 함수
const strToNum = function(str) {
  return parseFloat(str.replace('px', '').replace('vh', ''))
};
