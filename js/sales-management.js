'use strict';


const salesTable = document.querySelector('.admin__sales-table');
const calendarTitle = document.querySelector('.admin__calendar-title');
const dateContainer = document.querySelector('.admin__date-container');
let baseDate = undefined;
// const adminPopup = document.querySelector('.admin-popup');

const displayCalendar = function(date) {
  db.transaction(function(tx) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const lastDate = new Date(year, month, 0).getDate();
    const firstDate = new Date(year, month - 1, 1).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay(); // 현재 month에서 시작 요일 ([일, 월, 화, 수, 목, 금, 토]의 인덱스)
    const endDay = Math.ceil((firstDay + lastDate) / 7) * 7 // 달력에 맞는 날짜 범위를 계산하기 위한 변수

    const startPoint = new Date(`${year}-${month}-${firstDate} 00:00:00`);
    const endPoint = new Date(`${year}-${month}-${lastDate} 23:59:59`);

    // YYYY-mm-dd hh:MM:ss 형식으로 변환
    const startDatetime = getDatetime(startPoint);
    const endDatetime = getDatetime(endPoint);


    tx.executeSql(`
      SELECT STRFTIME('%Y-%m-%d', O.order_date) AS 'by_date', cast(STRFTIME('%d', O.order_date) AS INTEGER) AS 'date', SUM((P.price + S.additional_price) * R1.quantity) AS 'total_price'
      FROM SET_PRODUCT S ,ORDERS R1, ORDER_HISTORY O, OPTION R2, PRODUCT P
      WHERE by_date BETWEEN '${startDatetime}' AND '${endDatetime}'
          AND S.set_no = R1.set_no
          AND O.order_id = R1.order_id
          AND S.set_no = R2.set_no
          AND P.product_no = R2.product_no
      GROUP BY by_date
      `, [], function(tx, res) {
        const orderInfo = new Object();
        for (let i = 0; i < res.rows.length; i++) {
          let row = res.rows.item(i);
          orderInfo[row['date']] = row['total_price'];
        }

        const title = `${year}년 ${month}월`;
        calendarTitle.innerHTML = title;

        let html = '';

        for (let i = 1; i <= endDay; i++) {
          const difference = i - firstDay;
          let totalPrice;
          if (difference <= lastDate && i > firstDay) {
            const day = difference;
            totalPrice = orderInfo.hasOwnProperty(day) ? orderInfo[day] : '';
            totalPrice = totalPrice ? parseInt(totalPrice).toLocaleString('ko-KR') : '';
            html += `<div class="admin__date-sel">${day}`;
            html += `<div class="admin__date-sum p6">${totalPrice}</div>`;
            html += `</div>`;
          } else {
            const day = '';
            html += `<div class="admin__date-sel admin__date-sel--deactivated">`;
            html += `<div class="admin__date-sum p6"></div>`;
            html += `</div>`;
          }
        }
        dateContainer.innerHTML = html;
      }
    );
  },
  function(error) {
    console.log(error);
  },
  function() {

  });
};

const getPrevMonth = function() {
  if (!baseDate) {
    baseDate = new Date(); // today
  }
  const aMonthAgo = new Date(baseDate.setMonth(baseDate.getMonth() - 1));
  console.log(aMonthAgo);
  displayCalendar(aMonthAgo);
}

const getNextMonth = function() {
  if (!baseDate) {
    baseDate = new Date(); // today
  }
  const aMonthLater = new Date(baseDate.setMonth(baseDate.getMonth() + 1));
  console.log(aMonthLater);
  displayCalendar(aMonthLater);
}

// Date 객체를 sqlite의 date format(YYYY-mm-dd hh:MM:ss) 형식으로 변환해주는 함수
const getDatetime = function(date) {
  date.setHours(date.getHours() + 9);
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

const initializeCalendar = (function() {
  const date = new Date();
  displayCalendar(date);
})();

// function() {
//
//
//   for (let i = 1; i <= maxDay; i++) {
//     const diff = i - day;
//     const d = diff <= lastDay && i > day ? diff : '';
//     const tmpClass = !d ? 'background' : '';
//
//     html += `<div class="dateSel ${tmpClass}">${d}</div>`;
//   }
//
//   document.querySelector('.dateSel').innerHTML = html;
//   document.querySelector('.date_text').innerText = `${y}년 ${pad(m)}월`;
// }


// const initializeCalendar = (function() {
//   const date = new Date();
//   const year = date.getFullYear();
//   const month = date.getMonth() + 1;
//   const title = `${year}년 ${month}월`;
//   calendarTitle.innerHTML = title;
//
//   const first_date = new Date(year, month - 1, 1).getDate();
//   const last_date = new Date(year, month, 0).getDate();
//   const first_day = new Date(year, month - 1, 1).getDay();
//
// })();

// const getOrderHistory = (function() {
//   db.transaction(function(tx) {
//     tx.executeSql(`
//       SELECT STRFTIME('%Y-%m-%d', O.order_date) AS 'by_date', SUM((P.price + S.additional_price) * R1.quantity) AS 'total_price'
//       FROM SET_PRODUCT S ,ORDERS R1, ORDER_HISTORY O, OPTION R2, PRODUCT P
//       WHERE S.set_no = R1.set_no
//           AND O.order_id = R1.order_id
//           AND S.set_no = R2.set_no
//           AND P.product_no = R2.product_no
//       GROUP BY by_date
//       `, [], function(tx, res) {
//
//         // let html = '';
//         // html += `<tr>`;
//         // html += `<th class="admin__sales-table--col1">주문 아이디</th>`;
//         // html += `<th class="admin__sales-table--col2"></th>`;
//         // html += `<th class="admin__sales-table--col3">주문 일자</th>`;
//         // html += `</tr>`;
//         //
//         // for (let i = 0; i < res.rows.length; i++) {
//         //   let row = res.rows.item(i);
//         //   const formTaId = row['order_id'];
//         //   const orderDate = row['order_date'];
//         //
//         // }
//         //
//         // orderTable.innerHTML = html;
//       }
//     );
//   },
//   function(error) {
//     console.log(error);
//   },
//   function() {
//
//   });
// })();



// const closeAdminPopup = function() {
//   adminPopup.classList.add('admin-popup--out');
// }
