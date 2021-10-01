const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const app = express();

const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

const corsOptions = {
  origin: "http://localhost:8080",
};

app.use(cors(corsOptions));

// ユーザのidTokenを検証
app.post("/verify", async (req, res) => {
  // idTokenの検証
  const auth = admin.auth();
  const decodedToken = await auth.verifyIdToken(req.body.token);
  if (decodedToken) {
    // dbにuidを名前に持つdocumentが存在しなければ作成する
    const usersRef = db.collection("users").doc(decodedToken.name);
    const doc = await usersRef.get();
    if (!doc.exists) {
      await usersRef.set({ivy: 0});
    }

    res.send(decodedToken);
  } else {
    res.send(null);
  }
});

// ツタの高さを取得
app.get("/ivy_height", async (req, res) => {
  const usersRef = db.collection("users").doc(req.headers.name);
  const doc = await usersRef.get();
  if (doc.exists) {
    const data = doc.data();
    res.send(data);
  } else {
    res.send(null);
  }
});

// 棒グラフのデータを取得
app.get("/graph/bar_chart", async (req, res) => {
  const labels = [];
  const dataList = [];

  const usersRef = db.collection("users").doc(req.headers.name);
  const docs = await usersRef.collection("aboutStudy").get();
  docs.forEach((doc) => {
    const date = doc.id;
    let month = "";
    let day = "";
    [month, day] = [date.substr(4, 2), date.substr(6, 2)];
    labels.push(`${month}/${day}`);

    const subjectTime = doc.data().subjects.map((ele) => ele.time);
    const totalTime = subjectTime.reduce((prev, current) => prev + current);
    dataList.push(totalTime);
  });

  res.json({
    labels: labels,
    data_list: dataList,
  });
});

// 円グラフのデータを取得
app.get("/graph/pie_chart", async (req, res) => {
  let labels = [];
  const dataList = [];

  const usersRef = db.collection("users").doc(req.headers.name);
  const docs = await usersRef.collection("aboutStudy").get();

  let docsData = [];
  docs.forEach((doc) => {
    docsData = docsData.concat(doc.data().subjects);

    const tempLabels = doc.data().subjects.map((ele) => ele.name);
    labels = labels.concat(tempLabels);
    labels = labels.filter((ele, index, self) => self.indexOf(ele) === index);
  });

  labels.forEach((label) => {
    let labelData = docsData.filter((ele) => ele.name === label);
    labelData = labelData.map((ele) => ele.time);
    const subjectTime = labelData.reduce((prev, current) => prev + current);
    dataList.push(subjectTime);
  });

  res.json({
    labels: labels,
    data_list: dataList,
  });
});

// 合計勉強時間の取得
app.get("/graph/totaltime", async (req, res) => {
  let lastWeekData = 0;
  let todayData = 0;
  let thisWeekData = 0;

  const dateObj = new Date();
  const getMonth = dateObj.getMonth() + 1;
  const today = {
    year: dateObj.getFullYear().toString(),
    month: (getMonth < 10 ? `0${getMonth}` : `${getMonth}` ),
    week: dateObj.getDay(),
    date: dateObj.getDate().toString(),
  };

  const thisWeeks = Array(7).fill(undefined).map((_, i) =>
    `${today.year}${today.month}${today.date - today.week + i}${i}`,
  );
  const lastWeeks = Array(7).fill(undefined).map((_, i) =>
    `${today.year}${today.month}${today.date - today.week + i - 7}${i}`,
  );

  const usersRef = db.collection("users").doc(req.headers.name);
  const docs = await usersRef.collection("aboutStudy").get();
  docs.forEach((doc) => {
    // 今日の勉強時間を求める
    if (doc.id === `${today.year}${today.month}${today.date}${today.week}`) {
      const subjectTime = doc.data().subjects.map((ele) => ele.time);
      todayData = subjectTime.reduce((prev, current) => prev + current);
    }

    // 今週の勉強時間を求める
    if (thisWeeks.includes(doc.id)) {
      const subjectTime = doc.data().subjects.map((ele) => ele.time);
      thisWeekData += subjectTime.reduce((prev, current) => prev + current);
    }

    // 先週の勉強時間を求める
    if (lastWeeks.includes(doc.id)) {
      const subjectTime = doc.data().subjects.map((ele) => ele.time);
      lastWeekData += subjectTime.reduce((prev, current) => prev + current);
    }
  });

  res.json({
    today_data: todayData,
    this_week_data: thisWeekData,
    last_week_data: lastWeekData,
  });
});

// 勉強時間データの取得
app.get("/setting/get", async ( req, res ) => {
  const usersRef = db.collection("users").doc(req.headers.name);
  const docs = await usersRef.collection("durationTime").get();
  const datas = [];
  docs.forEach((doc) => {
    const data = doc.data();
    data.name = doc.id;
    datas.push(data);
  });

  res.json(datas);
});

// 勉強時間データの作成
app.post("/setting/create", async (req, res) => {
  const usersRef = db.collection("users").doc(req.headers.name);
  await usersRef.collection("durationTime").doc(req.body.name).set({
    isSelected: req.body.isSelected,
    studyTime: req.body.studyTime,
    restTime: req.body.restTime,
  });
});

// 勉強時間データの更新
app.post("/setting/update", async (req, res) => {
  const usersRef = db.collection("users").doc(req.headers.name);
  const timeRef = usersRef.collection("durationTime").doc(req.body.name);
  const update = await timeRef.update({
    isSelected: req.body.isSelected,
    studyTime: req.body.studyTime,
    restTime: req.body.restTime,
  });
  res.send(update);
});

// 勉強時間データの削除
app.post("/setting/delete", async (req, res) => {
  const usersRef = db.collection("users").doc(req.headers.name);
  await usersRef.collection("durationTime").doc(req.body.name).delete();
});

// バッジの取得
app.get("/badges", async (req, res) => {
  const userRef = db.collection("users").doc(req.headers.name);
  const badgeDocs = await userRef.collection("badges").get();
  const badges = [];
  badgeDocs.forEach((doc) => {
    badges.push({
      name: doc.id,
      describe: doc.data().describe,
      path: doc.data().path,
      timestamp: doc.data().timestamp,
    });
  });
  res.send(badges);
});

const ageApi = functions.https.onRequest(app);
module.exports = {ageApi};
