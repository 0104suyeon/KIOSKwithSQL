'use strict';

// 지속적으로 사용되는 고정 요소들을 코드 블록 상관없이 참조할 수 있게 전역변수로 선언
const productTitle = document.querySelector('.main__products--title');
const productItem = document.querySelector('.main__products--product');
const component = document.querySelector('.main__component');
const covering = document.querySelector('.main__covering');
const componentContents = document.querySelector('.component__contents');
const order = document.querySelector('.main__order');
const orderImg = document.querySelector('.main__order--img');
const orderDescription = document.querySelector('.main__order--description');
const orderContents = document.querySelector('.main__order--contents');
const cart = document.querySelector('.main__cart--container');
const confirmOrderPopup = document.querySelector('.confirm-order-popup');
const totalPriceContainer = document.querySelector('.popup__total-price');
const orderList = document.querySelector('.popup__order-list');

// 실제 데이터베이스에 주문 데이터 업로드 전 최종으로 다루는 주문 관련 전역 데이터
// let setNoArray = [];
const orderData = new Object();
let totalPrice = 0;
let cartQuantity = 0;

// let tmpProductInfo = null;
// let tmpComboMember1 = null;
// let tmpComboMember2 = null;
// let tmpComboMember3 = null;
// let tmpPrice = null;

// let cartPrice = 0;


// let orderBasePrice = 0;
// let orderGroup1Price = 0;
// let orderGroup2Price = 0;

// 스크롤 제어 관련 변수
let isScrolling = false;

// 카테고리를 선택했을 경우 해당 카테고리의 상품들을 출력하는 함수
const displayCategory = function(category_no) {
  db.transaction(function(tx) {
    // let productNos = '';
    // console.log('tr1');
    //
    // tx.executeSql(`
    //   SELECT *
    //   FROM CATEGORY
    //   WHERE category_no=${category_no};
    //   `, [], function(tx, res) {
    //     productTitle.innerHTML = res.rows.item(0)['category_name'];
    //   }
    // );
    //
    // tx.executeSql(`
    //   SELECT P.product_no
    //   FROM CATEGORY C, CATEGORIZATION R, PRODUCT P
    //   WHERE C.category_no = R.category_no
    //     AND P.product_no = R.product_no
    //     AND C.category_no=${category_no};
    //   `, [], function(tx, res) {
    //     for (let i = 0; i < res.rows.length; i++) {
    //       let row = res.rows.item(i);
    //       if (i != 0) {
    //         productNos += ',';
    //       }
    //       productNos += row['product_no'];
    //     }
    //   }
    // );

    tx.executeSql(`
      SELECT C.category_name, P.product_no, P.product_name, P.price, P.product_img
      FROM CATEGORY C, CATEGORIZATION R, PRODUCT P
      WHERE C.category_no = R.category_no
          AND P.product_no = R.product_no
          AND C.category_no = ${category_no}
          AND P.is_sale = 1
      `, [], function(tx, res) {
        productTitle.innerHTML = res.rows.item(0)['category_name'];

        let inner = [];
        for (let i = 0; i < res.rows.length; i++) {
          let row = res.rows.item(i);
          let html = '';
          // let price = togglePriceNotation(row['price']);

          html += `<div class="product product-no${row['product_no']}" onclick="touchProduct(this);">`;
          html +=  `<div class="product__img" style="background: url('${row['product_img']}') center center / cover no-repeat;"></div>`;
          html +=  `<div class="product__name p5">${row['product_name']}</div>`;
          html +=  `<div class="product__price p5">${togglePriceNotation(row['price'])}</div>`;
          html += `</div>`;

          inner.push(html);
        }
        productItem.innerHTML = '';
        for (let i = 0; i < inner.length; i++) {
          productItem.innerHTML += inner[i];
        }
      }
    );
  },
  function(error) {
    console.log(error);
  },
  function() {
    mouseToTouch();
  });

  // product_no 조회
  // db.transaction(function(tx) {
  //
  //   mouseToTouch();
  // },
  // function(error) {
  //   console.log(error);
  // });
};


