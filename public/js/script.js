//할 것 : 리스트 개수 및 페이지 설정, mongoDB, 찾기기능, 번호 부여하기, 로그인기능

$(document).ready(function () {
  showProductList();
});

async function registerProduct() {
  event.preventDefault()
  let sort = $('#sort').val();
  let compName = $("#compName").val();
  let prodName = $("#prodName").val();
  let regDate = new Date().toLocaleString();
  const result = await fetch('/api/prodReg', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sort,
      compName,
      prodName,
      regDate,
    })
  }).then((res) => res.json())
  if (result.status === 'ok') {
    //everything went fine
    alert(`${prodName} 제품이 등록되었어요!`)
    window.location.reload()
  } else {
    alert(result.error)
  }
}
async function logout(){
$.ajax({
  type: 'GET',
  url: '/logout',
  data: {},
  dataType: 'text',
  success: function (res){
    location.reload
  }
})
  
}


function showProductList() {
  $.ajax({
    type: "GET",
    url: "/list",
    data: {},
    success: function (response) {
      let lists = response['all_lists']
      for (let i = 0; i < lists.length; i++) {
        let index = lists[i];
        let sort = lists[i]['sort']
        let compName = lists[i]['compName']
        let prodName = lists[i]['prodName']
        let regDate = lists[i]['regDate']

        var temp_html = `<tr>
                              <td>${sort}</td>
                              <td>${compName}</td>
                              <td>${prodName}</td>
                              <td>${regDate}</td>
                              <td></td>
                              <td><a href="#" onclick="deleteConfirm('${prodName}')" class="deletebutton">삭제</a></td>
                            </tr>`;
        //등록순에 따라 순서 삽입하기.
        $("#medList").append(temp_html);
        console.log(lists[i])
      }
    }
  })
}

function deleteConfirm(prodName) {
  let confirmAction = confirm("정말로 삭제하시겠어요?");
  if (confirmAction == true) {
    $.ajax({
      type: 'POST',
      url: '/delete',
      data: {
        name_give: prodName
      },
      success: function (response) {
        alert(response['msg']);
        window.location.reload();
      }
    })
  } else {
    alert("삭제가 취소되었어요!")
  }
}

function search() {
  let txt = $("#search").val();
  if (txt == '') {
    alert('텍스트를 입력하세요!')
  } else {
    checked
    alert(txt);
    console.log(checked)
  }
}
