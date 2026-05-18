const btnJa = document.getElementById("btn-ja");
const stepIntro = document.getElementById("step-intro");
const stepQuestion = document.getElementById("step-question");
const stepResultYes = document.getElementById("step-result-yes");
const stepResultNo = document.getElementById("step-result-no");
const form = document.getElementById("proposal-form");
const statusEl = document.getElementById("form-status");
const choices = form?.querySelector(".choices");
const subjectField = document.getElementById("form-subject");
const messageField = document.getElementById("form-message");

let sending = false;

function showStep(step) {
  [stepIntro, stepQuestion, stepResultYes, stepResultNo].forEach((el) => {
    if (!el) return;
    const active = el === step;
    el.hidden = !active;
    el.classList.toggle("hidden", !active);
    if (active) el.classList.add("visible");
  });
}

if (btnJa && stepIntro && stepQuestion) {
  btnJa.addEventListener("click", () => showStep(stepQuestion));
}

function setStatus(message, type) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = "form-status";
  if (type) statusEl.classList.add(type);
}

function showResult(isYes) {
  document.body.classList.toggle("is-yes", isYes);
  document.body.classList.toggle("is-no", !isYes);
  showStep(isYes ? stepResultYes : stepResultNo);
}

function prepareSubmission(answer) {
  if (subjectField) {
    subjectField.value = `Eline antwoordde: ${answer}`;
  }
  if (messageField) {
    messageField.value = `Haar antwoord op je date-voorstel: ${answer}`;
  }
}

async function sendAnswer() {
  if (!form || !statusEl || sending) return;

  const selected = form.querySelector('[name="antwoord"]:checked');
  if (!selected) return;

  const answer = selected.value;

  const accessKey = form.querySelector('[name="access_key"]')?.value;
  if (!accessKey || accessKey === "YOUR_ACCESS_KEY") {
    setStatus(
      "E-mail is nog niet ingesteld — vervang YOUR_ACCESS_KEY in index.html.",
      "error"
    );
    return;
  }

  prepareSubmission(answer);

  sending = true;
  if (choices) choices.classList.add("is-sending");
  setStatus("Bezig met versturen…", "is-loading");

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
    });
    const data = await response.json();

    if (data.success) {
      showResult(answer === "Ja");
    } else {
      throw new Error(data.message || "Er ging iets mis.");
    }
  } catch {
    setStatus(
      "Het lukte niet om te versturen. Probeer het zo meteen nog eens.",
      "error"
    );
    if (choices) choices.classList.remove("is-sending");
    sending = false;
  }
}

if (form && statusEl) {
  form.querySelectorAll('[name="antwoord"]').forEach((radio) => {
    radio.addEventListener("change", sendAnswer);
  });
}