const mouseToTouch = function() {
  // const productContainer = document.querySelector('.main__products--product');
  const slider = document.querySelector('.main__products--product');
  let isDown = false;
  let startY;
  let scrollTop;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    startY = e.pageY - slider.offsetTop;
    scrollTop = slider.scrollTop;
  });
  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.classList.remove('active');
    setTimeout(() => {isScrolling = false}, 300);
  });
  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.classList.remove('active');
    setTimeout(() => {isScrolling = false}, 300);
  });
  slider.addEventListener('mousemove', (e) => {
    if (!isDown) {
      return
    }
    isScrolling = true;
    e.preventDefault();
    const y = e.pageY - slider.offsetTop;
    const walk = (y - startY) * 1; //scroll-fast
    slider.scrollTop = scrollTop - walk;
  });
}

// 상품을 선택했을 시 해당 상품의 특성에 따라 알맞는 기능을 수행하는 함수
const touchProduct = function(product) {
  if (isScrolling) {
    return
  }

  product.children[0].classList.add('product__img--touched');
  setTimeout(function() {
    product.children[0].classList.remove('product__img--touched');
  }, 200);

  const product_no = product.classList[1].split('product-no')[1];
  const product_name = product.children[1].innerHTML;
  const price = togglePriceNotation(product.children[2].innerHTML);

  initComponent(product_no, product_name, price);
  startComponent();
};

// 해당 상품의 단품, 세트, 라지세트에 맞는 데이터를 받아오는 함수
const initComponent = function(product_no, product_name, price) {
  db.transaction(function(tx) {
    tx.executeSql(`
      SELECT S.set_no, S.set_name, P.price + S.additional_price AS 'actual_price', S.set_img
      FROM PRODUCT P, OPTION R, SET_PRODUCT S
      WHERE S.set_no = R.set_no
      	AND P.product_no = R.product_no
      	AND P.product_no=${product_no};
      `, [], function(tx, res) {

        let inner = [];
        for (let i = 0; i < res.rows.length; i++) {
          let row = res.rows.item(i);
          let html = '';
          let actualPrice = togglePriceNotation(row['actual_price']);

          html += `<div class="option option-no${row['set_no']}" onclick="addCart(this);">`;
          html +=  `<div class="option__img" style="background: url('${row['set_img']}') center center / contain no-repeat;"></div>`;
          html +=  `<div class="option__name p5">${row['set_name']}</div>`;
          html +=  `<div class="option__price p5">${actualPrice}</div>`;
          html += `</div>`;

          inner.push(html);
        }

        componentContents.innerHTML = '';
        for (let i = 0; i < inner.length; i++) {
          componentContents.innerHTML += inner[i];
        }
      }
    );
  },
  function(error) {
    console.log(error);
  });
};


// 단품, 세트, 라지세트를 선택할 수 있는 창을 띄워주는 함수
const startComponent = function() {
  component.classList.replace('component--out', 'component--in');
  covering.classList.replace('covering--out', 'covering--in');

  setTimeout(function() {
    component.style.zIndex = '99';
    covering.style.zIndex = '98';
  }, 300);
};

// 단품, 세트, 라지세트를 선택할 수 있는 창을 닫는 함수
const endComponent = function () {
  covering.classList.replace('covering--in', 'covering--out');

  setTimeout(function() {
    covering.style.zIndex = '0';
    component.style.zIndex = '10';
    component.classList.replace('component--in', 'component--out');
  }, 500);
};


// 장바구니 기능을 수행하도록 하는 함수
const addCart = function(target) {
  let optionNo = parseInt(target.classList[1].replace("option-no", ""));
  let price = togglePriceNotation(target.children[2].innerText);

  totalPrice += price;
  cartQuantity += 1;

  if (cart.classList.contains('main__cart--empty')) {
    cart.classList.remove('main__cart--empty');
    cart.innerHTML = '<div class="main__cart--contents p4"></div>';
  }

  endComponent();

  document.querySelector('.main__cart--contents').innerHTML = `&nbsp;&nbsp;&nbsp;&nbsp;합계 ${togglePriceNotation(totalPrice)}&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;제품: ${cartQuantity}`;

  // 장바구니 데이터 처리
  if (optionNo in orderData) {
    orderData[optionNo] += 1;
  } else {
    orderData[optionNo] = 1;
  }
}

