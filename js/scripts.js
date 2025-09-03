(function () {
  emailjs.init({
    publicKey: "VeeXu1pJKXwluiN4m",
    blockHeadless: true,
    limitRate: {
      // Set the limit rate for the application
      id: "app",
      // Allow 1 request per 10s
      throttle: 10000,
    },
  });
})();

const handleSubscriptionFormSubmit = (e) => {
  e.preventDefault();
  if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  if (e.stopPropagation) e.stopPropagation();

  const name = document.getElementById("name_input");
  const email = document.getElementById("email_input");

  emailjs
    .send("service_paiwt0a", "template_5tep0ph", {
      name: name.value,
      email: email.value,
    })
    .then(
      function () {
        alert("Tudo ok! Inscrição feita com sucesso.");
        name.value = "";
        email.value = "";
      },
      function (error) {
        alert(
          "Oops! Parece que houve um erro ao se inscrever. Tente novamente..."
        );
      }
    );
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("Email-Form");
  if (form) {
    form.addEventListener("submit", handleSubscriptionFormSubmit, true);
  }
});
