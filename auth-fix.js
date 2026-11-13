/* Clear feedback for Firebase email/password sign-up and login. Loaded after app.js. */
(() => {
  const setStatus = (message, isError = false) => {
    const status = document.getElementById("authStatus");
    if (!status) return;
    status.textContent = message;
    status.style.color = isError ? "#ff9a9a" : "#dfefff";
  };

  const messageFor = error => {
    const code = error && error.code;
    const messages = {
      "auth/email-already-in-use": "This email already has an account. Please log in instead.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/weak-password": "Choose a password with at least 6 characters.",
      "auth/operation-not-allowed": "Email/password sign-in is not enabled in Firebase Authentication.",
      "auth/unauthorized-domain": "This website domain is not authorized in Firebase Authentication. Add medmsm.github.io under Authentication → Settings → Authorized domains.",
      "auth/network-request-failed": "Network error. Check your connection and try again.",
      "auth/user-not-found": "No account was found for this email. Create an account first.",
      "auth/wrong-password": "The password is incorrect. Please try again.",
      "auth/invalid-credential": "The email or password is incorrect.",
      "auth/too-many-requests": "Too many attempts. Wait a while and try again."
    };
    return messages[code] || (error && error.message) || "Something went wrong. Please try again.";
  };

  const intercept = (id, action) => {
    const button = document.getElementById(id);
    if (!button) return;
    button.addEventListener("click", async event => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const auth = window.firebase && firebase.auth ? firebase.auth() : null;
      if (!auth) {
        setStatus("Firebase Auth did not load. Check your connection and reload the page.", true);
        return;
      }

      const email = document.getElementById("emailInput")?.value.trim();
      const password = document.getElementById("passwordInput")?.value || "";
      if (!email || !password) {
        setStatus("Enter both your email and password.", true);
        return;
      }
      if (action === "signup" && password.length < 6) {
        setStatus("Choose a password with at least 6 characters.", true);
        return;
      }

      button.disabled = true;
      setStatus(action === "signup" ? "Creating your account…" : "Signing in…");
      try {
        if (action === "signup") {
          const credential = await auth.createUserWithEmailAndPassword(email, password);
          setStatus(`Account created and signed in as ${credential.user.email}.`);
          // Profile data is optional; do not make a successful Auth account look like a failed signup.
          try {
            if (firebase.firestore) {
              await firebase.firestore().collection("users").doc(credential.user.uid).set({
                email: credential.user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
              }, { merge: true });
            }
          } catch (profileError) {
            console.error("Account created, but the optional Firestore profile could not be saved:", profileError);
            setStatus(`Account created and signed in as ${credential.user.email}. Profile data could not be saved; check Firestore rules.`);
          }
        } else {
          const credential = await auth.signInWithEmailAndPassword(email, password);
          setStatus(`Signed in as ${credential.user.email}.`);
        }
      } catch (error) {
        console.error(`${action} failed:`, error);
        setStatus(messageFor(error), true);
      } finally {
        button.disabled = false;
      }
    }, true);
  };

  intercept("signupBtn", "signup");
  intercept("loginBtn", "login");
})();
