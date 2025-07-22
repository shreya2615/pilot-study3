const jsPsych = initJsPsych();

const group = jsPsych.randomization.sampleWithoutReplacement(["male", "female"], 1)[0];

const imageAudioFlow = [
  { images: [1, 2], audios: [1, 2, 3, 4] },
  { images: [3, 4], audios: [5, 6, 7, 8] },
  { images: [5, 6], audios: [9, 10, 11, 12] },
  { images: [7, 8], audios: [13, 14, 15, 16] },
  { images: [9, 10], audios: [17, 18, 19, 20] }
];

// === Log to Google Sheet ===
const logToSheet = trialData => {
  fetch("https://script.google.com/macros/s/AKfycbwYsAlfJ-iaUD5vU93CravpfjDrUwhNtq0ELbQLb8wzLOXfMi0QFKMmkZpsja9lNiYJ3w/exec", {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify([trialData])
  });
};

// === Consent and Instructions ===
const consent = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <h2>Welcome to the experiment</h2>
    <p>In this study, you will complete a series of tasks involving images and audio clips.</p>
    <p style="margin-top: 20px;">
      <strong>Please ensure you're in a quiet space.</strong><br>
      <a href="https://docs.google.com/forms/d/e/your-google-form-id/viewform" target="_blank" 
         style="font-size:18px; color:blue; text-decoration:underline; display:inline-block; margin-top:10px;">
        If you wish to stop at any time, just close the window. Your data will not be recorded.
      </a>
    </p>
    <p style="margin-top: 40px;">Press SPACE to continue, or 0 to decline.</p>
  `,
  choices: [' ', '0'],
  on_finish: data => {
    if (data.response === 48) jsPsych.endExperiment("You chose not to participate.");
  }
};

const instructions = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>You will be shown a face or a voice in alternating order.</p>
    <p>After each, you will answer four questions about your impression.</p>
    <p>Each question will appear one at a time on the same screen as the face or audio.</p>
    <p>Press SPACE to begin.</p>
  `,
  choices: [' ']
};

let timeline = [consent, instructions];

// === Helper Functions for Questions Under One Stimulus ===
const makeImageBlock = (facePath) => {
  return {
    timeline: [
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
          <img src='${facePath}' height='300'><br><br>
          <p><b>1. How dominant do you think this person is?</b><br>(1 = not at all, 7 = very)</p>
        `,
        choices: ['1','2','3','4','5','6','7'],
        data: { question: "dominant", stimulus: facePath, modality: "image" },
        on_finish: data => logToSheet(data)
      },
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
          <img src='${facePath}' height='300'><br><br>
          <p><b>2. How trustworthy do you think this person is?</b></p>
        `,
        choices: ['1','2','3','4','5','6','7'],
        data: { question: "trustworthy", stimulus: facePath, modality: "image" },
        on_finish: data => logToSheet(data)
      },
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
          <img src='${facePath}' height='300'><br><br>
          <p><b>3. How honest do you think this person is?</b></p>
        `,
        choices: ['1','2','3','4','5','6','7'],
        data: { question: "honest", stimulus: facePath, modality: "image" },
        on_finish: data => logToSheet(data)
      },
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
          <img src='${facePath}' height='300'><br><br>
          <p><b>4. How tall do you think this person is?</b><br>(1 = 5'5", 13 = 6'5")</p>
        `,
        choices: ['1','2','3','4','5','6','7','8','9','10','11','12','13'],
        data: { question: "tall", stimulus: facePath, modality: "image" },
        on_finish: data => logToSheet(data)
      }
    ]
  };
};

const makeAudioBlock = (audioPath) => {
  return {
    timeline: [
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
          <audio controls autoplay><source src="${audioPath}" type="audio/wav"></audio><br><br>
          <p><b>1. How dominant do you think this person is?</b></p>
        `,
        choices: ['1','2','3','4','5','6','7'],
        data: { question: "dominant", stimulus: audioPath, modality: "audio" },
        on_finish: data => logToSheet(data)
      },
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
          <audio controls><source src="${audioPath}" type="audio/wav"></audio><br><br>
          <p><b>2. How trustworthy do you think this person is?</b></p>
        `,
        choices: ['1','2','3','4','5','6','7'],
        data: { question: "trustworthy", stimulus: audioPath, modality: "audio" },
        on_finish: data => logToSheet(data)
      },
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
          <audio controls><source src="${audioPath}" type="audio/wav"></audio><br><br>
          <p><b>3. How honest do you think this person is?</b></p>
        `,
        choices: ['1','2','3','4','5','6','7'],
        data: { question: "honest", stimulus: audioPath, modality: "audio" },
        on_finish: data => logToSheet(data)
      },
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
          <audio controls><source src="${audioPath}" type="audio/wav"></audio><br><br>
          <p><b>4. How tall do you think this person is?</b><br>(1 = 5'5", 13 = 6'5")</p>
        `,
        choices: ['1','2','3','4','5','6','7','8','9','10','11','12','13'],
        data: { question: "tall", stimulus: audioPath, modality: "audio" },
        on_finish: data => logToSheet(data)
      }
    ]
  };
};

// === Build Image and Audio Blocks ===
let imageBlocks = [];
let audioBlocks = [];

imageAudioFlow.forEach(set => {
  set.images.forEach(imgID => {
    const variants = jsPsych.randomization.shuffle([1, 2, 3, 4, 5, 6]);
    variants.forEach(v => {
      const facePath = `all_images/${group}_face${imgID.toString().padStart(2, "0")}_${v}.png`;
      imageBlocks.push(makeImageBlock(facePath));
    });
  });

  set.audios.forEach(audioID => {
    const pitches = jsPsych.randomization.shuffle([1, 2, 3]);
    pitches.forEach(p => {
      const audioPath = `all_audios/${group}_voice${audioID.toString().padStart(2, "0")}_pitch${p}.wav`;
      audioBlocks.push(makeAudioBlock(audioPath));
    });
  });
});

// === Interleave image and audio blocks ===
let combined = [];
const max = Math.max(imageBlocks.length, audioBlocks.length);
for (let i = 0; i < max; i++) {
  if (i < imageBlocks.length) combined.push(imageBlocks[i]);
  if (i < audioBlocks.length) combined.push(audioBlocks[i]);
}

timeline = timeline.concat(combined);

// === Final Thank You Screen ===
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
