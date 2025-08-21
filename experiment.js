var style = document.createElement('style');
style.innerHTML = `
  body {
    font-size: 23px !important;
  }
  #jspsych-progressbar-container {
    height: 40px !important;   /* make container taller */
  }
  #jspsych-progressbar {
    height: 40px !important;   /* make the bar itself taller */
  }
`;
document.head.appendChild(style);


// Initialize Firebase (put at the top of experiment.js)
const firebaseConfig = {
  apiKey: "AIzaSyCBr9qbeKaCc32V1Ev_CQFDD6wpSTuZeps",
  authDomain: "pilot-study-3.firebaseapp.com",
  databaseURL: "https://pilot-study-3-default-rtdb.firebaseio.com",
  projectId: "pilot-study-3",
  storageBucket: "pilot-study-3.firebasestorage.app",
  messagingSenderId: "803701219913",
  appId: "1:803701219913:web:681e6ae2520ad6cbc85598"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const jsPsych = initJsPsych({
  show_progress_bar: true,
  auto_update_progress_bar: true
});

const group = jsPsych.randomization.sampleWithoutReplacement(["male", "female"], 1)[0];

const participantID = jsPsych.data.getURLVariable("id") || Math.floor(Math.random() * 1000000);
jsPsych.data.addProperties({ participantID });

// Blocks set up
const imageBlocks = {
  a: [1, 2, 3],       // 18 image trials
  b: [4, 5, 6],       // 18 image trials
  c: [7, 8, 9, 10]    // 24 image trials
};

const audioBlocks = {
  a: [1, 2, 3, 4, 5, 6],         // 18 audio trials
  b: [7, 8, 9, 10, 11, 12],      // 18 audio trials
  c: [13, 14, 15, 16, 17, 18, 19, 20] // 24 audio trials
};

const logToFirebase = (trialData) => {
  const participantID = jsPsych.data.get().values()[0]?.participantID || "unknown";

  const entry = {
    participantID,
    group,
    modality: trialData.modality,
    block: trialData.block || "",
    stimulus: trialData.stimulus || "",
    question: trialData.question || "",
    response: trialData.response ?? "",  // null-safe
    rt: trialData.rt ?? "",              // null-safe
    timestamp: Date.now()
  };

  database.ref(`participants/${participantID}/trials`).push(entry);
};

const general_instructions = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>Welcome to the experiment. This experiment will take approximately <strong>30 minutes</strong> to complete.</p>
    <p>Please make sure you are in a quiet space and have a strong Wi-Fi connection while doing this experiment.</p>
    <p>If you wish to stop participating in this study at any point, simply close the window and your data will not be recorded.</p>
    <p style="margin-top: 40px;">Press SPACE to continue.</p>
    `,
  choices: [' ']
};

const instructions_part1 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <h2>Instructions</h2>
    <p>There will be 3 blocks in this experiment, Blocks A, B, and C (presented randomly). In each block, you'll first see an image and answer 5 questions about the image, followed by an audio recording with 6 questions per recording.</p>
    <p>Please make sure you are in a quiet space for the audio trials. You may listen to the audio clips using either headphones or your computer speaker.</p>
    <p style="margin-top: 40px;">Press SPACE to view examples of the images and audio recordings before you begin the actual experiment.</p>
    `,
  choices: [' ']
};

const exampleImageTrial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <h3>Example Image Stimulus</h3>
    <p><em>Note: This image is <strong>not</strong> part of the actual experiment. It is shown here only for explanation purposes.</em></p>
    <div style="text-align: center;">
      <img src="all_images/example1.png" height="200" alt="Example dog image">
    </div>
    <p><strong>Example question:</strong> How friendly does this dog look to you?</p>
    <p><em>The image may take a few seconds to load.</em></p>
    <p><em>In the real experiment, you will answer questions like this using a Likert scale from 1 (Not friendly at all) to 7 (Very friendly).</em></p>
    <p><strong>Press SPACE to continue.</strong></p>
  `,
  choices: [' ']
};

const exampleAudioTrial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <h3>Example Audio Stimulus</h3>
    <p><em>This audio clip is not part of the actual experiment. It is shown here for explanation purposes only.</em></p>
    <div style="text-align: center; margin-top: 10px; margin-bottom: 20px;">
      <audio id="exampleAudio" controls controlsList="nodownload noplaybackrate" preload="auto">
        <source src="all_audios/example1.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </div>
    <p><strong>Example question:</strong> How friendly do you think this person sounds?</p>
    <p><em>In the real experiment, you will answer questions like this using a Likert scale from 1 (Not friendly at all) to 7 (Very friendly).</em></p>
    <p><strong>Press SPACE to continue.</strong></p>
  `,
  choices: [' '],
  on_load: () => {
    const audio = document.getElementById("exampleAudio");
    audio.playbackRate = 1.0;  // lock playback speed
  }
};

