const jsPsych = initJsPsych({
  show_progress_bar: true,
  auto_update_progress_bar: true
});

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


const general_instructions = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>Welcome to the experiment. This experiment consists of <strong>two parts</strong>.</p>
    <p>Please make sure you are in a quiet space while doing the experiment.</p>
    <p>If you wish to stop at any point, simply close this page and your data will not be recorded.</p>
    <p style="margin-top: 40px;">Press SPACE to continue.</p>
    `,
  choices: [' ']
};

const instructions_part1 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <h2>Part 1 Instructions</h2>
    <p>Part 1 of this experiment involves alternating trials of images and audio recordings. For each trial, you will be asked a few questions that you'll answer using a slider on the screen.
    </p>
    <p>Please make sure you are in a quiet space for the audio trials.</p>
    <p style="margin-top: 40px;">Press SPACE to continue to Part 2 instructions.</p>
    `,
  choices: [' ']
};

const instructions_part2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <h2>Part 2 Instructions</h2>
    <p>In Part 2, you'll read about four companies looking to hire an employee.</p>
    <p>Your job will be to review each applicant's profile and rank the applicants in terms of their fit for the role.</p>
    <p>More details will be provided when that section begins.</p>
    <p style="margin-top: 40px;">Press SPACE to view examples from Part 1.</p>
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
      <audio controls>
        <source src="all_audios/example1.wav" type="audio/wav">
        Your browser does not support the audio element.
      </audio>
    </div>
    <p><strong>Example question:</strong> How friendly do you think this person sounds?</p>
    <p><em>In the real experiment, you will answer questions like this using a Likert scale from 1 (Not friendly at all) to 7 (Very friendly).</em></p>
    <p><strong>Press SPACE to continue.</strong></p>
  `,
  choices: [' ']
};

const part1Start = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <h2>Part 1</h2>
    <p>The first part of the experiment will now begin.</p>
    <p>Press the spacebar to continue.</p>
  `,
  choices: [' ']
};

let timeline = [general_instructions, instructions_part1, instructions_part2, exampleImageTrial, exampleAudioTrial, part1Start];

const heightLabels = `
  <div style='display: flex; justify-content: space-between; font-size: 12px;'>
    <span>5'5"</span><span>5'6"</span><span>5'7"</span><span>5'8"</span><span>5'9"</span>
    <span>5'10"</span><span>5'11"</span><span>6'0"</span><span>6'1"</span><span>6'2"</span>
    <span>6'3"</span><span>6'4"</span><span>6'5"</span>
  </div>`;

// === IMAGE BLOCK ===
const makeImageBlock = (facePath) => ({
  timeline: [
    {
      type: jsPsychSurveyHtmlForm,
      preamble: `<img src="${facePath}" height="300"><br>
        <p><b> How dominant do you think this person is? (1 = Not dominant at all, 7 = Very dominant)</b><br>
        <i>Please use your mouse and the slider below to make your selection.</i></p>`,
      html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
             <div style='display: flex; justify-content: space-between;'>
               <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
             </div>`,
      data: { question: "dominant", stimulus: facePath, modality: "image" },
      on_finish: logToSheet
    },
    {
      type: jsPsychSurveyHtmlForm,
      preamble: `<img src="${facePath}" height="300"><br>
        <p><b> How trustworthy do you think this person is? (1= Not trustworthy at all, 7 = Very trustworthy)</b><br>
        <i>Please use your mouse and the slider below to make your selection.</i></p>`,
      html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
             <div style='display: flex; justify-content: space-between;'>
               <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
             </div>`,
      data: { question: "trustworthy", stimulus: facePath, modality: "image" },
      on_finish: logToSheet
    },
    {
      type: jsPsychSurveyHtmlForm,
      preamble: `<img src="${facePath}" height="300"><br>
        <p><b> How honest do you think this person is? (1= Not honest at all, 7 = Very honest)</b><br>
        <i>Please use your mouse and the slider below to make your selection.</i></p>`,
      html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
             <div style='display: flex; justify-content: space-between;'>
               <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
             </div>`,
      data: { question: "honest", stimulus: facePath, modality: "image" },
      on_finish: logToSheet
    },
    {
      type: jsPsychSurveyHtmlForm,
      preamble: `<img src="${facePath}" height="300"><br>
        <p><b> How attractive do you think this person is? (1 = Not attractive at all, 7 = Very attractive)</b><br>
        <i>Please use your mouse and the slider below to make your selection.</i></p>`,
      html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
             <div style='display: flex; justify-content: space-between;'>
               <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
             </div>`,
      data: { question: "attractive", stimulus: facePath, modality: "image" },
      on_finish: logToSheet
    },
    {
      type: jsPsychSurveyHtmlForm,
      preamble: `<img src="${facePath}" height="300"><br>
        <p><b> How tall do you think this person is?</b><br>
        <i>Please use your mouse and the slider below to make your selection.</i></p>`,
      html: `<input type='range' name='response' min='1' max='13' step='1' style='width: 100%;'><br>${heightLabels}`,
      data: { question: "tall", stimulus: facePath, modality: "image" },
      on_finish: logToSheet
    }
  ]
});

