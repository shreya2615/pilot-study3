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
  fetch("https://script.google.com/macros/s/AKfycbwYsAlfJ-iaUD5vU93CravpfjDrUwhNtq0ELbQLb8wzLOXfMi0QFKMmkZpsja9lNiYJ3w/exec", {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([trialData])
  });
};

const consent = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <h2>Welcome to the experiment</h2>
    <p>In this study, you will complete tasks involving faces and voices.</p>
    <p style="margin-top: 20px;">
      <strong>Please ensure you are in a quiet space.</strong><br>
      <a href="https://docs.google.com/forms/d/e/your-google-form-id/viewform" target="_blank" 
         style="font-size:18px; color:blue; text-decoration:underline; display:inline-block; margin-top:10px;">
        If you wish to stop at any point, simply close this page.
      </a>
    </p>
    <p style="margin-top: 40px;">Press SPACE to continue, or 0 to opt out.</p>
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
    <p>After each, you will answer four questions one at a time using sliders.</p>
    <p>Press SPACE to begin.</p>
  `,
  choices: [' ']
};

let timeline = [consent, instructions];

// === Helper Functions ===

const makeImageBlock = (facePath) => {
  return {
    timeline: [
      {
        type: jsPsychSurveyHtmlForm,
        preamble: `<img src="${facePath}" height="300"><br><p><b>1. How dominant do you think this person is?</b></p>`,
        html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
               <div style='display: flex; justify-content: space-between;'><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span></div>`,
        data: { question: "dominant", stimulus: facePath, modality: "image" },
        on_finish: logToSheet
      },
      {
        type: jsPsychSurveyHtmlForm,
        preamble: `<img src="${facePath}" height="300"><br><p><b>2. How trustworthy do you think this person is?</b></p>`,
        html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
               <div style='display: flex; justify-content: space-between;'><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span></div>`,
        data: { question: "trustworthy", stimulus: facePath, modality: "image" },
        on_finish: logToSheet
      },
      {
        type: jsPsychSurveyHtmlForm,
        preamble: `<img src="${facePath}" height="300"><br><p><b>3. How honest do you think this person is?</b></p>`,
        html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
               <div style='display: flex; justify-content: space-between;'><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span></div>`,
        data: { question: "honest", stimulus: facePath, modality: "image" },
        on_finish: logToSheet
      },
      {
        type: jsPsychSurveyHtmlForm,
        preamble: `<img src="${facePath}" height="300"><br><p><b>4. How tall do you think this person is?</b> (1 = 5'5", 13 = 6'5")</p>`,
        html: `<input type='range' name='response' min='1' max='13' step='1' style='width: 100%;'><br>
               <div style='display: flex; justify-content: space-between;'><span>5'5"</span><span></span><span></span><span>6'0"</span><span></span><span></span><span>6'5"</span></div>`,
        data: { question: "tall", stimulus: facePath, modality: "image" },
        on_finish: logToSheet
      }
    ]
  };
};

const makeAudioBlock = (audioPath) => {
  return {
    timeline: [
      {
        type: jsPsychSurveyHtmlForm,
        preamble: `<audio controls autoplay><source src="${audioPath}" type="audio/wav"></audio><br><p><b>1. How dominant do you think this person is?</b></p>`,
        html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
               <div style='display: flex; justify-content: space-between;'><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span></div>`,
        data: { question: "dominant", stimulus: audioPath, modality: "audio" },
        on_finish: logToSheet
      },
      {
        type: jsPsychSurveyHtmlForm,
        preamble: `<audio controls><source src="${audioPath}" type="audio/wav"></audio><br><p><b>2. How trustworthy do you think this person is?</b></p>`,
        html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
               <div style='display: flex; justify-content: space-between;'><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span></div>`,
        data: { question: "trustworthy", stimulus: audioPath, modality: "audio" },
        on_finish: logToSheet
      },
      {
        type: jsPsychSurveyHtmlForm,
        preamble: `<audio controls><source src="${audioPath}" type="audio/wav"></audio><br><p><b>3. How honest do you think this person is?</b></p>`,
        html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
               <div style='display: flex; justify-content: space-between;'><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span></div>`,
        data: { question: "honest", stimulus: audioPath, modality: "audio" },
        on_finish: logToSheet
      },
      {
        type: jsPsychSurveyHtmlForm,
        preamble: `<audio controls><source src="${audioPath}" type="audio/wav"></audio><br><p><b>4. How tall do you think this person is?</b> (1 = 5'5", 13 = 6'5")</p>`,
        html: `<input type='range' name='response' min='1' max='13' step='1' style='width: 100%;'><br>
               <div style='display: flex; justify-content: space-between;'><span>5'5"</span><span></span><span></span><span>6'0"</span><span></span><span></span><span>6'5"</span></div>`,
        data: { question: "tall", stimulus: audioPath, modality: "audio" },
        on_finish: logToSheet
      }
    ]
  };
};

// === Generate All Image and Audio Trials ===
let imageBlocks = [];
let audioBlocks = [];

imageAudioFlow.forEach(set => {
  set.images.forEach(imgID => {
    const variants = jsPsych.randomization.shuffle([1, 2, 3, 4, 5, 6]);
    variants.forEach(v => {
      const path = `all_images/${group}_face${imgID.toString().padStart(2, "0")}_${v}.png`;
      imageBlocks.push(makeImageBlock(path));
    });
  });

  set.audios.forEach(audioID => {
    const pitches = jsPsych.randomization.shuffle([1, 2, 3]);
    pitches.forEach(p => {
      const path = `all_audios/${group}_voice${audioID.toString().padStart(2, "0")}_pitch${p}.wav`;
      audioBlocks.push(makeAudioBlock(path));
    });
  });
});

// === Alternate Image and Audio Blocks ===
let combined = [];
const max = Math.max(imageBlocks.length, audioBlocks.length);
for (let i = 0; i < max; i++) {
  if (i < imageBlocks.length) combined.push(imageBlocks[i]);
  if (i < audioBlocks.length) combined.push(audioBlocks[i]);
}

timeline = timeline.concat(combined);

// === Final Screen ===
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
