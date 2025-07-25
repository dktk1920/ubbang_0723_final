// 📄 frontend/public/sw.js

self.addEventListener("push", function (event) {
  const data = event.data?.json() || {};

  self.registration.showNotification(data.title || "알림", {
    body: data.body || "푸시 알림이 도착했습니다!",
    icon: "/icon.png", // public/icon.png 있어도 되고 없어도 됨
  });
});
