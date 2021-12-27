'use strict';

let isInputCard = false;
let countInput = 0;

// 결제하기 버튼을 눌렀을 때 실행되는 함수로, 결제 페이지를 띄워준 뒤 카드 입력(화면 터치) 여부를 확인
const goPayment = function() {
  document.querySelector('.popup__payment-step1').classList.add('popup__payment-step--present');
  document.querySelector('.payment-popup').style.display = 'block';

  setTimeout(function() {
    if (!isInputCard) {
      document.querySelector('.popup__payment-step1').classList.remove('popup__payment-step--present');
      document.querySelector('.payment-popup').style.display = 'none';
    }
  }, 10000);
};

// 카드 입력(화면 터치) 시 수행되는 함수
const inputCard = function() {
  isInputCard = true;

  // 중복클릭 방지
  if (countInput === 0) {
    countInput += 1;
    inputData();
  }
};

// 장바구니 데이터를 키오스크 DB에 전달하기 위해 알맞은 형태로 변환해주는 함수
const inputData = function() {
  console.log('inputdata');
  db.transaction(function(tx) {
    // 최종적으로 DB에 업로드될 데이터를 알맞은 형태로 가공하는 과정
    // 현재 날짜 데이터를 DB에서 다루는 양식에 맞게 연산
    let orderId = '';
    let orderNo = ''
    const ORDER_HISTORY = [];
    const ORDERS = []

    // ################ tmp
    // isTakeout = 1;

    let dateObj = new Date();
    let year = dateObj.getFullYear().toString();
    let month = (dateObj.getMonth()+1).toString().padStart(2, '0');
    let date = dateObj.getDate().toString().padStart(2, '0');
    let hour = dateObj.getHours().toString().padStart(2, '0');
    let minute = dateObj.getMinutes().toString().padStart(2, '0');
    let second = dateObj.getSeconds().toString().padStart(2, '0');

    let startDate = `${year}-${month}-${date} 00:00:00`;
    let orderDate = `${year}-${month}-${date} ${hour}:${minute}:${second}`;

    tx.executeSql(`
      SELECT * FROM ORDER_HISTORY WHERE order_date BETWEEN '${startDate}' AND '${orderDate}'
      `, [], function(tx, res) {
        // const setInfo = [];
        // const priceInfo = [];

        orderNo = (res.rows.length+1).toString().padStart(4, '0');
        orderId = `${year}${month}${date}${orderNo}`;

        document.querySelector('.popup__order-code').innerText = orderNo;

        ORDER_HISTORY.push({order_id: orderId, order_date: orderDate, is_takeout: isTakeout});

        for (const [key, value] of Object.entries(orderData)) {
          // ############## all let -> const?
          const setNo = parseInt(key);
          const quantity = value;
          ORDERS.push({order_id: orderId, set_no: setNo, quantity: quantity});
        }


        // // let orderList = '';
        // for (const [key, value] of Object.entries(orderData)) {
        //   // ############## all let -> const?
        //   const setNo = parseInt(key);
        //   const quantity = value;
        //   setInfo.push([setNo, quantity]);
        //   // orderList += `[${setNo},${quantity}],`;
        // }
        // // orderList = '[' + orderList.slice(0, -1) + ']';

        // 결제할 최종 금액
        // let totalPrice = 0;
        // document.querySelectorAll('.order-list__price').forEach(function(item) {
        //   const price = togglePriceNotation(item.innerHTML);
        //   priceInfo.push(price)
        //   totalPrice += price;
        // });



        // tx.executeSql(`INSERT INTO ORDER_DETAIL VALUES(?, ?, ?, ?, ?, ?)`,
        // orderReuslt, function(tx, res) {
        //   console.log('last');
        //   for (let i = 0; i < setInfo.length; i++) {
        //     const saleResult = [orderId, orderDate, setInfo[i][0], setInfo[i][1], priceInfo[i]];
        //     console.log(saleResult);
        //     tx.executeSql(`INSERT INTO SALE_STATICS(order_id, order_date, set_no, quantity, price) VALUES(?, ?, ?, ?, ?)`,
        //     saleResult, function(tx, res) {
        //       proceedPaymentStep();
        //
        //     });
        //   }
        // });

        // ########### insert에서 from을 ORDER_HISTORY에서 받아온걸로 넣으면 어때?
        tx.executeSql(`INSERT INTO ORDER_HISTORY VALUES(?, ?, ?)`, [
          ORDER_HISTORY[0].order_id, ORDER_HISTORY[0].order_date, ORDER_HISTORY[0].is_takeout
        ]);

        for (let i in ORDERS) {
          tx.executeSql(`INSERT INTO ORDERS VALUES(?, ?, ?)`, [
            ORDERS[i].order_id, ORDERS[i].set_no, ORDERS[i].quantity
          ]);
        }
      }
    );
  },
  function(error) {
    console.log(error);
  },
  function() {
    proceedPaymentStep();
  });
}


