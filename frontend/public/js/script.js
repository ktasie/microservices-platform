//console.log(window.apiUrl);
// Declare all DOM variables
const domStrings = {
  email: document.querySelector('#email'),
  password: document.querySelector('#password'),
  form: document.querySelector('form'),
  submitBtn: document.querySelector('#submitBtn'),
  error: document.querySelector('#error'),
};

// Login to the backend endpoint
const login = async (e) => {
  e.preventDefault();

  try {
    // Load spinner
    //domStrings.progressBar.classList.remove('d-none');

    // Stringify form inputs
    const raw = JSON.stringify({
      email: domStrings.email.value,
      password: domStrings.password.value,
    });

    //console.log(raw);

    const reqOptions = {
      method: 'POST',
      headers: { 'content-Type': 'application/json' },
      credentials: 'include',
      body: raw,
      redirect: 'follow',
    };

    const resp = await fetch(`${window.apiUrl}/auth`, reqOptions);
    const dataObj = await resp.json();

    if (dataObj.status === 'success') {
      const dataString = JSON.stringify(dataObj);
      // Redirect to download certificate page.
      //console.log(dataString);

      //redirectPostForm('form', 'POST', '/dashboard', dataString);
      window.location.href = '/dashboard';
    } else if (dataObj.status === 'fail') {
      //   console.log(dataObj.data.message);
      throw new Error(`${dataObj.message}`);
    }
  } catch (err) {
    domStrings.error.textContent = `${err.message}`;
    /*
    domStrings.progressBar.classList.add('d-none');
    domStrings.dialog.classList.remove('d-none');
    // domStrings.dialogTitle.textContent = `${err.status}`;
    domStrings.dialogTitle.textContent = 'Fail';
    domStrings.dialogMsg.textContent = `${err.message}`;
    */
  }
};

/*
const closeDialog = () => {
  domStrings.dialog.classList.add('d-none');
}; */

// DOM listener
domStrings.form.addEventListener('submit', login);

/*
domStrings.btnDismiss.addEventListener('click', closeDialog);
domStrings.myCheck.addEventListener('click', function () {
  if (this.checked) {
    domStrings.myPassword.classList.remove('d-none');
  } else {
    domStrings.myPassword.classList.add('d-none');
    domStrings.myPassword.value = '';
  }
}); */
