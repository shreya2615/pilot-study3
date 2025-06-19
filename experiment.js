// === experiment.js ===

const jsPsych = initJsPsych({
  on_finish: () => {
    fetch("https://script.google.com/macros/s/AKfycbwF5CwxYFuKVV3k0Ua0FQogfCQ4FE0V9-FYexYHP23UK4mfoLMZyUHv1k-Ech69mSGpdA/exec", {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(jsPsych.data.get().values())
    });
  }
});

const group = jsPsych.randomization.sampleWithoutReplacement(["male", "female"], 1)[0];
const blockMap = {
  a: Array.from({ length: 10 }, (_, i) => (i + 1).toString().padStart(2, "0")),
  b: Array.from({ length: 10 }, (_, i) => (i + 11).toString().padStart(2, "0")),
  c: Array.from({ length: 10 }, (_, i) => (i + 21).toString().padStart(2, "0"))
};
const blockOrder = ["a", "b", "c"];

const makeSlider = (stimulusType, stimulusPath, question, min, max, step, labels) => {
  let stimulusHTML = stimulusType === "image"
    ? `<img src='${stimulusPath}' height='300'><br>`
    : `<div style='text-align: center;'><p><b>Click the play button to listen:</b></p><audio controls style='margin-bottom: 10px;'><source src='${stimulusPath}' type='audio/wav'></audio></div>`;

  const scaleHTML = (question.includes("tall") ? ["5'5\"", "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"", "6'2\"", "6'3\"", "6'4\"", "6'5\""] : Array.from({ length: (max - min + 1) }, (_, i) => `${min + i}`)).join("<span style='flex:1'></span>");

  return {
    type: jsPsychSurveyHtmlForm,
    preamble: `${stimulusHTML}<p><b>${question}</b></p><p><i>Please use the slider to make your selection.</i></p>`,
    html: `
      <input type='range' name='response' min='${min}' max='${max}' step='${step}' style='width: 100%;'><br>
      <div style='display: flex; justify-content: space-between;'>
        ${scaleHTML}
      </div>
      <br>
    `,
    data: { question: question, stimulus: stimulusPath, modality: stimulusType }
  };
};

const consent = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <h2>Consent Form</h2>
    <p>By participating, you agree to take part in this study.</p>
    <p style="margin-top: 20px;">
      <strong>Please complete this form before proceeding:</strong><br>
      <a href="https://docs.google.com/forms/d/e/your-google-form-id/viewform" target="_blank" 
         style="font-size:18px; color:blue; text-decoration:underline; display:inline-block; margin-top:10px;">
        👉 Click here to open the Google Form
      </a>
    </p>
    <p style="margin-top: 40px;">Press SPACE to continue or 0 to exit.</p>
  `,
  choices: [' ', '0'],
  on_finish: data => {
    if (data.response === 48) jsPsych.endExperiment("You chose not to participate.");
  }
};

const instructions = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>You will be shown faces and voices in random order.</p>
    <p>After each one, answer four questions about your impression using a slider.</p>
    <p>Press SPACE to begin.</p>
  `,
  choices: [' ']
};

let timeline = [consent, instructions];

let imageTrials = [];
let audioTrials = [];

blockOrder.forEach(blockKey => {
  const ids = blockMap[blockKey];

  ids.forEach(id => {
    // Push 6 image variants × 4 questions each
    for (let v = 1; v <= 6; v++) {
      const img = `all_images/${group}_face${id}_${v}.png`;
      imageTrials.push(
        makeSlider("image", img, "How dominant do you think this person is?", 1, 7, 1),
        makeSlider("image", img, "How trustworthy do you think this person is?", 1, 7, 1),
        makeSlider("image", img, "How honest do you think this person is?", 1, 7, 1),
        makeSlider("image", img, "How tall do you think this person is?", 1, 13, 1)
      );
    }

    // Push 3 audio variants × 4 questions each
    for (let p = 1; p <= 3; p++) {
      const audio = `all_audios/${group}_voice${id}_pitch${p}.wav`;
      audioTrials.push(
        makeSlider("audio", audio, "How dominant do you think this person is?", 1, 7, 1),
        makeSlider("audio", audio, "How trustworthy do you think this person is?", 1, 7, 1),
        makeSlider("audio", audio, "How honest do you think this person is?", 1, 7, 1),
        makeSlider("audio", audio, "How tall do you think this person is?", 1, 13, 1)
      );
    }
  });
});

// Interleave: 10 images then 10 audios, repeat
while (imageTrials.length || audioTrials.length) {
  if (imageTrials.length) timeline.push(...imageTrials.splice(0, 40));
  if (audioTrials.length) timeline.push(...audioTrials.splice(0, 40));
}

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <h2>Thank you for participating!</h2>
    <p>Your responses have been recorded.</p>
    <p>You may now close this window.</p>
  `,
  choices: "NO_KEYS",
  trial_duration: 5000
});

jsPsych.run(timeline);
