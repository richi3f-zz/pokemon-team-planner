var clipboard = new Clipboard('.copybtn');

updateCopyURL();

function updateCopyURL() {
  document.getElementById("copytextbox").value = document.URL;
}
