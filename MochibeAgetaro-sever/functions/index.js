const {conversation} = require("@assistant/conversation");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const client = require("../clientid");

const CLIENT_ID = client.id;

const db = admin.firestore();

const app = conversation({
  debug: true,
  clientId: CLIENT_ID,
});

app.handle("ageGreeting", async (conv) => {
  const userID = conv.user.params.tokenPayload.name;

  const ssml = `
    <speak>
      ${userID}くん
      <break />
      一緒に勉強しよう！
    </speak>
  `;
  conv.add(ssml);
});

app.handle("create_user", async (conv) => {
  const userID = conv.user.params.tokenPayload.name;
  const data = {
    name: userID,
    startTime: "",
  };

  // ソース内で環境変数としてセット、日本時間
  const timezone = "Asia/Tokyo";
  process.env.TZ = timezone;

  data["startTime"] = admin.firestore.FieldValue.serverTimestamp();

  // WebApp側でアカウントを作ってからくるはずなので、なくなるかも
  const userRef = db.collection("users").doc(userID);
  const doc = await userRef.get();
  if (!doc.exists) {
    data.ivy = 0;
    data.total = 0;
    userRef.set(data);
  } else {
    userRef.update(data);
  }

  // eslint-disable-next-line new-cap
  // db.SnapshotOptions({serverTimestamps: "estimate"});
});

app.handle("choseSubject", async (conv) => {
  const userID = conv.user.params.tokenPayload.name;
  const subject = conv.session.params.ChosenSubjects;

  let message = subject + "だね！";

  // YYYYMMDDを取得
  const userDocRef = db.collection("users").doc(userID);
  const postDoc = await userDocRef.get();
  const timestamp = postDoc.get("startTime");
  let today = "";
  today += timestamp.toDate().getFullYear();
  today += ("0" + (timestamp.toDate().getMonth() + 1)).slice(-2);
  today += ("0" + timestamp.toDate().getDate()).slice(-2);
  today += timestamp.toDate().getDay().toString(); // 曜日(1~6)

  // 勉強時間を取得
  const hogeSubRef = await userDocRef.collection("durationTime").get();
  let study = 0;
  hogeSubRef.forEach((doc) => {
    if (doc.data().isSelected) {
      study = doc.data().studyTime;
    }
  });

  // aboutStudyがない場合、自動でリストが生成される。
  const userRef = db.collection("users").doc(userID);
  const subRef = userRef.collection("aboutStudy");
  const subDoc = await subRef.doc(today).get();
  // その日初めて
  if (!subDoc.exists) {
    const subjects = [{
      name: subject,
      time: study,
      savedTime: 0, // その日すでにDBのtotalに加算した時間
    }];
    subRef.doc(today).set({
      subjects: subjects,
    });
  } else {
    const subjects = await subDoc.get("subjects");
    const subjectIndex = subjects.findIndex((ele) => ele.name == subject);
    if (subjectIndex != -1) { // 要素が存在する
      subjects[subjectIndex].time += study;
    } else {
      subjects.push({
        name: subject,
        time: study,
        savedTime: 0,
      });
    }
    subRef.doc(today).update({
      subjects: subjects,
    });
  }

  // dbから褒める言葉を取得
  const compliRef = db.collection("complimentary").doc(conv.scene.name);
  const doc = await compliRef.get();
  const compli = doc.data();
  const keyArray = Object.keys(compli);
  // 乱数からランダムな添字を取得
  const objectIndex = Math.floor(Math.random() * keyArray.length);
  message += compli[keyArray[objectIndex]];

  conv.add(message);
});