// === AUDIO BLOCK ===
const makeAudioBlock = (audioPath) => ({
  timeline: [
    {
      type: jsPsychSurveyHtmlForm,
      preamble: `<audio controls autoplay><source src="${audioPath}" type="audio/wav"></audio><br>
        <p><b> How dominant do you think this person is, based on their voice? (1 = Not dominant at all, 7 = Very dominant)</b><br>
        <i>Please use your mouse and the slider below to make your selection.</i></p>`,
      html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
             <div style='display: flex; justify-content: space-between;'>
               <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
             </div>`,
      data: { question: "dominant", stimulus: audioPath, modality: "audio" },
      on_finish: logToSheet
    },
    {
      type: jsPsychSurveyHtmlForm,
      preamble: `<audio controls><source src="${audioPath}" type="audio/wav"></audio><br>
        <p><b> How trustworthy do you think this person is, based on their voice? (1 = Not trustworthy at all, 7 = Very trustworthy)</b><br>
        <i>Please use your mouse and the slider below to make your selection.</i></p>`,
      html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
             <div style='display: flex; justify-content: space-between;'>
               <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
             </div>`,
      data: { question: "trustworthy", stimulus: audioPath, modality: "audio" },
      on_finish: logToSheet
    },
    {
      type: jsPsychSurveyHtmlForm,
      preamble: `<audio controls><source src="${audioPath}" type="audio/wav"></audio><br>
        <p><b> How honest do you think this person is, based on their voice? (1 = Not honest at all, 7 = Very honest)</b><br>
        <i>Please use your mouse and the slider below to make your selection.</i></p>`,
      html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
             <div style='display: flex; justify-content: space-between;'>
               <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
             </div>`,
      data: { question: "honest", stimulus: audioPath, modality: "audio" },
      on_finish: logToSheet
    },
    {
      type: jsPsychSurveyHtmlForm,
      preamble: `<audio controls><source src="${audioPath}" type="audio/wav"></audio><br>
        <p><b> How attractive do you think this person is, based on their voice? (1 = Not attractive at all, 7 = Very attractive)</b><br>
        <i>Please use your mouse and the slider below to make your selection.</i></p>`,
      html: `<input type='range' name='response' min='1' max='7' step='1' style='width: 100%;'><br>
             <div style='display: flex; justify-content: space-between;'>
               <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
             </div>`,
      data: { question: "attractive", stimulus: audioPath, modality: "audio" },
      on_finish: logToSheet
    },
    {
      type: jsPsychSurveyHtmlForm,
      preamble: `<audio controls><source src="${audioPath}" type="audio/wav"></audio><br>
        <p><b> How tall do you think this person is, based on their voice?</b><br>
        <i>Please use your mouse and the slider below to make your selection.</i></p>`,
      html: `<input type='range' name='response' min='1' max='13' step='1' style='width: 100%;'><br>${heightLabels}`,
      data: { question: "tall", stimulus: audioPath, modality: "audio" },
      on_finish: logToSheet
    },

    {
      type: jsPsychSurveyHtmlForm,
      preamble: `<audio controls><source src="${audioPath}" type="audio/wav"></audio><br>
        <p><b> Does this voice sound human to you?</b><br>
        <i>Please use your mouse and the slider below to select 0 (No) or 1 (Yes).</i></p>`,
      html: `
        <input type='range' name='response' min='0' max='1' step='1' style='width: 100%;'><br>
        <div style='display: flex; justify-content: space-between;'>
          <span>No</span><span style="margin-left:auto;">Yes</span>
        </div>
      `,
      data: { question: "human_voice", stimulus: audioPath, modality: "audio" },
      on_finish: logToSheet
    }
  ]
});

// === Build & Interleave ===
let imageBlocks = [], audioBlocks = [];

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

// Shuffle image and audio blocks fully
imageBlocks = jsPsych.randomization.shuffle(imageBlocks);
audioBlocks = jsPsych.randomization.shuffle(audioBlocks);

// Interleave, starting with an image
let combined = [];
const max = Math.max(imageBlocks.length, audioBlocks.length);
for (let i = 0; i < max; i++) {
  if (i < imageBlocks.length) combined.push(imageBlocks[i]);
  if (i < audioBlocks.length) combined.push(audioBlocks[i]);
}

timeline = timeline.concat(combined);

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <h2>End of Part 1</h2>
    <p>You have completed Part 1 of the experiment.</p>
    <p>Take a short break if needed. Press <strong>SPACE</strong> to continue to Part 2 instructions.</p>
  `,
  choices: [' ']
});

const instructions_exppart2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <h2>Part 2 Instructions</h2>
    <p>In this next part, you will be presented with four different job postings from companies looking to hire an employee.</p>
    <p>Each job posting includes six different applications from individuals who have applied for the role. Your task is to read through each applicant profile and rank them based on how well you think they fit the position.</p> 
    <p>Please continue to respond as thoughtfully and accurately as possible.</p>
    <p>Press <strong>SPACE</strong> to begin Part 2.</p>
  `,
  choices: [' ']
};

const ceoScenario1 = {
  name: "CEO Scenario 1",
  data: { scenario: "CEO", version: 1 },
  jobDescription: `
    <h2>Job Posting: Chief Executive Officer (CEO)</h2>
    <p><strong>Location:</strong> Toronto, ON</p>
    <p><strong>Start Date:</strong> As soon as possible</p>
    <p><strong>About the Company:</strong> NovaLink is a Canadian tech firm, with a team of 5000 employees, that builds smart software to help companies manage their supply chains. We’ve grown across North America and are now preparing to expand into Europe. At the same time, we’re dealing with a hostile takeover attempt from a U.S. competitor. We want to remain independent and grow internationally, without losing our focus or team stability. We are looking for a new CEO to help navigate these challenges and opportunities.</p>
  `,
  candidates: [
    {
      name: "Richard (57)",
      description: `I’ve led companies through both international growth and mergers. In my last role, I oversaw expansion of the company into Germany and the Netherlands. I speak German and have a network of contacts in both countries. Shortly after initiating the expansion we were confronted by an aggressive takeover attempt. I worked directly with the board and our lawyers, investors, and regulators to fend off the aggression and safeguard shareholder value, while also keeping focus on our long-term corporate goals. I keep people calm and grounded when things heat up.`
    },
    {
      name: "Neil (52)",
      description: `In my most recent leadership position, I helped guide a company through a hostile takeover attempt. It was a stressful and uncertain time, but I kept the leadership team aligned and worked closely with our lawyers, investors, and regulators to protect the company’s interests. I try to keep people informed and moving forward when the pressure is on. In a previous position I was the VP in charge of acquisitions and navigated several successful mergers and takeovers for a large multinational company.`
    },
    {
      name: "Scott (48)",
      description: `I have successfully led the launch of software technology products in Europe as the vice president of a multinational company. I also helped set up our first offices and client networks in both Germany and Spain. I am fully conversant in German and French, and I know how to effectively navigate cultural and regulatory differences in various contexts, and I’m excited about helping companies grow across borders. I believe growth needs vision, and I like being the person who connects the dots between people and markets.`
    },
    {
      name: "John (59)",
      description: `I have successfully led corporate organizations through intense and challenging internal changes, including board turnover and investor turmoil, while helping the company maintain steady focus and consistently grow profits over time. I have also worked very closely with legal teams on contract disputes, negotiations, and restructuring plans. What I bring to the table is the ability to keep a company calm, collected, and focused while things shift around them. When things are uncertain, people need someone who won’t flinch. That is how I’ve approached every major challenge I’ve faced.`
    },
    {
      name: "Derek (50)",
      description: `My leadership experience includes opening offices and establishing key partnerships in several major Asian markets, including China and South Korea, for a multinational technology company. I speak fluent Mandarin and have helped local teams effectively adjust to new evolving regulations while building long-term relationships in those specific regions. I am fully accustomed to managing time zones and cultural differences, and I truly enjoy bringing global teams together. With my experience, I know exactly how to support meaningful growth in international markets from the ground up.`
    },
    {
      name: "Michael (60)",
      description: `In my last position, I served as the lead vice president in charge of managing the business through a major internal restructuring process that followed a large-scale corporate merger. My responsibilities included integrating cross functional teams, aligning operations, finding cost efficiencies, and working through overlapping leadership roles. It was not easy, but it gave me strong experience in handling uncertainty and managing through big shifts in company structure. I have worked extensively across North America, and I tend to approach leadership with a steady, systems-based, and solution oriented mindset.`
    }
  ]
};

const ceoScenario2 = {
  name: "CEO Scenario 2",
  data: { scenario: "CEO", version: 2 },
  jobDescription: `
    <h2>Job Posting: Chief Executive Officer (CEO)</h2>
    <p><strong>Location:</strong> Vancouver, BC</p>
    <p><strong>Start Date:</strong> Flexible</p>
    <p><strong>About the Company:</strong> GreenPath develops software to help other companies track and reduce their environmental impact in Canada and Europe. We’ve grown quickly to a team of 500, but that growth has created new pressures. We’ve fallen behind in updating our tools  and platforms to keep up with new climate regulations across multiple countries.  Furthermore, our switch back from remote to in-office mode after the COVID lockdowns has left some staff dissatisfied and unheard. We now want to consolidate and focus on doing two things better: staying ahead of environmental standards and making GreenPath a more connected and desirable place to work. We are looking for a new CEO to help us achieve these goals.</p>
  `,
  candidates: [
    {
      name: "Thomas (50)",
      description: `Currently, as vice president of a multinational green tech company, I led system updates in Germany and France to help clients comply with new EU climate regulations. Around the same time, COVID restrictions forced a shift to remote work, which caused isolation, low morale, and a loss of shared purpose. I implemented several initiatives to address these challenges, resulting in an 87% increase in retention and a 73% boost in job satisfaction over the next three years. To me, leadership means being steady, compassionate, empathetic, and mission-focused. I still bike to work and strive to live by the values we promote.`
    },
    {
      name: "Peter (46)",
      description: `After serving in a number of senior leadership roles within private industry, I currently lead the government agency responsible for overseeing the development, coordination, and implementation of environmental regulations for the European Union. This position requires not only deep knowledge of high-level strategy and regulatory guidelines, but also a detailed understanding of the political nuances, compliance challenges, and operational complexities of individual member countries. I am now looking to return to the private sector, where I could leverage my insider expertise, regulatory insight, and strategic leadership to help companies better understand and effectively respond to evolving European environmental standards.`
    },
    {
      name: "James (53)",
      description: `At my current company,  I was appointed VP head of human resources while the company was struggling with low morale and employee retention. My approach was to empathize and view the situation from the employee’s perspective. I initiated steps to make the employees feel heard at every level.  This led to the opening of corporate daycare facilities and encouraging flexible hours. We also initiated regular company retreats to reinforce team cohesion. After three years our employee retention rate is 95% and corporate morale at an all-time high. I believe engaged, motivated employees are essential to long-term success and overall profitability.`
    },
    {
      name: "Brian (56)",
      description: `I have held leadership positions at the vice president level in both marketing and finance across several well-established multinational corporations. In my marketing role, we successfully increased U.S. market share by 12% over a two-year period under my direct leadership. In the finance position, I implemented strategic measures to reduce company debt and boost shareholder equity, which ultimately resulted in a 54% increase in our stock value. I consider myself a well-rounded, seasoned corporate executive with a strong track record of results. I am confident I can help address your challenges and position your organization for sustained growth and long-term profitability.`
    },
    {
      name: "Greg (58)",
      description: `I am a software engineer by training and have led large teams over the last two decades.  In my current position as VP for innovation and development for an American high-tech company I lead teams that develop software for a range of applications but with a specialization in satellite monitoring and ballistic trajectories.  Our major clients are the US government and the Pentagon.  Much of the latter work is of a confidential nature and I would not be able to disclose it.  This role has given me considerable experience in dealing with government regulations and how to respond to them quickly and effectively.`
    },
    {
      name: "Martin (45)",
      description: `I specialize in growing midsize companies through strategic acquisitions and post merger integration.  In my most recent position as CEO of a security software company, we expanded the organization from 350 employees to 1,500 within just three years. This rapid growth was primarily achieved through the successful acquisition of three companies based in South Korea, Hong Kong, and Japan.  Following the acquisitions, we carefully shed redundancies and consolidated operations to streamline efficiency. As a result, we emerged as a significantly more competitive and profitable organization with very few peer competitors remaining in our targeted geographic markets. Growth through strategy is my focus.`
    }
  ]
};

const eceScenario1 = {
  name: "ECE Scenario 1",
  data: { scenario: "ECE", version: 1 },
  jobDescription: `
    <h2>Job Posting: Early Childhood Educator (ECE)</h2>
    <p><strong>Location:</strong> Toronto, ON</p>
    <p><strong>Start Date:</strong> Immediate</p>
    <p><strong>About the Company:</strong> Little Steps Early Learning Centre is a large, multi-centre daycare located in various parts of the Greater Toronto Area. Our downtown Toronto centre currently serves 45 children with a team of 8 dedicated staff members. Recently, the centre has been facing increasing challenges related to (i) staff adopting to new curriculum regulations and (ii) classroom management and disruptive behaviour. As a result, the centre is seeking an Early Childhood Educator (ECE) who can provide a firm lead to staff and navigate both staff and classroom conflict effectively.</p>
  `,
  candidates: [
    {
      name: "Jess",
      description: `Hi, my name is Jess. I am 31 years old and hold a Bachelor's Degree in Child Development from the University of Toronto. I have worked as a daycare supervisor in the city for the past five years, managing classroom dynamics, staff, and behavioural difficulties. When our center adopted a new play-based curriculum, I supported staff by facilitating planning sessions and sharing strategies that made the shift feel manageable and aligned with their teaching styles. As a supervisor I’ve also managed incidents between children involving disruptive behaviours during class time. By implementing firm and consistent expectations, I was able to prevent further outbursts.`
    },
    {
      name: "Mary",
      description: `Hi, my name is Mary. I am 30 years old and hold a Bachelor’s in Early Childhood Education from the University of Toronto. For the past three years, I have worked as a staff lead at a preschool where I take pride in fostering a positive team culture rooted in accountability, communication, and respect. This focus on team culture has shaped how I support staff through change and new initiatives. As we adopted changes in the curriculum, I collaborated with staff to create simple templates and provide hands-on support. This helped reduce overwhelm and encouraged more consistent use across classrooms.`
    },
    {
      name: "Sarah",
      description: `Hi, my name is Sarah, and I am 30 years old. I studied Early Childhood Education at the University of Toronto and have worked for four years as an educator at a childcare centre in Etobicoke, where I efficiently manage the classroom. I’ve supported classrooms facing disruptive behaviors by modeling calm, consistent responses and working closely with educators to develop shared strategies. When disagreements arise between children, I help them explore fair ways to share or take turns. I’ve found that mediating conversations prevents miscommunication while teaching valuable social skills. I also support team dynamics by encouraging open dialogue and stepping in early to prevent issues from escalating.`
    },
    {
      name: "Amy",
      description: `Hi there, my name is Amy and I am 26 years old. After receiving my Bachelor of Science from the University of Toronto, I’ve spent the past three years working as a receptionist at a drop-in children’s program. During this time, I have interacted with and developed meaningful connections with families. I have observed educators as they led children’s activities and managed various behavioural challenges. I am currently pursuing a degree in Early Childhood Education and am eager to take the next step in this field. I would love the opportunity to apply my knowledge and gain hands-on experience working directly with children.`
    },
    {
      name: "Alyssa",
      description: `Hello, my name is Alyssa, and I am 28 years old. I completed my education in Developmental Studies at the University of Toronto and have spent the last four years working as a preschool educator. To manage disruptive behaviors, I enjoy creating a calm and predictable learning environment. I stick to tried-and-true strategies that have worked well in the past for me. For example, when two children are arguing over a toy, I calmly step in to help them express their feelings and guide them toward finding a fair solution. I value open communication and always try to understand each child’s perspective.`
    },
    {
      name: "Rebecca",
      description: `Hi there, I’m Rebecca and I am 27 years old. I received a Bachelor’s in Education from the University of Toronto and have three years of experience working as an educator at a learning centre in downtown Toronto. In that role, I guided children through daily activities to support their learning and development. I worked closely with children to build routines that encouraged engagement and confidence. For instance, I regularly led circle time activities, prompting children to participate in games and sing-alongs. Outside of work, I coach multiple youth soccer teams and received recognition for leading the most improved team.`
    }
  ]
};

