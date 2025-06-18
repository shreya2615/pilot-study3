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
const faceIDs = Array.from({ length: 10 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const audioIDs = Array.from({ length: 20 }, (_, i) => (i + 1).toString().padStart(2, "0"));

const imageQuestions = [
  "How dominant do you think this person is?",
  "How trustworthy do you think this person is?",
  "How honest do you think this person is?",
  "How tall do you think this person is?"
];

const makeSlider = (question, min, max, step, labels) => {
  return {
    type: jsPsychSurveyHtmlForm,
    preamble: `<p><b>${question}</b></p>`,
    html: `<label for='response'>${question}</label><br>
      <input type='range' name='response' min='${min}' max='${max}' step='${step}' style='width: 100%;'><br>
      <div style='display: flex; justify-content: space-between;'>
        <span>${labels[0]}</span><span>${labels[1]}</span>
      </div>`,
    data: { question: question }
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
    <p>After each one, answer four questions about your impression.</p>
    <p>Press SPACE to begin.</p>
  `,
  choices: [' ']
};

let timeline = [consent, instructions];

let imageTrials = faceIDs.map(faceID => {
  const img = `all_images/${group}_face${faceID}_1.png`;
  const questions = [
    makeSlider("How dominant do you think this person is?", 1, 7, 1, ["Not at all", "Extremely"]),
    makeSlider("How trustworthy do you think this person is?", 1, 7, 1, ["Not at all", "Extremely"]),
    makeSlider("How honest do you think this person is?", 1, 7, 1, ["Not at all", "Extremely"]),
    makeSlider("How tall do you think this person is?", 55, 65, 1, ["5'5\"", "6'5\""])
  ];
  return [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<img src='${img}' height='300'><p>Press SPACE to answer questions.</p>`,
      choices: [' '],
      data: { modality: "image", stimulus: img }
    },
    ...questions.map(q => ({ ...q, data: { ...q.data, stimulus: img, modality: "image" } }))
  ];
}).flat();

let audioTrials = audioIDs.map(audioID => {
  const audio = `all_audios/${group}_voice${audioID}_pitch1.wav`;
  const questions = [
    makeSlider("How dominant do you think this person is?", 1, 7, 1, ["Not at all", "Extremely"]),
    makeSlider("How trustworthy do you think this person is?", 1, 7, 1, ["Not at all", "Extremely"]),
    makeSlider("How honest do you think this person is?", 1, 7, 1, ["Not at all", "Extremely"]),
    makeSlider("How tall do you think this person is?", 55, 65, 1, ["5'5\"", "6'5\""])
  ];
  return [
    {
      type: jsPsychAudioKeyboardResponse,
      stimulus: audio,
      prompt: "<p>Press SPACE to answer questions after listening.</p>",
      choices: [' '],
      data: { modality: "audio", stimulus: audio }
    },
    ...questions.map(q => ({ ...q, data: { ...q.data, stimulus: audio, modality: "audio" } }))
  ];
}).flat();

let combinedTrials = [];
while (imageTrials.length || audioTrials.length) {
  if (imageTrials.length) combinedTrials.push(...imageTrials.splice(0, 10));
  if (audioTrials.length) combinedTrials.push(...audioTrials.splice(0, 10));
}

timeline.push(...combinedTrials);

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
