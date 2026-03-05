const loanData = [
  { loan: 'Home Loan', nbfcs: ['Bajaj Housing Finance', 'PNB Housing Finance', 'LIC Housing Finance'] },
  { loan: 'Personal Loan', nbfcs: ['Bajaj Finserv', 'Tata Capital', 'Aditya Birla Finance'] },
  { loan: 'Business Loan', nbfcs: ['L&T Finance', 'Poonawalla Fincorp', 'Hero FinCorp'] },
  { loan: 'Vehicle Loan', nbfcs: ['Mahindra Finance', 'Shriram Finance', 'Muthoot Capital'] },
  { loan: 'Education Loan', nbfcs: ['Avanse Financial', 'InCred', 'Auxilo Finserve'] },
  { loan: 'Gold Loan', nbfcs: ['Muthoot Finance', 'Manappuram Finance', 'IIFL Finance'] }
];

const accountTypeSwitch = document.getElementById('accountTypeSwitch');
const authModeSwitch = document.getElementById('authModeSwitch');
const loginMethodSwitch = document.getElementById('loginMethodSwitch');
const authForm = document.getElementById('authForm');
const message = document.getElementById('authMessage');

const nameField = document.getElementById('name');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('passwordField');
const passwordInput = document.getElementById('password');
const otpField = document.getElementById('otpField');
const otpInput = document.getElementById('otp');
const sendOtpBtn = document.getElementById('sendOtpBtn');

let accountRole = 'user';
let authMode = 'login';
let method = 'password';

function renderLoans() {
  const loanGrid = document.getElementById('loanGrid');
  const nbfcList = document.getElementById('nbfcList');

  loanGrid.innerHTML = loanData
    .map((item) => `<article class="loan-item"><h3>${item.loan}</h3><p class="muted">${item.nbfcs.length} NBFC partners</p></article>`)
    .join('');

  nbfcList.innerHTML = loanData
    .map(
      (item) =>
        `<article class="nbfc-item"><h3>${item.loan}</h3><ul>${item.nbfcs
          .map((nbfc) => `<li>${nbfc}</li>`)
          .join('')}</ul></article>`
    )
    .join('');
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function setActive(container, key, value) {
  container.querySelectorAll('.switch').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset[key] === value);
  });
}

function getUsers() {
  return JSON.parse(localStorage.getItem('finbridgeUsers') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('finbridgeUsers', JSON.stringify(users));
}

function updateFormState() {
  setActive(accountTypeSwitch, 'role', accountRole);
  setActive(authModeSwitch, 'mode', authMode);
  setActive(loginMethodSwitch, 'method', method);

  const isRegister = authMode === 'register';
  nameField.parentElement.classList.toggle('hidden', !isRegister);

  const otpMode = method === 'otp';
  passwordField.classList.toggle('hidden', otpMode);
  otpField.classList.toggle('hidden', !otpMode);
  sendOtpBtn.classList.toggle('hidden', !otpMode);

  passwordInput.required = !otpMode;
  otpInput.required = otpMode;
}

function generateOtp(email) {
  const code = `${Math.floor(100000 + Math.random() * 900000)}`;
  localStorage.setItem(`otp_${email}`, code);
  return code;
}

accountTypeSwitch.addEventListener('click', (event) => {
  const button = event.target.closest('.switch');
  if (!button) return;
  const role = button.dataset.role;
  if (!role) return;
  accountRole = role;
  updateFormState();
});

authModeSwitch.addEventListener('click', (event) => {
  const button = event.target.closest('.switch');
  if (!button) return;
  const mode = button.dataset.mode;
  if (!mode) return;
  authMode = mode;
  updateFormState();
});

loginMethodSwitch.addEventListener('click', (event) => {
  const button = event.target.closest('.switch');
  if (!button) return;
  const selectedMethod = button.dataset.method;
  if (!selectedMethod) return;
  method = selectedMethod;
  updateFormState();
});

sendOtpBtn.addEventListener('click', () => {
  const email = emailField.value.trim().toLowerCase();
  if (!email) {
    showMessage('Please enter your email first to receive OTP.', 'error');
    return;
  }
  const otp = generateOtp(email);
  showMessage(`OTP sent successfully. Demo OTP: ${otp}`, 'success');
});

authForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = nameField.value.trim();
  const email = emailField.value.trim().toLowerCase();
  const password = passwordInput.value;
  const enteredOtp = otpInput.value.trim();

  if (!email) {
    showMessage('Email is required.', 'error');
    return;
  }

  const users = getUsers();
  const existing = users.find((user) => user.email === email && user.role === accountRole);

  if (authMode === 'register') {
    if (!name) {
      showMessage('Full name is required for registration.', 'error');
      return;
    }

    if (existing) {
      showMessage('This account already exists. Please login.', 'error');
      return;
    }

    if (method === 'password' && password.length < 6) {
      showMessage('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (method === 'otp') {
      const otp = localStorage.getItem(`otp_${email}`);
      if (!otp || otp !== enteredOtp) {
        showMessage('Invalid OTP. Click Send OTP and try again.', 'error');
        return;
      }
    }

    users.push({ name, email, role: accountRole, password: method === 'password' ? password : null });
    saveUsers(users);
    showMessage(`Registration successful for ${accountRole.toUpperCase()} account.`, 'success');
    authForm.reset();
    return;
  }

  if (!existing) {
    showMessage('Account not found. Please register first.', 'error');
    return;
  }

  if (method === 'password') {
    if (!existing.password || existing.password !== password) {
      showMessage('Incorrect password.', 'error');
      return;
    }
  } else {
    const otp = localStorage.getItem(`otp_${email}`);
    if (!otp || otp !== enteredOtp) {
      showMessage('Invalid OTP. Please generate a fresh OTP.', 'error');
      return;
    }
  }

  showMessage(`Login successful. Welcome back, ${existing.name}!`, 'success');
});

renderLoans();
updateFormState();
