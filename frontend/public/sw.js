self.addEventListener("push", function (event) {
  console.log("📩 [SW] 푸시 수신됨:", event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error("❌ [SW] 푸시 데이터 파싱 에러", e);
      data = { title: "알림", body: "푸시 알림이 도착했습니다!" };
    }
  } else {
    data = { title: "알림", body: "푸시 알림이 도착했습니다!" };
  }
  console.log("🔔 [SW] 푸시 내용:", data);

  self.registration.showNotification(data.title || "알림", {
    body: data.body || "푸시 알림이 도착했습니다!",
    icon: "/icon.png",
  });
});
