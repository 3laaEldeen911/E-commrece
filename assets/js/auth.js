
document.addEventListener('DOMContentLoaded', function(){

    var USERS_KEY = 'users';
    var CURRENT_USER_KEY = 'currentUser';

    function loadUsers(){
        var raw = localStorage.getItem(USERS_KEY);
        return raw ? JSON.parse(raw) : [];
    }
    function saveUsers(users){
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    function setCurrentUser(user){
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
    function getCurrentUser(){
        var raw = localStorage.getItem(CURRENT_USER_KEY);
        return raw ? JSON.parse(raw) : null;
    }
    function clearCurrentUser(){
        localStorage.removeItem(CURRENT_USER_KEY);
    }


    var current = getCurrentUser();
    var userNameEl = document.getElementById('user-name');
    var loginLink = document.getElementById('login-link');
    var logoutBtn = document.getElementById('logout-btn');
    if(current && userNameEl){ userNameEl.textContent = current.name; userNameEl.style.display = 'inline'; }
    if(current && loginLink){ loginLink.style.display = 'none'; }
    if(logoutBtn){
        logoutBtn.style.display = current ? 'inline-block' : 'none';
        logoutBtn.addEventListener('click', function(e){ e.preventDefault(); clearCurrentUser(); location.reload(); });
    }

    var signupForm = document.getElementById('signup-form');
    if(signupForm){
        signupForm.addEventListener('submit', function(e){
            e.preventDefault();
            var name = document.getElementById('signup-name').value.trim();
            var email = document.getElementById('signup-email').value.trim();
            var password = document.getElementById('signup-password').value;
            var confirm = document.getElementById('signup-confirm').value;
            var errorEl = document.getElementById('auth-error');
            var successEl = document.getElementById('auth-success');

            if(errorEl){ errorEl.style.display = 'none'; }
            if(successEl){ successEl.style.display = 'none'; }

            if(!name || !email || !password){ if(errorEl){ errorEl.textContent = 'Please fill all fields'; errorEl.style.display = 'block'; } return; }
            if(password !== confirm){ if(errorEl){ errorEl.textContent = 'Passwords do not match'; errorEl.style.display = 'block'; } return; }

            var users = loadUsers();
            var exists = users.some(function(u){ return (u.email||'').toLowerCase() === email.toLowerCase(); });
            if(exists){ if(errorEl){ errorEl.textContent = 'Email already registered'; errorEl.style.display = 'block'; } return; }

            var user = { id: Date.now(), name: name, email: email, password: password };
            users.push(user);
            saveUsers(users);
            setCurrentUser({ id: user.id, name: user.name, email: user.email });
            if(successEl){ successEl.textContent = 'Account created!'; successEl.style.display = 'block'; }
            setTimeout(function(){ window.location.href = '../index.html'; }, 600);
        });
    }

    var loginForm = document.getElementById('login-form');
    if(loginForm){
        loginForm.addEventListener('submit', function(e){
            e.preventDefault();
            var email = document.getElementById('login-email').value.trim();
            var password = document.getElementById('login-password').value;
            var errorEl = document.getElementById('auth-error');
            var successEl = document.getElementById('auth-success');

            if(errorEl){ errorEl.style.display = 'none'; }
            if(successEl){ successEl.style.display = 'none'; }

            var users = loadUsers();
            var user = users.find(function(u){ return (u.email||'').toLowerCase() === email.toLowerCase() && u.password === password; });
            if(!user){ if(errorEl){ errorEl.textContent = 'Invalid email or password'; errorEl.style.display = 'block'; } return; }

            setCurrentUser({ id: user.id, name: user.name, email: user.email });
            if(successEl){ successEl.textContent = 'Welcome back!'; successEl.style.display = 'block'; }
            setTimeout(function(){ window.location.href = '../index.html'; }, 500);
        });
    }
});