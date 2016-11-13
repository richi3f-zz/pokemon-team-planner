var clipboard = new Clipboard('#copybtn');
clipboard.on('success', function() {
    document.getElementById("copybtn").innerHTML = "Copied!";
    setTimeout(resetCopyButton, 3000);
});

updateCopyURL();

function updateCopyURL() {
  document.getElementById("copytextbox").value = document.URL;
}

function resetCopyButton() {
  document.getElementById("copybtn").innerHTML = "Copy";
}