// 세트 구성요소 선택 완료 시 이를 장바구니에 담는 함수
const confirmOrder = function() {
  console.log(orderData);
  if (!cart.classList.contains('main__cart--empty')) {
    confirmOrderPopup.style.display = 'block';
    let inner = [];

    // 주문 확인 페이지 내부
    orderList.innerHTML = '';
    totalPriceContainer.innerHTML = `(${togglePriceNotation(totalPrice)})`;

    db.transaction(function(tx) {
      for (let key in orderData) {
        tx.executeSql(`
          SELECT C.category_no, S.set_no, P.product_name, P.product_name || ' - ' || S.set_name AS 'actual_name', P.price + S.additional_price AS 'actual_price'
          FROM CATEGORY C, CATEGORIZATION R1, PRODUCT P, OPTION R2, SET_PRODUCT S
          WHERE C.category_no = R1.category_no
          	AND P.product_no = R1.product_no
          	AND P.product_no = R2.product_no
          	AND S.set_no = R2.set_no
          	AND S.set_no=${key};
          `, [], function(tx, res) {
            let row = res.rows.item(0);
            let categoryNo = row['category_no'];
            let setNo = row['set_no'];
            let productName = row['product_name'];
            let actualName = row['actual_name'];
            let quantity = orderData[key];
            let actualPrice = row['actual_price'];
            // let actualPrice = togglePriceNotation(row['actual_price'] * quantity);
            let productList = '';

            if (categoryNo === 1) {
              if (actualName.includes('단품')) {
                productList += `${productName}<br />`;
              } else if (name.includes('라지')) {
                productList += `${productName}<br />`;
                productList += `코카-콜라® - 라지<br />`;
                productList += `후렌치 후라이 - 라지`;
              } else {
                productList += `${productName}<br />`;
                productList += `코카-콜라® - 미디엄<br />`;
                productList += `후렌치 후라이 - 미디엄`;
              }
            } else {
              productList += productName;
            }

            let html = '';

            html += `<div class="order-list__unit">`;
            html +=   `<div class="order-list__title">`;
            html +=     `<span class="order-list__name set_no${setNo}"><span class="order-list__quantity">${quantity}</span> x ${actualName}</span>`;
            html +=     `<span class="order-list__price">${togglePriceNotation(row['actual_price'] * quantity)}</span>`;
            html +=     `<span class="order-list__unit-price">${actualPrice}</span>`;
            html +=   `</div>`;
            html +=   `<div class="order-list__detail">${productList}</div>`;
            html +=   `<div class="order-list__menu">`;
            html +=     `<div class="btn green-btn btn--small order-list__delete center-align" onclick="deleteOrderList(this.parentNode.parentNode);">삭제</div>`;
            html +=     `<div class="order-list__quantity-box">${quantity}</div>`;
            html +=     `<div class="btn green-btn btn--small order-list__change center-align" onclick="changeQuantity(this.parentNode.parentNode);">수량 변경</div>`;
            html +=     `<div class="btn red-btn order-list__quantity-increase center-align" onclick="increaseQuantity(this.parentNode.children[1]);">+</div>`;
            html +=     `<div class="btn red-btn order-list__quantity-decrease center-align" onclick="decreaseQuantity(this.parentNode.children[1]);">-</div>`;
            html +=   `</div>`;
            html += `</div>`;

            orderList.innerHTML += html;

          }
        );
      }
    },
    function(error) {
      console.log(error);
    });
  }
};