const eceScenario2 = {
  name: "ECE Scenario 2",
  data: { scenario: "ECE", version: 2 },
  jobDescription: `
    <h2>Job Posting: Early Childhood Educator (ECE)</h2>
    <p><strong>Location:</strong> Vancouver, BC</p>
    <p><strong>Start Date:</strong> Flexible</p>
    <p><strong>About the Company:</strong> Early Minds Academy is a large, multi-centre daycare located in various parts of the Greater Vancouver Area. Our downtown Vancouver centre currently serves 45 children with a team of 8 dedicated staff members. At this time, the centre is in the process of enhancing its program to align more closely with child-centered approaches that prioritize emotional development and interpersonal learning. As a result, the centre is seeking an Early Childhood Educator (ECE) who is warm, nurturing, and emotionally attuned. The ideal candidate will foster close relationships with children and families and have a strong passion for learning.</p>
  `,
  candidates: [
    {
      name: "Veronica",
      description: `Hi, my name is Veronica and I am 28 years old. I hold a Bachelor's Degree in Child Development from the University of British Columbia and have worked at a daycare in the city for the past four years. From my time at the daycare, I’ve come to understand that every child has their own unique needs and establish rapport accordingly. For children who need more support, I provide one-on-one attention or adapt activities to cater to their level of development. I love speaking with parents about how their child’s day went, whether it was full of laughter or included a few bumps along the way. `
    },
    {
      name: "Maya",
      description: `Hi, my name is Maya. I am 29 years old and hold a Bachelor’s in Early Childhood Education from UBC. For the past three years, I have worked at a preschool where I feel honoured to be part of the children’s developmental milestones. I value the importance of clear communication, and I like to host a monthly ‘family morning’ where parents and children can join in on a circle time activity and parents chat informally about their child’s progress. Outside of work, I regularly take professional development courses that I can apply to my own role, as I strongly believe in the value of continual growth.`
    },
    {
      name: "Clara",
      description: `Hi, my name is Clara, and I am 30 years old. I studied Childhood Studies during my undergrad at the University of British Columbia. For the past three years, I’ve worked as a private babysitter for two different families. In these roles, I focused on supporting emotional development by using practical strategies. When any of the children would get upset after losing a game or being told “no”, I would offer simple strategies like counting to ten or taking deep breaths.  I focus on incorporating evidence-based approaches into my work and enjoy staying up to date with current research to support children’s development.`
    },
    {
      name: "Julia",
      description: `Hi there, my name is Julia and I am 26 years old. After receiving my Bachelor’s degree from the University of British Columbia, I spent the past two years working in toddler and preschool classrooms. In these roles, my main focus was helping to plan activities and maintain structured routines for the lead educators to follow. As an activity planner, I communicated effectively with lead educators to develop cohesive daily routines and have maintained contact with many of them even after my contract ended. I highly value continual growth and am always researching new activities that maximize children’s learning and health development.`
    },
    {
      name: "Zoe",
      description: `Hello, my name is Zoe, and I am 27 years old. I completed my education in Developmental Studies at the University of British Columbia and have spent the last four years working as a play-based educator. My favourite part about being an educator is the novelty of each day. I love seeing where each child’s curiosity takes us, whether it’s coming up with a new science experiment or exploring a new art technique - whatever keeps everyone engaged and learning. I also have a strong interest in storytelling and music, which I often bring into the classroom to spark imagination and engage children in new ways.`
    },
    {
      name: "Naomi",
      description: `Hi there, I’m Naomi and I am 28 years old. I hold a Bachelor’s in Education from the University of British Columbia and have four years of experience working as a classroom assistant, helping implement learning activities and supporting daily routines. In my role, I’ve had the chance to speak with parents informally during drop-off and pickup, and I appreciate how those interactions can help build trust over time. I’ve also volunteered at local community events, allowing me to collaborate with different age groups and support environments that bring people together. These are values I hope to bring into my work with children and their families.`
    }
  ]
};