const part1Start = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>The experiment will now begin.</p>
    <p>Press the spacebar to continue.</p>
  `,
  choices: [' ']
};

let timeline = [general_instructions, instructions_part1, exampleImageTrial, exampleAudioTrial, part1Start];

const heightLabels = `
  <div style='display: flex; justify-content: space-between; font-size: 12px;'>
    <span>5'0"</span><span>5'1"</span><span>5'2"</span><span>5'3"</span><span>5'4"</span>
    <span>5'5"</span><span>5'6"</span><span>5'7"</span><span>5'8"</span><span>5'9"</span>
    <span>5'10"</span><span>5'11"</span><span>6'0"</span><span>6'1"</span><span>6'2"</span>
    <span>6'3"</span><span>6'4"</span><span>6'5"</span>
  </div>`;

// === IMAGE BLOCK ===
const makeImageBlock = (facePath) => {
  // Set height slider range based on group
  let minHeight, maxHeight, heightLabels;
  if (group === "female") {
    minHeight = 1;  // 5'0"
    maxHeight = 13; // 6'0"
    heightLabels = `
      <div style='display: flex; justify-content: space-between; font-size: 12px;'>
        <span>5'0"</span><span>5'1"</span><span>5'2"</span><span>5'3"</span><span>5'4"</span>
        <span>5'5"</span><span>5'6"</span><span>5'7"</span><span>5'8"</span><span>5'9"</span>
        <span>5'10"</span><span>5'11"</span><span>6'0"</span>
      </div>`;
  } else { // male
    minHeight = 6;  // 5'5"
    maxHeight = 18; // 6'5"
    heightLabels = `
      <div style='display: flex; justify-content: space-between; font-size: 12px;'>
        <span>5'5"</span><span>5'6"</span><span>5'7"</span><span>5'8"</span>
        <span>5'9"</span><span>5'10"</span><span>5'11"</span><span>6'0"</span>
        <span>6'1"</span><span>6'2"</span><span>6'3"</span><span>6'4"</span><span>6'5"</span>
      </div>`;
  }

  return {
  timeline: [
    {
      type: jsPsychSurveyHtmlForm,
      preamble: `<p><em>The image may take a few seconds to load.</em></p>
        <img src="${facePath}" height="300"><br>
        <p><b> How dominant do you think this person is? (1 = Not dominant at all, 7 = Very dominant)</b><br>
        <i>Please use your mouse and the slider below to make your selection.</i></p>`,
      html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
             <div style='display: flex; justify-content: space-between;'>
               <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
             </div>`,
      data: { question: "dominant", stimulus: facePath, modality: "image" },
      on_finish: function(data) {
        logToFirebase(data);
}
    },
    {
      type: jsPsychSurveyHtmlForm,
      preamble: `<p><em>The image may take a few seconds to load.</em></p>
        <img src="${facePath}" height="300"><br>
        <p><b> How trustworthy do you think this person is? (1= Not trustworthy at all, 7 = Very trustworthy)</b><br>
        <i>Please use your mouse and the slider below to make your selection.</i></p>`,
      html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
             <div style='display: flex; justify-content: space-between;'>
               <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
             </div>`,
      data: { question: "trustworthy", stimulus: facePath, modality: "image" },
      on_finish: function(data) {
        logToFirebase(data);
}
    },
    {
      type: jsPsychSurveyHtmlForm,
      preamble: `<p><em>The image may take a few seconds to load.</em></p>
        <img src="${facePath}" height="300"><br>
        <p><b> How honest do you think this person is? (1= Not honest at all, 7 = Very honest)</b><br>
        <i>Please use your mouse and the slider below to make your selection.</i></p>`,
      html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
             <div style='display: flex; justify-content: space-between;'>
               <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
             </div>`,
      data: { question: "honest", stimulus: facePath, modality: "image" },
      on_finish: function(data) {
        logToFirebase(data);
}
    },
    {
      type: jsPsychSurveyHtmlForm,
      preamble: `<p><em>The image may take a few seconds to load.</em></p>
        <img src="${facePath}" height="300"><br>
        <p><b> How attractive do you think this person is? (1 = Not attractive at all, 7 = Very attractive)</b><br>
        <i>Please use your mouse and the slider below to make your selection.</i></p>`,
      html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
             <div style='display: flex; justify-content: space-between;'>
               <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
             </div>`,
      data: { question: "attractive", stimulus: facePath, modality: "image" },
      on_finish: function(data) {
        logToFirebase(data);
}
    },
    {
      type: jsPsychSurveyHtmlForm,
      preamble: `<p><em>The image may take a few seconds to load.</em></p>
        <img src="${facePath}" height="300"><br>
        <p><b> How tall do you think this person is?</b><br>
        <i>Please use your mouse and the slider below to make your selection.</i></p>`,
      html: `<input type='range' name='response' min='${minHeight}' max='${maxHeight}' step='1' style='width: 100%;'><br>${heightLabels}`,
      data: { question: "tall", stimulus: facePath, modality: "image" },
      on_finish: function(data) {
        logToFirebase(data);
      }
     }
    ]
  };
};

// === AUDIO BLOCK ===

const makeAudioBlock = (audioPath) => {
  // Set height range & labels based on group
  let minHeight, maxHeight, heightLabelsAudio;
  if (group === "female") {
    minHeight = 1;   // 5'0"
    maxHeight = 13;  // 6'0"
    heightLabelsAudio = `
      <div style='display: flex; justify-content: space-between; font-size: 12px;'>
        <span>5'0"</span><span>5'1"</span><span>5'2"</span><span>5'3"</span><span>5'4"</span>
        <span>5'5"</span><span>5'6"</span><span>5'7"</span><span>5'8"</span><span>5'9"</span>
        <span>5'10"</span><span>5'11"</span><span>6'0"</span>
      </div>`;
  } else { // male
    minHeight = 6;   // 5'5"
    maxHeight = 18;  // 6'5"
    heightLabelsAudio = `
      <div style='display: flex; justify-content: space-between; font-size: 12px;'>
        <span>5'5"</span><span>5'6"</span><span>5'7"</span><span>5'8"</span>
        <span>5'9"</span><span>5'10"</span><span>5'11"</span><span>6'0"</span>
        <span>6'1"</span><span>6'2"</span><span>6'3"</span><span>6'4"</span><span>6'5"</span>
      </div>`;
  }

  const gateTrial = {
    type: jsPsychSurveyHtmlForm,
    preamble: `
      <audio id="audioStim" autoplay controls controlsList="noplaybackrate">
        <source src="${audioPath}" type="audio/wav">
      </audio>
      <p><b>Please listen to the entire audio clip before continuing.</b></p>
      <p>Once you finish listening, you will answer a series of questions about this clip on the following pages.</p>
      <p><i>You cannot continue until the audio has finished playing.</i></p>
    `,
    html: `<p></p>`, // no questions for the gate trial
    button_label: "Continue",
    on_load: () => {
      const aud = document.getElementById("audioStim");
      const btnInterval = setInterval(() => {
        const btn = document.querySelector(".jspsych-btn");
        if (btn && aud) {
          btn.disabled = true;
          aud.onended = () => {
            btn.disabled = false; // enable button after audio finishes
          };
          clearInterval(btnInterval);
        }
      }, 50);
     },
    data: { stimulus: audioPath, modality: "audio" }
  };

  return {
    timeline: [
      gateTrial,
      {
        type: jsPsychSurveyHtmlForm,
        preamble: `
          <audio id="audioStim" controls controlsList="noplaybackrate">
            <source src="${audioPath}" type="audio/wav">
          </audio>
          <p><b>How dominant do you think this person is, based on their voice? (1 = Not dominant at all, 7 = Very dominant)</b><br>
          <i>Please use your mouse and the slider below to make your selection.</i><br>
          <i>You can replay this audio as many times as you like.</i></p>
        `,
        html: `
          <input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
          <div style='display: flex; justify-content: space-between;'>
            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
          </div>
        `,
        button_label: "Continue",
        on_load: () => {
          const aud = document.getElementById("audioStim");
          if (aud) aud.playbackRate = 1.0;

        },
        data: { question: "dominant", stimulus: audioPath, modality: "audio" },
        on_finish: function(data) {
          logToFirebase(data);
        }
      },
      {
        type: jsPsychSurveyHtmlForm,
        preamble: `
          <audio controls controlsList="noplaybackrate">
            <source src="${audioPath}" type="audio/wav">
          </audio><br>
          <p><b>How trustworthy do you think this person is, based on their voice? (1 = Not trustworthy at all, 7 = Very trustworthy)</b><br>
          <i>Please use your mouse and the slider below to make your selection.</i><br>
          <i>You can replay this audio as many times as you like while answering.</i></p>
        `,
        html: `
          <input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
          <div style='display: flex; justify-content: space-between;'>
            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
          </div>
        `,
        data: { question: "trustworthy", stimulus: audioPath, modality: "audio" },
        on_start: () => {
          const aud = jsPsych.getDisplayElement().querySelector("audio");
          if (aud) aud.playbackRate = 1.0;
        },
        on_finish: function(data) {
          logToFirebase(data);
        }
      },
      {
        type: jsPsychSurveyHtmlForm,
        preamble: `
          <audio controls controlsList="noplaybackrate">
            <source src="${audioPath}" type="audio/wav">
          </audio><br>
          <p><b>How honest do you think this person is, based on their voice? (1 = Not honest at all, 7 = Very honest)</b><br>
          <i>Please use your mouse and the slider below to make your selection.</i><br>
          <i>You can replay this audio as many times as you like while answering.</i></p>
        `,
        html: `
          <input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
          <div style='display: flex; justify-content: space-between;'>
            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
          </div>
        `,
        data: { question: "honest", stimulus: audioPath, modality: "audio" },
        on_start: () => {
          const aud = jsPsych.getDisplayElement().querySelector("audio");
          if (aud) aud.playbackRate = 1.0;
        },
        on_finish: function(data) {
          logToFirebase(data);
        }
      },
      {
        type: jsPsychSurveyHtmlForm,
        preamble: `
          <audio controls controlsList="noplaybackrate">
            <source src="${audioPath}" type="audio/wav">
          </audio><br>
          <p><b>How attractive do you think this person is, based on their voice? (1 = Not attractive at all, 7 = Very attractive)</b><br>
          <i>Please use your mouse and the slider below to make your selection.</i><br>
          <i>You can replay this audio as many times as you like while answering.</i></p>
        `,
        html: `
          <input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
          <div style='display: flex; justify-content: space-between;'>
            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
          </div>
        `,
        data: { question: "attractive", stimulus: audioPath, modality: "audio" },
        on_start: () => {
          const aud = jsPsych.getDisplayElement().querySelector("audio");
          if (aud) aud.playbackRate = 1.0;
        },
        on_finish: function(data) {
          logToFirebase(data);
        }
      },
      {
        type: jsPsychSurveyHtmlForm,
        preamble: `
          <audio controls controlsList="noplaybackrate">
            <source src="${audioPath}" type="audio/wav">
          </audio><br>
          <p><b>How tall do you think this person is, based on their voice?</b><br>
          <i>Please use your mouse and the slider below to make your selection.</i><br>
          <i>You can replay this audio as many times as you like while answering.</i></p>
        `,
        html: `<input type='range' name='response' min='${minHeight}' max='${maxHeight}' step='1' style='width: 100%;'><br>${heightLabelsAudio}`,
        data: { question: "tall", stimulus: audioPath, modality: "audio" },
        on_start: () => {
          const aud = jsPsych.getDisplayElement().querySelector("audio");
          if (aud) aud.playbackRate = 1.0;
        },
        on_finish: function(data) {
          logToFirebase(data);
        }
      },
      {
        type: jsPsychSurveyHtmlForm,
        preamble: `
          <audio controls controlsList="noplaybackrate">
            <source src="${audioPath}" type="audio/wav">
          </audio><br>
          <p><b>Does this voice sound more human or robotic to you?</b><br>
          <i>You can replay this audio as many times as you like while answering.</i></p>
        `,
        html: `
          <div>
            <label>
              <input type="radio" name="response" value="human" required>
              Human
            </label>
          </div>
          <div>
            <label>
              <input type="radio" name="response" value="robotic">
              Robotic
            </label>
          </div>
        `,
        data: { question: "human_voice", stimulus: audioPath, modality: "audio" },
        on_start: () => {
          const aud = jsPsych.getDisplayElement().querySelector("audio");
          if (aud) aud.playbackRate = 1.0;
        },
        on_finish: function(data) {
          logToFirebase(data);
        }
      }
    ]
  };
};

function addBlockLabelToTrial(trial, blockLabel) {
  trial.timeline = trial.timeline.map(t => {
    const labelHtml = `<div style="text-align:center; font-size:14px; color:#999; opacity:0.5; position: fixed; top: 5px; left: 50%; transform: translateX(-50%); z-index: 1000;">
                         Block ${blockLabel.toUpperCase()}
                       </div>`;

    if (t.preamble) {
      return {...t, preamble: labelHtml + t.preamble};
    } else if (t.stimulus) {
      return {...t, stimulus: labelHtml + t.stimulus};
    } else {
      return {...t, stimulus: labelHtml};
    }
  });
  return trial;
}

// Helper function to build one block's timeline
const buildStimulusBlock = (imageIDs, audioIDs, blockLabel) => {
  let imageTrials = [];
  imageIDs.forEach(faceID => {
    const variants = jsPsych.randomization.shuffle([1, 2, 3, 4, 5, 6]);
    variants.forEach(v => {
      const path = `all_images/${group}_face${faceID.toString().padStart(2, "0")}_${v}.png`;
      imageTrials.push(addBlockLabelToTrial(makeImageBlock(path), blockLabel));
    });
  });

  let audioTrials = [];
  audioIDs.forEach(audioID => {
    const pitches = jsPsych.randomization.shuffle([1, 2, 3]);
    pitches.forEach(p => {
      const path = `all_audios/${group}_voice${audioID.toString().padStart(2, "0")}_pitch${p}.wav`;
      audioTrials.push(addBlockLabelToTrial(makeAudioBlock(path), blockLabel));
    });
  });

  // Shuffle the individual image and audio trials arrays separately
  imageTrials = jsPsych.randomization.shuffle(imageTrials);
  audioTrials = jsPsych.randomization.shuffle(audioTrials);

  // Interleave trials: image, audio, image, audio ...
  let block = [];
  const maxLength = Math.max(imageTrials.length, audioTrials.length);
  for (let i = 0; i < maxLength; i++) {
    if (i < imageTrials.length) block.push(imageTrials[i]);
    if (i < audioTrials.length) block.push(audioTrials[i]);
  }

  return block;
};

// Add "block" label to each trial
const tagBlock = (blockArray, blockLabel) =>
  blockArray.map(trial => ({
    ...trial,
    timeline: trial.timeline.map(t => ({
      ...t,
      data: { ...(t.data || {}), block: blockLabel }
    }))
  }));

const blockA = tagBlock(buildStimulusBlock(imageBlocks.a, audioBlocks.a, "A"), "A");
const blockB = tagBlock(buildStimulusBlock(imageBlocks.b, audioBlocks.b, "B"), "B");
const blockC = tagBlock(buildStimulusBlock(imageBlocks.c, audioBlocks.c, "C"), "C");

const randomizedBlockOrder = jsPsych.randomization.shuffle([
  { name: "A", block: blockA },
  { name: "B", block: blockB },
  { name: "C", block: blockC }
]);

// End of block label
function createEndOfBlockScreen(blockLabel) {
  return {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div style="font-size: 24px; text-align: center; margin-top: 100px;">
        <p>End of Block ${blockLabel}</p>
        <p>Take a short break if you need to.</p>
        <p>Press SPACE to continue.</p>
      </div>
    `,
    choices: [' '],
    data: { 
      question: "break_screen", 
      modality: "break", 
      block: blockLabel 
    },
    on_finish: function(data) {
      const participantID = jsPsych.data.get().values()[0]?.participantID || "unknown";
      const entry = {
        participantID,
        group,
        modality: "break",
        block: data.block,
        question: "break_screen",
        stimulus: "",
        response: "",
        rt: data.rt,
        timestamp: Date.now()
      };
      database.ref(`participants/${participantID}/trials`).push(entry);
    }
  };
}

for (let i = 0; i < randomizedBlockOrder.length; i++) {
  timeline = timeline.concat(randomizedBlockOrder[i].block);
  if (i < randomizedBlockOrder.length - 1) {
    timeline.push(createEndOfBlockScreen(randomizedBlockOrder[i].name));
  }
}

// === Final Message ===
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <h2>Thank you for participating!</h2>
    <p>Your responses have been recorded.</p>
    <p>You may now close this window.</p>
  `,
  choices: "NO_KEYS",
  trial_duration: 7000
});

jsPsych.run(timeline);