// 주문 내역 확인 페이지에서 해당 상품을 제거하는 함수
const deleteOrderList = function(unit) {
  if (unit.parentNode.children.length <= 1) {
    cart.innerHTML = '장바구니가 비어있습니다';
    cart.classList.add('main__cart--empty');

    // totalPriceContainer.innerHTML = '';
    totalPrice = 0;
    cartQuantity = 0;
  }

  unit.parentNode.removeChild(unit);
  cartQuantity -= 1;

  recalculateTotalPrice();
  totalPriceContainer.innerHTML = `(${togglePriceNotation(totalPrice)})`;

  let setNo = parseInt(unit.children[0].children[0].classList[1].replace('set_no', ''));
  delete orderData[setNo];
  console.log(orderData);



};

// 주문 내역 확인 페이지에서 이전으로 되돌아가는 함수
const cancelConfirm = function() {
  confirmOrderPopup.style.display = 'none';
  if (!cart.classList.contains('main__cart--empty')) {
    // let price = 0;
    // document.querySelectorAll('.order-list__price').forEach(function(item) {
    //   price += togglePriceNotation(item.innerHTML);
    // });
    //
    // let quantity = 0;
    // document.querySelectorAll('.order-list__quantity-box').forEach(function(item) {
    //   quantity += parseInt(item.innerHTML);
    // });
    recalculateTotalPrice();

    document.querySelector('.main__cart--contents').innerHTML = `&nbsp;&nbsp;&nbsp;&nbsp;합계 ${togglePriceNotation(totalPrice)}&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;제품: ${cartQuantity}`;
  }
};

// 주문 내역 확인 페이지에서 상품의 수량을 변경하는 함수
const increaseQuantity = function(quantityBox) {
  quantityBox.innerHTML = parseInt(quantityBox.innerHTML) + 1;
};

const decreaseQuantity = function(quantityBox) {
  if (parseInt(quantityBox.innerHTML) > 1) {
    quantityBox.innerHTML = parseInt(quantityBox.innerHTML) - 1;
  }
};

const changeQuantity = function(unit) {
  let setNo = parseInt(unit.children[0].children[0].classList[1].replace('set_no', ''));
  let quantity = parseInt(unit.children[2].children[1].innerHTML);

  let unitPrice = parseInt(unit.children[0].children[2].innerHTML);
  let actualPrice = unitPrice * quantity;

  unit.children[0].children[1].innerHTML = togglePriceNotation(actualPrice);
  unit.children[0].children[0].children[0].innerHTML = quantity;

  recalculateTotalPrice();
  totalPriceContainer.innerHTML = `(${togglePriceNotation(totalPrice)})`;

  orderData[setNo] = quantity;
  console.log(orderData);

  return
};

// 주문 내역 확인 페이지에서 주문 내역이 길 경우 스크롤과 함께 터치로도 스크롤 이동이 가능하게 만들어주는 함수
const moveOrderList = function() {
  let originPoint = null;
  let originScroll = null;
  let scrollMax = null;
  let scrollValue = 0;

  document.querySelector('.popup__order-list').addEventListener('mousedown', function(e) {
    originPoint = e.clientY;
    originScroll = this.scrollTop;
    scrollMax = this.scrollHeight - this.offsetHeight;
  });

  document.querySelector('.popup__order-list').addEventListener('mousemove', function(e) {
    if (e.buttons === 1) {
      scrollValue = originScroll + (originPoint - e.clientY);
      this.scrollTo(0, scrollValue);
    }
  });
};

// 가격을 정수 형태와 키오스크 표기 형태(₩ 0,000)로 변환해주는 함수
const togglePriceNotation = function(price) {
  if (typeof(price) === 'number') {
    return '&#8361; ' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } else {
    // 천의 단위 콤마 찍기
    return parseInt(price.trim().replace(/[\{\}\[\]\/?.,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\"]/gi, '').split(' ')[1]);
  }
};

// 주문 상세 페이지의 금액으로 totalPrice를 초기화하는 함수
const recalculateTotalPrice = function() {
  totalPrice = 0;
  for (const priceTag of document.querySelectorAll('.order-list__price')) {
    totalPrice += togglePriceNotation(priceTag.innerText);
  }
}
