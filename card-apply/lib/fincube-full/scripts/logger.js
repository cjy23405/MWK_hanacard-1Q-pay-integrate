class LogModel {
  constructor(appName, appVersion, engineType, deviceId, userRegId, idType) {
    this.appName = appName;
    this.appVersion = appVersion;
    this.engineType = engineType;
    this.deviceId = deviceId;
    this.userRegId = userRegId;
    this.idType = idType;
    this.startTime = 0;
    this.endTime = 0;
    this.operationTime = 0;
    this.recogDone = false;
    this.recogTime = 0;
    this.tryCount = 0;
    this.colorScore = 0;
    this.faceScore = 0;
    this.specularRatio = 0;
    this.popupType = "";
  }

  setAppName(appName) {
    this.appName = appName;
  }

  getAppName() {
    return this.appName;
  }

  setAppVersion(appVersion) {
    this.appVersion = appVersion;
  }

  getAppVersion() {
    return this.appVersion;
  }

  setEngineType(engineType) {
    this.engineType = engineType;
  }

  getEngineType() {
    return this.engineType;
  }

  setDeviceId(deviceId) {
    this.deviceId = deviceId;
  }

  getDeviceId() {
    return this.deviceId;
  }

  setUserRegId(userRegId) {
    this.userRegId = userRegId;
  }

  getUserRegId() {
    return this.userRegId;
  }

  setIdType(idType) {
    this.idType = idType;
  }

  getIdType() {
    return this.idType;
  }

  getDateTime() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = month >= 10 ? month : "0" + month;
    let day = date.getDate();
    day = day >= 10 ? day : "0" + day;

    let hour = date.getHours();
    hour = hour < 10 ? "0" + hour.toString() : hour.toString();

    let minites = date.getMinutes();
    minites = minites < 10 ? "0" + minites.toString() : minites.toString();

    let seconds = date.getSeconds();
    seconds = seconds < 10 ? "0" + seconds.toString() : seconds.toString();

    return (
      [year, month, day].join("-") + " " + hour + ":" + minites + ":" + seconds
    );
  }

  setStartTime(startTime) {
    this.startTime = startTime;
  }

  getStartTime() {
    return this.startTime;
  }

  setEndTime(endTime) {
    this.endTime = endTime;
  }

  getEndTime() {
    return this.endTime;
  }

  setRecogTime(recogTime) {
    this.recogTime = recogTime;
  }

  getRecogTime() {
    return this.recogTime;
  }

  getOperationTime() {
    return this.endTime - this.startTime;
  }

  setRecogDone(isDone) {
    if (isDone) {
      this.recogDone = "Done";
    } else {
      this.recogDone = "Fail";
    }
  }

  getRecogDone() {
    return this.recogDone;
  }

  setTryCount(tryCount) {
    this.tryCount = tryCount;
  }

  getTryCount() {
    return this.tryCount;
  }

  setFaceScore(faceScore) {
    this.faceScore = faceScore;
  }
  getFaceScore() {
    return this.faceScore;
  }
  setColorScore(colorScore) {
    this.colorScore = colorScore;
  }
  getColorScore() {
    return this.colorScore;
  }
  setSpecularRatio(specularRatio) {
    this.specularRatio = specularRatio;
  }
  getSpecularRatio() {
    return this.specularRatio;
  }

  setPopupType(popupInfo) {
    if (popupInfo === "timeout") {
      this.popupType = "Timeout";
    } else if (popupInfo === "faceerror") {
      this.popupType = "FaceError";
    } else if (popupInfo === "unknown") {
      this.popupType = "Unknown";
    } else {
      this.popupType = "";
    }
  }

  getPopupType() {
    return this.popupType;
  }
}

class LogManager {
  constructor(appName, appVersion, engineType, deviceId, userRegId, idType) {
    this.logModel = new LogModel(
      appName,
      appVersion,
      engineType,
      deviceId,
      userRegId,
      idType,
    );

    this.logs = [];
  }

  startDetect(startTime) {
    if (!this.logModel) return;

    this.logModel.setStartTime(startTime);
    this.logModel.setEndTime(0);
    this.logModel.setRecogDone(false);
    this.logModel.setTryCount(0);
    this.logModel.setPopupType("");
  }

  againDetect(startTime) {
    if (!this.logModel) return;

    this.logModel.setStartTime(startTime);
    this.logModel.setEndTime(0);
    this.logModel.setRecogDone(false);
    this.logModel.setTryCount(this.logModel.getTryCount() + 1);
    this.logModel.setPopupType("");
  }

  endDetect(endTime, idType, recogTime, faceScore, colorScore, specularRatio) {
    if (!this.logModel) return;

    this.logModel.setEndTime(endTime);
    this.logModel.setRecogDone(true);

    this.logModel.setIdType(idType);
    this.logModel.setRecogTime(recogTime);
    this.logModel.setFaceScore(faceScore);
    this.logModel.setColorScore(colorScore);
    this.logModel.setSpecularRatio(specularRatio);

    const log = this.makeLog();
    this.print(log);
    this.logs.push(log);
  }

  makeLog() {
    if (!this.logModel) return {};

    return {
      appName: this.logModel.getAppName(),
      appVersion: this.logModel.getAppVersion(),
      engineType: this.logModel.getEngineType(),
      deviceId: this.logModel.getDeviceId(),
      userRegId: this.logModel.getUserRegId(),
      idType: this.logModel.getIdType(),
      dateTime: this.logModel.getDateTime(),
      operationTime: this.logModel.getOperationTime(),
      recogTime: this.logModel.getRecogTime(),
      recogDone: this.logModel.getRecogDone(),
      faceScore: this.logModel.getFaceScore(),
      colorScore: this.logModel.getColorScore(),
      specularRatio: this.logModel.getSpecularRatio(),
      tryCount: this.logModel.getTryCount(),
      popupType: this.logModel.getPopupType(),
    };
  }

  print(log) {
    console.log(JSON.stringify(log, null, 2));
  }

  getTotalLogs() {
    return this.logs;
  }
}