// Function to create the ranking trial for each scenario
function createRankingTrial(scenario) {
  let candidatesHtml = scenario.candidates.map((c, i) => 
    `<strong>${i + 1}. ${c.name}</strong><br>${c.description}<br><br>`
  ).join("");

  let inputsHtml = scenario.candidates.map(c => 
    `<label for="rank_${c.name.replace(/\s+/g, '')}">${c.name}:</label>
     <input type="number" id="rank_${c.name.replace(/\s+/g, '')}" name="${c.name.replace(/\s+/g, '')}" min="1" max="${scenario.candidates.length}" required><br><br>`
  ).join("");

  return {
    type: jsPsychSurveyHtmlForm,
    preamble: scenario.jobDescription + "<hr><h3>Candidates:</h3>" + candidatesHtml + `<hr><p><strong>Ranking Task:</strong> Please rank the candidates from 1 (best fit) to ${scenario.candidates.length} (least fit).</p>`,
    html: inputsHtml,
    button_label: "Submit",
    data: scenario.data,
    on_finish: logToSheet
  };
}

const allScenarios = [ceoScenario1, ceoScenario2, eceScenario1, eceScenario2];
const randomizedScenarios = jsPsych.randomization.shuffle(allScenarios);
const allRankingTrials = randomizedScenarios.map(createRankingTrial);

// Add your instructions and then these trials to timeline
timeline.push(instructions_exppart2);
timeline = timeline.concat(allRankingTrials);

// === Final Message ===
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