const packageButtons = document.querySelectorAll('.package-btn');
const packageInput = document.getElementById('selected-package');

packageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    packageInput.value = button.dataset.package;
    document.getElementById('request-quote').scrollIntoView({ behavior: 'smooth' });
    packageInput.focus();
  });
});
