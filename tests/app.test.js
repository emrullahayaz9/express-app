const request = require("supertest");
const app = require("../app");

const { v4: uuidv4 } = require("uuid");
const adminUser = { id: uuidv4(), role: "admin" };
const normalUser = { id: uuidv4(), role: "normal_user" };

const createSessionCookie = (user) => user.role;

describe("Authentication and Authorization Tests", () => {
  test("Giriş yapmamış kullanıcı için ana sayfa", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });

  test("Giriş yapmış admin kullanıcısı için /welcome-admin sayfasına yönlendirme", async () => {
    const response = await request(app)
      .get("/welcome-admin")
      .set("Cookie", [createSessionCookie(adminUser)])
      .expect(302);
  });

  test("Giriş yapmış normal kullanıcı için /welcome-user sayfasına yönlendirme", async () => {
    const response = await request(app)
      .get("/welcome-user")
      .set("Cookie", [createSessionCookie(normalUser)])
      .expect(302);
  });

  test("Giriş yapmamış kullanıcı /ekle sayfasına erişemez", async () => {
    const response = await request(app).get("/ekle");
    expect(response.statusCode).toBe(302);
  });

  test("Sadece admin olan kullanıcı /ekle sayfasına erişebilir", async () => {
    const response = await request(app)
      .get("/ekle")
      .set("Cookie", [createSessionCookie(adminUser)])
      .expect(302);
  });

  test("Giriş yapmış admin kullanıcı çıkış yapabilir", async () => {
    const response = await request(app)
      .get("/logout")
      .set("Cookie", [createSessionCookie(adminUser)])
      .expect(302);
    expect(response.headers.location).toBe("/login");
  });
});
