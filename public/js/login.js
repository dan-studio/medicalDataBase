const { request } = require("http");

async function login() {
  event.preventDefault()
  let useremail = $('#useremail').val();
  let password = $('#userpassword').val();
  const result = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      useremail,
      password,
    })
  }).then((res) => res.json())
  if(result.status === 'ok'){
    //everything went fine
    console.log('Got The Token: ', result.data)
    localStorage.setItem('token', result.data)
    location.href ='/login'
  }else{
    alert(result.error)
  }
  
}