app.handle("nowStudy", async (conv) => {
  const userID = conv.user.params.tokenPayload.name;
  const postRef = db.collection("users").doc(userID);

  // 勉強時間を取得
  const hogeSubRef = await postRef.collection("durationTime").get();
  let study = 0;
  hogeSubRef.forEach((doc) => {
    if (doc.data().isSelected) {
      study = doc.data().studyTime;
      /* Firebase更新 */
    }
  });

  // ツタの長さ取得
  const postDoc = await postRef.get();
  const ivy = postDoc.get("ivy");

  let ssml = "<speak>開始 <break time=\"1s\" />";

  // 一番近いツタの到達点（東京タワーとか）
  const eventRef = db.collection("Events").doc("Event");
  const eventDoc = await eventRef.get();
  const eventArray = eventDoc.get("events");

  // 高さ順にソート
  eventArray.sort((a, b) => {
    // highの昇順
    if (a.high > b.high) return 1;
    if (a.high < b.high) return -1;

    return 0;
  });

  // 目標を決める
  let Event = eventArray[0]["name"]; // 一番下
  let EventHigh = [0]["high"]; // 一番下
  for (let id = 0; id < eventArray.length; id++) {
    if (eventArray[id]["high"] > ivy) { // 次の目標点が、今より高い場所なら
      Event = eventArray[id]["name"]; // 目標セット
      EventHigh = eventArray[id]["high"];
      break;
    }
  }

  ssml += "<break time=\"9s\" /> 10秒経過。";

  // 今回の勉強中に目標点があるか。
  let toEvent = 0;
  let toGoal = study;
  const lastIvy = ivy + study;
  if (lastIvy >= EventHigh) {
    toEvent = EventHigh - ivy; // 目標までの時間
    toGoal = lastIvy - EventHigh; // 目標から終了までの時間
    if (toEvent > 15) { // for文にする？
      ssml += "<break time=\"900s\" />";
      ssml += "15分経ったよ。勉強して偉いね！";
      toEvent -= 15;
    }

    ssml += `<break time="${toEvent * 60}s" />`;
    ssml += Event + "到達！すごい！";
  } else if (toGoal > 15) {
    ssml += "<break time=\"900s\" />";
    ssml += "15分経ったよ。頑張ってるね。";
    toGoal -= 15;
  } // 目標点が2個以上ある場合は、今は考えていない。
  // DB更新
  await postRef.update({
    ivy: lastIvy, // ツタの高さ更新
  });

  // カウントダウンとか
  if (toGoal >= 15) {
    ssml += `<break time="${(toGoal - 15) * 60}s" />`;
    toGoal = 15;
    ssml += "頑張ってるね。あと15分！<break time=\"1s\" />";
  }
  if (toGoal >= 10) {
    ssml += `<break time="${(toGoal - 10) * 60}s" />`;
    toGoal = 10;
    ssml += "<emphasis level=\"strong\">あと10分！頑張っていこう！</emphasis>";
  }
  if (toGoal >= 3) {
    ssml += `<break time="${(toGoal - 3) * 60}s" />`;
    ssml += "あと3分！ラストスパート！";
    toGoal = 3;
  }
  if (toGoal >= 1) {
    ssml += `
      <break time="${(toGoal - 1) * 60}s" />
      あと1分だよ。ファイト！<break time="30s" />
      あと30秒<break time="20s" />
    `;
  } else { // 1分未満
    ssml += "<break time=\"10s\" />";
  }
  ssml += `
    あと10<break time="800ms" />
    9<break time="800ms" />
    8<break time="800ms" />
    7<break time="800ms" />
    6<break time="800ms" />
    5<break time="800ms" />
    4<break time="800ms" />
    3<break time="800ms" />
    2<break time="800ms" />
    1<break time="800ms" />
    終わり！<break time="1s" />
  `;

  // badge
  const userSubRef = await postRef.collection("aboutStudy").get();
  const subject = conv.session.params.ChosenSubjects;
  let badgeTime = 0;
  let unsaved = 0;
  userSubRef.forEach((doc) => {
    const subjects = doc.get("subjects");
    for (let i = 0; i < subjects.length; i++) {
      if (subjects[i]["name"] == subject) { // 勉強中の科目
        badgeTime += subjects[i]["savedTime"];
        unsaved = subjects[i]["time"] - subjects[i]["savedTime"];
        break;
      }
    }
  });
  if (badgeTime < 120 && badgeTime + unsaved >= 120) {
    ssml += subject + "名人バッジをゲットしたよ！おめでとう！";
    const timeStamp = admin.firestore.FieldValue.serverTimestamp();
    const badgeName = "" + subject + "名人";
    const subDoc = postRef.collection("badges").doc(badgeName);
    const badgeData = {
      description: subject + "を2時間以上勉強しました。",
      url: "",
      getTime: timeStamp,
    };
    subDoc.set(badgeData);
  }

  // dbから褒める言葉を取得
  const compliRef = db.collection("complimentary").doc(conv.scene.name);
  const doc = await compliRef.get();
  const compli = doc.data();
  const keyArray = Object.keys(compli);
  // 乱数からランダムな添字を取得
  const objectIndex = Math.floor(Math.random() * keyArray.length);
  ssml += compli[keyArray[objectIndex]] + "<break time=\"1s\" />";

  ssml += "休憩する？勉強を続ける？</speak>";

  conv.add(ssml);
});

app.handle("nowRest", async (conv) => {
  const userID = conv.user.params.tokenPayload.name;

  // 休憩時間を取得
  const hogeRef = db.collection("users").doc(userID);
  const hogeSubRef = await hogeRef.collection("durationTime").get();
  let rest = 0;
  hogeSubRef.forEach((doc) => {
    if (doc.data().isSelected) {
      rest = doc.data().restTime;
    }
  });
  if (rest > 20) {
    rest = 20;
  }

  const ssml = `
    <speak>
      休憩だね
      <break time="${rest * 60}s" />
      休憩時間終了！
    </speak>
  `; // この後一言

  conv.add(ssml);
});

app.handle("Bye", async (conv) => {
  const userID = conv.user.params.tokenPayload.name;

  let ssml = "<speak>";

  // YYYYMMDDを取得
  const userRef = await db.collection("users").doc(userID);
  const userDoc = await userRef.get();
  const timestamp = userDoc.get("startTime");
  let today = "";
  today += timestamp.toDate().getFullYear();
  today += ("0" + (timestamp.toDate().getMonth() + 1)).slice(-2);
  today += ("0" + timestamp.toDate().getDate()).slice(-2);
  today += timestamp.toDate().getDay().toString(); // 曜日(1~6)

  const subRef = userRef.collection("aboutStudy");
  const subDoc = await subRef.doc(today).get();
  const subArray = subDoc.get("subjects");
  let totalTime = 0;
  for (let i = 0; i < subArray.length; i++) {
    totalTime += subArray[i]["time"] - subArray[i]["savedTime"];
    subArray[i]["savedTime"] = subArray[i]["time"]; // 保存した時間
  }
  const nowTotal = userDoc.get("total");
  userRef.update({
    total: nowTotal + totalTime,
  });
  subRef.doc(today).update({
    subjects: subArray,
  }); // savedTime更新

  // dbから褒める言葉を取得
  const compliRef = db.collection("complimentary").doc(conv.handler.name);
  /* Bye */
  const doc = await compliRef.get();
  const compli = doc.data();
  const keyArray = Object.keys(compli);
  // 乱数からランダムな添字を取得
  const objectIndex = Math.floor(Math.random() * keyArray.length);
  ssml += compli[keyArray[objectIndex]];

  ssml += `
      <break time="1s" />
      お疲れ様！
    </speak>
  `;

  conv.add(ssml);
});

exports.fulfillment = functions.https.onRequest(app);
