// === experiment.js ===

const jsPsych = initJsPsych();

const group = jsPsych.randomization.sampleWithoutReplacement(["male", "female"], 1)[0];

const imageAudioFlow = [
  { images: [1, 2], audios: [1, 2, 3, 4] },
  { images: [3, 4], audios: [5, 6, 7, 8] },
  { images: [5, 6], audios: [9, 10, 11, 12] },
  { images: [7, 8], audios: [13, 14, 15, 16] },
  { images: [9, 10], audios: [17, 18, 19, 20] }
];

const logToSheet = trialData => {
  fetch("https://script.google.com/macros/s/AKfycbyE0Z8J3_SInDQuppNN9md8krkqDo_PlzXOeToO7a-f8CTugUy3fKGYT6vgzmzs22TGrA/exec", {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify([trialData])
  });
};

const makeSlider = (stimulusType, stimulusPath, question, min, max, step, labels) => {
  let stimulusHTML = stimulusType === "image"
    ? `<img src='${stimulusPath}' height='300'><br>`
    : `<div style='text-align: center;'><p><b>Click the play button to listen:</b></p><audio controls style='margin-bottom: 10px;'><source src='${stimulusPath}' type='audio/wav'></audio></div>`;

  const scaleHTML = (question.includes("tall") ? ["5'5\"", "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"", "6'2\"", "6'3\"", "6'4\"", "6'5\""] : Array.from({ length: (max - min + 1) }, (_, i) => `${min + i}`)).join("<span style='flex:1'></span>");

  return {
    type: jsPsychSurveyHtmlForm,
    preamble: `${stimulusHTML}<p><i>Please use the slider to make your selection.</i></p>`,
    html: `
      <input type='range' name='response' min='${min}' max='${max}' step='${step}' style='width: 100%;'><br>
      <div style='display: flex; justify-content: space-between;'>
        ${scaleHTML}
      </div>
      <br>
    `,
    data: { question: question, stimulus: stimulusPath, modality: stimulusType },
    on_finish: data => logToSheet(data)
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
    <p>You will be shown faces and voices in alternating order.</p>
    <p>After each one, answer four questions about your impression using a slider.</p>
    <p>Press SPACE to begin.</p>
  `,
  choices: [' ']
};

let timeline = [consent, instructions];

imageAudioFlow.forEach(groupSet => {
  groupSet.images.forEach(imgID => {
    for (let v = 1; v <= 6; v++) {
      const facePath = `all_images/${group}_face${imgID.toString().padStart(2, "0")}_${v}.png`;
      timeline.push(
        makeSlider("image", facePath, "How dominant do you think this person is?", 1, 7, 1),
        makeSlider("image", facePath, "How trustworthy do you think this person is?", 1, 7, 1),
        makeSlider("image", facePath, "How honest do you think this person is?", 1, 7, 1),
        makeSlider("image", facePath, "How tall do you think this person is?", 1, 13, 1)
      );
    }
  });

  groupSet.audios.forEach(audioID => {
    for (let p = 1; p <= 3; p++) {
      const audioPath = `all_audios/${group}_voice${audioID.toString().padStart(2, "0")}_pitch${p}.wav`;
      timeline.push(
        makeSlider("audio", audioPath, "How dominant do you think this person is?", 1, 7, 1),
        makeSlider("audio", audioPath, "How trustworthy do you think this person is?", 1, 7, 1),
        makeSlider("audio", audioPath, "How honest do you think this person is?", 1, 7, 1),
        makeSlider("audio", audioPath, "How tall do you think this person is?", 1, 13, 1)
      );
    }
  });
});

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
