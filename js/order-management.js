'use strict';

// const categorySelector = document.querySelector('.admin__category-selector > select');
const orderTable = document.querySelector('.admin__order-table');
const adminPopup = document.querySelector('.admin-popup');
const deleteBtn = document.querySelector('.admin-popup__btns .red-btn');
const billOrderNo = document.querySelector('.admin-popup__order-no');
const billList = document.querySelector('.admin-popup__bill-list');
const subTotal = document.querySelector('.admin-popup__subtotal');

const getOrderList = (function() {
  db.transaction(function(tx) {
    tx.executeSql(`
      SELECT order_id, order_date
      FROM ORDER_HISTORY
      `, [], function(tx, res) {

        let html = '';
        html += `<tr>`;
        html += `<th class="admin__order-table--col1">주문 아이디</th>`;
        html += `<th class="admin__order-table--col2"></th>`;
        html += `<th class="admin__order-table--col3">주문 일자</th>`;
        html += `</tr>`;

        for (let i = 0; i < res.rows.length; i++) {
          let row = res.rows.item(i);
          const orderId = row['order_id'];
          const orderDate = row['order_date'];
          html += `<tr onclick="viewOrderDetail(${orderId})">`;
          html += `<td>${orderId}</td>`;
          html += `<td></td>`;
          html += `<td>${orderDate}</td>`;
          html += `</tr>`;
        }

        orderTable.innerHTML = html;
      }
    );
  },
  function(error) {
    console.log(error);
  },
  function() {

  });
})();

const viewOrderDetail = function(orderId) {
  adminPopup.classList.remove('admin-popup--out');
  deleteBtn.setAttribute('onclick', `deleteOrder(${orderId})`);

  db.transaction(function(tx) {
  tx.executeSql(`
    SELECT O.order_id, O.order_date, O.is_takeout, S.set_no, R1.quantity, P.product_name || ' - ' || S.set_name AS 'actual_name', (P.price + S.additional_price) * R1.quantity AS 'total_price'
    FROM SET_PRODUCT S ,ORDERS R1, ORDER_HISTORY O, OPTION R2, PRODUCT P
    WHERE S.set_no = R1.set_no
        AND O.order_id = R1.order_id
        AND S.set_no = R2.set_no
        AND P.product_no = R2.product_no
        AND O.order_id = ${orderId};
    `, [], function(tx, res) {
      let row = res.rows.item(0);
      const orderNo = row['order_id'].substr(8,12);
      const orderDate = row['order_date'];
      const isTakeout = row['is_takeout'];

      billOrderNo.innerHTML = orderNo;

      let html = ``;
      html += `<caption>${orderDate} (${(isTakeout ? 'take out' : 'for here')})</caption>`
      html += `<tr>`;
      html += `<th class="admin__bill-list--col1">QTY</th>`;
      html += `<th class="admin__bill-list--col2">ITEM</th>`;
      html += `<th class="admin__bill-list--col3">TOTAL</th>`;
      html += `</tr>`;

      let subtotal = 0;

      for (let i = 0; i < res.rows.length; i++) {
        let row = res.rows.item(i);
        const qty = row['quantity'];
        const item = row['actual_name'];
        const total = row['total_price'];
        subtotal += total;

        html += `<tr>`;
        html += `<td class="admin__bill-list--col1">${qty}</td>`;
        html += `<td>${item}</td>`;
        html += `<td class="admin__bill-list--col3">${total.toLocaleString('ko-KR')}</td>`;
        html += `</tr>`;
      }

      html += `<tr>`;
      html += `<td class="bold" colspan="2">Subtotal</td>`;
      html += `<td class="admin-popup__subtotal">${subtotal.toLocaleString('ko-KR')}</td>`;
      html += `</tr>`;

      billList.innerHTML = html;
    }
  );
},
function(error) {
  console.log(error);
},
function() {

});
}

const deleteOrder = function(orderId) {
  db.transaction(function(tx) {
   tx.executeSql(`
     DELETE FROM ORDER_HISTORY
     WHERE order_id = ${orderId};
  `);

  tx.executeSql(`
    DELETE FROM ORDERS
    WHERE order_id = ${orderId};
 `);
 },
 function(error) {
   console.log(error);
 },
 function() {

 });
}


const closeAdminPopup = function() {
  adminPopup.classList.add('admin-popup--out');
}
