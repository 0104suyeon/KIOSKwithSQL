'use strict';

const categorySelector = document.querySelector('.admin__category-selector > select');
const categoryTable = document.querySelector('.admin__category-table');
const adminPopup = document.querySelector('.admin-popup');
const inputList = document.querySelectorAll('.admin-popup__product-form > .admin-popup__form-tag');

const getCategoryName = (function() {
  db.transaction(function(tx) {
    tx.executeSql(`
      SELECT category_no, category_name
      FROM CATEGORY
      `, [], function(tx, res) {

        let html = `<option value="" disabled selected>==== 선택 ====</option>`;
        for (let i = 0; i < res.rows.length; i++) {
          let row = res.rows.item(i);
          const categoryNo = row['category_no'];
          const categoryName = row['category_name'];
          html += `<option value="${categoryNo}">${categoryName}</option>`;
        }
        categorySelector.innerHTML = html;
      }
    );
  },
  function(error) {
    console.log(error);
  },
  function() {
    // 계속 오류나면 밖으로
    categorySelector.addEventListener('change', function() {
      displayProductTable(categorySelector.value);
    });
    // activateMenuManagement();
  });
})();

const displayProductTable = function(categoryNo) {
  db.transaction(function(tx) {
    tx.executeSql(`
      SELECT P.product_no, P.product_name, P.price, P.is_sale
      FROM CATEGORY C, CATEGORIZATION R, PRODUCT P
      WHERE C.category_no = R.category_no
          AND P.product_no = R.product_no
          AND C.category_no = ${categoryNo}
      `, [], function(tx, res) {

        let html = ``;
        html += `<tr>`;
        html += `<th class="admin__category-table--col1">번호</th>`;
        html += `<th class="admin__category-table--col2">상품 이름</th>`;
        html += `<th class="admin__category-table--col3">가격</th>`;
        html += `<th class="admin__category-table--col4">판매 여부</th>`;
        html += `</tr>`;

        html += `<tr>`;
        html += `<td colspan="4" class="bold"><a href="javascript:editProductAttribute(categoryNo=${categoryNo})">========== 새로운 상품 추가하기 ==========</a></td>`;
        html += `<td></td>`;
        html += `<td></td>`;
        html += `<td></td>`;
        html += `</tr>`;

        // console.log(res.rows)
        for (let i = 0; i < res.rows.length; i++) {
          let row = res.rows.item(i);
          const productNo = row['product_no'];
          const productName = row['product_name'];
          const price = row['price'];
          const isSale = row['is_sale'];

          html += `<tr onclick="editProductAttribute(categoryNo=${categoryNo}, productNo=${productNo})">`;
          html += `<td>${productNo}</td>`;
          html += `<td>${productName}</td>`;
          html += `<td>${price}</td>`;
          html += `<td>${isSale}</td>`;
          html += `</tr>`;
        }
        categoryTable.innerHTML = html;
      }
    );
  },
  function(error) {
    console.log(error);
  },
  function() {

  });
}

const editProductAttribute = function(categoryNo = undefined, productNo = undefined) {
  // console.log(categoryNo, productNo);
  adminPopup.classList.remove('admin-popup--out');
  const greenBtn = document.querySelector('.admin-popup__btns > .green-btn');
  const formCategorySelector = document.querySelector('.admin-popup__product-form > select');
   formCategorySelector.innerHTML = categorySelector.innerHTML;
   initializeInputList();


  // 경우에 따라 인서트 / 업데이트
  if (productNo) {
    db.transaction(function(tx) {
      tx.executeSql(`
        SELECT P.product_name, C.category_no, P.product_img, P.is_sale, S.set_name, P.price + S.additional_price AS 'price', S.set_img, S.set_no
        FROM CATEGORY C, CATEGORIZATION R1, PRODUCT P, OPTION R2, SET_PRODUCT S
        WHERE C.category_no = R1.category_no
            AND P.product_no = R1.product_no
            AND P.product_no = R2.product_no
            AND S.set_no = R2.set_no
            AND P.product_no = ${productNo}
        `, [], function(tx, res) {
          let row = res.rows.item(0);
          const formTags = [row['product_name'], row['category_no'], row['product_img'], row['is_sale']];
          const setNos = [];
          // let productName = row['product_name'];
          // let categoryNo = row['category_no'];
          // let productImg = row['product_img'];
          // let isSale = row['is_sale'];



          for (let i = 0; i < res.rows.length; i++) {
            let row = res.rows.item(i);
            formTags.push(row['set_name'], row['price'], row['set_img']);
            setNos.push(row['set_no'])
          }

          for (const i in formTags) {
            inputList[i].value = formTags[i];
          }

          greenBtn.innerHTML = '수정';
          greenBtn.setAttribute('onclick', `modifyProduct(${productNo})`);

        }
      );
    },
    function(error) {
      console.log(error);
    },
    function() {
      // 계속 오류나면 밖으로
      categorySelector.addEventListener('change', function() {
        displayProductTable(categorySelector.value);
      });


      // activateMenuManagement();
    });


  } else {
    // ### debug  편집 포인트
    inputList[0].value = '더블필레오피쉬';
    inputList[1].value = 1
    inputList[2].value = './img/product/product_no55.png';
    inputList[3].value = 1
    inputList[4].value = '단품';
    inputList[5].value = 6700;
    inputList[6].value = './img/set/set_no113.png';
    inputList[7].value = '세트';
    inputList[8].value = 7000;
    inputList[9].value = './img/set/set_no114.png';
    inputList[10].value = '라지 세트';
    inputList[11].value = 7600;
    inputList[12].value = './img/set/set_no115.png';

    greenBtn.innerHTML = '추가';
    greenBtn.setAttribute('onclick', 'addProduct()');
  }
}

