async function registerMember() {
  event.preventDefault()
  let useremail = $('#useremail').val();
  let username = $('#username').val();
  let password = $('#userpassword').val();
  let cfpassword = $('#cfpassword').val();
  let CheckValue = $('input:checkbox[id="agreement"]').is(":checked");
  const result = await fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      useremail,
      username,
      password,
      cfpassword,
      CheckValue
    })
  }).then((res) => res.json())
  if (result.status === 'ok') {
    //everything went fine
    alert(`${useremail} 으로 인증메일이 전송되었어요!`)
    location.href = '/'
  } else {
    alert(result.error)
  }
}

function deleteAll() {
  event.preventDefault();
  let useremail = $('#useremail').val('');
  let username = $('#username').val('');
  let password = $('#userpassword').val('');
  let cfpassword = $('#cfpassword').val('')
}