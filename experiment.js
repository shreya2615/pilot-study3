// === experiment.js ===

const jsPsych = initJsPsych({
  on_finish: () => {
    fetch("https://script.google.com/macros/s/AKfycbxlf2qo2q94se7bWowfgxKXQSXE1Ll3wKmXWvmCv-8cBU8YguYzTcbh2-KxNUvGsoTUQg/exec", {
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

  const scaleHTML = Array.from({ length: (max - min + 1) }, (_, i) => `<span>${min + i}</span>`).join("<span style='flex:1'></span>");

  return {
    type: jsPsychSurveyHtmlForm,
    preamble: `${stimulusHTML}<p><b>${question}</b></p>`,
    html: `
      <label for='response'>${question}</label><br>
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

const imageTrials = blockOrder.flatMap(blockKey => {
  return blockMap[blockKey].flatMap(id => {
    return Array.from({ length: 6 }, (_, v) => `${group}_face${id}_${v + 1}.png`).map(imgName => {
      const imgPath = `all_images/${imgName}`;
      return [
        makeSlider("image", imgPath, "How dominant do you think this person is?", 1, 7, 1, ["1", "7"]),
        makeSlider("image", imgPath, "How trustworthy do you think this person is?", 1, 7, 1, ["1", "7"]),
        makeSlider("image", imgPath, "How honest do you think this person is?", 1, 7, 1, ["1", "7"]),
        makeSlider("image", imgPath, "How tall do you think this person is?", 55, 65, 1, ["5'5\"", "6'5\""])
      ];
    });
  });
}).flat();

const audioTrials = blockOrder.flatMap(blockKey => {
  return blockMap[blockKey].flatMap(id => {
    return Array.from({ length: 3 }, (_, p) => `${group}_voice${id}_pitch${p + 1}.wav`).map(audioName => {
      const audioPath = `all_audios/${audioName}`;
      return [
        makeSlider("audio", audioPath, "How dominant do you think this person is?", 1, 7, 1, ["1", "7"]),
        makeSlider("audio", audioPath, "How trustworthy do you think this person is?", 1, 7, 1, ["1", "7"]),
        makeSlider("audio", audioPath, "How honest do you think this person is?", 1, 7, 1, ["1", "7"]),
        makeSlider("audio", audioPath, "How tall do you think this person is?", 55, 65, 1, ["5'5\"", "6'5\""])
      ];
    });
  });
}).flat();

while (imageTrials.length || audioTrials.length) {
  if (imageTrials.length) timeline.push(...imageTrials.splice(0, 10));
  if (audioTrials.length) timeline.push(...audioTrials.splice(0, 10));
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