// 메시지박스??
const modifyProduct = function(productNo) {
  db.transaction(function(tx) {
    tx.executeSql(`
      SELECT P.product_no, P.product_name, C.category_no, P.product_img, P.is_sale, S.set_name, P.price + S.additional_price AS 'price', S.set_img, S.set_no
      FROM CATEGORY C, CATEGORIZATION R1, PRODUCT P, OPTION R2, SET_PRODUCT S
      WHERE C.category_no = R1.category_no
          AND P.product_no = R1.product_no
          AND P.product_no = R2.product_no
          AND S.set_no = R2.set_no
          AND P.product_no = ${productNo}
      `, [], function(tx, res) {
        let row = res.rows;
        const setNos = []

        for (let i = 0; i < res.rows.length; i++) {
          const row = res.rows.item(i);
          setNos.push(row['set_no'])
        }

        tx.executeSql(`
          UPDATE CATEGORIZATION
          SET category_no = ${inputList[1].value}
          WHERE product_no = ${productNo}
        `);

        tx.executeSql(`
          UPDATE PRODUCT
          SET product_name = '${inputList[0].value}', price = ${inputList[5].value}, product_img = '${inputList[2].value}', is_sale=${inputList[3].value}
          WHERE product_no = ${productNo}
        `);

        for (let i = 0; i < setNos.length; i++) {

          tx.executeSql(`
            UPDATE SET_PRODUCT
            SET set_name = '${inputList[4+i*3].value}', additional_price = ${parseInt(inputList[5+i*3].value) - parseInt(inputList[5].value)}, set_img = '${inputList[6+i*3].value}'
            WHERE set_no = ${setNos[i]}
          `);
        }
      });
  },
  function(error) {
    console.log(error);
  },
  function() {
    location.reload();

  });
}

const addProduct = function(productNo) {
  db.transaction(function(tx) {
    console.log(inputList);
    tx.executeSql(`
      SELECT MAX(P.product_no)+1 AS 'product_no', MAX(S.set_no)+1 AS 'set_no1', MAX(S.set_no)+2 AS 'set_no2', MAX(S.set_no)+3 AS 'set_no3'
      FROM PRODUCT P, OPTION R, SET_PRODUCT S
      WHERE P.product_no = R.product_no
        AND S.set_no = R.set_no
      `, [], function(tx, res) {
        console.log(res.rows);
        let row = res.rows.item(0);
        const productNo = row['product_no'];
        const setNo1 = row['set_no1'];
        const setNo2 = row['set_no2'];
        const setNo3 = row['set_no3'];

        tx.executeSql(`
          INSERT INTO PRODUCT
          VALUES(?, ?, ?, ?, ?)`, [
            productNo, inputList[0].value, inputList[5].value, inputList[2].value, inputList[3].value
        ]);

        tx.executeSql(`
          INSERT INTO CATEGORIZATION
          VALUES(?, ?)`, [
            productNo, inputList[1].value
        ]);

        if (setNo1) {
          tx.executeSql(`
            INSERT INTO SET_PRODUCT
            VALUES(?, ?, ?, ?)`, [
              setNo1, inputList[4].value, inputList[5].value - inputList[5].value, inputList[6].value
          ], function(tx, res) {
            tx.executeSql(`
              INSERT INTO OPTION
              VALUES(?, ?)`, [
                setNo1, productNo
              ]);
          });
        }


        if (setNo2) {
          tx.executeSql(`
            INSERT INTO SET_PRODUCT
            VALUES(?, ?, ?, ?)`, [
              setNo2, inputList[7].value, inputList[8].value - inputList[5].value, inputList[9].value
          ], function(tx, res) {
            tx.executeSql(`
              INSERT INTO OPTION
              VALUES(?, ?)`, [
                setNo2, productNo
              ]);
          });
        }

        if (setNo3) {
          tx.executeSql(`
            INSERT INTO SET_PRODUCT
            VALUES(?, ?, ?, ?)`, [
              setNo3, inputList[10].value, inputList[11].value - inputList[5].value, inputList[12].value
          ], function(tx, res) {
            tx.executeSql(`
              INSERT INTO OPTION
              VALUES(?, ?)`, [
                setNo3, productNo
              ]);
          });
        }

      }
    );







    // for (let i in PRODUCT) {
    //   tx.executeSql(`INSERT INTO PRODUCT VALUES(?, ?, ?, ?, ?)`, [
    //     PRODUCT[i].product_no, PRODUCT[i].product_name, PRODUCT[i].price, PRODUCT[i].product_img, PRODUCT[i].is_sale
    //   ]);
    // }

    // SET category_no = ${inputList[1].value}
    // WHERE product_no = ${productNo}

    // tx.executeSql(`
    //   UPDATE PRODUCT
    //   SET product_name = '${inputList[0].value}', price = ${inputList[5].value}, product_img = '${inputList[2].value}', is_sale=${inputList[3].value}
    //   WHERE product_no = ${productNo}
    // `);
    //
    // for (let i = 0; i < setNos.length; i++) {
    //
    //   tx.executeSql(`
    //     UPDATE SET_PRODUCT
    //     SET set_name = '${inputList[4+i*3].value}', additional_price = ${parseInt(inputList[5+i*3].value) - parseInt(inputList[5].value)}, set_img = '${inputList[6+i*3].value}'
    //     WHERE set_no = ${setNos[i]}
    //   `);
    // }

  },
  function(error) {
    console.log(error);
  },
  function() {
    location.reload();

  });
}


const initializeInputList = function() {
  for (const inputTag of inputList) {
    inputTag.value = '';
  }
}


const closeAdminPopup = function() {
  adminPopup.classList.add('admin-popup--out');
}