const inputData2 = function() {
  db.transaction(function(tx) {
    // 최종적으로 DB에 업로드될 데이터를 알맞은 형태로 가공하는 과정
    // 현재 날짜 데이터를 DB에서 다루는 양식에 맞게 연산
    let orderId = '';
    let orderNo = ''

    // ################ tmp
    isTakeout = 1;

    let dateObj = new Date();
    let year = dateObj.getFullYear().toString();
    let month = (dateObj.getMonth()+1).toString().padStart(2, '0');
    let date = dateObj.getDate().toString().padStart(2, '0');
    let hour = dateObj.getHours().toString().padStart(2, '0');
    let minute = dateObj.getMinutes().toString().padStart(2, '0');
    let second = dateObj.getSeconds().toString().padStart(2, '0');

    let startDate = `${year}-${month}-${date} 00:00:00`;
    let orderDate = `${year}-${month}-${date} ${hour}:${minute}:${second}`;

    tx.executeSql(`
      SELECT * FROM ORDER_DETAIL WHERE order_date BETWEEN '${startDate}' AND '${orderDate}'
      `, [], function(tx, res) {
        const setInfo = [];
        const priceInfo = [];

        orderNo = (res.rows.length+1).toString().padStart(4, '0');
        orderId = `${year}${month}${date}${orderNo}`;

        document.querySelector('.popup__order-code').innerText = orderNo;

        let orderList = '';
        for (const [key, value] of Object.entries(orderData)) {
          // ############## all let -> const?
          const setNo = parseInt(key);
          const quantity = value;
          setInfo.push([setNo, quantity]);
          orderList += `[${setNo},${quantity}],`;
        }
        orderList = '[' + orderList.slice(0, -1) + ']';

        // 결제할 최종 금액
        let totalPrice = 0;
        document.querySelectorAll('.order-list__price').forEach(function(item) {
          const price = togglePriceNotation(item.innerHTML);
          priceInfo.push(price)
          totalPrice += price;
        });

        const orderReuslt = [orderId, orderNo, orderDate, isTakeout, orderList, totalPrice];
        console.log(setInfo);
        console.log(priceInfo);

        // console.log(orderReuslt);

        tx.executeSql(`INSERT INTO ORDER_DETAIL VALUES(?, ?, ?, ?, ?, ?)`,
        orderReuslt, function(tx, res) {
          console.log('last');
          for (let i = 0; i < setInfo.length; i++) {
            const saleResult = [orderId, orderDate, setInfo[i][0], setInfo[i][1], priceInfo[i]];
            console.log(saleResult);
            tx.executeSql(`INSERT INTO SALE_STATICS(order_id, order_date, set_no, quantity, price) VALUES(?, ?, ?, ?, ?)`,
            saleResult, function(tx, res) {
              proceedPaymentStep();

            });
          }
        });
      }
    );
  },
  function(error) {
    console.log(error);
  });
}

// 결제 페이지의 단계별 안내 화면을 출력해주는 함수
const proceedPaymentStep = function() {
  let step1 = document.querySelector('.popup__payment-step1');
  let step2 = document.querySelector('.popup__payment-step2');
  let step3 = document.querySelector('.popup__payment-step3');
  setTimeout(function() {
    step1.classList.remove('popup__payment-step--present');
  }, 0);

  // 5초 유지
  setTimeout(function() {
    step2.classList.add('popup__payment-step--present');
  }, 200);

  setTimeout(function() {
    step2.classList.remove('popup__payment-step--present');
  }, 5200);

   // 3초 유지
  setTimeout(function() {
    step3.classList.add('popup__payment-step--present');
  }, 5400);

  setTimeout(function() {
    step1.innerHTML = '';
    step2.innerHTML = '';
    location.reload();
  }, 7400);
};
